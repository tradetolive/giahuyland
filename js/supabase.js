// Supabase Configuration. IIFE tránh xung đột tên biến với window.supabase do CDN cung cấp.
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
    if (!path) return null;
    const { data } = supabaseClient.storage.from('property-media').getPublicUrl(path);
    return data.publicUrl;
  }

  function normalizeListing(listing) {
    return {
      id: listing.id,
      name: listing.title,
      area: Number(listing.area_sqm),
      frontage: listing.frontage_m == null ? 0 : Number(listing.frontage_m),
      price: Number(listing.price_billion),
      direction: listing.direction,
      legal: listing.legal_summary,
      highlight: listing.summary,
      accent: listing.accent,
      image: publicMediaUrl(listing.cover_image_path),
    };
  }

  // Hàm được gắn có chủ đích lên window để main.js gọi sau khi DOM đã tải.
  window.fetchProductsFromSupabase = async function () {
    if (!supabaseClient) return [];

    try {
      const { data, error } = await supabaseClient
        .from('listings')
        .select('id, title, summary, area_sqm, frontage_m, price_billion, direction, legal_summary, accent, cover_image_path, status, published_at, created_at')
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
})();
