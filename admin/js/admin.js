/*
 * GiaHuy Land — dashboard quản trị Supabase.
 * Trang này chỉ dùng publishable key; Supabase Auth + RLS là lớp quyết định quyền.
 * Tuyệt đối không thêm service_role key vào file client-side.
 */
(function () {
  const SUPABASE_URL = 'https://yxzoeicxoppupxxilzjh.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_RC91v70_KIB-EKYtqYoiVQ_RuRxctW4';
  const MAX_FILE_BYTES = 5 * 1024 * 1024;
  const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  const DOCUMENT_TYPES = [...IMAGE_TYPES, 'application/pdf'];
  const supabaseClient = window.supabase && typeof window.supabase.createClient === 'function'
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

  const state = { session: null, listings: [], editing: null, contentPosts: [], editingContentPost: null };
  const $ = (selector) => document.querySelector(selector);

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setStatus(message, type = 'neutral') {
    const node = $('#app-status');
    node.textContent = message;
    node.className = `mt-4 rounded-xl border px-4 py-3 text-sm ${type === 'error' ? 'border-red-200 bg-red-50 text-red-800' : type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-slate-50 text-slate-600'}`;
    node.hidden = !message;
  }

  function setLoginStatus(message, type = 'neutral') {
    const node = $('#login-status');
    node.textContent = message;
    node.className = `mt-4 text-sm ${type === 'error' ? 'text-red-600' : type === 'success' ? 'text-emerald-700' : 'text-slate-600'}`;
  }

  function slugify(value) {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase().trim().replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 90);
  }

  function extensionFromFile(file) {
    const extension = file.name.split('.').pop().toLowerCase();
    return /^[a-z0-9]{2,5}$/.test(extension) ? extension : 'bin';
  }

  function assertFile(file, allowedTypes, label) {
    if (!file) return;
    if (!allowedTypes.includes(file.type)) throw new Error(`${label} phải là JPEG, PNG${label === 'Tài liệu pháp lý' ? ', WEBP hoặc PDF' : ' hoặc WEBP'}.`);
    if (file.size > MAX_FILE_BYTES) throw new Error(`${label} tối đa 5 MB.`);
  }

  function removeFileInputValue(id) {
    const element = document.getElementById(id);
    if (element) element.value = '';
  }

  function resetForm() {
    state.editing = null;
    $('#listing-form').reset();
    $('#listing-id').value = '';
    $('#form-title').textContent = 'Đăng nội dung mới';
    $('#save-button-label').textContent = 'Lưu bài đăng';
    $('#cancel-edit').hidden = true;
    $('#existing-assets').hidden = true;
    $('#gallery-count').textContent = '';
    ['cover-file', 'gallery-files', 'document-file'].forEach(removeFileInputValue);
  }

  function contentPostUrl(post) {
    const url = new URL('../bai-viet.html', window.location.href);
    url.searchParams.set('slug', post.slug || '');
    return url.href;
  }

  function resetContentPostForm() {
    state.editingContentPost = null;
    $('#content-post-form').reset();
    $('#content-post-id').value = '';
    $('#content-post-order').value = '100';
    $('#content-post-form-title').textContent = 'Tạo bài viết mới';
    $('#save-content-post-label').textContent = 'Lưu bài viết';
    $('#cancel-content-post-edit').hidden = true;
    $('#content-post-current-cover').hidden = true;
    $('#content-post-current-cover').textContent = '';
    $('#content-post-automation-note').hidden = true;
    $('#content-post-automation-note').textContent = '';
    delete $('#content-post-slug').dataset.edited;
    removeFileInputValue('content-post-cover-file');
  }

  function setEditing(listingId) {
    const listing = state.listings.find((item) => item.id === listingId);
    if (!listing) return;
    state.editing = listing;
    $('#listing-id').value = listing.id;
    $('#slug').value = listing.slug || '';
    $('#title').value = listing.title || '';
    $('#property-type').value = listing.property_type || 'Đất nền';
    $('#location').value = listing.location || '';
    $('#price-billion').value = listing.price_billion || '';
    $('#area-sqm').value = listing.area_sqm || '';
    $('#frontage-m').value = listing.frontage_m || '';
    $('#direction').value = listing.direction || '';
    $('#legal-summary').value = listing.legal_summary || '';
    $('#summary').value = listing.summary || '';
    $('#accent').value = listing.accent || 'forest';
    $('#publication-status').value = listing.status || 'draft';
    $('#form-title').textContent = `Chỉnh sửa: ${listing.title}`;
    $('#save-button-label').textContent = 'Lưu thay đổi';
    $('#cancel-edit').hidden = false;
    $('#existing-assets').hidden = false;
    $('#current-cover').textContent = listing.cover_image_path ? 'Đã có ảnh cover' : 'Chưa có ảnh cover';
    $('#current-gallery').textContent = `${Array.isArray(listing.gallery_paths) ? listing.gallery_paths.length : 0} ảnh thư viện`;
    $('#current-document').textContent = listing.legal_document_name ? `Tài liệu private: ${listing.legal_document_name}` : 'Chưa có ảnh sổ đỏ/tài liệu';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function setEditingContentPost(postId) {
    const post = state.contentPosts.find((item) => item.id === postId);
    if (!post) return;
    state.editingContentPost = post;
    $('#content-post-id').value = post.id;
    $('#content-post-title').value = post.title || '';
    $('#content-post-slug').value = post.slug || '';
    $('#content-post-status').value = post.status || 'draft';
    $('#content-post-category').value = post.category || 'insight';
    $('#content-post-slot').value = post.home_slot || '';
    $('#content-post-order').value = post.display_order == null ? '100' : post.display_order;
    $('#content-post-eyebrow').value = post.eyebrow || '';
    $('#content-post-excerpt').value = post.excerpt || '';
    $('#content-post-body').value = post.body || '';
    $('#content-post-source-name').value = post.source_name || '';
    $('#content-post-source-url').value = post.source_url || '';
    $('#content-post-source-date').value = post.source_published_on || '';
    $('#content-post-form-title').textContent = `Chỉnh sửa: ${post.title}`;
    $('#save-content-post-label').textContent = 'Lưu thay đổi';
    $('#cancel-content-post-edit').hidden = false;
    const coverInfo = $('#content-post-current-cover');
    coverInfo.textContent = post.cover_image_path ? 'Đã có ảnh cover public. Chọn ảnh mới để thay thế.' : 'Chưa có ảnh cover.';
    coverInfo.hidden = false;
    const automationNote = $('#content-post-automation-note');
    if (post.origin === 'daily-source') {
      automationNote.textContent = `Bản nháp tự động từ nguồn nhà nước${post.automation_run_id ? ` · lượt chạy ${post.automation_run_id}` : ''}. Hãy đối chiếu URL và nội dung trước khi xuất bản.`;
      automationNote.hidden = false;
    } else {
      automationNote.hidden = true;
      automationNote.textContent = '';
    }
    window.scrollTo({ top: $('#content-post-form').getBoundingClientRect().top + window.scrollY - 24, behavior: 'smooth' });
  }

  async function checkAdmin(session) {
    const { data, error } = await supabaseClient
      .from('admin_users')
      .select('user_id')
      .eq('user_id', session.user.id)
      .maybeSingle();
    if (error) throw error;
    return Boolean(data);
  }

  function showLogin() {
    $('#login-panel').hidden = false;
    $('#dashboard-panel').hidden = true;
    $('#admin-email').focus();
  }

  function showDashboard(session) {
    $('#login-panel').hidden = true;
    $('#dashboard-panel').hidden = false;
    $('#admin-email-label').textContent = session.user.email || 'Tài khoản quản trị';
  }

  async function hydrateSession() {
    if (!supabaseClient) {
      setLoginStatus('Không tải được Supabase. Vui lòng tải lại trang rồi thử lại.', 'error');
      return;
    }
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) {
      showLogin();
      return;
    }
    try {
      const isAdmin = await checkAdmin(session);
      if (!isAdmin) {
        await supabaseClient.auth.signOut();
        showLogin();
        setLoginStatus('Tài khoản này chưa được cấp quyền quản trị. Hãy dùng đúng email đã thêm trong bảng admin_users.', 'error');
        return;
      }
      state.session = session;
      showDashboard(session);
      await Promise.all([loadListings(), loadContentPosts()]);
    } catch (error) {
      showLogin();
      const message = error.message && error.message.includes('admin_users')
        ? 'Chưa cài schema quản trị. Hãy chạy file supabase/migrations/20260827_admin_dashboard.sql trong Supabase SQL Editor.'
        : `Không thể kiểm tra quyền quản trị: ${error.message}`;
      setLoginStatus(message, 'error');
    }
  }

  async function loadListings() {
    const list = $('#listing-list');
    list.innerHTML = '<p class="col-span-full py-10 text-center text-slate-500">Đang tải danh sách...</p>';
    const { data, error } = await supabaseClient
      .from('listings')
      .select('*')
      .order('updated_at', { ascending: false });
    if (error) {
      list.innerHTML = '';
      setStatus(error.message.includes('listings')
        ? 'Chưa có bảng listings. Hãy chạy migration Supabase trước khi dùng dashboard.'
        : `Không thể tải dữ liệu: ${error.message}`, 'error');
      return;
    }
    state.listings = data || [];
    renderListings();
  }

  async function loadContentPosts() {
    const list = $('#content-post-list');
    list.innerHTML = '<p class="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-8 text-sm text-slate-500">Đang tải bài viết…</p>';
    const { data, error } = await supabaseClient
      .from('content_posts')
      .select('*')
      .order('updated_at', { ascending: false });
    if (error) {
      list.innerHTML = '';
      const missingTable = /content_posts|relation .* does not exist/i.test(error.message || '');
      list.innerHTML = `<div class="rounded-2xl border border-dashed border-amber-300 bg-amber-50 px-5 py-6 text-sm leading-6 text-amber-900">${missingTable ? 'Chưa cài mô hình bài viết biên tập. Hãy chạy migration supabase/migrations/20260827_editorial_content_posts.sql trong Supabase SQL Editor rồi bấm Làm mới.' : `Không thể tải bài viết: ${escapeHtml(error.message)}`}</div>`;
      return;
    }
    state.contentPosts = data || [];
    renderContentPosts();
  }

  function categoryLabel(category) {
    const labels = { brand: 'Giới thiệu thương hiệu', insight: 'Góc nhìn đầu tư', advantage: 'Lợi thế khu vực', guide: 'Hướng dẫn', 'market-update': 'Cập nhật thị trường' };
    return labels[category] || 'Bài viết';
  }

  function homeSlotLabel(slot) {
    const labels = { hero: 'Hero giới thiệu', 'pain-points': 'Điểm nghẽn quy hoạch', advantages: 'Lợi thế Hà An' };
    return labels[slot] || 'Chỉ trang chi tiết';
  }

  function renderContentPosts() {
    const list = $('#content-post-list');
    if (state.contentPosts.length === 0) {
      list.innerHTML = '<div class="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center"><p class="font-semibold text-slate-700">Chưa có bài viết biên tập.</p><p class="mt-2 text-sm text-slate-500">Tạo bài viết đầu tiên hoặc chạy migration để chuyển các nội dung tĩnh hiện có.</p></div>';
      return;
    }
    list.innerHTML = state.contentPosts.map((post) => {
      const isPublished = post.status === 'published';
      const statusClass = isPublished ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200';
      const detailLink = escapeHtml(contentPostUrl(post));
      const sourceLink = post.source_url && /^https:\/\//i.test(post.source_url)
        ? `<a href="${escapeHtml(post.source_url)}" target="_blank" rel="noopener noreferrer" class="font-semibold text-forest underline decoration-forest/25 underline-offset-4 hover:decoration-forest">Mở nguồn</a>`
        : '';
      const originLabel = post.origin === 'daily-source' ? ' · Tạo tự động' : '';
      return `<article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="flex items-start justify-between gap-4"><div><p class="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">${escapeHtml(categoryLabel(post.category))}</p><h4 class="mt-1 font-semibold text-slate-900">${escapeHtml(post.title)}</h4><p class="mt-1 text-sm text-slate-500">${escapeHtml(homeSlotLabel(post.home_slot))} · Thứ tự ${Number(post.display_order || 0)}${originLabel}</p></div><span class="shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass}">${isPublished ? 'Đã xuất bản' : 'Bản nháp'}</span></div>
        <p class="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">${escapeHtml(post.excerpt || 'Chưa có tóm tắt.')}</p>
        ${post.source_name || sourceLink ? `<p class="mt-3 text-xs leading-5 text-slate-500">Nguồn: ${escapeHtml(post.source_name || 'Liên kết tham khảo')}${sourceLink ? ` · ${sourceLink}` : ''}</p>` : ''}
        <div class="mt-4 flex flex-wrap gap-2"><button type="button" data-content-action="edit" data-id="${post.id}" class="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#1e3b2e] hover:text-[#1e3b2e]">Chỉnh sửa</button>${isPublished ? `<a href="${detailLink}" target="_blank" rel="noopener noreferrer" class="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-forest transition hover:border-forest">Xem</a>` : ''}<button type="button" data-content-action="delete" data-id="${post.id}" class="rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50">Xóa</button></div>
      </article>`;
    }).join('');
    list.querySelectorAll('[data-content-action="edit"]').forEach((button) => button.addEventListener('click', () => setEditingContentPost(button.dataset.id)));
    list.querySelectorAll('[data-content-action="delete"]').forEach((button) => button.addEventListener('click', () => deleteContentPost(button.dataset.id)));
  }

  function renderListings() {
    const list = $('#listing-list');
    if (state.listings.length === 0) {
      list.innerHTML = '<div class="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center"><p class="font-semibold text-slate-700">Chưa có nội dung nào.</p><p class="mt-2 text-sm text-slate-500">Bắt đầu bằng cách điền biểu mẫu bên trên, lưu bản nháp hoặc xuất bản ngay.</p></div>';
      return;
    }
    list.innerHTML = state.listings.map((listing) => {
      const statusClass = listing.status === 'published' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200';
      const galleryCount = Array.isArray(listing.gallery_paths) ? listing.gallery_paths.length : 0;
      const price = Number(listing.price_billion);
      return `<article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">${escapeHtml(listing.property_type)}</p>
            <h3 class="mt-1 font-semibold text-slate-900">${escapeHtml(listing.title)}</h3>
            <p class="mt-1 text-sm text-slate-500">${escapeHtml(listing.location || 'Chưa ghi khu vực')}</p>
          </div>
          <span class="rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass}">${listing.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}</span>
        </div>
        <div class="mt-4 grid grid-cols-2 gap-3 border-y border-slate-100 py-4 text-sm">
          <div><p class="text-slate-400">Giá</p><p class="mt-0.5 font-semibold text-slate-700">${Number.isFinite(price) ? `${price.toFixed(2)} tỷ` : 'Chưa nhập'}</p></div>
          <div><p class="text-slate-400">Media</p><p class="mt-0.5 font-semibold text-slate-700">${listing.cover_image_path ? 'Cover' : 'Không cover'} · ${galleryCount} ảnh</p></div>
        </div>
        <div class="mt-4 flex gap-2">
          <button type="button" data-action="edit" data-id="${listing.id}" class="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#1e3b2e] hover:text-[#1e3b2e]">Chỉnh sửa</button>
          <button type="button" data-action="delete" data-id="${listing.id}" class="rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50">Xóa</button>
        </div>
      </article>`;
    }).join('');

    list.querySelectorAll('[data-action="edit"]').forEach((button) => button.addEventListener('click', () => setEditing(button.dataset.id)));
    list.querySelectorAll('[data-action="delete"]').forEach((button) => button.addEventListener('click', () => deleteListing(button.dataset.id)));
  }

  async function uploadFile(bucket, file, folder) {
    const path = `${folder}/${crypto.randomUUID()}.${extensionFromFile(file)}`;
    const { error } = await supabaseClient.storage.from(bucket).upload(path, file, { cacheControl: '3600', upsert: false });
    if (error) throw error;
    return path;
  }

  async function saveListing(event) {
    event.preventDefault();
    if (!state.session) return;
    const form = event.currentTarget;
    const submit = $('#save-button');
    submit.disabled = true;
    setStatus('Đang kiểm tra và lưu nội dung...');

    try {
      const title = $('#title').value.trim();
      const slug = ($('#slug').value.trim() || slugify(title));
      if (!slug) throw new Error('Hãy nhập tiêu đề hoặc slug hợp lệ.');
      const coverFile = $('#cover-file').files[0];
      const galleryFiles = Array.from($('#gallery-files').files || []);
      const documentFile = $('#document-file').files[0];
      assertFile(coverFile, IMAGE_TYPES, 'Ảnh cover');
      galleryFiles.forEach((file) => assertFile(file, IMAGE_TYPES, 'Ảnh thư viện'));
      assertFile(documentFile, DOCUMENT_TYPES, 'Tài liệu pháp lý');
      if (galleryFiles.length > 8) throw new Error('Mỗi lần chỉ tải tối đa 8 ảnh thư viện.');

      const listingId = state.editing ? state.editing.id : crypto.randomUUID();
      const folder = `${state.session.user.id}/${listingId}`;
      let coverImagePath = state.editing?.cover_image_path || null;
      let galleryPaths = Array.isArray(state.editing?.gallery_paths) ? state.editing.gallery_paths : [];
      let legalDocumentPath = state.editing?.legal_document_path || null;
      let legalDocumentName = state.editing?.legal_document_name || null;

      if (coverFile) coverImagePath = await uploadFile('property-media', coverFile, folder);
      if (galleryFiles.length) {
        const newPaths = await Promise.all(galleryFiles.map((file) => uploadFile('property-media', file, folder)));
        galleryPaths = [...galleryPaths, ...newPaths];
      }
      if (documentFile) {
        legalDocumentPath = await uploadFile('property-documents', documentFile, folder);
        legalDocumentName = documentFile.name;
      }

      const payload = {
        id: listingId,
        slug,
        title,
        summary: $('#summary').value.trim(),
        property_type: $('#property-type').value,
        location: $('#location').value.trim(),
        price_billion: Number($('#price-billion').value),
        area_sqm: Number($('#area-sqm').value),
        frontage_m: $('#frontage-m').value ? Number($('#frontage-m').value) : null,
        direction: $('#direction').value,
        legal_summary: $('#legal-summary').value.trim(),
        accent: $('#accent').value,
        status: $('#publication-status').value,
        cover_image_path: coverImagePath,
        gallery_paths: galleryPaths,
        legal_document_path: legalDocumentPath,
        legal_document_name: legalDocumentName,
        author_id: state.editing?.author_id || state.session.user.id,
      };

      const query = state.editing
        ? supabaseClient.from('listings').update(payload).eq('id', listingId)
        : supabaseClient.from('listings').insert(payload);
      const { error } = await query;
      if (error) throw error;
      setStatus(payload.status === 'published' ? 'Đã xuất bản nội dung và ảnh marketing công khai.' : 'Đã lưu bản nháp. Khách truy cập chưa thể xem nội dung này.', 'success');
      resetForm();
      await loadListings();
    } catch (error) {
      setStatus(`Không thể lưu: ${error.message}`, 'error');
    } finally {
      submit.disabled = false;
    }
  }

  async function saveContentPost(event) {
    event.preventDefault();
    if (!state.session) return;
    const submit = $('#save-content-post-button');
    submit.disabled = true;
    setStatus('Đang kiểm tra và lưu bài viết…');
    try {
      const title = $('#content-post-title').value.trim();
      const slug = ($('#content-post-slug').value.trim() || slugify(title));
      if (!slug) throw new Error('Hãy nhập tiêu đề hoặc slug hợp lệ.');
      const coverFile = $('#content-post-cover-file').files[0];
      assertFile(coverFile, IMAGE_TYPES, 'Ảnh cover bài viết');

      const sourceUrl = $('#content-post-source-url').value.trim();
      if (sourceUrl && !/^https:\/\//i.test(sourceUrl)) throw new Error('URL nguồn cần bắt đầu bằng https://.');

      const postId = state.editingContentPost ? state.editingContentPost.id : crypto.randomUUID();
      let coverImagePath = state.editingContentPost?.cover_image_path || null;
      if (coverFile) coverImagePath = await uploadFile('property-media', coverFile, `${state.session.user.id}/content/${postId}`);

      const payload = {
        id: postId,
        slug,
        title,
        eyebrow: $('#content-post-eyebrow').value.trim(),
        excerpt: $('#content-post-excerpt').value.trim(),
        body: $('#content-post-body').value.trim(),
        category: $('#content-post-category').value,
        home_slot: $('#content-post-slot').value || null,
        display_order: Number($('#content-post-order').value),
        status: $('#content-post-status').value,
        cover_image_path: coverImagePath,
        author_id: state.editingContentPost?.author_id || state.session.user.id,
        source_name: $('#content-post-source-name').value.trim() || null,
        source_url: sourceUrl || null,
        source_published_on: $('#content-post-source-date').value || null,
        source_fingerprint: state.editingContentPost?.source_url === sourceUrl ? state.editingContentPost.source_fingerprint || null : null,
        origin: state.editingContentPost?.source_url === sourceUrl ? state.editingContentPost?.origin || 'manual' : 'manual',
        automation_run_id: state.editingContentPost?.source_url === sourceUrl ? state.editingContentPost?.automation_run_id || null : null,
      };
      const query = state.editingContentPost
        ? supabaseClient.from('content_posts').update(payload).eq('id', postId)
        : supabaseClient.from('content_posts').insert(payload);
      const { error } = await query;
      if (error) throw error;

      // Chỉ dọn cover cũ sau khi cập nhật DB thành công để không mất ảnh đang hiển thị.
      if (coverFile && state.editingContentPost?.cover_image_path && state.editingContentPost.cover_image_path !== coverImagePath) {
        const { error: cleanupError } = await supabaseClient.storage.from('property-media').remove([state.editingContentPost.cover_image_path]);
        if (cleanupError) console.warn('Không thể dọn ảnh cover cũ.', cleanupError);
      }
      setStatus(payload.status === 'published' ? 'Đã xuất bản bài viết. Khách có thể xem nội dung công khai.' : 'Đã lưu bản nháp. Khách truy cập chưa thể xem bài viết.', 'success');
      resetContentPostForm();
      await loadContentPosts();
    } catch (error) {
      const message = error.message || 'Lỗi không xác định.';
      if (/content_posts_one_published_home_slot|duplicate key/i.test(message)) {
        setStatus('Vị trí trang chủ này đã có một bài đang xuất bản. Hãy chuyển bài kia về Bản nháp hoặc bỏ vị trí trước khi xuất bản.', 'error');
      } else {
        setStatus(`Không thể lưu bài viết: ${message}`, 'error');
      }
    } finally {
      submit.disabled = false;
    }
  }

  async function deleteListing(listingId) {
    const listing = state.listings.find((item) => item.id === listingId);
    if (!listing || !window.confirm(`Xóa “${listing.title}”? Ảnh đã tải cũng sẽ được dọn nếu có thể.`)) return;
    setStatus('Đang xóa bài đăng...');
    try {
      const { error } = await supabaseClient.from('listings').delete().eq('id', listingId);
      if (error) throw error;
      const mediaPaths = [listing.cover_image_path, ...(Array.isArray(listing.gallery_paths) ? listing.gallery_paths : [])].filter(Boolean);
      await Promise.all([
        mediaPaths.length ? supabaseClient.storage.from('property-media').remove(mediaPaths) : Promise.resolve(),
        listing.legal_document_path ? supabaseClient.storage.from('property-documents').remove([listing.legal_document_path]) : Promise.resolve(),
      ]);
      if (state.editing?.id === listingId) resetForm();
      setStatus('Đã xóa bài đăng. Nếu một tệp không dọn được, bạn có thể xóa thủ công trong Supabase Storage.', 'success');
      await loadListings();
    } catch (error) {
      setStatus(`Không thể xóa: ${error.message}`, 'error');
    }
  }

  async function deleteContentPost(postId) {
    const post = state.contentPosts.find((item) => item.id === postId);
    if (!post || !window.confirm(`Xóa bài viết “${post.title}”? Ảnh cover cũng sẽ được dọn nếu có thể.`)) return;
    setStatus('Đang xóa bài viết…');
    try {
      const { error } = await supabaseClient.from('content_posts').delete().eq('id', postId);
      if (error) throw error;
      if (post.cover_image_path) {
        const { error: cleanupError } = await supabaseClient.storage.from('property-media').remove([post.cover_image_path]);
        if (cleanupError) console.warn('Không thể dọn ảnh cover bài viết.', cleanupError);
      }
      if (state.editingContentPost?.id === postId) resetContentPostForm();
      setStatus('Đã xóa bài viết. Nếu một tệp không dọn được, bạn có thể xóa thủ công trong Supabase Storage.', 'success');
      await loadContentPosts();
    } catch (error) {
      setStatus(`Không thể xóa bài viết: ${error.message}`, 'error');
    }
  }

  async function previewPrivateDocument() {
    if (!state.editing?.legal_document_path) return;
    try {
      const { data, error } = await supabaseClient.storage
        .from('property-documents')
        .createSignedUrl(state.editing.legal_document_path, 60);
      if (error) throw error;
      window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      setStatus(`Không thể mở tài liệu private: ${error.message}`, 'error');
    }
  }

  async function signIn(event) {
    event.preventDefault();
    if (!supabaseClient) return;
    const button = $('#login-button');
    button.disabled = true;
    setLoginStatus('Đang đăng nhập...');
    try {
      const { error } = await supabaseClient.auth.signInWithPassword({
        email: $('#admin-email').value.trim(),
        password: $('#admin-password').value,
      });
      if (error) throw error;
      setLoginStatus('');
      await hydrateSession();
    } catch (error) {
      setLoginStatus(`Không thể đăng nhập: ${error.message}`, 'error');
    } finally {
      button.disabled = false;
    }
  }

  /**
   * Gửi liên kết khôi phục bằng Supabase Auth. Thông báo luôn trung tính để
   * không tiết lộ email nào đã tồn tại hoặc có quyền quản trị.
   */
  async function requestPasswordRecovery() {
    if (!supabaseClient) {
      setLoginStatus('Không tải được Supabase. Vui lòng tải lại trang rồi thử lại.', 'error');
      return;
    }

    const emailField = $('#admin-email');
    const email = emailField.value.trim();
    if (!email || !emailField.checkValidity()) {
      setLoginStatus('Hãy nhập đúng email quản trị trước khi yêu cầu khôi phục mật khẩu.', 'error');
      emailField.focus();
      return;
    }

    const button = $('#forgot-password-button');
    button.disabled = true;
    setLoginStatus('Đang gửi liên kết khôi phục...');
    try {
      // GitHub Pages chỉ phục vụ tĩnh, nên URL đích được tạo từ trang admin đang mở.
      const redirectTo = new URL('reset-password.html', window.location.href).href;
      const { error } = await supabaseClient.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw error;
      setLoginStatus('Nếu email này có tài khoản, Supabase đã gửi liên kết đặt lại mật khẩu. Hãy kiểm tra Hộp thư đến và thư mục Spam.', 'success');
    } catch (error) {
      setLoginStatus(`Không thể gửi liên kết khôi phục: ${error.message}`, 'error');
    } finally {
      button.disabled = false;
    }
  }

  async function signOut() {
    await supabaseClient.auth.signOut();
    state.session = null;
    state.listings = [];
    state.contentPosts = [];
    resetForm();
    resetContentPostForm();
    $('#content-post-list').innerHTML = '<p class="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-8 text-sm text-slate-500">Đăng nhập để tải bài viết biên tập.</p>';
    showLogin();
    setLoginStatus('Bạn đã đăng xuất.');
  }

  function bindEvents() {
    $('#login-form').addEventListener('submit', signIn);
    $('#forgot-password-button').addEventListener('click', requestPasswordRecovery);
    $('#listing-form').addEventListener('submit', saveListing);
    $('#content-post-form').addEventListener('submit', saveContentPost);
    // Giữ xác thực HTML5, đồng thời hiển thị lỗi trong vùng trạng thái dễ nhận thấy.
    $('#listing-form').addEventListener('invalid', (event) => {
      const field = event.target;
      const label = document.querySelector(`label[for="${field.id}"]`);
      setStatus(`Vui lòng kiểm tra trường: ${label ? label.textContent : 'dữ liệu bài đăng'}.`, 'error');
    }, true);
    $('#content-post-form').addEventListener('invalid', (event) => {
      const field = event.target;
      const label = document.querySelector(`label[for="${field.id}"]`);
      setStatus(`Vui lòng kiểm tra trường: ${label ? label.textContent : 'dữ liệu bài viết'}.`, 'error');
    }, true);
    $('#logout-button').addEventListener('click', signOut);
    $('#cancel-edit').addEventListener('click', resetForm);
    $('#cancel-content-post-edit').addEventListener('click', resetContentPostForm);
    $('#refresh-content-posts').addEventListener('click', loadContentPosts);
    $('#title').addEventListener('input', () => {
      if (!state.editing && !$('#slug').dataset.edited) $('#slug').value = slugify($('#title').value);
    });
    $('#slug').addEventListener('input', () => { $('#slug').dataset.edited = 'true'; });
    $('#content-post-title').addEventListener('input', () => {
      if (!state.editingContentPost && !$('#content-post-slug').dataset.edited) $('#content-post-slug').value = slugify($('#content-post-title').value);
    });
    $('#content-post-slug').addEventListener('input', () => { $('#content-post-slug').dataset.edited = 'true'; });
    $('#gallery-files').addEventListener('change', (event) => {
      $('#gallery-count').textContent = event.target.files.length ? `Đã chọn ${event.target.files.length} ảnh mới` : '';
    });
    $('#preview-document').addEventListener('click', previewPrivateDocument);
  }

  document.addEventListener('DOMContentLoaded', async () => {
    bindEvents();
    if (supabaseClient) {
      supabaseClient.auth.onAuthStateChange(() => { window.setTimeout(hydrateSession, 0); });
    }
    await hydrateSession();
  });
})();
