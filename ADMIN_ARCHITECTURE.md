# Kiến trúc trang quản trị GiaHuy Land

Website public tiếp tục chạy trên GitHub Pages. Dữ liệu danh sách bất động sản và ảnh được lưu tại Supabase; website chỉ có quyền đọc các dòng đã xuất bản. Khu vực `/admin/` được xuất bản cùng website nhưng không chứa quyền đặc biệt: mọi quyền quản trị được kiểm tra bởi Supabase Auth và Row Level Security (RLS), không dựa vào việc “ẩn đường dẫn”.

| Thành phần | Mục đích | Quyền truy cập |
|---|---|---|
| `public.listings` | Nội dung dự án/bài đăng hiển thị ngoài website và tại `chi-tiet.html?slug=…` | Khách chỉ đọc dòng `published`; admin tạo/sửa/xóa |
| `public.content_posts` | Bài viết giới thiệu, góc nhìn đầu tư, lợi thế khu vực và nội dung chuyên đề | Chỉ admin đọc/tạo/sửa/xóa từ khu vực Nội dung biên tập; có cả `author_id` nội bộ |
| `public.content_posts_public` | View công khai cố định các cột an toàn của bài viết | Khách chỉ đọc bài `published`; không có `author_id` hay cột nội bộ |
| `public.products` | Bảng legacy không còn được website/dashboard truy vấn | Data API của `anon`/`authenticated` đã bị khóa; không thay thế bằng `service_role` ở frontend |
| `public.admin_users` | Danh sách tài khoản có quyền quản trị | Người dùng thường không đọc được; hàm kiểm tra quyền dùng nội bộ |
| Bucket `property-media` | Ảnh minh họa dự án để hiển thị công khai | Khách xem ảnh; admin tải lên, thay hoặc xóa |
| Bucket `property-documents` | Ảnh sổ đỏ/tài liệu pháp lý | Chỉ admin tải lên, xem qua URL ký tạm thời hoặc xóa |
| `/admin/` | Đăng nhập, yêu cầu khôi phục mật khẩu, tạo/sửa/xóa bài, upload ảnh và xem danh sách | Chỉ tài khoản trong `admin_users` sau khi Supabase Auth xác nhận |
| `/admin/reset-password.html` | Đặt mật khẩu mới sau khi mở liên kết recovery | Chỉ session recovery hợp lệ của Supabase Auth mới thấy biểu mẫu đặt mật khẩu |

## Nguyên tắc an toàn

Website không dùng `service_role` key ở frontend. Chỉ Supabase publishable key xuất hiện trong browser; RLS quyết định mọi quyền đọc/ghi theo session đăng nhập. Ảnh sổ đỏ không dùng bucket public và không được render ở trang danh sách công khai, nhằm tránh lộ thông tin cá nhân/tài liệu pháp lý. Khách truy cập có thể biết URL `/admin/`, nhưng không thể đọc hoặc thay đổi dữ liệu nếu không đăng nhập bằng tài khoản đã được cấp quyền.

Luồng **Quên mật khẩu?** cũng chỉ dùng Supabase Auth trên HTTPS. Trang `/admin/` gửi yêu cầu recovery đến email người dùng nhập và dùng thông báo trung tính, không tiết lộ email nào tồn tại hoặc được cấp quyền. Email recovery dẫn đến `/admin/reset-password.html`; trang này chỉ hiển thị biểu mẫu khi Supabase xác thực một session recovery hợp lệ và sau đó gọi `auth.updateUser({ password })`. Thành công không tự cấp quyền quản trị: sau khi đăng nhập lại, dashboard vẫn kiểm tra `admin_users` qua RLS như bình thường. Mật khẩu không được đưa vào URL, source code, GitHub hay thông báo giao diện.

## URL chi tiết và liên hệ theo bài đăng

Mỗi listing đã xuất bản có URL cố định dạng `chi-tiet.html?slug=<slug>`. Trang chi tiết luôn truy vấn thêm điều kiện `status = 'published'`; slug không tồn tại hoặc bản nháp chỉ nhận trang thông báo chung, không rò rỉ nội dung. URL này là link được dùng trên card, trong nút sao chép và khi khách liên hệ.

Các nút Zalo/Messenger sao chép trước tên listing và URL chi tiết, rồi mở điểm liên hệ tương ứng. Website không tự gửi tin nhắn thay khách. Trước khi xuất bản, chỉ đặt ảnh marketing không có dữ liệu định danh trong cover/thư viện public; ảnh sổ đỏ, giấy tờ hoặc tệp có thông tin cá nhân phải nằm trong bucket `property-documents` private.

## Bài viết biên tập

`content_posts` là mô hình độc lập với `listings`, dùng cho những nội dung trước đây viết cố định trên trang chủ. Mỗi bài gồm tiêu đề, slug, nhãn phụ, tóm tắt, nội dung chi tiết, chuyên mục, thứ tự, ảnh cover public tùy chọn, trạng thái và tác giả. Bài đã xuất bản có thể được gán một trong ba vị trí: `hero`, `pain-points`, hoặc `advantages`; chỉ một bài published được dùng ở mỗi vị trí để tránh hiển thị mâu thuẫn. Các bài không có vị trí vẫn có trang riêng dạng `bai-viet.html?slug=<slug>`.

Website public chỉ gọi view `content_posts_public`, vốn đã cố định điều kiện `status = 'published'` và không chọn `author_id`. Truy cập anonymous vào bảng gốc `content_posts` bị từ chối. Bản nháp và slug sai không trả về nội dung. Ảnh cover tái sử dụng bucket `property-media` có policy quản trị đã có; không sử dụng `property-documents` để chứa ảnh bài viết.

Tài khoản quản trị đầu tiên sẽ được tạo trong Supabase Auth bằng email do chủ website kiểm soát, rồi được thêm một lần vào `admin_users` qua SQL hướng dẫn. Email được dùng hiện tại là `tatylic@gmail.com`; bạn có thể thay bằng email quản trị khác khi cấu hình.
