/**
 * GiaHuy Land — public navigation shell.
 * Navigation is intentionally listing-first: BĐS đang bán is the primary conversion path.
 */
(function () {
  'use strict';

  var items = [
    { key: 'home', label: 'Trang chủ', href: './' },
    { key: 'listings', label: 'BĐS đang bán', href: './bds-dang-ban.html' },
    { key: 'map', label: 'Bản đồ', href: './ban-do.html' },
    { key: 'ha-an', label: 'Hà An', href: './ha-an.html' },
    { key: 'ha-long-xanh', label: 'Hạ Long Xanh', href: './ha-long-xanh.html' },
    { key: 'insights', label: 'Phân tích thị trường', href: './phan-tich-thi-truong.html' },
    { key: 'contact', label: 'Liên hệ', href: './lien-he.html' },
  ];

  function currentKey() {
    var page = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
    if (page === 'index.html' || page === '') return 'home';
    if (page === 'chi-tiet.html') return 'listings';
    if (page === 'bai-viet.html' || page === 'phan-tich-thi-truong.html') return 'insights';
    if (page === 'bds-dang-ban.html') return 'listings';
    if (page === 'ban-do.html') return 'map';
    if (page === 'ha-an.html') return 'ha-an';
    if (page === 'ha-long-xanh.html') return 'ha-long-xanh';
    if (page === 'lien-he.html' || page === 'cam-on.html') return 'contact';
    return '';
  }

  function logoMarkup() {
    return '<a href="./" class="flex shrink-0 items-center gap-2.5 font-display text-xl font-semibold tracking-tight text-forest" aria-label="Về trang chủ GiaHuy Land">' +
      '<svg class="h-9 w-9" viewBox="0 0 64 64" aria-hidden="true"><path d="M8 8h36l12 12v36H8z" fill="#1E3B2E"/><path d="M8 8h36l12 12H8z" fill="#2F5843"/><text x="32" y="42" font-family="Georgia, serif" font-size="26" font-weight="600" fill="#F6F1E6" text-anchor="middle">GH</text></svg>' +
      '<span>GiaHuy Land</span></a>';
  }

  function linkMarkup(item, mobile) {
    var active = currentKey() === item.key;
    var base = mobile
      ? 'block rounded-xl px-3 py-3 text-sm font-semibold transition hover:bg-forest/8 hover:text-forest'
      : 'rounded-full px-2.5 py-2 text-[12px] font-semibold transition hover:text-clay lg:px-3 lg:text-[13px]';
    var activeClass = active
      ? (mobile ? ' bg-forest text-cream hover:bg-forest hover:text-cream' : ' bg-forest text-cream hover:bg-forest hover:text-cream')
      : ' text-ink/70';
    var current = active ? ' aria-current="page"' : '';
    return '<a href="' + item.href + '" class="' + base + activeClass + '"' + current + '>' + item.label + '</a>';
  }

  function bindMobileMenu() {
    var toggle = document.getElementById('nav-toggle');
    var menu = document.getElementById('mobile-menu');
    if (!toggle || !menu) return;
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('flex');
      menu.classList.toggle('hidden', !open);
      toggle.setAttribute('aria-expanded', String(open));
    });
    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        menu.classList.add('hidden');
        menu.classList.remove('flex');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  function render() {
    var header = document.getElementById('site-header');
    if (!header) return;

    header.className = 'fixed top-0 inset-x-0 z-50 border-b border-ink/8 bg-cream/92 backdrop-blur transition-shadow duration-300';
    header.innerHTML =
      '<div class="mx-auto flex min-h-[4.5rem] max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">' +
        logoMarkup() +
        '<nav class="hidden items-center gap-0.5 lg:flex" aria-label="Điều hướng chính">' + items.map(function (item) { return linkMarkup(item, false); }).join('') + '</nav>' +
        '<div class="flex items-center gap-2">' +
          '<a href="./bds-dang-ban.html" class="hidden rounded-full bg-clay px-4 py-2.5 text-xs font-bold text-cream shadow-sm transition hover:-translate-y-0.5 hover:bg-ink sm:inline-flex">Xem BĐS</a>' +
          '<button id="nav-toggle" type="button" aria-expanded="false" aria-controls="mobile-menu" aria-label="Mở menu điều hướng" class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-ink/5 text-ink transition hover:bg-forest/10 lg:hidden">' +
            '<svg class="h-5 w-5" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>' +
          '</button>' +
        '</div>' +
      '</div>' +
      '<div id="mobile-menu" class="hidden border-t border-ink/8 bg-cream px-5 pb-5 pt-3 shadow-sm lg:hidden" aria-label="Điều hướng di động">' +
        '<div class="grid gap-1">' + items.map(function (item) { return linkMarkup(item, true); }).join('') + '</div>' +
        '<a href="./bds-dang-ban.html" class="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-clay px-4 py-3 text-sm font-bold text-cream">Xem BĐS đang bán</a>' +
      '</div>';
    bindMobileMenu();
  }

  render();
})();
