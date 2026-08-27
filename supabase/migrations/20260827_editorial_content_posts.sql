-- GiaHuy Land: quản trị bài viết biên tập trên trang chủ.
-- Chạy file này trong Supabase SQL Editor bằng tài khoản project owner sau khi review.
-- Migration chỉ tạo bảng/policy mới và sao chép ba nội dung công khai hiện có; không đụng đến listings, products, tài liệu private hoặc service_role.

create table if not exists public.content_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 3 and 160),
  eyebrow text not null default '' check (char_length(eyebrow) <= 100),
  excerpt text not null default '' check (char_length(excerpt) <= 600),
  body text not null default '' check (char_length(body) <= 12000),
  category text not null default 'insight' check (category in ('brand', 'insight', 'advantage', 'guide', 'market-update')),
  home_slot text check (home_slot in ('hero', 'pain-points', 'advantages') or home_slot is null),
  display_order integer not null default 0 check (display_order between 0 and 9999),
  status text not null default 'draft' check (status in ('draft', 'published')),
  cover_image_path text,
  author_id uuid not null references auth.users(id) on delete restrict,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists content_posts_public_feed_idx
  on public.content_posts (status, display_order, published_at desc, created_at desc);

-- Mỗi vị trí đặc biệt trên trang chủ chỉ dùng một bài đã xuất bản tại một thời điểm.
create unique index if not exists content_posts_one_published_home_slot_idx
  on public.content_posts (home_slot)
  where status = 'published' and home_slot is not null;

create or replace function public.set_content_post_timestamps()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  if new.status = 'published' and (tg_op = 'INSERT' or old.status is distinct from 'published' or new.published_at is null) then
    new.published_at = coalesce(new.published_at, now());
  end if;
  if new.status = 'draft' then
    new.published_at = null;
  end if;
  return new;
end;
$$;

drop trigger if exists content_posts_set_timestamps on public.content_posts;
create trigger content_posts_set_timestamps
before insert or update on public.content_posts
for each row execute function public.set_content_post_timestamps();

alter table public.content_posts enable row level security;

revoke all on table public.content_posts from anon, authenticated;
grant select on table public.content_posts to authenticated;
grant insert, update, delete on table public.content_posts to authenticated;

drop policy if exists "Admins can read content posts" on public.content_posts;
create policy "Admins can read content posts"
on public.content_posts for select to authenticated
using ((select public.is_admin()));

drop policy if exists "Admins can create content posts" on public.content_posts;
create policy "Admins can create content posts"
on public.content_posts for insert to authenticated
with check ((select public.is_admin()) and author_id = (select auth.uid()));

drop policy if exists "Admins can update content posts" on public.content_posts;
create policy "Admins can update content posts"
on public.content_posts for update to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists "Admins can delete content posts" on public.content_posts;
create policy "Admins can delete content posts"
on public.content_posts for delete to authenticated
using ((select public.is_admin()));

-- View công khai cố định cột an toàn và chỉ chứa bài đã xuất bản.
-- View tạo bởi project owner dùng quyền definer; tuyệt đối giữ điều kiện status = 'published'.
create or replace view public.content_posts_public
with (security_barrier = true, security_invoker = false)
as
select
  id, slug, title, eyebrow, excerpt, body, category, home_slot,
  display_order, cover_image_path, status, published_at, created_at, updated_at
from public.content_posts
where status = 'published';

revoke all on table public.content_posts_public from public, anon, authenticated;
grant select on table public.content_posts_public to anon, authenticated;

-- property-media đã là bucket public có policy upload/xóa chỉ dành cho admin.
-- Không tạo bucket mới và không mở quyền upload cho khách truy cập.

-- Chuyển nguyên ý ba nội dung công khai hiện có sang dữ liệu có thể chỉnh sửa.
-- Nếu không tìm thấy admin_users, không chèn dữ liệu: hãy tạo admin trước rồi chạy lại đúng file này.
with first_admin as (
  select user_id from public.admin_users order by created_at asc limit 1
)
insert into public.content_posts (
  slug, title, eyebrow, excerpt, body, category, home_slot, display_order, status, author_id
)
select * from (
  values
    (
      'nha-dat-ha-an-so-do-trao-tay',
      'Nhà đất Hà An — sổ đỏ trao tay, không qua trung gian mập mờ',
      'Phường Hà An · Quảng Ninh',
      'GiaHuy Land trực tiếp phân phối các lô đất thổ cư tại Hà An — cửa ngõ nối Quảng Ninh với Hải Phòng qua cầu Bạch Đằng, sát vùng công nghiệp Sông Khoai.',
      'Thông tin về vị trí, sản phẩm và pháp lý hiển thị công khai cần được khách hàng đối chiếu trực tiếp trước khi giao dịch. Liên hệ GiaHuy Land để nhận thông tin từng lô đang mở bán.',
      'brand', 'hero', 10, 'published'
    ),
    (
      'vi-sao-nhieu-nguoi-ngan-ngai-xuong-tien',
      'Vì sao nhiều người ngần ngại xuống tiền',
      'Điểm nghẽn quy hoạch',
      'Nỗi sợ lớn nhất khi mua đất không phải là giá — mà là không biết mình đang mua gì.',
      'Các mối bận tâm thường gặp gồm: quy hoạch treo hoặc mục đích sử dụng đất chưa rõ; giá chênh qua nhiều lớp môi giới; sổ chung, chưa tách thửa hoặc tranh chấp ranh giới; và hiện trạng khó kiểm chứng khi đầu tư xa. Trước khi đặt cọc, khách hàng nên yêu cầu kiểm tra quy hoạch, hiện trạng, ranh giới và giấy tờ gốc từ nguồn có thẩm quyền. GiaHuy Land hỗ trợ cung cấp thông tin công khai và sắp xếp khảo sát thực địa theo nhu cầu.',
      'insight', 'pain-points', 20, 'published'
    ),
    (
      'loi-the-dat-nen-ha-an',
      'Lợi thế đất nền Hà An',
      'Khu vực Hà An · Quảng Ninh',
      'Hà An nằm trong hành lang kết nối Hạ Long – Hải Phòng – Hà Nội; nhà đầu tư nên đối chiếu thông tin hạ tầng và quy hoạch trước từng quyết định.',
      'Việc đánh giá bất động sản Hà An cần dựa trên hồ sơ của từng lô, khả năng tiếp cận hạ tầng, quy hoạch đã được công bố và nhu cầu sử dụng thực tế. Các thông tin như thời gian di chuyển, quy hoạch đô thị, nhu cầu chuyên gia hoặc kỳ vọng giá chỉ mang tính tham khảo; không phải cam kết đầu tư. GiaHuy Land cung cấp thông tin lô đất và hỗ trợ khách kiểm tra thực địa trước khi giao dịch.',
      'advantage', 'advantages', 30, 'published'
    )
) as seed(slug, title, eyebrow, excerpt, body, category, home_slot, display_order, status)
cross join first_admin
on conflict (slug) do nothing;
