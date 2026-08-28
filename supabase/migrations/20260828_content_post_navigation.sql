-- GiaHuy Land: map content posts to the public navigation taxonomy.
-- Keeps the legacy home_slot values so existing homepage placements remain compatible.
-- Run once in Supabase SQL Editor as project owner.

alter table public.content_posts
  add column if not exists navigation_section text
  check (navigation_section in ('home', 'listings', 'map', 'ha-an', 'ha-long-xanh', 'insights', 'contact') or navigation_section is null);

comment on column public.content_posts.navigation_section is
  'Điểm đến trong navigation công khai: Trang chủ, BĐS đang bán, Bản đồ, Hà An, Hạ Long Xanh, Phân tích thị trường hoặc Liên hệ.';

create index if not exists content_posts_navigation_section_idx
  on public.content_posts (navigation_section, status, display_order, published_at desc);

create or replace view public.content_posts_public
with (security_barrier = true, security_invoker = false)
as
select
  id, slug, title, eyebrow, excerpt, body, category, home_slot, navigation_section,
  display_order, cover_image_path, status, published_at, created_at, updated_at,
  source_name, source_url, source_published_on, origin
from public.content_posts
where status = 'published';

revoke all on table public.content_posts_public from public, anon, authenticated;
grant select on table public.content_posts_public to anon, authenticated;
