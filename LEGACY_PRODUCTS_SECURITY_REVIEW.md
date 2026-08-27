# Rà soát bảo mật bảng legacy `public.products`

## Kết luận kiểm kê

Tại thời điểm rà soát, RLS vẫn được bật trên `public.products`. Tuy nhiên, ba policy mang tên `Anyone can read`, `Anyone can insert` và `Anyone can delete` đều áp dụng cho role `public`. Vì vậy, bất kỳ client không đăng nhập nào có publishable key đều có thể đọc, chèn hoặc xóa dữ liệu trong bảng này. Không có policy `UPDATE` được hiển thị.

| Hạng mục | Kết quả |
|---|---|
| Dữ liệu trong `public.products` qua Data API anonymous | Không có bản ghi |
| Website public | Chỉ truy vấn `public.listings` với `status = 'published'`; có dữ liệu fallback tĩnh |
| Dashboard `/admin/` | Chỉ CRUD `public.listings` và hai bucket Storage theo RLS |
| `admin/config.yml` | Cấu hình CMS Git-based cũ; không gọi Supabase table `products` |

## Thay đổi được chuẩn bị

File `supabase/migrations/20260827_harden_legacy_products.sql` sẽ giữ nguyên table/data nhưng xóa ba policy mở và thu hồi table privilege của `anon`/`authenticated`. Sau thay đổi, truy vấn Data API client-side vào `products` sẽ bị chặn; luồng website hiện tại không bị ảnh hưởng vì sử dụng `listings`.

> Chỉ chạy migration sau xác nhận riêng của chủ website. Không sử dụng `service_role` key ở frontend để thay thế policy cũ.

## Trạng thái áp dụng

Chủ website đã xác nhận chạy migration trong Supabase SQL Editor. Kiểm tra ngay sau đó bằng publishable key không có session nhận HTTP `401` cùng PostgREST error `42501` khi đọc `public.products`. Điều này xác nhận anonymous không còn quyền Data API đối với bảng legacy.
