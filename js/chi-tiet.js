/**
 * GiaHuy Land — trang chi tiết theo slug, ưu tiên dữ liệu listing đã xuất bản.
 * Giao diện duy trì ngôn ngữ địa chính xanh rừng–đất nung và không render tài liệu private.
 */
(function () {
  'use strict';

  var number = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 });

  function setText(id, value) {
    var element = document.getElementById(id);
    if (element) element.textContent = value || '';
  }

  function detailUrl(slug) {
    return typeof window.getListingDetailUrl === 'function'
      ? window.getListingDetailUrl(slug)
      : window.location.href;
  }

  function getSlug() {
    var slug = new URLSearchParams(window.location.search).get('slug') || '';
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ? slug : '';
  }

  function showNotFound(message) {
    setText('detail-error-message', message);
    document.getElementById('detail-loading').classList.add('hidden');
    document.getElementById('detail-not-found').classList.remove('hidden');
  }

  function addFact(label, value) {
    var list = document.getElementById('detail-facts');
    var item = document.createElement('div');
    item.className = 'rounded-2xl bg-cream/10 p-4';
    var term = document.createElement('dt');
    term.className = 'text-xs uppercase tracking-wider text-cream/55';
    term.textContent = label;
    var description = document.createElement('dd');
    description.className = 'mt-1 font-display text-xl text-cream';
    description.textContent = value || 'Chưa cập nhật';
    item.append(term, description);
    list.appendChild(item);
  }

  function renderGallery(listing) {
    var gallery = document.getElementById('detail-gallery');
    var urls = [listing.image].concat(Array.isArray(listing.gallery) ? listing.gallery : [])
      .filter(Boolean)
      .filter(function (url, index, values) { return values.indexOf(url) === index; });

    if (!urls.length) {
      gallery.classList.add('hidden');
      return;
    }

    urls.forEach(function (url, index) {
      var image = document.createElement('img');
      image.src = url;
      image.alt = (listing.name || 'Bất động sản') + ' — ảnh ' + (index + 1);
      image.loading = index === 0 ? 'eager' : 'lazy';
      image.className = index === 0
        ? 'min-h-[20rem] w-full rounded-3xl object-cover shadow-xl shadow-ink/15 sm:col-span-2'
        : 'min-h-48 w-full rounded-3xl object-cover shadow-xl shadow-ink/10';
      gallery.appendChild(image);
    });
  }

  function renderMap(listing) {
    var section = document.getElementById('detail-map-section');
    var map = document.getElementById('detail-map');
    var link = document.getElementById('detail-map-link');
    var location = String(listing.mapQuery || listing.location || '').trim();
    if (!section || !map || !link || !location) return;

    var query = encodeURIComponent(location);
    map.src = 'https://www.google.com/maps?q=' + query + '&output=embed&z=16';
    map.title = 'Bản đồ Google Maps — ' + (listing.name || 'vị trí bất động sản');
    link.href = 'https://www.google.com/maps/search/?api=1&query=' + query;
    setText('detail-map-location', location);
    section.classList.remove('hidden');
  }

  function updateMetadata(listing, url) {
    document.title = listing.name + ' | GiaHuy Land';
    var description = (listing.highlight || 'Thông tin bất động sản tại Hà An, Quảng Ninh.').slice(0, 155);
    document.querySelector('meta[name="description"]').setAttribute('content', description);
    document.querySelector('meta[name="robots"]').setAttribute('content', 'index, follow');
    document.querySelector('link[rel="canonical"]').setAttribute('href', url);
    document.querySelector('meta[property="og:title"]').setAttribute('content', listing.name + ' | GiaHuy Land');
    document.querySelector('meta[property="og:description"]').setAttribute('content', description);
    document.querySelector('meta[property="og:url"]').setAttribute('content', url);
    if (listing.image) document.querySelector('meta[property="og:image"]').setAttribute('content', listing.image);
  }

  async function init() {
    var slug = getSlug();
    if (!slug || typeof window.fetchListingBySlug !== 'function') {
      showNotFound('Liên kết bất động sản không hợp lệ hoặc đã hết hiệu lực.');
      return;
    }

    var listing = await window.fetchListingBySlug(slug);
    if (!listing) {
      showNotFound('Bất động sản này không tồn tại, chưa được xuất bản hoặc đã được gỡ khỏi danh sách.');
      return;
    }

    var url = detailUrl(listing.slug || slug);
    var price = Number.isFinite(Number(listing.price)) ? number.format(Number(listing.price)) + ' tỷ VNĐ' : 'Liên hệ';
    setText('detail-type', listing.propertyType || 'Bất động sản');
    setText('detail-title', listing.name);
    setText('detail-location', listing.location || 'Hà An, Quảng Ninh');
    setText('detail-price', price);
    setText('detail-summary', listing.highlight || 'Vui lòng liên hệ để nhận thông tin cập nhật về bất động sản này.');
    setText('detail-legal', listing.legal || 'Liên hệ để đối chiếu hồ sơ và thông tin pháp lý.');
    addFact('Diện tích', Number.isFinite(Number(listing.area)) ? number.format(Number(listing.area)) + ' m²' : 'Liên hệ');
    addFact('Mặt tiền', Number(listing.frontage) > 0 ? number.format(Number(listing.frontage)) + ' m' : 'Chưa cập nhật');
    addFact('Hướng', listing.direction || 'Chưa cập nhật');
    addFact('Loại hình', listing.propertyType || 'Đất nền');
    renderGallery(listing);
    renderMap(listing);

    ['detail-zalo', 'detail-messenger', 'detail-copy-link'].forEach(function (id) {
      var action = document.getElementById(id);
      action.setAttribute('data-listing-title', listing.name || 'bất động sản này');
      action.setAttribute('data-listing-url', url);
    });

    updateMetadata(listing, url);
    document.getElementById('detail-loading').classList.add('hidden');
    document.getElementById('listing-detail').classList.remove('hidden');
  }

  document.addEventListener('DOMContentLoaded', init);
})();
