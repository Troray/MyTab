import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Pencil, Trash2, ExternalLink, Globe, Home, GripVertical, Palette } from 'lucide-react';
import { Category, SiteItem, ThemeSettings } from '../../types';
import { ResolvedTextColors } from '../../utils/wallpaperAnalyzer';
import { generateFallbackIcon } from '../../services/metadata';
import { resolveSiteUrl, getCategoryDisplayName, getSiteDisplayName } from '../../utils/constants';
import { t } from '../../utils/i18n';
import { CategoryModal } from './CategoryModal';

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return hex;
}

interface CategoryListProps {
  categories: Category[];
  sites: SiteItem[];
  settings: ThemeSettings;
  resolvedColors?: ResolvedTextColors;
  isLight?: boolean;
  onOpenSite: (url: string) => void;
  onEditSite: (site: SiteItem) => void;
  onDeleteSite: (siteId: string) => void;
  onAddSiteToCategory: (categoryId: string) => void;
  onAddCategory?: (data: { name: string; showInAll: boolean; color?: string; pageId?: string }) => void;
  onUpdateCategory?: (id: string, updates: Partial<Category>) => void;
  onDeleteCategory?: (id: string, deleteSites?: boolean) => void;
  onReorderSites?: (reorderedSites: SiteItem[]) => void;
}

interface ContextMenuState {
  site: SiteItem;
  x: number;
  y: number;
}

