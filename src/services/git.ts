import { AppState, Category, GitSyncConfig, SiteItem, SyncPayload } from '../types';
import { loadAppState, saveCategories, saveGitConfig, saveSettings, saveSites } from './storage';

export interface GitTestResult {
  success: boolean;
  message?: string;
}

export interface GitSyncResult {
  success: boolean;
  action?: 'uploaded' | 'downloaded' | 'merged' | 'noop';
  message?: string;
}

function getApiBaseUrl(provider: 'github' | 'gitee'): string {
  return provider === 'gitee' ? 'https://gitee.com/api/v5' : 'https://api.github.com';
}

function getHeaders(config: GitSyncConfig): Record<string, string> {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json; charset=utf-8',
  };

  if (config.token) {
    if (config.provider === 'github') {
      headers['Authorization'] = `Bearer ${config.token}`;
    } else {
      headers['Authorization'] = `token ${config.token}`;
    }
  }

  return headers;
}

export class GitClient {
  private config: GitSyncConfig;

  constructor(config: GitSyncConfig) {
    this.config = config;
  }

  /**
   * Test repo access and token validity
   */
  async testConnection(): Promise<GitTestResult> {
    const { provider, owner, repo, token } = this.config;
    if (!owner || !repo) {
      return { success: false, message: '请填写仓库所有者 (Owner) 与 仓库名 (Repo)' };
    }
    if (!token) {
      return { success: false, message: '请填写 Personal Access Token (PAT)' };
    }

    try {
      const baseUrl = getApiBaseUrl(provider);
      const url = `${baseUrl}/repos/${owner}/${repo}?_t=${Date.now()}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: getHeaders(this.config),
        cache: 'no-store',
      });

      if (res.status === 200) {
        const data = await res.json();
        const isPrivate = data.private ? '私有仓库' : '公开仓库';
        return { success: true, message: `连接成功！已找到 ${isPrivate} [${data.full_name || repo}]` };
      } else if (res.status === 401 || res.status === 403) {
        return { success: false, message: `Token 无效或权限不足 (HTTP ${res.status})` };
      } else if (res.status === 404) {
        return { success: false, message: `仓库不存在或 Token 无权访问此私有仓库 (HTTP 404)` };
      } else {
        return { success: false, message: `服务器返回状态码 HTTP ${res.status}` };
      }
    } catch (err: any) {
      return { success: false, message: err.message || '网络请求失败' };
    }
  }

  /**
   * Get file from repository
   */
  async getFile(): Promise<{ payload: SyncPayload | null; sha?: string }> {
    const { provider, owner, repo, branch, path } = this.config;
    const baseUrl = getApiBaseUrl(provider);
    const cleanPath = path.replace(/^\/+/, '');
    const cleanBranch = branch || 'main';

    let url = `${baseUrl}/repos/${owner}/${repo}/contents/${cleanPath}?ref=${cleanBranch}&_t=${Date.now()}`;
    if (provider === 'gitee') {
      url += `&access_token=${this.config.token}`;
    }

    const res = await fetch(url, {
      method: 'GET',
      headers: getHeaders(this.config),
      cache: 'no-store',
    });

    if (res.status === 404) {
      return { payload: null };
    }

    if (!res.ok) {
      throw new Error(`获取仓库文件失败: HTTP ${res.status}`);
    }

    const data = await res.json();
    const rawContent = data.content ? atob(data.content.replace(/\s/g, '')) : '';
    // Handle UTF-8 decoding
    const decoded = decodeURIComponent(escape(rawContent));
    const payload = JSON.parse(decoded) as SyncPayload;

    return { payload, sha: data.sha };
  }

  /**
   * Create or update file in repository (with auto-retry on SHA conflict)
   */
  async putFile(payload: SyncPayload, previousSha?: string, retryCount = 0): Promise<void> {
    const { provider, owner, repo, branch, path, token } = this.config;
    const baseUrl = getApiBaseUrl(provider);
    const cleanPath = path.replace(/^\/+/, '');
    const cleanBranch = branch || 'main';

    const url = `${baseUrl}/repos/${owner}/${repo}/contents/${cleanPath}`;

    // Convert UTF-8 string to base64
    const jsonString = JSON.stringify(payload, null, 2);
    // Format timestamp using user's local timezone (YYYY-MM-DD HH:mm:ss)
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const localTimeStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const bodyData: any = {
      message: `backup: MyTab sync at ${localTimeStr}`,
      content: base64Content,
      branch: cleanBranch,
    };

    if (previousSha) {
      bodyData.sha = previousSha;
    }

    if (provider === 'gitee') {
      bodyData.access_token = token;
    }

    const res = await fetch(url, {
      method: 'PUT',
      headers: getHeaders(this.config),
      body: JSON.stringify(bodyData),
    });

    if (!res.ok && res.status !== 201 && res.status !== 200) {
      const errJson = await res.json().catch(() => ({}));
      const errorMsg = errJson.message || '';

      // Auto-recovery for SHA conflict (HTTP 409 or sha mismatch)
      if ((res.status === 409 || errorMsg.includes('does not match') || errorMsg.includes('sha')) && retryCount < 2) {
        console.warn('[Git Sync] SHA conflict detected, auto-fetching latest SHA and retrying...');
        const latest = await this.getFile();
        return this.putFile(payload, latest.sha, retryCount + 1);
      }

      throw new Error(errorMsg || `上传失败 HTTP ${res.status}`);
    }
  }
}

/**
 * Execute Git Sync
 */
export async function executeGitSync(state: AppState): Promise<GitSyncResult> {
  const { git } = state;
  if (!git.enabled || !git.owner || !git.repo || !git.token) {
    return { success: false, message: 'Git 同步未完整配置或已禁用' };
  }

  const client = new GitClient(git);

  try {
    const { payload: remotePayload, sha: remoteSha } = await client.getFile();
    const now = Date.now();

    // 1. If file does not exist in repo yet -> upload local
    if (!remotePayload) {
      const payload: SyncPayload = {
        version: 1,
        timestamp: now,
        categories: state.categories,
        sites: state.sites,
        settings: state.settings,
      };
      await client.putFile(payload);

      await saveGitConfig({
        ...git,
        lastSyncTime: now,
        lastSyncStatus: 'success',
        lastSyncError: undefined,
      });

      return { success: true, action: 'uploaded', message: `已成功创建备份文件至 [${git.repo}] 仓库` };
    }

    // 2. Merge sites & categories based on timestamp
    const mapSites = new Map<string, SiteItem>();
    for (const s of state.sites) mapSites.set(s.id, s);
    for (const s of remotePayload.sites || []) {
      const existing = mapSites.get(s.id);
      if (!existing || (s.updatedAt || 0) > (existing.updatedAt || 0)) {
        mapSites.set(s.id, s);
      }
    }
    const mergedSites = Array.from(mapSites.values()).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

    const mapCats = new Map<string, Category>();
    for (const c of state.categories) mapCats.set(c.id, c);
    for (const c of remotePayload.categories || []) {
      if (!mapCats.has(c.id)) mapCats.set(c.id, c);
    }
    const mergedCats = Array.from(mapCats.values()).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

    // Merge Settings (Appearance & Preferences) based on timestamp
    const localSettingsTime = state.settings?.updatedAt || 0;
    const remoteSettingsTime = remotePayload.settings?.updatedAt || remotePayload.timestamp || 0;

    let finalSettings: ThemeSettings;
    if (remotePayload.settings && remoteSettingsTime > localSettingsTime) {
      // Remote settings are strictly newer -> update local from remote
      finalSettings = { ...state.settings, ...remotePayload.settings };
      await saveSettings(finalSettings);
    } else {
      // Local settings are newer or equal -> keep local changes
      finalSettings = { ...state.settings };
      await saveSettings(finalSettings);
    }

    await saveSites(mergedSites);
    await saveCategories(mergedCats);

    // Upload merged result to Git repo
    const newPayload: SyncPayload = {
      version: 1,
      timestamp: now,
      categories: mergedCats,
      sites: mergedSites,
      settings: finalSettings,
    };
    await client.putFile(newPayload, remoteSha);

    await saveGitConfig({
      ...git,
      lastSyncTime: now,
      lastSyncStatus: 'success',
      lastSyncError: undefined,
    });

    return { success: true, action: 'merged', message: 'Git 同步与双向合并完成' };
  } catch (err: any) {
    const errMsg = err.message || 'Git 同步失败';
    await saveGitConfig({
      ...git,
      lastSyncStatus: 'failed',
      lastSyncError: errMsg,
    });
    return { success: false, message: errMsg };
  }
}

/**
 * Explicit Upload/Backup from Local to Git Repository
 */
export async function uploadToGit(state: AppState): Promise<GitSyncResult> {
  const { git } = state;
  if (!git.enabled || !git.owner || !git.repo || !git.token) {
    return { success: false, message: 'Git 同步未完整配置或已禁用' };
  }

  const client = new GitClient(git);
  try {
    const { sha: remoteSha } = await client.getFile();
    const now = Date.now();
    const payload: SyncPayload = {
      version: 1,
      timestamp: now,
      categories: state.categories,
      sites: state.sites,
      settings: { ...state.settings, updatedAt: now },
    };
    await client.putFile(payload, remoteSha);
    await saveGitConfig({
      ...git,
      lastSyncTime: now,
      lastSyncStatus: 'success',
      lastSyncError: undefined,
    });
    return { success: true, action: 'uploaded', message: `已成功将本地数据上传备份至 [${git.repo}] 仓库！` };
  } catch (err: any) {
    const errMsg = err.message || '上传备份失败';
    await saveGitConfig({ ...git, lastSyncStatus: 'failed', lastSyncError: errMsg });
    return { success: false, message: errMsg };
  }
}

/**
 * Explicit Pull/Restore from Git Repository to Local
 */
export async function restoreFromGit(state: AppState): Promise<GitSyncResult> {
  const { git } = state;
  if (!git.enabled || !git.owner || !git.repo || !git.token) {
    return { success: false, message: 'Git 同步未完整配置或已禁用' };
  }

  const client = new GitClient(git);
  try {
    const { payload: remotePayload } = await client.getFile();
    if (!remotePayload) {
      return { success: false, message: 'Git 仓库中未找到备份文件，请先在本地点击上传备份' };
    }
    if (remotePayload.categories && Array.isArray(remotePayload.categories)) {
      await saveCategories(remotePayload.categories);
    }
    if (remotePayload.sites && Array.isArray(remotePayload.sites)) {
      await saveSites(remotePayload.sites);
    }
    if (remotePayload.settings) {
      await saveSettings(remotePayload.settings);
    }
    const now = Date.now();
    await saveGitConfig({
      ...git,
      lastSyncTime: now,
      lastSyncStatus: 'success',
      lastSyncError: undefined,
    });
    return { success: true, action: 'downloaded', message: `已成功从 [${git.repo}] 仓库拉取并恢复数据！` };
  } catch (err: any) {
    const errMsg = err.message || '拉取恢复失败';
    await saveGitConfig({ ...git, lastSyncStatus: 'failed', lastSyncError: errMsg });
    return { success: false, message: errMsg };
  }
}
