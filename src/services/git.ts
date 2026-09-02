import { t, Locale } from '../locales';
import { AppState, Category, GitSyncConfig, GitPlatformConfig, SiteItem, SyncPayload, ThemeSettings } from '../types';
import { loadAppState, saveCategories, saveGitConfig, saveSettings, saveSites } from './storage';
import { DEFAULT_SETTINGS } from '../utils/constants';

export interface GitTestResult {
  success: boolean;
  message?: string;
  owner?: string;
  avatarUrl?: string;
  gistId?: string;
}

export interface GitSyncResult {
  success: boolean;
  action?: 'uploaded' | 'downloaded' | 'merged' | 'noop';
  message?: string;
}

const GIST_FILENAME = 'mytab-backup.json';
const GIST_DESCRIPTION = 'MyTab 新标签页配置备份数据';

function getApiBaseUrl(provider: 'github' | 'gitee'): string {
  return provider === 'gitee' ? 'https://gitee.com/api/v5' : 'https://api.github.com';
}

function getHeaders(token: string, provider: 'github' | 'gitee'): Record<string, string> {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json; charset=utf-8',
  };

  if (token) {
    if (provider === 'github') {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      headers['Authorization'] = `token ${token}`;
    }
  }

  return headers;
}

/**
 * Escapes 4-byte unicode characters (like emojis) to their \uXXXX\uXXXX representation
 * to prevent MySQL string value errors when saving to Gitee Gist.
 */
function escapeUnicodeEmojis(str: string): string {
  return str.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, (match) => {
    return `\\u${match.charCodeAt(0).toString(16).padStart(4, '0')}\\u${match.charCodeAt(1).toString(16).padStart(4, '0')}`;
  });
}

/**
 * Auto-detect user identity and auto create/find private Gist
 */
async function findExistingGist(provider: 'github' | 'gitee', token: string): Promise<string | undefined> {
  const baseUrl = getApiBaseUrl(provider);
  const headers = getHeaders(token, provider);
  let gistsUrl = `${baseUrl}/gists?_t=${Date.now()}&per_page=100`;
  if (provider === 'gitee') {
    gistsUrl += `&access_token=${token}`;
  }

  try {
    const gistsRes = await fetch(gistsUrl, { method: 'GET', headers, cache: 'no-store' });
    if (gistsRes.ok) {
      const gists = await gistsRes.json();
      if (Array.isArray(gists)) {
        const found = gists.find((g: any) =>
          (g.files && g.files[GIST_FILENAME]) ||
          (g.description && g.description.includes('MyTab'))
        );
        if (found) {
          return found.id;
        }
      }
    }
  } catch {
    // Ignore errors during silent discovery
  }
  return undefined;
}

export async function autoSetupGist(provider: 'github' | 'gitee', token: string, lang: Locale = 'zh-CN'): Promise<GitTestResult> {
  if (!token.trim()) {
    return { success: false, message: t('gitTokenEmpty', typeof state !== 'undefined' ? state.settings?.language : typeof lang !== 'undefined' ? lang : 'zh-CN') };
  }

  const baseUrl = getApiBaseUrl(provider);
  const headers = getHeaders(token, provider);

  try {
    // 1. Fetch user profile
    let userUrl = `${baseUrl}/user?_t=${Date.now()}`;
    if (provider === 'gitee') {
      userUrl += `&access_token=${token}`;
    }

    const userRes = await fetch(userUrl, { method: 'GET', headers, cache: 'no-store' });
    if (!userRes.ok) {
      if (userRes.status === 401 || userRes.status === 403) {
        return { success: false, message: t('gitTokenInvalid', typeof lang !== 'undefined' ? lang : 'zh-CN') };
      }
      return { success: false, message: `${t('gitUserInfoFailed', typeof lang !== 'undefined' ? lang : 'zh-CN')} (HTTP ${userRes.status})` };
    }

    const userData = await userRes.json();
    const owner = userData.login || userData.name || 'User';
    const avatarUrl = userData.avatar_url;

    // 2. Search for existing MyTab Gist
    let existingGistId = await findExistingGist(provider, token);

    // 3. If no Gist found -> Create a new private Gist
    if (!existingGistId) {
      const createGistUrl = `${baseUrl}/gists`;
      const initialPayload: SyncPayload = {
        version: 1,
        timestamp: Date.now(),
        categories: [],
        sites: [],
        settings: { ...DEFAULT_SETTINGS, updatedAt: Date.now() },
      };

      const createBody: any = {
        description: GIST_DESCRIPTION,
        public: false,
        files: {
          [GIST_FILENAME]: {
            content: escapeUnicodeEmojis(JSON.stringify(initialPayload, null, 2)),
          },
        },
      };

      if (provider === 'gitee') {
        createBody.access_token = token;
      }

      const createRes = await fetch(createGistUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(createBody),
      });

      if (!createRes.ok) {
        const err = await createRes.json().catch(() => ({}));
        return {
          success: false,
          message: `${t('gitGistFailed', typeof lang !== 'undefined' ? lang : 'zh-CN')}${err.message || ''}`,
        };
      }

      const createdData = await createRes.json();
      existingGistId = createdData.id;
    }

    return {
      success: true,
      owner,
      avatarUrl,
      gistId: existingGistId,
      message: `${t('gitConnected', typeof lang !== 'undefined' ? lang : 'zh-CN')} @${owner}`,
    };
  } catch (err: any) {
    return { success: false, message: err.message || t('gitNetworkError', typeof lang !== 'undefined' ? lang : 'zh-CN') };
  }
}

