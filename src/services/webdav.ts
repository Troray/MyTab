import { t, Locale } from '../locales';
import { AppState, Category, SiteItem, SyncPayload, ThemeSettings, WebdavConfig } from '../types';
import { loadAppState, saveCategories, saveSettings, saveSites, saveWebdavConfig } from './storage';

export interface WebdavTestResult {
  success: boolean;
  message?: string;
}

export interface SyncResult {
  success: boolean;
  action?: 'uploaded' | 'downloaded' | 'merged' | 'noop';
  message?: string;
}

function getAuthHeader(config: WebdavConfig): Record<string, string> {
  if (!config.username && !config.password) {
    return {};
  }
  const token = btoa(`${config.username}:${config.password || ''}`);
  return {
    'Authorization': `Basic ${token}`,
  };
}

function normalizeWebdavUrl(baseUrl: string, syncPath: string): string {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const cleanPath = syncPath.replace(/^\/+/, '');
  return `${cleanBase}/${cleanPath}`;
}

export class WebdavClient {
  private config: WebdavConfig;

  constructor(config: WebdavConfig) {
    this.config = config;
  }

  /**
   * Test connection to WebDAV server
   */
  async testConnection(): Promise<WebdavTestResult> {
    if (!this.config.url) {
      return { success: false, message: 'WebDAV URL is required' };
    }

    try {
      const headers = {
        ...getAuthHeader(this.config),
        'Depth': '0',
      };

      const res = await fetch(this.config.url, {
        method: 'PROPFIND',
        headers,
      });

      if (res.status === 207 || res.status === 200 || res.status === 204 || res.status === 404) {
        return { success: true, message: 'Connection successful (HTTP ' + res.status + ')' };
      } else if (res.status === 401 || res.status === 403) {
        return { success: false, message: 'Authentication failed: Invalid username or password (HTTP ' + res.status + ')' };
      } else {
        return { success: false, message: `Server returned HTTP status ${res.status} ${res.statusText}` };
      }
    } catch (err: any) {
      return { success: false, message: err.message || 'Network request failed' };
    }
  }

  /**
   * Ensure directory exists by attempting MKCOL for path hierarchy
   */
  async ensureDirectory(): Promise<void> {
    const cleanBase = this.config.url.replace(/\/+$/, '');
    const cleanPath = this.config.syncPath.replace(/^\/+/, '');
    const segments = cleanPath.split('/').slice(0, -1);

    let current = cleanBase;
    for (const seg of segments) {
      if (!seg) continue;
      current += `/${seg}`;
      try {
        await fetch(current, {
          method: 'MKCOL',
          headers: getAuthHeader(this.config),
        });
      } catch {
        // Directory may already exist, ignore errors
      }
    }
  }

  /**
   * Download sync JSON payload from WebDAV
   */
  async download(): Promise<SyncPayload | null> {
    const fullUrl = normalizeWebdavUrl(this.config.url, this.config.syncPath);
    const res = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        ...getAuthHeader(this.config),
      },
    });

    if (res.status === 404) {
      return null;
    }

    if (!res.ok) {
      throw new Error(`Failed to fetch remote file: HTTP ${res.status}`);
    }

    const json = await res.json();
    return json as SyncPayload;
  }

  /**
   * Upload sync JSON payload to WebDAV
   */
  async upload(payload: SyncPayload): Promise<void> {
    await this.ensureDirectory();
    const fullUrl = normalizeWebdavUrl(this.config.url, this.config.syncPath);

    const res = await fetch(fullUrl, {
      method: 'PUT',
      headers: {
        ...getAuthHeader(this.config),
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload, null, 2),
    });

    if (!res.ok && res.status !== 201 && res.status !== 204 && res.status !== 200) {
      throw new Error(`Failed to upload to WebDAV: HTTP ${res.status}`);
    }
  }
}

/**
 * Merge two lists of sites based on updatedAt timestamp
 */
function mergeSites(localSites: SiteItem[], remoteSites: SiteItem[]): SiteItem[] {
  const map = new Map<string, SiteItem>();

  for (const s of localSites) {
    map.set(s.id, s);
  }

  for (const s of remoteSites) {
    const existing = map.get(s.id);
    if (!existing) {
      map.set(s.id, s);
    } else {
      if ((s.updatedAt || 0) > (existing.updatedAt || 0)) {
        map.set(s.id, s);
      }
    }
  }

  return Array.from(map.values()).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
}

/**
 * Merge two lists of categories
 */
function mergeCategories(localCats: Category[], remoteCats: Category[]): Category[] {
  const map = new Map<string, Category>();

  for (const c of localCats) {
    map.set(c.id, c);
  }

  for (const c of remoteCats) {
    if (!map.has(c.id)) {
      map.set(c.id, c);
    }
  }

  return Array.from(map.values()).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
}

/**
 * Main WebDAV Sync executor
 */
