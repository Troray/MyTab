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
    });
  }
}
