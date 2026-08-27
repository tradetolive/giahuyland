/*
 * GiaHuy Land — chi tiết bài viết biên tập.
 * Luôn lọc content_posts published, escape nội dung text trước khi render và
 * không truy cập bảng draft, tài liệu private hoặc thông tin quản trị.
 */
(function () {
  'use strict';

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function showNotFound() {
    document.getElementById('article-loading').hidden = true;
    document.getElementById('article-content').classList.add('hidden');
    document.getElementById('article-not-found').classList.remove('hidden');
  }

  function updateMeta(post) {
    document.title = post.title + ' | GiaHuy Land';
    document.getElementById('article-description').setAttribute('content', post.excerpt || post.title);
    var canonical = typeof window.getContentPostDetailUrl === 'function'
      ? window.getContentPostDetailUrl(post)
      : window.location.href;
    document.getElementById('article-canonical').setAttribute('href', canonical);
  }

  function renderPost(post) {
    document.getElementById('article-loading').hidden = true;
    document.getElementById('article-not-found').classList.add('hidden');
    document.getElementById('article-content').classList.remove('hidden');
    document.getElementById('article-eyebrow').textContent = post.eyebrow || 'Bài viết GiaHuy Land';
    document.getElementById('article-title').textContent = post.title || '';
    document.getElementById('article-excerpt').textContent = post.excerpt || '';
    var cover = document.getElementById('article-cover');
    if (post.image && /^https:\/\//i.test(post.image)) {
      cover.src = post.image;
      cover.alt = 'Ảnh minh họa bài viết: ' + (post.title || 'GiaHuy Land');
      cover.classList.remove('hidden');
    }
    var paragraphs = String(post.body || '').split(/\n{2,}/).filter(Boolean);
    document.getElementById('article-body').innerHTML = paragraphs.map(function (paragraph) {
      return '<p>' + escapeHtml(paragraph.trim()) + '</p>';
    }).join('');
    updateMeta(post);
  }

  async function loadPost() {
    var slug = new URLSearchParams(window.location.search).get('slug') || '';
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return showNotFound();
    try {
      var post = await window.fetchContentPostBySlug(slug);
      if (!post) return showNotFound();
      renderPost(post);
    } catch (error) {
      console.warn('Không thể tải bài viết.', error);
      showNotFound();
    }
  }

  document.addEventListener('DOMContentLoaded', loadPost);
})();
