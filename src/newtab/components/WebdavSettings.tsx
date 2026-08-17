import React, { useState } from 'react';
import { Cloud, CheckCircle, AlertCircle, RefreshCw, Radio, Lock, UploadCloud, DownloadCloud } from 'lucide-react';
import { AppState, WebdavConfig } from '../../types';
import { uploadToWebdav, restoreFromWebdav, WebdavClient } from '../../services/webdav';
import { ConfirmModal } from './ConfirmModal';
import { t } from '../../utils/i18n';

interface WebdavSettingsProps {
  appState: AppState;
  onUpdateWebdav: (config: WebdavConfig) => void;
  onStateReload: () => void;
}

export const WebdavSettings: React.FC<WebdavSettingsProps> = ({
  appState,
  onUpdateWebdav,
  onStateReload,
}) => {
  const { webdav, settings } = appState;
  const [config, setConfig] = useState<WebdavConfig>(webdav);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [showPullConfirm, setShowPullConfirm] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');

  const handleChange = (fields: Partial<WebdavConfig>) => {
    const updated = { ...config, ...fields };
    setConfig(updated);
    onUpdateWebdav(updated);
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const client = new WebdavClient(config);
      const res = await client.testConnection();
      setTestResult(res);
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Connection failed' });
    } finally {
      setIsTesting(false);
    }
  };

  // 1. Upload Local to WebDAV
  const handleUpload = async () => {
    setIsUploading(true);
    setSyncMsg('');
    try {
      const res = await uploadToWebdav({ ...appState, webdav: config });
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

  // 2. Pull Remote from WebDAV to Local
  const handlePullExecute = async () => {
    setShowPullConfirm(false);
    setIsPulling(true);
    setSyncMsg('');
    try {
      const res = await restoreFromWebdav({ ...appState, webdav: config });
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

  return (
    <div className="space-y-4">
      {/* Enable Switch */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-600/30 text-indigo-400">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold">{t('webdavEnable', settings.language)}</div>
            <div className="text-xs text-white/50">支持坚果云、Nextcloud、Alist 等 WebDAV 服务</div>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={config.enabled}
            onChange={(e) => handleChange({ enabled: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
        </label>
      </div>

      {config.enabled && (
        <div className="space-y-3.5 pt-2 animate-fade-in">
          {/* Server URL */}
          <div>
            <label className="block text-xs font-medium text-white/80 mb-1">
              {t('webdavUrl', settings.language)}
            </label>
            <input
              type="text"
              value={config.url}
              onChange={(e) => handleChange({ url: e.target.value })}
              placeholder={t('webdavUrlPlaceholder', settings.language)}
              className="w-full px-3.5 py-2 rounded-xl bg-white/10 border border-white/15 focus:border-indigo-500 outline-none text-xs text-white placeholder-white/40"
            />
          </div>

          {/* Username & Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-white/80 mb-1">
                {t('webdavUser', settings.language)}
              </label>
              <input
                type="text"
                value={config.username}
                onChange={(e) => handleChange({ username: e.target.value })}
                placeholder={t('webdavUserPlaceholder', settings.language)}
                className="w-full px-3.5 py-2 rounded-xl bg-white/10 border border-white/15 focus:border-indigo-500 outline-none text-xs text-white placeholder-white/40"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/80 mb-1">
                {t('webdavPass', settings.language)}
              </label>
              <input
                type="password"
                value={config.password || ''}
                onChange={(e) => handleChange({ password: e.target.value })}
                placeholder={t('webdavPassPlaceholder', settings.language)}
                className="w-full px-3.5 py-2 rounded-xl bg-white/10 border border-white/15 focus:border-indigo-500 outline-none text-xs text-white placeholder-white/40"
              />
            </div>
          </div>

          {/* Path */}
          <div>
            <label className="block text-xs font-medium text-white/80 mb-1">
              {t('webdavPath', settings.language)}
            </label>
            <input
              type="text"
              value={config.syncPath}
              onChange={(e) => handleChange({ syncPath: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-white/10 border border-white/15 focus:border-indigo-500 outline-none text-xs text-white"
            />
          </div>

          {/* Conflict Strategy */}
          <div>
            <label className="block text-xs font-medium text-white/80 mb-1">
              {t('webdavConflict', settings.language)}
            </label>
            <select
              value={config.conflictStrategy}
              onChange={(e) => handleChange({ conflictStrategy: e.target.value as any })}
              className="w-full px-3.5 py-2 rounded-xl bg-white/10 border border-white/15 focus:border-indigo-500 outline-none text-xs text-white cursor-pointer"
            >
              <option value="merge" className="bg-slate-900 text-white">{t('strategyMerge', settings.language)}</option>
              <option value="local" className="bg-slate-900 text-white">{t('strategyLocal', settings.language)}</option>
              <option value="remote" className="bg-slate-900 text-white">{t('strategyRemote', settings.language)}</option>
            </select>
          </div>

          {/* Auto Sync Switch */}
          <div className="flex items-center justify-between py-1">
            <span className="text-xs text-white/80">{t('webdavAutoSync', settings.language)}</span>
            <input
              type="checkbox"
              checked={config.autoSync}
              onChange={(e) => handleChange({ autoSync: e.target.checked })}
              className="rounded bg-white/10 border-white/20 text-indigo-600 focus:ring-0 cursor-pointer"
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleUpload}
                disabled={isUploading || isPulling || !config.url}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-xs font-medium text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                title="将本地全部网址、分类和外观设置备份上传至 WebDAV"
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
                disabled={isUploading || isPulling || !config.url}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 disabled:opacity-50 text-xs font-medium text-white transition-all cursor-pointer"
                title="从 WebDAV 云端拉取最新备份并覆盖恢复到本地"
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
              disabled={isTesting || !config.url}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-50 text-xs text-white/70 hover:text-white transition-colors cursor-pointer border border-white/10"
            >
              {isTesting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>{t('webdavTest', settings.language)}</span>
            </button>
          </div>

          {/* Test / Sync Results */}
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
            <div className="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-200 text-xs flex items-center gap-2">
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
            title="拉取 WebDAV 云端备份"
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
