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
          '<a href="https://zalo.me/0854141414" target="_blank" rel="noopener noreferrer" title="Liên hệ qua Zalo" class="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-gray-100">' +
            '<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" aria-hidden="true"><path fill="#2962ff" d="M15,36V6.827l-1.211-0.811C8.64,8.083,5,13.112,5,19v10c0,7.732,6.268,14,14,14h10	c4.722,0,8.883-2.348,11.417-5.931V36H15z"/><path fill="#2962ff" d="M29,5H19c-1.845,0-3.601,0.366-5.214,1.014C10.453,9.25,8,14.528,8,19	c0,6.771,0.936,10.735,3.712,14.607c0.216,0.301,0.357,0.653,0.376,1.022c0.043,0.835-0.129,2.365-1.634,3.742	c-0.162,0.148-0.059,0.419,0.16,0.428c0.942,0.041,2.843-0.014,4.797-0.877c0.557-0.246,1.191-0.203,1.729,0.083	C20.453,39.764,24.333,40,28,40c4.676,0,9.339-1.04,12.417-2.916C42.038,34.799,43,32.014,43,29V19C43,11.268,36.732,5,29,5z"/><path fill="#2962ff" d="M36.75,27C34.683,27,33,25.317,33,23.25s1.683-3.75,3.75-3.75s3.75,1.683,3.75,3.75	S38.817,27,36.75,27z M36.75,21c-1.24,0-2.25,1.01-2.25,2.25s1.01,2.25,2.25,2.25S39,24.49,39,23.25S37.99,21,36.75,21z"/><path fill="#2962ff" d="M31.5,27h-1c-0.276,0-0.5-0.224-0.5-0.5V18h1.5V27z"/><path fill="#2962ff" d="M27,19.75v0.519c-0.629-0.476-1.403-0.769-2.25-0.769c-2.067,0-3.75,1.683-3.75,3.75	S22.683,27,24.75,27c0.847,0,1.621-0.293,2.25-0.769V26.5c0,0.276,0.224,0.5,0.5,0.5h1v-7.25H27z M24.75,25.5	c-1.24,0-2.25-1.01-2.25-2.25S23.51,21,24.75,21S27,22.01,27,23.25S25.99,25.5,24.75,25.5z"/><path fill="#2962ff" d="M21.25,18h-8v1.5h5.321L13,26h0.026c-0.163,0.211-0.276,0.463-0.276,0.75V27h7.5	c0.276,0,0.5-0.224,0.5-0.5v-1h-5.321L21,19h-0.026c0.163-0.211,0.276-0.463,0.276-0.75V18z"/></svg>' +
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
