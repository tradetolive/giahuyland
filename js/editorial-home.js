/*
 * GiaHuy Land — nội dung biên tập trên trang chủ.
 * Thiết kế duy trì bố cục xanh rừng/đất nung, nhưng toàn bộ hero, điểm nghẽn
 * và lợi thế được nạp từ content_posts published thay vì viết cố định trong HTML.
 */
(function () {
  'use strict';

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function postUrl(post) {
    if (typeof window.getContentPostDetailUrl === 'function') return window.getContentPostDetailUrl(post);
    var url = new URL('bai-viet.html', window.location.href);
    url.searchParams.set('slug', post.slug || '');
    return url.href;
  }

  function linkHtml(post, variant) {
    var className = variant === 'light'
      ? 'inline-flex items-center gap-2 rounded-full border border-cream/30 px-5 py-3 text-sm font-semibold text-cream transition hover:border-clay-light hover:text-clay-light'
      : 'inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-cream transition hover:bg-forest';
    return '<a href="' + escapeHtml(postUrl(post)) + '" class="' + className + '">Đọc bài viết <span aria-hidden="true">→</span></a>';
  }

  function renderHero(post) {
    if (!post) return;
    var eyebrow = document.getElementById('editorial-hero-eyebrow');
    var title = document.getElementById('editorial-hero-title');
    var excerpt = document.getElementById('editorial-hero-excerpt');
    var link = document.getElementById('editorial-hero-read');
    if (eyebrow) eyebrow.textContent = post.eyebrow || 'Phường Hà An · Quảng Ninh';
    if (title) title.textContent = post.title || '';
    if (excerpt) excerpt.textContent = post.excerpt || '';
    if (link) link.href = postUrl(post);
  }

  function renderPainPoint(post) {
    var target = document.getElementById('editorial-pain-point');
    if (!target) return;
    if (!post) {
      target.innerHTML = '<p class="py-10 text-sm text-cream/70">Chuyên đề đang được cập nhật.</p>';
      return;
    }
    target.innerHTML = '<div class="max-w-2xl">' +
      '<p class="reveal text-xs font-semibold uppercase tracking-wider text-clay-light">' + escapeHtml(post.eyebrow || 'Chuyên đề') + '</p>' +
      '<h2 class="reveal reveal-delay-1 mt-4 font-display text-3xl sm:text-4xl text-cream leading-tight">' + escapeHtml(post.title) + '</h2>' +
      '<p class="reveal reveal-delay-2 mt-5 max-w-xl text-base leading-7 text-cream/70">' + escapeHtml(post.excerpt) + '</p>' +
      '<div class="reveal reveal-delay-3 mt-7">' + linkHtml(post, 'light') + '</div>' +
      '</div>';
  }

  function renderAdvantages(post) {
    var target = document.getElementById('editorial-advantages');
    if (!target) return;
    if (!post) {
      target.innerHTML = '<p class="py-10 text-sm text-ink/60">Bài viết đang được cập nhật.</p>';
      return;
    }
    target.innerHTML = '<article class="reveal grid gap-8 rounded-[2rem] bg-forest p-7 text-cream shadow-xl shadow-ink/10 md:grid-cols-[1.2fr_0.8fr] md:p-10">' +
      '<div><p class="text-xs font-semibold uppercase tracking-wider text-clay-light">' + escapeHtml(post.eyebrow || 'Góc nhìn khu vực') + '</p>' +
      '<h2 class="mt-4 font-display text-3xl leading-tight sm:text-4xl">' + escapeHtml(post.title) + '</h2>' +
      '<p class="mt-5 max-w-xl text-base leading-7 text-cream/75">' + escapeHtml(post.excerpt) + '</p></div>' +
      '<div class="flex flex-col justify-between rounded-2xl bg-cream/10 p-6 ring-1 ring-cream/10">' +
      '<p class="text-sm leading-6 text-cream/75">' + escapeHtml((post.body || '').slice(0, 260)) + (post.body && post.body.length > 260 ? '…' : '') + '</p>' +
      '<div class="mt-6">' + linkHtml(post, 'light') + '</div></div></article>';
  }

  function findSlot(posts, slot) {
    return posts.filter(function (post) { return post.homeSlot === slot; })
      .sort(function (left, right) { return Number(left.displayOrder || 0) - Number(right.displayOrder || 0); })[0] || null;
  }

  async function loadEditorialContent() {
    var posts = null;
    try {
      posts = await window.fetchContentPostsFromSupabase();
    } catch (error) {
      console.warn('Không thể tải bài viết biên tập; dùng nội dung dự phòng.', error);
    }
    if (!Array.isArray(posts)) posts = window.GIAHUY_EDITORIAL_FALLBACK || [];

    renderHero(findSlot(posts, 'hero'));
    renderPainPoint(findSlot(posts, 'pain-points'));
    renderAdvantages(findSlot(posts, 'advantages'));
  }

  document.addEventListener('DOMContentLoaded', loadEditorialContent);
})();
