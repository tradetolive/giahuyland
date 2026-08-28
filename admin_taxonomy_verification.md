# Dashboard taxonomy checkpoint

Dashboard local hiển thị thanh liên hệ đầu trang với hai liên kết chính xác: `https://zalo.me/0854141414` và `https://www.facebook.com/anhladenhoi`.

Form content post đã có trường `Điểm đến trong navigation` với các lựa chọn: Trang chủ, BĐS đang bán, Bản đồ, Hà An, Hạ Long Xanh, Phân tích thị trường và Liên hệ. Trường cũ đã đổi tên thành `Vị trí nổi bật trên trang chủ`, với nhãn mới cho các mã legacy: Trang chủ · Giới thiệu tổng quan; Phân tích thị trường · Bài nổi bật; Hà An · Góc nhìn khu vực.

Các giá trị legacy `hero`, `pain-points`, `advantages` vẫn giữ nguyên trong HTML và payload `home_slot`, nên các bài viết homepage cũ không bị mất liên kết. Trường mới `navigation_section` được nối vào payload lưu/edit và migration `20260828_content_post_navigation.sql` đã được tạo để cập nhật schema/view public.

JavaScript cần kiểm tra tiếp: `admin/js/admin.js`, `js/supabase.js`; sau đó chạy migration Supabase và kiểm thử dashboard sau đăng nhập.
