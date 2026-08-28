# Dashboard taxonomy checkpoint

Dashboard local hiển thị thanh liên hệ đầu trang với hai liên kết chính xác: `https://zalo.me/0854141414` và `https://www.facebook.com/anhladenhoi`.

Form content post đã có trường `Điểm đến trong navigation` với các lựa chọn: Trang chủ, BĐS đang bán, Bản đồ, Hà An, Hạ Long Xanh, Phân tích thị trường và Liên hệ. Trường cũ đã đổi tên thành `Vị trí nổi bật trên trang chủ`, với nhãn mới cho các mã legacy: Trang chủ · Giới thiệu tổng quan; Phân tích thị trường · Bài nổi bật; Hà An · Góc nhìn khu vực.

Các giá trị legacy `hero`, `pain-points`, `advantages` vẫn giữ nguyên trong HTML và payload `home_slot`, nên các bài viết homepage cũ không bị mất liên kết. Trường mới `navigation_section` được nối vào payload lưu/edit và migration `20260828_content_post_navigation.sql` đã được tạo để cập nhật schema/view public.

JavaScript cần kiểm tra tiếp: `admin/js/admin.js`, `js/supabase.js`; sau đó chạy migration Supabase và kiểm thử dashboard sau đăng nhập.

Bản cập nhật đã được commit/push với commit `1383ab8`; workflow GitHub Pages run `33158799922` hoàn tất thành công. Dashboard production tại `/admin/` đã xác nhận hai nút liên hệ và các lựa chọn taxonomy mới trong DOM: Trang chủ, BĐS đang bán, Bản đồ, Hà An, Hạ Long Xanh, Phân tích thị trường và Liên hệ. Trường legacy được hiển thị lại bằng nhãn mới.

Còn một bước triển khai dữ liệu: chạy migration `20260828_content_post_navigation.sql` trong Supabase SQL Editor để tạo cột `navigation_section` và cập nhật view `content_posts_public`. Code có fallback tạm thời nếu migration chưa chạy.

Sau khi chạy ánh xạ dữ liệu, Supabase public view trả về:
- `nha-dat-ha-an-so-do-trao-tay` → `home` / Trang chủ; legacy `home_slot=hero`.
- `vi-sao-nhieu-nguoi-ngan-ngai-xuong-tien` → `insights` / Phân tích thị trường; legacy `home_slot=pain-points`.
- `loi-the-dat-nen-ha-an` → `ha-an` / Hà An; legacy `home_slot=advantages`.
- `khu-pho-1-phuong-ha-an-tp-quang-ninh-73374148da` → `insights` / Phân tích thị trường; không có legacy homepage slot.

Kết luận: migration và ánh xạ dữ liệu đã hoạt động đúng trên production.

Bản sửa rút gọn form local đã được kiểm tra: `content-post-category`, `content-post-slot` và `content-post-order` không còn trong DOM; `content-post-navigation` là trường bắt buộc với đúng 7 mục mới. Hai liên kết đầu trang vẫn đúng là Zalo `https://zalo.me/0854141414` và Messenger `https://www.facebook.com/anhladenhoi`.

`admin/js/admin.js` hiện tự ánh xạ category theo navigation, giữ legacy home_slot/display_order trong payload khi chỉnh sửa và bắt buộc người dùng chọn một mục navigation khi lưu bài mới.

Bản sửa routing đã được mô phỏng trên local: với một bài `navigationSection='ha-long-xanh'` và một bài `navigationSection='insights'`, trang Phân tích thị trường chỉ render bài insights; bài Hạ Long Xanh không còn bị hiển thị ở mục mặc định.

Form quản trị đã rút gọn còn một trường bắt buộc `Bài viết thuộc mục`; khi lưu, code tự ánh xạ category kỹ thuật theo navigation và giữ home_slot/display_order cũ cho bài đã tồn tại.

Kiểm thử local sau bản sửa xác nhận vùng `#ha-long-xanh-posts` tồn tại và render các bài có `navigationSection='ha-long-xanh'`. Bài Hạ Long Xanh không còn xuất hiện trong danh sách của trang Phân tích thị trường.
