# Checklist đợt hardening và ưu tiên bài đăng bán

- [x] Kiểm kê policy: RLS đang bật ở `products`, nhưng `Anyone can read`, `Anyone can insert` và `Anyone can delete` áp dụng cho role `public`.
- [x] Xác nhận website/dashboard không còn truy vấn `products`; `admin/config.yml` cũ chỉ mô tả luồng Git-based, không truy cập bảng Supabase này.
- [x] Đưa phần danh sách bài đăng bán lên ngay sau khu vực hero, vẫn giữ liên kết điều hướng và trải nghiệm responsive.
- [x] Kiểm tra preview: hero hiển thị đầy đủ sau animation; section bài đăng bán, bộ lọc và listing xuất hiện trước nội dung vấn đề/lợi thế.
- [x] Kiểm tra bộ lọc: lựa chọn “Dưới 2 tỷ” chỉ giữ lại listing phù hợp trong section mới.
- [x] Đề xuất thay đổi policy tối thiểu cho `products`, nhận xác nhận riêng và áp dụng trên Supabase.
- [x] Xác minh Data API anonymous bị từ chối đọc `products` với HTTP 401 / PostgREST error 42501.
- [x] Xác minh sau hardening: Data API public của `listings` vẫn trả HTTP 200 và preview hiển thị listing published ở section mới.
- [ ] Kiểm thử truy cập anonymous/admin, trang công khai và workflow GitHub Pages sau khi hợp nhất.
