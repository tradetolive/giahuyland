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
- [x] Thiết kế bảng `content_posts`, RLS và Storage theo nguyên tắc dashboard admin dùng bảng gốc, public chỉ đọc view `content_posts_public` có bài `published` và cột an toàn.
- [x] Bổ sung biểu mẫu CRUD cho bài viết biên tập trong dashboard mà không làm thay đổi luồng listing hiện có.
- [x] Bổ sung danh sách và trang chi tiết bài viết công khai theo slug, chỉ tải bài `published` qua view public.
- [ ] Nghiên cứu đường dẫn chính thức Zalo/Messenger cho nội dung soạn sẵn; không hứa hẹn tự điền nếu nền tảng không hỗ trợ chat cá nhân.
- [x] Kiểm thử quyền public: view trả 3 bài published; bảng gốc anonymous trả 401; yêu cầu `author_id` qua view trả 400. Kiểm tra render desktop/mobile và URL slug hợp lệ/không tồn tại đã đạt. Hướng dẫn vận hành đã cập nhật; dashboard CRUD cần người dùng xác nhận thao tác sau deploy.
- [x] Hợp nhất và deploy GitHub Pages: workflow `33063520074` thành công. Trang chủ, `/bai-viet.html`, `/admin/` và các script bài viết phản hồi HTTP 200; render production nhận dữ liệu published qua view public an toàn.

> Phạm vi đã chốt: chỉ triển khai quản trị nội dung tĩnh. GiaHuy Land đang sử dụng Facebook/Messenger cá nhân nên không triển khai tự điền hoặc tự gửi tin nhắn; giữ cơ chế sao chép link + mở chat hiện có.

> Trạng thái migration: file `supabase/migrations/20260827_editorial_content_posts.sql` đã sẵn sàng để review/chạy. Thử mở SQL Editor qua My Browser bị timeout, nên chưa áp dụng bất kỳ DDL/RLS nào lên Supabase.

> Kiểm thử sau migration: Data API anonymous trả HTTP 200 cho đúng 3 bài `published`, trả mảng rỗng khi lọc `draft`, bài theo slug hợp lệ trả 1 dòng và slug không tồn tại trả mảng rỗng. Preview trang chủ tải được; kiểm tra sau tải JavaScript bị timeout từ My Browser nên không dùng để đánh giá trực quan phần render động.

> Hardening sau migration: `20260827_harden_content_posts_public_read.sql` đã được chủ dự án chạy. Public read hiện qua view `content_posts_public` chỉ có cột an toàn/bài published; bảng gốc anonymous trả HTTP 401 và `author_id` không tồn tại trong view.

> Kiểm tra trực quan preview bằng Chromium headless: desktop giữ rõ tiêu đề, CTA và minh họa ở hero; mobile 390 px xếp tiêu đề/bản tóm tắt/CTA không tràn ngang. Không thay đổi liên hệ Zalo/Messenger trong đợt này.

## Tự động tạo bài viết nháp hằng ngày

- [x] Xác định chủ đề, allowlist Cổng thông tin điện tử tỉnh Quảng Ninh, quy tắc trích dẫn và tiêu chí loại trừ nội dung.
- [x] Thiết kế quy trình zero-cost chỉ tạo `draft`, chống trùng lặp theo fingerprint URL và lưu URL nguồn để admin kiểm chứng.
- [x] Chọn lịch GitHub 00:00 UTC (07:00 Việt Nam), GitHub Actions Secret và chế độ bỏ qua an toàn khi chưa có key.
- [ ] Triển khai sau khi chủ website xác nhận rõ nguồn, tần suất và việc tạo draft tự động; không tự xuất bản hay đăng nội dung chưa duyệt.

> Cấu hình đã chốt: Phương án workflow nền GitHub, chạy **07:00 hằng ngày giờ Việt Nam** (00:00 UTC), chỉ allowlist nguồn cơ quan nhà nước, tạo tối đa một `draft` mỗi lần và tuyệt đối không tự xuất bản.

> Thiết kế triển khai: workflow chỉ chạy ghi dữ liệu khi GitHub Secret `SUPABASE_SERVICE_ROLE_KEY` đã tồn tại; chạy tay mặc định `dry_run=true` không cần key. Chưa chạy migration, chưa tạo secret và chưa tạo bản nháp thật trong Supabase.

## Nguồn Facebook cá nhân do chủ website kiểm soát

