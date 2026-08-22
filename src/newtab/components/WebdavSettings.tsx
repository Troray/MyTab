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
  const isLight = settings.mode === 'light';

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
        setSyncMsg(res.message || t('uploadBackup', settings.language));
        onStateReload();
      } else {
        setSyncMsg(`${res.message}`);
      }
    } catch (err: any) {
      setSyncMsg(`${err.message}`);
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
        setSyncMsg(res.message || t('pullRestore', settings.language));
        onStateReload();
      } else {
        setSyncMsg(`${res.message}`);
      }
    } catch (err: any) {
      setSyncMsg(`${err.message}`);
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
      <div
        className={`flex items-center justify-between p-3.5 rounded-2xl border transition-colors ${
          isLight
            ? 'bg-black/5 border-black/10 text-slate-900'
            : 'bg-white/5 border-white/10 text-white'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-500">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold">{t('webdavEnable', settings.language)}</div>
            <div className={`text-xs ${isLight ? 'text-slate-500' : 'text-white/50'}`}>
              {t('webdavDesc', settings.language)}
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
          {/* Server URL */}
          <div>
            <label className={`block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-700' : 'text-white/80'}`}>
              {t('webdavUrl', settings.language)}
            </label>
            <input
              type="text"
              value={config.url}
              onChange={(e) => handleChange({ url: e.target.value })}
              placeholder={t('webdavUrlPlaceholder', settings.language)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none focus:border-indigo-500 transition-colors ${
                isLight
                  ? 'bg-white border-black/15 text-slate-900 placeholder-slate-400'
                  : 'bg-white/10 border-white/15 text-white placeholder-white/40'
              }`}
            />
          </div>

          {/* Username & Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-700' : 'text-white/80'}`}>
                {t('webdavUser', settings.language)}
              </label>
              <input
                type="text"
                value={config.username}
                onChange={(e) => handleChange({ username: e.target.value })}
                placeholder={t('webdavUserPlaceholder', settings.language)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none focus:border-indigo-500 transition-colors ${
                  isLight
                    ? 'bg-white border-black/15 text-slate-900 placeholder-slate-400'
                    : 'bg-white/10 border-white/15 text-white placeholder-white/40'
                }`}
              />
            </div>
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-700' : 'text-white/80'}`}>
                {t('webdavPass', settings.language)}
              </label>
              <input
                type="password"
                value={config.password || ''}
                onChange={(e) => handleChange({ password: e.target.value })}
                placeholder={t('webdavPassPlaceholder', settings.language)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none focus:border-indigo-500 transition-colors ${
                  isLight
                    ? 'bg-white border-black/15 text-slate-900 placeholder-slate-400'
                    : 'bg-white/10 border-white/15 text-white placeholder-white/40'
                }`}
              />
            </div>
          </div>

          {/* Path */}
          <div>
            <label className={`block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-700' : 'text-white/80'}`}>
              {t('webdavPath', settings.language)}
            </label>
            <input
              type="text"
              value={config.syncPath}
              onChange={(e) => handleChange({ syncPath: e.target.value })}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none focus:border-indigo-500 transition-colors ${
                isLight
                  ? 'bg-white border-black/15 text-slate-900'
                  : 'bg-white/10 border-white/15 text-white'
              }`}
            />
          </div>

          {/* Conflict Strategy */}
          <div>
            <label className={`block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-700' : 'text-white/80'}`}>
              {t('webdavConflict', settings.language)}
            </label>
            <select
              value={config.conflictStrategy}
              onChange={(e) => handleChange({ conflictStrategy: e.target.value as any })}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none focus:border-indigo-500 cursor-pointer ${
                isLight
                  ? 'bg-white border-black/15 text-slate-900'
                  : 'bg-slate-900 border-white/15 text-white'
              }`}
            >
              <option value="merge" className={isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'}>
                {t('strategyMerge', settings.language)}
              </option>
              <option value="local" className={isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'}>
                {t('strategyLocal', settings.language)}
              </option>
              <option value="remote" className={isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'}>
                {t('strategyRemote', settings.language)}
              </option>
            </select>
          </div>

          {/* Auto Sync Switch */}
          <div className="flex items-center justify-between py-1">
            <span className={`text-xs ${isLight ? 'text-slate-700' : 'text-white/80'}`}>
              {t('webdavAutoSync', settings.language)}
            </span>
            <input
              type="checkbox"
              checked={config.autoSync}
              onChange={(e) => handleChange({ autoSync: e.target.checked })}
              className="w-4 h-4 rounded bg-transparent border-gray-400 text-indigo-600 focus:ring-0 cursor-pointer"
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleUpload}
                disabled={isUploading || isPulling || !config.url}
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
                disabled={isUploading || isPulling || !config.url}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border disabled:opacity-50 text-xs font-medium transition-all cursor-pointer ${
                  isLight
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

            <button
              type="button"
              onClick={handleTest}
              disabled={isTesting || !config.url}
              className={`w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border disabled:opacity-50 text-xs font-medium transition-all cursor-pointer ${
                isLight
                  ? 'bg-black/5 hover:bg-black/10 border-black/10 text-slate-700'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/80'
              }`}
            >
              {isTesting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>{t('webdavTest', settings.language)}</span>
            </button>
          </div>

          {/* Test Results */}
          {testResult && (
            <div
              className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                testResult.success
                  ? isLight
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : isLight
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-red-500/20 text-red-300 border border-red-500/30'
              }`}
            >
              {testResult.success ? (
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          {/* Sync Msg */}
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
