import { t, Locale } from '../locales';
import { AppState, SyncPayload, WebdavConfig } from '../types';
import { getProfileSyncSettings, loadProfileContainer, saveProfileContainer, saveSettings, saveWebdavConfig } from './storage';
import { applyRemotePayload, buildSyncPayload } from './syncController';

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
  private lang: Locale;

  constructor(config: WebdavConfig, lang: Locale = 'zh-CN') {
    this.config = config;
    this.lang = lang;
  }

  /**
   * Test connection to WebDAV server
   */
  async testConnection(lang: Locale = this.lang): Promise<WebdavTestResult> {
    if (!this.config.url) {
      return { success: false, message: t('webdavUrlRequired', lang) };
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
        return { success: true, message: `${t('webdavConnectionSuccess', lang)} (HTTP ${res.status})` };
      } else if (res.status === 401 || res.status === 403) {
        return { success: false, message: `${t('webdavAuthFailed', lang)} (HTTP ${res.status})` };
      } else {
        return { success: false, message: `${t('gitStatusError', lang)} HTTP ${res.status} ${res.statusText}` };
      }
    } catch (err: any) {
      return { success: false, message: err.message || t('webdavNetworkError', lang) };
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
 * Main WebDAV Sync executor
 */
export async function executeWebdavSync(state: AppState): Promise<SyncResult> {
  const { webdav } = state;
  if (!webdav.enabled || !webdav.url) {
    return { success: false, message: t('webdavNotConfigured', state.settings?.language) };
  }

  const client = new WebdavClient(webdav, state.settings?.language);

  try {
    const remoteData = await client.download();
    const container = await loadProfileContainer();
    const syncPolicy = state.syncSettings || (await getProfileSyncSettings());

    // 1. Remote doesn't exist yet -> upload local filtered by sync policy
    if (!remoteData) {
      const payload = buildSyncPayload(container, state.settings, syncPolicy);
      await client.upload(payload);

      await saveWebdavConfig({
        ...webdav,
        lastSyncTime: payload.timestamp,
        lastSyncStatus: 'success',
        lastSyncError: undefined,
      });

      return { success: true, action: 'uploaded', message: t('webdavFirstSync', state.settings?.language) };
    }

    // 2. Resolve based on conflict strategy
    if (webdav.conflictStrategy === 'local') {
      const payload = buildSyncPayload(container, state.settings, syncPolicy);
      await client.upload(payload);
    } else {
      const { updatedContainer, updatedSettings } = applyRemotePayload(
        container,
        state.settings,
        remoteData,
        syncPolicy,
        webdav.conflictStrategy
      );

      await saveProfileContainer(updatedContainer);
      await saveSettings(updatedSettings);

      if (webdav.conflictStrategy === 'merge') {
        // Upload merged state back
        const mergedPayload = buildSyncPayload(updatedContainer, updatedSettings, syncPolicy);
        await client.upload(mergedPayload);
      }
    }

    const now = Date.now();
    await saveWebdavConfig({
      ...webdav,
      lastSyncTime: now,
      lastSyncStatus: 'success',
      lastSyncError: undefined,
    });

    const actionKey = webdav.conflictStrategy === 'remote'
      ? 'webdavRestoreSuccess'
      : webdav.conflictStrategy === 'local'
      ? 'webdavBackupSuccess'
      : 'webdavMerged';
    return {
      success: true,
      action: webdav.conflictStrategy === 'remote' ? 'downloaded' : webdav.conflictStrategy === 'local' ? 'uploaded' : 'merged',
      message: t(actionKey, state.settings?.language),
    };
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

  const client = new WebdavClient(webdav, state.settings?.language);
  try {
    const container = await loadProfileContainer();
    const syncPolicy = state.syncSettings || (await getProfileSyncSettings());
    const payload = buildSyncPayload(container, state.settings, syncPolicy);
    await client.upload(payload);

    await saveWebdavConfig({
      ...webdav,
      lastSyncTime: payload.timestamp,
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

  const client = new WebdavClient(webdav, state.settings?.language);
  try {
    const remoteData = await client.download();
    if (!remoteData) {
      return { success: false, message: t('webdavNoRemote', state.settings?.language) };
    }

    const container = await loadProfileContainer();
    const syncPolicy = state.syncSettings || (await getProfileSyncSettings());
    const { updatedContainer, updatedSettings } = applyRemotePayload(
      container,
      state.settings,
      remoteData,
      syncPolicy,
      'remote'
    );

    await saveProfileContainer(updatedContainer);
    await saveSettings(updatedSettings);

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

