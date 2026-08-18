import { loadAppState } from '../services/storage';
import { executeWebdavSync } from '../services/webdav';

console.log('[MyTab Background] Service Worker initialized.');

// Check if running in browser extension context
if (typeof chrome !== 'undefined' && chrome.runtime) {
  // Listen for extension installation/update
  chrome.runtime.onInstalled?.addListener((details) => {
    console.log('[MyTab Background] Installed:', details.reason);
    // Setup periodic sync alarm (e.g. every 60 minutes)
    if (chrome.alarms) {
      chrome.alarms.create('mytab_periodic_sync', {
        periodInMinutes: 60,
      });
    }
  });

  // Handle Alarms for background WebDAV sync
  if (chrome.alarms) {
    chrome.alarms.onAlarm.addListener(async (alarm) => {
      if (alarm.name === 'mytab_periodic_sync') {
        try {
          const state = await loadAppState();
          if (state.webdav?.enabled && state.webdav?.autoSync) {
            console.log('[MyTab Background] Running periodic WebDAV sync...');
            await executeWebdavSync(state);
          }
        } catch (err) {
          console.error('[MyTab Background] Periodic sync error:', err);
        }
      }
    });
  }

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
          .then((state) => executeWebdavSync(state))
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
        fetch(message.url)
          .then((res) => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.text();
          })
          .then((html) => sendResponse({ success: true, data: html }))
          .catch((err) => sendResponse({ success: false, error: err.message }));
        return true;
      }
    });
  }
}
