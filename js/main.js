/**
 * GiaHuy Land — front-end behavior.
 * Renders listings from the in-memory GIAHUY_PRODUCTS data set, wires up
 * navigation, scroll reveals, price filtering, and the Netlify Forms AJAX
 * submission for the lead-capture form.
 */
(function () {
  'use strict';

  var money = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 });

  function accentClasses(accent) {
    var map = {
      forest: { chip: 'bg-forest text-cream', ring: 'ring-forest/30', stroke: '#1E3B2E', fill: '#2F5843' },
      clay: { chip: 'bg-clay text-cream', ring: 'ring-clay/30', stroke: '#C1592E', fill: '#E8A57D' },
      gold: { chip: 'bg-gold text-ink', ring: 'ring-gold/40', stroke: '#9C7A2E', fill: '#C89B3C' },
    };
    return map[accent] || map.forest;
  }

  function parcelSvg(product) {
    var a = accentClasses(product.accent);
    var w = 220;
    var h = 150;
    var ratio = Math.min(2.2, Math.max(0.7, product.area / (product.frontage * product.frontage)));
    var depth = Math.round((w - 40) * Math.min(1, ratio / 1.4));
    return (
      '<svg viewBox="0 0 ' + w + ' ' + h + '" class="w-full h-32" role="img" aria-label="Sơ đồ lô đất ' + product.id + '">' +
      '<defs><pattern id="grid-' + product.id + '" width="14" height="14" patternUnits="userSpaceOnUse">' +
      '<path d="M0 0H14V14" fill="none" stroke="' + a.stroke + '" stroke-opacity="0.12" stroke-width="1"/></pattern></defs>' +
      '<rect width="' + w + '" height="' + h + '" fill="url(#grid-' + product.id + ')"/>' +
      '<polygon points="20,20 ' + (20 + depth) + ',26 ' + (20 + depth) + ',124 20,130" fill="' + a.fill + '" fill-opacity="0.35" stroke="' + a.stroke + '" stroke-width="2.5" stroke-linejoin="round"/>' +
      '<text x="20" y="16" font-family="Arial, sans-serif" font-size="11" fill="' + a.stroke + '" font-weight="700">LÔ ' + product.id + '</text>' +
      '<text x="' + (26 + depth / 2) + '" y="78" font-family="Arial, sans-serif" font-size="10" fill="' + a.stroke + '" text-anchor="middle">' + product.area.toFixed(1) + ' m²</text>' +
      '<text x="20" y="142" font-family="Arial, sans-serif" font-size="9" fill="' + a.stroke + '" opacity="0.75">MT ' + product.frontage + 'm</text>' +
      '</svg>'
    );
  }

  function productCard(product) {
    var a = accentClasses(product.accent);
    return (
      '<article class="reveal group rounded-2xl bg-sand ring-1 ' + a.ring + ' p-5 flex flex-col gap-4 transition duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-ink/10" data-price="' + product.price + '">' +
        '<div class="rounded-xl bg-cream/70 p-3">' + parcelSvg(product) + '</div>' +
        '<div class="flex items-start justify-between gap-3">' +
          '<h3 class="font-display text-lg leading-snug text-ink">' + product.name + '</h3>' +
          '<span class="shrink-0 rounded-full px-3 py-1 text-xs font-semibold ' + a.chip + '">' + product.price.toFixed(2) + ' tỷ</span>' +
        '</div>' +
        '<dl class="grid grid-cols-2 gap-y-1.5 text-sm text-ink/70">' +
          '<dt class="text-ink/45">Diện tích</dt><dd>' + money.format(product.area) + ' m²</dd>' +
          '<dt class="text-ink/45">Mặt tiền</dt><dd>' + product.frontage + ' m</dd>' +
          '<dt class="text-ink/45">Hướng</dt><dd>' + product.direction + '</dd>' +
          '<dt class="text-ink/45">Pháp lý</dt><dd>' + product.legal + '</dd>' +
        '</dl>' +
        '<p class="text-sm text-ink/60 italic">' + product.highlight + '</p>' +
        '<a href="#bao-gia" data-plot="' + product.id + '" class="plot-cta mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-cream transition hover:bg-forest">' +
          'Nhận tư vấn lô này' +
          '<svg class="h-4 w-4" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        '</a>' +
        '<div class="flex gap-2 mt-2">' +
          '<a href="https://zalo.me/0854141414" target="_blank" rel="noopener noreferrer" title="Liên hệ qua Zalo" class="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-600">' +
            '<svg class="h-4 w-4" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M22.782 0.166016H27.199C33.2653 0.166016 36.8103 1.05701 39.9572 2.74421C43.1041 4.4314 45.5875 6.89585 47.2557 10.0428C48.9429 13.1897 49.8339 16.7347 49.8339 22.801V27.1991C49.8339 33.2654 48.9429 36.8104 47.2557 39.9573C45.5685 43.1042 43.1041 45.5877 39.9572 47.2559C36.8103 48.9431 33.2653 49.8341 27.199 49.8341H22.8009C16.7346 49.8341 13.1896 48.9431 10.0427 47.2559C6.89583 45.5687 4.41243 43.1042 2.7442 39.9573C1.057 36.8104 0.166016 33.2654 0.166016 27.1991V22.801C0.166016 16.7347 1.057 13.1897 2.7442 10.0428C4.43139 6.89585 6.89583 4.41245 10.0427 2.74421C13.1707 1.05701 16.7346 0.166016 22.782 0.166016Z" fill="currentColor"/><path fill-rule="evenodd" clip-rule="evenodd" d="M7.779 43.5892C10.1019 43.846 13.0061 43.1836 15.0682 42.1825C24.0225 47.1318 38.0197 46.8954 46.4923 41.4732C46.8209 40.9803 47.1279 40.4677 47.4128 39.9363C49.1062 36.7779 50.0004 33.22 50.0004 27.1316V22.7175C50.0004 16.629 49.1062 13.0711 47.4128 9.91273C45.7385 6.75436 43.2461 4.28093 40.0877 2.58758C36.9293 0.894239 33.3714 0 27.283 0H22.8499C17.6644 0 14.2982 0.652754 11.4699 1.89893C11.3153 2.03737 11.1636 2.17818 11.0151 2.32135C2.71734 10.3203 2.08658 27.6593 9.12279 37.0782C9.13064 37.0921 9.13933 37.1061 9.14889 37.1203C10.2334 38.7185 9.18694 41.5154 7.55068 43.1516C7.28431 43.399 7.37944 43.5512 7.779 43.5892Z" fill="white"/><path d="M20.5632 17H10.8382V19.0853H17.5869L10.9329 27.3317C10.7244 27.635 10.5728 27.9194 10.5728 28.5639V29.0947H19.748C20.203 29.0947 20.5822 28.7156 20.5822 28.2606V27.1421H13.4922L19.748 19.2938C19.8428 19.1801 20.0134 18.9716 20.0893 18.8768L20.1272 18.8199C20.4874 18.2891 20.5632 17.8341 20.5632 17.2844V17Z" fill="white"/><path d="M32.9416 29.0947H34.3255V17H32.2402V28.3933C32.2402 28.7725 32.5435 29.0947 32.9416 29.0947Z" fill="white"/><path d="M25.814 19.6924C23.1979 19.6924 21.0747 21.8156 21.0747 24.4317C21.0747 27.0478 23.1979 29.171 25.814 29.171C28.4301 29.171 30.5533 27.0478 30.5533 24.4317C30.5723 21.8156 28.4491 19.6924 25.814 19.6924ZM25.814 27.2184C24.2785 27.2184 23.0273 25.9672 23.0273 24.4317C23.0273 22.8962 24.2785 21.645 25.814 21.645C27.3495 21.645 28.6007 22.8962 28.6007 24.4317C28.6007 25.9672 27.3685 27.2184 25.814 27.2184Z" fill="white"/><path d="M40.4867 19.6162C37.8516 19.6162 35.7095 21.7584 35.7095 24.3934C35.7095 27.0285 37.8516 29.1707 40.4867 29.1707C43.1217 29.1707 45.2639 27.0285 45.2639 24.3934C45.2639 21.7584 43.1217 19.6162 40.4867 19.6162ZM40.4867 27.2181C38.9322 27.2181 37.681 25.9669 37.681 24.4124C37.681 22.8579 38.9322 21.6067 40.4867 21.6067C42.0412 21.6067 43.2924 22.8579 43.2924 24.4124C43.2924 25.9669 42.0412 27.2181 40.4867 27.2181Z" fill="white"/><path d="M29.4562 29.0944H30.5747V19.957H28.6221V28.2793C28.6221 28.7153 29.0012 29.0944 29.4562 29.0944Z" fill="white"/></svg>' +
            'Zalo' +
          '</a>' +
          '<a href="https://m.me/anhladenhoi" target="_blank" rel="noopener noreferrer" title="Liên hệ qua Messenger" class="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700">' +
            '<i class="fab fa-facebook-messenger text-sm" aria-hidden="true"></i>' +
            'Messenger' +
          '</a>' +
        '</div>' +
      '</article>'
    );
  }

  function renderProducts(filter) {
    var grid = document.getElementById('products-grid');
    if (!grid) return;
    var list = GIAHUY_PRODUCTS.filter(function (p) {
      if (filter === 'under2') return p.price < 2;
      if (filter === '2to3') return p.price >= 2 && p.price <= 3;
      if (filter === 'over3') return p.price > 3;
      return true;
    });
    grid.innerHTML = list.map(productCard).join('');
    if (!list.length) {
      grid.innerHTML = '<p class="col-span-full text-center text-ink/60 py-10">Không có lô đất phù hợp bộ lọc này — thử chọn mức giá khác.</p>';
    }
    observeReveals();
  }

  function populatePlotSelect() {
    var select = document.getElementById('lo_dat_quan_tam');
    if (!select) return;
    GIAHUY_PRODUCTS.forEach(function (p) {
      var opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.name + ' — ' + p.price.toFixed(2) + ' tỷ';
      select.appendChild(opt);
    });
    var opt = document.createElement('option');
    opt.value = 'chua-ro';
    opt.textContent = 'Chưa chọn, cần tư vấn thêm';
    select.appendChild(opt);
  }

  function initFilters() {
    var buttons = document.querySelectorAll('[data-filter]');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        buttons.forEach(function (b) {
          b.classList.remove('bg-ink', 'text-cream');
          b.classList.add('bg-cream', 'text-ink/70');
        });
        btn.classList.add('bg-ink', 'text-cream');
        btn.classList.remove('bg-cream', 'text-ink/70');
        renderProducts(btn.getAttribute('data-filter'));
      });
    });
  }

  function initPlotLinks() {
    document.addEventListener('click', function (e) {
      var link = e.target.closest('.plot-cta');
      if (!link) return;
      var select = document.getElementById('lo_dat_quan_tam');
      if (select) select.value = link.getAttribute('data-plot');
    });
  }

  function initNav() {
    var header = document.getElementById('site-header');
    var toggle = document.getElementById('nav-toggle');
    var mobileMenu = document.getElementById('mobile-menu');

    window.addEventListener('scroll', function () {
      if (window.scrollY > 24) {
        header.classList.add('bg-cream/95', 'shadow-sm', 'backdrop-blur');
        header.classList.remove('bg-transparent');
      } else {
        header.classList.remove('bg-cream/95', 'shadow-sm', 'backdrop-blur');
        header.classList.add('bg-transparent');
      }
    });

    if (toggle && mobileMenu) {
      toggle.addEventListener('click', function () {
        var isOpen = mobileMenu.classList.toggle('flex');
        mobileMenu.classList.toggle('hidden', !isOpen);
        toggle.setAttribute('aria-expanded', String(isOpen));
      });
      mobileMenu.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          mobileMenu.classList.add('hidden');
          mobileMenu.classList.remove('flex');
          toggle.setAttribute('aria-expanded', 'false');
        });
      });
    }
  }

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var id = link.getAttribute('href');
        if (id.length < 2) return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        var headerHeight = document.getElementById('site-header').offsetHeight;
        var top = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 12;
        window.scrollTo({ top: top, behavior: 'smooth' });
      });
    });
  }

  function initCounters() {
    var counters = document.querySelectorAll('[data-count-to]');
    var seen = new WeakSet();
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || seen.has(entry.target)) return;
        seen.add(entry.target);
        var el = entry.target;
        var end = parseFloat(el.getAttribute('data-count-to'));
        var decimals = el.getAttribute('data-decimals') ? parseInt(el.getAttribute('data-decimals'), 10) : 0;
        var suffix = el.getAttribute('data-suffix') || '';
        var start = 0;
        var duration = 1200;
        var startTime = null;
        function step(timestamp) {
          if (!startTime) startTime = timestamp;
          var progress = Math.min(1, (timestamp - startTime) / duration);
          var eased = 1 - Math.pow(1 - progress, 3);
          var value = start + (end - start) * eased;
          el.textContent = value.toFixed(decimals) + suffix;
          if (progress < 1) window.requestAnimationFrame(step);
        }
        window.requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { observer.observe(el); });
  }

  function observeReveals() {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('.reveal:not(.is-visible)').forEach(function (el) {
      observer.observe(el);
    });
  }

  function initForm() {
    var form = document.getElementById('lead-form');
    if (!form) return;
    var status = document.getElementById('form-status');
    var submitBtn = document.getElementById('form-submit');
    var submitLabel = submitBtn.querySelector('.btn-label');
    var submitSpinner = submitBtn.querySelector('.btn-spinner');

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (form.querySelector('input[name="bot-field"]').value) {
        return;
      }

      var phone = form.querySelector('#so_dien_thoai').value.trim();
      if (!/^0\d{9,10}$/.test(phone)) {
        status.textContent = 'Số điện thoại chưa hợp lệ — vui lòng nhập số bắt đầu bằng 0, đủ 10–11 số.';
        status.className = 'mt-4 text-sm font-medium text-clay';
        form.querySelector('#so_dien_thoai').focus();
        return;
      }

      submitBtn.disabled = true;
      submitLabel.classList.add('opacity-0');
      submitSpinner.classList.remove('hidden');
      status.textContent = '';

      var formData = new FormData(form);
      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString(),
      })
        .then(function (response) {
          if (!response.ok) throw new Error('submit-failed');
          form.reset();
          status.textContent = 'Đã nhận thông tin — GiaHuy Land sẽ gọi lại trong vòng 30 phút làm việc.';
          status.className = 'mt-4 text-sm font-medium text-forest';
        })
        .catch(function () {
          status.textContent = 'Gửi chưa thành công, vui lòng thử lại hoặc gọi trực tiếp hotline 0888 456 789.';
          status.className = 'mt-4 text-sm font-medium text-clay';
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitLabel.classList.remove('opacity-0');
          submitSpinner.classList.add('hidden');
        });
    });
  }

  function initYear() {
    var el = document.getElementById('current-year');
    if (el) el.textContent = new Date().getFullYear();
  }

  document.addEventListener('DOMContentLoaded', function () {
    populatePlotSelect();
    renderProducts('all');
    initFilters();
    initPlotLinks();
    initNav();
    initSmoothScroll();
    initCounters();
    initForm();
    initYear();
    observeReveals();
  });
})();
