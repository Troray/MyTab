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
  Code2,
  Eye,
  EyeOff,
  ChevronDown
} from 'lucide-react';
import { AppState, GitSyncConfig, GitPlatformConfig, GitProvider } from '../../types';
import { uploadToGit, restoreFromGit, GitClient, autoSetupGist, autoSetupRepo, isTokenLike, GitCommitHistory } from '../../services/git';
import { ConfirmModal } from './ConfirmModal';
import { ToggleSwitch } from './ToggleSwitch';
import { t } from '../../utils/i18n';
import { resolveBestGitPlatform, resolveBestGitMode } from '../../utils/syncHelper';
import { isLightMode } from '../../utils/constants';

interface GitSettingsProps {
  appState: AppState;
  onUpdateGit: (config: GitSyncConfig) => void;
  onUpdateSyncSettings?: (policy: import('../../types').ProfileSyncSettings) => void;
  onStateReload: () => void;
  isLight?: boolean;
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

  // Filter out tokens accidentally pasted or autofilled into repo input
  if (isTokenLike(clean)) {
    return { repo: 'MyTab-Backup' };
  }

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
    const owner = isTokenLike(parts[0]) ? undefined : parts[0];
    const repo = isTokenLike(parts[1]) ? 'MyTab-Backup' : parts[1];
    return {
      owner,
      repo,
      provider,
    };
  } else if (parts.length === 1) {
    const repo = isTokenLike(parts[0]) ? 'MyTab-Backup' : parts[0];
    return {
      repo,
      provider,
    };
  }

  return null;
}

