# Kiến trúc trang quản trị GiaHuy Land

Website public tiếp tục chạy trên GitHub Pages. Dữ liệu danh sách bất động sản và ảnh được lưu tại Supabase; website chỉ có quyền đọc các dòng đã xuất bản. Khu vực `/admin/` được xuất bản cùng website nhưng không chứa quyền đặc biệt: mọi quyền quản trị được kiểm tra bởi Supabase Auth và Row Level Security (RLS), không dựa vào việc “ẩn đường dẫn”.

| Thành phần | Mục đích | Quyền truy cập |
|---|---|---|
| `public.products` | Nội dung dự án/bài đăng hiển thị ngoài website | Khách chỉ đọc dòng `published`; admin tạo/sửa/xóa |
| `public.admin_users` | Danh sách tài khoản có quyền quản trị | Người dùng thường không đọc được; hàm kiểm tra quyền dùng nội bộ |
| Bucket `property-media` | Ảnh minh họa dự án để hiển thị công khai | Khách xem ảnh; admin tải lên, thay hoặc xóa |
| Bucket `property-documents` | Ảnh sổ đỏ/tài liệu pháp lý | Chỉ admin tải lên, xem qua URL ký tạm thời hoặc xóa |
| `/admin/` | Đăng nhập, tạo/sửa/xóa bài, upload ảnh và xem danh sách | Chỉ tài khoản trong `admin_users` sau khi Supabase Auth xác nhận |

## Nguyên tắc an toàn

Website không dùng `service_role` key ở frontend. Chỉ Supabase publishable key xuất hiện trong browser; RLS quyết định mọi quyền đọc/ghi theo session đăng nhập. Ảnh sổ đỏ không dùng bucket public và không được render ở trang danh sách công khai, nhằm tránh lộ thông tin cá nhân/tài liệu pháp lý. Khách truy cập có thể biết URL `/admin/`, nhưng không thể đọc hoặc thay đổi dữ liệu nếu không đăng nhập bằng tài khoản đã được cấp quyền.

Tài khoản quản trị đầu tiên sẽ được tạo trong Supabase Auth bằng email do chủ website kiểm soát, rồi được thêm một lần vào `admin_users` qua SQL hướng dẫn. Email được dùng hiện tại là `tatylic@gmail.com`; bạn có thể thay bằng email quản trị khác khi cấu hình.
