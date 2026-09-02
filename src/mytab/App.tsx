import React, { useState, useEffect, useCallback, useMemo, Suspense, lazy } from 'react';
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
 const isDark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
 
 if (isDark) {
 document.documentElement.classList.add('dark');
 document.documentElement.classList.remove('light');
 } else {
 document.documentElement.classList.add('light');
 document.documentElement.classList.remove('dark');
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
 } catch (e) {
 console.warn('[MyTab] Failed to cache background to localStorage:', e);
 }
 }, [backgroundStyle, currentSettings.mode]);

 if (!appState) {
 return null; // Return null instead of a jarring spinner to avoid white/black flashes on startup
 }

 const { sites, categories, settings, activeCategoryId, isFirstLaunch } = appState;

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

 }, [appState, sites, editingSite]);

 const handleDeleteSite = useCallback((siteId: string) => {
 const site = sites.find((s) => s.id === siteId);
 if (site) {
 setDeletingSite(site);
 }
 }, [sites]);

 const confirmDeleteSite = useCallback(async () => {
 if (!deletingSite) return;
 const siteId = deletingSite.id;
 const updatedSites = sites.filter((s) => s.id !== siteId);
 await saveSites(updatedSites);
 const nextState = { ...appState, sites: updatedSites };
 setAppState(nextState);
 setDeletingSite(null);
 }, [appState, sites, deletingSite]);

 const handleReorderSites = useCallback(async (reordered: SiteItem[]) => {
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
 }, [appState, sites, activeCategoryId]);

 // Handlers for Categories
 const handleAddCategory = async (data: { name: string; showInAll: boolean }) => {
 const newCat: Category = {
 id: `cat-${Date.now()}`,
 name: data.name,
 sortOrder: categories.length,
 showInAll: data.showInAll,
 };
 const updatedCats = [...categories, newCat];
 await saveCategories(updatedCats);
 const nextState = { ...appState, categories: updatedCats };
 setAppState(nextState);
 };

 const handleUpdateCategory = async (catId: string, updates: Partial<Category>) => {
 const updatedCats = categories.map((c) =>
 c.id === catId ? { ...c, ...updates } : c
 );
 await saveCategories(updatedCats);
 const nextState = { ...appState, categories: updatedCats };
 setAppState(nextState);
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
 };

 const handleSelectCategory = async (catId: string) => {
 await saveActiveCategory(catId);
 setAppState({ ...appState, activeCategoryId: catId });
 };

 // Handlers for Settings & WebDAV
 const handleUpdateSettings = (newSettings: ThemeSettings) => {
 const stampedSettings = { ...newSettings, updatedAt: Date.now() };
 const nextState = { ...appState, settings: stampedSettings };
 setAppState(nextState as AppState);
 saveSettings(stampedSettings).catch(e => console.error('[MyTab] Failed to save settings:', e));
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

 const isLight = settings.mode === 'light';

 return (
 <div
 style={backgroundStyle}
 className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden selection:bg-indigo-500 selection:text-white"
 >
 {/* Dynamic tint overlay for non-gradient wallpapers */}
 {settings.backgroundType !== 'gradient' && (
 <div
 className={`absolute inset-0 pointer-events-none z-0 transition-colors duration-300 ${
 isLight
 ? 'bg-white/20 '
 : 'bg-black/40 '
 }`}
 />
 )}

 {/* Top Floating Actions Bar */}
 <header className="relative z-10 w-full flex items-center justify-between p-5 md:px-8">
 <div className="flex items-center gap-2">
 <span
 className={`text-sm font-semibold tracking-wider px-3 py-1 rounded-full border transition-colors ${
 isLight
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
 className={`p-2.5 rounded-xl border shadow-sm transition-all duration-150 cursor-pointer active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-black/20 dark:focus-visible:ring-white/20 ${
 isLight
 ? 'bg-white/80 hover:bg-white text-slate-700 hover:text-black border-black/10 shadow-black/[0.02]'
 : 'bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border-white/10'
 }`}
 title="Add shortcut"
 >
 <Plus className="w-4.5 h-4.5" />
 </button>

 {/* Settings Button */}
 <button
 onClick={() => setIsSettingsOpen(true)}
 className={`p-2.5 rounded-xl border shadow-sm transition-all duration-150 cursor-pointer active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-black/20 dark:focus-visible:ring-white/20 ${
 isLight
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
 <ClockHeader settings={settings} />

 {/* Search Bar */}
 {(settings.showSearch ?? true) && (
 <SearchBar
 settings={settings}
 onEngineChange={(engineId) =>
 handleUpdateSettings({ ...settings, activeEngineId: engineId })
 }
 />
 )}

 {/* Category Tabs */}
 <CategoryTabs
 categories={categories}
 activeCategoryId={activeCategoryId}
 settings={settings}
 siteCounts={siteCounts}
 onSelectCategory={handleSelectCategory}
 onAddCategory={handleAddCategory}
 onUpdateCategory={handleUpdateCategory}
 onDeleteCategory={handleDeleteCategory}
 />

 {/* Sites Grid */}
 <SiteGrid
 sites={filteredSites}
 settings={settings}
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

 {/* Footer & Photo Attribution */}
 <footer
 className={`relative z-10 flex items-center justify-between px-6 py-3 text-[11px] select-none transition-colors ${
 isLight ? 'text-slate-600' : 'text-white/45'
 }`}
 >
 <div className="w-1/3 text-left">
 {settings.backgroundType === 'unsplash' && settings.unsplashAuthorName && (
 <span className="inline-flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity">
 <span>Photo by</span>
 <a
 href={settings.unsplashAuthorUrl || 'https://unsplash.com'}
 target="_blank"
 rel="noreferrer"
 className={`underline decoration-dotted underline-offset-2 ${isLight ? 'hover:text-black' : 'hover:text-white'}`}
 >
 {settings.unsplashAuthorName}
 </a>
 <span>on</span>
 <a
 href="https://unsplash.com/?utm_source=mytab&utm_medium=referral"
 target="_blank"
 rel="noreferrer"
 className={`underline decoration-dotted underline-offset-2 ${isLight ? 'hover:text-black' : 'hover:text-white'}`}
 >
 Unsplash
 </a>
 </span>
 )}
 </div>

 <div className="w-1/3 text-center">
 Powered by{' '}
 <a
 href="https://github.com/Troray/MyTab"
 target="_blank"
 rel="noreferrer"
 className={`transition-colors underline decoration-dotted underline-offset-2 ${
 isLight
 ? 'hover:text-black decoration-slate-400'
 : 'hover:text-white decoration-white/30'
 }`}
 >
 MyTab
 </a>{' '}
 • Made with ❤️ by{' '}
 <a
 href="https://github.com/Troray"
 target="_blank"
 rel="noreferrer"
 className={`transition-colors underline decoration-dotted underline-offset-2 ${
 isLight
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

 {isSettingsOpen && (
 <SettingsDrawer
 isOpen={isSettingsOpen}
 appState={appState}
 onClose={() => setIsSettingsOpen(false)}
 onUpdateSettings={handleUpdateSettings}
 onUpdateWebdav={handleUpdateWebdav}
 onUpdateGit={handleUpdateGit}
 onStateReload={reloadState}
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