export const GitSettings: React.FC<GitSettingsProps> = ({
  appState,
  onUpdateGit,
  onUpdateSyncSettings,
  onStateReload,
  isLight: isLightProp,
}) => {
  const { git, settings } = appState;
  const isLight = isLightProp !== undefined ? isLightProp : isLightMode(settings.mode);

  // Initialize with platform isolation map & smart provider/mode auto-location
  const activeProvider = resolveBestGitPlatform(git);
  const existingProviders = git?.providers || {};
  const rawOwner = git?.owner || '';
  const rawRepo = git?.repo || '';
  const safeOwner = isTokenLike(rawOwner) ? '' : rawOwner;
  const safeRepo = isTokenLike(rawRepo) ? 'MyTab-Backup' : rawRepo;

  const platformData = existingProviders[activeProvider];
  const isPlatformActive = (git?.provider || 'github') === activeProvider;

  const currentActivePlatform: GitPlatformConfig = {
    mode: resolveBestGitMode(platformData, git),
    gistId: platformData?.gistId || (isPlatformActive ? git?.gistId : '') || '',
    owner: platformData?.owner || (isPlatformActive ? safeOwner : '') || '',
    repo: platformData?.repo || (isPlatformActive ? safeRepo : '') || 'MyTab-Backup',
    branch: platformData?.branch || (isPlatformActive ? git?.branch : '') || (activeProvider === 'gitee' ? 'master' : 'main'),
    path: platformData?.path || (isPlatformActive ? git?.path : '') || 'mytab-backup.json',
    token: platformData?.token || (isPlatformActive ? git?.token : '') || '',
    lastSyncTime: platformData?.lastSyncTime || (isPlatformActive ? git?.lastSyncTime : undefined),
    lastSyncStatus: platformData?.lastSyncStatus || (isPlatformActive ? git?.lastSyncStatus : undefined),
    lastSyncError: platformData?.lastSyncError || (isPlatformActive ? git?.lastSyncError : undefined),
  };

  const initialRepo = isTokenLike(currentActivePlatform.repo) ? 'MyTab-Backup' : (currentActivePlatform.repo || 'MyTab-Backup');
  const initialOwner = isTokenLike(currentActivePlatform.owner) ? '' : (currentActivePlatform.owner || '');

  const [config, setConfig] = useState<GitSyncConfig>(() => ({
    ...(git || {}),
    provider: activeProvider,
    mode: currentActivePlatform.mode || 'repo',
    gistId: currentActivePlatform.gistId || '',
    owner: initialOwner,
    repo: initialRepo,
    branch: currentActivePlatform.branch || (activeProvider === 'gitee' ? 'master' : 'main'),
    path: currentActivePlatform.path || 'mytab-backup.json',
    token: currentActivePlatform.token || '',
    lastSyncTime: currentActivePlatform.lastSyncTime,
    lastSyncStatus: currentActivePlatform.lastSyncStatus,
    lastSyncError: currentActivePlatform.lastSyncError,
    providers: {
      ...existingProviders,
      [activeProvider]: {
        ...currentActivePlatform,
        owner: initialOwner,
        repo: initialRepo,
      },
    },
  }));

  // Combined Repo URL / Identifier input for repo mode
  const [repoInput, setRepoInput] = useState<string>(() => {
    if (initialOwner && initialRepo) return `${initialOwner}/${initialRepo}`;
    return initialRepo;
  });

  const [isConnecting, setIsConnecting] = useState(false);
  const [isTestingRepo, setIsTestingRepo] = useState(false);
  const [connectResult, setConnectResult] = useState<{ success?: boolean; message?: string; owner?: string } | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [showPullConfirm, setShowPullConfirm] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [showAdvancedRestore, setShowAdvancedRestore] = useState(false);
  const [customSha, setCustomSha] = useState('');
  const [commits, setCommits] = useState<GitCommitHistory[]>([]);
  const [isLoadingCommits, setIsLoadingCommits] = useState(false);
  const [showCommitList, setShowCommitList] = useState(false);

  // Sync external appState to local state if updated
  useEffect(() => {
    if (git) {
      const activeProvider = resolveBestGitPlatform(git);
      const existingProviders = git.providers || config.providers || {};
      const platformData = existingProviders[activeProvider];
      const isPlatformActive = (git.provider || 'github') === activeProvider;

      const currentActivePlatform: GitPlatformConfig = {
        mode: resolveBestGitMode(platformData, git),
        gistId: platformData?.gistId || (isPlatformActive ? git.gistId : '') || '',
        owner: platformData?.owner !== undefined ? platformData.owner : (isPlatformActive && git.owner !== undefined ? git.owner : ''),
        repo: platformData?.repo !== undefined ? platformData.repo : (isPlatformActive && git.repo !== undefined ? git.repo : 'MyTab-Backup'),
        branch: platformData?.branch || (isPlatformActive ? git.branch : '') || (activeProvider === 'gitee' ? 'master' : 'main'),
        path: platformData?.path || (isPlatformActive ? git.path : '') || 'mytab-backup.json',
        token: platformData?.token || (isPlatformActive ? git.token : '') || '',
        lastSyncTime: platformData?.lastSyncTime || (isPlatformActive ? git.lastSyncTime : undefined),
        lastSyncStatus: platformData?.lastSyncStatus || (isPlatformActive ? git.lastSyncStatus : undefined),
        lastSyncError: platformData?.lastSyncError || (isPlatformActive ? git.lastSyncError : undefined),
      };

      const finalRepo = isTokenLike(currentActivePlatform.repo) ? 'MyTab-Backup' : currentActivePlatform.repo;
      const finalOwner = isTokenLike(currentActivePlatform.owner) ? '' : currentActivePlatform.owner;

      setConfig((prev) => ({
        ...prev,
        ...git,
        provider: activeProvider,
        mode: currentActivePlatform.mode || 'repo',
        gistId: currentActivePlatform.gistId || '',
        owner: finalOwner,
        repo: finalRepo,
        branch: currentActivePlatform.branch,
        path: currentActivePlatform.path,
        token: currentActivePlatform.token,
        lastSyncTime: currentActivePlatform.lastSyncTime,
        lastSyncStatus: currentActivePlatform.lastSyncStatus,
        lastSyncError: currentActivePlatform.lastSyncError,
        providers: {
          ...prev.providers,
          ...existingProviders,
          [activeProvider]: {
            ...currentActivePlatform,
            owner: finalOwner,
            repo: finalRepo,
          },
        },
      }));

      if (finalOwner && finalRepo) {
        setRepoInput(`${finalOwner}/${finalRepo}`);
      } else {
        setRepoInput(finalRepo);
      }
    }
  }, [git]);

  // Persist and isolate platform fields when changing config
  const handleChange = (fields: Partial<GitSyncConfig>) => {
    const currentProvider = fields.provider || config.provider || 'github';

    const updatedPlatformData: GitPlatformConfig = {
      mode: fields.mode !== undefined ? fields.mode : config.mode,
      gistId: fields.gistId !== undefined ? fields.gistId : config.gistId,
      owner: fields.owner !== undefined ? fields.owner : config.owner,
      repo: fields.repo !== undefined ? fields.repo : config.repo,
      branch: fields.branch !== undefined ? fields.branch : config.branch,
      path: fields.path !== undefined ? fields.path : config.path,
      token: fields.token !== undefined ? fields.token : config.token,
      lastSyncTime: fields.lastSyncTime !== undefined ? fields.lastSyncTime : config.lastSyncTime,
      lastSyncStatus: fields.lastSyncStatus !== undefined ? fields.lastSyncStatus : config.lastSyncStatus,
      lastSyncError: fields.lastSyncError !== undefined ? fields.lastSyncError : config.lastSyncError,
    };

    const updatedProviders = {
      ...(config.providers || {}),
      [currentProvider]: updatedPlatformData,
    };

    const nextConfig: GitSyncConfig = {
      ...config,
      ...fields,
      providers: updatedProviders,
    };

    setConfig(nextConfig);
    onUpdateGit(nextConfig);
  };

  // Switch Provider Tab (GitHub <-> Gitee) with automatic isolated config restoration
  const handleProviderChange = (newProvider: GitProvider) => {
    if (newProvider === config.provider) return;

    // 1. Save current provider state
    const currentPlatformData: GitPlatformConfig = {
      mode: config.mode,
      gistId: config.gistId,
      owner: config.owner,
      repo: config.repo,
      branch: config.branch,
      path: config.path,
      token: config.token,
      lastSyncTime: config.lastSyncTime,
      lastSyncStatus: config.lastSyncStatus,
      lastSyncError: config.lastSyncError,
    };

    const updatedProviders = {
      ...(config.providers || {}),
      [config.provider]: currentPlatformData,
    };

    // 2. Load target provider isolated config (or defaults)
    const targetPlatformData: GitPlatformConfig = updatedProviders[newProvider] || {
      mode: 'repo',
      gistId: '',
      owner: '',
      repo: '',
      branch: newProvider === 'gitee' ? 'master' : 'main',
      path: 'mytab-backup.json',
      token: '',
    };

    const nextConfig: GitSyncConfig = {
      ...config,
      provider: newProvider,
      mode: targetPlatformData.mode || 'repo',
      gistId: targetPlatformData.gistId || '',
      owner: targetPlatformData.owner || '',
      repo: targetPlatformData.repo || '',
      branch: targetPlatformData.branch || (newProvider === 'gitee' ? 'master' : 'main'),
      path: targetPlatformData.path || 'mytab-backup.json',
      token: targetPlatformData.token || '',
      lastSyncTime: targetPlatformData.lastSyncTime,
      lastSyncStatus: targetPlatformData.lastSyncStatus,
      lastSyncError: targetPlatformData.lastSyncError,
      providers: updatedProviders,
    };

    setConfig(nextConfig);
    setConnectResult(null);
    setSyncMsg('');
    setShowCommitList(false);
    setCommits([]);
    setCustomSha('');

    if (targetPlatformData.owner && targetPlatformData.repo) {
      setRepoInput(`${targetPlatformData.owner}/${targetPlatformData.repo}`);
    } else {
      setRepoInput(targetPlatformData.repo || '');
    }

    onUpdateGit(nextConfig);
  };

  // Smart Parse Repo URL / Identifier on input change
  const handleRepoInputChange = (val: string) => {
    setRepoInput(val);
    const parsed = parseRepoInput(val);
    if (parsed) {
      if (parsed.provider && parsed.provider !== config.provider) {
        handleProviderChange(parsed.provider);
      }
      handleChange({
        owner: parsed.owner !== undefined ? parsed.owner : '',
        repo: parsed.repo,
      });
    } else {
      handleChange({ repo: val.trim(), owner: '' });
    }
  };

  // 1. Smart Gist One-Click Connect
  const handleSmartConnect = async () => {
    if (!config.token.trim()) {
      setConnectResult({ success: false, message: t('gitTokenPlaceholderGithub', settings.language) });
      return;
    }

    setIsConnecting(true);
    setConnectResult(null);

    try {
      const res = await autoSetupGist(config.provider, config.token.trim(), settings.language);
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
      setConnectResult({ success: false, message: err.message || t('gitConnectionFailed', settings.language) });
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
      let targetRepo = parsed?.repo || (isTokenLike(config.repo) ? '' : config.repo) || 'MyTab-Backup';
      if (isTokenLike(targetRepo)) targetRepo = 'MyTab-Backup';

      const targetOwner = isTokenLike(parsed?.owner) ? undefined : (parsed?.owner || (isTokenLike(config.owner) ? undefined : config.owner));

      const res = await autoSetupRepo(config.provider, config.token.trim(), targetRepo, targetOwner, settings.language);
      if (res.success) {
        const finalOwner = res.owner || targetOwner || config.owner || 'User';
        const finalRepo = res.repo || targetRepo;
        handleChange({
          enabled: true,
          mode: 'repo',
          owner: finalOwner,
          repo: finalRepo,
          branch: res.branch || config.branch || (config.provider === 'gitee' ? 'master' : 'main'),
          lastSyncError: undefined,
        });
        setRepoInput(`${finalOwner}/${finalRepo}`);
        setConnectResult({ success: true, message: res.message, owner: finalOwner });
      } else {
        setConnectResult({ success: false, message: res.message });
      }
    } catch (err: any) {
      setConnectResult({ success: false, message: err.message || t('gitConnectionFailed', settings.language) });
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
        setSyncMsg(res.message || t('gitBackupSuccess', settings.language));
        onStateReload();
      } else {
        setSyncMsg(`${t('gitUploadFailedPrefix', settings.language)}: ${res.message}`);
      }
    } catch (err: any) {
      setSyncMsg(`${t('gitUploadErrorPrefix', settings.language)}: ${err.message}`);
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
      const res = await restoreFromGit({ ...appState, git: config }, customSha.trim() || undefined);
      if (res.success) {
        setSyncMsg(res.message || t('gitRestoreSuccess', settings.language));
        onStateReload();
      } else {
        setSyncMsg(`${t('gitRestoreFailedPrefix', settings.language)}: ${res.message}`);
      }
    } catch (err: any) {
      setSyncMsg(`${t('gitRestoreErrorPrefix', settings.language)}: ${err.message}`);
    } finally {
      setIsPulling(false);
    }
  };

  const handleFetchCommits = async () => {
    if (!config.token.trim()) {
      setSyncMsg(t('gitTokenPlaceholderRepo', settings.language));
      return;
    }
    setIsLoadingCommits(true);
    setShowCommitList(true);
    try {
      const client = new GitClient(config, settings.language);
      const data = await client.getCommitHistory(10);
      setCommits(data);
    } catch (err: any) {
      setSyncMsg(err.message || t('gitFetchCommitsFailed', settings.language));
    } finally {
      setIsLoadingCommits(false);
    }
  };

  const formatLastSync = () => {
    if (!config.lastSyncTime) return t('neverSynced', settings.language);
    return new Date(config.lastSyncTime).toLocaleString(settings.language || 'zh-CN');
  };

  const tokenGeneratorUrl =
    config.provider === 'github'
      ? 'https://github.com/settings/tokens/new?description=MyTab+Backup&scopes=gist,repo'
      : 'https://gitee.com/profile/personal_access_tokens/new';

  return (
    <div className="space-y-3.5">
      {/* 1. Enable Switch */}
      <div
        className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl border duration-0 ${isLight
          ? 'bg-black/[0.03] border-black/8 text-slate-900'
          : 'bg-white/[0.05] border-white/10 text-white'
          }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-xl border ${isLight
              ? 'bg-black/[0.04] border-black/5 text-slate-800'
              : 'bg-white/10 border-white/10 text-white'
              }`}
          >
            <GitBranch className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="text-xs font-semibold">{t('gitSync', settings.language)}</div>
            <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-white/50'}`}>
              {t('gitSyncDesc', settings.language)}
            </div>
          </div>
        </div>
        <ToggleSwitch
          checked={config.enabled}
          onChange={(checked) => handleChange({ enabled: checked })}
          isLight={isLight}
        />
      </div>

      {config.enabled && (
        <div className="space-y-3 pt-1 animate-fade-in">
          {/* 2. Provider Selector (GitHub | Gitee) */}
          <div>
            <label className={`block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-700' : 'text-white/80'}`}>
              {t('gitProvider', settings.language)}
            </label>
            <div className={`grid grid-cols-2 gap-1.5 ${isLight ? 'bg-black/[0.03] p-1 rounded-2xl border border-black/8' : ''}`}>
              <button
                type="button"
                onClick={() => handleProviderChange('github')}
                className={`py-2 rounded-xl text-xs font-medium duration-0 cursor-pointer active:scale-95 ${config.provider === 'github'
                  ? isLight ? 'bg-black/[0.08] text-slate-900 border border-black/10 shadow-xs font-semibold' : 'bg-white/20 text-white border-white/20 shadow-sm font-semibold'
                  : isLight
                    ? 'bg-transparent text-slate-600 hover:text-slate-900'
                    : 'bg-white/[0.05] border-white/10 text-white/70 hover:bg-white/10'
                  }`}
              >
                GitHub
              </button>
              <button
                type="button"
                onClick={() => handleProviderChange('gitee')}
                className={`py-2 rounded-xl text-xs font-medium duration-0 cursor-pointer active:scale-95 ${config.provider === 'gitee'
                  ? isLight ? 'bg-black/[0.08] text-slate-900 border border-black/10 shadow-xs font-semibold' : 'bg-white/20 text-white border-white/20 shadow-sm font-semibold'
                  : isLight
                    ? 'bg-transparent text-slate-600 hover:text-slate-900'
                    : 'bg-white/[0.05] border-white/10 text-white/70 hover:bg-white/10'
                  }`}
              >
                Gitee
              </button>
            </div>
          </div>

          {/* 3. Sync Mode Switch */}
          <div>
            <label className={`block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-700' : 'text-white/80'}`}>
              {t('gitSyncMode', settings.language)}
            </label>
            <div className={`grid grid-cols-2 gap-1.5 ${isLight ? 'bg-black/[0.03] p-1 rounded-2xl border border-black/8' : ''}`}>
              <button
                type="button"
                onClick={() => handleChange({ mode: 'gist' })}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium duration-0 cursor-pointer active:scale-95 ${config.mode === 'gist'
                  ? isLight ? 'bg-black/[0.08] text-slate-900 border border-black/10 shadow-xs font-semibold' : 'bg-white/20 text-white border-white/20 shadow-sm font-semibold'
                  : isLight
                    ? 'bg-transparent text-slate-600 hover:text-slate-900'
                    : 'bg-white/[0.05] border-white/10 text-white/70 hover:bg-white/10'
                  }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>{config.provider === 'github' ? 'GitHub Gist' : t('gitModeGist', settings.language)}</span>
              </button>
              <button
                type="button"
                onClick={() => handleChange({ mode: 'repo' })}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium duration-0 cursor-pointer active:scale-95 ${config.mode === 'repo'
                  ? isLight ? 'bg-black/[0.08] text-slate-900 border border-black/10 shadow-xs font-semibold' : 'bg-white/20 text-white border-white/20 shadow-sm font-semibold'
                  : isLight
                    ? 'bg-transparent text-slate-600 hover:text-slate-900'
                    : 'bg-white/[0.05] border-white/10 text-white/70 hover:bg-white/10'
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
                ? 'bg-black/[0.03] border-black/8 text-slate-800'
                : 'bg-white/[0.05] border-white/10 text-white'
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>
                    {config.provider === 'github'
                      ? t('gitGistTitleGithub', settings.language)
                      : t('gitGistTitleGitee', settings.language)}
                  </span>
                </div>
                <a
                  href={tokenGeneratorUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`text-[11px] underline flex items-center gap-1 font-medium cursor-pointer ${isLight ? 'text-amber-700 hover:text-black' : 'text-amber-400 hover:text-white'
                    }`}
                >
                  <span>{t('gitGenerateToken', settings.language)}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div>
                <div className="text-[11px] opacity-70 mb-1.5">
                  {config.provider === 'github'
                    ? t('gitGithubTokenTip', settings.language)
                    : t('gitGiteeTokenTip', settings.language)}
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showToken ? 'text' : 'password'}
                      value={config.token}
                      onChange={(e) => handleChange({ token: e.target.value })}
                      placeholder={
                        config.provider === 'github'
                          ? t('gitTokenPlaceholderGithub', settings.language)
                          : t('gitTokenPlaceholderGitee', settings.language)
                      }
                      className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl border text-xs outline-none duration-0 ${isLight ? 'bg-[rgba(242,242,242,0.5)] border-black/15 text-slate-900 placeholder-slate-400 focus:border-black/30'
                        : 'bg-white/10 border-white/15 text-white placeholder-white/40 focus:border-white/30'
                        }`}
                    />
                    {config.token && (
                      <button
                        type="button"
                        onClick={() => setShowToken(!showToken)}
                        className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg duration-0 cursor-pointer ${isLight
                          ? 'text-slate-400 hover:text-slate-700 hover:bg-black/5'
                          : 'text-white/40 hover:text-white hover:bg-white/10'
                          }`}
                        title={showToken ? t('hide', settings.language) : t('show', settings.language)}
                      >
                        {showToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleSmartConnect}
                    disabled={isConnecting || !config.token.trim()}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium duration-0 cursor-pointer shrink-0 active:scale-95 ${isLight ? 'bg-black/[0.05] hover:bg-black/[0.09] text-slate-800 hover:text-slate-950 border border-black/10 shadow-xs font-semibold disabled:opacity-40 disabled:pointer-events-none' : 'bg-white/20 hover:bg-white/30 text-white border border-white/25 font-semibold shadow-sm disabled:opacity-40'
                      }`}
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
            /* --- Mode B: Repo 独立仓库模式 --- */
            <div
              className={`p-3.5 rounded-2xl border space-y-3 ${isLight
                ? 'bg-black/[0.03] border-black/8 text-slate-800'
                : 'bg-white/[0.05] border-white/10 text-white'
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
                    className={`text-[11px] underline flex items-center gap-1 font-medium cursor-pointer ${isLight ? 'text-amber-700 hover:text-black' : 'text-amber-400 hover:text-white'
                      }`}
                  >
                    <span>{t('gitGenerateToken', settings.language)}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showToken ? 'text' : 'password'}
                    value={config.token}
                    onChange={(e) => handleChange({ token: e.target.value })}
                    placeholder={
                      config.provider === 'github'
                        ? t('gitTokenPlaceholderRepo', settings.language)
                        : t('gitTokenPlaceholderGitee', settings.language)
                    }
                    className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl border text-xs outline-none duration-0 ${isLight ? 'bg-[rgba(242,242,242,0.5)] border-black/15 text-slate-900 placeholder-slate-400 focus:border-black/30'
                      : 'bg-white/10 border-white/15 text-white placeholder-white/40 focus:border-white/30'
                      }`}
                  />
                  {config.token && (
                    <button
                      type="button"
                      onClick={() => setShowToken(!showToken)}
                      className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg duration-0 cursor-pointer ${isLight
                        ? 'text-slate-400 hover:text-slate-700 hover:bg-black/5'
                        : 'text-white/40 hover:text-white hover:bg-white/10'
                        }`}
                      title={showToken ? t('hide', settings.language) : t('show', settings.language)}
                    >
                      {showToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
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
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    data-lpignore="true"
                    data-1p-ignore="true"
                    className={`flex-1 px-3.5 py-2.5 rounded-xl border text-xs outline-none duration-0 ${isLight ? 'bg-[rgba(242,242,242,0.5)] border-black/15 text-slate-900 placeholder-slate-400 focus:border-black/30'
                      : 'bg-white/10 border-white/15 text-white placeholder-white/40 focus:border-white/30'
                      }`}
                  />
                  <button
                    type="button"
                    onClick={handleTestRepo}
                    disabled={isTestingRepo || !config.token.trim()}
                    className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-medium duration-0 cursor-pointer shrink-0 active:scale-95 ${isLight ? 'bg-black/[0.05] hover:bg-black/[0.09] text-slate-800 hover:text-slate-950 border border-black/10 shadow-xs font-semibold disabled:opacity-40 disabled:pointer-events-none' : 'bg-white/20 hover:bg-white/30 text-white border border-white/25 font-semibold shadow-sm disabled:opacity-40'
                      }`}
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
                  <p className={`text-[11px] mt-1.5 ${isLight ? 'text-amber-700 font-medium' : 'text-amber-300'}`}>
                    {t('gitBoundRepo', settings.language)}: <strong>@{config.owner}</strong> / <strong>{config.repo}</strong>
                  </p>
                ) : (
                  <p className={`text-[10px] mt-1.5 ${isLight ? 'text-slate-400' : 'text-white/40'}`}>
                    {t('gitRepoTip', settings.language)}
                  </p>
                )}
              </div>

              {/* Branch & Path */}
              <div>
                <div className="flex items-end gap-2.5 pt-1">
                  <div className="flex-1 min-w-0">
                    <label className="block text-[11px] mb-1 opacity-70">{t('gitBranch', settings.language)}</label>
                    <input
                      type="text"
                      value={config.branch || 'main'}
                      onChange={(e) => handleChange({ branch: e.target.value })}
                      className={`w-full px-3 py-1.5 rounded-xl border text-xs outline-none ${isLight ? 'bg-[rgba(242,242,242,0.5)] border-slate-200/90 text-slate-900 focus:border-slate-400 focus:ring-1 focus:ring-black/5' : 'bg-white/10 border-white/15 text-white'
                        }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="block text-[11px] mb-1 opacity-70">{t('gitPath', settings.language)}</label>
                    <input
                      type="text"
                      value={config.path || 'mytab-backup.json'}
                      onChange={(e) => handleChange({ path: e.target.value })}
                      className={`w-full px-3 py-1.5 rounded-xl border text-xs outline-none ${isLight ? 'bg-[rgba(242,242,242,0.5)] border-slate-200/90 text-slate-900 focus:border-slate-400 focus:ring-1 focus:ring-black/5' : 'bg-white/10 border-white/15 text-white'
                        }`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAdvancedRestore(!showAdvancedRestore)}
                    className={`p-1.5 mb-[1px] shrink-0 rounded-lg transition-colors duration-200 ${isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-white/40 hover:text-white hover:bg-white/10'
                      }`}
                    title={t('gitAdvancedRestoreTitle', settings.language)}
                  >
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showAdvancedRestore ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {showAdvancedRestore && (
                  <div className={`mt-2.5 p-3 rounded-xl border flex flex-col gap-2 ${isLight ? 'bg-slate-50/50 border-slate-200/60' : 'bg-black/20 border-white/10'
                    }`}>
                    <div className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-white/60'}`}>
                      {t('gitAdvancedRestoreDesc', settings.language)}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customSha}
                        onChange={(e) => setCustomSha(e.target.value)}
                        placeholder={t('gitCommitShaPlaceholder', settings.language)}
                        className={`flex-1 px-3 py-2 rounded-lg text-xs outline-none transition-all ${isLight ? 'bg-[rgba(242,242,242,0.5)] border border-slate-200 focus:border-slate-400 text-slate-800 placeholder:text-slate-400'
                          : 'bg-white/5 border-transparent focus:border-white/20 text-white placeholder:text-white/30'
                          }`}
                      />
                      <button
                        type="button"
                        onClick={handleFetchCommits}
                        disabled={isLoadingCommits || !config.token.trim()}
                        className={`px-3 py-2 rounded-lg text-[11px] font-medium duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${isLight
                          ? 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-700'
                          : 'bg-white/10 border border-white/10 hover:bg-white/20 text-white'
                          }`}
                      >
                        {isLoadingCommits ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          t('gitViewCommits', settings.language)
                        )}
                      </button>
                    </div>

                    {/* Commit History List */}
                    {showCommitList && (
                      <div className={`mt-1 overflow-hidden rounded-lg border ${isLight ? 'border-slate-200 bg-white' : 'border-white/10 bg-black/20'}`}>
                        {commits.length === 0 && !isLoadingCommits ? (
                          <div className={`py-4 text-center text-xs ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
                            {t('gitNoCommitHistory', settings.language)}
                          </div>
                        ) : (
                          <div className="max-h-48 overflow-y-auto">
                            <table className="w-full text-left text-[11px]">
                              <thead className={`sticky top-0 z-10 backdrop-blur-md ${isLight ? 'bg-slate-50/90 text-slate-500' : 'bg-white/5 text-white/50'}`}>
                                <tr>
                                  <th className="px-3 py-2 font-medium w-[100px]">{t('gitBackupTime', settings.language)}</th>
                                  <th className="px-3 py-2 font-medium">{t('gitShaNote', settings.language)}</th>
                                </tr>
                              </thead>
                              <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-white/5'}`}>
                                {commits.map((commit) => (
                                  <tr
                                    key={commit.sha}
                                    onClick={() => {
                                      setCustomSha(commit.sha);
                                      setShowCommitList(false);
                                    }}
                                    className={`cursor-pointer transition-colors ${isLight ? 'hover:bg-slate-50 text-slate-700' : 'hover:bg-white/5 text-white/70'
                                      }`}
                                  >
                                    <td className="px-3 py-2 whitespace-nowrap">
                                      {new Date(commit.date).toLocaleString(settings.language || 'zh-CN', {
                                        year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
                                      })}
                                    </td>
                                    <td className="px-3 py-2">
                                      <div className="font-mono text-[10px] opacity-70 mb-0.5">{commit.sha.substring(0, 7)}</div>
                                      <div className="truncate max-w-[240px] opacity-90">{commit.message}</div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
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

          {/* Auto Sync Checkbox (Hidden for future roadmap until background data-change listeners are implemented) */}

          {/* Private Space Sync Checkbox */}
          <div className="flex items-center py-1">
            <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
              <input
                type="checkbox"
                checked={appState.syncSettings?.private || false}
                onChange={(e) => onUpdateSyncSettings?.({ normal: true, private: e.target.checked })}
                className="rounded accent-slate-900 dark:accent-white cursor-pointer w-3.5 h-3.5"
              />
              <span className={isLight ? 'text-slate-600' : 'text-white/70'}>
                {t('syncPrivateSpaceAlso', settings.language)}
              </span>
            </label>
          </div>

          {/* Action Buttons (上传备份 / 拉取恢复) */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleUpload}
                disabled={isUploading || isPulling || !config.token}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium duration-0 cursor-pointer active:scale-95 ${isLight ? 'bg-black/[0.05] hover:bg-black/[0.09] text-slate-800 hover:text-slate-950 border border-black/10 shadow-xs font-semibold disabled:opacity-40 disabled:pointer-events-none' : 'bg-white/20 hover:bg-white/30 text-white border border-white/25 font-semibold shadow-sm disabled:opacity-40'
                  }`}
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
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-medium duration-0 cursor-pointer active:scale-95 ${isLight ? 'bg-black/[0.03] hover:bg-black/[0.07] text-slate-700 hover:text-slate-900 border border-black/10 shadow-xs disabled:opacity-40 disabled:pointer-events-none' : 'bg-white/10 hover:bg-white/20 border-white/15 text-white disabled:opacity-40'
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
                ? 'bg-black/5 border border-black/10 text-slate-800'
                : 'bg-white/10 border border-white/15 text-white'
                }`}
            >
              <RefreshCw className="w-4 h-4 shrink-0" />
              <span>{syncMsg}</span>
            </div>
          )}

          {/* Last sync info */}
          <div className={`text-[11px] pt-0.5 font-tabular ${isLight ? 'text-slate-500' : 'text-white/50'}`}>
            {t('lastSync', settings.language)}: {formatLastSync()}
          </div>

          {/* Pull & Restore Confirmation Modal */}
          <ConfirmModal
            isOpen={showPullConfirm}
            type="warning"
            title={t('pullRestore', settings.language)}
            message={t('confirmPull', settings.language)}
            confirmText={t('confirm', settings.language)}
            language={settings.language}
            isLight={isLight}
            onConfirm={handlePullExecute}
            onCancel={() => setShowPullConfirm(false)}
          />
        </div>
      )}
    </div>
  );
};
