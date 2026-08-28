/*
 * GiaHuy Land — dữ liệu dự phòng cho bài viết biên tập.
 * Dữ liệu này chỉ hiện khi Supabase không tải được; khi bảng content_posts hoạt động,
 * website chỉ dùng các bài published do admin quản trị.
 */
(function () {
  window.GIAHUY_EDITORIAL_FALLBACK = [
    {
      slug: 'nha-dat-ha-an-so-do-trao-tay',
      title: 'Nhà đất Hà An — sổ đỏ trao tay, không qua trung gian mập mờ',
      eyebrow: 'Trang chủ · Hà An · Quảng Ninh',
      excerpt: 'GiaHuy Land trực tiếp phân phối các lô đất thổ cư tại Hà An — cửa ngõ nối Quảng Ninh với Hải Phòng qua cầu Bạch Đằng, sát vùng công nghiệp Sông Khoai.',
      body: 'Thông tin về vị trí, sản phẩm và pháp lý hiển thị công khai cần được khách hàng đối chiếu trực tiếp trước khi giao dịch. Liên hệ GiaHuy Land để nhận thông tin từng lô đang mở bán.',
      category: 'brand', homeSlot: 'hero', displayOrder: 10,
    },
    {
      slug: 'vi-sao-nhieu-nguoi-ngan-ngai-xuong-tien',
      title: 'Vì sao nhiều người ngần ngại xuống tiền',
      eyebrow: 'Phân tích thị trường · Câu hỏi cần kiểm tra',
      excerpt: 'Nỗi sợ lớn nhất khi mua đất không phải là giá — mà là không biết mình đang mua gì.',
      body: 'Các mối bận tâm thường gặp gồm: quy hoạch treo hoặc mục đích sử dụng đất chưa rõ; giá chênh qua nhiều lớp môi giới; sổ chung, chưa tách thửa hoặc tranh chấp ranh giới; và hiện trạng khó kiểm chứng khi đầu tư xa. Trước khi đặt cọc, khách hàng nên yêu cầu kiểm tra quy hoạch, hiện trạng, ranh giới và giấy tờ gốc từ nguồn có thẩm quyền. GiaHuy Land hỗ trợ cung cấp thông tin công khai và sắp xếp khảo sát thực địa theo nhu cầu.',
      category: 'insight', homeSlot: 'pain-points', displayOrder: 20,
    },
    {
      slug: 'loi-the-dat-nen-ha-an',
      title: 'Lợi thế đất nền Hà An',
      eyebrow: 'Hà An · Góc nhìn khu vực',
      excerpt: 'Hà An nằm trong hành lang kết nối Hạ Long – Hải Phòng – Hà Nội; nhà đầu tư nên đối chiếu thông tin hạ tầng và quy hoạch trước từng quyết định.',
      body: 'Việc đánh giá bất động sản Hà An cần dựa trên hồ sơ của từng lô, khả năng tiếp cận hạ tầng, quy hoạch đã được công bố và nhu cầu sử dụng thực tế. Các thông tin như thời gian di chuyển, quy hoạch đô thị, nhu cầu chuyên gia hoặc kỳ vọng giá chỉ mang tính tham khảo; không phải cam kết đầu tư. GiaHuy Land cung cấp thông tin lô đất và hỗ trợ khách kiểm tra thực địa trước khi giao dịch.',
      category: 'advantage', homeSlot: 'advantages', displayOrder: 30,
    },
  ];
})();
