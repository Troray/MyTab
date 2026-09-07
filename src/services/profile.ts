import browser from 'webextension-polyfill';
import { ProfileId } from '../types';

/**
 * Resolves the ProfileId for the current browser window.
 * - If current window is incognito/private, returns 'private'.
 * - Otherwise returns 'normal'.
 *
 * In non-extension or dev environments where browser.windows is unavailable,
 * falls back safely to 'normal'.
 */
export async function getCurrentProfileId(): Promise<ProfileId> {
  // Fast-path 1: explicitly loaded via private.html
  if (typeof window !== 'undefined' && window.location?.pathname?.includes('private.html')) {
    return 'private';
  }

  // Fast-path 2: running in extension incognito context
  if (typeof chrome !== 'undefined' && chrome.extension?.inIncognitoContext) {
    return 'private';
  }

  try {
    if (typeof browser !== 'undefined' && browser.windows && typeof browser.windows.getCurrent === 'function') {
      const win = await browser.windows.getCurrent();
      if (win && win.incognito) {
        return 'private';
      }
    } else if (typeof chrome !== 'undefined' && chrome.windows && typeof chrome.windows.getCurrent === 'function') {
      const win = await new Promise<chrome.windows.Window | null>((resolve) => {
        try {
          chrome.windows.getCurrent((w) => {
            if (chrome.runtime?.lastError || !w) {
              resolve(null);
            } else {
              resolve(w);
            }
          });
        } catch {
          resolve(null);
        }
      });
      if (win && win.incognito) {
        return 'private';
      }
    }
  } catch (e) {
    console.warn('[Profile Resolver] Failed to detect window incognito status:', e);
  }
  return 'normal';
}

/**
 * Resolves the ProfileId from a given tab object (useful in background message handler).
 */
export function getTabProfileId(tab?: { incognito?: boolean } | null): ProfileId {
  return tab?.incognito ? 'private' : 'normal';
}

