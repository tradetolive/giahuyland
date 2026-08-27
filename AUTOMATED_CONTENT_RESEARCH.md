# Đánh giá tự động tạo bài viết nháp hằng ngày

## Mục tiêu khả thi

Quy trình phù hợp cho GiaHuy Land là **mỗi ngày tạo tối đa một bản nháp** trong `content_posts`, lưu liên kết nguồn để quản trị viên kiểm chứng, rồi chỉ công khai khi quản trị viên đổi trạng thái sang `published`. Không để tác vụ hằng ngày tự xuất bản, tự tạo cam kết lợi nhuận, kết luận pháp lý cho một lô đất, hoặc sao chép toàn văn bài báo.

## Kiến trúc đề xuất để đánh giá

| Thành phần | Vai trò | Nguyên tắc an toàn |
|---|---|---|
| Workflow GitHub chạy hằng ngày | Kích hoạt vào khung giờ đã chọn, tải RSS/API/HTML công khai từ allowlist. | Không scrape trang đăng tin cá nhân, trang trả phí, dữ liệu sau đăng nhập hoặc website cấm truy cập tự động. |
| Script Node.js không phụ thuộc package nặng | Lọc nguồn, chống trùng URL/tựa đề, chuẩn hóa trích dẫn và chuẩn bị payload. | Chỉ gửi thông tin đã truy vết được đến bước soạn nháp. |
| AI tùy chọn | Tóm tắt/sáng tác góc nhìn biên tập dựa trên nguồn đã chọn. | Luôn gắn URL nguồn, cấm dự báo giá/lợi nhuận, cấm coi đây là tư vấn pháp lý; bắt buộc human review. |
| Supabase `content_posts` | Lưu tiêu đề, tóm tắt, nội dung, URL nguồn, hash chống trùng và trạng thái `draft`. | Không dùng publishable key để ghi tự động. Khóa có quyền ghi chỉ ở GitHub Actions secret, không ở website/client source. |
| Dashboard hiện có | Chủ website review, sửa, chọn ảnh marketing và xuất bản. | Trạng thái mặc định luôn `draft`; chỉ admin được chuyển `published`. |

## Nguồn nội dung nên ưu tiên

Nguồn nên giới hạn bằng allowlist, bắt đầu bằng cổng thông tin Chính phủ/Bộ/Xây dựng địa phương hoặc cơ quan nhà nước có thẩm quyền liên quan tới quy hoạch, hạ tầng và hướng dẫn thủ tục. Nội dung đưa vào bản nháp cần chuyển thành thông tin tổng quan, liên kết tới nguồn gốc và ghi rõ ngày nguồn công bố. Không coi nội dung bên thứ ba về “bản đồ quy hoạch”, giá rao bán hoặc dự báo tăng giá là dữ liệu xác thực để đăng tự động.

Một ví dụ nguồn chính thống là Cổng thông tin điện tử Sở Xây dựng Quảng Ninh, xác định cơ quan chủ quản là UBND tỉnh Quảng Ninh.[1] Tuy nhiên, từng URL/tin phải được script kiểm tra phản hồi hợp lệ và dùng dữ liệu công khai thật; URL lỗi hoặc nội dung thiếu bối cảnh phải bị loại.

Trang RSS của Quảng Ninh Portal công bố chuyên mục “Thông tin quy hoạch” và điều khoản yêu cầu cung cấp rõ thông tin cần thiết khi sử dụng kênh.[5] URL feed được hiển thị cần được kiểm tra thực tế ở thời điểm chạy: lần kiểm tra `27-08-2026` với một URL được suy diễn từ trang trả HTTP 404. Vì vậy, chưa đưa URL này vào allowlist chạy tự động; workflow sẽ chỉ nhận feed có HTTP 200 và XML RSS/Atom hợp lệ.

Trang tin công khai của Quảng Ninh Portal tại `https://www.quangninh.gov.vn/Trang/tin-tuc-su-kien.aspx` trả HTTP 200 và có các liên kết bài viết chuẩn dạng `/Trang/ChiTietTinTuc.aspx?nid=<id>`. Một bài kiểm tra ngày 27/08/2026 về khởi công công trình trong tỉnh có tiêu đề, ngày xuất bản và phần dẫn nguồn rõ ràng; bài cũng nhắc Khu kinh tế ven biển Quảng Yên.[6] Workflow có thể dùng trang danh mục này làm cơ chế phát hiện ban đầu, nhưng phải áp dụng bộ lọc tiêu đề/nội dung cho các chủ đề quy hoạch, hạ tầng, xây dựng, khu kinh tế và Quảng Yên/Hà An; mọi tin ngoài phạm vi hoặc thiếu ngày/URL chuẩn đều bị bỏ qua.

Để tránh tạo nội dung sai ngữ cảnh, bản nháp tự động chỉ chứa thông tin trích dẫn tối thiểu: tiêu đề nguồn, ngày nguồn công bố, cơ quan nguồn, URL gốc và một ghi chú biên tập yêu cầu đối chiếu. Không tự suy diễn mức ảnh hưởng đến giá đất, lợi nhuận hoặc pháp lý của bất động sản.

## Giới hạn vận hành GitHub

GitHub Actions hỗ trợ chạy workflow theo lịch bằng cron UTC.[2] Workflow định kỳ trong repository public có thể bị GitHub tự vô hiệu nếu repository không có hoạt động trong 60 ngày; chủ website cần kiểm tra tab Actions định kỳ và bật lại khi cần.[3] Các khóa dùng trong workflow cần được lưu ở GitHub Actions Secrets, không ghi vào workflow/source code hoặc log.[4]

## Phương án chưa phù hợp

Không chạy bằng trình duyệt của chủ website, không dùng tài khoản Zalo/Messenger, không tự động công bố bài chưa duyệt, không dùng khóa `service_role` ở frontend và không dùng schedule tác vụ AI tiêu hao credit như một giải pháp “miễn phí hoàn toàn”.

## References

[1]: https://www.quangninh.gov.vn/So/soxaydung "Cổng thông tin điện tử Sở Xây dựng Quảng Ninh"
[2]: https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows "GitHub Docs — Events that trigger workflows"
[3]: https://docs.github.com/en/actions/managing-workflow-runs/disabling-and-enabling-a-workflow "GitHub Docs — Disabling and enabling a workflow"
[4]: https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions "GitHub Docs — Using secrets in GitHub Actions"
[5]: https://www.quangninh.gov.vn/so/sothongtinTT/Trang/Qnp-rss.aspx "Cổng thông tin Quảng Ninh — Kênh thông tin RSS"
[6]: https://www.quangninh.gov.vn/Trang/ChiTietTinTuc.aspx?nid=168658 "Cổng thông tin Quảng Ninh — Các đồng chí lãnh đạo tỉnh dự khánh thành, khởi công các công trình chào mừng thành phố Quảng Ninh"
