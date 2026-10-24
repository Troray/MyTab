import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  closestCorners,
  pointerWithin,
  rectIntersection,
  getFirstCollision,
  CollisionDetection,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Pencil, Trash2, ExternalLink, Globe, Home, Palette } from 'lucide-react';
import { Category, SiteItem, ThemeSettings } from '../../types';
import { ResolvedTextColors } from '../../utils/wallpaperAnalyzer';
import { generateFallbackIcon } from '../../services/metadata';
import { resolveSiteUrl, getCategoryDisplayName, getSiteDisplayName, getEffectiveIconBg, isColorDark } from '../../utils/constants';
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

/**
 * Floating drag preview rendered inside DragOverlay with elevated shadow and smooth cursor tracking
 */
const SiteCardPreview: React.FC<{
  site: SiteItem;
  category?: Category;
  settings: ThemeSettings;
  isLight: boolean;
  cardWidth: number;
  cardHeight: number;
  iconSize: number;
  titleFontSize: number;
  descFontSize: number;
  iconTextGap: number;
  showCardBg: boolean;
  cardOpacity: number;
  titleColor: string;
  descColor: string;
}> = ({
  site,
  category,
  settings,
  isLight,
  cardWidth,
  cardHeight,
  iconSize,
  titleFontSize,
  descFontSize,
  iconTextGap,
  showCardBg,
  cardOpacity,
  titleColor,
  descColor,
}) => {
  const effectiveBg = getEffectiveIconBg(site, settings, isLight, 'list');

  let cardBg = isLight
    ? `rgba(255, 255, 255, ${Math.min(0.98, cardOpacity + 0.6)})`
    : `rgba(30, 41, 59, 0.95)`;
  let cardBorder = isLight ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.20)';

  if (effectiveBg.type === 'white') {
    cardBg = '#ffffff';
    cardBorder = isLight ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.20)';
  } else if (effectiveBg.type === 'dark') {
    cardBg = '#0f172a';
    cardBorder = 'rgba(255, 255, 255, 0.20)';
  } else if (effectiveBg.type === 'custom') {
    cardBg = (effectiveBg.style.backgroundColor as string) || '#ffffff';
    cardBorder = isLight ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.25)';
  } else if (showCardBg && category?.color) {
    cardBg = hexToRgba(category.color, isLight ? 0.88 : 0.75);
    cardBorder = hexToRgba(category.color, 0.6);
  }

  const isCustomDark = effectiveBg.type === 'custom' && isColorDark(effectiveBg.style.backgroundColor as string);
  const isCustomLight = effectiveBg.type === 'custom' && !isCustomDark;

  const activeTitleColor =
    effectiveBg.type === 'white' || isCustomLight
      ? '#0f172a'
      : effectiveBg.type === 'dark' || isCustomDark
      ? '#ffffff'
      : titleColor;

  const activeDescColor =
    effectiveBg.type === 'white' || isCustomLight
      ? '#475569'
      : effectiveBg.type === 'dark' || isCustomDark
      ? '#94a3b8'
      : descColor;

  const showBadge = settings.showNetworkBadge !== false;
  const hasDualUrl = showBadge && Boolean(site.url && site.urlLan);
  const isOnlyLan = showBadge && !site.url && Boolean(site.urlLan);
  const isCurrentLan = settings.networkMode === 'lan';
  const activeUrl = resolveSiteUrl(site, settings.networkMode);

  return (
    <div
      style={{
        width: `${cardWidth}px`,
        height: `${cardHeight}px`,
        backgroundColor: cardBg,
        borderColor: cardBorder,
      }}
      className="relative flex items-center px-3.5 py-2 rounded-2xl border shadow-2xl ring-2 ring-blue-500 scale-105 cursor-grabbing overflow-hidden pointer-events-none z-[9999] backdrop-blur-md select-none"
    >
      <div
        style={{
          width: `${iconSize}px`,
          height: `${iconSize}px`,
          marginRight: `${iconTextGap}px`,
          ...(effectiveBg.type === 'white'
            ? { backgroundColor: '#f3f3f3' }
            : effectiveBg.type === 'dark'
            ? { backgroundColor: 'rgba(255,255,255,0.08)' }
            : effectiveBg.type === 'frosted'
            ? {}
            : effectiveBg.style),
        }}
        className="rounded-xl flex items-center justify-center overflow-hidden shrink-0 shadow-xs"
      >
        <img
          src={site.icon || generateFallbackIcon(site.title || site.url || site.urlLan || 'W')}
          alt=""
          className="w-full h-full object-contain p-1 rounded-lg"
        />
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center overflow-hidden">
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            style={{
              fontSize: `${titleFontSize}px`,
              color: activeTitleColor,
            }}
            className="font-semibold truncate tracking-tight leading-tight text-blue-500"
          >
            {getSiteDisplayName(site, settings.language)}
          </span>

          {hasDualUrl && (
            <span
              className={`shrink-0 px-1 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${
                isCurrentLan
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20'
              }`}
            >
              {isCurrentLan ? 'LAN' : 'WAN'}
            </span>
          )}

          {isOnlyLan && (
            <span className="shrink-0 px-1 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              LAN
            </span>
          )}
        </div>

        <span
          style={{
            fontSize: `${descFontSize}px`,
            color: activeDescColor,
          }}
          className="truncate block tracking-normal leading-snug mt-0.5"
        >
          {site.description || activeUrl.replace(/^https?:\/\//i, '')}
        </span>
      </div>
    </div>
  );
};

/**
 * Individual sortable site card in the grid with FLIP displacement animations
 */
const SortableSiteCard: React.FC<{
  site: SiteItem;
  category: Category;
  settings: ThemeSettings;
  isLight: boolean;
  cardWidth: number;
  cardHeight: number;
  iconSize: number;
  titleFontSize: number;
  descFontSize: number;
  iconTextGap: number;
  showCardBg: boolean;
  cardOpacity: number;
  titleColor: string;
  descColor: string;
  isFirst?: boolean;
  onCardClick: (site: SiteItem) => void;
  onSiteContextMenu: (e: React.MouseEvent, site: SiteItem) => void;
}> = React.memo(({
  site,
  category,
  settings,
  isLight,
  cardWidth,
  cardHeight,
  iconSize,
  titleFontSize,
  descFontSize,
  iconTextGap,
  showCardBg,
  cardOpacity,
  titleColor,
  descColor,
  isFirst,
  onCardClick,
  onSiteContextMenu,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: site.id,
    data: {
      type: 'site',
      site,
      categoryId: category.id,
    },
  });

  const effectiveBg = getEffectiveIconBg(site, settings, isLight, 'list');

  let cardBg = isLight
    ? `rgba(255, 255, 255, ${Math.min(0.95, cardOpacity + 0.5)})`
    : `rgba(255, 255, 255, ${cardOpacity})`;
  let cardBorder = isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.10)';
  let isBlur = true;

  if (effectiveBg.type === 'white') {
    cardBg = '#ffffff';
    cardBorder = isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.15)';
    isBlur = false;
  } else if (effectiveBg.type === 'dark') {
    cardBg = '#0f172a';
    cardBorder = 'rgba(255, 255, 255, 0.12)';
    isBlur = false;
  } else if (effectiveBg.type === 'transparent') {
    cardBg = 'transparent';
    cardBorder = 'transparent';
    isBlur = false;
  } else if (effectiveBg.type === 'custom') {
    cardBg = (effectiveBg.style.backgroundColor as string) || '#ffffff';
    cardBorder = isLight ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.20)';
    isBlur = false;
  } else if (showCardBg && category.color) {
    cardBg = isLight
      ? hexToRgba(category.color, Math.min(0.85, Math.max(0.12, cardOpacity + 0.05)))
      : hexToRgba(category.color, Math.min(0.65, Math.max(0.18, cardOpacity + 0.08)));
    cardBorder = hexToRgba(category.color, isLight ? 0.30 : 0.45);
  }

  const isCustomDark = effectiveBg.type === 'custom' && isColorDark(effectiveBg.style.backgroundColor as string);
  const isCustomLight = effectiveBg.type === 'custom' && !isCustomDark;

  const activeTitleColor =
    effectiveBg.type === 'white' || isCustomLight
      ? '#0f172a'
      : effectiveBg.type === 'dark' || isCustomDark
      ? '#ffffff'
      : titleColor;

  const activeDescColor =
    effectiveBg.type === 'white' || isCustomLight
      ? '#475569'
      : effectiveBg.type === 'dark' || isCustomDark
      ? '#94a3b8'
      : descColor;

  const showBadge = settings.showNetworkBadge !== false;
  const hasDualUrl = showBadge && Boolean(site.url && site.urlLan);
  const isOnlyLan = showBadge && !site.url && Boolean(site.urlLan);
  const isCurrentLan = settings.networkMode === 'lan';
  const activeUrl = resolveSiteUrl(site, settings.networkMode);

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition: transition || undefined,
    height: `${cardHeight}px`,
    minHeight: `${cardHeight}px`,
    maxHeight: `${cardHeight}px`,
    backgroundColor: showCardBg ? cardBg : 'transparent',
    borderColor: showCardBg ? cardBorder : 'transparent',
    opacity: isDragging ? 0.3 : 1,
    touchAction: 'none',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      data-tour={isFirst ? 'list-item' : undefined}
      onClick={() => onCardClick(site)}
      onContextMenu={(e) => onSiteContextMenu(e, site)}
      data-tooltip={settings.listShowTooltip !== false && site.description?.trim() ? site.description : undefined}
      className={`group/card relative flex items-center px-3.5 py-2 rounded-2xl border cursor-pointer active:scale-[0.98] overflow-hidden select-none ${
        isDragging
          ? 'opacity-30 shadow-none'
          : !showCardBg
          ? isLight
            ? 'border-transparent hover:bg-black/[0.04]'
            : 'border-transparent hover:bg-white/[0.08]'
          : isBlur
          ? isLight
            ? 'shadow-sm shadow-black/[0.03] hover:shadow-md hover:shadow-black/[0.06] hover:brightness-[1.03] backdrop-blur-md'
            : 'shadow-sm shadow-black/20 hover:shadow-lg hover:shadow-black/40 hover:brightness-110 backdrop-blur-md'
          : effectiveBg.type === 'white'
          ? 'shadow-sm shadow-black/[0.06] hover:shadow-md hover:border-black/15 bg-white'
          : 'shadow-sm hover:shadow-md'
      }`}
    >
      {/* Icon Container (starts directly at the left without 6-dot grip) */}
      <div
        style={{
          width: `${iconSize}px`,
          height: `${iconSize}px`,
          marginRight: `${iconTextGap}px`,
          ...(effectiveBg.type === 'white'
            ? { backgroundColor: '#f3f3f3' }
            : effectiveBg.type === 'dark'
            ? { backgroundColor: 'rgba(255,255,255,0.08)' }
            : effectiveBg.type === 'frosted'
            ? {}
            : effectiveBg.style),
        }}
        className={`rounded-xl flex items-center justify-center overflow-hidden shrink-0 transition-transform duration-200 group-hover/card:scale-105 pointer-events-none ${
          effectiveBg.type === 'white'
            ? 'bg-slate-100 border border-black/[0.06] shadow-xs'
            : effectiveBg.type === 'dark'
            ? 'bg-white/10 border border-white/10 shadow-xs'
            : effectiveBg.type === 'frosted'
            ? isLight ? 'bg-black/[0.03] border border-black/5' : 'bg-white/10 border border-white/10'
            : effectiveBg.className
        }`}
      >
        <img
          src={site.icon || generateFallbackIcon(site.title || site.url || site.urlLan || 'W')}
          alt=""
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
      <div className="flex-1 min-w-0 flex flex-col justify-center overflow-hidden select-none pointer-events-none">
        {/* Title Row with optional LAN / WAN badge */}
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            style={{
              fontSize: `${titleFontSize}px`,
              color: activeTitleColor,
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

        {/* Description / Remarks Row */}
        <span
          style={{
            fontSize: `${descFontSize}px`,
            color: activeDescColor,
          }}
          className="truncate block tracking-normal leading-snug mt-0.5"
        >
          {site.description || activeUrl.replace(/^https?:\/\//i, '')}
        </span>
      </div>
    </div>
  );
});

/**
 * Droppable empty category placeholder allowing dragging items directly into an empty category
 */
const EmptyCategoryDroppable: React.FC<{
  categoryId: string;
  settings: ThemeSettings;
  isLight: boolean;
  onAddSiteToCategory: (categoryId: string) => void;
}> = ({ categoryId, settings, isLight, onAddSiteToCategory }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `empty-${categoryId}`,
    data: {
      type: 'empty-category',
      categoryId,
    },
  });

  return (
    <div
      ref={setNodeRef}
      onClick={() => onAddSiteToCategory(categoryId)}
      className={`w-full py-5 px-4 rounded-2xl border-2 border-dashed flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 select-none ${
        isOver
          ? 'border-blue-500 bg-blue-500/10 text-blue-500 scale-[1.01]'
          : isLight
          ? 'border-black/10 hover:border-black/25 text-slate-400 hover:text-slate-600 bg-black/[0.01]'
          : 'border-white/10 hover:border-white/25 text-white/40 hover:text-white/70 bg-white/[0.02]'
      }`}
    >
      <Plus className="w-4 h-4" />
      <span className="text-xs font-medium">{t('addSiteToCategory', settings.language)}</span>
    </div>
  );
};

