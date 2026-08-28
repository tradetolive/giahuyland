/**
 * GiaHuy Land — shared public footer.
 */
(function () {
  'use strict';

  var footer = document.getElementById('site-footer');
  if (!footer) return;

  footer.className = 'bg-ink text-cream/70';
  footer.innerHTML =
    '<div class="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.3fr_0.8fr_1fr]">' +
      '<div>' +
        '<p class="font-display text-2xl text-cream">GiaHuy Land</p>' +
        '<p class="mt-4 max-w-sm text-sm leading-6">Giúp bạn nhìn rõ vị trí, pháp lý và tiềm năng sử dụng trước khi quyết định một bất động sản tại Hà An và Hạ Long Xanh.</p>' +
      '</div>' +
      '<div>' +
        '<p class="font-semibold text-cream">Khám phá</p>' +
        '<nav class="mt-4 grid gap-2 text-sm" aria-label="Liên kết cuối trang">' +
          '<a href="./bds-dang-ban.html" class="transition hover:text-clay-light">BĐS đang bán</a>' +
          '<a href="./ban-do.html" class="transition hover:text-clay-light">Bản đồ</a>' +
          '<a href="./ha-an.html" class="transition hover:text-clay-light">Hà An</a>' +
          '<a href="./ha-long-xanh.html" class="transition hover:text-clay-light">Hạ Long Xanh</a>' +
          '<a href="./phan-tich-thi-truong.html" class="transition hover:text-clay-light">Phân tích thị trường</a>' +
        '</nav>' +
      '</div>' +
      '<div>' +
        '<p class="font-semibold text-cream">Liên hệ trực tiếp</p>' +
        '<div class="mt-4 grid gap-2 text-sm">' +
          '<a href="tel:+84854141414" class="transition hover:text-clay-light">0854 141414</a>' +
          '<a href="mailto:tatylic@gmail.com" class="transition hover:text-clay-light">tatylic@gmail.com</a>' +
          '<span>Khu 1, Phường Hà An, Thành phố Quảng Ninh</span>' +
        '</div>' +
        '<div class="mt-5 flex gap-2">' +
          '<a href="https://zalo.me/0854141414" target="_blank" rel="noopener noreferrer" class="inline-flex items-center rounded-lg bg-white px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-gray-100">Zalo</a>' +
          '<a href="https://m.me/anhladenhoi" target="_blank" rel="noopener noreferrer" class="inline-flex items-center rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700">Messenger</a>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="border-t border-cream/10 py-5">' +
      '<p class="mx-auto max-w-7xl px-5 text-xs text-cream/45 sm:px-8">© <span id="current-year">2026</span> GiaHuy Land. Thông tin mang tính tham khảo; vui lòng xác nhận trực tiếp trước khi giao dịch.</p>' +
    '</div>';

  var year = document.getElementById('current-year');
  if (year) year.textContent = new Date().getFullYear();
})();
