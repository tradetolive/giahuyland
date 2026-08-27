// Supabase Configuration
const SUPABASE_URL = 'https://yxzoeicxoppupxxilzjh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_RC91v70_KIB-EKYtqYoiVQ_RuRxctW4';

const { createClient } = window.supabase;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Fetch products from Supabase
async function fetchProductsFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Lỗi fetch products:', error);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error('Lỗi:', err);
    return [];
  }
}
