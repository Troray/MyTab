import React, { useState, useEffect, useCallback, useMemo, useRef, Suspense, lazy } from 'react';
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
import { ClockHeader } from './components/ClockHeader';
import { SearchBar } from './components/SearchBar';
import { CategoryTabs } from './components/CategoryTabs';
import { SiteGrid } from './components/SiteGrid';
import { urlToBase64Icon } from '../services/metadata';
import { DEFAULT_SETTINGS } from '../utils/constants';
import { ConfirmModal } from './components/ConfirmModal';
import { analyzeWallpaperLuminance, resolveTextColors, WallpaperLuminance, DEFAULT_LUMINANCE } from '../utils/wallpaperAnalyzer';
import { TextColorCustomizer } from './components/TextColorCustomizer';

const CACHE_WARMER_DELAY = 1200; // Delay to avoid blocking initial render

// Lazy-load heavy modal/drawer components to reduce initial bundle size
const SiteModal = lazy(() => import('./components/SiteModal').then(m => ({ default: m.SiteModal })));
const SettingsDrawer = lazy(() => import('./components/SettingsDrawer').then(m => ({ default: m.SettingsDrawer })));
const OnboardingModal = lazy(() => import('./components/OnboardingModal').then(m => ({ default: m.OnboardingModal })));

