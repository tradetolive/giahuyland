# Khả năng chia sẻ thông tin bài đăng qua Zalo và Messenger

## Mục tiêu

Khách bấm liên hệ từ một listing cần truyền được tên và URL chi tiết của chính listing đó. Website không được tự gửi tin nhắn thay khách hoặc đọc/ghi vào giao diện chat của ứng dụng bên thứ ba.

## Kết quả rà soát

| Kênh hiện tại | Khả năng có thể xác nhận | Hạn chế áp dụng cho GiaHuy Land |
|---|---|---|
| Zalo cá nhân `zalo.me/0854141414` | Deep link mở đúng cuộc trò chuyện; website có thể sao chép thông điệp gồm tên + URL vào clipboard trước khi mở chat. | Không có tài liệu công khai chính thức xác nhận tham số URL để điền trước nội dung vào composer của chat cá nhân. Trình duyệt không được phép tự dán vào giao diện Zalo do giới hạn same-origin và quyền clipboard. |
| Messenger `m.me/anhladenhoi` | Tài liệu Meta mô tả tham số `text` cho liên kết `m.me` của **Facebook Page đã liên kết Messenger experience/app**. | Link hiện tại chuyển tới cuộc trò chuyện với tài khoản cá nhân, không phải Page Messenger experience đã cấu hình. Vì vậy không thể cam kết tham số `text` sẽ điền nội dung trong mọi thiết bị. |
| Chia sẻ hệ thống (Web Share API) | Trên thiết bị/brower hỗ trợ, người dùng có thể chọn ứng dụng như Zalo hoặc Messenger từ bảng chia sẻ của hệ điều hành và gửi tiêu đề + URL. | Người dùng vẫn chọn ứng dụng/điểm đến và xác nhận gửi; hành vi điền trước tùy vào ứng dụng nhận. |

## Phương án an toàn đang dùng

Nút Zalo/Messenger sao chép thông điệp gồm tên và URL listing, rồi mở cuộc trò chuyện. Điều này giữ nguyên quyền kiểm soát của khách: khách xem, chỉnh sửa, dán và tự bấm gửi.

## Điều kiện để Messenger có thể dùng `text`

Chủ website cần sử dụng **Facebook Page**, thiết lập Messenger Platform/App tương ứng và cấp các quyền Meta cần thiết. Khi đó có thể thử dùng `m.me/<PAGE-NAME>?text=<url-encoded-message>` cùng với fallback sao chép. Tham số `ref` chỉ hữu ích khi Page có webhook xử lý referral; website tĩnh hiện không có webhook này.

## Không triển khai

Không dùng script tự động dán/phát phím Enter vào Zalo hoặc Messenger, không dùng API không chính thức, không nhúng token Page/OA vào JavaScript công khai và không tự gửi tin nhắn thay khách.

## Nguồn

1. [Meta for Developers — m.me Links](https://developers.facebook.com/documentation/business-messaging/messenger-platform/discovery/m-me-links): mô tả `m.me`, `text`, `ref`, phạm vi Facebook Page có Messenger experience và các giới hạn referral.
2. [Zalo For Developers — Official Account API](https://developers.zalo.me/docs/api/official-account-api-230): tài liệu về API dành cho Zalo Official Account; không xác nhận tham số soạn sẵn tin nhắn cho URL Zalo cá nhân hiện dùng.
