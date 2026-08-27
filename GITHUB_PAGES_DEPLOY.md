# GitHub Pages deployment

Website được publish từ `main` qua workflow `.github/workflows/deploy-pages.yml`. Artifact bao gồm thư mục `admin/`, do dashboard đã dùng Supabase Auth và Row Level Security (RLS) để xác thực và cấp quyền ở lớp dữ liệu. Dashboard sẽ có địa chỉ `https://tradetolive.github.io/giahuyland/admin/` sau khi workflow hoàn tất.

> Đường dẫn `/admin/` không phải lớp bảo mật. Trang được đặt `noindex, nofollow`, nhưng chỉ Supabase Auth kết hợp RLS mới quyết định ai có thể đọc, tạo, sửa, xóa listing hoặc truy cập tài liệu private.

## Kích hoạt lần đầu

1. Mở repository → **Settings** → **Pages**.
2. Tại **Build and deployment**, chọn **Source: GitHub Actions**.
3. Mở tab **Actions** và chờ workflow “Deploy static site to GitHub Pages” hoàn tất.
4. Site sẽ ở `https://tradetolive.github.io/giahuyland/`.
5. Trong **Settings → Pages**, bật **Enforce HTTPS** nếu tùy chọn xuất hiện.

## Trang quản trị

1. Sau khi deployment thành công, mở `https://tradetolive.github.io/giahuyland/admin/`.
2. Đăng nhập bằng tài khoản đã tạo trong **Supabase → Authentication → Users** và đã được thêm vào `public.admin_users`.
3. Lưu ở trạng thái **Bản nháp** để chỉ quản trị viên nhìn thấy. Chỉ chọn **Xuất bản** sau khi đã đối chiếu thông tin, giá, vị trí và nội dung pháp lý công khai.
4. Ảnh cover/thư viện được lưu ở bucket public `property-media`; ảnh sổ đỏ hoặc PDF phải dùng `property-documents`, là bucket private mở qua signed URL có thời hạn.
5. Không đưa mật khẩu, `service_role` key, CCCD hay thông tin chủ sở hữu vào website, source code hay trường hiển thị công khai.

## Biểu mẫu liên hệ

Netlify Forms không hoạt động trên GitHub Pages. Website đã chuyển biểu mẫu sang `mailto:tatylic@gmail.com`, nên khi khách gửi biểu mẫu, thiết bị sẽ mở ứng dụng email mặc định với nội dung đã điền. Khi cần form lưu dữ liệu tự động, cần thêm một endpoint bảo mật (ví dụ Supabase Edge Function) và chính sách quyền truy cập phù hợp.

## SEO

Canonical, Open Graph, JSON-LD, `robots.txt` và `sitemap.xml` đã chuyển sang domain GitHub Pages. Sau khi workflow chạy, mở `/robots.txt` và `/sitemap.xml` trên domain GitHub Pages để kiểm tra trước khi gửi sitemap tới Google Search Console.
