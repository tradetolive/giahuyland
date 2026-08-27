# Thiết lập Supabase cho trang quản trị

## 1. Chạy migration

Mở Supabase Dashboard của project đang dùng cho website. Chọn **SQL Editor**, tạo một query mới, copy toàn bộ file `supabase/migrations/20260827_admin_dashboard.sql` rồi chọn **Run**. Migration này tạo bảng `listings`, bảng phân quyền `admin_users`, hai bucket tách biệt và chính sách RLS. Nó không xóa bảng `products` cũ.

## 2. Tạo tài khoản quản trị đầu tiên

Vào **Authentication → Users → Add user**. Tạo tài khoản bằng email quản trị do bạn kiểm soát, ví dụ `tatylic@gmail.com`. Tự đặt mật khẩu mạnh trong dashboard; không gửi mật khẩu qua chat hoặc lưu nó trong GitHub.

Sau khi user xuất hiện, mở lại SQL Editor và chạy:

```sql
insert into public.admin_users (user_id)
select id from auth.users where email = 'tatylic@gmail.com'
on conflict (user_id) do nothing;
```

Migration đã cấp quyền `SELECT` tối thiểu cho nhóm `authenticated` trên bảng vai trò, nhưng policy RLS chỉ cho phép mỗi user đọc dòng có `user_id` của chính họ. Dashboard cần quyền đọc giới hạn này để xác minh phiên đăng nhập là quản trị; không user nào có thể đọc vai trò của người khác.

Chỉ các user có mặt trong `public.admin_users` mới có quyền đăng, sửa, xóa listing hoặc upload/xóa ảnh.

## 3. Cấu hình URL cho Auth

Vào **Authentication → URL Configuration**. Đặt Site URL là `https://tradetolive.github.io/giahuyland/`. Trong Additional Redirect URLs, thêm `https://tradetolive.github.io/giahuyland/admin/`. Cấu hình này giúp Supabase xử lý session trên đúng domain GitHub Pages.

## 4. Kiểm tra trước khi vận hành

File `supabase/tests/listings_rls.test.sql` mô tả các kiểm tra quyền read/write. Nếu bạn đã cài Supabase CLI ở máy local, chạy test database theo tài liệu Supabase. Nếu chưa có CLI, tối thiểu hãy xác minh admin tạo được **Bản nháp**, request anonymous không đọc được bản nháp, upload được một ảnh public/tài liệu private thử và xóa sạch dữ liệu thử sau đó.

Đợt kiểm thử đầu tiên đã xác nhận các luồng login, insert draft, RLS anonymous, upload cover public, upload tài liệu private qua signed URL và cleanup. Khi thay đổi migration/policy hoặc nâng cấp dashboard, hãy lặp lại các kiểm tra này bằng dữ liệu không nhạy cảm trước khi dùng tài liệu thực.

## 5. Dữ liệu và tài liệu pháp lý

Ảnh cover/gallery vào bucket `property-media` nên có thể hiển thị công khai khi listing xuất bản. Ảnh sổ đỏ hoặc PDF vào bucket `property-documents`; bucket này là private. Không nhập số CCCD, thông tin chủ sở hữu hoặc phần tài liệu không được phép công khai vào trường hiển thị public.

## References

[1]: https://supabase.com/docs/guides/database/postgres/row-level-security "Row Level Security — Supabase Docs"

[2]: https://supabase.com/docs/guides/storage/security/access-control "Storage Access Control — Supabase Docs"

[3]: https://supabase.com/docs/guides/auth "Auth — Supabase Docs"