/**
 * Helper to identify if a string is a token rather than a repository or username
 */
export function isTokenLike(str?: string): boolean {
  if (!str) return false;
  const s = str.trim();
  if (
    s.startsWith('ghp_') ||
    s.startsWith('github_pat_') ||
    s.startsWith('gho_') ||
    s.startsWith('ghu_') ||
    s.startsWith('ghs_') ||
    s.startsWith('ghr_') ||
    (s.length >= 36 && /^[a-f0-9]+$/i.test(s))
  ) {
    return true;
  }
  return false;
}

/**
 * Auto-detect user identity and auto create/connect private repository
 */
export async function autoSetupRepo(
  provider: 'github' | 'gitee',
  token: string,
  targetRepoName = 'MyTab-Backup',
  specifiedOwner?: string,
  lang: Locale = 'zh-CN'
): Promise<GitTestResult & { repo?: string; branch?: string; owner?: string }> {
  if (!token.trim()) {
    return { success: false, message: t('gitTokenEmpty', typeof state !== 'undefined' ? state.settings?.language : typeof lang !== 'undefined' ? lang : 'zh-CN') };
  }

  const baseUrl = getApiBaseUrl(provider);
  const headers = getHeaders(token, provider);

  try {
    // 1. Fetch user profile
    let userUrl = `${baseUrl}/user?_t=${Date.now()}`;
    if (provider === 'gitee') {
      userUrl += `&access_token=${token}`;
    }

    const userRes = await fetch(userUrl, { method: 'GET', headers, cache: 'no-store' });
    if (!userRes.ok) {
      if (userRes.status === 401 || userRes.status === 403) {
        return { success: false, message: t('gitRepoTokenInvalid', typeof lang !== 'undefined' ? lang : 'zh-CN') };
      }
      return { success: false, message: `${t('gitUserInfoFailed', typeof lang !== 'undefined' ? lang : 'zh-CN')} (HTTP ${userRes.status})` };
    }

    const userData = await userRes.json();
    const userLogin = userData.login || userData.name || 'User';
    // If specifiedOwner is token-like or default, fallback to userLogin
    const owner = (specifiedOwner && !isTokenLike(specifiedOwner) && specifiedOwner !== 'User') ? specifiedOwner : userLogin;

    // Sanitize targetRepoName - NEVER allow token-like string as repo name
    let cleanRepo = targetRepoName.trim();
    if (!cleanRepo || isTokenLike(cleanRepo) || cleanRepo === owner) {
      cleanRepo = 'MyTab-Backup';
    }

    // 2. Check if repository exists
    let repoUrl = `${baseUrl}/repos/${owner}/${cleanRepo}?_t=${Date.now()}`;
    if (provider === 'gitee') {
      repoUrl += `&access_token=${token}`;
    }

    let checkRes = await fetch(repoUrl, { method: 'GET', headers, cache: 'no-store' });

    // If 404 and owner was different from userLogin, check under userLogin
    if (checkRes.status === 404 && owner !== userLogin) {
      const fallbackRepoUrl = `${baseUrl}/repos/${userLogin}/${cleanRepo}?_t=${Date.now()}${provider === 'gitee' ? `&access_token=${token}` : ''}`;
      const fallbackRes = await fetch(fallbackRepoUrl, { method: 'GET', headers, cache: 'no-store' });
      if (fallbackRes.status === 200) {
        checkRes = fallbackRes;
      }
    }

    // If still 404, check user repositories list to find any existing MyTab-Backup
    if (checkRes.status === 404 && cleanRepo.toLowerCase() === 'mytab-backup') {
      try {
        const listReposUrl = `${baseUrl}/user/repos?per_page=100&affiliation=owner,collaborator&_t=${Date.now()}${provider === 'gitee' ? `&access_token=${token}` : ''}`;
        const listRes = await fetch(listReposUrl, { method: 'GET', headers, cache: 'no-store' });
        if (listRes.ok) {
          const reposList: any[] = await listRes.json();
          const matched = reposList.find(
            (r) => r.name?.toLowerCase() === 'mytab-backup' || r.name?.toLowerCase() === 'mytab_backup'
          );
          if (matched) {
            const isPrivate = matched.private ? '私有仓库' : '公开仓库';
            const branch = matched.default_branch || (provider === 'gitee' ? 'master' : 'main');
            return {
              success: true,
              owner: matched.owner?.login || userLogin,
              repo: matched.name,
              branch,
              message: `${t('gitRepoFound', typeof lang !== 'undefined' ? lang : 'zh-CN')} ${isPrivate} [${matched.full_name || `${matched.owner?.login}/${matched.name}`}]`,
            };
          }
        }
      } catch {
        // continue
      }
    }

    if (checkRes.status === 200) {
      const repoData = await checkRes.json();
      const isPrivate = repoData.private ? '私有仓库' : '公开仓库';
      const branch = repoData.default_branch || (provider === 'gitee' ? 'master' : 'main');
      return {
        success: true,
        owner: repoData.owner?.login || owner,
        repo: repoData.name || cleanRepo,
        branch,
        message: `${t('gitRepoFound', typeof lang !== 'undefined' ? lang : 'zh-CN')} ${isPrivate} [${repoData.full_name || `${owner}/${cleanRepo}`}]`,
      };
    }

    // 3. If 404 (not found) -> Auto create private repository
    if (checkRes.status === 404) {
      const createRepoUrl = `${baseUrl}/user/repos`;
      const createBody: any = {
        name: cleanRepo,
        private: true,
        auto_init: true,
        description: 'MyTab 新标签页配置备份数据',
      };

      if (provider === 'gitee') {
        createBody.access_token = token;
        createBody.private = 1;
      }

      const createRes = await fetch(createRepoUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(createBody),
      });

      if (createRes.status === 201 || createRes.status === 200) {
        const createdData = await createRes.json().catch(() => ({}));
        const branch = createdData.default_branch || (provider === 'gitee' ? 'master' : 'main');
        return {
          success: true,
          owner: userLogin,
          repo: cleanRepo,
          branch,
          message: `${t('gitAutoCreateSuccess', typeof lang !== 'undefined' ? lang : 'zh-CN')} [${userLogin}/${cleanRepo}]`,
        };
      } else {
        const err = await createRes.json().catch(() => ({}));
        return {
          success: false,
          owner: userLogin,
          repo: cleanRepo,
          message: `${t('gitAutoCreateFailed', typeof lang !== 'undefined' ? lang : 'zh-CN')}${err.message || ''}`,
        };
      }
    }

    return { success: false, message: `${t('gitStatusError', typeof lang !== 'undefined' ? lang : 'zh-CN')} HTTP ${checkRes.status}` };
  } catch (err: any) {
    return { success: false, message: err.message || t('gitNetworkError', typeof lang !== 'undefined' ? lang : 'zh-CN') };
  }
}