export async function executeWebdavSync(state: AppState): Promise<SyncResult> {
  const { webdav } = state;
  if (!webdav.enabled || !webdav.url) {
    return { success: false, message: 'WebDAV sync is not configured or disabled' };
  }

  const client = new WebdavClient(webdav);

  try {
    const remoteData = await client.download();
    const now = Date.now();

    // 1. Remote doesn't exist yet -> upload local
    if (!remoteData) {
      const payload: SyncPayload = {
        version: 1,
        timestamp: now,
        categories: state.categories,
        sites: state.sites,
        settings: state.settings,
      };
      await client.upload(payload);

      await saveWebdavConfig({
        ...webdav,
        lastSyncTime: now,
        lastSyncStatus: 'success',
        lastSyncError: undefined,
      });

      return { success: true, action: 'uploaded', message: t('webdavFirstSync', state.settings?.language) };
    }

    // 2. Resolve based on conflict strategy
    if (webdav.conflictStrategy === 'local') {
      const payload: SyncPayload = {
        version: 1,
        timestamp: now,
        categories: state.categories,
        sites: state.sites,
        settings: state.settings,
      };
      await client.upload(payload);
    } else if (webdav.conflictStrategy === 'remote') {
      await saveCategories(remoteData.categories || state.categories);
      await saveSites(remoteData.sites || state.sites);
      if (remoteData.settings) {
        await saveSettings({ ...state.settings, ...remoteData.settings });
      }
    } else {
      // 'merge' strategy
      const mergedSites = mergeSites(state.sites, remoteData.sites || []);
      const mergedCats = mergeCategories(state.categories, remoteData.categories || []);
      
      const localSettingsTime = state.settings?.updatedAt || 0;
      const remoteSettingsTime = remoteData.settings?.updatedAt || remoteData.timestamp || 0;

      let finalSettings: ThemeSettings;
      if (remoteData.settings && remoteSettingsTime > localSettingsTime) {
        // Remote settings are strictly newer -> apply remote
        finalSettings = { ...state.settings, ...remoteData.settings };
        await saveSettings(finalSettings);
      } else {
        // Local settings are newer or equal -> keep local
        finalSettings = { ...state.settings };
        await saveSettings(finalSettings);
      }

      await saveSites(mergedSites);
      await saveCategories(mergedCats);

      // Upload merged state back
      const payload: SyncPayload = {
        version: 1,
        timestamp: now,
        categories: mergedCats,
        sites: mergedSites,
        settings: finalSettings,
      };
      await client.upload(payload);
    }

    await saveWebdavConfig({
      ...webdav,
      lastSyncTime: now,
      lastSyncStatus: 'success',
      lastSyncError: undefined,
    });

    return { success: true, action: 'merged', message: t('webdavMerged', state.settings?.language) };
  } catch (err: any) {
    const errMsg = err.message || t('webdavSyncFailed', state.settings?.language);
    await saveWebdavConfig({
      ...webdav,
      lastSyncStatus: 'failed',
      lastSyncError: errMsg,
    });
    return { success: false, message: err.message };
  }
}

/**
 * Explicit Upload/Backup from Local to WebDAV
 */
export async function uploadToWebdav(state: AppState): Promise<SyncResult> {
  const { webdav } = state;
  if (!webdav.enabled || !webdav.url) {
    return { success: false, message: t('webdavNotConfigured', state.settings?.language) };
  }

  const client = new WebdavClient(webdav);
  try {
    const now = Date.now();
    const payload: SyncPayload = {
      version: 1,
      timestamp: now,
      categories: state.categories,
      sites: state.sites,
      settings: { ...state.settings, updatedAt: now },
    };
    await client.upload(payload);
    await saveWebdavConfig({
      ...webdav,
      lastSyncTime: now,
      lastSyncStatus: 'success',
      lastSyncError: undefined,
    });
    return { success: true, action: 'uploaded', message: t('webdavBackupSuccess', state.settings?.language) };
  } catch (err: any) {
    const errMsg = err.message || t('webdavBackupFailed', state.settings?.language);
    await saveWebdavConfig({ ...webdav, lastSyncStatus: 'failed', lastSyncError: errMsg });
    return { success: false, message: err.message };
  }
}

/**
 * Explicit Pull/Restore from WebDAV to Local
 */
export async function restoreFromWebdav(state: AppState): Promise<SyncResult> {
  const { webdav } = state;
  if (!webdav.enabled || !webdav.url) {
    return { success: false, message: t('webdavNotConfigured', state.settings?.language) };
  }

  const client = new WebdavClient(webdav);
  try {
    const remoteData = await client.download();
    if (!remoteData) {
      return { success: false, message: t('webdavNoRemote', state.settings?.language) };
    }
    if (remoteData.categories && Array.isArray(remoteData.categories)) {
      await saveCategories(remoteData.categories);
    }
    if (remoteData.sites && Array.isArray(remoteData.sites)) {
      await saveSites(remoteData.sites);
    }
    if (remoteData.settings) {
      await saveSettings(remoteData.settings);
    }
    const now = Date.now();
    await saveWebdavConfig({
      ...webdav,
      lastSyncTime: now,
      lastSyncStatus: 'success',
      lastSyncError: undefined,
    });
    return { success: true, action: 'downloaded', message: t('webdavRestoreSuccess', state.settings?.language) };
  } catch (err: any) {
    const errMsg = err.message || t('webdavRestoreFailed', state.settings?.language);
    await saveWebdavConfig({ ...webdav, lastSyncStatus: 'failed', lastSyncError: errMsg });
    return { success: false, message: err.message };
  }
}
