# Đánh giá nguồn bài viết và luồng tạo bản nháp

## Phạm vi đã chốt

GiaHuy Land dùng URL của từng bài Facebook do chủ website sở hữu hoặc có quyền sử dụng làm nguồn tham khảo. Dashboard tạo một `draft` có link nguồn; quản trị viên tự đọc bài gốc, biên tập nội dung và chỉ tự xuất bản sau khi kiểm chứng. Hệ thống không scrape profile, không dùng cookie, không tải/trích xuất/sao chép nội dung Facebook, không tự xuất bản và không tạo nhận định về giá, lợi nhuận hoặc pháp lý.

## Kiến trúc triển khai

| Thành phần | Vai trò | Kiểm soát an toàn |
|---|---|---|
| Form URL + nội dung Facebook trong dashboard | Nhận permalink bài/reel Facebook cụ thể và phần nội dung do admin tự dán; trợ lý điền title/excerpt/body trước khi lưu. | Chỉ nhận URL HTTPS trên Facebook; từ chối URL profile `anhladenhoi` hoặc URL không có định danh bài. |
| Xác nhận quyền sử dụng | Quản trị viên tích xác nhận trước khi tạo. | Chỉ dùng nội dung thuộc quyền sở hữu hoặc quyền sử dụng của chủ website. |
| Tạo bản nháp | Lưu URL nguồn, tên nguồn, fingerprint chống trùng, nội dung do admin dán và `status = draft`. | Không tự lấy/trích xuất dữ liệu từ Facebook; khách truy cập không thấy bản nháp. |
| `content_posts_public` | Hiển thị bài đã xuất bản và URL nguồn để độc giả đối chiếu. | Không gồm `author_id`, fingerprint hoặc dữ liệu quản trị nội bộ. |
| Quản trị viên | Hoàn thiện nội dung, loại bỏ dữ liệu nhạy cảm và tự đổi trạng thái xuất bản. | Human review là bắt buộc; không có tác vụ tự xuất bản. |

## Lý do không tự động đọc Facebook profile

Meta mô tả endpoint User Posts yêu cầu user access token và quyền `user_posts`; endpoint chỉ trả bài do app user tạo hoặc các bài được gắn thẻ.[1] Điều này đòi hỏi Meta App, luồng Facebook Login và quản lý token; token người dùng không có tính vĩnh viễn.[2] Để giữ luồng vận hành đơn giản, zero-cost và không phụ thuộc vào cơ chế thu thập profile cá nhân, GiaHuy Land không dùng API này trong phạm vi hiện tại.

Kiểm tra URL Facebook do chủ website cung cấp `https://www.facebook.com/share/p/198uiHmPez/` trong trình duyệt có phiên người dùng đã cho thấy Facebook chuyển tới một permalink và có metadata tiêu đề/mô tả. Đây chỉ xác nhận nội dung có thể được người dùng đang đăng nhập xem trong trình duyệt; nó **không** cấp quyền cho website GitHub Pages hoặc dashboard JavaScript tự lấy nội dung, vì các môi trường đó không có user access token Meta hay cookie phiên của người dùng.

Từ 15/06/2026, Meta công bố oEmbed tokenless cho nội dung công khai.[3] Tuy nhiên, tài liệu `oembed_post` chỉ mô tả dữ liệu nhúng kỹ thuật (`html`, kích thước, provider và type), không trả trường `message`/nội dung bài.[4] Thử gọi endpoint với cả share URL và permalink của bài do chủ website cung cấp tại thời điểm đánh giá đều nhận HTTP 400 `Invalid parameter`; vì vậy không thể dùng oEmbed làm nền tảng ổn định để tự điền tiêu đề, tóm tắt và nội dung bài vào dashboard.

> Không sử dụng crawler HTML, cookie trình duyệt, dữ liệu sau đăng nhập hoặc tự động hóa giao diện Facebook. Các cách này không phải cơ chế cấp quyền chính thức và dễ mất ổn định khi nền tảng thay đổi.

## Quy tắc biên tập trước xuất bản

Trợ lý chỉ chuẩn hóa phần nội dung mà admin chủ động dán: dòng đầu có ý nghĩa trở thành tiêu đề, đoạn đầu tạo tóm tắt tối đa 260 ký tự và nội dung được giữ nguyên để chỉnh sửa. Trợ lý không tự lưu hoặc tự xuất bản. Sau khi tạo draft, quản trị viên phải mở URL nguồn, kiểm tra tính chính xác, viết lại nội dung theo ngữ cảnh website, xóa thông tin cá nhân/ảnh giấy tờ và thêm ảnh marketing phù hợp nếu cần. Chỉ khi nội dung không tạo cam kết đầu tư, không khẳng định pháp lý chưa được xác minh và phù hợp chính sách của GiaHuy Land, quản trị viên mới đổi trạng thái thành `published`.

## References

[1]: https://developers.facebook.com/docs/graph-api/reference/user/posts/ "Meta for Developers — User Posts"
[2]: https://developers.facebook.com/documentation/facebook-login/guides/access-tokens "Meta for Developers — Access Tokens"
[3]: https://developers.facebook.com/blog/post/2026/06/15/tokenless-access-to-meta-oembed-apis/ "Meta for Developers — Introducing Tokenless Access to Meta oEmbed APIs"
[4]: https://developers.facebook.com/docs/graph-api/reference/oembed-post/ "Meta for Developers — Oembed Post"
