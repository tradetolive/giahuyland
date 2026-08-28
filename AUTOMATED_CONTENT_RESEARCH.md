# Đánh giá nguồn bài viết và luồng tạo bản nháp

## Phạm vi đã chốt

GiaHuy Land dùng URL của từng bài Facebook do chủ website sở hữu hoặc có quyền sử dụng làm nguồn tham khảo. Dashboard tạo một `draft` có link nguồn; quản trị viên tự đọc bài gốc, biên tập nội dung và chỉ tự xuất bản sau khi kiểm chứng. Hệ thống không scrape profile, không dùng cookie, không tải/trích xuất/sao chép nội dung Facebook, không tự xuất bản và không tạo nhận định về giá, lợi nhuận hoặc pháp lý.

## Kiến trúc triển khai

| Thành phần | Vai trò | Kiểm soát an toàn |
|---|---|---|
| Form URL Facebook trong dashboard | Nhận permalink bài/reel Facebook cụ thể, tiêu đề và ghi chú tùy chọn. | Chỉ nhận URL HTTPS trên Facebook; từ chối URL profile `anhladenhoi` hoặc URL không có định danh bài. |
| Xác nhận quyền sử dụng | Quản trị viên tích xác nhận trước khi tạo. | Chỉ dùng nội dung thuộc quyền sở hữu hoặc quyền sử dụng của chủ website. |
| Tạo skeleton draft | Lưu URL nguồn, tên nguồn, fingerprint chống trùng và `status = draft`. | Không lấy hay sao chép nội dung Facebook; khách truy cập không thấy bản nháp. |
| `content_posts_public` | Hiển thị bài đã xuất bản và URL nguồn để độc giả đối chiếu. | Không gồm `author_id`, fingerprint hoặc dữ liệu quản trị nội bộ. |
| Quản trị viên | Hoàn thiện nội dung, loại bỏ dữ liệu nhạy cảm và tự đổi trạng thái xuất bản. | Human review là bắt buộc; không có tác vụ tự xuất bản. |

## Lý do không tự động đọc Facebook profile

Meta mô tả endpoint User Posts yêu cầu user access token và quyền `user_posts`; endpoint chỉ trả bài do app user tạo hoặc các bài được gắn thẻ.[1] Điều này đòi hỏi Meta App, luồng Facebook Login và quản lý token; token người dùng không có tính vĩnh viễn.[2] Để giữ luồng vận hành đơn giản, zero-cost và không phụ thuộc vào cơ chế thu thập profile cá nhân, GiaHuy Land không dùng API này trong phạm vi hiện tại.

> Không sử dụng crawler HTML, cookie trình duyệt, dữ liệu sau đăng nhập hoặc tự động hóa giao diện Facebook. Các cách này không phải cơ chế cấp quyền chính thức và dễ mất ổn định khi nền tảng thay đổi.

## Quy tắc biên tập trước xuất bản

Sau khi tạo draft, quản trị viên phải mở URL nguồn, kiểm tra tính chính xác, viết lại nội dung theo ngữ cảnh website, xóa thông tin cá nhân/ảnh giấy tờ và thêm ảnh marketing phù hợp nếu cần. Chỉ khi nội dung không tạo cam kết đầu tư, không khẳng định pháp lý chưa được xác minh và phù hợp chính sách của GiaHuy Land, quản trị viên mới đổi trạng thái thành `published`.

## References

[1]: https://developers.facebook.com/docs/graph-api/reference/user/posts/ "Meta for Developers — User Posts"
[2]: https://developers.facebook.com/documentation/facebook-login/guides/access-tokens "Meta for Developers — Access Tokens"
