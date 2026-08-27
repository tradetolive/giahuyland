-- Kiểm tra RLS cho bảng listings. Chạy với Supabase CLI trước khi áp dụng production.
begin;
select plan(6);

select ok(
  not has_table_privilege('anon', 'public.listings', 'insert,update,delete'),
  'Khách ẩn danh không có quyền ghi listings'
);

select ok(
  has_table_privilege('anon', 'public.listings', 'select'),
  'Khách ẩn danh chỉ có quyền select'
);

set local role anon;
select throws_ok(
  $$insert into public.listings (slug, title, price_billion, area_sqm, author_id)
    values ('test-anon', 'Khong duoc phep', 1, 1, gen_random_uuid())$$,
  '42501',
  null,
  'Khách ẩn danh không thể tạo bài đăng'
);

select lives_ok(
  $$select * from public.listings where status = 'published'$$,
  'Khách ẩn danh có thể đọc bài đã xuất bản'
);

set local role authenticated;
set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
select is(
  public.is_admin(),
  false,
  'Tài khoản thường không phải admin'
);

select throws_ok(
  $$insert into public.listings (slug, title, price_billion, area_sqm, author_id)
    values ('test-user', 'Nguoi dung thuong', 1, 1, '11111111-1111-1111-1111-111111111111')$$,
  '42501',
  null,
  'Tài khoản thường không thể tạo bài đăng'
);

select * from finish();
rollback;
