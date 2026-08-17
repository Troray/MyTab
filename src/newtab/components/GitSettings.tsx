import React, { useState } from 'react';
import { GitBranch, CheckCircle, AlertCircle, RefreshCw, Lock, ExternalLink, UploadCloud, DownloadCloud } from 'lucide-react';
import { AppState, GitSyncConfig } from '../../types';
import { uploadToGit, restoreFromGit, GitClient } from '../../services/git';
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
  const [config, setConfig] = useState<GitSyncConfig>(git);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [showPullConfirm, setShowPullConfirm] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');

  const handleChange = (fields: Partial<GitSyncConfig>) => {
    const updated = { ...config, ...fields };
    setConfig(updated);
    onUpdateGit(updated);
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const client = new GitClient(config);
      const res = await client.testConnection();
      setTestResult(res);
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || '连接失败' });
    } finally {
      setIsTesting(false);
    }
  };

  // 1. Upload Local to Git
  const handleUpload = async () => {
    setIsUploading(true);
    setSyncMsg('');
    try {
      const res = await uploadToGit({ ...appState, git: config });
      if (res.success) {
        setSyncMsg(res.message || 'Git 上传备份成功');
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

  // 2. Pull Remote from Git to Local
  const handlePullExecute = async () => {
    setShowPullConfirm(false);
    setIsPulling(true);
    setSyncMsg('');
    try {
      const res = await restoreFromGit({ ...appState, git: config });
      if (res.success) {
        setSyncMsg(res.message || 'Git 拉取恢复成功');
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

  const tokenHelpUrl =
    config.provider === 'github'
      ? 'https://github.com/settings/tokens?type=beta'
      : 'https://gitee.com/profile/personal_access_tokens';

  return (
    <div className="space-y-4">
      {/* Enable Switch */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-600/30 text-purple-400">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold">Git 仓库同步 / 备份</div>
            <div className="text-xs text-white/50">支持 GitHub / Gitee 私有仓库安全备份</div>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={config.enabled}
            onChange={(e) => handleChange({ enabled: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
        </label>
      </div>

      {config.enabled && (
        <div className="space-y-3.5 pt-2 animate-fade-in">
          {/* Provider Selector */}
          <div>
            <label className="block text-xs font-medium text-white/80 mb-1.5">托管平台</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleChange({ provider: 'github' })}
                className={`py-2 rounded-xl text-xs font-medium border transition-all ${
                  config.provider === 'github'
                    ? 'bg-purple-600/30 border-purple-500 text-purple-300'
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
                    ? 'bg-purple-600/30 border-purple-500 text-purple-300'
                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                }`}
              >
                Gitee (码云)
              </button>
            </div>
          </div>

          {/* Owner & Repo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-white/80 mb-1">
                用户名 / Owner <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={config.owner}
                onChange={(e) => handleChange({ owner: e.target.value })}
                placeholder="例如：octocat"
                className="w-full px-3.5 py-2 rounded-xl bg-white/10 border border-white/15 focus:border-purple-500 outline-none text-xs text-white placeholder-white/40"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/80 mb-1">
                仓库名 / Repo <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={config.repo}
                onChange={(e) => handleChange({ repo: e.target.value })}
                placeholder="例如：mytab-data"
                className="w-full px-3.5 py-2 rounded-xl bg-white/10 border border-white/15 focus:border-purple-500 outline-none text-xs text-white placeholder-white/40"
              />
            </div>
          </div>

          {/* Branch & File Path */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-white/80 mb-1">目标分支 / Branch</label>
              <input
                type="text"
                value={config.branch || 'main'}
                onChange={(e) => handleChange({ branch: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-white/10 border border-white/15 focus:border-purple-500 outline-none text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/80 mb-1">文件路径 / Path</label>
              <input
                type="text"
                value={config.path || 'mytab-backup.json'}
                onChange={(e) => handleChange({ path: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-white/10 border border-white/15 focus:border-purple-500 outline-none text-xs text-white"
              />
            </div>
          </div>

          {/* Access Token */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-white/80">
                Personal Access Token (PAT) <span className="text-red-400">*</span>
              </label>
              <a
                href={tokenHelpUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                <span>创建 Token</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              value={config.token}
              onChange={(e) => handleChange({ token: e.target.value })}
              placeholder={config.provider === 'github' ? 'ghp_xxxx 或 github_pat_xxxx' : 'Gitee 私人令牌'}
              className="w-full px-3.5 py-2 rounded-xl bg-white/10 border border-white/15 focus:border-purple-500 outline-none text-xs text-white placeholder-white/40"
            />
            <p className="text-[10px] text-white/50 mt-1">
              建议创建仅包含对应私有仓库读写权限 (Contents: Read and write) 的精细化 Token。
            </p>
          </div>

          {/* Auto Sync Switch */}
          <div className="flex items-center justify-between py-1">
            <span className="text-xs text-white/80">数据变动时自动推送至 Git</span>
            <input
              type="checkbox"
              checked={config.autoSync}
              onChange={(e) => handleChange({ autoSync: e.target.checked })}
              className="rounded bg-white/10 border-white/20 text-purple-600 focus:ring-0 cursor-pointer"
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleUpload}
                disabled={isUploading || isPulling || !config.owner || !config.repo || !config.token}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-xs font-medium text-white shadow-md shadow-purple-600/30 transition-all cursor-pointer"
                title="将本地全部网址、分类和外观设置备份推送到 Git 仓库"
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
                disabled={isUploading || isPulling || !config.owner || !config.repo || !config.token}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 disabled:opacity-50 text-xs font-medium text-white transition-all cursor-pointer"
                title="从 Git 仓库拉取最新备份并覆盖恢复到本地"
              >
                {isPulling ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <DownloadCloud className="w-3.5 h-3.5" />
                )}
                <span>{t('pullRestore', settings.language)}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleTest}
              disabled={isTesting || !config.owner || !config.repo || !config.token}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-50 text-xs text-white/70 hover:text-white transition-colors cursor-pointer border border-white/10"
            >
              {isTesting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>测试仓库连接</span>
            </button>
          </div>

          {/* Test & Sync Results */}
          {testResult && (
            <div
              className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                testResult.success
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-red-500/20 text-red-300 border border-red-500/30'
              }`}
            >
              {testResult.success ? (
                <CheckCircle className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          {syncMsg && (
            <div className="p-2.5 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-200 text-xs flex items-center gap-2">
              <RefreshCw className="w-4 h-4 shrink-0" />
              <span>{syncMsg}</span>
            </div>
          )}

          {/* Last sync info */}
          <div className="text-[11px] text-white/50 pt-1">
            {t('lastSync', settings.language)}: {formatLastSync()}
          </div>

          {/* Pull & Restore Confirmation Modal */}
          <ConfirmModal
            isOpen={showPullConfirm}
            type="warning"
            title="拉取 Git 仓库备份"
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
