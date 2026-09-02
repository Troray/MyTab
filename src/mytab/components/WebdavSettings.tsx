import React, { useState } from 'react';
import { Cloud, CheckCircle, AlertCircle, RefreshCw, Radio, Lock, UploadCloud, DownloadCloud, Eye, EyeOff } from 'lucide-react';
import { AppState, WebdavConfig } from '../../types';
import { uploadToWebdav, restoreFromWebdav, WebdavClient } from '../../services/webdav';
import { ConfirmModal } from './ConfirmModal';
import { CustomSelect } from './CustomSelect';
import { ToggleSwitch } from './ToggleSwitch';
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
  const [showPassword, setShowPassword] = useState(false);

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
    return new Date(config.lastSyncTime).toLocaleString(settings.language || 'zh-CN');
  };

  return (
    <div className="space-y-3.5">
      {/* Enable Switch */}
      <div
        className={`flex items-center justify-between p-3.5 rounded-2xl border duration-0 ${
          isLight
            ? 'bg-black/[0.03] border-black/8 text-slate-900'
            : 'bg-white/[0.05] border-white/10 text-white'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-xl border ${
              isLight
                ? 'bg-black/[0.04] border-black/5 text-slate-800'
                : 'bg-white/10 border-white/10 text-white'
            }`}
          >
            <Cloud className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="text-xs font-semibold">{t('webdavEnable', settings.language)}</div>
            <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-white/50'}`}>
              {t('webdavDesc', settings.language)}
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
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none duration-0 ${
                isLight
                  ? 'bg-black/5 border-black/10 focus:border-black/30 focus:ring-2 focus:ring-black/10 text-slate-900 placeholder-slate-400'
                  : 'bg-white/10 border-white/15 focus:border-white/30 focus:ring-2 focus:ring-white/20 text-white placeholder-white/40'
              }`}
            />
          </div>

          {/* Username & Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-700' : 'text-white/80'}`}>
                {t('webdavUser', settings.language)}
              </label>
              <input
                type="text"
                value={config.username}
                onChange={(e) => handleChange({ username: e.target.value })}
                placeholder={t('webdavUserPlaceholder', settings.language)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none duration-0 ${
                  isLight
                    ? 'bg-black/5 border-black/10 focus:border-black/30 focus:ring-2 focus:ring-black/10 text-slate-900 placeholder-slate-400'
                    : 'bg-white/10 border-white/15 focus:border-white/30 focus:ring-2 focus:ring-white/20 text-white placeholder-white/40'
                }`}
              />
            </div>
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-700' : 'text-white/80'}`}>
                {t('webdavPass', settings.language)}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={config.password || ''}
                  onChange={(e) => handleChange({ password: e.target.value })}
                  placeholder={t('webdavPassPlaceholder', settings.language)}
                  className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl border text-xs outline-none duration-0 ${
                    isLight
                      ? 'bg-black/5 border-black/10 focus:border-black/30 focus:ring-2 focus:ring-black/10 text-slate-900 placeholder-slate-400'
                      : 'bg-white/10 border-white/15 focus:border-white/30 focus:ring-2 focus:ring-white/20 text-white placeholder-white/40'
                  }`}
                />
                {config.password && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg duration-0 cursor-pointer ${
                      isLight ? 'text-slate-400 hover:text-slate-800 hover:bg-black/5' : 'text-white/40 hover:text-white hover:bg-white/10'
                    }`}
                    title={showPassword ? '隐藏' : '显示'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
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
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none duration-0 ${
                isLight
                  ? 'bg-black/5 border-black/10 focus:border-black/30 focus:ring-2 focus:ring-black/10 text-slate-900'
                  : 'bg-white/10 border-white/15 focus:border-white/30 focus:ring-2 focus:ring-white/20 text-white'
              }`}
            />
          </div>

          {/* Conflict Strategy */}
          <div>
            <label className={`block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-700' : 'text-white/80'}`}>
              {t('webdavConflict', settings.language)}
            </label>
            <CustomSelect
              value={config.conflictStrategy}
              onChange={(val) => handleChange({ conflictStrategy: val as WebdavConfig['conflictStrategy'] })}
              isLight={isLight}
              options={[
                { value: 'merge', label: t('strategyMerge', settings.language) },
                { value: 'local', label: t('strategyLocal', settings.language) },
                { value: 'remote', label: t('strategyRemote', settings.language) },
              ]}
            />
          </div>

          {/* Auto Sync Switch */}
          <div className="flex items-center justify-between py-1">
            <span className={`text-xs font-medium ${isLight ? 'text-slate-700' : 'text-white/80'}`}>
              {t('webdavAutoSync', settings.language)}
            </span>
            <ToggleSwitch
              checked={config.autoSync}
              onChange={(checked) => handleChange({ autoSync: checked })}
              isLight={isLight}
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleUpload}
                disabled={isUploading || isPulling || !config.url}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium duration-0 cursor-pointer disabled:opacity-40 active:scale-95 ${
                  isLight
                    ? 'bg-slate-900 hover:bg-black text-white shadow-sm'
                    : 'bg-white hover:bg-slate-100 text-slate-950 font-semibold shadow-sm'
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
                disabled={isUploading || isPulling || !config.url}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-medium duration-0 cursor-pointer disabled:opacity-40 active:scale-95 ${
                  isLight
                    ? 'bg-black/5 hover:bg-black/10 border-black/10 text-slate-800'
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
              className={`w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-medium duration-0 cursor-pointer disabled:opacity-40 active:scale-95 ${
                isLight
                  ? 'bg-black/[0.03] hover:bg-black/[0.08] border-black/8 text-slate-700'
                  : 'bg-white/[0.05] hover:bg-white/10 border-white/10 text-white/80'
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
