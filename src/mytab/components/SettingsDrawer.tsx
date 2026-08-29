import React, { useState, useEffect } from 'react';
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
  RefreshCw,
  MessageSquareQuote,
  Clock,
  Calendar,
  Sparkles,
  RotateCcw,
  FileDown,
  ExternalLink,
  ChevronDown,
  Search
} from 'lucide-react';
import { AppState, BackgroundType, CustomGreetings, GitSyncConfig, ThemeSettings, WebdavConfig } from '../../types';
import { PRESET_GRADIENTS } from '../../utils/constants';
import { WebdavSettings } from './WebdavSettings';
import { GitSettings } from './GitSettings';
import { exportAllData, importData } from '../../services/storage';
import { t, supportedLocales } from '../../utils/i18n';
import { CustomSelect } from './CustomSelect';
import { UNSPLASH_CATEGORIES } from '../../utils/unsplashTopics';
import { UnsplashTopicModal } from './UnsplashTopicModal';
import { fetchUnsplashRandomPhoto, preloadImage } from '../../services/unsplash';

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
  const [greetingStatus, setGreetingStatus] = useState<{ success?: boolean; text: string } | null>(null);
  const [isCardLayoutExpanded, setIsCardLayoutExpanded] = useState(false);
  const [isUnsplashTopicModalOpen, setIsUnsplashTopicModalOpen] = useState(false);
  const [isFetchingUnsplash, setIsFetchingUnsplash] = useState(false);
  const [unsplashError, setUnsplashError] = useState<string | null>(null);

  // Reset transient UI states every time the drawer is opened
  useEffect(() => {
    if (isOpen) {
      setImportStatus('');
      setGreetingStatus(null);
      setUnsplashError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSettingsChange = (fields: Partial<ThemeSettings>) => {
    onUpdateSettings({ ...settings, ...fields });
  };

  const handleRefreshUnsplash = async (customFields?: Partial<ThemeSettings>) => {
    setIsFetchingUnsplash(true);
    setUnsplashError(null);
    try {
      const mergedSettings = { ...settings, ...(customFields || {}) };
      const res = await fetchUnsplashRandomPhoto(mergedSettings);
      if (res.error) {
        setUnsplashError(res.error);
      }
      // Preload image so button spinner continues until image is loaded in browser (max 2.5s)
      if (res.url) {
        await preloadImage(res.url, 2500);
      }
      handleSettingsChange({
        ...(customFields || {}),
        backgroundType: 'unsplash',
        backgroundValue: res.url,
        unsplashLastUrl: res.url,
        unsplashAuthorName: res.authorName,
        unsplashAuthorUrl: res.authorUrl,
      });
    } catch (err: any) {
      setUnsplashError(err?.message || 'Failed to fetch image');
    } finally {
      setIsFetchingUnsplash(false);
    }
  };

  const handleImportGreetingsFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        if (typeof reader.result !== 'string') return;
        const parsed = JSON.parse(reader.result);
        if (typeof parsed !== 'object' || parsed === null) {
          throw new Error('Invalid JSON structure');
        }

        const cleaned: CustomGreetings = {};
        const keys: (keyof CustomGreetings)[] = ['morning', 'noon', 'afternoon', 'evening', 'night'];
        let hasValidField = false;

        for (const k of keys) {
          if (Array.isArray(parsed[k])) {
            const arr = parsed[k].filter((item: any) => typeof item === 'string' && item.trim().length > 0);
            if (arr.length > 0) {
              cleaned[k] = arr;
              hasValidField = true;
            }
          }
        }

        if (!hasValidField) {
          throw new Error('No valid greetings arrays');
        }

        handleSettingsChange({ customGreetings: cleaned });
        setGreetingStatus({ success: true, text: t('importGreetingsSuccess', settings.language) });
      } catch {
        setGreetingStatus({ success: false, text: t('importGreetingsFailed', settings.language) });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDownloadGreetingTemplate = () => {
    const template = {
      morning: [
        "早上好！",
        "早安，新的一天开始了。",
        "清晨的阳光照亮你的心情，早安！",
        "起床啦，世界在等你！",
        "早安，愿你今天充满活力。",
        "早，喝杯咖啡开始奋斗吧。"
      ],
      noon: [
        "中午好，该吃午饭啦！",
        "午安，休息一下再继续。",
        "正午时分，注意防暑哦。",
        "中午啦，别忘了补充能量。",
        "午安，愿你下午精力充沛。",
        "吃了吗？中午好！"
      ],
      afternoon: [
        "下午好，继续加油！",
        "午后时光，保持专注。",
        "下午好，来杯茶提提神吧。",
        "午后阳光正好，心情也要好。",
        "下午了，离下班不远啦，加油！",
        "下午好，愿你一切顺利。"
      ],
      evening: [
        "晚上好，一天辛苦了。",
        "傍晚时分，放松心情。",
        "晚上好，和家人共度美好时光吧。",
        "夜幕降临，愿你有个温馨的夜晚。",
        "晚上好，晚餐吃了吗？",
        "华灯初上，晚上好！"
      ],
      night: [
        "晚安，好梦。",
        "夜深了，早点休息。",
        "晚安，愿你今夜安眠。",
        "夜晚宁静，好好休息。",
        "晚安，别熬夜哦。",
        "月亮伴你入眠，晚安。"
      ]
    };

    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'greetings-example.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetGreetings = () => {
    handleSettingsChange({ customGreetings: undefined });
    setGreetingStatus(null);
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
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pointer-events-none">
        <div
          className={`glass-drawer w-screen max-w-md shadow-2xl flex flex-col pointer-events-auto transition-all duration-200 ${
            isLight
              ? 'border-l border-black/10 text-slate-900'
              : 'border-l border-white/10 text-white'
          }`}
        >
          {/* Header */}
          <div
            className={`flex items-center justify-between px-6 py-4.5 border-b ${
              isLight ? 'border-black/8' : 'border-white/10'
            }`}
          >
            <h2 className="text-base font-semibold tracking-tight flex items-center gap-2">
              <Sliders className="w-4.5 h-4.5 opacity-70" />
              <span>{t('settingsTitle', settings.language)}</span>
            </h2>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                isLight
                  ? 'text-slate-500 hover:text-black hover:bg-black/5'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Navigation Tabs (外观, 偏好, 同步, 备份与迁移) */}
          <div
            className={`flex px-6 pt-2 border-b gap-5 overflow-x-auto text-xs font-medium scrollbar-none ${
              isLight ? 'border-black/8' : 'border-white/10'
            }`}
          >
            <button
              onClick={() => setActiveTab('appearance')}
              className={`pb-2.5 flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'appearance'
                  ? isLight
                    ? 'border-slate-900 text-slate-900 font-semibold'
                    : 'border-white text-white font-semibold'
                  : isLight
                  ? 'border-transparent text-slate-500 hover:text-slate-900'
                  : 'border-transparent text-white/50 hover:text-white'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>{t('appearance', settings.language)}</span>
            </button>
            <button
              onClick={() => setActiveTab('behavior')}
              className={`pb-2.5 flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'behavior'
                  ? isLight
                    ? 'border-slate-900 text-slate-900 font-semibold'
                    : 'border-white text-white font-semibold'
                  : isLight
                  ? 'border-transparent text-slate-500 hover:text-slate-900'
                  : 'border-transparent text-white/50 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{t('behavior', settings.language)}</span>
            </button>
            <button
              onClick={() => setActiveTab('sync')}
              className={`pb-2.5 flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'sync'
                  ? isLight
                    ? 'border-slate-900 text-slate-900 font-semibold'
                    : 'border-white text-white font-semibold'
                  : isLight
                  ? 'border-transparent text-slate-500 hover:text-slate-900'
                  : 'border-transparent text-white/50 hover:text-white'
              }`}
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>{t('sync', settings.language)}</span>
            </button>
            <button
              onClick={() => setActiveTab('backup')}
              className={`pb-2.5 flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'backup'
                  ? isLight
                    ? 'border-slate-900 text-slate-900 font-semibold'
                    : 'border-white text-white font-semibold'
                  : isLight
                  ? 'border-transparent text-slate-500 hover:text-slate-900'
                  : 'border-transparent text-white/50 hover:text-white'
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
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleSettingsChange({ mode: 'dark' })}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer active:scale-95 ${
                        settings.mode === 'dark'
                          ? isLight
                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm font-semibold'
                            : 'bg-white text-slate-950 border-white shadow-sm font-semibold'
                          : isLight
                          ? 'bg-black/[0.03] border-black/8 text-slate-700 hover:bg-black/5'
                          : 'bg-white/[0.05] border-white/10 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <Moon className="w-4 h-4" />
                      <span>{t('themeDark', settings.language)}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSettingsChange({ mode: 'light' })}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer active:scale-95 ${
                        settings.mode === 'light'
                          ? isLight
                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm font-semibold'
                            : 'bg-white text-slate-950 border-white shadow-sm font-semibold'
                          : isLight
                          ? 'bg-black/[0.03] border-black/8 text-slate-700 hover:bg-black/5'
                          : 'bg-white/[0.05] border-white/10 text-white/70 hover:bg-white/10'
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
                        onClick={() => {
                          if (bg.id === 'unsplash') {
                            if (settings.unsplashLastUrl) {
                              handleSettingsChange({
                                backgroundType: 'unsplash',
                                backgroundValue: settings.unsplashLastUrl,
                              });
                            } else {
                              handleRefreshUnsplash();
                            }
                            return;
                          }
                          handleSettingsChange({
                            backgroundType: bg.id as BackgroundType,
                            backgroundValue:
                              bg.id === 'bing'
                                ? 'https://bing.biturl.top/?resolution=1920&format=image&index=0&mkt=zh-CN'
                                : bg.id === 'custom'
                                ? settings.backgroundValue.startsWith('http') || settings.backgroundValue.startsWith('data:') || settings.backgroundValue.includes('wallpaper')
                                  ? settings.backgroundValue
                                  : './wallpapers/default-wallpaper.jpg'
                                : PRESET_GRADIENTS[0].value,
                          });
                        }}
                        className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all cursor-pointer active:scale-95 ${
                          settings.backgroundType === bg.id
                            ? isLight
                              ? 'bg-slate-900 text-white border-slate-900 shadow-sm font-semibold'
                              : 'bg-white text-slate-950 border-white shadow-sm font-semibold'
                            : isLight
                            ? 'bg-black/[0.03] border-black/8 text-slate-700 hover:bg-black/5'
                            : 'bg-white/[0.05] border-white/10 text-white/70 hover:bg-white/10'
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
                              ? 'border-amber-500 ring-2 ring-amber-500/50 shadow-md'
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
                              ? 'bg-black/5 border-black/15 text-slate-900 placeholder-slate-400 focus:border-black/30'
                              : 'bg-white/10 border-white/15 text-white placeholder-white/40 focus:border-white/30'
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
                        className={`text-[11px] underline cursor-pointer ${
                          isLight ? 'text-slate-600 hover:text-black' : 'text-white/60 hover:text-white'
                        }`}
                      >
                        {t('resetDefaultWallpaper', settings.language)}
                      </button>
                    </div>
                  )}

                  {/* Unsplash Custom Configuration Panel */}
                  {settings.backgroundType === 'unsplash' && (
                    <div
                      className={`mt-2 p-3.5 rounded-2xl border space-y-3 animate-fade-in ${
                        isLight ? 'bg-black/[0.02] border-black/10' : 'bg-white/[0.04] border-white/10'
                      }`}
                    >
                      {/* Access Key */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className={`text-xs font-medium ${isLight ? 'text-slate-700' : 'text-white/80'}`}>
                            {t('unsplashAccessKey', settings.language)}
                          </label>
                          <a
                            href="https://unsplash.com/developers"
                            target="_blank"
                            rel="noreferrer"
                            className={`text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors ${
                              isLight ? 'text-slate-600 hover:text-black underline' : 'text-white/60 hover:text-white underline'
                            }`}
                          >
                            <span>{t('unsplashGetAccessKey', settings.language)}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <input
                          type="password"
                          value={settings.unsplashAccessKey || ''}
                          onChange={(e) => handleSettingsChange({ unsplashAccessKey: e.target.value })}
                          placeholder={t('unsplashAccessKeyPlaceholder', settings.language)}
                          className={`w-full px-3.5 py-2.5 rounded-xl border outline-none text-xs transition-all ${
                            isLight
                              ? 'bg-black/5 border-black/10 text-slate-900 placeholder-slate-400 focus:border-black/30'
                              : 'bg-white/10 border-white/10 text-white placeholder-white/40 focus:border-white/30'
                          }`}
                        />
                        <p className={`text-[10px] mt-1.5 ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
                          {t('unsplashAccessKeyTip', settings.language)}
                        </p>
                      </div>

                      {/* Topic Category & Keywords Trigger */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-xs font-medium ${isLight ? 'text-slate-700' : 'text-white/80'}`}>
                            {t('unsplashTopicsBtn', settings.language)}
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsUnsplashTopicModalOpen(true)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer active:scale-95 ${
                              isLight
                                ? 'bg-black/5 hover:bg-black/10 border-black/10 text-slate-700'
                                : 'bg-white/10 hover:bg-white/15 border-white/10 text-white/80'
                            }`}
                          >
                            {t('edit', settings.language)}
                          </button>
                        </div>
                        <div
                          onClick={() => setIsUnsplashTopicModalOpen(true)}
                          className={`p-2.5 rounded-xl border cursor-pointer flex flex-wrap items-center gap-1.5 transition-all ${
                            isLight
                              ? 'bg-black/[0.03] border-black/10 hover:bg-black/[0.06]'
                              : 'bg-white/[0.05] border-white/10 hover:bg-white/[0.08]'
                          }`}
                        >
                          <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                            isLight ? 'bg-slate-900 text-white' : 'bg-white text-slate-950'
                          }`}>
                            {t((UNSPLASH_CATEGORIES.find(c => c.id === (settings.unsplashActiveTab || 'nature'))?.nameKey || 'topicNature') as any, settings.language)}
                          </span>
                          {(settings.unsplashKeywords && settings.unsplashKeywords.length > 0
                            ? settings.unsplashKeywords
                            : ['nature', 'landscape']
                          ).slice(0, 4).map((kw, i) => (
                            <span
                              key={i}
                              className={`px-2 py-0.5 rounded-md text-[11px] border ${
                                isLight
                                  ? 'bg-white/80 border-black/10 text-slate-700'
                                  : 'bg-white/10 border-white/10 text-white/80'
                              }`}
                            >
                              #{kw}
                            </span>
                          ))}
                          {(settings.unsplashKeywords?.length || 0) > 4 && (
                            <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-white/50'}`}>
                              +{(settings.unsplashKeywords?.length || 0) - 4}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons & Status */}
                      <div className="pt-1 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleRefreshUnsplash()}
                          disabled={isFetchingUnsplash}
                          className={`flex-1 py-2.5 px-3 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 ${
                            isLight
                              ? 'bg-slate-900 hover:bg-black text-white font-semibold shadow-sm'
                              : 'bg-white hover:bg-slate-100 text-slate-950 font-semibold shadow-sm'
                          }`}
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isFetchingUnsplash ? 'animate-spin' : ''}`} />
                          <span>{isFetchingUnsplash ? t('unsplashFetching', settings.language) : t('unsplashRefresh', settings.language)}</span>
                        </button>
                      </div>

                      {unsplashError && (
                        <p className="text-[10px] text-amber-500 font-medium">
                          ⚠️ {unsplashError}
                        </p>
                      )}

                      {/* Author Credit */}
                      {settings.unsplashAuthorName && (
                        <div className={`text-[10px] pt-1.5 border-t flex items-center justify-between ${
                          isLight ? 'border-black/8 text-slate-500' : 'border-white/8 text-white/50'
                        }`}>
                          <span>
                            {t('unsplashCredit', settings.language)}:{' '}
                            <a
                              href={settings.unsplashAuthorUrl || 'https://unsplash.com'}
                              target="_blank"
                              rel="noreferrer"
                              className="font-medium underline hover:text-current"
                            >
                              {settings.unsplashAuthorName}
                            </a>
                          </span>
                          <a
                            href="https://unsplash.com/?utm_source=mytab&utm_medium=referral"
                            target="_blank"
                            rel="noreferrer"
                            className="hover:underline"
                          >
                            Unsplash
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Collapsible Card & Layout Sliders Accordion */}
                <div
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isLight ? 'bg-black/[0.02] border-black/10' : 'bg-white/[0.04] border-white/10'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setIsCardLayoutExpanded(!isCardLayoutExpanded)}
                    className={`w-full flex items-center justify-between p-3.5 transition-colors cursor-pointer text-left ${
                      isLight ? 'hover:bg-black/[0.03]' : 'hover:bg-white/[0.04]'
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
                        <Sliders className="w-4 h-4" />
                      </div>
                      <div>
                        <div className={`text-xs font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>
                          {t('cardLayoutAdvanced', settings.language)}
                        </div>
                        <div className={`text-[10px] mt-0.5 font-tabular ${isLight ? 'text-slate-500' : 'text-white/50'}`}>
                          {settings.cardSize || 110}px · {Math.round(settings.cardOpacity * 100)}% · {settings.cardBlur ?? 50}% · {settings.maxCardsPerRow || 8}{t('cardsPerRowUnit', settings.language)}
                        </div>
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 shrink-0 opacity-60 ${
                        isCardLayoutExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isCardLayoutExpanded && (
                    <div
                      className={`p-4 pt-3 space-y-5 border-t animate-fade-in ${
                        isLight ? 'border-black/5 bg-white/40' : 'border-white/5 bg-black/20'
                      }`}
                    >
                      {/* Card Size Slider */}
                      <div>
                        <div className="flex justify-between text-xs font-medium mb-1.5">
                          <span className={isLight ? 'text-slate-700' : 'text-white/80'}>{t('cardSizeTitle', settings.language)}</span>
                          <span className="font-tabular font-semibold">{settings.cardSize || 110}px</span>
                        </div>
                        <input
                          type="range"
                          min="80"
                          max="160"
                          step="5"
                          value={settings.cardSize || 110}
                          onChange={(e) => handleSettingsChange({ cardSize: parseInt(e.target.value, 10) })}
                          className="range-slider"
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
                          <span className="font-tabular font-semibold">{Math.round(settings.cardOpacity * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0.05"
                          max="0.9"
                          step="0.05"
                          value={settings.cardOpacity}
                          onChange={(e) => handleSettingsChange({ cardOpacity: parseFloat(e.target.value) })}
                          className="range-slider"
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
                          <span className="font-tabular font-semibold">{settings.cardBlur ?? 50}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          value={settings.cardBlur ?? 50}
                          onChange={(e) => handleSettingsChange({ cardBlur: parseInt(e.target.value, 10) })}
                          className="range-slider"
                        />
                        <div className={`flex justify-between text-[10px] mt-1 ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
                          <span>{t('cardBlurLow', settings.language)}</span>
                          <span>{t('cardBlurMed', settings.language)}</span>
                          <span>{t('cardBlurHigh', settings.language)}</span>
                        </div>
                      </div>

                      {/* Card Icon Ratio Slider */}
                      <div>
                        <div className="flex justify-between text-xs font-medium mb-1.5">
                          <span className={isLight ? 'text-slate-700' : 'text-white/80'}>{t('iconSizeRatio', settings.language)}</span>
                          <span className="font-tabular font-semibold">{Math.round((settings.iconSizeRatio || 0.42) * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0.28"
                          max="0.65"
                          step="0.01"
                          value={settings.iconSizeRatio || 0.42}
                          onChange={(e) => handleSettingsChange({ iconSizeRatio: parseFloat(e.target.value) })}
                          className="range-slider"
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
                          <span className="font-tabular font-semibold">{settings.maxCardsPerRow || 8}</span>
                        </div>
                        <input
                          type="range"
                          min="4"
                          max="12"
                          step="1"
                          value={settings.maxCardsPerRow || 8}
                          onChange={(e) => handleSettingsChange({ maxCardsPerRow: parseInt(e.target.value, 10) })}
                          className="range-slider"
                        />
                        <div className={`flex justify-between text-[10px] mt-1 ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
                          <span>{t('cardsPerRowCompact', settings.language)}</span>
                          <span>{t('cardsPerRowDefault', settings.language)}</span>
                          <span>{t('cardsPerRowWide', settings.language)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. 偏好 Tab */}
            {activeTab === 'behavior' && (
              <div className="space-y-3">
                {/* Language */}
                <div
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-colors ${
                    isLight
                      ? 'bg-black/[0.03] border-black/8 text-slate-900'
                      : 'bg-white/[0.05] border-white/10 text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Globe className="w-4 h-4 opacity-70" />
                    <span className="text-xs font-medium">{t('language', settings.language)}</span>
                  </div>
                  <CustomSelect
                    value={settings.language}
                    onChange={(val) => handleSettingsChange({ language: val as any })}
                    isLight={isLight}
                    className="w-36"
                    options={supportedLocales.map((loc) => ({
                      value: loc.code,
                      label: loc.label,
                    }))}
                  />
                </div>

                {/* Open in New Tab */}
                <div
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-colors ${
                    isLight
                      ? 'bg-black/[0.03] border-black/8 text-slate-900'
                      : 'bg-white/[0.05] border-white/10 text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ExternalLink className="w-4 h-4 opacity-70" />
                    <span className="text-xs font-medium">{t('openInNewTab', settings.language)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSettingsChange({ openInNewTab: !settings.openInNewTab })}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
                      settings.openInNewTab ? 'bg-amber-500' : isLight ? 'bg-black/15' : 'bg-white/20'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        settings.openInNewTab ? 'translate-x-[18px]' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                {/* Show Search */}
                <div
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-colors ${
                    isLight
                      ? 'bg-black/[0.03] border-black/8 text-slate-900'
                      : 'bg-white/[0.05] border-white/10 text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Search className="w-4 h-4 opacity-70" />
                    <span className="text-xs font-medium">{t('showSearchOnly', settings.language)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSettingsChange({ showSearch: !(settings.showSearch ?? true) })}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
                      (settings.showSearch ?? true) ? 'bg-amber-500' : isLight ? 'bg-black/15' : 'bg-white/20'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        (settings.showSearch ?? true) ? 'translate-x-[18px]' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                {/* Show Clock & Time Format */}
                <div
                  className={`p-3.5 rounded-2xl border transition-colors space-y-3 ${
                    isLight
                      ? 'bg-black/[0.03] border-black/8 text-slate-900'
                      : 'bg-white/[0.05] border-white/10 text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 opacity-70" />
                      <span className="text-xs font-medium">{t('showClockOnly', settings.language)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSettingsChange({ showClock: !settings.showClock })}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
                        settings.showClock ? 'bg-amber-500' : isLight ? 'bg-black/15' : 'bg-white/20'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          settings.showClock ? 'translate-x-[18px]' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>

                  {settings.showClock && (
                    <div className={`pt-3 border-t flex items-center justify-between ${isLight ? 'border-black/8' : 'border-white/10'}`}>
                      <span className={`text-[11px] font-medium ${isLight ? 'text-slate-600' : 'text-white/70'}`}>
                        {t('timeFormat', settings.language)}
                      </span>
                      <div className={`flex p-0.5 rounded-lg border ${isLight ? 'bg-black/5 border-black/10' : 'bg-white/10 border-white/15'}`}>
                        <button
                          type="button"
                          onClick={() => handleSettingsChange({ timeFormat: '12h' })}
                          className={`px-3 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                            settings.timeFormat === '12h'
                              ? isLight ? 'bg-white text-slate-900 shadow-sm' : 'bg-white/20 text-white shadow-sm'
                              : isLight ? 'text-slate-500 hover:text-slate-800' : 'text-white/50 hover:text-white'
                          }`}
                        >
                          {t('timeFormat12h', settings.language)}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSettingsChange({ timeFormat: '24h' })}
                          className={`px-3 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                            (settings.timeFormat || '24h') === '24h'
                              ? isLight ? 'bg-white text-slate-900 shadow-sm' : 'bg-white/20 text-white shadow-sm'
                              : isLight ? 'text-slate-500 hover:text-slate-800' : 'text-white/50 hover:text-white'
                          }`}
                        >
                          {t('timeFormat24h', settings.language)}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Show Date */}
                <div
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-colors ${
                    isLight
                      ? 'bg-black/[0.03] border-black/8 text-slate-900'
                      : 'bg-white/[0.05] border-white/10 text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 opacity-70" />
                    <span className="text-xs font-medium">{t('showDateOnly', settings.language)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSettingsChange({ showDate: !settings.showDate })}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
                      settings.showDate ? 'bg-amber-500' : isLight ? 'bg-black/15' : 'bg-white/20'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        settings.showDate ? 'translate-x-[18px]' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                {/* Show Greeting & Custom Greetings Section */}
                <div
                  className={`p-3.5 rounded-2xl border transition-colors space-y-3 ${
                    isLight
                      ? 'bg-black/[0.03] border-black/8 text-slate-900'
                      : 'bg-white/[0.05] border-white/10 text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <MessageSquareQuote className="w-4 h-4 opacity-70" />
                      <span className="text-xs font-medium">{t('showGreetingOnly', settings.language)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSettingsChange({ showGreeting: !settings.showGreeting })}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
                        settings.showGreeting ? 'bg-amber-500' : isLight ? 'bg-black/15' : 'bg-white/20'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          settings.showGreeting ? 'translate-x-[18px]' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Greeting customization panel when showGreeting is enabled */}
                  {settings.showGreeting && (
                    <div
                      className={`pt-3 border-t space-y-2.5 ${
                        isLight ? 'border-black/8' : 'border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-medium ${isLight ? 'text-slate-600' : 'text-white/70'}`}>
                          {t('customGreetings', settings.language)}
                        </span>
                        {settings.customGreetings && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-medium flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            {t('customGreetingsActive', settings.language)}
                          </span>
                        )}
                      </div>

                      <p className={`text-[11px] leading-relaxed ${isLight ? 'text-slate-500' : 'text-white/50'}`}>
                        {t('customGreetingsDesc', settings.language)}
                      </p>

                      <div className="flex flex-wrap gap-2 pt-1">
                        {/* Import Greetings Button */}
                        <label
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium cursor-pointer transition-colors ${
                            isLight
                              ? 'bg-black/5 hover:bg-black/10 border-black/10 text-slate-800'
                              : 'bg-white/10 hover:bg-white/20 border-white/15 text-white'
                          }`}
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{t('importGreetings', settings.language)}</span>
                          <input
                            type="file"
                            accept=".json"
                            onChange={handleImportGreetingsFile}
                            className="hidden"
                          />
                        </label>

                        {/* Download Template Button */}
                        <button
                          type="button"
                          onClick={handleDownloadGreetingTemplate}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                            isLight
                              ? 'bg-black/5 hover:bg-black/10 border-black/10 text-slate-800'
                              : 'bg-white/10 hover:bg-white/20 border-white/15 text-white'
                          }`}
                        >
                          <FileDown className="w-3.5 h-3.5" />
                          <span>{t('downloadGreetingTemplate', settings.language)}</span>
                        </button>

                        {/* Reset to Default */}
                        {settings.customGreetings && (
                          <button
                            type="button"
                            onClick={handleResetGreetings}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors text-red-500 bg-red-500/10 hover:bg-red-500/20 border-red-500/20 cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>{t('resetGreetings', settings.language)}</span>
                          </button>
                        )}
                      </div>

                      {/* Import Status Message */}
                      {greetingStatus && (
                        <div
                          className={`text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 animate-fade-in ${
                            greetingStatus.success
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                              : 'bg-red-500/10 text-red-500 border border-red-500/20'
                          }`}
                        >
                          <span>{greetingStatus.text}</span>
                        </div>
                      )}
                    </div>
                  )}
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
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer active:scale-95 ${
                      syncProvider === 'webdav'
                        ? isLight
                          ? 'bg-slate-900 text-white shadow-sm font-semibold'
                          : 'bg-white text-slate-950 shadow-sm font-semibold'
                        : isLight
                        ? 'text-slate-600 hover:text-slate-900'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    <Cloud className="w-3.5 h-3.5" />
                    <span>{t('webdavSync', settings.language)}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSyncProvider('git')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer active:scale-95 ${
                      syncProvider === 'git'
                        ? isLight
                          ? 'bg-slate-900 text-white shadow-sm font-semibold'
                          : 'bg-white text-slate-950 shadow-sm font-semibold'
                        : isLight
                        ? 'text-slate-600 hover:text-slate-900'
                        : 'text-white/70 hover:text-white'
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
                      ? 'bg-black/[0.03] border-black/8 text-slate-700'
                      : 'bg-white/[0.05] border-white/10 text-white/70'
                  }`}
                >
                  <div className="text-xs leading-relaxed">
                    {t('backupDescription', settings.language)}
                  </div>

                  <div className="flex flex-col gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={handleExport}
                      className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer active:scale-95 ${
                        isLight
                          ? 'bg-slate-900 hover:bg-black text-white'
                          : 'bg-white hover:bg-slate-100 text-slate-950 font-semibold'
                      }`}
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
                          ? 'bg-black/5 text-slate-800 border border-black/10'
                          : 'bg-white/10 text-white'
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

      {/* Unsplash Category & Topic Modal */}
      <UnsplashTopicModal
        isOpen={isUnsplashTopicModalOpen}
        onClose={() => setIsUnsplashTopicModalOpen(false)}
        initialActiveTab={settings.unsplashActiveTab || 'nature'}
        initialKeywords={settings.unsplashKeywords || ['nature', 'landscape']}
        language={settings.language}
        isLight={isLight}
        onSave={(newActiveTab, newKeywords) => {
          handleRefreshUnsplash({
            unsplashActiveTab: newActiveTab,
            unsplashKeywords: newKeywords,
          });
        }}
      />
    </div>
  );
};
