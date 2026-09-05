import { WebdavConfig, GitSyncConfig, GitPlatformConfig, GitProvider, GitSyncMode } from '../types';

/**
 * 判断 WebDAV 是否已配置
 */
export function isWebdavConfigured(webdav?: WebdavConfig): boolean {
  if (!webdav) return false;
  if (webdav.enabled) return true;
  if (webdav.url && webdav.url.trim().length > 0) return true;
  if (webdav.username && webdav.username.trim().length > 0) return true;
  if (webdav.lastSyncTime && webdav.lastSyncTime > 0) return true;
  return false;
}

/**
 * 判断某个 Git 平台 (GitHub 或 Gitee) 是否已配置
 */
export function isGitPlatformConfigured(platform?: GitPlatformConfig): boolean {
  if (!platform) return false;
  if (platform.token && platform.token.trim().length > 0) return true;
  if (platform.gistId && platform.gistId.trim().length > 0) return true;
  if (platform.owner && platform.owner.trim().length > 0 && platform.repo && platform.repo.trim().length > 0) return true;
  if (platform.lastSyncTime && platform.lastSyncTime > 0) return true;
  return false;
}

/**
 * 判断 Git 同步整体是否已配置
 */
export function isGitConfigured(git?: GitSyncConfig): boolean {
  if (!git) return false;
  if (git.enabled) return true;
  if (git.token && git.token.trim().length > 0) return true;
  if (git.gistId && git.gistId.trim().length > 0) return true;
  if (git.repo && git.repo.trim().length > 0 && git.owner && git.owner.trim().length > 0) return true;
  if (git.lastSyncTime && git.lastSyncTime > 0) return true;
  if (git.providers) {
    if (isGitPlatformConfigured(git.providers.github)) return true;
    if (isGitPlatformConfigured(git.providers.gitee)) return true;
  }
  return false;
}

/**
 * 自动定位同步提供者（'webdav' | 'git'）
 * - 如果两者均未配置，默认返回 'webdav'
 * - 如果只配置了其中一个，自动定位到已配置的那一个
 * - 如果两者都配置了，优先定位到处于开启 (enabled) 状态的一个；若状态相同，定位到最近同步时间更新的一个
 */
export function resolveBestSyncProvider(webdav?: WebdavConfig, git?: GitSyncConfig): 'webdav' | 'git' {
  const webdavConfigured = isWebdavConfigured(webdav);
  const gitConfigured = isGitConfigured(git);

  // 1. 只有其中一个配置了
  if (gitConfigured && !webdavConfigured) return 'git';
  if (webdavConfigured && !gitConfigured) return 'webdav';

  // 2. 两者都配置了
  if (webdavConfigured && gitConfigured) {
    if (git?.enabled && !webdav?.enabled) return 'git';
    if (webdav?.enabled && !git?.enabled) return 'webdav';

    const gitTime = git?.lastSyncTime || 0;
    const webdavTime = webdav?.lastSyncTime || 0;
    if (gitTime > webdavTime) return 'git';
    if (webdavTime > gitTime) return 'webdav';

    return git?.enabled ? 'git' : 'webdav';
  }

  // 3. 初始安装或均未配置
  return 'webdav';
}

/**
 * 自动定位 Git 平台（'github' | 'gitee'）
 * - 如果某一个平台配置了 Token/仓库等而另一个没有，自动定位到该平台
 * - 如果都配置了，比较最近同步时间
 * - 默认返回当前 git.provider 或 'github'
 */
export function resolveBestGitPlatform(git?: GitSyncConfig): GitProvider {
  if (!git) return 'github';

  const defaultProvider: GitProvider = git.provider || 'github';
  const otherProvider: GitProvider = defaultProvider === 'github' ? 'gitee' : 'github';

  const defaultPlatform = git.providers?.[defaultProvider];
  const otherPlatform = git.providers?.[otherProvider];

  const defaultHasTopToken = defaultProvider === git.provider && Boolean(git.token?.trim());
  const defaultHasTopRepo = defaultProvider === git.provider && Boolean(git.repo?.trim() && git.owner?.trim());
  const defaultHasTopGist = defaultProvider === git.provider && Boolean(git.gistId?.trim());

  const isDefaultConfigured =
    isGitPlatformConfigured(defaultPlatform) ||
    defaultHasTopToken ||
    defaultHasTopRepo ||
    defaultHasTopGist;

  const isOtherConfigured = isGitPlatformConfigured(otherPlatform);

  if (isDefaultConfigured && !isOtherConfigured) {
    return defaultProvider;
  }
  if (!isDefaultConfigured && isOtherConfigured) {
    return otherProvider;
  }
  if (isDefaultConfigured && isOtherConfigured) {
    const defaultTime = defaultPlatform?.lastSyncTime || (defaultProvider === git.provider ? git.lastSyncTime : 0) || 0;
    const otherTime = otherPlatform?.lastSyncTime || 0;
    if (otherTime > defaultTime) {
      return otherProvider;
    }
    return defaultProvider;
  }

  return defaultProvider;
}

/**
 * 自动定位 Git 同步模式（'repo' | 'gist'）
 * - 优先检查平台显式设置的 mode
 * - 智能根据配置凭证（有 gistId 且无 repo -> 'gist'；有 repo -> 'repo'）
 * - 默认返回 'repo'（私有仓库）
 */
export function resolveBestGitMode(platform?: GitPlatformConfig, topGit?: GitSyncConfig): GitSyncMode {
  if (platform?.mode) {
    return platform.mode;
  }
  if (platform?.gistId && !platform?.repo) {
    return 'gist';
  }
  if (platform?.repo) {
    return 'repo';
  }
  if (topGit?.mode) {
    return topGit.mode;
  }
  if (topGit?.gistId && !topGit?.repo) {
    return 'gist';
  }
  return 'repo';
}
