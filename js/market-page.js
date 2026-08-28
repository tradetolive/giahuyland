(function () {
  'use strict';

  var container = document.getElementById('market-posts');
  if (!container) return;

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function postHref(post) {
    var slug = String(post.slug || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    return './bai-viet.html?slug=' + encodeURIComponent(slug);
  }

  function card(post, index) {
    var eyebrow = escapeHtml(post.eyebrow || post.category || 'Phân tích');
    var title = escapeHtml(post.title || 'Góc nhìn thị trường');
    var excerpt = escapeHtml(post.excerpt || 'Nội dung đang được cập nhật.');
    return '<article class="rounded-3xl bg-cream p-6 text-ink ring-1 ring-cream/15 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-ink/10 sm:p-7">' +
      '<p class="text-xs font-bold uppercase tracking-[0.14em] text-clay">0' + (index + 1) + ' · ' + eyebrow + '</p>' +
      '<h3 class="mt-4 font-display text-2xl leading-tight">' + title + '</h3>' +
      '<p class="mt-4 text-sm leading-6 text-ink/65">' + excerpt + '</p>' +
      '<a href="' + postHref(post) + '" class="mt-6 inline-flex items-center gap-2 text-sm font-bold text-forest transition hover:text-clay">Đọc bài viết <span aria-hidden="true">→</span></a>' +
    '</article>';
  }

  async function render() {
    var posts = typeof window.fetchContentPostsFromSupabase === 'function'
      ? await window.fetchContentPostsFromSupabase()
      : null;
    if (posts === null || !posts.length) {
      posts = (window.GIAHUY_EDITORIAL_FALLBACK || []).slice().sort(function (a, b) { return Number(a.displayOrder || 0) - Number(b.displayOrder || 0); });
    }
    if (!posts.length) {
      container.innerHTML = '<p class="rounded-2xl bg-cream/8 p-6 text-sm text-cream/60 ring-1 ring-cream/12">Chưa có bài viết được xuất bản.</p>';
      return;
    }
    container.innerHTML = posts.slice(0, 6).map(card).join('');
  }

  render().catch(function () {
    var fallback = window.GIAHUY_EDITORIAL_FALLBACK || [];
    container.innerHTML = fallback.length ? fallback.map(card).join('') : '<p class="rounded-2xl bg-cream/8 p-6 text-sm text-cream/60 ring-1 ring-cream/12">Chưa có bài viết được xuất bản.</p>';
  });
})();
