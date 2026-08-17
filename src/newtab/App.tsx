import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Settings as SettingsIcon, Plus } from 'lucide-react';
import { AppState, Category, GitSyncConfig, SiteItem, ThemeSettings, WebdavConfig } from '../types';
import {
  loadAppState,
  saveSites,
  saveCategories,
  saveSettings,
  saveWebdavConfig,
  saveGitConfig,
  saveActiveCategory,
  setFirstLaunchComplete,
} from '../services/storage';
import { executeWebdavSync } from '../services/webdav';
import { executeGitSync } from '../services/git';
import { ClockHeader } from './components/ClockHeader';
import { SearchBar } from './components/SearchBar';
import { CategoryTabs } from './components/CategoryTabs';
import { SiteGrid } from './components/SiteGrid';
import { SiteModal } from './components/SiteModal';
import { SettingsDrawer } from './components/SettingsDrawer';
import { OnboardingModal } from './components/OnboardingModal';
import { ConfirmModal } from './components/ConfirmModal';
import { urlToBase64Icon } from '../services/metadata';
import { DEFAULT_SETTINGS } from '../utils/constants';

export const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSiteModalOpen, setIsSiteModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<SiteItem | null>(null);
  const [deletingSite, setDeletingSite] = useState<SiteItem | null>(null);

  // 1. Load state on mount
  const reloadState = useCallback(async () => {
    const data = await loadAppState();
    setAppState(data);
  }, []);

  useEffect(() => {
    reloadState();
  }, [reloadState]);

  // 2. Background Cache Warmer: Convert any remaining remote icon URLs to Base64
  useEffect(() => {
    if (!appState || !appState.sites) return;
    const hasUncached = appState.sites.some(
      (s) => s.icon && (s.icon.startsWith('http://') || s.icon.startsWith('https://'))
    );
    if (!hasUncached) return;

    const timer = setTimeout(async () => {
      let changed = false;
      const updated = await Promise.all(
        appState.sites.map(async (s) => {
          if (s.icon && (s.icon.startsWith('http://') || s.icon.startsWith('https://'))) {
            try {
              const base64 = await urlToBase64Icon(s.icon, 128);
              if (base64 && base64.startsWith('data:image/')) {
                changed = true;
                return { ...s, icon: base64 };
              }
            } catch {
              // ignore
            }
          }
          return s;
        })
      );
      if (changed) {
        await saveSites(updated);
        setAppState((prev) => (prev ? { ...prev, sites: updated } : null));
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [appState?.sites]);

  // 3. Handle Auto-Sync (WebDAV & Git) if enabled
  const triggerAutoSync = useCallback(async (currentState: AppState) => {
    if (currentState.webdav?.enabled && currentState.webdav?.autoSync) {
      await executeWebdavSync(currentState);
    }
    if (currentState.git?.enabled && currentState.git?.autoSync) {
      await executeGitSync(currentState);
    }
  }, []);

  // 3. Theme mode class on document
  useEffect(() => {
    if (!appState) return;
    const isLight = appState.settings.mode === 'light';
    if (isLight) {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [appState?.settings?.mode]);

  // 4. Background style computation (All hooks must be at top level unconditionally)
  const currentSettings = appState?.settings || DEFAULT_SETTINGS;
  const backgroundStyle = useMemo(() => {
    if (currentSettings.backgroundType === 'gradient') {
      return { background: currentSettings.backgroundValue };
    }
    if (['bing', 'unsplash', 'custom'].includes(currentSettings.backgroundType)) {
      const rawVal = currentSettings.backgroundValue || './wallpapers/default-wallpaper.jpg';
      const bgUrl =
        rawVal.startsWith('http') || rawVal.startsWith('data:')
          ? rawVal
          : typeof chrome !== 'undefined' && chrome.runtime?.getURL
          ? chrome.runtime.getURL(rawVal.replace(/^\.?\//, ''))
          : rawVal;

      return {
        backgroundImage: `url("${bgUrl}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      };
    }
    return { background: currentSettings.backgroundValue };
  }, [currentSettings.backgroundType, currentSettings.backgroundValue]);

  if (!appState) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white/70">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <div className="text-sm font-medium tracking-wide">Loading MyTab...</div>
      </div>
    );
  }

  const { sites, categories, settings, activeCategoryId, isFirstLaunch } = appState;

  // Filter sites based on active category
  const filteredSites =
    activeCategoryId === 'all'
      ? sites
      : sites.filter((s) => s.categoryId === activeCategoryId);

  // Compute count of sites per category
  const siteCounts: Record<string, number> = {
    ...categories.reduce((acc, cat) => {
      acc[cat.id] =
        cat.id === 'all'
          ? sites.length
          : sites.filter((s) => s.categoryId === cat.id).length;
      return acc;
    }, {} as Record<string, number>),
    all: sites.length,
  };

  // Handlers for Sites
  const handleSaveSite = async (siteData: Partial<SiteItem>) => {
    let updatedSites: SiteItem[];
    const now = Date.now();

    if (editingSite) {
      updatedSites = sites.map((s) =>
        s.id === editingSite.id
          ? ({ ...s, ...siteData, updatedAt: now } as SiteItem)
          : s
      );
    } else {
      const newSite: SiteItem = {
        id: `site-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: siteData.title || 'Untitled',
        url: siteData.url || 'https://',
        icon: siteData.icon,
        categoryId: siteData.categoryId || 'tools',
        sortOrder: sites.length,
        createdAt: now,
        updatedAt: now,
      };
      updatedSites = [...sites, newSite];
    }

    await saveSites(updatedSites);
    const nextState = { ...appState, sites: updatedSites };
    setAppState(nextState);
    setIsSiteModalOpen(false);
    setEditingSite(null);
    triggerAutoSync(nextState);
  };

  const handleDeleteSite = (siteId: string) => {
    const site = sites.find((s) => s.id === siteId);
    if (site) {
      setDeletingSite(site);
    }
  };

  const confirmDeleteSite = async () => {
    if (!deletingSite) return;
    const siteId = deletingSite.id;
    const updatedSites = sites.filter((s) => s.id !== siteId);
    await saveSites(updatedSites);
    const nextState = { ...appState, sites: updatedSites };
    setAppState(nextState);
    setDeletingSite(null);
    triggerAutoSync(nextState);
  };

  const handleReorderSites = async (reordered: SiteItem[]) => {
    let finalSites: SiteItem[];
    if (activeCategoryId === 'all') {
      finalSites = reordered;
    } else {
      const others = sites.filter((s) => s.categoryId !== activeCategoryId);
      finalSites = [...others, ...reordered];
    }

    await saveSites(finalSites);
    const nextState = { ...appState, sites: finalSites };
    setAppState(nextState);
    triggerAutoSync(nextState);
  };

  // Handlers for Categories
  const handleAddCategory = async (name: string) => {
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name,
      sortOrder: categories.length,
    };
    const updatedCats = [...categories, newCat];
    await saveCategories(updatedCats);
    const nextState = { ...appState, categories: updatedCats };
    setAppState(nextState);
    triggerAutoSync(nextState);
  };

  const handleDeleteCategory = async (catId: string) => {
    const updatedCats = categories.filter((c) => c.id !== catId);
    const fallbackCat = categories[1]?.id || 'tools';
    const updatedSites = sites.map((s) =>
      s.categoryId === catId ? { ...s, categoryId: fallbackCat } : s
    );

    await saveCategories(updatedCats);
    await saveSites(updatedSites);
    if (activeCategoryId === catId) {
      await saveActiveCategory('all');
    }

    const nextState = {
      ...appState,
      categories: updatedCats,
      sites: updatedSites,
      activeCategoryId: activeCategoryId === catId ? 'all' : activeCategoryId,
    };
    setAppState(nextState);
    triggerAutoSync(nextState);
  };

  const handleSelectCategory = async (catId: string) => {
    await saveActiveCategory(catId);
    setAppState({ ...appState, activeCategoryId: catId });
  };

  // Handlers for Settings & WebDAV
  const handleUpdateSettings = async (newSettings: ThemeSettings) => {
    const stampedSettings = { ...newSettings, updatedAt: Date.now() };
    await saveSettings(stampedSettings);
    const nextState = { ...appState, settings: stampedSettings };
    setAppState(nextState);
    triggerAutoSync(nextState);
  };

  const handleUpdateWebdav = async (newWebdav: WebdavConfig) => {
    await saveWebdavConfig(newWebdav);
    setAppState({ ...appState, webdav: newWebdav });
  };

  const handleUpdateGit = async (newGit: GitSyncConfig) => {
    await saveGitConfig(newGit);
    setAppState({ ...appState, git: newGit });
  };

  const handleFinishOnboarding = async () => {
    await setFirstLaunchComplete();
    setAppState({ ...appState, isFirstLaunch: false });
  };

  return (
    <div
      style={backgroundStyle}
      className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden selection:bg-indigo-500 selection:text-white"
    >
      {/* Dark tint overlay for non-gradient wallpapers */}
      {settings.backgroundType !== 'gradient' && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-none z-0" />
      )}

      {/* Top Floating Actions Bar */}
      <header className="relative z-10 w-full flex items-center justify-between p-5 md:px-8">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold tracking-wider text-white/80 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
            MyTab
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Quick Add Button */}
          <button
            onClick={() => {
              setEditingSite(null);
              setIsSiteModalOpen(true);
            }}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 text-white/80 hover:text-white shadow-lg transition-all duration-200 cursor-pointer"
            title="Add shortcut"
          >
            <Plus className="w-5 h-5" />
          </button>

          {/* Settings Button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 text-white/80 hover:text-white shadow-lg transition-all duration-200 cursor-pointer"
            title="Settings"
          >
            <SettingsIcon className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Center Main Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-start max-w-7xl mx-auto w-full pb-12">
        {/* Clock & Greetings */}
        <ClockHeader settings={settings} />

        {/* Search Bar */}
        <SearchBar
          settings={settings}
          onEngineChange={(engineId) =>
            handleUpdateSettings({ ...settings, activeEngineId: engineId })
          }
        />

        {/* Category Tabs */}
        <CategoryTabs
          categories={categories}
          activeCategoryId={activeCategoryId}
          settings={settings}
          siteCounts={siteCounts}
          onSelectCategory={handleSelectCategory}
          onAddCategory={handleAddCategory}
          onDeleteCategory={handleDeleteCategory}
        />

        {/* Sites Grid */}
        <SiteGrid
          sites={filteredSites}
          settings={settings}
          onEditSite={(site) => {
            setEditingSite(site);
            setIsSiteModalOpen(true);
          }}
          onDeleteSite={handleDeleteSite}
          onAddSite={() => {
            setEditingSite(null);
            setIsSiteModalOpen(true);
          }}
          onReorderSites={handleReorderSites}
        />
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-3 text-[11px] text-white/40 select-none">
        Powered by{' '}
        <a
          href="https://github.com/Troray/MyTab"
          target="_blank"
          rel="noreferrer"
          className="hover:text-white/80 transition-colors underline decoration-white/20"
        >
          MyTab
        </a>{' '}
        • Made with ❤️ by{' '}
        <a
          href="https://github.com/Troray"
          target="_blank"
          rel="noreferrer"
          className="hover:text-white/80 transition-colors underline decoration-white/20"
        >
          Troray
        </a>
      </footer>

      {/* Modals & Drawers */}
      <SiteModal
        isOpen={isSiteModalOpen}
        editingSite={editingSite}
        categories={categories}
        activeCategoryId={activeCategoryId}
        settings={settings}
        onClose={() => {
          setIsSiteModalOpen(false);
          setEditingSite(null);
        }}
        onSave={handleSaveSite}
      />

      <SettingsDrawer
        isOpen={isSettingsOpen}
        appState={appState}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateSettings={handleUpdateSettings}
        onUpdateWebdav={handleUpdateWebdav}
        onUpdateGit={handleUpdateGit}
        onStateReload={reloadState}
      />

      <OnboardingModal
        isOpen={isFirstLaunch}
        settings={settings}
        onFinish={handleFinishOnboarding}
        onOpenSettings={() => {
          handleFinishOnboarding();
          setIsSettingsOpen(true);
        }}
      />

      {/* Delete Site Shortcut Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingSite)}
        type="danger"
        title={settings.language === 'zh-CN' ? `删除「${deletingSite?.title}」快捷方式` : `Delete "${deletingSite?.title}"`}
        message={
          settings.language === 'zh-CN'
            ? `确定要删除「${deletingSite?.title}」(${deletingSite?.url}) 吗？`
            : `Are you sure you want to delete "${deletingSite?.title}" (${deletingSite?.url})?`
        }
        confirmText={settings.language === 'zh-CN' ? '确定删除' : 'Delete'}
        language={settings.language}
        onConfirm={confirmDeleteSite}
        onCancel={() => setDeletingSite(null)}
      />
    </div>
  );
};
