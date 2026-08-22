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
import { AppState, GitSyncConfig } from '../../types';
import { uploadToGit, restoreFromGit, GitClient, autoSetupGist } from '../../services/git';
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
 */
function parseRepoInput(input: string): { owner: string; repo: string; provider?: 'github' | 'gitee' } | null {
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

  const [config, setConfig] = useState<GitSyncConfig>({
    ...git,
    mode: git.mode || 'gist',
  });

  // Combined Repo URL / Identifier input for repo mode
  const [repoInput, setRepoInput] = useState<string>(
    git.owner && git.repo ? `${git.owner}/${git.repo}` : ''
  );

  const [isConnecting, setIsConnecting] = useState(false);
  const [connectResult, setConnectResult] = useState<{ success?: boolean; message?: string; owner?: string } | null>(null);
  const [isTestingRepo, setIsTestingRepo] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [showPullConfirm, setShowPullConfirm] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');

  useEffect(() => {
    if (git.owner && git.repo && !repoInput) {
      setRepoInput(`${git.owner}/${git.repo}`);
    }
  }, [git.owner, git.repo]);

  const handleChange = (fields: Partial<GitSyncConfig>) => {
    const updated = { ...config, ...fields };
    setConfig(updated);
    onUpdateGit(updated);
  };

  // Handle smart repo URL input changes
  const handleRepoInputChange = (value: string) => {
    setRepoInput(value);
    const parsed = parseRepoInput(value);
    if (parsed) {
      handleChange({
        owner: parsed.owner,
        repo: parsed.repo,
        provider: parsed.provider || config.provider,
      });
    }
  };

  // 1. One-Click Smart Setup for Gist
  const handleSmartConnect = async () => {
    if (!config.token.trim()) {
      setConnectResult({ success: false, message: '请先填写 Personal Access Token (令牌)' });
      return;
    }

    setIsConnecting(true);
    setConnectResult(null);

    try {
      const res = await autoSetupGist(config.provider, config.token.trim());
      if (res.success) {
        const updated: GitSyncConfig = {
          ...config,
          enabled: true,
          mode: 'gist',
          owner: res.owner || config.owner,
          gistId: res.gistId,
          lastSyncError: undefined,
        };
        setConfig(updated);
        onUpdateGit(updated);
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

  // 2. Test Repo Connection for Repo Mode
  const handleTestRepo = async () => {
    if (!config.token.trim()) {
      setConnectResult({ success: false, message: '请先填写 Personal Access Token (令牌)' });
      return;
    }
    if (!config.owner || !config.repo) {
      setConnectResult({ success: false, message: '请输入完整的仓库地址或所有者/仓库名' });
      return;
    }

    setIsTestingRepo(true);
    setConnectResult(null);

    try {
      const client = new GitClient(config);
      const res = await client.testConnection();
      setConnectResult(res);
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
        className={`flex items-center justify-between p-3.5 rounded-2xl border transition-colors ${
          isLight
            ? 'bg-black/5 border-black/10 text-slate-900'
            : 'bg-white/5 border-white/10 text-white'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-500">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold">Git 云同步与备份</div>
            <div className={`text-xs ${isLight ? 'text-slate-500' : 'text-white/50'}`}>
              支持 GitHub / Gitee 云端极简加密同步
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
              托管平台
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleChange({ provider: 'github' })}
                className={`py-2 rounded-xl text-xs font-medium border transition-all ${
                  config.provider === 'github'
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
                onClick={() => handleChange({ provider: 'gitee' })}
                className={`py-2 rounded-xl text-xs font-medium border transition-all ${
                  config.provider === 'gitee'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20 font-semibold'
                    : isLight
                    ? 'bg-black/5 border-black/10 text-slate-700 hover:bg-black/10'
                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                }`}
              >
                Gitee (码云)
              </button>
            </div>
          </div>

          {/* 3. Sync Mode Switch (紧随托管平台下方，逻辑清晰直观) */}
          <div>
            <label className={`block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-700' : 'text-white/80'}`}>
              同步模式
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleChange({ mode: 'gist' })}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium border transition-all ${
                  config.mode === 'gist'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20 font-semibold'
                    : isLight
                    ? 'bg-black/5 border-black/10 text-slate-700 hover:bg-black/10'
                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>极简代码片段 (推荐)</span>
              </button>
              <button
                type="button"
                onClick={() => handleChange({ mode: 'repo' })}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium border transition-all ${
                  config.mode === 'repo'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20 font-semibold'
                    : isLight
                    ? 'bg-black/5 border-black/10 text-slate-700 hover:bg-black/10'
                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                }`}
              >
                <FolderGit2 className="w-3.5 h-3.5" />
                <span>自定义仓库 (高级)</span>
              </button>
            </div>
          </div>

          {/* 4. Configuration Form Area */}
          {config.mode === 'gist' ? (
            /* --- Mode A: Gist 极简模式 --- */
            <div
              className={`p-3.5 rounded-2xl border space-y-3 ${
                isLight
                  ? 'bg-indigo-50/50 border-indigo-200/80 text-slate-800'
                  : 'bg-indigo-950/20 border-indigo-500/20 text-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>自动创建并绑定代码片段</span>
                </div>
                <a
                  href={tokenGeneratorUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-indigo-600 hover:text-indigo-700 underline flex items-center gap-1 font-medium cursor-pointer"
                >
                  <span>一键生成 Token</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div>
                <div className="text-[11px] text-slate-500 dark:text-white/60 mb-1.5">
                  {config.provider === 'github'
                    ? '点击上方链接前往 GitHub，已自动勾选常用权限，滑到底部生成并复制即可。'
                    : '前往 Gitee 创建私人令牌，建议勾选 gists 权限即可。'}
                </div>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={config.token}
                    onChange={(e) => handleChange({ token: e.target.value })}
                    placeholder={config.provider === 'github' ? '粘贴 GitHub Token (ghp_xxx)' : '粘贴 Gitee 私人令牌'}
                    className={`flex-1 px-3.5 py-2.5 rounded-xl border text-xs outline-none focus:border-indigo-500 transition-colors ${
                      isLight
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
                    <span>智能连接</span>
                  </button>
                </div>
              </div>

              {/* Connected Badge Info */}
              {config.gistId && config.owner && (
                <div
                  className={`p-2.5 rounded-xl text-xs flex items-center justify-between border ${
                    isLight
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-emerald-600" />
                    <span>已绑定账号: <strong>@{config.owner}</strong></span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-600/20 text-emerald-600 dark:text-emerald-300 font-medium">
                    私密代码片段已就绪
                  </span>
                </div>
              )}
            </div>
          ) : (
            /* --- Mode B: Repo 独立仓库模式 (智能解析单输入框) --- */
            <div
              className={`p-3.5 rounded-2xl border space-y-3 ${
                isLight
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
                    <span>一键生成 Token</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <input
                  type="password"
                  value={config.token}
                  onChange={(e) => handleChange({ token: e.target.value })}
                  placeholder={config.provider === 'github' ? '粘贴 GitHub Token (需要 repo 权限)' : '粘贴 Gitee 私人令牌'}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none focus:border-indigo-500 transition-colors ${
                    isLight
                      ? 'bg-white border-black/15 text-slate-900 placeholder-slate-400'
                      : 'bg-white/10 border-white/15 text-white placeholder-white/40'
                  }`}
                />
              </div>

              {/* Smart Unified Repo URL/Path Input */}
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-700' : 'text-white/80'}`}>
                  仓库地址 / 路径 <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={repoInput}
                    onChange={(e) => handleRepoInputChange(e.target.value)}
                    placeholder="输入仓库完整 URL 或 用户名/仓库名，如: octocat/my-backup"
                    className={`flex-1 px-3.5 py-2.5 rounded-xl border text-xs outline-none focus:border-indigo-500 transition-colors ${
                      isLight
                        ? 'bg-white border-black/15 text-slate-900 placeholder-slate-400'
                        : 'bg-white/10 border-white/15 text-white placeholder-white/40'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleTestRepo}
                    disabled={isTestingRepo || !config.token.trim() || !config.owner || !config.repo}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-medium shadow-md shadow-indigo-600/30 transition-all cursor-pointer shrink-0"
                  >
                    {isTestingRepo && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>验证连接</span>
                  </button>
                </div>
                {config.owner && config.repo && (
                  <p className={`text-[11px] mt-1.5 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`}>
                    已识别: 所有者 <strong>{config.owner}</strong> / 仓库 <strong>{config.repo}</strong>
                  </p>
                )}
              </div>

              {/* Branch & Path */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div>
                  <label className="block text-[11px] mb-1 opacity-70">目标分支</label>
                  <input
                    type="text"
                    value={config.branch || 'main'}
                    onChange={(e) => handleChange({ branch: e.target.value })}
                    className={`w-full px-3 py-1.5 rounded-xl border text-xs outline-none ${
                      isLight ? 'bg-white border-black/15 text-slate-900' : 'bg-white/10 border-white/15 text-white'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] mb-1 opacity-70">备份文件路径</label>
                  <input
                    type="text"
                    value={config.path || 'mytab-backup.json'}
                    onChange={(e) => handleChange({ path: e.target.value })}
                    className={`w-full px-3 py-1.5 rounded-xl border text-xs outline-none ${
                      isLight ? 'bg-white border-black/15 text-slate-900' : 'bg-white/10 border-white/15 text-white'
                    }`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Test / Connect Result Message */}
          {connectResult && (
            <div
              className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                connectResult.success
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
              数据变动时自动同步至云端
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
                title="将本地全部网址、分类和外观设置备份推送到云端"
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
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border disabled:opacity-50 text-xs font-medium transition-all cursor-pointer ${
                  isLight
                    ? 'bg-white hover:bg-slate-50 border-black/10 text-slate-800 shadow-sm'
                    : 'bg-white/10 hover:bg-white/20 border-white/15 text-white'
                }`}
                title="从云端拉取最新备份并覆盖恢复到本地"
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
              className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                isLight
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
            title="拉取云端备份"
            message={t('confirmPull', settings.language)}
            confirmText="确定拉取并恢复"
            language={settings.language}
            onConfirm={handlePullExecute}
            onCancel={() => setShowPullConfirm(false)}
          />
        </div>
      )}
    </div>
  );
};
