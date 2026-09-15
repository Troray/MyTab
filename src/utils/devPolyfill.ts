/**
 * Standalone Web / Vite Dev Server compatibility layer.
 * Polyfills minimal chrome.runtime and browser objects when running outside
 * of an unpacked browser extension context (e.g., http://localhost:5173).
 *
 * This prevents webextension-polyfill from throwing:
 * "Uncaught Error: This script should only be loaded in a browser extension."
 */

if (typeof globalThis !== 'undefined') {
  const isRealExtension =
    typeof location !== 'undefined' &&
    (location.protocol === 'chrome-extension:' || location.protocol === 'moz-extension:');

  if (!isRealExtension) {
    const g = globalThis as any;
    g.chrome = g.chrome || {};
    g.chrome.runtime = g.chrome.runtime || {};

    if (!g.chrome.runtime.id) {
      g.chrome.runtime.id = 'mytab-dev-extension';
    }

    if (!g.chrome.runtime.getURL) {
      g.chrome.runtime.getURL = (path: string) => {
        return '/' + String(path || '').replace(/^\.?\//, '');
      };
    }

    if (!g.chrome.runtime.sendMessage) {
      g.chrome.runtime.sendMessage = (_msg: any, callback?: (res: any) => void) => {
        const res = { success: false, error: 'Web preview mode: extension background unavailable' };
        if (callback) callback(res);
        return Promise.resolve(res);
      };
    }
  }
}

export {};
