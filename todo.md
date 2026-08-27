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

## Trang chi tiết và liên hệ theo bất động sản

- [ ] Thiết kế URL chi tiết theo slug, đảm bảo chỉ hiển thị listing đã xuất bản.
- [ ] Thêm trang chi tiết với thông số, ảnh public, liên kết quay lại danh sách và metadata phù hợp.
- [ ] Chuyển nút card sang trang chi tiết; tạo liên kết Zalo/Messenger gồm URL bài đăng.
- [x] Kiểm thử URL hợp lệ: dữ liệu published, ảnh public, thông số và nút liên hệ tải đúng theo slug.
- [x] Kiểm thử sao chép: nút sao chép tạo thông điệp gồm tên + URL bài đăng và hiển thị xác nhận.
- [x] Kiểm thử slug không tồn tại: hiển thị trang thông báo an toàn, không render dữ liệu listing.
- [ ] Kiểm thử slug không tồn tại/draft và xác nhận liên kết mở Zalo/Messenger theo ngữ cảnh listing.
- [x] Kiểm tra giao diện card: các listing published đều hiển thị CTA “Xem chi tiết & liên hệ”, Zalo và Messenger.
- [ ] Kiểm tra thao tác điều hướng trực tiếp từ CTA card sang URL chi tiết theo slug.
- [x] Kiểm tra Zalo: mở đúng tài khoản liên hệ và sao chép tên + URL bài đăng, không tự gửi tin nhắn.
- [x] Kiểm tra Messenger: mở đúng cuộc trò chuyện đích và sao chép tên + URL bài đăng, không tự gửi tin nhắn.
- [x] Kiểm tra card: ảnh/sơ đồ và tiêu đề đều render thành link nội bộ theo slug của listing.
- [ ] Hợp nhất, deploy GitHub Pages và xác minh các URL production.

## Khôi phục mật khẩu quản trị

- [x] Rà soát luồng Supabase Auth, redirect URL và trạng thái session phục hồi.
- [x] Bổ sung màn hình yêu cầu email khôi phục tại `/admin/`.
- [x] Bổ sung trang đặt mật khẩu mới, chỉ cho phép session `recovery` hợp lệ cập nhật mật khẩu.
- [x] Cấu hình Redirect URL production và kiểm thử Supabase chấp nhận yêu cầu recovery với HTTP 200. URL production: `https://tradetolive.github.io/giahuyland/admin/reset-password.html`.
- [x] Chủ dự án đã xác nhận lưu Redirect URL; một email khôi phục thử được gửi đến email admin mà không thay đổi mật khẩu.
- [x] Kết nối điều khiển My Browser từng hết thời gian phản hồi; chủ dự án đã tự lưu Redirect URL và xác nhận lại bằng chat.
- [x] Hợp nhất và deploy GitHub Pages: workflow `33060212735` thành công; `/admin/`, trang recovery và hai file JavaScript đều phản hồi HTTP 200 trên production.
- [ ] Kiểm thử thủ công trang recovery production bằng chính email thử sau khi deploy; không tạo user thử hoặc đổi mật khẩu hiện tại trước khi người dùng chủ động xác nhận. Kiểm tra trình duyệt tự động bị timeout nên chưa dùng để đánh giá UI sau tải JavaScript.
- [x] Cập nhật hướng dẫn vận hành và kiểm tra bảo mật; chờ xác nhận trước khi hợp nhất production.

## Bài viết biên tập và liên hệ theo listing

- [ ] Kiểm kê ba khối nội dung tĩnh trên trang chủ, xác định dữ liệu/ảnh/link cần chuyển về mô hình bài viết quản trị.
- [ ] Thiết kế bảng `content_posts`, RLS và Storage theo nguyên tắc public chỉ đọc bài `published`, admin mới tạo/sửa/xóa.
- [ ] Bổ sung biểu mẫu CRUD cho bài viết biên tập trong dashboard mà không làm thay đổi luồng listing hiện có.
- [ ] Bổ sung danh sách và trang chi tiết bài viết công khai theo slug, chỉ tải bài `published`.
- [ ] Nghiên cứu đường dẫn chính thức Zalo/Messenger cho nội dung soạn sẵn; không hứa hẹn tự điền nếu nền tảng không hỗ trợ chat cá nhân.
- [ ] Kiểm thử quyền public/admin, responsive, URL chi tiết, liên hệ, SEO và cập nhật hướng dẫn trước khi xin xác nhận deploy.

> Phạm vi đã chốt: chỉ triển khai quản trị nội dung tĩnh. GiaHuy Land đang sử dụng Facebook/Messenger cá nhân nên không triển khai tự điền hoặc tự gửi tin nhắn; giữ cơ chế sao chép link + mở chat hiện có.

> Trạng thái migration: file `supabase/migrations/20260827_editorial_content_posts.sql` đã sẵn sàng để review/chạy. Thử mở SQL Editor qua My Browser bị timeout, nên chưa áp dụng bất kỳ DDL/RLS nào lên Supabase.

> Kiểm thử sau migration: Data API anonymous trả HTTP 200 cho đúng 3 bài `published`, trả mảng rỗng khi lọc `draft`, bài theo slug hợp lệ trả 1 dòng và slug không tồn tại trả mảng rỗng. Preview trang chủ tải được; kiểm tra sau tải JavaScript bị timeout từ My Browser nên không dùng để đánh giá trực quan phần render động.

> Hardening phát hiện sau migration: query anonymous ban đầu có thể yêu cầu cột `author_id` dù không hiển thị trên UI. Đã chuẩn bị migration `20260827_harden_content_posts_public_read.sql` để chuyển public read sang view `content_posts_public` chỉ chọn cột an toàn và chỉ bài published; chờ xác nhận trước khi chạy vì có thay đổi policy/grant.
