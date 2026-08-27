// GiaHuy Land — lớp dữ liệu public cho giao diện địa chính xanh rừng/đất nung.
// IIFE tránh xung đột tên biến với window.supabase do CDN cung cấp.
(function () {
  const SUPABASE_URL = 'https://yxzoeicxoppupxxilzjh.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_RC91v70_KIB-EKYtqYoiVQ_RuRxctW4';
  let supabaseClient = null;

  if (window.supabase && typeof window.supabase.createClient === 'function') {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } else {
    console.warn('Không tải được thư viện Supabase. Website sẽ dùng danh sách dự phòng.');
  }

  function publicMediaUrl(path) {
    if (!path || !supabaseClient) return null;
    const { data } = supabaseClient.storage.from('property-media').getPublicUrl(path);
    return data.publicUrl;
  }

  function normalizeContentPost(post) {
    return {
      id: post.id,
      slug: post.slug,
      title: post.title,
      eyebrow: post.eyebrow || '',
      excerpt: post.excerpt || '',
      body: post.body || '',
      category: post.category || 'insight',
      homeSlot: post.home_slot || null,
      displayOrder: Number(post.display_order || 0),
      image: publicMediaUrl(post.cover_image_path),
      publishedAt: post.published_at || null,
    };
  }

  function normalizeFallbackContentPost(post) {
    return {
      id: post.id || post.slug,
      slug: post.slug,
      title: post.title,
      eyebrow: post.eyebrow || '',
      excerpt: post.excerpt || '',
      body: post.body || '',
      category: post.category || 'insight',
      homeSlot: post.homeSlot || null,
      displayOrder: Number(post.displayOrder || 0),
      image: null,
      publishedAt: null,
    };
  }

  function normalizeListing(listing) {
    return {
      id: listing.id,
      slug: listing.slug,
      name: listing.title,
      propertyType: listing.property_type || 'Đất nền',
      location: listing.location || '',
      area: Number(listing.area_sqm),
      frontage: listing.frontage_m == null ? 0 : Number(listing.frontage_m),
      price: Number(listing.price_billion),
      direction: listing.direction,
      legal: listing.legal_summary,
      highlight: listing.summary,
      accent: listing.accent,
      image: publicMediaUrl(listing.cover_image_path),
      gallery: (Array.isArray(listing.gallery_paths) ? listing.gallery_paths : []).map(publicMediaUrl).filter(Boolean),
    };
  }

  function fallbackSlug(product) {
    return String(product.slug || product.id || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function normalizeFallback(product) {
    return Object.assign({}, product, {
      slug: fallbackSlug(product),
      propertyType: product.propertyType || 'Đất nền',
      location: product.location || 'Hà An, Quảng Ninh',
      gallery: Array.isArray(product.gallery) ? product.gallery : [],
    });
  }

  // URL chi tiết luôn là một file tĩnh, nên hoạt động tương thích cả GitHub Pages và preview local.
  window.getListingDetailUrl = function (listingOrSlug) {
    var slug = typeof listingOrSlug === 'string'
      ? listingOrSlug
      : (listingOrSlug && (listingOrSlug.slug || fallbackSlug(listingOrSlug)));
    var detailUrl = new URL('chi-tiet.html', window.location.href);
    detailUrl.searchParams.set('slug', slug || '');
    return detailUrl.href;
  };

  // Hàm được gắn có chủ đích lên window để main.js gọi sau khi DOM đã tải.
  window.fetchProductsFromSupabase = async function () {
    if (!supabaseClient) return [];

    try {
      const { data, error } = await supabaseClient
        .from('listings')
        .select('id, slug, title, summary, property_type, location, area_sqm, frontage_m, price_billion, direction, legal_summary, accent, cover_image_path, gallery_paths, status, published_at, created_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (error) {
        console.warn('Không thể tải listings đã xuất bản từ Supabase; website sẽ dùng danh sách dự phòng.', error);
        return [];
      }

      return (data || []).map(normalizeListing);
    } catch (err) {
      console.warn('Không thể tải listings đã xuất bản; website sẽ dùng danh sách dự phòng.', err);
      return [];
    }
  };

  // Chỉ trả về listing đã xuất bản. Draft và tài liệu private không bao giờ đi qua hàm này.
  window.fetchListingBySlug = async function (slug) {
    var safeSlug = String(slug || '').trim().toLowerCase();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(safeSlug)) return null;

    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('listings')
          .select('id, slug, title, summary, property_type, location, area_sqm, frontage_m, price_billion, direction, legal_summary, accent, cover_image_path, gallery_paths, status, published_at, created_at')
          .eq('status', 'published')
          .eq('slug', safeSlug)
          .maybeSingle();

        if (error) {
          console.warn('Không thể tải chi tiết listing từ Supabase; đang kiểm tra dữ liệu dự phòng.', error);
        } else if (data) {
          return normalizeListing(data);
        }
      } catch (err) {
        console.warn('Không thể tải chi tiết listing đã xuất bản; đang kiểm tra dữ liệu dự phòng.', err);
      }
    }

    var fallback = (window.GIAHUY_PRODUCTS || []).find(function (product) {
      return fallbackSlug(product) === safeSlug;
    });
    return fallback ? normalizeFallback(fallback) : null;
  };

  // URL chi tiết bài viết dùng query string để chạy tương thích với GitHub Pages.
  window.getContentPostDetailUrl = function (postOrSlug) {
    var slug = typeof postOrSlug === 'string' ? postOrSlug : (postOrSlug && postOrSlug.slug);
    var detailUrl = new URL('bai-viet.html', window.location.href);
    detailUrl.searchParams.set('slug', slug || '');
    return detailUrl.href;
  };

  // Trả về null khi không tải được Supabase để UI chủ động dùng nội dung dự phòng.
  // Khi bảng hoạt động nhưng chưa có bài published, hàm trả về [] để không hiện nội dung đã xóa.
  window.fetchContentPostsFromSupabase = async function () {
    if (!supabaseClient) return null;
    try {
      const { data, error } = await supabaseClient
        .from('content_posts_public')
        .select('id, slug, title, eyebrow, excerpt, body, category, home_slot, display_order, cover_image_path, status, published_at, created_at')
        .eq('status', 'published')
        .order('display_order', { ascending: true })
        .order('published_at', { ascending: false });
      if (error) {
        console.warn('Không thể tải bài viết published từ Supabase.', error);
        return null;
      }
      return (data || []).map(normalizeContentPost);
    } catch (error) {
      console.warn('Không thể tải bài viết published từ Supabase.', error);
      return null;
    }
  };

  window.fetchContentPostBySlug = async function (slug) {
    var safeSlug = String(slug || '').trim().toLowerCase();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(safeSlug)) return null;
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('content_posts_public')
          .select('id, slug, title, eyebrow, excerpt, body, category, home_slot, display_order, cover_image_path, status, published_at, created_at')
          .eq('status', 'published')
          .eq('slug', safeSlug)
          .maybeSingle();
        if (!error && data) return normalizeContentPost(data);
        if (error) console.warn('Không thể tải chi tiết bài viết published.', error);
      } catch (error) {
        console.warn('Không thể tải chi tiết bài viết published.', error);
      }
    }
    var fallback = (window.GIAHUY_EDITORIAL_FALLBACK || []).find(function (post) { return post.slug === safeSlug; });
    return fallback ? normalizeFallbackContentPost(fallback) : null;
  };
})();
