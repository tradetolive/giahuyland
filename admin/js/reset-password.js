/*
 * GiaHuy Land — trang đặt mật khẩu mới.
 * Giao diện tối giản, tương phản cao và phản hồi rõ trạng thái để người dùng hoàn tất khôi phục an toàn.
 * Chỉ dùng publishable key. Mật khẩu chỉ đi trực tiếp giữa trình duyệt và Supabase Auth qua HTTPS.
 */
(function () {
  const SUPABASE_URL = 'https://yxzoeicxoppupxxilzjh.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_RC91v70_KIB-EKYtqYoiVQ_RuRxctW4';
  const supabaseClient = window.supabase && typeof window.supabase.createClient === 'function'
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

  const state = { recoveryVerified: false };
  const $ = (selector) => document.querySelector(selector);

  function setStatus(message, type = 'neutral') {
    const node = $('#reset-status');
    node.textContent = message;
    node.className = `mt-4 text-sm ${type === 'error' ? 'text-red-600' : type === 'success' ? 'text-emerald-700' : 'text-slate-600'}`;
  }

  function showRecoveryForm() {
    state.recoveryVerified = true;
    $('#reset-intro').textContent = 'Liên kết đã được xác minh. Hãy chọn một mật khẩu mới cho tài khoản quản trị của bạn.';
    $('#reset-password-form').hidden = false;
    $('#reset-help').hidden = true;
    $('#new-password').focus();
  }

  function showInvalidRecovery(message) {
    state.recoveryVerified = false;
    $('#reset-intro').textContent = 'Không thể xác minh liên kết đặt lại mật khẩu.';
    $('#reset-password-form').hidden = true;
    $('#reset-help').hidden = false;
    setStatus(message, 'error');
  }

  function hasRecoveryMarker() {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const query = new URLSearchParams(window.location.search);
    return hash.get('type') === 'recovery' || query.get('type') === 'recovery';
  }

  /**
   * Password recovery của Supabase gắn type=recovery vào URL và phát sự kiện
   * PASSWORD_RECOVERY. Không hiển thị form chỉ vì có một session thông thường.
   */
  async function verifyRecoveryLink() {
    if (!supabaseClient) {
      showInvalidRecovery('Không tải được dịch vụ xác thực. Vui lòng tải lại trang hoặc yêu cầu liên kết mới.');
      return;
    }

    if (!hasRecoveryMarker()) {
      showInvalidRecovery('Liên kết này không phải là liên kết khôi phục hợp lệ.');
      return;
    }

    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
      showRecoveryForm();
      return;
    }

    // Supabase client xử lý token trong URL ngay sau khi tải trang; chờ sự kiện recovery ngắn hạn.
    window.setTimeout(async () => {
      const { data: { session: retrySession } } = await supabaseClient.auth.getSession();
      if (retrySession && hasRecoveryMarker()) showRecoveryForm();
      else showInvalidRecovery('Liên kết đã hết hạn, đã được dùng hoặc không hợp lệ.');
    }, 500);
  }

  async function updatePassword(event) {
    event.preventDefault();
    if (!state.recoveryVerified || !supabaseClient) {
      showInvalidRecovery('Liên kết khôi phục không còn hợp lệ. Hãy gửi một yêu cầu mới.');
      return;
    }

    const password = $('#new-password').value;
    const confirmation = $('#confirm-password').value;
    if (password.length < 12) {
      setStatus('Mật khẩu mới cần có ít nhất 12 ký tự.', 'error');
      $('#new-password').focus();
      return;
    }
    if (password !== confirmation) {
      setStatus('Hai mật khẩu chưa khớp. Hãy kiểm tra lại.', 'error');
      $('#confirm-password').focus();
      return;
    }

    const button = $('#reset-password-button');
    button.disabled = true;
    setStatus('Đang lưu mật khẩu mới…');
    try {
      const { error } = await supabaseClient.auth.updateUser({ password });
      if (error) throw error;
      $('#reset-password-form').hidden = true;
      $('#reset-intro').textContent = 'Mật khẩu đã được cập nhật.';
      setStatus('Bạn có thể đăng nhập lại bằng mật khẩu mới. Để bảo vệ tài khoản, phiên khôi phục này sẽ được đăng xuất.', 'success');
      await supabaseClient.auth.signOut();
      window.setTimeout(() => { window.location.replace('./'); }, 1800);
    } catch (error) {
      setStatus(`Không thể cập nhật mật khẩu: ${error.message}`, 'error');
      button.disabled = false;
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    $('#reset-password-form').addEventListener('submit', updatePassword);
    if (supabaseClient) {
      supabaseClient.auth.onAuthStateChange((event) => {
        if (event === 'PASSWORD_RECOVERY' && hasRecoveryMarker()) showRecoveryForm();
      });
    }
    verifyRecoveryLink();
  });
})();
