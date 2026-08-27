# GitHub Pages deployment

Website được publish từ `main` qua workflow `.github/workflows/deploy-pages.yml`. Artifact public loại trừ thư mục `admin/` vì trang này chưa có xác thực server-side; không nên public giao diện xóa/thêm sản phẩm khi chưa hoàn tất Supabase Auth và RLS.

## Kích hoạt lần đầu

1. Mở repository → **Settings** → **Pages**.
2. Tại **Build and deployment**, chọn **Source: GitHub Actions**.
3. Mở tab **Actions** và chờ workflow “Deploy static site to GitHub Pages” hoàn tất.
4. Site sẽ ở `https://tradetolive.github.io/giahuyland/`.
5. Trong **Settings → Pages**, bật **Enforce HTTPS** nếu tùy chọn xuất hiện.

## Biểu mẫu liên hệ

Netlify Forms không hoạt động trên GitHub Pages. Website đã chuyển biểu mẫu sang `mailto:tatylic@gmail.com`, nên khi khách gửi biểu mẫu, thiết bị sẽ mở ứng dụng email mặc định với nội dung đã điền. Khi cần form lưu dữ liệu tự động, cần thêm một endpoint bảo mật (ví dụ Supabase Edge Function) và chính sách quyền truy cập phù hợp.

## SEO

Canonical, Open Graph, JSON-LD, `robots.txt` và `sitemap.xml` đã chuyển sang domain GitHub Pages. Sau khi workflow chạy, mở `/robots.txt` và `/sitemap.xml` trên domain GitHub Pages để kiểm tra trước khi gửi sitemap tới Google Search Console.