- [x] Xác minh hướng dùng bài Facebook do chủ website kiểm soát, không dùng crawler/profile/cookie hoặc API chưa cấp quyền.
- [x] Chọn phương án nhập URL bài có chọn lọc thay vì scrape profile Facebook cá nhân tự động.
- [x] Hủy hướng workflow daily draft; chỉ giữ metadata nguồn đã chạy để phục vụ truy vết URL Facebook trong dashboard.

> Phạm vi nguồn đã thay đổi: dừng triển khai allowlist Cổng thông tin Quảng Ninh cho tới khi chốt phương án Facebook. Không hợp nhất nhánh `feature/daily-editorial-drafts`, không chạy workflow và không tạo bài nháp từ nguồn nhà nước.

> Phương án đã chọn: nhập URL Facebook có chọn lọc trong dashboard. Chỉ dùng link bài do chủ website kiểm soát, tạo `draft` thủ công có nguồn dẫn; không cần Meta App/token, không scrape profile và không tự xuất bản.

- [x] Thêm biểu mẫu “Tạo bản nháp từ URL Facebook” cho host Facebook hợp lệ và link bài viết cụ thể.
- [x] Tạo draft chứa URL/tên nguồn, đánh dấu nguồn Facebook và chặn trùng URL mà không tải hoặc sao chép nội dung Facebook.
- [x] Gỡ workflow và script nguồn nhà nước chưa kích hoạt; đổi tên migration đã chạy thành `20260827_content_post_source_metadata.sql` để phản ánh truy vết nguồn chung.
- [x] Kiểm thử mã: URL chỉ chấp nhận HTTPS Facebook có định danh bài; profile/URL không có định danh bị từ chối; fingerprint SHA-256 tạo tại trình duyệt; payload luôn là `draft` và không có fetch/crawl nguồn.
- [x] Kiểm thử quyền public: POST anonymous vào `content_posts` trả HTTP 401. Không tạo dữ liệu thử bằng admin trước khi chủ website tự chọn URL bài thực tế.
- [ ] Chủ website tạo thử một draft bằng URL bài Facebook thực tế sau deploy, kiểm tra chặn trùng và hoàn thiện nội dung trước xuất bản.

> Sửa copy production bổ sung: đổi mô tả “Bản nháp tạo hằng ngày” thành “Bản nháp có dẫn nguồn” để phản ánh đúng luồng Facebook thủ công.

## Sửa lỗi tạo bản nháp từ URL Facebook

- [x] Tái hiện lỗi `Cannot read properties of null (reading 'reset')`: `event.currentTarget` bị browser xóa sau lệnh `await` trong hàm async, sau khi insert đã trả về thành công.
- [x] Sửa điểm reset form để giữ tham chiếu `form` trước thao tác async, không phụ thuộc `event.currentTarget` sau `await`.
- [ ] Kiểm thử URL Facebook thực tế, chặn trùng và xác minh bài chỉ ở trạng thái `draft` trước khi xin xác nhận deploy bản sửa.

## Lấy nội dung đầy đủ từ bài Facebook do chủ website kiểm soát

- [ ] Xác minh cách chính thức để lấy `message` và metadata từ bài Facebook cá nhân theo URL do chủ website cung cấp.
- [ ] So sánh Meta Graph API có cấp quyền với phương án người dùng chủ động nhập/nạp nội dung, bao gồm chi phí và độ ổn định.
- [ ] Chỉ triển khai sau khi chủ website chọn phương án quyền truy cập; không scrape profile, cookie hoặc dữ liệu sau đăng nhập.

## Trợ lý dán nội dung Facebook vào bản nháp

- [x] Thiết kế quy tắc chọn dòng đầu có ý nghĩa làm tiêu đề, tạo tóm tắt tối đa 260 ký tự và giữ nguyên phần nội dung do admin dán.
- [x] Bổ sung vùng dán nội dung và nút điền vào form bài viết, không tự lưu hoặc tự xuất bản.
- [x] Kiểm thử parser với nội dung nhiều dòng, tiêu đề tùy chọn và dữ liệu rỗng; body giữ nguyên nội dung đã dán, tóm tắt có giới hạn 260 ký tự, slug tạo từ title và payload luôn `draft`.
- [ ] Chủ website tạo thử một draft bằng nội dung bài Facebook thực tế sau deploy, kiểm tra title/excerpt/body, chặn trùng URL và chỉnh sửa trước xuất bản.

> Hành vi trợ lý: xử lý nội dung do admin chủ động dán tại client-side; không gọi Facebook/API, không lưu tự động, không xuất bản tự động và luôn mở form bài viết để admin kiểm tra trước khi có thao tác lưu.