/**
 * Safe Base64 <-> UTF-8 utilities
 */
function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToUtf8(base64: string): string {
  const clean = base64.replace(/\s/g, '');
  if (!clean) return '';
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

export class GitClient {
  private config: GitSyncConfig;

  constructor(config: GitSyncConfig) {
    this.config = config;
  }

  private isGistMode(): boolean {
    return !this.config.mode || this.config.mode === 'gist';
  }

  /**
   * Test connection & token validity
   */
  async testConnection(): Promise<GitTestResult> {
    const { provider, token, owner, repo } = this.config;
    if (!token) {
      return { success: false, message: t('gitTokenEmpty', typeof lang !== 'undefined' ? lang : 'zh-CN') };
    }

    if (this.isGistMode()) {
      return autoSetupGist(provider, token);
    }

    // Repo Mode
    if (!owner || !repo) {
      return { success: false, message: t('gitOwnerRepoEmpty', typeof lang !== 'undefined' ? lang : 'zh-CN') };
    }

    try {
      const baseUrl = getApiBaseUrl(provider);
      let url = `${baseUrl}/repos/${owner}/${repo}?_t=${Date.now()}`;
      if (provider === 'gitee') {
        url += `&access_token=${token}`;
      }

      const res = await fetch(url, {
        method: 'GET',
        headers: getHeaders(token, provider),
        cache: 'no-store',
      });

      if (res.status === 200) {
        const data = await res.json();
        const isPrivate = data.private ? '私有仓库' : '公开仓库';
        return { success: true, message: `${t('gitRepoFound', typeof lang !== 'undefined' ? lang : 'zh-CN')} ${isPrivate} [${data.full_name || repo}]` };
      } else if (res.status === 401 || res.status === 403) {
        return { success: false, message: `${t('gitRepoTokenInvalid', typeof lang !== 'undefined' ? lang : 'zh-CN')} (HTTP ${res.status})` };
      } else if (res.status === 404) {
        return { success: false, message: `${t('gitRepoNotFound', typeof lang !== 'undefined' ? lang : 'zh-CN')} (HTTP 404)` };
      } else {
        return { success: false, message: `${t('gitStatusError', typeof lang !== 'undefined' ? lang : 'zh-CN')} HTTP ${res.status}` };
      }
    } catch (err: any) {
      return { success: false, message: err.message || t('gitNetworkError', typeof lang !== 'undefined' ? lang : 'zh-CN') };
    }
  }

  /**
   * Unified Get Data (Dispatches to Gist or Repo)
   */
  async getData(): Promise<{ payload: SyncPayload | null; sha?: string }> {
    if (this.isGistMode()) {
      return this.getGistData();
    }
    return this.getFile();
  }

  /**
   * Unified Put Data (Dispatches to Gist or Repo)
   */
  async putData(payload: SyncPayload, previousSha?: string): Promise<void> {
    if (this.isGistMode()) {
      return this.putGistData(payload);
    }
    return this.putFile(payload, previousSha);
  }

  /**
   * Gist: Read payload from Gist
   */
  private async getGistData(): Promise<{ payload: SyncPayload | null; sha?: string }> {
    let { provider, gistId, token } = this.config;
    if (!gistId) {
      if (!token) return { payload: null };
      gistId = await findExistingGist(provider, token);
      if (!gistId) return { payload: null };
      this.config.gistId = gistId;
    }

    const baseUrl = getApiBaseUrl(provider);
    let url = `${baseUrl}/gists/${gistId}?_t=${Date.now()}`;
    if (provider === 'gitee') {
      url += `&access_token=${token}`;
    }

    const res = await fetch(url, {
      method: 'GET',
      headers: getHeaders(token, provider),
      cache: 'no-store',
    });

    if (res.status === 404) {
      return { payload: null };
    }

    if (!res.ok) {
      throw new Error(`获取代码片段失败: HTTP ${res.status}`);
    }

    const data = await res.json();
    const file = data.files && (data.files[GIST_FILENAME] || Object.values(data.files)[0]);
    if (!file || !file.content) {
      return { payload: null };
    }

    try {
      const payload = JSON.parse(file.content) as SyncPayload;
      return { payload };
    } catch {
      return { payload: null };
    }
  }

  /**
   * Gist: Update payload to Gist
   */
  private async putGistData(payload: SyncPayload): Promise<void> {
    const { provider, gistId, token } = this.config;
    if (!gistId) {
      const setup = await autoSetupGist(provider, token);
      if (!setup.success || !setup.gistId) {
        throw new Error(setup.message || '未找到或无法创建代码片段');
      }
      this.config.gistId = setup.gistId;
    }

    const targetGistId = this.config.gistId!;
    const baseUrl = getApiBaseUrl(provider);
    const url = `${baseUrl}/gists/${targetGistId}`;

    const jsonString = escapeUnicodeEmojis(JSON.stringify(payload, null, 2));
    const bodyData: any = {
      description: GIST_DESCRIPTION,
      files: {
        [GIST_FILENAME]: {
          content: jsonString,
        },
      },
    };

    if (provider === 'gitee') {
      bodyData.access_token = token;
    }

    const res = await fetch(url, {
      method: 'PATCH',
      headers: getHeaders(token, provider),
      body: JSON.stringify(bodyData),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `同步至代码片段失败: HTTP ${res.status}`);
    }
  }

  /**
   * Repo: Get file from repository
   */
  async getFile(): Promise<{ payload: SyncPayload | null; sha?: string }> {
    const { provider, owner, repo, branch, path, token } = this.config;
    const baseUrl = getApiBaseUrl(provider);
    const cleanPath = (path || 'mytab-backup.json').replace(/^\/+/, '');
    const cleanBranch = branch || (provider === 'gitee' ? 'master' : 'main');

    let url = `${baseUrl}/repos/${owner}/${repo}/contents/${cleanPath}?ref=${cleanBranch}&_t=${Date.now()}`;
    if (provider === 'gitee') {
      url += `&access_token=${token}`;
    }

    const res = await fetch(url, {
      method: 'GET',
      headers: getHeaders(token, provider),
      cache: 'no-store',
    });

    if (res.status === 404) {
      return { payload: null };
    }

    if (!res.ok) {
      throw new Error(`获取仓库文件失败: HTTP ${res.status}`);
    }

    const data = await res.json().catch(() => null);
    if (!data || !data.content) {
      return { payload: null, sha: data?.sha };
    }

    try {
      const decoded = base64ToUtf8(data.content);
      if (!decoded.trim()) {
        return { payload: null, sha: data.sha };
      }
      const payload = JSON.parse(decoded) as SyncPayload;
      return { payload, sha: data.sha };
    } catch {
      return { payload: null, sha: data.sha };
    }
  }

  /**
   * Repo: Create or update file in repository (with auto-retry on SHA conflict)
   */
  async putFile(payload: SyncPayload, previousSha?: string, retryCount = 0): Promise<void> {
    const { provider, owner, repo, branch, path, token } = this.config;
    const baseUrl = getApiBaseUrl(provider);
    const cleanPath = (path || 'mytab-backup.json').replace(/^\/+/, '');
    const cleanBranch = branch || (provider === 'gitee' ? 'master' : 'main');

    const url = `${baseUrl}/repos/${owner}/${repo}/contents/${cleanPath}`;

    // Convert UTF-8 string to Base64 safely
    const jsonString = JSON.stringify(payload, null, 2);
    const base64Content = utf8ToBase64(jsonString);

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

    // Gitee requires POST for creating new file, PUT for updating existing file
    // GitHub supports PUT for both create and update
    const httpMethod = (provider === 'gitee' && !previousSha) ? 'POST' : 'PUT';

    const res = await fetch(url, {
      method: httpMethod,
      headers: getHeaders(token, provider),
      body: JSON.stringify(bodyData),
    });

    if (!res.ok && res.status !== 201 && res.status !== 200) {
      const errJson = await res.json().catch(() => ({}));
      const errorMsg = errJson.message || '';

      if ((res.status === 409 || errorMsg.includes('does not match') || errorMsg.includes('sha')) && retryCount < 2) {
        console.warn('[Git Sync] SHA conflict detected, auto-fetching latest SHA and retrying...');
        const latest = await this.getFile();
        return this.putFile(payload, latest.sha, retryCount + 1);
      }

      throw new Error(errorMsg || `上传失败 HTTP ${res.status}`);
    }
  }
}

function buildUpdatedGitConfig(
  git: GitSyncConfig,
  status: 'success' | 'failed',
  timestamp?: number,
  error?: string
): GitSyncConfig {
  const activeProvider = git.provider || 'github';
  const existingProviders = git.providers || {};
  const currentPlatform: GitPlatformConfig = existingProviders[activeProvider] || {
    mode: git.mode || 'repo',
    gistId: git.gistId || '',
    owner: git.owner || '',
    repo: git.repo || '',
    branch: git.branch || (activeProvider === 'gitee' ? 'master' : 'main'),
    path: git.path || 'mytab-backup.json',
    token: git.token || '',
  };

  const updatedPlatform: GitPlatformConfig = {
    ...currentPlatform,
    mode: git.mode || currentPlatform.mode,
    gistId: git.gistId || currentPlatform.gistId,
    owner: git.owner || currentPlatform.owner,
    repo: git.repo || currentPlatform.repo,
    branch: git.branch || currentPlatform.branch,
    path: git.path || currentPlatform.path,
    token: git.token || currentPlatform.token,
    lastSyncTime: timestamp !== undefined ? timestamp : currentPlatform.lastSyncTime,
    lastSyncStatus: status,
    lastSyncError: error,
  };

  return {
    ...git,
    lastSyncTime: timestamp !== undefined ? timestamp : git.lastSyncTime,
    lastSyncStatus: status,
    lastSyncError: error,
    providers: {
      ...existingProviders,
      [activeProvider]: updatedPlatform,
    },
  };
}

/**
 * Execute Git Sync (Two-way smart merge)
 */
export async function executeGitSync(state: AppState): Promise<GitSyncResult> {
  const { git } = state;
  if (!git.enabled || !git.token) {
    return { success: false, message: t('gitNotConfigured', state.settings?.language) };
  }

  const client = new GitClient(git);

  try {
    const { payload: remotePayload, sha: remoteSha } = await client.getData();
    const now = Date.now();

    // 1. If file does not exist yet -> upload local
    if (!remotePayload) {
      const payload: SyncPayload = {
        version: 1,
        timestamp: now,
        categories: state.categories,
        sites: state.sites,
        settings: state.settings,
      };
      await client.putData(payload);

      await saveGitConfig(buildUpdatedGitConfig(git, 'success', now, undefined));
      return { success: true, action: 'uploaded', message: t('gitSyncUploaded', state.settings?.language) };
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

    // Merge Settings based on timestamp
    const localSettingsTime = state.settings?.updatedAt || 0;
    const remoteSettingsTime = remotePayload.settings?.updatedAt || remotePayload.timestamp || 0;

    let finalSettings: ThemeSettings;
    if (remotePayload.settings && remoteSettingsTime > localSettingsTime) {
      finalSettings = { ...state.settings, ...remotePayload.settings };
      await saveSettings(finalSettings);
    } else {
      finalSettings = { ...state.settings };
      await saveSettings(finalSettings);
    }

    await saveSites(mergedSites);
    await saveCategories(mergedCats);

    // Upload merged result
    const newPayload: SyncPayload = {
      version: 1,
      timestamp: now,
      categories: mergedCats,
      sites: mergedSites,
      settings: finalSettings,
    };
    await client.putData(newPayload, remoteSha);

    await saveGitConfig(buildUpdatedGitConfig(git, 'success', now, undefined));
    return { success: true, action: 'merged', message: t('gitSyncMerged', state.settings?.language) };
  } catch (err: any) {
    const errMsg = err.message || t('gitSyncFailed', state.settings?.language);
    await saveGitConfig(buildUpdatedGitConfig(git, 'failed', undefined, errMsg));
    return { success: false, message: errMsg };
  }
}

/**
 * Explicit Upload/Backup from Local to Git
 */
export async function uploadToGit(state: AppState): Promise<GitSyncResult> {
  const { git } = state;
  if (!git.enabled || !git.token) {
    return { success: false, message: t('gitNotConfigured', state.settings?.language) };
  }

  const client = new GitClient(git);
  try {
    const { sha: remoteSha } = await client.getData();
    const now = Date.now();
    const payload: SyncPayload = {
      version: 1,
      timestamp: now,
      categories: state.categories,
      sites: state.sites,
      settings: { ...state.settings, updatedAt: now },
    };
    await client.putData(payload, remoteSha);
    await saveGitConfig(buildUpdatedGitConfig(git, 'success', now, undefined));
    return { success: true, action: 'uploaded', message: t('gitBackupSuccess', state.settings?.language) };
  } catch (err: any) {
    const errMsg = err.message || t('gitBackupFailed', state.settings?.language);
    await saveGitConfig(buildUpdatedGitConfig(git, 'failed', undefined, errMsg));
    return { success: false, message: errMsg };
  }
}

/**
 * Explicit Pull/Restore from Git to Local
 */
export async function restoreFromGit(state: AppState): Promise<GitSyncResult> {
  const { git } = state;
  if (!git.enabled || !git.token) {
    return { success: false, message: t('gitNotConfigured', state.settings?.language) };
  }

  const client = new GitClient(git);
  try {
    const { payload: remotePayload } = await client.getData();
    if (!remotePayload) {
      return { success: false, message: t('gitNoRemote', state.settings?.language) };
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
    await saveGitConfig(buildUpdatedGitConfig(git, 'success', now, undefined));
    return { success: true, action: 'downloaded', message: t('gitRestoreSuccess', state.settings?.language) };
  } catch (err: any) {
    const errMsg = err.message || t('gitRestoreFailed', state.settings?.language);
    await saveGitConfig(buildUpdatedGitConfig(git, 'failed', undefined, errMsg));
    return { success: false, message: errMsg };
  }
}
