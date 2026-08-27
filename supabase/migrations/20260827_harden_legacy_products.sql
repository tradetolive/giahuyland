-- Hardening bảng legacy public.products.
-- CHƯA chạy file này trên production nếu chưa có xác nhận của chủ website.
-- Mục tiêu: chặn toàn bộ thao tác Data API client-side vào bảng không còn được website sử dụng.
-- Không xóa bảng, dữ liệu hoặc cấu trúc schema.

begin;

alter table public.products enable row level security;

drop policy if exists "Anyone can read" on public.products;
drop policy if exists "Anyone can insert" on public.products;
drop policy if exists "Anyone can delete" on public.products;

revoke all on table public.products from anon, authenticated;

commit;

-- Xác minh sau khi chạy bằng project owner:
-- select policyname, cmd, roles from pg_policies where schemaname = 'public' and tablename = 'products';
-- select grantee, privilege_type from information_schema.role_table_grants
--   where table_schema = 'public' and table_name = 'products' and grantee in ('anon', 'authenticated');
