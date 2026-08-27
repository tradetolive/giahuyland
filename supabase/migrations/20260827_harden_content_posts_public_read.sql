-- GiaHuy Land: hardening sau migration content_posts đã chạy.
-- Mục tiêu: anonymous/authenticated non-admin chỉ đọc view published-only, không đọc trực tiếp bảng có author_id.
-- Không xóa bài viết, không thay đổi listings/products và không thay đổi membership admin_users.

begin;

alter table public.content_posts enable row level security;

revoke select on table public.content_posts from anon;
grant select on table public.content_posts to authenticated;

drop policy if exists "Public can read published content posts" on public.content_posts;
drop policy if exists "Admins can read content posts" on public.content_posts;
create policy "Admins can read content posts"
on public.content_posts for select to authenticated
using ((select public.is_admin()));

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

commit;
