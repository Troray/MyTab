import { AppState, Category, GitSyncConfig, SiteItem, ThemeSettings, WebdavConfig } from '../types';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_SITES,
  DEFAULT_SETTINGS,
  DEFAULT_WEBDAV_CONFIG,
  DEFAULT_GIT_CONFIG
} from '../utils/constants';

const STORAGE_KEYS = {
  SITES: 'mytab_sites',
  CATEGORIES: 'mytab_categories',
  SETTINGS: 'mytab_settings',
  WEBDAV: 'mytab_webdav',
  GIT: 'mytab_git',
  FIRST_LAUNCH: 'mytab_first_launch',
  ACTIVE_CATEGORY: 'mytab_active_category'
};

// Check if running inside chrome/browser extension context
export const isExtension = typeof chrome !== 'undefined' && !!chrome.storage && !!chrome.storage.local;

async function getItem<T>(key: string, defaultValue: T): Promise<T> {
  if (isExtension) {
    try {
      const res = await chrome.storage.local.get(key);
      if (res && res[key] !== undefined) {
        return res[key];
      }
    } catch (e) {
      console.warn(`[Storage] Failed to read ${key} from extension storage, falling back to localStorage`, e);
    }
  }

  const raw = localStorage.getItem(key);
  if (raw === null) return defaultValue;
  try {
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

async function setItem<T>(key: string, value: T): Promise<void> {
  if (isExtension) {
    try {
      await chrome.storage.local.set({ [key]: value });
      return;
    } catch (e) {
      console.warn(`[Storage] Failed to write ${key} to extension storage, saving to localStorage`, e);
    }
  }

  localStorage.setItem(key, JSON.stringify(value));
}

export async function loadAppState(): Promise<AppState> {
  const [sites, categories, settings, webdav, git, isFirst, activeCat] = await Promise.all([
    getItem<SiteItem[]>(STORAGE_KEYS.SITES, DEFAULT_SITES),
    getItem<Category[]>(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES),
    getItem<ThemeSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS),
    getItem<WebdavConfig>(STORAGE_KEYS.WEBDAV, DEFAULT_WEBDAV_CONFIG),
    getItem<GitSyncConfig>(STORAGE_KEYS.GIT, DEFAULT_GIT_CONFIG),
    getItem<boolean>(STORAGE_KEYS.FIRST_LAUNCH, true),
    getItem<string>(STORAGE_KEYS.ACTIVE_CATEGORY, 'all'),
  ]);

  return {
    sites,
    categories,
    settings: { ...DEFAULT_SETTINGS, ...settings },
    webdav: { ...DEFAULT_WEBDAV_CONFIG, ...webdav },
    git: { ...DEFAULT_GIT_CONFIG, ...git },
    isFirstLaunch: isFirst,
    activeCategoryId: activeCat,
  };
}

export async function saveSites(sites: SiteItem[]): Promise<void> {
  await setItem(STORAGE_KEYS.SITES, sites);
}

export async function saveCategories(categories: Category[]): Promise<void> {
  await setItem(STORAGE_KEYS.CATEGORIES, categories);
}

export async function saveSettings(settings: ThemeSettings): Promise<void> {
  await setItem(STORAGE_KEYS.SETTINGS, settings);
}

export async function saveWebdavConfig(webdav: WebdavConfig): Promise<void> {
  await setItem(STORAGE_KEYS.WEBDAV, webdav);
}

export async function saveGitConfig(git: GitSyncConfig): Promise<void> {
  await setItem(STORAGE_KEYS.GIT, git);
}

export async function setFirstLaunchComplete(): Promise<void> {
  await setItem(STORAGE_KEYS.FIRST_LAUNCH, false);
}

export async function saveActiveCategory(catId: string): Promise<void> {
  await setItem(STORAGE_KEYS.ACTIVE_CATEGORY, catId);
}

export async function exportAllData(): Promise<string> {
  const state = await loadAppState();
  const exportPayload = {
    app: 'MyTab',
    version: 1,
    exportTime: Date.now(),
    categories: state.categories,
    sites: state.sites,
    settings: state.settings,
  };
  return JSON.stringify(exportPayload, null, 2);
}

export async function importData(jsonString: string): Promise<{ success: boolean; error?: string }> {
  try {
    const data = JSON.parse(jsonString);
    if (!data.sites || !Array.isArray(data.sites)) {
      return { success: false, error: 'Invalid data: missing sites array' };
    }

    if (data.categories && Array.isArray(data.categories)) {
      await saveCategories(data.categories);
    }
    if (data.sites && Array.isArray(data.sites)) {
      await saveSites(data.sites);
    }
    if (data.settings && typeof data.settings === 'object') {
      await saveSettings({ ...DEFAULT_SETTINGS, ...data.settings });
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'JSON parse error' };
  }
}
