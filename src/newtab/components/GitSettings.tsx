import React, { useState, useEffect } from 'react';
import {
  GitBranch,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Lock,
  ExternalLink,
  UploadCloud,
  DownloadCloud,
  Sparkles,
  User,
  ShieldCheck,
  FolderGit2,
  Code2
} from 'lucide-react';
import { AppState, GitSyncConfig, GitPlatformConfig, GitProvider } from '../../types';
import { uploadToGit, restoreFromGit, GitClient, autoSetupGist, autoSetupRepo } from '../../services/git';
import { ConfirmModal } from './ConfirmModal';
import { t } from '../../utils/i18n';

interface GitSettingsProps {
  appState: AppState;
  onUpdateGit: (config: GitSyncConfig) => void;
  onStateReload: () => void;
}

/**
 * Smart Git Repo URL Parser
 * Supports:
 * - https://github.com/owner/repo
 * - https://gitee.com/owner/repo.git
 * - git@github.com:owner/repo.git
 * - owner/repo
 * - repo (single name)
 */
function parseRepoInput(input: string): { owner?: string; repo: string; provider?: 'github' | 'gitee' } | null {
  const clean = input.trim();
  if (!clean) return null;

  let provider: 'github' | 'gitee' | undefined;
  if (clean.includes('gitee.com')) provider = 'gitee';
  else if (clean.includes('github.com')) provider = 'github';

  const pathOnly = clean
    .replace(/^https?:\/\/[^\/]+\//i, '')
    .replace(/^git@[^:]+:/i, '')
    .replace(/\.git$/i, '')
    .replace(/^\/+|\/+$/g, '');

  const parts = pathOnly.split('/').filter(Boolean);
  if (parts.length >= 2) {
    return {
      owner: parts[0],
      repo: parts[1],
      provider,
    };
  } else if (parts.length === 1) {
    return {
      repo: parts[0],
      provider,
    };
  }

  return null;
}

export const GitSettings: React.FC<GitSettingsProps> = ({
  appState,
  onUpdateGit,
  onStateReload,
}) => {
  const { git, settings } = appState;
  const isLight = settings.mode === 'light';

  // Initialize with platform isolation map
  const [config, setConfig] = useState<GitSyncConfig>(() => {
    const activeProvider = git.provider || 'github';
    const existingProviders = git.providers || {};

    const currentActivePlatform: GitPlatformConfig = existingProviders[activeProvider] || {
      mode: git.mode || 'repo',
      gistId: git.gistId || '',
      owner: git.owner || '',
      repo: git.repo || '',
      branch: git.branch || (activeProvider === 'gitee' ? 'master' : 'main'),
      path: git.path || 'mytab-backup.json',
      token: git.token || '',
      lastSyncTime: git.lastSyncTime,
      lastSyncStatus: git.lastSyncStatus,
      lastSyncError: git.lastSyncError,
    };

    return {
      ...git,
      provider: activeProvider,
      mode: currentActivePlatform.mode || 'repo',
      gistId: currentActivePlatform.gistId || '',
      owner: currentActivePlatform.owner || '',
      repo: currentActivePlatform.repo || '',
      branch: currentActivePlatform.branch || (activeProvider === 'gitee' ? 'master' : 'main'),
      path: currentActivePlatform.path || 'mytab-backup.json',
      token: currentActivePlatform.token || '',
      lastSyncTime: currentActivePlatform.lastSyncTime,
      lastSyncStatus: currentActivePlatform.lastSyncStatus,
      lastSyncError: currentActivePlatform.lastSyncError,
      providers: {
        ...existingProviders,
        [activeProvider]: currentActivePlatform,
      },
    };
  });

  // Combined Repo URL / Identifier input for repo mode
  const [repoInput, setRepoInput] = useState<string>(
    config.owner && config.repo ? `${config.owner}/${config.repo}` : ''
  );

  const [isConnecting, setIsConnecting] = useState(false);
  const [connectResult, setConnectResult] = useState<{ success?: boolean; message?: string; owner?: string } | null>(null);
  const [isTestingRepo, setIsTestingRepo] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [showPullConfirm, setShowPullConfirm] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');

  // Synchronize fields and maintain isolation map
  const handleChange = (fields: Partial<GitSyncConfig>) => {
    const activeProvider = (fields.provider || config.provider) as GitProvider;
    const merged = { ...config, ...fields };

    const currentPlatformConfig: GitPlatformConfig = {
      mode: merged.mode || 'repo',
      gistId: merged.gistId || '',
      owner: merged.owner || '',
      repo: merged.repo || '',
      branch: merged.branch || (activeProvider === 'gitee' ? 'master' : 'main'),
      path: merged.path || 'mytab-backup.json',
      token: merged.token || '',
      lastSyncTime: merged.lastSyncTime,
      lastSyncStatus: merged.lastSyncStatus,
      lastSyncError: merged.lastSyncError,
    };

    const updatedProviders = {
      ...merged.providers,
      [activeProvider]: currentPlatformConfig,
    };

    const updated: GitSyncConfig = {
      ...merged,
      providers: updatedProviders,
    };

    setConfig(updated);
    onUpdateGit(updated);
  };

  // Seamless Platform Switcher with memory isolation
  const handleProviderChange = (targetProvider: GitProvider) => {
    if (config.provider === targetProvider) return;

    // 1. Snapshot current active platform config
    const currentPlatformConfig: GitPlatformConfig = {
      mode: config.mode || 'repo',
      gistId: config.gistId || '',
      owner: config.owner || '',
      repo: config.repo || '',
      branch: config.branch || (config.provider === 'gitee' ? 'master' : 'main'),
      path: config.path || 'mytab-backup.json',
      token: config.token || '',
      lastSyncTime: config.lastSyncTime,
      lastSyncStatus: config.lastSyncStatus,
      lastSyncError: config.lastSyncError,
    };

    const updatedProviders = {
      ...config.providers,
      [config.provider]: currentPlatformConfig,
    };

    // 2. Load target platform config (fresh blank if never configured before)
    const targetPlatformConfig: GitPlatformConfig = updatedProviders[targetProvider] || {
      mode: 'repo',
      gistId: '',
      owner: '',
      repo: '',
      branch: targetProvider === 'gitee' ? 'master' : 'main',
      path: 'mytab-backup.json',
      token: '',
    };

    const updated: GitSyncConfig = {
      ...config,
      provider: targetProvider,
      providers: updatedProviders,
      mode: targetPlatformConfig.mode || 'repo',
      gistId: targetPlatformConfig.gistId || '',
      owner: targetPlatformConfig.owner || '',
      repo: targetPlatformConfig.repo || '',
      branch: targetPlatformConfig.branch || (targetProvider === 'gitee' ? 'master' : 'main'),
      path: targetPlatformConfig.path || 'mytab-backup.json',
      token: targetPlatformConfig.token || '',
      lastSyncTime: targetPlatformConfig.lastSyncTime,
      lastSyncStatus: targetPlatformConfig.lastSyncStatus,
      lastSyncError: targetPlatformConfig.lastSyncError,
    };

    setConfig(updated);
    onUpdateGit(updated);

    // 3. Reset input states and transient feedback
    setRepoInput(
      targetPlatformConfig.owner && targetPlatformConfig.repo
        ? `${targetPlatformConfig.owner}/${targetPlatformConfig.repo}`
        : ''
    );
    setConnectResult(null);
    setSyncMsg('');
  };

  // Handle smart repo URL input changes
  const handleRepoInputChange = (value: string) => {
    setRepoInput(value);
    const parsed = parseRepoInput(value);
    if (parsed) {
      handleChange({
        owner: parsed.owner || config.owner,
        repo: parsed.repo,
        provider: parsed.provider || config.provider,
      });
    }
  };

  // 1. One-Click Smart Setup for Gist
  const handleSmartConnect = async () => {
    if (!config.token.trim()) {
      setConnectResult({ success: false, message: t('gitTokenPlaceholderGithub', settings.language) });
      return;
    }

    setIsConnecting(true);
    setConnectResult(null);

    try {
      const res = await autoSetupGist(config.provider, config.token.trim());
      if (res.success) {
        handleChange({
          enabled: true,
          mode: 'gist',
          owner: res.owner || config.owner,
          gistId: res.gistId,
          lastSyncError: undefined,
        });
        setConnectResult({ success: true, message: res.message, owner: res.owner });
      } else {
        setConnectResult({ success: false, message: res.message });
      }
    } catch (err: any) {
      setConnectResult({ success: false, message: err.message || '连接失败' });
    } finally {
      setIsConnecting(false);
    }
  };

  // 2. Test or Auto-Create Repo for Repo Mode
  const handleTestRepo = async () => {
    if (!config.token.trim()) {
      setConnectResult({ success: false, message: t('gitTokenPlaceholderRepo', settings.language) });
      return;
    }

    setIsTestingRepo(true);
    setConnectResult(null);

    try {
      const parsed = parseRepoInput(repoInput);
      const targetRepo = parsed?.repo || config.repo || 'MyTab-Backup';
      const targetOwner = parsed?.owner || config.owner;

      const res = await autoSetupRepo(config.provider, config.token.trim(), targetRepo, targetOwner);
      if (res.success) {
        handleChange({
          enabled: true,
          mode: 'repo',
          owner: res.owner || config.owner,
          repo: res.repo || targetRepo,
          branch: res.branch || config.branch || (config.provider === 'gitee' ? 'master' : 'main'),
          lastSyncError: undefined,
        });
        setRepoInput(`${res.owner || config.owner}/${res.repo || targetRepo}`);
        setConnectResult({ success: true, message: res.message, owner: res.owner });
      } else {
        setConnectResult({ success: false, message: res.message });
      }
    } catch (err: any) {
      setConnectResult({ success: false, message: err.message || '连接失败' });
    } finally {
      setIsTestingRepo(false);
    }
  };

  // 3. Upload Local to Git
  const handleUpload = async () => {
    setIsUploading(true);
    setSyncMsg('');
    try {
      const res = await uploadToGit({ ...appState, git: config });
      if (res.success) {
        setSyncMsg(res.message || '上传备份成功');
        onStateReload();
      } else {
        setSyncMsg(`上传失败: ${res.message}`);
      }
    } catch (err: any) {
      setSyncMsg(`上传异常: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // 4. Pull Remote from Git to Local
  const handlePullExecute = async () => {
    setShowPullConfirm(false);
    setIsPulling(true);
    setSyncMsg('');
    try {
      const res = await restoreFromGit({ ...appState, git: config });
      if (res.success) {
        setSyncMsg(res.message || '拉取恢复成功');
        onStateReload();
      } else {
        setSyncMsg(`拉取失败: ${res.message}`);
      }
    } catch (err: any) {
      setSyncMsg(`拉取异常: ${err.message}`);
    } finally {
      setIsPulling(false);
    }
  };

  const formatLastSync = () => {
    if (!config.lastSyncTime) return t('neverSynced', settings.language);
    return new Date(config.lastSyncTime).toLocaleString(
      settings.language === 'zh-CN' ? 'zh-CN' : 'en-US'
    );
  };

  const tokenGeneratorUrl =
    config.provider === 'github'
      ? 'https://github.com/settings/tokens/new?description=MyTab+Backup&scopes=gist,repo'
      : 'https://gitee.com/profile/personal_access_tokens/new';

  return (
    <div className="space-y-4">
      {/* 1. Enable Switch */}
      <div
        className={`flex items-center justify-between p-3.5 rounded-2xl border transition-colors ${isLight
            ? 'bg-black/5 border-black/10 text-slate-900'
            : 'bg-white/5 border-white/10 text-white'
          }`}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-500">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold">{t('gitSync', settings.language)}</div>
            <div className={`text-xs ${isLight ? 'text-slate-500' : 'text-white/50'}`}>
              {t('gitSyncDesc', settings.language)}
            </div>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={config.enabled}
            onChange={(e) => handleChange({ enabled: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
        </label>
      </div>

      {config.enabled && (
        <div className="space-y-3.5 pt-1 animate-fade-in">
          {/* 2. Provider Selector (GitHub | Gitee) */}
          <div>
            <label className={`block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-700' : 'text-white/80'}`}>
              {t('gitProvider', settings.language)}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleProviderChange('github')}
                className={`py-2 rounded-xl text-xs font-medium border transition-all ${config.provider === 'github'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20 font-semibold'
                    : isLight
                      ? 'bg-black/5 border-black/10 text-slate-700 hover:bg-black/10'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
              >
                GitHub
              </button>
              <button
                type="button"
                onClick={() => handleProviderChange('gitee')}
                className={`py-2 rounded-xl text-xs font-medium border transition-all ${config.provider === 'gitee'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20 font-semibold'
                    : isLight
                      ? 'bg-black/5 border-black/10 text-slate-700 hover:bg-black/10'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
              >
                Gitee
              </button>
            </div>
          </div>

          {/* 3. Sync Mode Switch (紧随托管平台下方，逻辑清晰直观) */}
          <div>
            <label className={`block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-700' : 'text-white/80'}`}>
              {t('gitSyncMode', settings.language)}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleChange({ mode: 'gist' })}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium border transition-all ${config.mode === 'gist'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20 font-semibold'
                    : isLight
                      ? 'bg-black/5 border-black/10 text-slate-700 hover:bg-black/10'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>{t('gitModeGist', settings.language)}</span>
              </button>
              <button
                type="button"
                onClick={() => handleChange({ mode: 'repo' })}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium border transition-all ${config.mode === 'repo'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20 font-semibold'
                    : isLight
                      ? 'bg-black/5 border-black/10 text-slate-700 hover:bg-black/10'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
              >
                <FolderGit2 className="w-3.5 h-3.5" />
                <span>{t('gitModeRepo', settings.language)}</span>
              </button>
            </div>
          </div>

          {/* 4. Configuration Form Area */}
          {config.mode === 'gist' ? (
            /* --- Mode A: Gist 极简模式 --- */
            <div
              className={`p-3.5 rounded-2xl border space-y-3 ${isLight
                  ? 'bg-indigo-50/50 border-indigo-200/80 text-slate-800'
                  : 'bg-indigo-950/20 border-indigo-500/20 text-white'
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t('gitGistSmartTitle', settings.language)}</span>
                </div>
                <a
                  href={tokenGeneratorUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-indigo-600 hover:text-indigo-700 underline flex items-center gap-1 font-medium cursor-pointer"
                >
                  <span>{t('gitGenerateToken', settings.language)}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div>
                <div className="text-[11px] text-slate-500 dark:text-white/60 mb-1.5">
                  {config.provider === 'github'
                    ? t('gitGithubTokenTip', settings.language)
                    : t('gitGiteeTokenTip', settings.language)}
                </div>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={config.token}
                    onChange={(e) => handleChange({ token: e.target.value })}
                    placeholder={
                      config.provider === 'github'
                        ? t('gitTokenPlaceholderGithub', settings.language)
                        : t('gitTokenPlaceholderGitee', settings.language)
                    }
                    className={`flex-1 px-3.5 py-2.5 rounded-xl border text-xs outline-none focus:border-indigo-500 transition-colors ${isLight
                        ? 'bg-white border-black/15 text-slate-900 placeholder-slate-400'
                        : 'bg-white/10 border-white/15 text-white placeholder-white/40'
                      }`}
                  />
                  <button
                    type="button"
                    onClick={handleSmartConnect}
                    disabled={isConnecting || !config.token.trim()}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-medium shadow-md shadow-indigo-600/30 transition-all cursor-pointer shrink-0"
                  >
                    {isConnecting ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <ShieldCheck className="w-3.5 h-3.5" />
                    )}
                    <span>{t('gitSmartConnect', settings.language)}</span>
                  </button>
                </div>
              </div>

              {/* Connected Badge Info */}
              {config.gistId && config.owner && (
                <div
                  className={`p-2.5 rounded-xl text-xs flex items-center justify-between border ${isLight
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t('gitBoundAccount', settings.language)}: <strong>@{config.owner}</strong></span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-600/20 text-emerald-600 dark:text-emerald-300 font-medium">
                    {t('gitGistReady', settings.language)}
                  </span>
                </div>
              )}
            </div>
          ) : (
            /* --- Mode B: Repo 独立仓库模式 (智能解析单输入框) --- */
            <div
              className={`p-3.5 rounded-2xl border space-y-3 ${isLight
                  ? 'bg-slate-50/80 border-black/10 text-slate-800'
                  : 'bg-white/5 border-white/10 text-white'
                }`}
            >
              {/* Token Input with Direct Link */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={`text-xs font-medium ${isLight ? 'text-slate-700' : 'text-white/80'}`}>
                    Personal Access Token (PAT) <span className="text-red-500">*</span>
                  </label>
                  <a
                    href={tokenGeneratorUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-indigo-600 hover:text-indigo-700 underline flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <span>{t('gitGenerateToken', settings.language)}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <input
                  type="password"
                  value={config.token}
                  onChange={(e) => handleChange({ token: e.target.value })}
                  placeholder={
                    config.provider === 'github'
                      ? t('gitTokenPlaceholderRepo', settings.language)
                      : t('gitTokenPlaceholderGitee', settings.language)
                  }
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none focus:border-indigo-500 transition-colors ${isLight
                      ? 'bg-white border-black/15 text-slate-900 placeholder-slate-400'
                      : 'bg-white/10 border-white/15 text-white placeholder-white/40'
                    }`}
                />
              </div>

              {/* Smart Unified Repo URL/Path Input */}
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-700' : 'text-white/80'}`}>
                  {t('gitRepoUrl', settings.language)}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={repoInput}
                    onChange={(e) => handleRepoInputChange(e.target.value)}
                    placeholder={t('gitRepoPlaceholder', settings.language)}
                    className={`flex-1 px-3.5 py-2.5 rounded-xl border text-xs outline-none focus:border-indigo-500 transition-colors ${isLight
                        ? 'bg-white border-black/15 text-slate-900 placeholder-slate-400'
                        : 'bg-white/10 border-white/15 text-white placeholder-white/40'
                      }`}
                  />
                  <button
                    type="button"
                    onClick={handleTestRepo}
                    disabled={isTestingRepo || !config.token.trim()}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-medium shadow-md shadow-indigo-600/30 transition-all cursor-pointer shrink-0"
                  >
                    {isTestingRepo ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <ShieldCheck className="w-3.5 h-3.5" />
                    )}
                    <span>{t('gitVerifyAndConnect', settings.language)}</span>
                  </button>
                </div>
                {config.owner && config.repo ? (
                  <p className={`text-[11px] mt-1.5 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`}>
                    {t('gitBoundRepo', settings.language)}: <strong>@{config.owner}</strong> / <strong>{config.repo}</strong>
                  </p>
                ) : (
                  <p className={`text-[10px] mt-1.5 ${isLight ? 'text-slate-400' : 'text-white/40'}`}>
                    {t('gitRepoTip', settings.language)}
                  </p>
                )}
              </div>

              {/* Branch & Path */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div>
                  <label className="block text-[11px] mb-1 opacity-70">{t('gitBranch', settings.language)}</label>
                  <input
                    type="text"
                    value={config.branch || 'main'}
                    onChange={(e) => handleChange({ branch: e.target.value })}
                    className={`w-full px-3 py-1.5 rounded-xl border text-xs outline-none ${isLight ? 'bg-white border-black/15 text-slate-900' : 'bg-white/10 border-white/15 text-white'
                      }`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] mb-1 opacity-70">{t('gitPath', settings.language)}</label>
                  <input
                    type="text"
                    value={config.path || 'mytab-backup.json'}
                    onChange={(e) => handleChange({ path: e.target.value })}
                    className={`w-full px-3 py-1.5 rounded-xl border text-xs outline-none ${isLight ? 'bg-white border-black/15 text-slate-900' : 'bg-white/10 border-white/15 text-white'
                      }`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Test / Connect Result Message */}
          {connectResult && (
            <div
              className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${connectResult.success
                  ? isLight
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : isLight
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-red-500/20 text-red-300 border border-red-500/30'
                }`}
            >
              {connectResult.success ? (
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              )}
              <span>{connectResult.message}</span>
            </div>
          )}

          {/* Auto Sync Switch */}
          <div className="flex items-center justify-between py-1">
            <span className={`text-xs ${isLight ? 'text-slate-700' : 'text-white/80'}`}>
              {t('gitAutoSync', settings.language)}
            </span>
            <input
              type="checkbox"
              checked={config.autoSync}
              onChange={(e) => handleChange({ autoSync: e.target.checked })}
              className="w-4 h-4 rounded bg-transparent border-gray-400 text-indigo-600 focus:ring-0 cursor-pointer"
            />
          </div>

          {/* Action Buttons (上传备份 / 拉取恢复) */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleUpload}
                disabled={isUploading || isPulling || !config.token}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-xs font-medium text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                title={t('uploadBackup', settings.language)}
              >
                {isUploading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <UploadCloud className="w-3.5 h-3.5" />
                )}
                <span>{t('uploadBackup', settings.language)}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPullConfirm(true)}
                disabled={isUploading || isPulling || !config.token}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border disabled:opacity-50 text-xs font-medium transition-all cursor-pointer ${isLight
                    ? 'bg-white hover:bg-slate-50 border-black/10 text-slate-800 shadow-sm'
                    : 'bg-white/10 hover:bg-white/20 border-white/15 text-white'
                  }`}
                title={t('pullRestore', settings.language)}
              >
                {isPulling ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <DownloadCloud className="w-3.5 h-3.5" />
                )}
                <span>{t('pullRestore', settings.language)}</span>
              </button>
            </div>
          </div>

          {/* Sync Result Feedback */}
          {syncMsg && (
            <div
              className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${isLight
                  ? 'bg-indigo-50 border border-indigo-200 text-indigo-800'
                  : 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-200'
                }`}
            >
              <RefreshCw className="w-4 h-4 shrink-0 text-indigo-500" />
              <span>{syncMsg}</span>
            </div>
          )}

          {/* Last sync info */}
          <div className={`text-[11px] pt-0.5 ${isLight ? 'text-slate-500' : 'text-white/50'}`}>
            {t('lastSync', settings.language)}: {formatLastSync()}
          </div>

          {/* Pull & Restore Confirmation Modal */}
          <ConfirmModal
            isOpen={showPullConfirm}
            type="warning"
            title={t('pullRestore', settings.language)}
            message={t('confirmPull', settings.language)}
            confirmText={t('save', settings.language)}
            language={settings.language}
            onConfirm={handlePullExecute}
            onCancel={() => setShowPullConfirm(false)}
          />
        </div>
      )}
    </div>
  );
};
