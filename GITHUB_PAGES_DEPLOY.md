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

### Đổi hoặc quên mật khẩu admin

Luồng này dùng Supabase Auth và không cần SQL hay khóa `service_role`.

1. Trong Supabase Dashboard, mở **Authentication → URL Configuration**.
2. Ở danh sách **Redirect URLs**, thêm chính xác `https://tradetolive.github.io/giahuyland/admin/reset-password.html`, sau đó lưu. Không dùng URL lạ hoặc wildcard rộng hơn mức cần thiết.
3. Mở `https://tradetolive.github.io/giahuyland/admin/`, nhập email quản trị, rồi chọn **Quên mật khẩu?**.
4. Nếu email có tài khoản, Supabase sẽ gửi một liên kết. Mở email trên thiết bị tin cậy, kiểm tra cả thư mục Spam nếu cần, rồi chọn liên kết đó.
5. Tại trang **Đặt mật khẩu mới**, nhập một mật khẩu có ít nhất 12 ký tự và xác nhận lại. Không gửi mật khẩu qua chat hoặc lưu trong trình duyệt công cộng.
6. Sau khi lưu, trang sẽ đưa bạn về `/admin/`; đăng nhập lại bằng mật khẩu mới. Nếu liên kết báo hết hạn hoặc không hợp lệ, quay lại `/admin/` và gửi yêu cầu mới.

> Nội dung phản hồi khi gửi email được thiết kế trung tính để không tiết lộ email nào tồn tại hoặc có quyền quản trị. Trang đặt lại mật khẩu không tự cấp quyền; tài khoản vẫn phải có trong `public.admin_users` mới vào được dashboard.

### Quản lý nội dung biên tập

Các nội dung giới thiệu, “Điểm nghẽn quy hoạch” và “Lợi thế Hà An” dùng bảng `content_posts`, tách biệt với listing bất động sản. Dashboard quản trị dùng bảng gốc; website public chỉ đọc view `content_posts_public`, vốn chỉ có bài published và không có `author_id`. Sau khi migrations `supabase/migrations/20260827_editorial_content_posts.sql` và `supabase/migrations/20260827_harden_content_posts_public_read.sql` đã được chủ dự án review và chạy trong **Supabase → SQL Editor**, cách vận hành như sau:

1. Mở `/admin/` và đăng nhập.
2. Cuộn đến khu vực **Nội dung biên tập**.
3. Nhập tiêu đề, slug, nhãn phụ, tóm tắt và nội dung. Tách đoạn bằng một dòng trống.
4. Chọn **Bản nháp** khi chưa kiểm chứng; chỉ chọn **Xuất bản** sau khi nội dung đã được rà soát.
5. Nếu muốn thay một khối trên trang chủ, chọn đúng vị trí `Hero giới thiệu`, `Điểm nghẽn quy hoạch`, hoặc `Lợi thế Hà An`. Mỗi vị trí chỉ được có một bài đang xuất bản; cần hạ bài cũ về Bản nháp trước khi xuất bản bài thay thế.
6. Nếu không chọn vị trí trang chủ, bài vẫn có URL riêng dạng `https://tradetolive.github.io/giahuyland/bai-viet.html?slug=<slug>` sau khi xuất bản.
7. Chỉ tải ảnh marketing vào cover. Không tải sổ đỏ, CCCD, số điện thoại cá nhân hay tài liệu nhạy cảm vào ảnh public.

> Các trang bài viết theo slug là template động trên GitHub Pages, nên mặc định không yêu cầu Google index riêng từng bài. Khi cần SEO index từng bài riêng, nên bổ sung bước tạo trang tĩnh và sitemap theo dữ liệu published trước khi thay đổi `noindex`.

### Bản nháp tự động từ nguồn nhà nước lúc 07:00

Workflow `.github/workflows/create-daily-editorial-draft.yml` chạy lúc **07:00 giờ Việt Nam** (`00:00 UTC`) mỗi ngày. Nó chỉ đọc allowlist Cổng thông tin điện tử tỉnh Quảng Ninh, lọc các chủ đề quy hoạch/hạ tầng/xây dựng/đô thị/khu kinh tế, lưu URL và ngày nguồn, chống trùng theo fingerprint URL, rồi tạo **tối đa một** bài `draft`. Không có bước tự xuất bản.

1. Trước khi kích hoạt, chạy migration `supabase/migrations/20260827_daily_editorial_drafts.sql` trong **Supabase → SQL Editor**. Migration chỉ thêm cột truy vết nguồn và index chống trùng vào `content_posts`; không thay đổi RLS hoặc trạng thái bài hiện có.
2. Trong repository GitHub, mở **Settings → Secrets and variables → Actions → Secrets → New repository secret**. Tạo đúng một secret tên `SUPABASE_SERVICE_ROLE_KEY`; giá trị là `service_role` key lấy trực tiếp từ **Supabase → Project Settings → API**. Không gửi key qua chat, không commit key, không dán vào JavaScript website và không đưa vào ảnh chụp màn hình.
3. Mở **Actions → Create daily editorial draft → Run workflow**, giữ lựa chọn **Chỉ kiểm tra nguồn, không tạo bản nháp** là `true`, rồi bấm **Run workflow**. Kiểm tra log chỉ ghi URL nguồn/tiêu đề, không có password hoặc key.
4. Nếu chạy thử nhận được một nguồn phù hợp, chạy lại workflow với lựa chọn `false` để tạo một bản nháp kiểm thử. Sau đó vào `/admin/` → **Nội dung biên tập**, kiểm tra phần **Nguồn tham khảo**, sửa/hoàn thiện nội dung và chỉ tự bạn đổi sang `published` khi đã đối chiếu.
5. Nếu secret chưa được thiết lập, workflow vẫn khởi động lúc 07:00 nhưng script sẽ ghi rõ trạng thái **bỏ qua an toàn** rồi kết thúc; không thất bại và không cố ghi dữ liệu. Sau khi thêm secret, lịch tiếp theo mới có thể tạo bản nháp.

> GitHub Actions trên standard GitHub-hosted runner cho repository public được GitHub nêu là miễn phí; không tạo artifact/cache trong workflow này.[1] GitHub cũng cảnh báo workflow hẹn giờ trong repository public có thể bị tự vô hiệu sau 60 ngày không có hoạt động, vì vậy hãy kiểm tra tab Actions định kỳ.[2] Nội dung nguồn chỉ là tài liệu tham khảo. Quy hoạch, giá, lợi nhuận và pháp lý vẫn phải được xác minh trước khi xuất bản.

[1]: https://docs.github.com/en/billing/concepts/product-billing/github-actions "GitHub Actions billing"
[2]: https://docs.github.com/en/actions/managing-workflow-runs/disabling-and-enabling-a-workflow "Disabling and enabling a workflow"

## Biểu mẫu liên hệ

Netlify Forms không hoạt động trên GitHub Pages. Website đã chuyển biểu mẫu sang `mailto:tatylic@gmail.com`, nên khi khách gửi biểu mẫu, thiết bị sẽ mở ứng dụng email mặc định với nội dung đã điền. Khi cần form lưu dữ liệu tự động, cần thêm một endpoint bảo mật (ví dụ Supabase Edge Function) và chính sách quyền truy cập phù hợp.

## SEO

Canonical, Open Graph, JSON-LD, `robots.txt` và `sitemap.xml` đã chuyển sang domain GitHub Pages. Sau khi workflow chạy, mở `/robots.txt` và `/sitemap.xml` trên domain GitHub Pages để kiểm tra trước khi gửi sitemap tới Google Search Console.
