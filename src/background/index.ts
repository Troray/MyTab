import { loadAppState, savePopupLastUsedGroupId } from '../services/storage';
import { executeWebdavSync } from '../services/webdav';
import { executeGitSync } from '../services/git';
import { checkBookmarkExists, addBookmark } from '../services/bookmark';

console.log('[MyTab Background] Service Worker initialized.');

// Check if running in browser extension context
if (typeof chrome !== 'undefined' && chrome.runtime) {
  // Listen for extension installation/update
  chrome.runtime.onInstalled?.addListener((details) => {
    console.log('[MyTab Background] Installed:', details.reason);
  });

  // Helper to convert blob to base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
    if (typeof FileReader !== 'undefined') {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } else {
      return blob.arrayBuffer().then((buf) => {
        const bytes = new Uint8Array(buf);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const b64 = btoa(binary);
        const mime = blob.type || 'image/png';
        return `data:${mime};base64,${b64}`;
      });
    }
  };

  // Handle message requests from frontend
  if (chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message.type === 'TRIGGER_SYNC') {
        loadAppState()
          .then(async (state) => {
            const results = [];
            if (state.webdav?.enabled) {
              results.push(await executeWebdavSync(state));
            }
            if (state.git?.enabled) {
              results.push(await executeGitSync(state));
            }
            return { success: true, results };
          })
          .then((res) => sendResponse(res))
          .catch((err) => sendResponse({ success: false, message: err.message }));
        return true; // async response
      }

      if (message.type === 'FETCH_BLOB_BASE64' && message.url) {
        fetch(message.url)
          .then((res) => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.blob();
          })
          .then((blob) => blobToBase64(blob))
          .then((base64) => sendResponse({ success: true, data: base64 }))
          .catch((err) => sendResponse({ success: false, error: err.message }));
        return true;
      }

      if (message.type === 'FETCH_HTML' && message.url) {
        fetch(message.url, {
          headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Cache-Control': 'no-cache',
          },
          redirect: 'follow',
        })
          .then((res) => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.text();
          })
          .then((html) => sendResponse({ success: true, data: html }))
          .catch((err) => sendResponse({ success: false, error: err.message }));
        return true;
      }

      if (message.type === 'GET_GROUPS') {
        loadAppState()
          .then((state) => sendResponse({ success: true, data: state.categories }))
          .catch((err) => sendResponse({ success: false, error: err.message }));
        return true;
      }

      if (message.type === 'CHECK_BOOKMARK_EXISTS' && message.url) {
        checkBookmarkExists(message.url)
          .then((exists) => sendResponse({ success: true, exists }))
          .catch((err) => sendResponse({ success: false, error: err.message }));
        return true;
      }

      if (message.type === 'ADD_BOOKMARK' && message.payload) {
        addBookmark(message.payload)
          .then(async (result) => {
            if (result.success) {
              // Save last used group ID
              await savePopupLastUsedGroupId(message.payload.categoryId);
            }
            sendResponse(result);
          })
          .catch((err) => sendResponse({ success: false, error: err.message }));
        return true;
      }
    });
  }
}
