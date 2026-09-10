import React, { useState } from 'react';
import { Cloud, CheckCircle, AlertCircle, RefreshCw, Radio, Lock, UploadCloud, DownloadCloud, Eye, EyeOff } from 'lucide-react';
import { AppState, WebdavConfig } from '../../types';
import { uploadToWebdav, restoreFromWebdav, WebdavClient } from '../../services/webdav';
import { ConfirmModal } from './ConfirmModal';
import { CustomSelect } from './CustomSelect';
import { ToggleSwitch } from './ToggleSwitch';
import { t } from '../../utils/i18n';
import { isLightMode } from '../../utils/constants';

interface WebdavSettingsProps {
  appState: AppState;
  onUpdateWebdav: (config: WebdavConfig) => void;
  onUpdateSyncSettings?: (policy: import('../../types').ProfileSyncSettings) => void;
  onStateReload: () => void;
  isLight?: boolean;
}

export const WebdavSettings: React.FC<WebdavSettingsProps> = ({
  appState,
  onUpdateWebdav,
  onUpdateSyncSettings,
  onStateReload,
  isLight: isLightProp,
}) => {
  const { webdav, settings } = appState;
  const isLight = isLightProp !== undefined ? isLightProp : isLightMode(settings.mode);

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
      const client = new WebdavClient(config, settings.language);
      const res = await client.testConnection(settings.language);
      setTestResult(res);
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || t('webdavConnectionFailed', settings.language) });
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
        className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl border duration-0 ${
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
              className="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs"
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
                className="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs"
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
                  className="glass-input w-full pl-3.5 pr-10 py-2.5 rounded-xl text-xs"
                />
                {config.password && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg duration-0 cursor-pointer ${
                      isLight ? 'text-slate-400 hover:text-slate-800 hover:bg-black/5' : 'text-white/40 hover:text-white hover:bg-white/10'
                    }`}
                    title={showPassword ? t('hide', settings.language) : t('show', settings.language)}
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
              className="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs"
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

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleUpload}
                disabled={isUploading || isPulling || !config.url}
                className="glass-btn-primary flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs disabled:opacity-40 disabled:pointer-events-none active:scale-95"
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
                className="glass-btn-secondary flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs disabled:opacity-40 disabled:pointer-events-none active:scale-95"
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
              className="glass-btn-secondary w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs disabled:opacity-40 disabled:pointer-events-none active:scale-95"
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
