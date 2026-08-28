(function () {
  'use strict';

  var container = document.getElementById('map-listings');
  if (!container) return;

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function detailHref(product) {
    var slug = String(product.slug || product.id || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return './chi-tiet.html?slug=' + encodeURIComponent(slug);
  }

  function mapHref(product) {
    var query = String(product.mapQuery || product.location || 'Hà An, Quảng Ninh').trim();
    return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(query);
  }

  function card(product) {
    var title = escapeHtml(product.name || 'Bất động sản');
    var location = escapeHtml(product.mapQuery || product.location || 'Hà An, Quảng Ninh');
    return '<article class="rounded-2xl bg-cream p-5 ring-1 ring-ink/10 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-ink/8">' +
      '<div class="flex items-start justify-between gap-4">' +
        '<div><p class="text-xs font-bold uppercase tracking-[0.14em] text-clay">Vị trí tin đăng</p><h3 class="mt-2 font-display text-xl leading-snug text-ink">' + title + '</h3></div>' +
        '<span class="shrink-0 rounded-full bg-forest/8 px-3 py-1 text-xs font-bold text-forest">Đang bán</span>' +
      '</div>' +
      '<p class="mt-4 flex gap-2 text-sm leading-6 text-ink/65"><span aria-hidden="true">⌖</span><span>' + location + '</span></p>' +
      '<div class="mt-5 flex flex-wrap gap-2"><a href="' + detailHref(product) + '" class="inline-flex items-center gap-2 rounded-full bg-forest px-4 py-2.5 text-xs font-bold text-cream transition hover:bg-ink">Mở hồ sơ <span aria-hidden="true">→</span></a><a href="' + mapHref(product) + '" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2.5 text-xs font-bold text-forest transition hover:border-forest hover:bg-forest/5">Mở Google Maps <span aria-hidden="true">↗</span></a></div>' +
    '</article>';
  }

  async function render() {
    var products = [];
    if (typeof window.fetchProductsFromSupabase === 'function') {
      products = await window.fetchProductsFromSupabase();
    }
    if (!products.length) products = window.GIAHUY_PRODUCTS || [];
    if (!products.length) {
      container.innerHTML = '<p class="rounded-2xl bg-sand p-6 text-sm text-ink/60">Chưa có tin đăng để hiển thị trên bản đồ.</p>';
      return;
    }
    container.innerHTML = products.map(card).join('');
  }

  render().catch(function () {
    var products = window.GIAHUY_PRODUCTS || [];
    container.innerHTML = products.length ? products.map(card).join('') : '<p class="rounded-2xl bg-sand p-6 text-sm text-ink/60">Chưa có tin đăng để hiển thị trên bản đồ.</p>';
  });
})();
