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
import { t } from '../../utils/i18n';

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
          className="w-screen max-w-md border-l border-white/15 shadow-2xl text-white flex flex-col"
          style={{
            background: 'rgba(15, 15, 25, 0.72)',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
            <h2 className="text-lg font-semibold tracking-wide flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-400" />
              <span>{t('settingsTitle', settings.language)}</span>
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs (外观, 偏好, 同步, 备份与迁移) */}
          <div className="flex px-6 pt-3 border-b border-white/10 gap-5 overflow-x-auto text-xs font-medium scrollbar-none">
            <button
              onClick={() => setActiveTab('appearance')}
              className={`pb-2.5 flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'appearance'
                  ? 'border-indigo-500 text-indigo-400 font-semibold'
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
                  ? 'border-indigo-500 text-indigo-400 font-semibold'
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
                  ? 'border-indigo-500 text-indigo-400 font-semibold'
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
                  ? 'border-indigo-500 text-indigo-400 font-semibold'
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
                  <label className="block text-xs font-medium text-white/80 mb-2">
                    {t('themeMode', settings.language)}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleSettingsChange({ mode: 'dark' })}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                        settings.mode === 'dark'
                          ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
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
                          ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
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
                  <label className="block text-xs font-medium text-white/80 mb-2">
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
                                ? 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80'
                                : bg.id === 'custom'
                                ? settings.backgroundValue.startsWith('http') || settings.backgroundValue.startsWith('data:') || settings.backgroundValue.includes('wallpaper')
                                  ? settings.backgroundValue
                                  : './wallpapers/default-wallpaper.jpg'
                                : PRESET_GRADIENTS[0].value,
                          })
                        }
                        className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                          settings.backgroundType === bg.id
                            ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
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
                              ? 'border-indigo-400 ring-2 ring-indigo-400/50'
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
                          className="flex-1 px-3 py-2 rounded-xl bg-white/10 border border-white/15 focus:border-indigo-500 outline-none text-xs text-white placeholder-white/40"
                        />
                        <label
                          className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white/80 hover:text-white cursor-pointer transition-colors flex items-center gap-1.5 text-xs shrink-0"
                          title="上传本地壁纸图片"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>本地壁纸</span>
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
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
                      >
                        恢复默认落日海滩壁纸
                      </button>
                    </div>
                  )}
                </div>

                {/* Card Size Slider */}
                <div>
                  <div className="flex justify-between text-xs font-medium text-white/80 mb-1.5">
                    <span>卡片大小 (Card Size)</span>
                    <span className="text-indigo-400">{settings.cardSize || 110}px</span>
                  </div>
                  <input
                    type="range"
                    min="80"
                    max="160"
                    step="5"
                    value={settings.cardSize || 110}
                    onChange={(e) => handleSettingsChange({ cardSize: parseInt(e.target.value, 10) })}
                    className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <div className="flex justify-between text-[10px] text-white/40 mt-1">
                    <span>紧凑 (80px)</span>
                    <span>默认 (110px)</span>
                    <span>大卡片 (160px)</span>
                  </div>
                </div>

                {/* Card Opacity Slider */}
                <div>
                  <div className="flex justify-between text-xs font-medium text-white/80 mb-1.5">
                    <span>卡片不透明度 (Opacity)</span>
                    <span className="text-indigo-400">{Math.round(settings.cardOpacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="0.9"
                    step="0.05"
                    value={settings.cardOpacity}
                    onChange={(e) => handleSettingsChange({ cardOpacity: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <div className="flex justify-between text-[10px] text-white/40 mt-1">
                    <span>极简透光 (5%)</span>
                    <span>半透毛玻璃 (30%)</span>
                    <span>实色浓郁 (90%)</span>
                  </div>
                </div>

                {/* Card Blur Slider */}
                <div>
                  <div className="flex justify-between text-xs font-medium text-white/80 mb-1.5">
                    <span>{t('cardBlur', settings.language)}</span>
                    <span className="text-indigo-400">{settings.cardBlur}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="32"
                    step="2"
                    value={settings.cardBlur}
                    onChange={(e) => handleSettingsChange({ cardBlur: parseInt(e.target.value, 10) })}
                    className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>

                {/* Card Icon Ratio Slider */}
                <div>
                  <div className="flex justify-between text-xs font-medium text-white/80 mb-1.5">
                    <span>{t('iconSizeRatio', settings.language)}</span>
                    <span className="text-indigo-400">{Math.round((settings.iconSizeRatio || 0.42) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.28"
                    max="0.65"
                    step="0.01"
                    value={settings.iconSizeRatio || 0.42}
                    onChange={(e) => handleSettingsChange({ iconSizeRatio: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <div className="flex justify-between text-[10px] text-white/40 mt-1">
                    <span>精致留白 (28%)</span>
                    <span>默认 (42%)</span>
                    <span>饱满大图 (65%)</span>
                  </div>
                </div>

                {/* Max Cards Per Row Slider */}
                <div>
                  <div className="flex justify-between text-xs font-medium text-white/80 mb-1.5">
                    <span>{t('maxCardsPerRow', settings.language)}</span>
                    <span className="text-indigo-400">{settings.maxCardsPerRow || 8} 个/行</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="12"
                    step="1"
                    value={settings.maxCardsPerRow || 8}
                    onChange={(e) => handleSettingsChange({ maxCardsPerRow: parseInt(e.target.value, 10) })}
                    className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <div className="flex justify-between text-[10px] text-white/40 mt-1">
                    <span>4 个 (紧凑)</span>
                    <span>8 个 (默认)</span>
                    <span>12 个 (宽屏)</span>
                  </div>
                </div>
              </div>
            )}

            {/* 2. 偏好 Tab */}
            {activeTab === 'behavior' && (
              <div className="space-y-4">
                {/* Language */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2.5">
                    <Globe className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-medium">语言 / Language</span>
                  </div>
                  <select
                    value={settings.language}
                    onChange={(e) => handleSettingsChange({ language: e.target.value as any })}
                    className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-xs text-white outline-none cursor-pointer"
                  >
                    <option value="zh-CN" className="bg-slate-900 text-white">简体中文</option>
                    <option value="en" className="bg-slate-900 text-white">English</option>
                  </select>
                </div>

                {/* Open in New Tab */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-xs font-medium">{t('openInNewTab', settings.language)}</span>
                  <input
                    type="checkbox"
                    checked={settings.openInNewTab}
                    onChange={(e) => handleSettingsChange({ openInNewTab: e.target.checked })}
                    className="rounded bg-white/10 border-white/20 text-indigo-600 focus:ring-0 cursor-pointer"
                  />
                </div>

                {/* Show Clock & Greeting */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-xs font-medium">{t('showClock', settings.language)}</span>
                  <input
                    type="checkbox"
                    checked={settings.showClock}
                    onChange={(e) => handleSettingsChange({ showClock: e.target.checked })}
                    className="rounded bg-white/10 border-white/20 text-indigo-600 focus:ring-0 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* 3. 同步 Tab (整合 WebDAV 与 Git 仓库) */}
            {activeTab === 'sync' && (
              <div className="space-y-4">
                {/* Sub-selector for Sync Method */}
                <div className="flex p-1 rounded-2xl bg-white/10 border border-white/15 gap-1">
                  <button
                    type="button"
                    onClick={() => setSyncProvider('webdav')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium transition-all ${
                      syncProvider === 'webdav'
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Cloud className="w-3.5 h-3.5" />
                    <span>WebDAV 同步</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSyncProvider('git')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium transition-all ${
                      syncProvider === 'git'
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <GitBranch className="w-3.5 h-3.5" />
                    <span>Git 仓库备份</span>
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
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <div className="text-xs text-white/70 leading-relaxed">
                    随时导出所有快捷网址、分类和个性化设置配置为本地 JSON 文件，或在其他设备上一键导入恢复。
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

                    <label className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors cursor-pointer border border-white/15">
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
                    <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 text-xs text-center">
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
