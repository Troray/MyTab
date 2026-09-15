// Standalone web / dev-server compatibility shim for webextension-polyfill and chrome APIs
if (typeof window !== 'undefined') {
  var isRealExtension = typeof location !== 'undefined' &&
    (location.protocol === 'chrome-extension:' || location.protocol === 'moz-extension:');

  if (!isRealExtension) {
    window.chrome = window.chrome || {};
    window.chrome.runtime = window.chrome.runtime || {};
    if (!window.chrome.runtime.id) {
      window.chrome.runtime.id = 'mytab-dev-extension';
    }
    if (!window.chrome.runtime.getURL) {
      window.chrome.runtime.getURL = function (path) {
        return '/' + String(path || '').replace(/^\.?\//, '');
      };
    }
    if (!window.chrome.runtime.sendMessage) {
      window.chrome.runtime.sendMessage = function (_msg, callback) {
        var res = { success: false, error: 'Web preview mode: extension background unavailable' };
        if (callback) callback(res);
        return Promise.resolve(res);
      };
    }
  }
}

try {
  var mode = localStorage.getItem('mytab_theme_mode');
  if (mode === 'dark') document.documentElement.classList.add('dark');
  
  var bg = localStorage.getItem('mytab_bg_cache');
  if (bg) {
    var style = document.createElement('style');
    style.id = 'mytab-init-bg';
    style.textContent = 'body { ' + bg + ' background-size: cover; background-position: center; background-repeat: no-repeat; margin: 0; min-height: 100vh; }';
    document.head.appendChild(style);
  }
} catch(e) {}