export const App: React.FC<{ initialState?: AppState }> = ({ initialState }) => {
  const [appState, setAppState] = useState<AppState | null>(initialState || null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSiteModalOpen, setIsSiteModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<SiteItem | null>(null);
  const [deletingSite, setDeletingSite] = useState<SiteItem | null>(null);
  const [isCustomizingColors, setIsCustomizingColors] = useState(false);
  const [wallpaperLuminance, setWallpaperLuminance] = useState<WallpaperLuminance>(DEFAULT_LUMINANCE);

  // Track OS system theme dynamic changes
  const [systemIsDark, setSystemIsDark] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)').matches : false
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);

  // 1. Load state on mount
  const reloadState = useCallback(async () => {
    const data = await loadAppState();
    setAppState(data);
  }, []);

  useEffect(() => {
    if (!initialState) reloadState();
  }, [reloadState, initialState]);

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
            } catch (err) {
              console.warn('[MyTab] Cache warmer failed to convert icon:', err);
            }
          }
          return s;
        })
      );
      if (changed) {
        await saveSites(updated);
        setAppState((prev) => (prev ? { ...prev, sites: updated } : null));
      }
    }, CACHE_WARMER_DELAY);

    return () => clearTimeout(timer);
  }, [appState?.sites]);

  // 3. Theme mode class on document
  useEffect(() => {
    if (!appState) return;
    const mode = appState.settings.mode;
    const isDark = mode === 'dark' || (mode === 'system' && systemIsDark);

    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [appState?.settings?.mode, systemIsDark]);

  // 4. Background style computation (All hooks must be at top level unconditionally)
  const currentSettings: ThemeSettings = useMemo(() => {
    const raw = appState?.settings || {};
    const clean = Object.fromEntries(
      Object.entries(raw).filter(([_, v]) => v !== undefined && v !== null)
    );
    return { ...DEFAULT_SETTINGS, ...clean };
  }, [appState?.settings]);

  // Luminance analysis for wallpaper contrast
  useEffect(() => {
    let isCancelled = false;
    analyzeWallpaperLuminance(
      currentSettings.backgroundType,
      currentSettings.backgroundValue,
      (lum) => {
        if (!isCancelled) {
          setWallpaperLuminance(lum);
        }
      }
    );
    return () => {
      isCancelled = true;
    };
  }, [currentSettings.backgroundType, currentSettings.backgroundValue]);

  const activeThemeMode: 'light' | 'dark' =
    currentSettings.mode === 'light'
      ? 'light'
      : currentSettings.mode === 'dark'
        ? 'dark'
        : systemIsDark
          ? 'dark'
          : 'light';

  const resolvedColors = useMemo(() => {
    return resolveTextColors(currentSettings, wallpaperLuminance, activeThemeMode);
  }, [currentSettings, wallpaperLuminance, activeThemeMode]);

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

  // Double-buffering state for seamless zero-flash cross-fade wallpaper transitions
  const visibleBgRef = useRef<React.CSSProperties>(backgroundStyle);
  const [activeBg, setActiveBg] = useState<React.CSSProperties>(backgroundStyle);
  const [incomingBg, setIncomingBg] = useState<React.CSSProperties | null>(null);
  const [isCrossFading, setIsCrossFading] = useState(false);

  useEffect(() => {
    const currentCss = JSON.stringify(visibleBgRef.current);
    const nextCss = JSON.stringify(backgroundStyle);
    if (currentCss === nextCss) return;

    const bgUrlMatch = (backgroundStyle as any).backgroundImage?.match(/url\(["']?([^"']+)["']?\)/);
    const targetUrl = bgUrlMatch ? bgUrlMatch[1] : null;

    let isCancelled = false;

    const startTransition = () => {
      if (isCancelled) return;
      // Promote the currently visible background to the base layer so rapid clicks NEVER snap back
      setActiveBg(visibleBgRef.current);
      setIncomingBg(backgroundStyle as React.CSSProperties);
      setIsCrossFading(false);

      requestAnimationFrame(() => {
        if (!isCancelled) {
          setIsCrossFading(true);
          visibleBgRef.current = backgroundStyle as React.CSSProperties;
        }
      });
    };

    if (targetUrl) {
      const img = new Image();
      img.src = targetUrl;
      const onDone = () => {
        if (!isCancelled) {
          if ('decode' in img && typeof (img as any).decode === 'function') {
            (img as any).decode().then(startTransition).catch(startTransition);
          } else {
            startTransition();
          }
        }
      };
      if (img.complete) {
        onDone();
      } else {
        img.onload = onDone;
        img.onerror = onDone;
      }
    } else {
      startTransition();
    }

    return () => {
      isCancelled = true;
    };
  }, [backgroundStyle]);

  useEffect(() => {
    if (!isCrossFading) return;
    const timer = setTimeout(() => {
      if (incomingBg) {
        setActiveBg(incomingBg);
        visibleBgRef.current = incomingBg;
        setIncomingBg(null);
        setIsCrossFading(false);
      }
    }, 450);
    return () => clearTimeout(timer);
  }, [isCrossFading, incomingBg]);

  // Cache background for zero-delay startup on next launch (eliminates any flash)
  useEffect(() => {
    try {
      let css = '';
      const style = backgroundStyle as React.CSSProperties;
      if (style.backgroundColor) {
        css += `background-color: ${style.backgroundColor};`;
      }
      if (style.backgroundImage) {
        css += `background-image: ${style.backgroundImage};`;
      }
      // Add gradient support
      if (style.background) {
        css += `background: ${style.background};`;
      }
      localStorage.setItem('mytab_bg_cache', css);
      const isLightMode = currentSettings.mode === 'light';
      localStorage.setItem('mytab_theme_mode', isLightMode ? 'light' : 'dark');

      // Keep document.body in sync with current background and remove stale init style
      const initStyleEl = document.getElementById('mytab-init-bg');
      if (initStyleEl) {
        initStyleEl.remove();
      }
      if (style.backgroundImage) {
        document.body.style.backgroundImage = style.backgroundImage;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundRepeat = 'no-repeat';
      } else if (style.background) {
        document.body.style.background = style.background as string;
      }
    } catch (e) {
      console.warn('[MyTab] Failed to cache background to localStorage:', e);
    }
  }, [backgroundStyle, currentSettings.mode]);

  if (!appState) {
    return null; // Return null instead of a jarring spinner to avoid white/black flashes on startup
  }

  const { sites, categories, activeCategoryId, isFirstLaunch } = appState;
  const settings = currentSettings;

  // Memoized: Filter sites based on active category and showInAll flag
  const filteredSites = useMemo(() => {
    const hiddenInAllCatIds = new Set(
      categories.filter((c) => c.showInAll === false).map((c) => c.id)
    );
    return activeCategoryId === 'all'
      ? sites.filter((s) => !hiddenInAllCatIds.has(s.categoryId))
      : sites.filter((s) => s.categoryId === activeCategoryId);
  }, [sites, categories, activeCategoryId]);

  // Memoized: Compute count of sites per category
  const siteCounts = useMemo(() => {
    const hiddenInAllCatIds = new Set(
      categories.filter((c) => c.showInAll === false).map((c) => c.id)
    );
    const allVisibleCount = sites.filter((s) => !hiddenInAllCatIds.has(s.categoryId)).length;
    const counts: Record<string, number> = { all: allVisibleCount };
    categories.forEach((cat) => {
      counts[cat.id] = cat.id === 'all'
        ? allVisibleCount
        : sites.filter((s) => s.categoryId === cat.id).length;
    });
    return counts;
  }, [sites, categories]);

  const handleSaveSite = useCallback(async (siteData: Partial<SiteItem>) => {
    let updatedSites: SiteItem[];
    const now = Date.now();

    if (editingSite) {
      updatedSites = sites.map((s) =>
        s.id === editingSite.id ? ({ ...s, ...siteData, updatedAt: now } as SiteItem) : s
      );
    } else {
      const newSite: SiteItem = {
        id: `site-${now}`,
        title: siteData.title || '',
        url: siteData.url || '',
        icon: siteData.icon || '',
        categoryId: siteData.categoryId || activeCategoryId,
        sortOrder: sites.length,
        createdAt: now,
        updatedAt: now,
      };
      updatedSites = [...sites, newSite];
    }

    await saveSites(updatedSites);
    setAppState((prev) => (prev ? { ...prev, sites: updatedSites } : null));
    setIsSiteModalOpen(false);
    setEditingSite(null);
  }, [sites, editingSite, activeCategoryId]);

  const handleDeleteSite = useCallback((siteId: string) => {
    const site = sites.find((s) => s.id === siteId);
    if (site) {
      setDeletingSite(site);
    }
  }, [sites]);

  const confirmDeleteSite = useCallback(async () => {
    if (!deletingSite) return;
    const updated = sites.filter((s) => s.id !== deletingSite.id);
    await saveSites(updated);
    setAppState((prev) => (prev ? { ...prev, sites: updated } : null));
    setDeletingSite(null);
  }, [sites, deletingSite]);

  const handleReorderSites = useCallback(async (reorderedSites: SiteItem[]) => {
    const updated = sites.map((site) => {
      const foundIndex = reorderedSites.findIndex((s) => s.id === site.id);
      return foundIndex !== -1 ? { ...site, sortOrder: foundIndex } : site;
    });
    await saveSites(updated);
    setAppState((prev) => (prev ? { ...prev, sites: updated } : null));
  }, [sites]);

  const handleAddCategory = async (data: { name: string; showInAll: boolean }) => {
    const now = Date.now();
    const newCat: Category = {
      id: `cat-${now}`,
      name: data.name || '',
      isDefault: false,
      showInAll: data.showInAll ?? true,
      sortOrder: categories.length,
      createdAt: now,
      updatedAt: now,
    };
    const updated = [...categories, newCat];
    await saveCategories(updated);
    setAppState((prev) => (prev ? { ...prev, categories: updated } : null));
  };

  const handleUpdateCategory = async (id: string, updates: Partial<Category>) => {
    const now = Date.now();
    const updated = categories.map((c) =>
      c.id === id ? { ...c, ...updates, updatedAt: now } : c
    );
    await saveCategories(updated);
    setAppState((prev) => (prev ? { ...prev, categories: updated } : null));
  };

  const handleDeleteCategory = async (catId: string) => {
    // Cannot delete default categories
    const target = categories.find((c) => c.id === catId);
    if (!target || target.isDefault) return;

    // Remove category
    const updatedCategories = categories.filter((c) => c.id !== catId);

    // Reassign sites from deleted category to 'tools' default category
    const updatedSites = sites.map((s) =>
      s.categoryId === catId ? { ...s, categoryId: 'tools', updatedAt: Date.now() } : s
    );

    await saveCategories(updatedCategories);
    await saveSites(updatedSites);

    // If active category was deleted, switch back to 'all'
    setAppState((prev) =>
      prev
        ? {
          ...prev,
          categories: updatedCategories,
          sites: updatedSites,
          activeCategoryId: prev.activeCategoryId === catId ? 'all' : prev.activeCategoryId,
        }
        : null
    );
  };

  const handleSelectCategory = async (catId: string) => {
    await saveActiveCategory(catId);
    setAppState((prev) => (prev ? { ...prev, activeCategoryId: catId } : null));
  };

  // Handlers for Settings & WebDAV
  const handleUpdateSettings = (newSettings: Partial<ThemeSettings>) => {
    setAppState((prev) => {
      if (!prev) return prev;
      const cleanPrev = Object.fromEntries(
        Object.entries(prev.settings || {}).filter(([_, v]) => v !== undefined && v !== null)
      );
      const cleanNew = Object.fromEntries(
        Object.entries(newSettings || {}).filter(([_, v]) => v !== undefined && v !== null)
      );
      const stampedSettings: ThemeSettings = {
        ...DEFAULT_SETTINGS,
        ...cleanPrev,
        ...cleanNew,
        updatedAt: Date.now(),
      };
      saveSettings(stampedSettings).catch((e) =>
        console.error('[MyTab] Failed to save settings:', e)
      );
      return { ...prev, settings: stampedSettings };
    });
  };

  const handleUpdateWebdav = async (newWebdav: WebdavConfig) => {
    await saveWebdavConfig(newWebdav);
    setAppState((prev) => (prev ? { ...prev, webdav: newWebdav } : null));
  };

  const handleUpdateGit = async (newGit: GitSyncConfig) => {
    await saveGitConfig(newGit);
    setAppState((prev) => (prev ? { ...prev, git: newGit } : null));
  };

  const handleFinishOnboarding = async () => {
    await setFirstLaunchComplete();
    setAppState((prev) => (prev ? { ...prev, isFirstLaunch: false } : prev));
  };

  const isLight = settings.mode === 'light';

  return (
    <div
      className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden selection:bg-slate-700 dark:selection:bg-slate-300 dark:selection:text-slate-900 selection:text-white"
    >
      {/* Double-buffered Seamless Background Container */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none">
        {/* Active Base Wallpaper Layer */}
        <div
          style={activeBg}
          className="absolute inset-0 w-full h-full"
        />

        {/* Incoming Wallpaper Layer for seamless cross-fade */}
        {incomingBg && (
          <div
            style={incomingBg}
            className={`absolute inset-0 w-full h-full transition-opacity duration-400 ease-out ${isCrossFading ? 'opacity-100' : 'opacity-0'
              }`}
          />
        )}

        {/* Dynamic tint overlay for non-gradient wallpapers */}
        {settings.backgroundType !== 'gradient' && (
          <div
            className={`absolute inset-0 transition-colors duration-300 ${isLight ? 'bg-white/20' : 'bg-black/40'
              }`}
          />
        )}
      </div>

      {/* Top Floating Actions Bar */}
      <header className="relative z-10 w-full flex items-center justify-between p-5 md:px-8">
        <div className="flex items-center gap-2">
          <span
            className={`text-sm font-semibold tracking-wider px-3 py-1 rounded-full border transition-colors ${isLight
                ? 'text-slate-800 bg-white/70 border-black/10 shadow-sm'
                : 'text-white/80 bg-white/10 border-white/10'
              }`}
          >
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
            className={`p-2.5 rounded-xl border shadow-sm transition-all duration-150 cursor-pointer active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-black/20 dark:focus-visible:ring-white/20 ${isLight
                ? 'bg-white/80 hover:bg-white text-slate-700 hover:text-black border-black/10 shadow-black/[0.02]'
                : 'bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border-white/10'
              }`}
            title="Add shortcut"
          >
            <Plus className="w-4.5 h-4.5" />
          </button>

          {/* Settings Drawer Trigger */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className={`p-2.5 rounded-xl border shadow-sm transition-all duration-150 cursor-pointer active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-black/20 dark:focus-visible:ring-white/20 ${isLight
                ? 'bg-white/80 hover:bg-white text-slate-700 hover:text-black border-black/10 shadow-black/[0.02]'
                : 'bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border-white/10'
              }`}
            title="Settings"
          >
            <SettingsIcon className="w-4.5 h-4.5" />
          </button>
        </div>
      </header>

      {/* Center Main Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-start max-w-7xl mx-auto w-full pb-12">
        {/* Clock & Greetings */}
        <ClockHeader settings={settings} resolvedColors={resolvedColors} />

        {/* Search Bar */}
        {(settings.showSearch ?? true) && (
          <SearchBar
            settings={settings}
            resolvedColors={resolvedColors}
            onEngineChange={(engineId) =>
              handleUpdateSettings({ ...settings, activeEngineId: engineId })
            }
          />
        )}

        {/* Category Tabs */}
        <CategoryTabs
          categories={categories}
          resolvedColors={resolvedColors}
          activeCategoryId={activeCategoryId}
          settings={settings}
          siteCounts={siteCounts}
          onSelectCategory={handleSelectCategory}
          onAddCategory={handleAddCategory}
          onUpdateCategory={handleUpdateCategory}
          onDeleteCategory={handleDeleteCategory}
        />

        {/* Shortcuts Grid */}
        <SiteGrid
          sites={filteredSites}
          settings={settings}
          resolvedColors={resolvedColors}
          onEditSite={useCallback((site) => {
            setEditingSite(site);
            setIsSiteModalOpen(true);
          }, [])}
          onDeleteSite={handleDeleteSite}
          onAddSite={useCallback(() => {
            setEditingSite(null);
            setIsSiteModalOpen(true);
          }, [])}
          onReorderSites={handleReorderSites}
        />
      </main>

      {/* Footer Minimalist Credit */}
      <footer className="relative z-10 w-full flex items-center justify-between p-4 px-6 text-xs text-white/40">
        <div className="w-1/3">
          {settings.backgroundType === 'unsplash' && settings.unsplashAuthorName && (
            <a
              href={`${settings.unsplashAuthorUrl}?utm_source=MyTab&utm_medium=referral`}
              target="_blank"
              rel="noreferrer"
              className={`inline-flex items-center gap-1 transition-colors ${isLight ? 'text-slate-600 hover:text-black' : 'text-white/50 hover:text-white'
                }`}
            >
              <span>Photo by</span>
              <span className="underline decoration-dotted underline-offset-2">
                {settings.unsplashAuthorName}
              </span>
              <span>on Unsplash</span>
            </a>
          )}
        </div>

        <div className="w-1/3 text-center">
          Crafted with passion by{' '}
          <a
            href="https://github.com/Troray/MyTab"
            target="_blank"
            rel="noreferrer"
            className={`transition-colors underline decoration-dotted underline-offset-2 ${isLight
                ? 'hover:text-black decoration-slate-400'
                : 'hover:text-white decoration-white/30'
              }`}
          >
            Troray
          </a>
        </div>

        <div className="w-1/3 text-right"></div>
      </footer>

      {/* Modals & Drawers (lazy-loaded) */}
      <Suspense fallback={null}>
        {isSiteModalOpen && (
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
        )}

        {isCustomizingColors && (
          <TextColorCustomizer
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onClose={() => {
              setIsCustomizingColors(false);
              setIsSettingsOpen(true);
            }}
          />
        )}

        {isSettingsOpen && (
          <SettingsDrawer
            isOpen={isSettingsOpen}
            appState={appState}
            onClose={() => setIsSettingsOpen(false)}
            onUpdateSettings={handleUpdateSettings}
            onUpdateWebdav={handleUpdateWebdav}
            onUpdateGit={handleUpdateGit}
            onStateReload={reloadState}
            onOpenColorCustomizer={() => {
              setIsSettingsOpen(false);
              setIsCustomizingColors(true);
            }}
          />
        )}

        {isFirstLaunch && (
          <OnboardingModal
            isOpen={isFirstLaunch}
            settings={settings}
            onFinish={handleFinishOnboarding}
            onOpenSettings={() => {
              handleFinishOnboarding();
              setIsSettingsOpen(true);
            }}
          />
        )}

        {/* Delete Site Shortcut Confirmation Modal */}
        {deletingSite && (
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
            isLight={isLight}
            onConfirm={confirmDeleteSite}
            onCancel={() => setDeletingSite(null)}
          />
        )}
      </Suspense>
    </div>
  );
};
