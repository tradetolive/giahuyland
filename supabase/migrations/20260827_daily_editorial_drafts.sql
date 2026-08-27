-- GiaHuy Land: metadata truy vết nguồn cho bản nháp tạo tự động.
-- Chạy trong Supabase SQL Editor bằng tài khoản project owner sau khi review.
-- Không thay đổi RLS, không mở public write và không thay đổi trạng thái bài hiện có.

alter table public.content_posts
  add column if not exists source_name text check (char_length(source_name) <= 180),
  add column if not exists source_url text check (source_url is null or source_url ~ '^https://'),
  add column if not exists source_published_on date,
  add column if not exists source_fingerprint text,
  add column if not exists origin text not null default 'manual' check (origin in ('manual', 'daily-source')),
  add column if not exists automation_run_id text check (automation_run_id is null or char_length(automation_run_id) <= 160);

create unique index if not exists content_posts_source_fingerprint_unique_idx
  on public.content_posts (source_fingerprint)
  where source_fingerprint is not null;

-- Giữ điều kiện published-only/cột an toàn của view hiện có.
create or replace view public.content_posts_public
with (security_barrier = true, security_invoker = false)
as
select
  id, slug, title, eyebrow, excerpt, body, category, home_slot,
  display_order, cover_image_path, status, published_at, created_at, updated_at,
  source_name, source_url, source_published_on, origin
from public.content_posts
where status = 'published';

revoke all on table public.content_posts_public from public, anon, authenticated;
grant select on table public.content_posts_public to anon, authenticated;
