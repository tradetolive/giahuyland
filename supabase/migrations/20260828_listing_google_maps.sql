-- GiaHuy Land — vị trí Google Maps cho từng tin bất động sản.
-- Chạy file này một lần trong Supabase SQL Editor bằng tài khoản project owner.
-- map_query chỉ là địa chỉ/tọa độ dùng để tạo Google Maps search embed; không lưu API key.

alter table public.listings
  add column if not exists map_query text not null default ''
  check (char_length(map_query) <= 300);

comment on column public.listings.map_query is
  'Địa chỉ đầy đủ, tọa độ hoặc Plus Code dùng để hiển thị Google Maps cho listing.';

-- Giữ nguyên RLS hiện có: khách chỉ đọc được listing published; admin mới được ghi dữ liệu.
