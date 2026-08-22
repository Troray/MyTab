import React, { useState } from 'react';
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
  ChevronDown,
  ChevronUp,
  User,
  ShieldCheck
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
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectResult, setConnectResult] = useState<{ success?: boolean; message?: string; owner?: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [showPullConfirm, setShowPullConfirm] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(git.mode === 'repo');

  const handleChange = (fields: Partial<GitSyncConfig>) => {
    const updated = { ...config, ...fields };
    setConfig(updated);
    onUpdateGit(updated);
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

  // 2. Upload Local to Git
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

  // 3. Pull Remote from Git to Local
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
      ? 'https://github.com/settings/tokens/new?description=MyTab+Backup&scopes=gist'
      : 'https://gitee.com/profile/personal_access_tokens/new';

  return (
    <div className="space-y-4">
      {/* Enable Switch */}
      <div
        className={`flex items-center justify-between p-3.5 rounded-2xl border transition-colors ${
          isLight
            ? 'bg-black/5 border-black/10 text-slate-900'
            : 'bg-white/5 border-white/10 text-white'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-600/20 text-purple-500">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold">Git 云同步与备份</div>
            <div className={`text-xs ${isLight ? 'text-slate-500' : 'text-white/50'}`}>
              支持 GitHub / Gitee 私密代码片段极简云备份
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
          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
        </label>
      </div>

      {config.enabled && (
        <div className="space-y-3.5 pt-1 animate-fade-in">
          {/* Provider Selector */}
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
                    ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/20 font-semibold'
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
                    ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/20 font-semibold'
                    : isLight
                    ? 'bg-black/5 border-black/10 text-slate-700 hover:bg-black/10'
                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                }`}
              >
                Gitee (码云)
              </button>
            </div>
          </div>

          {/* Step 1 & 2: Token Input with Direct Link & Smart Connect */}
          <div
            className={`p-3.5 rounded-2xl border space-y-3 ${
              isLight
                ? 'bg-purple-50/50 border-purple-200/80 text-slate-800'
                : 'bg-purple-950/20 border-purple-500/20 text-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>极简智能配置 (无需手动建仓)</span>
              </div>
              <a
                href={tokenGeneratorUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-purple-600 hover:text-purple-700 underline flex items-center gap-1 font-medium cursor-pointer"
              >
                <span>点此前去生成令牌</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div>
              <div className="text-[11px] text-slate-500 dark:text-white/60 mb-1.5">
                {config.provider === 'github'
                  ? '点击上方链接前往 GitHub，已自动勾选 gist 权限，直接滑到底部生成并复制即可。'
                  : '前往 Gitee 创建私人令牌，建议勾选 gists 权限即可。'}
              </div>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={config.token}
                  onChange={(e) => handleChange({ token: e.target.value })}
                  placeholder={config.provider === 'github' ? '粘贴 GitHub Token (ghp_xxx)' : '粘贴 Gitee 私人令牌'}
                  className={`flex-1 px-3.5 py-2.5 rounded-xl border text-xs outline-none focus:border-purple-500 transition-colors ${
                    isLight
                      ? 'bg-white border-black/15 text-slate-900 placeholder-slate-400'
                      : 'bg-white/10 border-white/15 text-white placeholder-white/40'
                  }`}
                />
                <button
                  type="button"
                  onClick={handleSmartConnect}
                  disabled={isConnecting || !config.token.trim()}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-medium shadow-md shadow-purple-600/30 transition-all cursor-pointer shrink-0"
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
              className="w-4 h-4 rounded bg-transparent border-gray-400 text-purple-600 focus:ring-0 cursor-pointer"
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleUpload}
                disabled={isUploading || isPulling || !config.token}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-xs font-medium text-white shadow-md shadow-purple-600/30 transition-all cursor-pointer"
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
                  ? 'bg-purple-50 border border-purple-200 text-purple-800'
                  : 'bg-purple-500/20 border border-purple-500/30 text-purple-200'
              }`}
            >
              <RefreshCw className="w-4 h-4 shrink-0 text-purple-500" />
              <span>{syncMsg}</span>
            </div>
          )}

          {/* Last sync info */}
          <div className={`text-[11px] pt-0.5 ${isLight ? 'text-slate-500' : 'text-white/50'}`}>
            {t('lastSync', settings.language)}: {formatLastSync()}
          </div>

          {/* Advanced Mode Accordion */}
          <div className="pt-2 border-t border-black/5 dark:border-white/10">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`flex items-center justify-between w-full text-xs font-medium transition-colors ${
                isLight ? 'text-slate-600 hover:text-slate-900' : 'text-white/60 hover:text-white'
              }`}
            >
              <span>高级设置 (自定义 Git 仓库模式)</span>
              {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showAdvanced && (
              <div className="space-y-3 pt-3 animate-fade-in">
                {/* Sync Mode Switch */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleChange({ mode: 'gist' })}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium border ${
                      config.mode === 'gist'
                        ? 'bg-purple-600 text-white border-purple-600'
                        : isLight
                        ? 'bg-black/5 border-black/10 text-slate-700'
                        : 'bg-white/5 border-white/10 text-white/70'
                    }`}
                  >
                    Gist 代码片段模式
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange({ mode: 'repo' })}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium border ${
                      config.mode === 'repo'
                        ? 'bg-purple-600 text-white border-purple-600'
                        : isLight
                        ? 'bg-black/5 border-black/10 text-slate-700'
                        : 'bg-white/5 border-white/10 text-white/70'
                    }`}
                  >
                    Repo 独立仓库模式
                  </button>
                </div>

                {config.mode === 'repo' ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] mb-1">用户名 / Owner</label>
                        <input
                          type="text"
                          value={config.owner}
                          onChange={(e) => handleChange({ owner: e.target.value })}
                          placeholder="例如: octocat"
                          className={`w-full px-3 py-1.5 rounded-xl border text-xs outline-none ${
                            isLight ? 'bg-white border-black/15 text-slate-900' : 'bg-white/10 border-white/15 text-white'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] mb-1">仓库名 / Repo</label>
                        <input
                          type="text"
                          value={config.repo}
                          onChange={(e) => handleChange({ repo: e.target.value })}
                          placeholder="例如: mytab-backup"
                          className={`w-full px-3 py-1.5 rounded-xl border text-xs outline-none ${
                            isLight ? 'bg-white border-black/15 text-slate-900' : 'bg-white/10 border-white/15 text-white'
                          }`}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] mb-1">目标分支 / Branch</label>
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
                        <label className="block text-[11px] mb-1">文件路径 / Path</label>
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
                  </>
                ) : (
                  <div>
                    <label className="block text-[11px] mb-1">当前绑定的 Gist ID</label>
                    <input
                      type="text"
                      value={config.gistId || ''}
                      onChange={(e) => handleChange({ gistId: e.target.value })}
                      placeholder="自动创建或手动粘贴现有 Gist ID"
                      className={`w-full px-3 py-1.5 rounded-xl border text-xs outline-none ${
                        isLight ? 'bg-white border-black/15 text-slate-900' : 'bg-white/10 border-white/15 text-white'
                      }`}
                    />
                  </div>
                )}
              </div>
            )}
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