export const CategoryList: React.FC<CategoryListProps> = React.memo(({
  categories,
  sites,
  settings,
  resolvedColors,
  isLight: propsIsLight,
  onOpenSite,
  onEditSite,
  onDeleteSite,
  onAddSiteToCategory,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onReorderSites,
}) => {
  const [modalCategory, setModalCategory] = useState<Category | null | undefined>(undefined);

  const handleSaveCategory = useCallback(
    (catId: string | null, data: { name: string; showInAll: boolean; color?: string; pageId?: string }) => {
      if (catId) {
        onUpdateCategory?.(catId, data);
      } else {
        onAddCategory?.(data);
      }
      setModalCategory(undefined);
    },
    [onUpdateCategory, onAddCategory]
  );
  const isLight =
    propsIsLight !== undefined
      ? propsIsLight
      : settings.mode === 'light' ||
        (settings.mode === 'system' &&
          typeof window !== 'undefined' &&
          !window.matchMedia('(prefers-color-scheme: dark)').matches);

  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // Drag and Drop state
  const [draggingSiteId, setDraggingSiteId] = useState<string | null>(null);
  const [dragOverCategoryId, setDragOverCategoryId] = useState<string | null>(null);
  const [dropTargetSiteId, setDropTargetSiteId] = useState<string | null>(null);

  // Close context menu on click outside
  useEffect(() => {
    if (!contextMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', () => setContextMenu(null), true);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, [contextMenu]);

  // Group sites by category, sorting categories by sortOrder
  const { listCategories, sitesByCategory } = useMemo(() => {
    const validCategories = categories
      .filter((c) => c.id !== 'all')
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder);

    const map = new Map<string, SiteItem[]>();
    validCategories.forEach((c) => map.set(c.id, []));
    const uncategorized: SiteItem[] = [];

    sites.forEach((site) => {
      if (site.categoryId && map.has(site.categoryId)) {
        map.get(site.categoryId)!.push(site);
      } else {
        uncategorized.push(site);
      }
    });

    // Sort sites within each category by sortOrder
    map.forEach((catSites) => {
      catSites.sort((a, b) => a.sortOrder - b.sortOrder);
    });
    uncategorized.sort((a, b) => a.sortOrder - b.sortOrder);

    const resultCategories = [...validCategories];
    if (uncategorized.length > 0) {
      resultCategories.push({
        id: 'uncategorized',
        name: t('uncategorized', settings.language),
        sortOrder: 999999,
        isDefault: false,
      });
      map.set('uncategorized', uncategorized);
    }

    return {
      listCategories: resultCategories,
      sitesByCategory: map,
    };
  }, [categories, sites, settings.language]);

  // Per-mode size and spacing settings
  const cardWidth = settings.listCardWidth || 200;
  const cardHeight = settings.listCardHeight || 50;
  const iconSize = settings.listIconSize || 40;
  const titleFontSize = settings.listTitleFontSize || 16;
  const descFontSize = settings.listDescFontSize || 14;
  const categoryFontSize = settings.listCategoryFontSize || 18;
  const gapX = settings.listGapX ?? 10;
  const gapY = settings.listGapY ?? 12;
  const iconTextGap = settings.listIconTextGap ?? 10;
  const showCardBg = Boolean(settings.listShowCardBackground);
  const cardOpacity = settings.listCardOpacity ?? 0.25;

  // Resolved text colors
  const categoryColor = resolvedColors?.listCategory || resolvedColors?.tabs || (isLight ? '#0f172a' : '#ffffff');
  const titleColor = resolvedColors?.listTitle || (isLight ? '#1e293b' : '#f8fafc');
  const descColor = resolvedColors?.listDesc || (isLight ? '#64748b' : 'rgba(255, 255, 255, 0.65)');

  // Context menu trigger
  const handleSiteContextMenu = (e: React.MouseEvent, site: SiteItem) => {
    e.preventDefault();
    e.stopPropagation();
    const menuWidth = 220;
    const menuHeight = 220;
    const x = Math.min(e.clientX, window.innerWidth - menuWidth - 8);
    const y = Math.min(e.clientY, window.innerHeight - menuHeight - 8);
    setContextMenu({ site, x, y });
  };

  // Card click handler
  const handleCardClick = (site: SiteItem) => {
    const targetUrl = resolveSiteUrl(site, settings.networkMode);
    if (!targetUrl) return;
    onOpenSite(targetUrl);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, site: SiteItem) => {
    setDraggingSiteId(site.id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', site.id);
  };

  const handleDragOver = (e: React.DragEvent, targetCategoryId: string, targetSiteId?: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCategoryId(targetCategoryId);
    if (targetSiteId) {
      setDropTargetSiteId(targetSiteId);
    }
  };

  const handleDrop = (e: React.DragEvent, targetCategoryId: string, targetSiteId?: string) => {
    e.preventDefault();
    if (!draggingSiteId || !onReorderSites) {
      setDraggingSiteId(null);
      setDragOverCategoryId(null);
      setDropTargetSiteId(null);
      return;
    }

    const draggedSite = sites.find((s) => s.id === draggingSiteId);
    if (!draggedSite) return;

    const remainingSites = sites.filter((s) => s.id !== draggingSiteId);
    const targetCatSites = remainingSites.filter((s) => s.categoryId === targetCategoryId);

    let insertIndex = targetCatSites.length;
    if (targetSiteId) {
      const idx = targetCatSites.findIndex((s) => s.id === targetSiteId);
      if (idx !== -1) insertIndex = idx;
    }

    const updatedDraggedSite: SiteItem = {
      ...draggedSite,
      categoryId: targetCategoryId === 'uncategorized' ? '' : targetCategoryId,
    };

    targetCatSites.splice(insertIndex, 0, updatedDraggedSite);

    // Reassign sortOrder within target category
    const otherSites = remainingSites.filter((s) => s.categoryId !== targetCategoryId);
    const reorderedTargetSites = targetCatSites.map((site, idx) => ({
      ...site,
      sortOrder: idx,
    }));

    onReorderSites([...otherSites, ...reorderedTargetSites]);

    setDraggingSiteId(null);
    setDragOverCategoryId(null);
    setDropTargetSiteId(null);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-4 space-y-8 animate-fade-in select-none">
      {listCategories.map((category) => {
        const catSites = sitesByCategory.get(category.id) || [];

        return (
          <section
            key={category.id}
            className="space-y-3"
            onDragOver={(e) => handleDragOver(e, category.id)}
            onDrop={(e) => handleDrop(e, category.id)}
          >
            {/* Category Header */}
            <div className="flex items-center justify-between group/cat-header">
              <div className="flex items-center gap-2">
                <span
                  style={{
                    fontSize: `${categoryFontSize}px`,
                    color: categoryColor,
                  }}
                  className="font-bold tracking-tight select-none"
                >
                  {getCategoryDisplayName(category, settings.language)}
                </span>
                <span
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                    isLight ? 'bg-black/5 text-slate-500' : 'bg-white/10 text-white/50'
                  }`}
                >
                  {catSites.length}
                </span>

                {/* Edit Category (color & name) Button */}
                {category.id !== 'all' && category.id !== 'uncategorized' && onUpdateCategory && (
                  <button
                    type="button"
                    onClick={() => setModalCategory(category)}
                    className={`opacity-0 group-hover/cat-header:opacity-100 p-1.5 rounded-lg transition-all duration-150 cursor-pointer active:scale-95 flex items-center gap-1 text-xs font-medium ${
                      isLight
                        ? 'text-slate-600 hover:text-black hover:bg-black/5'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                    aria-label={t('editCategory', settings.language)}
                  >
                    <Palette className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{t('editCategory', settings.language)}</span>
                  </button>
                )}
              </div>

              {/* Quick Add site to this category button */}
              <button
                type="button"
                onClick={() => onAddSiteToCategory(category.id)}
                className={`opacity-0 group-hover/cat-header:opacity-100 p-1.5 rounded-lg transition-all duration-150 cursor-pointer active:scale-95 flex items-center gap-1 text-xs font-medium ${
                  isLight
                    ? 'text-slate-600 hover:text-black hover:bg-black/5'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
                aria-label={t('addSiteToCategory', settings.language)}
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('addSite', settings.language)}</span>
              </button>
            </div>

            {/* Sites Grid / Flex Flow */}
            {catSites.length === 0 ? (
              <div
                onClick={() => onAddSiteToCategory(category.id)}
                className={`w-full py-4 px-4 rounded-2xl border border-dashed flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                  isLight
                    ? 'border-black/10 hover:border-black/25 text-slate-400 hover:text-slate-600 bg-black/[0.01]'
                    : 'border-white/10 hover:border-white/25 text-white/40 hover:text-white/70 bg-white/[0.02]'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span className="text-xs font-medium">{t('addSiteToCategory', settings.language)}</span>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(auto-fill, minmax(${cardWidth}px, 1fr))`,
                  gap: `${gapY}px ${gapX}px`,
                }}
              >
                {catSites.map((site) => {
                  const hasDualUrl = Boolean(site.url && site.urlLan);
                  const isOnlyLan = !site.url && Boolean(site.urlLan);
                  const isCurrentLan = settings.networkMode === 'lan';
                  const activeUrl = resolveSiteUrl(site, settings.networkMode);
                  const isBeingDragged = draggingSiteId === site.id;

                  // Card background & border tinting based on category.color
                  let cardBg = isLight
                    ? `rgba(255, 255, 255, ${Math.min(0.95, cardOpacity + 0.5)})`
                    : `rgba(255, 255, 255, ${cardOpacity})`;
                  let cardBorder = isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.10)';

                  if (showCardBg && category.color) {
                    cardBg = isLight
                      ? hexToRgba(category.color, Math.min(0.85, Math.max(0.12, cardOpacity + 0.05)))
                      : hexToRgba(category.color, Math.min(0.65, Math.max(0.18, cardOpacity + 0.08)));
                    cardBorder = hexToRgba(category.color, isLight ? 0.30 : 0.45);
                  }

                  return (
                    <div
                      key={site.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, site)}
                      onDragOver={(e) => handleDragOver(e, category.id, site.id)}
                      onDrop={(e) => handleDrop(e, category.id, site.id)}
                      onClick={() => handleCardClick(site)}
                      onContextMenu={(e) => handleSiteContextMenu(e, site)}
                      data-tooltip={site.description?.trim() ? site.description : undefined}
                      style={{
                        minHeight: `${cardHeight}px`,
                        backgroundColor: showCardBg ? cardBg : 'transparent',
                        borderColor: showCardBg ? cardBorder : 'transparent',
                      }}
                      className={`group/card relative flex items-center px-3.5 py-2 rounded-2xl border transition-all duration-200 cursor-pointer active:scale-[0.98] ${
                        isBeingDragged ? 'opacity-30' : 'opacity-100'
                      } ${
                        !showCardBg
                          ? isLight
                            ? 'border-transparent hover:bg-black/[0.04]'
                            : 'border-transparent hover:bg-white/[0.08]'
                          : isLight
                          ? 'shadow-sm shadow-black/[0.03] hover:shadow-md hover:shadow-black/[0.06] hover:brightness-[1.03] backdrop-blur-md'
                          : 'shadow-sm shadow-black/20 hover:shadow-lg hover:shadow-black/40 hover:brightness-110 backdrop-blur-md'
                      }`}
                    >
                      {/* Icon Container */}
                      <div
                        style={{
                          width: `${iconSize}px`,
                          height: `${iconSize}px`,
                          marginRight: `${iconTextGap}px`,
                        }}
                        className={`rounded-xl flex items-center justify-center overflow-hidden shrink-0 transition-transform duration-200 group-hover/card:scale-105 ${
                          isLight
                            ? 'bg-black/[0.03] border border-black/5'
                            : 'bg-white/10 border border-white/10'
                        }`}
                      >
                        <img
                          src={site.icon || generateFallbackIcon(site.title || site.url || site.urlLan || 'W')}
                          alt=""
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain p-1 rounded-lg pointer-events-none"
                          onError={(e) => {
                            (e.target as HTMLElement).setAttribute(
                              'src',
                              generateFallbackIcon(site.title || site.url || site.urlLan || 'W')
                            );
                          }}
                        />
                      </div>

                      {/* Right Text Block: Title + Description / Remarks */}
                      <div className="flex-1 min-w-0 flex flex-col justify-center select-none">
                        {/* Title Row with optional LAN / WAN badge */}
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            style={{
                              fontSize: `${titleFontSize}px`,
                              color: titleColor,
                            }}
                            className="font-semibold truncate tracking-tight leading-tight group-hover/card:text-blue-500 transition-colors"
                          >
                            {getSiteDisplayName(site, settings.language)}
                          </span>

                          {/* Dual URL indicator badge */}
                          {hasDualUrl && (
                            <span
                              className={`shrink-0 px-1 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${
                                isCurrentLan
                                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                  : 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                              }`}
                              aria-label={
                                isCurrentLan
                                  ? `${t('networkModeLan', settings.language)}: ${site.urlLan}`
                                  : `${t('networkModeWan', settings.language)}: ${site.url}`
                              }
                            >
                              {isCurrentLan ? 'LAN' : 'WAN'}
                            </span>
                          )}

                          {/* LAN-only indicator badge */}
                          {isOnlyLan && (
                            <span
                              className="shrink-0 px-1 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              aria-label={`${t('networkModeLan', settings.language)}: ${site.urlLan}`}
                            >
                              LAN
                            </span>
                          )}
                        </div>

                        {/* Description / Remarks Row: allows auto-wrap up to 2 lines and clean truncation */}
                        <span
                          style={{
                            fontSize: `${descFontSize}px`,
                            color: descColor,
                          }}
                          className="line-clamp-2 break-all tracking-normal leading-snug mt-0.5"
                        >
                          {site.description || activeUrl.replace(/^https?:\/\//i, '')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}

      {/* Empty State when zero categories exist */}
      {listCategories.length === 0 && (
        <div className="py-20 text-center text-sm opacity-50 select-none">
          {t('emptyCategorySites', settings.language)}
        </div>
      )}

      {/* Add Category Button at bottom of List View */}
      {onAddCategory && (
        <div className="pt-2 pb-6 flex justify-center">
          <button
            type="button"
            onClick={() => setModalCategory(null)}
            className={`px-4 py-2.5 rounded-2xl border border-dashed flex items-center gap-2 text-xs font-medium cursor-pointer transition-all duration-200 active:scale-95 ${
              isLight
                ? 'border-black/15 text-slate-500 hover:text-slate-800 hover:border-black/30 hover:bg-white/50'
                : 'border-white/15 text-white/50 hover:text-white hover:border-white/30 hover:bg-white/[0.06]'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>{t('addCategory', settings.language)}</span>
          </button>
        </div>
      )}

      {/* Category Modal for editing color/name or creating new category */}
      {modalCategory !== undefined && (
        <CategoryModal
          isOpen={true}
          category={modalCategory}
          settings={settings}
          onClose={() => setModalCategory(undefined)}
          onSave={handleSaveCategory}
          onDelete={onDeleteCategory}
          siteCount={modalCategory ? (sitesByCategory.get(modalCategory.id)?.length || 0) : 0}
        />
      )}

      {/* Custom Context Menu */}
      {contextMenu && typeof document !== 'undefined' && createPortal(
        <div
          ref={contextMenuRef}
          onClick={(e) => e.stopPropagation()}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          style={{
            top: `${contextMenu.y}px`,
            left: `${contextMenu.x}px`,
          }}
          className={`glass-dropdown fixed min-w-[190px] max-w-[240px] py-1.5 rounded-2xl border shadow-2xl z-[9999] animate-scale-in text-xs font-medium overflow-hidden select-none ${
            isLight
              ? 'border-black/10 shadow-black/15 text-slate-800 bg-white/95'
              : 'border-white/15 shadow-black/60 text-white bg-slate-900/95'
          }`}
        >
          {/* Open in new tab (default URL) */}
          <button
            type="button"
            onClick={() => {
              const url = resolveSiteUrl(contextMenu.site, settings.networkMode);
              setContextMenu(null);
              window.open(url, '_blank', 'noopener,noreferrer');
            }}
            className={`flex items-center gap-2.5 w-full px-3.5 py-2 text-left transition-colors cursor-pointer ${
              isLight
                ? 'text-slate-700 hover:bg-black/5 hover:text-slate-900'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-70" />
            <span>{t('openInNewTab', settings.language)}</span>
          </button>

          {/* Open WAN URL option (if LAN exists) */}
          {contextMenu.site.url && (
            <button
              type="button"
              onClick={() => {
                setContextMenu(null);
                window.open(contextMenu.site.url, '_blank', 'noopener,noreferrer');
              }}
              className={`flex items-center gap-2.5 w-full px-3.5 py-2 text-left transition-colors cursor-pointer ${
                isLight
                  ? 'text-slate-700 hover:bg-black/5 hover:text-slate-900'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5 shrink-0 text-blue-500" />
              <span className="truncate">{t('openWanUrl', settings.language)}</span>
            </button>
          )}

          {/* Open LAN URL option */}
          {contextMenu.site.urlLan && (
            <button
              type="button"
              onClick={() => {
                setContextMenu(null);
                window.open(contextMenu.site.urlLan, '_blank', 'noopener,noreferrer');
              }}
              className={`flex items-center gap-2.5 w-full px-3.5 py-2 text-left transition-colors cursor-pointer ${
                isLight
                  ? 'text-slate-700 hover:bg-black/5 hover:text-slate-900'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Home className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
              <span className="truncate">{t('openLanUrl', settings.language)}</span>
            </button>
          )}

          <div className={`my-1 border-t ${isLight ? 'border-black/5' : 'border-white/10'}`} />

          {/* Edit Site */}
          <button
            type="button"
            onClick={() => {
              const target = contextMenu.site;
              setContextMenu(null);
              onEditSite(target);
            }}
            className={`flex items-center gap-2.5 w-full px-3.5 py-2 text-left transition-colors cursor-pointer ${
              isLight
                ? 'text-slate-700 hover:bg-black/5 hover:text-slate-900'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Pencil className="w-3.5 h-3.5 shrink-0 opacity-70" />
            <span>{t('editSite', settings.language)}</span>
          </button>

          {/* Delete Site */}
          <button
            type="button"
            onClick={() => {
              const siteId = contextMenu.site.id;
              setContextMenu(null);
              onDeleteSite(siteId);
            }}
            className="flex items-center gap-2.5 w-full px-3.5 py-2 text-left text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 shrink-0" />
            <span>{t('deleteSite', settings.language)}</span>
          </button>
        </div>,
        document.body
      )}
    </div>
  );
});
