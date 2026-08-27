/**
 * GiaHuy Land — liên hệ theo ngữ cảnh listing.
 * Nền tảng chat không cho website tự điền tin nhắn vào cuộc trò chuyện cá nhân
 * mà không có API/Official Account. Script sao chép sẵn tiêu đề + URL bài đăng
 * rồi mở Zalo/Messenger trong tab mới để khách chỉ cần dán và gửi.
 */
(function () {
  'use strict';

  var toastTimer;

  function notify(message) {
    var toast = document.getElementById('contact-toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove('is-visible');
    }, 4200);
  }

  function fallbackCopy(text) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.cssText = 'position:fixed;opacity:0;pointer-events:none;';
    document.body.appendChild(textarea);
    textarea.select();
    var copied = false;
    try { copied = document.execCommand('copy'); } catch (error) { copied = false; }
    textarea.remove();
    return copied;
  }

  function copyMessage(message) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(message).then(function () { return true; }).catch(function () {
        return fallbackCopy(message);
      });
    }
    return Promise.resolve(fallbackCopy(message));
  }

  function messageFor(element) {
    var title = element.getAttribute('data-listing-title') || 'bất động sản này';
    var url = element.getAttribute('data-listing-url') || window.location.href;
    return 'Tôi quan tâm bất động sản: ' + title + '\n' + url;
  }

  document.addEventListener('click', function (event) {
    var contact = event.target.closest('[data-listing-contact]');
    if (contact) {
      copyMessage(messageFor(contact)).then(function (copied) {
        notify(copied
          ? 'Đã sao chép link bài đăng. Hãy dán vào khung chat để gửi cho GiaHuy Land.'
          : 'Zalo/Messenger đang mở. Bạn có thể sao chép URL bài đăng trên thanh địa chỉ để gửi.');
      });
      return;
    }

    var copyButton = event.target.closest('[data-copy-listing-link]');
    if (copyButton) {
      event.preventDefault();
      copyMessage(messageFor(copyButton)).then(function (copied) {
        notify(copied ? 'Đã sao chép thông tin và link bài đăng.' : 'Không thể tự sao chép. Vui lòng sao chép URL trên thanh địa chỉ.');
      });
    }
  });
})();
