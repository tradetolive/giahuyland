# Trang quản trị GiaHuy Land

Mở `https://tradetolive.github.io/giahuyland/admin/` sau khi migration Supabase được áp dụng. Trang này chỉ là giao diện; quyền thật nằm ở Supabase Auth, `admin_users`, RLS và Storage policies.

## Luồng vận hành

Đăng nhập bằng email đã được thêm vào `admin_users`. Tạo nội dung mới, lưu **Bản nháp** nếu chưa muốn khách thấy, hoặc chọn **Xuất bản** sau khi kiểm tra thông tin. Ảnh cover và gallery là public marketing assets; ảnh sổ đỏ/PDF vào bucket private, chỉ preview bằng URL ký tạm thời trong phiên admin.

Không upload tài liệu chứa thông tin chủ sở hữu, số định danh hoặc dữ liệu không được phép công khai khi chưa có cơ sở pháp lý và đồng ý phù hợp.
