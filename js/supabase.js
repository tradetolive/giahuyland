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

  // Hàm được gắn có chủ đích lên window để main.js gọi sau khi DOM đã tải.
  window.fetchProductsFromSupabase = async function () {
    if (!supabaseClient) return [];

    try {
      const { data, error } = await supabaseClient
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Không thể tải dữ liệu từ Supabase; website sẽ dùng danh sách dự phòng.', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Lỗi:', err);
      return [];
    }
  };
})();
