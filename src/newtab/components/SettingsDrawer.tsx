import React, { useState } from 'react';
import {
  X,
  Palette,
  Sliders,
  Cloud,
  Download,
  Upload,
  Globe,
  Sun,
  Moon,
  Check,
  FileJson,
  GitBranch,
  RefreshCw
} from 'lucide-react';
import { AppState, BackgroundType, GitSyncConfig, ThemeSettings, WebdavConfig } from '../../types';
import { PRESET_GRADIENTS } from '../../utils/constants';
import { WebdavSettings } from './WebdavSettings';
import { GitSettings } from './GitSettings';
import { exportAllData, importData } from '../../services/storage';
import { t, supportedLocales } from '../../utils/i18n';

interface SettingsDrawerProps {
  isOpen: boolean;
  appState: AppState;
  onClose: () => void;
  onUpdateSettings: (settings: ThemeSettings) => void;
  onUpdateWebdav: (config: WebdavConfig) => void;
  onUpdateGit: (config: GitSyncConfig) => void;
  onStateReload: () => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  isOpen,
  appState,
  onClose,
  onUpdateSettings,
  onUpdateWebdav,
  onUpdateGit,
  onStateReload,
}) => {
  const { settings } = appState;
  const [activeTab, setActiveTab] = useState<'appearance' | 'behavior' | 'sync' | 'backup'>('appearance');
  const [syncProvider, setSyncProvider] = useState<'webdav' | 'git'>('webdav');
  const [importStatus, setImportStatus] = useState<string>('');

  if (!isOpen) return null;

  const handleSettingsChange = (fields: Partial<ThemeSettings>) => {
    onUpdateSettings({ ...settings, ...fields });
  };

  const handleExport = async () => {
    const json = await exportAllData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mytab-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result === 'string') {
        const res = await importData(reader.result);
        if (res.success) {
          setImportStatus(t('importSuccess', settings.language));
          onStateReload();
        } else {
          setImportStatus(`${t('importFailed', settings.language)}: ${res.error}`);
        }
      }
    };
    reader.readAsText(file);
  };

  const isLight = settings.mode === 'light';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div
          className={`w-screen max-w-md shadow-2xl flex flex-col transition-colors duration-200 ${
            isLight
              ? 'border-l border-black/10 text-slate-900'
              : 'border-l border-white/15 text-white'
          }`}
          style={{
            background: isLight ? 'rgba(255, 255, 255, 0.90)' : 'rgba(15, 15, 25, 0.75)',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
          }}
        >
          {/* Header */}
          <div
            className={`flex items-center justify-between px-6 py-5 border-b ${
              isLight ? 'border-black/10' : 'border-white/10'
            }`}
          >
            <h2 className="text-lg font-semibold tracking-wide flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-500" />
              <span>{t('settingsTitle', settings.language)}</span>
            </h2>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-full transition-colors ${
                isLight
                  ? 'text-slate-500 hover:text-slate-900 hover:bg-black/5'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs (外观, 偏好, 同步, 备份与迁移) */}
          <div
            className={`flex px-6 pt-3 border-b gap-5 overflow-x-auto text-xs font-medium scrollbar-none ${
              isLight ? 'border-black/10' : 'border-white/10'
            }`}
          >
            <button
              onClick={() => setActiveTab('appearance')}
              className={`pb-2.5 flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'appearance'
                  ? 'border-indigo-500 text-indigo-500 font-semibold'
                  : isLight
                  ? 'border-transparent text-slate-500 hover:text-slate-900'
                  : 'border-transparent text-white/60 hover:text-white'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>{t('appearance', settings.language)}</span>
            </button>
            <button
              onClick={() => setActiveTab('behavior')}
              className={`pb-2.5 flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'behavior'
                  ? 'border-indigo-500 text-indigo-500 font-semibold'
                  : isLight
                  ? 'border-transparent text-slate-500 hover:text-slate-900'
                  : 'border-transparent text-white/60 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{t('behavior', settings.language)}</span>
            </button>
            <button
              onClick={() => setActiveTab('sync')}
              className={`pb-2.5 flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'sync'
                  ? 'border-indigo-500 text-indigo-500 font-semibold'
                  : isLight
                  ? 'border-transparent text-slate-500 hover:text-slate-900'
                  : 'border-transparent text-white/60 hover:text-white'
              }`}
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>{t('sync', settings.language)}</span>
            </button>
            <button
              onClick={() => setActiveTab('backup')}
              className={`pb-2.5 flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'backup'
                  ? 'border-indigo-500 text-indigo-500 font-semibold'
                  : isLight
                  ? 'border-transparent text-slate-500 hover:text-slate-900'
                  : 'border-transparent text-white/60 hover:text-white'
              }`}
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>{t('dataBackup', settings.language)}</span>
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* 1. 外观 Tab */}
            {activeTab === 'appearance' && (
              <div className="space-y-5">
                {/* Theme Mode */}
                <div>
                  <label
                    className={`block text-xs font-medium mb-2 ${
                      isLight ? 'text-slate-800' : 'text-white/80'
                    }`}
                  >
                    {t('themeMode', settings.language)}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleSettingsChange({ mode: 'dark' })}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                        settings.mode === 'dark'
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20 font-semibold'
                          : isLight
                          ? 'bg-black/5 border-black/10 text-slate-700 hover:bg-black/10'
                          : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <Moon className="w-4 h-4" />
                      <span>{t('themeDark', settings.language)}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSettingsChange({ mode: 'light' })}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                        settings.mode === 'light'
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20 font-semibold'
                          : isLight
                          ? 'bg-black/5 border-black/10 text-slate-700 hover:bg-black/10'
                          : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <Sun className="w-4 h-4" />
                      <span>{t('themeLight', settings.language)}</span>
                    </button>
                  </div>
                </div>

                {/* Wallpaper Source */}
                <div>
                  <label
                    className={`block text-xs font-medium mb-2 ${
                      isLight ? 'text-slate-800' : 'text-white/80'
                    }`}
                  >
                    {t('background', settings.language)}
                  </label>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {[
                      { id: 'gradient', label: t('bgGradient', settings.language) },
                      { id: 'bing', label: t('bgBing', settings.language) },
                      { id: 'unsplash', label: t('bgUnsplash', settings.language) },
                      { id: 'custom', label: t('bgCustom', settings.language) },
                    ].map((bg) => (
                      <button
                        key={bg.id}
                        type="button"
                        onClick={() =>
                          handleSettingsChange({
                            backgroundType: bg.id as BackgroundType,
                            backgroundValue:
                              bg.id === 'bing'
                                ? 'https://bing.biturl.top/?resolution=1920&format=image&index=0&mkt=zh-CN'
                                : bg.id === 'unsplash'
                                ? 'https://images.unsplash.com/photo-1507525428033-b723cf961d3e?auto=format&fit=crop&w=1920&q=80'
                                : bg.id === 'custom'
                                ? settings.backgroundValue.startsWith('http') || settings.backgroundValue.startsWith('data:') || settings.backgroundValue.includes('wallpaper')
                                  ? settings.backgroundValue
                                  : './wallpapers/default-wallpaper.jpg'
                                : PRESET_GRADIENTS[0].value,
                          })
                        }
                        className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                          settings.backgroundType === bg.id
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20 font-semibold'
                            : isLight
                            ? 'bg-black/5 border-black/10 text-slate-700 hover:bg-black/10'
                            : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                        }`}
                      >
                        {bg.label}
                      </button>
                    ))}
                  </div>

                  {/* Gradient Presets Selector */}
                  {settings.backgroundType === 'gradient' && (
                    <div className="grid grid-cols-2 gap-2">
                      {PRESET_GRADIENTS.map((p, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleSettingsChange({ backgroundValue: p.value })}
                          style={{ background: p.value }}
                          className={`h-16 rounded-xl border cursor-pointer relative flex items-end p-2 transition-transform hover:scale-[1.02] ${
                            settings.backgroundValue === p.value
                              ? 'border-indigo-500 ring-2 ring-indigo-400/50'
                              : isLight
                              ? 'border-black/15 shadow-sm'
                              : 'border-white/20'
                          }`}
                        >
                          <span className="text-[10px] font-medium text-white/90 drop-shadow">
                            {p.name}
                          </span>
                          {settings.backgroundValue === p.value && (
                            <Check className="w-3.5 h-3.5 text-white absolute top-1.5 right-1.5" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Custom Wallpaper URL / Local File Upload */}
                  {settings.backgroundType === 'custom' && (
                    <div className="mt-2 space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={settings.backgroundValue}
                          onChange={(e) => handleSettingsChange({ backgroundValue: e.target.value })}
                          placeholder={t('bgCustomPlaceholder', settings.language)}
                          className={`flex-1 px-3 py-2 rounded-xl border outline-none text-xs ${
                            isLight
                              ? 'bg-black/5 border-black/15 text-slate-900 placeholder-slate-400 focus:border-indigo-500'
                              : 'bg-white/10 border-white/15 text-white placeholder-white/40 focus:border-indigo-500'
                          }`}
                        />
                        <label
                          className={`px-3 py-2 rounded-xl border cursor-pointer transition-colors flex items-center gap-1.5 text-xs shrink-0 ${
                            isLight
                              ? 'bg-black/5 hover:bg-black/10 border-black/15 text-slate-700 hover:text-slate-900'
                              : 'bg-white/10 hover:bg-white/20 border-white/15 text-white/80 hover:text-white'
                          }`}
                          title={t('bgLocal', settings.language)}
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{t('bgLocal', settings.language)}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = () => {
                                if (typeof reader.result === 'string') {
                                  handleSettingsChange({ backgroundValue: reader.result });
                                }
                              };
                              reader.readAsDataURL(file);
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSettingsChange({ backgroundValue: './wallpapers/default-wallpaper.jpg' })}
                        className="text-[11px] text-indigo-500 hover:text-indigo-600 underline cursor-pointer"
                      >
                        {t('resetDefaultWallpaper', settings.language)}
                      </button>
                    </div>
                  )}
                </div>

                {/* Card Size Slider */}
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className={isLight ? 'text-slate-700' : 'text-white/80'}>{t('cardSizeTitle', settings.language)}</span>
                    <span className="text-indigo-500 font-semibold">{settings.cardSize || 110}px</span>
                  </div>
                  <input
                    type="range"
                    min="80"
                    max="160"
                    step="5"
                    value={settings.cardSize || 110}
                    onChange={(e) => handleSettingsChange({ cardSize: parseInt(e.target.value, 10) })}
                    className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-indigo-500 ${
                      isLight ? 'bg-slate-200' : 'bg-white/20'
                    }`}
                  />
                  <div className={`flex justify-between text-[10px] mt-1 ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
                    <span>{t('cardSizeCompact', settings.language)}</span>
                    <span>{t('cardSizeDefault', settings.language)}</span>
                    <span>{t('cardSizeLarge', settings.language)}</span>
                  </div>
                </div>

                {/* Card Opacity Slider */}
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className={isLight ? 'text-slate-700' : 'text-white/80'}>{t('cardOpacityTitle', settings.language)}</span>
                    <span className="text-indigo-500 font-semibold">{Math.round(settings.cardOpacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="0.9"
                    step="0.05"
                    value={settings.cardOpacity}
                    onChange={(e) => handleSettingsChange({ cardOpacity: parseFloat(e.target.value) })}
                    className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-indigo-500 ${
                      isLight ? 'bg-slate-200' : 'bg-white/20'
                    }`}
                  />
                  <div className={`flex justify-between text-[10px] mt-1 ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
                    <span>{t('cardOpacityLow', settings.language)}</span>
                    <span>{t('cardOpacityMed', settings.language)}</span>
                    <span>{t('cardOpacityHigh', settings.language)}</span>
                  </div>
                </div>

                {/* Card Blur Slider */}
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className={isLight ? 'text-slate-700' : 'text-white/80'}>{t('cardBlur', settings.language)}</span>
                    <span className="text-indigo-500 font-semibold">{settings.cardBlur}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="32"
                    step="2"
                    value={settings.cardBlur}
                    onChange={(e) => handleSettingsChange({ cardBlur: parseInt(e.target.value, 10) })}
                    className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-indigo-500 ${
                      isLight ? 'bg-slate-200' : 'bg-white/20'
                    }`}
                  />
                </div>

                {/* Card Icon Ratio Slider */}
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className={isLight ? 'text-slate-700' : 'text-white/80'}>{t('iconSizeRatio', settings.language)}</span>
                    <span className="text-indigo-500 font-semibold">{Math.round((settings.iconSizeRatio || 0.42) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.28"
                    max="0.65"
                    step="0.01"
                    value={settings.iconSizeRatio || 0.42}
                    onChange={(e) => handleSettingsChange({ iconSizeRatio: parseFloat(e.target.value) })}
                    className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-indigo-500 ${
                      isLight ? 'bg-slate-200' : 'bg-white/20'
                    }`}
                  />
                  <div className={`flex justify-between text-[10px] mt-1 ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
                    <span>{t('iconRatioLow', settings.language)}</span>
                    <span>{t('iconRatioMed', settings.language)}</span>
                    <span>{t('iconRatioHigh', settings.language)}</span>
                  </div>
                </div>

                {/* Max Cards Per Row Slider */}
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className={isLight ? 'text-slate-700' : 'text-white/80'}>{t('maxCardsPerRow', settings.language)}</span>
                    <span className="text-indigo-500 font-semibold">{settings.maxCardsPerRow || 8}</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="12"
                    step="1"
                    value={settings.maxCardsPerRow || 8}
                    onChange={(e) => handleSettingsChange({ maxCardsPerRow: parseInt(e.target.value, 10) })}
                    className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-indigo-500 ${
                      isLight ? 'bg-slate-200' : 'bg-white/20'
                    }`}
                  />
                  <div className={`flex justify-between text-[10px] mt-1 ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
                    <span>{t('cardsPerRowCompact', settings.language)}</span>
                    <span>{t('cardsPerRowDefault', settings.language)}</span>
                    <span>{t('cardsPerRowWide', settings.language)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 2. 偏好 Tab */}
            {activeTab === 'behavior' && (
              <div className="space-y-4">
                {/* Language */}
                <div
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-colors ${
                    isLight
                      ? 'bg-black/5 border-black/10 text-slate-900'
                      : 'bg-white/5 border-white/10 text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Globe className="w-4 h-4 text-indigo-500" />
                    <span className="text-xs font-medium">{t('language', settings.language)}</span>
                  </div>
                  <select
                    value={settings.language}
                    onChange={(e) => handleSettingsChange({ language: e.target.value as any })}
                    className={`px-3 py-1.5 rounded-xl border text-xs outline-none cursor-pointer ${
                      isLight
                        ? 'bg-white border-black/10 text-slate-800 shadow-sm'
                        : 'bg-white/10 border-white/15 text-white'
                    }`}
                  >
                    {supportedLocales.map((loc) => (
                      <option key={loc.code} value={loc.code} className={isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'}>
                        {loc.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Open in New Tab */}
                <div
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-colors ${
                    isLight
                      ? 'bg-black/5 border-black/10 text-slate-900'
                      : 'bg-white/5 border-white/10 text-white'
                  }`}
                >
                  <span className="text-xs font-medium">{t('openInNewTab', settings.language)}</span>
                  <input
                    type="checkbox"
                    checked={settings.openInNewTab}
                    onChange={(e) => handleSettingsChange({ openInNewTab: e.target.checked })}
                    className="w-4 h-4 rounded bg-transparent border-gray-400 text-indigo-600 focus:ring-0 cursor-pointer"
                  />
                </div>

                {/* Show Clock & Greeting */}
                <div
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-colors ${
                    isLight
                      ? 'bg-black/5 border-black/10 text-slate-900'
                      : 'bg-white/5 border-white/10 text-white'
                  }`}
                >
                  <span className="text-xs font-medium">{t('showClock', settings.language)}</span>
                  <input
                    type="checkbox"
                    checked={settings.showClock}
                    onChange={(e) => handleSettingsChange({ showClock: e.target.checked })}
                    className="w-4 h-4 rounded bg-transparent border-gray-400 text-indigo-600 focus:ring-0 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* 3. 同步 Tab (整合 WebDAV 与 Git 仓库) */}
            {activeTab === 'sync' && (
              <div className="space-y-4">
                {/* Sub-selector for Sync Method */}
                <div
                  className={`flex p-1 rounded-2xl border gap-1 ${
                    isLight ? 'bg-black/5 border-black/10' : 'bg-white/10 border-white/15'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setSyncProvider('webdav')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium transition-all ${
                      syncProvider === 'webdav'
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                        : isLight
                        ? 'text-slate-600 hover:text-slate-900 hover:bg-black/5'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Cloud className="w-3.5 h-3.5" />
                    <span>{t('webdavSync', settings.language)}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSyncProvider('git')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium transition-all ${
                      syncProvider === 'git'
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                        : isLight
                        ? 'text-slate-600 hover:text-slate-900 hover:bg-black/5'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <GitBranch className="w-3.5 h-3.5" />
                    <span>{t('gitBackup', settings.language)}</span>
                  </button>
                </div>

                {/* Sync Provider Content */}
                {syncProvider === 'webdav' ? (
                  <WebdavSettings
                    appState={appState}
                    onUpdateWebdav={onUpdateWebdav}
                    onStateReload={onStateReload}
                  />
                ) : (
                  <GitSettings
                    appState={appState}
                    onUpdateGit={onUpdateGit}
                    onStateReload={onStateReload}
                  />
                )}
              </div>
            )}

            {/* 4. 备份与迁移 Tab */}
            {activeTab === 'backup' && (
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-2xl border space-y-3 ${
                    isLight
                      ? 'bg-black/5 border-black/10 text-slate-700'
                      : 'bg-white/5 border-white/10 text-white/70'
                  }`}
                >
                  <div className="text-xs leading-relaxed">
                    {t('backupDescription', settings.language)}
                  </div>

                  <div className="flex flex-col gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={handleExport}
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-medium text-white transition-colors cursor-pointer shadow-md shadow-indigo-600/30"
                    >
                      <Download className="w-4 h-4" />
                      <span>{t('exportData', settings.language)}</span>
                    </button>

                    <label
                      className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                        isLight
                          ? 'bg-white hover:bg-slate-50 border-black/10 text-slate-800 shadow-sm'
                          : 'bg-white/10 hover:bg-white/20 border-white/15 text-white'
                      }`}
                    >
                      <Upload className="w-4 h-4" />
                      <span>{t('importData', settings.language)}</span>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportFile}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {importStatus && (
                    <div
                      className={`p-2.5 rounded-xl text-xs text-center ${
                        isLight
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'bg-indigo-500/20 text-indigo-300'
                      }`}
                    >
                      {importStatus}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
