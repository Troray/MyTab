import { ProfileId } from '../types';
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

  // Helper to detect image MIME type from binary headers if missing or octet-stream
  const detectImageMime = (bytes: Uint8Array, fallback = 'image/png'): string => {
    if (bytes.length >= 4) {
      // PNG: 89 50 4E 47
      if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
        return 'image/png';
      }
      // GIF: 47 49 46 38
      if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
        return 'image/gif';
      }
      // JPEG: FF D8 FF
      if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
        return 'image/jpeg';
      }
      // WEBP: RIFF....WEBP
      if (
        bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
        bytes.length >= 12 &&
        bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
      ) {
        return 'image/webp';
      }
      // ICO: 00 00 01 00
      if (bytes[0] === 0x00 && bytes[1] === 0x00 && bytes[2] === 0x01 && bytes[3] === 0x00) {
        return 'image/x-icon';
      }
      // SVG: starts with '<'
      for (let i = 0; i < Math.min(bytes.length, 64); i++) {
        if (bytes[i] === 0x3c /* '<' */) {
          const str = String.fromCharCode(...bytes.slice(i, i + 10)).toLowerCase();
          if (str.startsWith('<svg') || str.startsWith('<?xml')) {
            return 'image/svg+xml';
          }
        }
      }
    }
    return fallback;
  };

  // Helper to validate whether a response is a legitimate image
  const isImageResponse = (res: Response, blob: Blob): boolean => {
    const contentType = (res.headers.get('content-type') || blob.type || '').toLowerCase();
    if (
      contentType.includes('text/html') ||
      contentType.includes('text/plain') ||
      contentType.includes('application/json') ||
      contentType.includes('text/xml')
    ) {
      return false;
    }
    if (blob.size < 50) {
      return false;
    }
    return true;
  };

  // Helper to convert blob to base64 with accurate MIME detection and chunked encoding
  const blobToBase64 = async (blob: Blob, urlHint?: string): Promise<string> => {
    const buf = await blob.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let mime = blob.type && blob.type.startsWith('image/') ? blob.type : '';
    if (!mime || mime === 'application/octet-stream') {
      let fallback = 'image/png';
      if (urlHint) {
        const lower = urlHint.toLowerCase().split('?')[0];
        if (lower.endsWith('.ico')) fallback = 'image/x-icon';
        else if (lower.endsWith('.svg')) fallback = 'image/svg+xml';
        else if (lower.endsWith('.webp')) fallback = 'image/webp';
        else if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) fallback = 'image/jpeg';
      }
      mime = detectImageMime(bytes, fallback);
    }

    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
      binary += String.fromCharCode.apply(null, chunk as any);
    }
    return `data:${mime};base64,${btoa(binary)}`;
  };

  // Probe a single favicon candidate URL
  const probeFaviconCandidate = async (url: string, timeoutMs = 2800): Promise<{ base64: string; url: string } | null> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          'Cache-Control': 'no-cache',
        },
        redirect: 'follow',
      });
      if (!res.ok) return null;
      const blob = await res.blob();
      if (!isImageResponse(res, blob)) return null;
      const base64 = await blobToBase64(blob, res.url || url);
      return { base64, url: res.url || url };
    } catch {
      return null;
    } finally {
      clearTimeout(timeoutId);
    }
  };

  // Helper to resolve profile from message payload or sender tab context
  const resolveProfile = (msg: any, sender: chrome.runtime.MessageSender): ProfileId => {
    if (msg?.profileId === 'private' || msg?.profileId === 'normal') {
      return msg.profileId;
    }
    if (sender?.tab?.incognito) {
      return 'private';
    }
    return 'normal';
  };

  // Handle message requests from frontend
  if (chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
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
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        fetch(message.url, {
          signal: controller.signal,
          headers: {
            'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          },
          redirect: 'follow',
        })
          .then(async (res) => {
            clearTimeout(timeoutId);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const blob = await res.blob();
            if (!isImageResponse(res, blob)) throw new Error('Response is not a valid image');
            return blobToBase64(blob, res.url || message.url);
          })
          .then((base64) => sendResponse({ success: true, data: base64 }))
          .catch((err) => {
            clearTimeout(timeoutId);
            sendResponse({ success: false, error: err.message });
          });
        return true;
      }

      if (message.type === 'RESOLVE_FAVICON_CANDIDATES' && Array.isArray(message.candidates)) {
        (async () => {
          const candidates: string[] = message.candidates.filter(
            (c: any) => typeof c === 'string' && c.trim()
          );

          // 1. If any candidate is already a valid data URI, return immediately
          const dataUri = candidates.find((c) => c.startsWith('data:image/'));
          if (dataUri) {
            sendResponse({ success: true, data: dataUri, sourceUrl: dataUri });
            return;
          }

          // 2. Separate into direct site candidates and CDN aggregators
          const isCdn = (u: string) =>
            u.includes('cravatar.com') ||
            u.includes('yandex.net') ||
            u.includes('duckduckgo.com') ||
            u.includes('gstatic.com') ||
            u.includes('faviconkit.com');

          const directCandidates = candidates.filter((c) => !isCdn(c));
          const cdnCandidates = candidates.filter((c) => isCdn(c));

          // 3. Try direct candidates concurrently (open tab, _favicon, html icons, direct root)
          if (directCandidates.length > 0) {
            const directPromises = directCandidates.slice(0, 4).map((u) => probeFaviconCandidate(u, 1800));
            const results = await Promise.allSettled(directPromises);
            for (const r of results) {
              if (r.status === 'fulfilled' && r.value) {
                sendResponse({ success: true, data: r.value.base64, sourceUrl: r.value.url });
                return;
              }
            }
          }

          // 4. If direct candidates failed or were unreachable (e.g. javbus), race CDN aggregators
          if (cdnCandidates.length > 0) {
            const cdnPromises = cdnCandidates.slice(0, 3).map((u) => probeFaviconCandidate(u, 2600));
            try {
              const winner = await Promise.any(
                cdnPromises.map((p) =>
                  p.then((res) => {
                    if (res) return res;
                    throw new Error('failed');
                  })
                )
              );
              if (winner) {
                sendResponse({ success: true, data: winner.base64, sourceUrl: winner.url });
                return;
              }
            } catch {
              // top 3 CDNs failed, try any remaining
              for (const remaining of cdnCandidates.slice(3)) {
                const res = await probeFaviconCandidate(remaining, 2000);
                if (res) {
                  sendResponse({ success: true, data: res.base64, sourceUrl: res.url });
                  return;
                }
              }
            }
          }

          sendResponse({ success: false });
        })();
        return true;
      }

      if (message.type === 'FETCH_HTML' && message.url) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4500);
        fetch(message.url, {
          signal: controller.signal,
          headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
            'Cache-Control': 'no-cache',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Upgrade-Insecure-Requests': '1',
          },
          redirect: 'follow',
        })
          .then(async (res) => {
            clearTimeout(timeoutId);
            const contentType = res.headers.get('content-type') || '';
            const html = await res.text();
            if (!res.ok && !contentType.includes('text/html')) {
              throw new Error(`HTTP ${res.status}`);
            }
            sendResponse({ success: true, data: html, finalUrl: res.url || message.url });
          })
          .catch((err) => {
            clearTimeout(timeoutId);
            sendResponse({ success: false, error: err.message });
          });
        return true;
      }

      if (message.type === 'GET_GROUPS') {
        const targetProfile = resolveProfile(message, sender);
        loadAppState(targetProfile)
          .then((state) => sendResponse({ success: true, data: state.categories }))
          .catch((err) => sendResponse({ success: false, error: err.message }));
        return true;
      }

      if (message.type === 'CHECK_BOOKMARK_EXISTS' && message.url) {
        const targetProfile = resolveProfile(message, sender);
        checkBookmarkExists(message.url, targetProfile)
          .then((result) => sendResponse({ success: true, exists: result.exists, sameDomainSite: result.sameDomainSite }))
          .catch((err) => sendResponse({ success: false, error: err.message }));
        return true;
      }

      if (message.type === 'ADD_BOOKMARK' && message.payload) {
        const targetProfile = resolveProfile(message, sender);
        addBookmark(message.payload, targetProfile)
          .then(async (result) => {
            if (result.success) {
              // Save last used group ID scoped to target profile
              await savePopupLastUsedGroupId(message.payload.categoryId, targetProfile);
            }
            sendResponse(result);
          })
          .catch((err) => sendResponse({ success: false, error: err.message }));
        return true;
      }
    });
  }

  // Handle shortcut command (e.g. Alt+M) to open MyTab in current window
  if (chrome.commands) {
    chrome.commands.onCommand?.addListener(async (command) => {
      if (command === 'open_mytab') {
        try {
          const win = await chrome.windows.getLastFocused({ populate: false }).catch(() => null);
          const isIncognito = Boolean(chrome.extension?.inIncognitoContext || win?.incognito);
          const targetPage = isIncognito ? 'private.html' : 'newtab.html';
          const createProps: chrome.tabs.CreateProperties = {
            url: chrome.runtime.getURL(targetPage),
          };
          if (win && typeof win.id === 'number') {
            createProps.windowId = win.id;
          }
          await chrome.tabs.create(createProps);
        } catch (err) {
          console.error('[MyTab Background] Failed to open tab on command:', err);
        }
      }
    });
  }
}


