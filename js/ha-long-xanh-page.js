(function () {
  'use strict';

  var container = document.getElementById('ha-long-xanh-posts');
  if (!container) return;

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function postHref(post) {
    return './bai-viet.html?slug=' + encodeURIComponent(String(post.slug || ''));
  }

  function card(post, index) {
    return '<article class="rounded-3xl bg-cream p-6 text-ink ring-1 ring-cream/15 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-ink/10 sm:p-7">' +
      '<p class="text-xs font-bold uppercase tracking-[0.14em] text-clay">0' + (index + 1) + ' · Hạ Long Xanh</p>' +
      '<h3 class="mt-4 font-display text-2xl leading-tight">' + escapeHtml(post.title || 'Góc nhìn Hạ Long Xanh') + '</h3>' +
      '<p class="mt-4 text-sm leading-6 text-ink/65">' + escapeHtml(post.excerpt || 'Nội dung đang được cập nhật.') + '</p>' +
      '<a href="' + postHref(post) + '" class="mt-6 inline-flex items-center gap-2 text-sm font-bold text-forest transition hover:text-clay">Đọc bài viết <span aria-hidden="true">→</span></a>' +
    '</article>';
  }

  function isHaLongXanhPost(post) {
    return post.navigationSection === 'ha-long-xanh';
  }

  function emptyState() {
    return '<p class="rounded-2xl bg-cream/8 p-6 text-sm text-cream/60 ring-1 ring-cream/12">Chưa có bài viết riêng cho Hạ Long Xanh. Nội dung sẽ được cập nhật tại đây.</p>';
  }

  async function render() {
    var posts = typeof window.fetchContentPostsFromSupabase === 'function'
      ? await window.fetchContentPostsFromSupabase()
      : null;
    if (posts === null) posts = window.GIAHUY_EDITORIAL_FALLBACK || [];
    posts = posts.filter(isHaLongXanhPost).sort(function (a, b) { return Number(a.displayOrder || 0) - Number(b.displayOrder || 0); });
    container.innerHTML = posts.length ? posts.slice(0, 6).map(card).join('') : emptyState();
  }

  render().catch(function () { container.innerHTML = emptyState(); });
})();