/**
 * Droppable section wrapper for each category
 */
const CategorySectionWrapper: React.FC<{
  category: Category;
  children: React.ReactNode;
}> = ({ category, children }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `category-${category.id}`,
    data: {
      type: 'category',
      categoryId: category.id,
    },
  });

  return (
    <section
      ref={setNodeRef}
      className={`space-y-3 rounded-2xl transition-all duration-200 ${
        isOver ? 'ring-2 ring-blue-500/40 p-2 -m-2 bg-blue-500/[0.03]' : ''
      }`}
    >
      {children}
    </section>
  );
};

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

  // Group sites by category, sorting categories by sortOrder
  const { listCategories, initialSitesByCategory } = useMemo(() => {
    const validCategories = categories
      .filter((c) => c.id !== 'all')
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder);

    const map: Record<string, SiteItem[]> = {};
    validCategories.forEach((c) => {
      map[c.id] = [];
    });
    const uncategorized: SiteItem[] = [];

    sites.forEach((site) => {
      if (site.categoryId && map[site.categoryId]) {
        map[site.categoryId].push(site);
      } else {
        uncategorized.push(site);
      }
    });

    // Sort sites within each category by sortOrder
    Object.keys(map).forEach((catId) => {
      map[catId].sort((a, b) => a.sortOrder - b.sortOrder);
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
      map['uncategorized'] = uncategorized;
    }

    return {
      listCategories: resultCategories,
      initialSitesByCategory: map,
    };
  }, [categories, sites, settings.language]);

  // Live multi-container items state for seamless, real-time drag animations
  const [items, setItems] = useState<Record<string, SiteItem[]>>(initialSitesByCategory);
  const [activeId, setActiveId] = useState<string | null>(null);

  const isDraggingRef = useRef(false);
  const isInternalUpdateRef = useRef(false);
  const prevSitesPropRef = useRef(sites);
  const prevCategoriesPropRef = useRef(categories);

  // Keep items synchronized with external props ONLY when props actually change externally and we are not dragging
  useEffect(() => {
    if (sites !== prevSitesPropRef.current || categories !== prevCategoriesPropRef.current) {
      prevSitesPropRef.current = sites;
      prevCategoriesPropRef.current = categories;
      if (isInternalUpdateRef.current) {
        // Internal drag reorder already updated items state; skip reset to avoid any DOM flicker
        isInternalUpdateRef.current = false;
        return;
      }
      if (!isDraggingRef.current) {
        setItems(initialSitesByCategory);
      }
    }
  }, [sites, categories, initialSitesByCategory]);

  const dragEndedAtRef = useRef<number>(0);
  const initialItemsRef = useRef<Record<string, SiteItem[]> | null>(null);
  const sourceContainerRef = useRef<string | null>(null);

  // Helper to find which container contains a given item or container ID
  const findContainer = useCallback((id: string, currentItems: Record<string, SiteItem[]>): string | null => {
    if (id in currentItems) return id;
    const stripped = id.replace(/^(category-|empty-)/, '');
    if (stripped in currentItems) return stripped;
    for (const [catId, catSites] of Object.entries(currentItems)) {
      if (catSites.some((s) => s.id === id)) {
        return catId;
      }
    }
    return null;
  }, []);

  // Multi-container collision detection: detects containers and nearest items seamlessly
  const collisionDetectionStrategy: CollisionDetection = useCallback(
    (args) => {
      // First, check pointer collisions
      const pointerIntersections = pointerWithin(args);
      const intersections =
        pointerIntersections.length > 0
          ? pointerIntersections
          : rectIntersection(args);
      const overId = getFirstCollision(intersections, 'id');

      if (overId != null) {
        const containerKey = String(overId).replace(/^(category-|empty-)/, '');
        if (containerKey in items) {
          const containerItems = items[containerKey];
          if (containerItems.length > 0) {
            const closest = closestCorners({
              ...args,
              droppableContainers: args.droppableContainers.filter(
                (container) =>
                  container.id !== overId &&
                  containerItems.some((item) => item.id === container.id)
              ),
            });
            if (closest.length > 0) {
              return closest;
            }
          }
        }
        return intersections;
      }

      return closestCorners(args);
    },
    [items]
  );

  // Pointer sensor with 5px distance activation constraint
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // Close context menu on click outside
  useEffect(() => {
    if (!contextMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    const handleScroll = () => setContextMenu(null);
    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [contextMenu]);

  // Active site and category for DragOverlay
  const activeSite = useMemo(() => {
    if (!activeId) return null;
    for (const catSites of Object.values(items)) {
      const found = catSites.find((s) => s.id === activeId);
      if (found) return found;
    }
    return null;
  }, [activeId, items]);

  const activeCategory = useMemo(() => {
    if (!activeSite) return undefined;
    const catId = activeSite.categoryId || 'uncategorized';
    return listCategories.find((c) => c.id === catId);
  }, [activeSite, listCategories]);

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
  const showCardBg = settings.listShowCardBackground !== false;
  const cardOpacity = settings.listCardOpacity ?? 0.25;

  // Resolved text colors
  const categoryColor = resolvedColors?.listCategory || resolvedColors?.tabs || (isLight ? '#0f172a' : '#ffffff');
  const titleColor = resolvedColors?.listTitle || (isLight ? '#1e293b' : '#f8fafc');
  const descColor = resolvedColors?.listDesc || (isLight ? '#64748b' : 'rgba(255, 255, 255, 0.65)');

  // Context menu trigger
  const handleSiteContextMenu = useCallback((e: React.MouseEvent, site: SiteItem) => {
    e.preventDefault();
    e.stopPropagation();
    const menuWidth = 220;
    const menuHeight = 220;
    const x = Math.min(e.clientX, window.innerWidth - menuWidth - 8);
    const y = Math.min(e.clientY, window.innerHeight - menuHeight - 8);
    setContextMenu({ site, x, y });
  }, []);

  // Card click handler (guarded against accidental clicks right after dragging)
  const handleCardClick = useCallback((site: SiteItem) => {
    if (Date.now() - dragEndedAtRef.current < 250) return;
    const targetUrl = resolveSiteUrl(site, settings.networkMode);
    if (!targetUrl) return;
    onOpenSite(targetUrl);
  }, [settings.networkMode, onOpenSite]);

  // Drag and Drop handlers
  const handleDragStart = useCallback((event: DragStartEvent) => {
    isDraggingRef.current = true;
    const activeSiteId = String(event.active.id);
    setActiveId(activeSiteId);
    initialItemsRef.current = items;
    sourceContainerRef.current = findContainer(activeSiteId, items);
  }, [items, findContainer]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeSiteId = String(active.id);
    const overTargetId = String(over.id);

    if (activeSiteId === overTargetId) return;

    const activeContainer = findContainer(activeSiteId, items);
    const overContainer = findContainer(overTargetId, items);

    if (!activeContainer || !overContainer) return;

    if (activeContainer !== overContainer) {
      // Cross-container live move: moves the item into the target container in real-time
      setItems((prev) => {
        const activeItems = prev[activeContainer] || [];
        const overItems = prev[overContainer] || [];

        const activeIndex = activeItems.findIndex((s) => s.id === activeSiteId);
        const activeSiteObj = activeItems[activeIndex];
        if (!activeSiteObj) return prev;

        const overIndex = overItems.findIndex((s) => s.id === overTargetId);
        let newIndex = overItems.length;
        if (overIndex !== -1) {
          newIndex = overIndex;
        }

        const updatedSite: SiteItem = {
          ...activeSiteObj,
          categoryId: overContainer === 'uncategorized' ? '' : overContainer,
        };

        return {
          ...prev,
          [activeContainer]: activeItems.filter((s) => s.id !== activeSiteId),
          [overContainer]: [
            ...overItems.slice(0, newIndex),
            updatedSite,
            ...overItems.slice(newIndex),
          ],
        };
      });
    } else {
      // Same-container live reorder: moves the item to the new slot in real-time so drop animation drops exactly into the slot
      setItems((prev) => {
        const catSites = prev[activeContainer] || [];
        const activeIndex = catSites.findIndex((s) => s.id === activeSiteId);
        const overIndex = catSites.findIndex((s) => s.id === overTargetId);

        if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
          return {
            ...prev,
            [activeContainer]: arrayMove(catSites, activeIndex, overIndex),
          };
        }
        return prev;
      });
    }
  }, [items, findContainer]);

  const handleDragCancel = useCallback(() => {
    isDraggingRef.current = false;
    setActiveId(null);
    dragEndedAtRef.current = Date.now();
    if (initialItemsRef.current) {
      setItems(initialItemsRef.current);
    }
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    isDraggingRef.current = false;
    setActiveId(null);
    dragEndedAtRef.current = Date.now();

    if (!over || !onReorderSites) {
      if (initialItemsRef.current) {
        setItems(initialItemsRef.current);
      }
      return;
    }

    const activeSiteId = String(active.id);
    const finalContainer = findContainer(activeSiteId, items);
    const sourceContainer = sourceContainerRef.current;

    if (!finalContainer || !sourceContainer) return;

    isInternalUpdateRef.current = true;

    if (sourceContainer === finalContainer) {
      // In-category reorder: only update the affected category
      const catSites = items[finalContainer] || [];
      const updated = catSites.map((s, idx) => ({
        ...s,
        sortOrder: idx,
        updatedAt: Date.now(),
      }));
      onReorderSites(updated);
    } else {
      // Cross-category move: update both source and destination categories
      const sourceSites = (items[sourceContainer] || []).map((s, idx) => ({
        ...s,
        sortOrder: idx,
        updatedAt: Date.now(),
      }));
      const destSites = (items[finalContainer] || []).map((s, idx) => ({
        ...s,
        categoryId: finalContainer === 'uncategorized' ? '' : finalContainer,
        sortOrder: idx,
        updatedAt: Date.now(),
      }));
      onReorderSites([...sourceSites, ...destSites]);
    }
  }, [items, findContainer, onReorderSites]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetectionStrategy}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="w-full max-w-7xl mx-auto px-6 py-4 space-y-8 animate-fade-in select-none">
        {listCategories.map((category, catIdx) => {
          const catSites = items[category.id] || [];

          return (
            <CategorySectionWrapper key={category.id} category={category}>
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
                      onPointerDown={(e) => e.stopPropagation()}
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
                  onPointerDown={(e) => e.stopPropagation()}
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

              {/* Sites Grid / Droppable Area */}
              {catSites.length === 0 ? (
                <EmptyCategoryDroppable
                  categoryId={category.id}
                  settings={settings}
                  isLight={isLight}
                  onAddSiteToCategory={onAddSiteToCategory}
                />
              ) : (
                <SortableContext
                  id={category.id}
                  items={catSites.map((s) => s.id)}
                  strategy={rectSortingStrategy}
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: `repeat(auto-fill, minmax(${cardWidth}px, 1fr))`,
                      gap: `${gapY}px ${gapX}px`,
                    }}
                  >
                    {catSites.map((site, siteIdx) => (
                      <SortableSiteCard
                        key={site.id}
                        site={site}
                        category={category}
                        settings={settings}
                        isLight={isLight}
                        isFirst={catIdx === 0 && siteIdx === 0}
                        cardWidth={cardWidth}
                        cardHeight={cardHeight}
                        iconSize={iconSize}
                        titleFontSize={titleFontSize}
                        descFontSize={descFontSize}
                        iconTextGap={iconTextGap}
                        showCardBg={showCardBg}
                        cardOpacity={cardOpacity}
                        titleColor={titleColor}
                        descColor={descColor}
                        onCardClick={handleCardClick}
                        onSiteContextMenu={handleSiteContextMenu}
                      />
                    ))}
                  </div>
                </SortableContext>
              )}
            </CategorySectionWrapper>
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
              onPointerDown={(e) => e.stopPropagation()}
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
            siteCount={modalCategory ? (items[modalCategory.id]?.length || 0) : 0}
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

      {/* Floating Drag Overlay Preview */}
      <DragOverlay dropAnimation={null}>
        {activeSite ? (
          <SiteCardPreview
            site={activeSite}
            category={activeCategory}
            settings={settings}
            isLight={isLight}
            cardWidth={cardWidth}
            cardHeight={cardHeight}
            iconSize={iconSize}
            titleFontSize={titleFontSize}
            descFontSize={descFontSize}
            iconTextGap={iconTextGap}
            showCardBg={showCardBg}
            cardOpacity={cardOpacity}
            titleColor={titleColor}
            descColor={descColor}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
});
