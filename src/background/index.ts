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
        const len = bytes.byteLength;
        const chunkSize = 8192;
        for (let i = 0; i < len; i += chunkSize) {
          const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
          binary += String.fromCharCode.apply(null, chunk as any);
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
        const p = loadAppState()
          .then((state) => executeWebdavSync(state))
          .catch((err) => ({ success: false, message: err.message }));
        p.then((res) => sendResponse(res));
        return p;
      }

      if (message.type === 'FETCH_BLOB_BASE64' && message.url) {
        const p = (async () => {
          try {
            const res = await fetch(message.url, { redirect: 'follow' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const blob = await res.blob();
            const base64 = await blobToBase64(blob);
            return { success: true, data: base64 };
          } catch (err: any) {
            return { success: false, error: err?.message || 'Fetch failed' };
          }
        })();

        p.then((res) => sendResponse(res));
        return p;
      }

      if (message.type === 'FETCH_HTML' && message.url) {
        const p = (async () => {
          try {
            const res = await fetch(message.url, { redirect: 'follow' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const html = await res.text();
            return { success: true, data: html };
          } catch (err: any) {
            return { success: false, error: err?.message || 'Fetch failed' };
          }
        })();

        p.then((res) => sendResponse(res));
        return p;
      }
    });
  }
}
