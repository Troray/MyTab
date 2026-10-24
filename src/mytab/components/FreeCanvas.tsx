import React, { useState, useEffect, useLayoutEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Check, Layers, RotateCcw, Sparkles, Pin, Folder, FolderPlus, Pencil, Trash2, Maximize2, ChevronDown } from 'lucide-react';
import { GridStack } from 'gridstack';
import 'gridstack/dist/gridstack.min.css';
import { SiteItem, Category, ThemeSettings, GridPage, FreeCanvasLayoutMap, FreeWidgetType } from '../../types';
import { ResolvedTextColors } from '../../utils/wallpaperAnalyzer';
import { ClockWidget } from './widgets/ClockWidget';
import { DateWidget } from './widgets/DateWidget';
import { LunarWidget } from './widgets/LunarWidget';
import { GreetingWidget } from './widgets/GreetingWidget';
import { SearchWidget } from './widgets/SearchWidget';
import { CategoryPillWidget } from './widgets/CategoryPillWidget';
import { SiteCard } from './SiteCard';
import { CategoryModal } from './CategoryModal';
import { ConfirmModal } from './ConfirmModal';
import { GridPageIndicator } from './GridPageIndicator';
import { t } from '../../utils/i18n';
import { isLightMode } from '../../utils/constants';

interface FreeCanvasProps {
  sites: SiteItem[];
  categories: Category[];
  settings: ThemeSettings;
  resolvedColors?: ResolvedTextColors;
  isLight?: boolean;
  gridPages?: GridPage[];
  activeGridPageId?: string;
  isEditing: boolean;
  freeLayouts?: Record<string, FreeCanvasLayoutMap>;
  onUpdateLayouts: (pageId: string, map: FreeCanvasLayoutMap) => void;
  onUpdateSettings: (settings: Partial<ThemeSettings>) => void;
  onToggleEditing: () => void;
  onOpenSite: (url: string) => void;
  onEditSite: (site: SiteItem) => void;
  onDeleteSite: (siteId: string) => void;
  onMoveSiteToPage?: (siteId: string, targetPageId: string) => void;
  onAddSite: () => void;
  onSelectPage?: (pageId: string) => void;
  onAddPage?: (name?: string) => void;
  onRenamePage?: (pageId: string, newName: string) => void;
  onDeletePage?: (pageId: string) => void;
  onEngineChange: (engineId: string) => void;
  activeCategoryId?: string;
  siteCounts?: Record<string, number>;
  onSelectCategory?: (id: string) => void;
  onAddCategory?: (data: { name: string; showInAll: boolean; color?: string; pageId?: string }) => void;
  onUpdateCategory?: (id: string, updates: Partial<Category>) => void;
  onDeleteCategory?: (id: string, deleteSites?: boolean) => void;
  onMoveCategoryToPage?: (categoryId: string, targetPageId: string) => void;
  onAddSiteToCategory?: (categoryId: string) => void;
  onOpenBookmarkImport?: () => void;
}

/**
 * Invariant Desktop Canvas Baseline:
 * 1440px width divided across 60 columns gives strictly 24px per column and 22px cell height.
 * Eliminates rubber-band stretching or shrinking when the browser window is resized or halved.
 */
const CANVAS_BASE_WIDTH = 1440;
const CANVAS_BASE_CELL_HEIGHT = 22;

interface GridItemPortalProps {
  grid: GridStack | null;
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  noResize?: boolean;
  children: React.ReactNode;
}

/**
 * Safely extracts nodes from GridStack instance, returning empty array
 * if the grid is null, destroyed, or engine is not initialized.
 */
const getSafeGridNodes = (gs: any): any[] => {
  if (!gs || !gs.engine || !Array.isArray(gs.engine.nodes)) return [];
  return gs.engine.nodes;
};

/**
 * GridItemPortal renders an isolated GridStack widget using createPortal.
 * Uses GridStack's native DOM element creation (addWidget) and projects
 * React widget children into the .grid-stack-item-content container via createPortal.
 * This guarantees zero interference between React's VDOM and GridStack's DOM transforms.
 */
const GridItemPortal: React.FC<GridItemPortalProps> = React.memo(({
  grid,
  id,
  x,
  y,
  w,
  h,
  minW = 1,
  minH = 1,
  noResize = false,
  children,
}) => {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    if (!grid || !grid.el || !grid.engine || !Array.isArray((grid.engine as any)?.nodes)) return;

    let node = getSafeGridNodes(grid).find((n: any) => n.id === id);
    let el = node?.el;

    if (!el) {
      el = grid.addWidget({
        id,
        x,
        y,
        w,
        h,
        minW,
        minH,
        noResize,
        autoPosition: false,
      });
    } else {
      grid.update(el, { minW, minH, noResize });
    }

    const content = (el?.querySelector('.grid-stack-item-content') as HTMLElement | null) || null;
    if (content) {
      setContainer(content);
    }

    return () => {
      if (grid && grid.el && grid.engine && Array.isArray((grid.engine as any)?.nodes) && el) {
        try {
          grid.removeWidget(el, true, false);
        } catch {
          // widget already removed
        }
      }
    };
  }, [grid, id]);

  // Synchronize external coordinate and dimension changes (e.g. from Settings reset to default)
  useLayoutEffect(() => {
    if (!grid || !grid.el || !grid.engine || !Array.isArray((grid.engine as any)?.nodes)) return;
    const node = getSafeGridNodes(grid).find((n: any) => n.id === id);
    if (!node || !node.el) return;
    if ((node as any)._moving || (node as any)._resizing) return;
    if (node.x !== x || node.y !== y || node.w !== w || node.h !== h) {
      grid.update(node.el, { x, y, w, h });
    }
  }, [grid, id, x, y, w, h]);

  if (!container || !grid) return null;
  return createPortal(children, container);
});

GridItemPortal.displayName = 'GridItemPortal';

/**
 * Configure GridStack engine collision avoidance and overlap handling.
 * - When allowOverlap is true: Bypasses all collision detection so widgets can overlap freely without cascading.
 * - When allowOverlap is false: Pushes down colliding widgets with at least 1-row gap to maintain comfortable spacing.
 */
const applyEngineCollisionMode = (engine: any, allowOverlap: boolean) => {
  if (!engine) return;
  if (!engine._originalCollide) {
    engine._originalCollide = engine.collide;
    engine._originalCollideAll = engine.collideAll;
    engine._originalFixCollisions = engine._fixCollisions;
    engine._originalPackNodes = engine._packNodes;
  }

  if (allowOverlap) {
    engine.collide = () => undefined;
    engine.collideAll = () => [];
    engine._fixCollisions = () => false;
    engine._packNodes = function () {
      return this;
    };
  } else {
    engine.collide = engine._originalCollide;
    engine.collideAll = engine._originalCollideAll;
    engine._packNodes = engine._originalPackNodes;
    engine._fixCollisions = function (node: any, nn = node, collide: any, opt: any = {}) {
      this.sortNodes(-1);
      collide = collide || this.collide(node, nn);
      if (!collide) return false;

      let area = nn;
      if (!this._loading && this._useEntireRowArea(node, nn)) {
        area = { x: 0, w: this.column, y: nn.y, h: nn.h };
        collide = this.collide(node, area, opt.skip);
      }
      let didMove = false;
      const newOpt = { nested: true, pack: false };
      let counter = 0;
      while ((collide = collide || this.collide(node, area, opt.skip))) {
        if (counter++ > this.nodes.length * 2) {
          return didMove;
        }
        let moved;
        if (collide.locked || this._loading) {
          const newNN = { ...nn, y: collide.y + collide.h + 1, ...newOpt };
          moved = this._loading && (node.x === newNN.x && node.y === newNN.y) ? true : this.moveNode(node, newNN);
          if (moved) didMove = true;
        } else {
          // Push down with at least 1-row gap (+1) so items maintain breathing room
          moved = this.moveNode(collide, { ...collide, y: nn.y + nn.h + 1, skip: node, ...newOpt });
          if (moved) didMove = true;
        }
        if (!moved) return didMove;
        collide = undefined;
      }
      return didMove;
    };
  }
};

export const FreeCanvas: React.FC<FreeCanvasProps> = React.memo(({
  sites,
  categories,
  settings,
  resolvedColors,
  isLight: propsIsLight,
  gridPages,
  activeGridPageId,
  isEditing,
  freeLayouts = {},
  onUpdateLayouts,
  onUpdateSettings,
  onToggleEditing,
  onOpenSite,
  onEditSite,
  onDeleteSite,
  onMoveSiteToPage,
  onAddSite,
  onSelectPage,
  onAddPage,
  onRenamePage,
  onDeletePage,
  onEngineChange,
  activeCategoryId,
  siteCounts = {},
  onSelectCategory,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onMoveCategoryToPage,
  onAddSiteToCategory,
  onOpenBookmarkImport,
}) => {
  const isLight =
    propsIsLight !== undefined
      ? propsIsLight
      : isLightMode(settings.mode);

  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<GridStack | null>(null);
  const [gridInfo, setGridInfo] = useState<{ pageId: string; grid: GridStack } | null>(null);
  const [isBarHovered, setIsBarHovered] = useState(false);
  const [isBarPinned, setIsBarPinned] = useState(false);
  const barHoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleBarMouseEnter = useCallback(() => {
    if (barHoverTimeoutRef.current) {
      clearTimeout(barHoverTimeoutRef.current);
      barHoverTimeoutRef.current = null;
    }
    setIsBarHovered(true);
  }, []);

  const handleBarMouseLeave = useCallback(() => {
    if (barHoverTimeoutRef.current) {
      clearTimeout(barHoverTimeoutRef.current);
    }
    barHoverTimeoutRef.current = setTimeout(() => {
      setIsBarHovered(false);
      barHoverTimeoutRef.current = null;
    }, 250);
  }, []);

  useEffect(() => {
    return () => {
      if (barHoverTimeoutRef.current) {
        clearTimeout(barHoverTimeoutRef.current);
      }
    };
  }, []);

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Category Modal state: undefined = closed, null = add category, Category = edit category
  const [modalCategory, setModalCategory] = useState<Category | null | undefined>(undefined);
  // Context menu on category pill
  const [contextMenuCat, setContextMenuCat] = useState<{ category: Category; x: number; y: number } | null>(null);
  const [confirmDeleteCat, setConfirmDeleteCat] = useState<Category | null>(null);
  const [deleteCategorySites, setDeleteCategorySites] = useState(false);

  // Card Size Preset Dropdown state in Floating Toolbar
  const [sizeMenuOpen, setSizeMenuOpen] = useState(false);
  const sizeMenuContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sizeMenuOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        sizeMenuContainerRef.current &&
        !sizeMenuContainerRef.current.contains(target)
      ) {
        setSizeMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSizeMenuOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [sizeMenuOpen]);

  // Active category selection
  const [selectedCatId, setSelectedCatId] = useState<string>(activeCategoryId || 'all');

  useEffect(() => {
    if (activeCategoryId) {
      setSelectedCatId(activeCategoryId);
    }
  }, [activeCategoryId]);

  const defaultPageId = gridPages?.[0]?.id || 'page-1';
  const currentPageId = activeGridPageId || defaultPageId;
  const grid = gridInfo?.pageId === currentPageId ? gridInfo.grid : null;

  // Track desktop slide direction for silky-smooth animation between desktops
  const prevPageIdRef = useRef<string>(currentPageId);
  const slideClassRef = useRef<string>('');
  const [activeAnimClass, setActiveAnimClass] = useState<string>('');

  if (prevPageIdRef.current !== currentPageId) {
    const prevIdx = gridPages?.findIndex((p) => p.id === prevPageIdRef.current) ?? -1;
    const currIdx = gridPages?.findIndex((p) => p.id === currentPageId) ?? -1;
    slideClassRef.current =
      prevIdx !== -1 && currIdx !== -1 && currIdx < prevIdx
        ? 'animate-desktop-slide-left'
        : 'animate-desktop-slide-right';
    prevPageIdRef.current = currentPageId;
  }

  useEffect(() => {
    if (slideClassRef.current) {
      setActiveAnimClass(slideClassRef.current);
      const timer = setTimeout(() => {
        setActiveAnimClass('');
        slideClassRef.current = '';
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [currentPageId]);

  // Filter sites belonging to the active desktop page
  const pageSites = useMemo(() => {
    return sites.filter((s) => (s.pageId || defaultPageId) === currentPageId);
  }, [sites, defaultPageId, currentPageId]);

  // Categories belonging to current desktop page
  const pageCategories = useMemo(() => {
    return categories
      .filter((c) => (c.pageId || defaultPageId) === currentPageId && c.id !== 'all')
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [categories, defaultPageId, currentPageId]);

  // Uncategorized sites detection
  const uncategorizedSites = useMemo(() => {
    const knownCatIds = new Set(pageCategories.map((c) => c.id));
    return pageSites.filter((s) => !knownCatIds.has(s.categoryId));
  }, [pageSites, pageCategories]);

  // All category pills for current desktop page
  const categoryPills = useMemo(() => {
    const hiddenInAllCatIds = new Set(
      categories.filter((c) => c.showInAll === false).map((c) => c.id)
    );
    const allVisibleCount = pageSites.filter((s) => !hiddenInAllCatIds.has(s.categoryId)).length;

    const allPill: Category = {
      id: 'all',
      name: t('allCategories', settings.language),
      nameKey: 'allCategories',
      sortOrder: -1,
      isDefault: true,
    };

    const list: Array<{ category: Category; count: number }> = [
      { category: allPill, count: allVisibleCount },
    ];

    pageCategories.forEach((cat) => {
      const count = pageSites.filter((s) => s.categoryId === cat.id).length;
      list.push({ category: cat, count });
    });

    if (uncategorizedSites.length > 0) {
      const uncategorizedCat: Category = {
        id: 'uncategorized',
        name: t('uncategorized', settings.language),
        sortOrder: 9999,
        isDefault: true,
      };
      list.push({ category: uncategorizedCat, count: uncategorizedSites.length });
    }

    return list;
  }, [categories, pageCategories, pageSites, uncategorizedSites, settings.language]);

  const showCategories = settings.showCategories ?? false;

  // Compute 60-column default layout for current page
  const computeDefaults = useCallback((): FreeCanvasLayoutMap => {
    const map: FreeCanvasLayoutMap = {};

    // 1. Clock (default: 24 cols, 6 rows, centered: x=18, y=1, matching ClockHeader font size)
    if (settings.showClock ?? true) {
      map['sys-clock'] = {
        id: 'sys-clock',
        type: 'clock',
        x: 18,
        y: 1,
        w: 24,
        h: 6,
      };
    }

    // 2. Date & Lunar
    const showDate = settings.showDate ?? true;
    const showLunar = settings.showLunar ?? true;

    if (showDate && showLunar) {
      map['sys-date'] = {
        id: 'sys-date',
        type: 'date',
        x: 21,
        y: 8,
        w: 10,
        h: 2,
      };
      map['sys-lunar'] = {
        id: 'sys-lunar',
        type: 'lunar',
        x: 31,
        y: 8,
        w: 8,
        h: 2,
      };
    } else if (showDate) {
      map['sys-date'] = {
        id: 'sys-date',
        type: 'date',
        x: 24,
        y: 8,
        w: 12,
        h: 2,
      };
    } else if (showLunar) {
      map['sys-lunar'] = {
        id: 'sys-lunar',
        type: 'lunar',
        x: 25,
        y: 8,
        w: 10,
        h: 2,
      };
    }

    // 3. Greeting
    if (settings.showGreeting ?? true) {
      map['sys-greeting'] = {
        id: 'sys-greeting',
        type: 'greeting',
        x: 21,
        y: 10,
        w: 18,
        h: 2,
      };
    }

    // 4. Search Bar (starts at y=13, 1 row gap below greeting which ends at 12)
    if (settings.showSearch ?? true) {
      map['sys-search'] = {
        id: 'sys-search',
        type: 'search',
        x: 18,
        y: 13,
        w: 24,
        h: 2,
      };
    }

    // 5. Category Pills: Each category is an INDEPENDENT draggable pill widget!
    // Row gap between search bar and categories: starts at y=16 if search is shown (search ends at 15)
    if (showCategories) {
      const currentPixelWidth = containerRef.current?.offsetWidth || (typeof window !== 'undefined' ? window.innerWidth : 1440);
      const pillWidth = 5;
      const pillsPerRow = currentPixelWidth < 900 ? 5 : currentPixelWidth < 1200 ? 7 : 9;
      const catPillY = (settings.showSearch ?? true) ? 16 : 13;

      categoryPills.forEach((item, idx) => {
        const key = `cat-pill-${item.category.id}`;
        const row = Math.floor(idx / pillsPerRow);
        const col = idx % pillsPerRow;
        const itemsInThisRow = Math.min(pillsPerRow, categoryPills.length - row * pillsPerRow);
        const rowWidth = itemsInThisRow * pillWidth + (itemsInThisRow - 1) * 1;
        const rowStartX = Math.max(2, Math.floor((60 - rowWidth) / 2));

        map[key] = {
          id: key,
          type: 'category-pill',
          x: Math.min(55, rowStartX + col * (pillWidth + 1)),
          y: catPillY + row * 2,
          w: pillWidth,
          h: 2,
        };
      });

      // Site cards start 1 row below the bottom of all category pill rows
      const totalPillRows = Math.max(1, Math.ceil(categoryPills.length / pillsPerRow));
      const catPillsBottom = catPillY + totalPillRows * 2;
      const siteStartY = catPillsBottom + 1; // 1 row gap below category pills

      const currentColPixelW = Math.max(8, currentPixelWidth / 60);
      const adaptedColW = Math.max(2, Math.min(60, Math.round(96 / currentColPixelW)));
      const colGap = 1;
      const defaultCardsPerRow = Math.max(1, Math.min(8, Math.floor((60 - 2) / (adaptedColW + colGap))));
      const totalWidth = defaultCardsPerRow * adaptedColW + (defaultCardsPerRow - 1) * colGap;
      const defaultStartX = Math.max(1, Math.floor((60 - totalWidth) / 2));

      pageSites.forEach((site, idx) => {
        const col = idx % defaultCardsPerRow;
        const row = Math.floor(idx / defaultCardsPerRow);
        map[`site-${site.id}`] = {
          id: `site-${site.id}`,
          type: 'site',
          x: Math.min(60 - adaptedColW, defaultStartX + col * (adaptedColW + colGap)),
          y: siteStartY + row * 6,
          w: adaptedColW,
          h: 5,
        };
      });
    } else {
      // Default: Clean free canvas with individual site cards starting at row 16 (1 row gap below search)
      const currentPixelWidth = containerRef.current?.offsetWidth || (typeof window !== 'undefined' ? window.innerWidth : 1440);
      const siteStartY = (settings.showSearch ?? true) ? 16 : 13;

      const currentColPixelW = Math.max(8, currentPixelWidth / 60);
      const adaptedColW = Math.max(2, Math.min(60, Math.round(96 / currentColPixelW)));
      const colGap = 1;
      const defaultCardsPerRow = Math.max(1, Math.min(8, Math.floor((60 - 2) / (adaptedColW + colGap))));
      const totalWidth = defaultCardsPerRow * adaptedColW + (defaultCardsPerRow - 1) * colGap;
      const defaultStartX = Math.max(1, Math.floor((60 - totalWidth) / 2));

      pageSites.forEach((site, idx) => {
        const col = idx % defaultCardsPerRow;
        const row = Math.floor(idx / defaultCardsPerRow);
        map[`site-${site.id}`] = {
          id: `site-${site.id}`,
          type: 'site',
          x: Math.min(60 - adaptedColW, defaultStartX + col * (adaptedColW + colGap)),
          y: siteStartY + row * 6,
          w: adaptedColW,
          h: 5,
        };
      });
    }

    return map;
  }, [
    settings.showClock,
    settings.showDate,
    settings.showLunar,
    settings.showGreeting,
    settings.showSearch,
    showCategories,
    categoryPills,
    pageSites,
  ]);

  // Read stored map and validate against 60-column range
  const activeLayoutMap = useMemo(() => {
    const rawStored = freeLayouts[currentPageId];
    const defaults = computeDefaults();

    if (!rawStored || Object.keys(rawStored).length === 0) {
      return defaults;
    }

    // Clone to maintain immutability of props
    const stored: FreeCanvasLayoutMap = { ...rawStored };

    const merged: FreeCanvasLayoutMap = {};
    const validSiteKeys = new Set(pageSites.map((s) => `site-${s.id}`));
    const validPillKeys = new Set(categoryPills.map((p) => `cat-pill-${p.category.id}`));

    // 1. Populate defaults first with fallback, strictly preserving user-saved item if valid
    Object.keys(defaults).forEach((key) => {
      const item = stored[key];
      if (
        item &&
        typeof item.x === 'number' &&
        typeof item.y === 'number' &&
        typeof item.w === 'number' &&
        typeof item.h === 'number' &&
        item.x >= 0 &&
        item.x < 60 &&
        item.w > 0
      ) {
        // Valid user saved layout: keep exactly what the user saved on this desktop!
        const safeW = Math.min(item.w, 60 - item.x);
        merged[key] = safeW === item.w ? item : { ...item, w: safeW };
      } else {
        merged[key] = defaults[key];
      }
    });

    // 2. Also include any user-stored items that exist in stored (site cards, category pills)
    Object.keys(stored).forEach((key) => {
      if (key.startsWith('site-')) {
        if (!validSiteKeys.has(key)) return;
      } else if (key.startsWith('cat-pill-')) {
        if (!validPillKeys.has(key)) return;
      }
      if (!merged[key]) {
        const item = stored[key];
        if (
          item &&
          typeof item.x === 'number' &&
          typeof item.y === 'number' &&
          typeof item.w === 'number' &&
          typeof item.h === 'number' &&
          item.x >= 0 &&
          item.x < 60 &&
          item.w > 0
        ) {
          const safeW = Math.min(item.w, 60 - item.x);
          merged[key] = safeW === item.w ? item : { ...item, w: safeW };
        }
      }
    });

    return merged;
  }, [freeLayouts, currentPageId, computeDefaults, pageSites, categoryPills]);

  // Sites to render on canvas: filtered by selectedCatId if categories are enabled
  const visibleSites = useMemo(() => {
    if (!showCategories || selectedCatId === 'all') {
      const hiddenInAllCatIds = new Set(
        categories.filter((c) => c.showInAll === false).map((c) => c.id)
      );
      return pageSites.filter((s) => !hiddenInAllCatIds.has(s.categoryId));
    }
    if (selectedCatId === 'uncategorized') {
      return uncategorizedSites;
    }
    return pageSites.filter((s) => s.categoryId === selectedCatId);
  }, [pageSites, showCategories, selectedCatId, categories, uncategorizedSites]);

  // Dynamic collision avoidance toggle (Allow Overlap switch)
  const allowOverlap = settings.freeLayoutAllowOverlap ?? true;
  const allowOverlapRef = useRef(allowOverlap);
  allowOverlapRef.current = allowOverlap;

  // Stable refs for values used inside event listeners to prevent unnecessary listener rebinding
  const freeLayoutsRef = useRef(freeLayouts);
  freeLayoutsRef.current = freeLayouts;

  const isLightRef = useRef(isLight);
  isLightRef.current = isLight;

  const languageRef = useRef(settings.language);
  languageRef.current = settings.language;

  // Realtime resizing HUD ref & timer
  const resizeHudRef = useRef<HTMLDivElement>(null);
  const hudTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resizeSnapshotRef = useRef<{
    nodeId: string;
    initialH: number;
    initialBottom: number;
    nodesBelow: Array<{ id: string; el: HTMLElement; initialY: number }>;
  } | null>(null);

  // Synchronously flush all current desktop node positions to storage and state
  const flushSaveRef = useRef<(pageId: string) => void>(() => {});

  const flushSave = useCallback(
    (pageId: string) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
      const gs = gridRef.current;
      if (!gs || !gs.engine) return;
      const nodes = getSafeGridNodes(gs);
      if (nodes.length === 0) return;

      const newMap: FreeCanvasLayoutMap = {};
      const currentSites = sites.filter((s) => (s.pageId || defaultPageId) === pageId);
      const currentCategories = categories.filter((c) => (c.pageId || defaultPageId) === pageId && c.id !== 'all');
      const validSiteKeys = new Set(currentSites.map((s) => `site-${s.id}`));
      const validPillKeys = new Set(currentCategories.map((c) => `cat-pill-${c.id}`));

      nodes.forEach((n) => {
        if (!n.id) return;
        if (n.id.startsWith('site-') && !validSiteKeys.has(n.id)) return;
        if (n.id.startsWith('cat-pill-') && !validPillKeys.has(n.id)) return;

        const widgetType: FreeWidgetType = n.id.startsWith('site-')
          ? 'site'
          : n.id.startsWith('cat-pill-')
          ? 'category-pill'
          : (n.id.replace('sys-', '') as any);

        newMap[n.id] = {
          id: n.id,
          type: widgetType,
          x: n.x ?? 0,
          y: n.y ?? 0,
          w: n.w ?? 4,
          h: n.h ?? 2,
        };
      });

      const prevStored = freeLayoutsRef.current[pageId] || {};
      const cleanedPrev: FreeCanvasLayoutMap = {};
      Object.keys(prevStored).forEach((key) => {
        if (key.startsWith('site-') && !validSiteKeys.has(key)) return;
        if (key.startsWith('cat-pill-') && !validPillKeys.has(key)) return;
        cleanedPrev[key] = prevStored[key];
      });
      const mergedMap = { ...cleanedPrev, ...newMap };
      onUpdateLayouts(pageId, mergedMap);
    },
    [sites, categories, defaultPageId, onUpdateLayouts]
  );

  flushSaveRef.current = flushSave;

  // Initialize GridStack V14 instance on mount / page change
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Clean any orphaned DOM children from previous mounts / React StrictMode cycles
    Array.from(el.children).forEach((child) => {
      if (child.classList.contains('grid-stack-item') && !(child as any).gridstackNode) {
        child.remove();
      }
    });

    const options = {
      mode: 'float' as const,
      column: 60,
      cellHeight: CANVAS_BASE_CELL_HEIGHT,
      margin: 4,
      minRow: 40,
      auto: false, // CRITICAL: prevent GridStack from auto-scanning existing DOM elements and triggering unwanted collision shifts
      animate: true,
      disableOneColumnMode: true,
      float: true,
      resizable: {
        handles: 'se',
        autoHide: true,
      },
      draggable: {
        handle: '.grid-stack-item-content',
        scroll: false,
        appendTo: 'parent',
      },
    };

    const gs = GridStack.init(options, el);
    if (!gs) return;

    // CRITICAL: Apply collision mode immediately on init before any child GridItemPortal calls addWidget
    applyEngineCollisionMode(gs.engine, allowOverlapRef.current);

    gridRef.current = gs;
    setGridInfo({ pageId: currentPageId, grid: gs });

    return () => {
      // Synchronously flush layout of currentPageId BEFORE destroying grid engine!
      flushSaveRef.current(currentPageId);
      try {
        gs.destroy(false);
      } catch {
        // already cleaned up
      }
      gridRef.current = null;
      setGridInfo(null);
    };
  }, [currentPageId]);

  // Sync editing mode with GridStack static mode & DOM classes
  useLayoutEffect(() => {
    if (!grid) return;
    grid.setStatic(!isEditing);

    if (containerRef.current) {
      if (isEditing) {
        containerRef.current.classList.add('grid-stack-editing');
      } else {
        containerRef.current.classList.remove('grid-stack-editing');
      }
    }
  }, [grid, isEditing]);

  // Sync dynamic collision avoidance mode changes on active grid
  useLayoutEffect(() => {
    if (!grid) return;
    applyEngineCollisionMode(grid.engine, allowOverlap);
  }, [grid, allowOverlap]);

  // Debounced listener to persist layout changes on drag / resize + Realtime Size HUD
  useEffect(() => {
    if (!grid) return;

    const resizeHud = resizeHudRef.current;

    const updateResizeHud = (el: HTMLElement) => {
      if (!resizeHud) return;
      const node = (el as any)._gridstackNode;
      if (!node) return;

      const rect = el.getBoundingClientRect();
      const pxW = Math.round(rect.width);
      const pxH = Math.round(rect.height);
      const w = node.w ?? 4;
      const h = node.h ?? 2;
      const lang = languageRef.current;

      let typeTag = '';
      if (node.id?.startsWith('site-')) {
        const isWide = pxW >= 130 && pxW / Math.max(1, pxH) >= 1.25;
        const isTall = !isWide && pxH >= 125 && pxH / Math.max(1, pxW) >= 1.3;
        const isLarge = !isWide && !isTall && pxW >= 115 && pxH >= 105;
        typeTag = isWide
          ? ` · ${t('cardShapeBanner', lang)}`
          : isTall
          ? ` · ${t('cardShapeTall', lang)}`
          : isLarge
          ? ` · ${t('cardPresetLarge', lang)}`
          : ` · ${t('cardShapeStandard', lang)}`;
      }

      const accentColor = isLightRef.current ? '#f59e0b' : '#fbbf24';
      resizeHud.innerHTML = `
        <span style="color: ${accentColor}; font-weight: 700;">${w} × ${h}</span>
        <span style="opacity: 0.75; font-size: 11px; margin-left: 6px;">${pxW}×${pxH}px</span>
        ${typeTag ? `<span style="opacity: 0.85; font-size: 10px; margin-left: 6px; padding: 1px 6px; border-radius: 9999px; background: rgba(255,255,255,0.15);">${typeTag}</span>` : ''}
      `;

      resizeHud.style.display = 'flex';
      resizeHud.style.opacity = '1';
      const hudWidth = 190;
      const left = Math.min(window.innerWidth - hudWidth - 16, Math.max(16, rect.left + rect.width / 2 - hudWidth / 2));
      const top = rect.top > 60 ? rect.top - 38 : rect.bottom + 8;
      resizeHud.style.left = `${left}px`;
      resizeHud.style.top = `${top}px`;
    };

    const handleResizeStart = (_e: Event, el: HTMLElement) => {
      if (hudTimerRef.current) clearTimeout(hudTimerRef.current);
      updateResizeHud(el);

      if (!allowOverlapRef.current && grid) {
        const node = (el as any)._gridstackNode;
        if (node) {
          const initialH = node.h ?? 1;
          const initialBottom = (node.y ?? 0) + initialH;
          const nodesBelow: Array<{ id: string; el: HTMLElement; initialY: number }> = [];

          getSafeGridNodes(grid).forEach((n) => {
            if (n.id && n.id !== node.id && n.el && (n.y ?? 0) >= initialBottom) {
              nodesBelow.push({ id: n.id, el: n.el, initialY: n.y ?? 0 });
            }
          });

          // Sort in descending order of initialY so lower elements move first to prevent cascading collisions
          nodesBelow.sort((a, b) => b.initialY - a.initialY);

          resizeSnapshotRef.current = {
            nodeId: node.id,
            initialH,
            initialBottom,
            nodesBelow,
          };
        }
      }
    };

    const handleResize = (_e: Event, el: HTMLElement) => {
      updateResizeHud(el);

      const snapshot = resizeSnapshotRef.current;
      if (snapshot && !allowOverlapRef.current && grid) {
        const node = (el as any)._gridstackNode;
        if (node && node.id === snapshot.nodeId) {
          const currentH = node.h ?? snapshot.initialH;
          const deltaH = currentH - snapshot.initialH;
          const currentBottom = (node.y ?? 0) + currentH;

          snapshot.nodesBelow.forEach(({ el: nodeEl, initialY }) => {
            // Keep at least 1-row gap if node was initially placed below with a gap
            const minAllowedY = currentBottom + (initialY > snapshot.initialBottom ? 1 : 0);
            const targetY = Math.max(minAllowedY, initialY + deltaH);
            const currentNode = (nodeEl as any)._gridstackNode;
            if (currentNode && currentNode.y !== targetY) {
              grid.update(nodeEl, { y: targetY });
            }
          });
        }
      }
    };

    const handleResizeStop = (_e: Event, el: HTMLElement) => {
      updateResizeHud(el);
      resizeSnapshotRef.current = null;
      if (hudTimerRef.current) clearTimeout(hudTimerRef.current);
      hudTimerRef.current = setTimeout(() => {
        if (resizeHud) {
          resizeHud.style.opacity = '0';
          setTimeout(() => {
            if (resizeHud) resizeHud.style.display = 'none';
          }, 150);
        }
      }, 600);
    };

    grid.on('resizestart', handleResizeStart);
    grid.on('resize', handleResize);

    const debouncedSave = (e: Event, el: HTMLElement) => {
      handleResizeStop(e, el);
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => flushSaveRef.current(currentPageId), 150);
    };

    grid.on('dragstop resizestop', debouncedSave);

    return () => {
      grid.off('resizestart');
      grid.off('resize');
      grid.off('dragstop resizestop');
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
        flushSaveRef.current(currentPageId);
      }
      if (hudTimerRef.current) clearTimeout(hudTimerRef.current);
    };
  }, [grid, currentPageId]);

  // Flush pending save and exit editing mode
  const handleDoneEditing = useCallback(() => {
    flushSave(currentPageId);
    onToggleEditing();
  }, [currentPageId, flushSave, onToggleEditing]);

  // Batch Apply Preset Size to all site cards on current desktop
  const handleApplySizeToAll = useCallback(
    (targetW: number, targetH: number) => {
      if (!grid || !grid.engine) return;

      const safeW = Math.min(60, Math.max(1, targetW));
      const safeH = Math.max(1, targetH);

      // Determine dynamic startY below all system widgets and category pills
      let maxBottom = 0;
      let hasNonSite = false;
      getSafeGridNodes(grid).forEach((n) => {
        if (!n.id?.startsWith('site-')) {
          hasNonSite = true;
          const bottom = (n.y ?? 0) + (n.h ?? 0);
          if (bottom > maxBottom) {
            maxBottom = bottom;
          }
        }
      });
      const startY = hasNonSite ? maxBottom + 1 : 4;

      const colGap = 1;
      const rowGap = 1;

      // Determine real-time container physical width to guarantee:
      // 1. Invariant physical pixel size for cards across different window widths.
      // 2. Intelligent capacity check & auto-wrap when current width is insufficient.
      const currentPixelWidth = containerRef.current?.offsetWidth || (typeof window !== 'undefined' ? window.innerWidth : 1440);

      // In baseline 1440px desktop, 1 column = 24px.
      // Calculate intended physical pixel width of target card preset:
      const idealPixelW = safeW * 24;

      // Calculate how many pixels 1 column represents in current viewport:
      const currentColPixelW = Math.max(8, currentPixelWidth / 60);

      // Adapt the card's column width so its physical pixel size remains constant:
      const adaptedColW = Math.max(2, Math.min(60, Math.round(idealPixelW / currentColPixelW)));

      // Capacity check: how many cards fit comfortably in one row under current viewport width:
      const maxPhysicalFit = Math.floor((60 - 2) / (adaptedColW + colGap));
      const targetCols = safeW <= 3 ? 10 : safeW <= 4 ? 8 : safeW <= 5 ? 6 : maxPhysicalFit;
      const cardsPerRow = Math.max(1, Math.min(targetCols, maxPhysicalFit));
      const totalRowWidth = cardsPerRow * adaptedColW + (cardsPerRow - 1) * colGap;
      const startX = Math.max(1, Math.floor((60 - totalRowWidth) / 2));

      const newMap: FreeCanvasLayoutMap = {};
      const validPillKeys = new Set(categoryPills.map((p) => `cat-pill-${p.category.id}`));

      // 1. Preserve existing non-site nodes (system widgets, category pills)
      const existingNodes = [...getSafeGridNodes(grid)];
      existingNodes.forEach((n) => {
        if (!n.id) return;
        if (n.id.startsWith('site-')) return;
        if (n.id.startsWith('cat-pill-') && !validPillKeys.has(n.id)) return;

        const widgetType: FreeWidgetType = n.id.startsWith('cat-pill-')
          ? 'category-pill'
          : (n.id.replace('sys-', '') as any);

        newMap[n.id] = {
          id: n.id,
          type: widgetType,
          x: n.x ?? 0,
          y: n.y ?? 0,
          w: n.w ?? 1,
          h: n.h ?? 1,
        };
      });

      // 2. Lay out ALL page site cards into clean, non-overlapping rows with target dimensions and auto-wrap
      pageSites.forEach((site, idx) => {
        const widgetKey = `site-${site.id}`;
        const row = Math.floor(idx / cardsPerRow);
        const col = idx % cardsPerRow;
        const x = Math.min(60 - adaptedColW, startX + col * (adaptedColW + colGap));
        const y = startY + row * (safeH + rowGap);

        newMap[widgetKey] = {
          id: widgetKey,
          type: 'site',
          x,
          y,
          w: adaptedColW,
          h: safeH,
        };
      });

      // 3. GridStack built-in load with _loading = true to prevent collision rejection and layout cascades
      const items = Object.values(newMap).map((item) => ({
        id: item.id,
        x: item.x,
        y: item.y,
        w: item.w,
        h: item.h,
      }));
      grid.load(items, false);

      // 4. Snapshot sweep: ensure every node matches newMap without array mutation skipping
      const currentNodes = [...getSafeGridNodes(grid)];
      currentNodes.forEach((node) => {
        if (!node.id || !node.el) return;
        const target = newMap[node.id];
        if (target && (node.x !== target.x || node.y !== target.y || node.w !== target.w || node.h !== target.h)) {
          grid.update(node.el, { x: target.x, y: target.y, w: target.w, h: target.h });
        }
      });

      const prevStored = freeLayouts[currentPageId] || {};
      onUpdateLayouts(currentPageId, { ...prevStored, ...newMap });
    },
    [grid, currentPageId, freeLayouts, onUpdateLayouts, pageSites, categoryPills]
  );

  // Apply a specific card's size to all other cards on the current desktop
  const handleApplySiteCardSizeToAll = useCallback(
    (siteId: string) => {
      if (!grid || !grid.engine) return;
      const targetNode = getSafeGridNodes(grid).find((n) => n.id === `site-${siteId}`);
      if (!targetNode || !targetNode.w || !targetNode.h) return;
      handleApplySizeToAll(targetNode.w, targetNode.h);
    },
    [grid, handleApplySizeToAll]
  );

  // Reset to default coordinates
  const handleResetDefault = useCallback(() => {
    if (!grid || !grid.engine) return;
    if (window.confirm(t('freeLayoutResetConfirm', settings.language))) {
      const defaults = computeDefaults();
      const items = Object.values(defaults).map((d) => ({
        id: d.id,
        x: d.x,
        y: d.y,
        w: d.w,
        h: d.h,
      }));

      // 1. GridStack built-in load with _loading = true to prevent collision rejection and layout cascades
      grid.load(items, false);

      // 2. Snapshot sweep: ensure every node matches defaults without array mutation skipping
      const currentNodes = [...getSafeGridNodes(grid)];
      currentNodes.forEach((node) => {
        if (!node.id || !node.el) return;
        const def = defaults[node.id];
        if (def && (node.x !== def.x || node.y !== def.y || node.w !== def.w || node.h !== def.h)) {
          grid.update(node.el, { x: def.x, y: def.y, w: def.w, h: def.h });
        }
      });

      onUpdateLayouts(currentPageId, defaults);
    }
  }, [grid, computeDefaults, currentPageId, onUpdateLayouts, settings.language]);

  const handleSelectTab = useCallback((catId: string) => {
    setSelectedCatId(catId);
    onSelectCategory?.(catId);
  }, [onSelectCategory]);

  const swipeCleanersRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      if (swipeCleanersRef.current) {
        swipeCleanersRef.current();
        swipeCleanersRef.current = null;
      }
    };
  }, []);

  // Zero-overhead gesture: drag blank canvas area horizontally to switch desktop pages
  const handleCanvasPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    // 1. Only respond to primary mouse button (left click)
    if (e.button !== 0) return;
    // 2. Disabled during editing mode to prevent conflict with widget repositioning
    if (isEditing) return;
    // 3. Only enabled when multiple desktop pages exist
    if (!gridPages || gridPages.length <= 1 || !onSelectPage) return;

    // 4. Strict blank area detection: ignore clicks on widgets, cards, buttons, inputs, dropdowns
    const target = e.target as HTMLElement | null;
    if (!target) return;
    if (
      target.closest(
        '.grid-stack-item, .grid-stack-item-content, button, input, select, textarea, a, .glass-dropdown, .glass-modal, [data-site-card], [data-no-swipe]'
      )
    ) {
      return;
    }

    const startX = e.clientX;
    const startY = e.clientY;
    let isSwiping = false;

    const cleanup = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      if (isSwiping) {
        document.body.classList.remove('select-none', 'cursor-grabbing');
      }
      swipeCleanersRef.current = null;
    };

    const onPointerMove = (moveEv: PointerEvent) => {
      const dx = moveEv.clientX - startX;
      const dy = moveEv.clientY - startY;

      // Provide grabbing visual feedback and prevent text selection once intentional movement starts
      if (!isSwiping && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
        isSwiping = true;
        document.body.classList.add('select-none', 'cursor-grabbing');
      }
    };

    const onPointerUp = (upEv: PointerEvent) => {
      cleanup();

      const dx = upEv.clientX - startX;
      const dy = upEv.clientY - startY;

      // Swipe threshold: horizontal delta >= 60px and significantly larger than vertical movement
      const SWIPE_THRESHOLD = 60;
      if (Math.abs(dx) >= SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy) * 1.25) {
        const currentIdx = gridPages.findIndex((p) => p.id === currentPageId);
        if (currentIdx === -1) return;

        if (dx < 0) {
          // Swipe Left -> Next desktop page
          if (currentIdx < gridPages.length - 1) {
            onSelectPage(gridPages[currentIdx + 1].id);
          }
        } else {
          // Swipe Right -> Previous desktop page
          if (currentIdx > 0) {
            onSelectPage(gridPages[currentIdx - 1].id);
          }
        }
      }
    };

    swipeCleanersRef.current = cleanup;
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  }, [isEditing, gridPages, currentPageId, onSelectPage]);

  return (
    <div
      className="relative w-full min-h-[calc(100vh-120px)] flex flex-col items-center overflow-x-hidden"
      onPointerDown={handleCanvasPointerDown}
    >
      <style>{`
        .grid-stack {
          position: relative;
          min-height: calc(100vh - 140px);
        }
        .grid-stack-item {
          touch-action: none;
        }
        .grid-stack-item[gs-id="sys-search"] {
          z-index: 25;
        }
        .grid-stack-item-content {
          overflow: visible !important;
          inset: 3px 2px !important;
          border-radius: 1rem !important;
          transition: outline-color 0.15s ease, background-color 0.15s ease;
        }
        .grid-stack-editing .grid-stack-item-content {
          outline: 1.5px dashed rgba(245, 158, 11, 0.4);
          outline-offset: -1px;
        }
        .grid-stack-editing .grid-stack-item:hover .grid-stack-item-content {
          outline-color: rgba(245, 158, 11, 0.85);
          background-color: rgba(245, 158, 11, 0.05);
        }
        /* When actively resizing or dragging, suppress outline on the moving item so only the target placeholder dashed box is visible */
        .grid-stack-editing .grid-stack-item.ui-resizable-resizing > .grid-stack-item-content,
        .grid-stack-editing .grid-stack-item.ui-draggable-dragging > .grid-stack-item-content {
          outline: none !important;
          background-color: transparent !important;
        }
        .grid-stack:not(.grid-stack-editing) .ui-resizable-handle {
          display: none !important;
        }
        .grid-stack-editing .ui-resizable-se {
          width: 16px !important;
          height: 16px !important;
          right: 3px !important;
          bottom: 3px !important;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23f59e0b' stroke-width='2.6' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='5 9 5 5 9 5'/%3E%3Cpolyline points='19 15 19 19 15 19'/%3E%3Cline x1='5' y1='5' x2='19' y2='19'/%3E%3C/svg%3E") !important;
          background-size: contain !important;
          background-repeat: no-repeat !important;
          background-position: center !important;
          border: none !important;
          opacity: 0.85;
          filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.35));
          transition: opacity 0.15s ease, transform 0.15s ease;
          cursor: se-resize;
          z-index: 50;
        }
        .grid-stack-editing .grid-stack-item:hover .ui-resizable-se {
          opacity: 1;
          transform: scale(1.15);
        }
        /* GridStack Placeholder: ONLY style .placeholder-content, never outer .grid-stack-placeholder to avoid double borders */
        .grid-stack .grid-stack-placeholder {
          background: transparent !important;
          border: none !important;
        }
        .grid-stack .grid-stack-placeholder > .placeholder-content {
          background-color: rgba(245, 158, 11, 0.08) !important;
          border: 1.5px dashed rgba(245, 158, 11, 0.65) !important;
          border-radius: 1rem !important;
          box-shadow: none !important;
          inset: 3px 2px !important; /* Strictly match .grid-stack-item-content inset to prevent 1-2px jitter on drop/resize */
        }
        .grid-stack-item.ui-draggable-dragging > .grid-stack-item-content {
          box-shadow: 0 12px 28px -4px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.15) !important;
          opacity: 0.95 !important;
        }
      `}</style>

      {/* Floating Free Layout Toolbar (Portaled directly to document.body, flush to top edge with orange tab attached) */}
      {isEditing && typeof document !== 'undefined' && createPortal(
        <div
          className={`fixed top-0 left-1/2 -translate-x-1/2 z-[9999] select-none flex flex-col items-center transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isBarHovered || isBarPinned || sizeMenuOpen ? 'translate-y-0' : '-translate-y-[calc(100%-8px)]'
          }`}
          onMouseEnter={handleBarMouseEnter}
          onMouseLeave={handleBarMouseLeave}
        >
          {/* Main Toolbar Capsule */}
          <div
            className={`flex items-center gap-1.5 p-1.5 px-3 rounded-b-2xl border-b border-x shadow-2xl glass-modal backdrop-blur-xl max-w-[calc(100vw-32px)] ${
              isLight
                ? 'border-black/10 text-slate-700 bg-white/95'
                : 'border-white/15 text-white/90 bg-slate-900/90'
            }`}
          >
            {/* Title Badge */}
            <div
              className={`flex items-center gap-1.5 px-2 py-1 text-xs font-semibold shrink-0 border-r ${
                isLight ? 'text-amber-600 border-black/10' : 'text-amber-400 border-white/10'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">{t('freeLayoutEdit', settings.language)}</span>
            </div>

            {/* Toggle Overlap */}
            <button
              type="button"
              onClick={() => onUpdateSettings({ freeLayoutAllowOverlap: !allowOverlap })}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer shrink-0 ${
                allowOverlap
                  ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30 font-semibold'
                  : isLight
                  ? 'text-slate-700 hover:text-slate-900 hover:bg-black/5 border border-transparent'
                  : 'text-white/70 hover:text-white hover:bg-white/10 border border-transparent'
              }`}
              title={t('freeLayoutAllowOverlapDesc', settings.language)}
            >
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">{t('freeLayoutAllowOverlap', settings.language)}</span>
              <span className="text-[10px] uppercase font-bold opacity-75">
                {allowOverlap ? 'ON' : 'OFF'}
              </span>
            </button>

            {/* Category / Grouping Toggle Switch */}
            <button
              type="button"
              onClick={() => onUpdateSettings({ showCategories: !showCategories })}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer shrink-0 ${
                showCategories
                  ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30 font-semibold'
                  : isLight
                  ? 'text-slate-700 hover:text-slate-900 hover:bg-black/5 border border-transparent'
                  : 'text-white/70 hover:text-white hover:bg-white/10 border border-transparent'
              }`}
              title={t('showCategoriesOnly', settings.language)}
            >
              <Folder className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">{t('showCategoriesOnly', settings.language)}</span>
              <span className="text-[10px] uppercase font-bold opacity-75">
                {showCategories ? 'ON' : 'OFF'}
              </span>
            </button>

            {/* Add Category Button (available when categories enabled) */}
            {showCategories && (
              <button
                type="button"
                onClick={() => setModalCategory(null)}
                className={`flex items-center gap-1 px-2 py-1 rounded-xl text-xs transition-all cursor-pointer shrink-0 ${
                  isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-black/5'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
                title={t('addCategoryInGroup', settings.language)}
              >
                <FolderPlus className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">{t('addCategoryInGroup', settings.language)}</span>
              </button>
            )}

            {/* Card Size Presets Dropdown */}
            <div className="relative shrink-0" ref={sizeMenuContainerRef}>
              <button
                type="button"
                onClick={() => setSizeMenuOpen((prev) => !prev)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  sizeMenuOpen
                    ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30 font-semibold'
                    : isLight
                    ? 'text-slate-700 hover:text-slate-900 hover:bg-black/5 border border-transparent'
                    : 'text-white/70 hover:text-white hover:bg-white/10 border border-transparent'
                }`}
                title={t('cardSizePresets', settings.language)}
              >
                <Maximize2 className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">{t('cardSizePresets', settings.language)}</span>
                <ChevronDown className={`w-3 h-3 opacity-60 transition-transform duration-200 ${sizeMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {sizeMenuOpen && (
                <div
                  className={`absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-52 rounded-2xl shadow-2xl border p-1.5 glass-modal backdrop-blur-xl animate-fade-in text-xs font-medium select-none z-[100] ${
                    isLight
                      ? 'bg-white/95 border-black/10 text-slate-800 shadow-black/20'
                      : 'bg-slate-900/95 border-white/15 text-white shadow-black/50'
                  }`}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <div className={`px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-white/40'}`}>
                    {t('cardSizePresets', settings.language)}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      handleApplySizeToAll(4, 5);
                      setSizeMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                      isLight ? 'hover:bg-black/5 text-slate-700 hover:text-slate-950' : 'hover:bg-white/10 text-white/80 hover:text-white'
                    }`}
                  >
                    <span>{t('cardPresetStandard', settings.language)}</span>
                    <span className="opacity-50 text-[10px] font-mono bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded">4×5</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleApplySizeToAll(5, 6);
                      setSizeMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                      isLight ? 'hover:bg-black/5 text-slate-700 hover:text-slate-950' : 'hover:bg-white/10 text-white/80 hover:text-white'
                    }`}
                  >
                    <span>{t('cardPresetLarge', settings.language)}</span>
                    <span className="opacity-50 text-[10px] font-mono bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded">5×6</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleApplySizeToAll(10, 3);
                      setSizeMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                      isLight ? 'hover:bg-black/5 text-slate-700 hover:text-slate-950' : 'hover:bg-white/10 text-white/80 hover:text-white'
                    }`}
                  >
                    <span>{t('cardPresetBanner', settings.language)}</span>
                    <span className="opacity-50 text-[10px] font-mono bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded">10×3</span>
                  </button>
                </div>
              )}
            </div>

            {/* Reset Defaults Button */}
            <button
              type="button"
              onClick={handleResetDefault}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs transition-all cursor-pointer shrink-0 ${
                isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-black/5'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              title={t('freeLayoutReset', settings.language)}
            >
              <RotateCcw className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">{t('freeLayoutReset', settings.language)}</span>
            </button>

            {/* Pin / Unpin Button */}
            <button
              type="button"
              onClick={() => setIsBarPinned((prev) => !prev)}
              className={`p-1.5 rounded-xl text-xs transition-all cursor-pointer shrink-0 ${
                isBarPinned
                  ? 'bg-amber-500/20 text-amber-500 dark:text-amber-300'
                  : isLight
                  ? 'text-slate-500 hover:text-slate-900 hover:bg-black/5'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
              title={isBarPinned ? t('freeLayoutUnpin', settings.language) : t('freeLayoutPin', settings.language)}
            >
              <Pin className={`w-3.5 h-3.5 shrink-0 transition-transform ${isBarPinned ? 'rotate-45 fill-current' : ''}`} />
            </button>

            {/* Done Editing Button */}
            <button
              type="button"
              onClick={handleDoneEditing}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-amber-500 text-slate-950 hover:bg-amber-400 active:scale-95 shadow-md transition-all cursor-pointer ml-0.5 shrink-0"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
              <span className="whitespace-nowrap">{t('freeLayoutDone', settings.language)}</span>
            </button>
          </div>

          {/* Pull-down Tab Indicator: Positioned directly below capsule in flex column, NEVER clipped by overflow! */}
          <div
            className="flex items-center justify-center cursor-pointer group py-0 -mt-[1px] w-48 md:w-64"
            onClick={() => setIsBarHovered(true)}
          >
            <div
              className={`h-2 w-16 bg-amber-500 rounded-b-full shadow-[0_2px_8px_rgba(245,158,11,0.6)] transition-all duration-200 group-hover:h-2.5 group-hover:w-20 group-hover:bg-amber-400 ${
                isBarHovered || isBarPinned ? 'opacity-40 hover:opacity-100' : 'opacity-100'
              }`}
              title={t('freeLayoutEdit', settings.language)}
            />
          </div>
        </div>,
        document.body
      )}



      {/* GridStack DOM Container: Fluid to viewport with desktop max-width, strictly zero horizontal overflow */}
      <div
        key={currentPageId}
        ref={containerRef}
        className={`grid-stack w-full max-w-[1440px] px-2 sm:px-4 min-h-[calc(100vh-160px)] ${activeAnimClass || slideClassRef.current}`}
      >
        {/* 1. Clock Widget */}
        {(settings.showClock ?? true) && activeLayoutMap['sys-clock'] && (
          <GridItemPortal
            grid={grid}
            id="sys-clock"
            x={activeLayoutMap['sys-clock'].x}
            y={activeLayoutMap['sys-clock'].y}
            w={activeLayoutMap['sys-clock'].w}
            h={activeLayoutMap['sys-clock'].h}
            minW={6}
            minH={2}
          >
            <ClockWidget
              settings={settings}
              resolvedColors={resolvedColors}
              isLight={isLight}
            />
          </GridItemPortal>
        )}

        {/* 2. Date Widget */}
        {(settings.showDate ?? true) && activeLayoutMap['sys-date'] && (
          <GridItemPortal
            grid={grid}
            id="sys-date"
            x={activeLayoutMap['sys-date'].x}
            y={activeLayoutMap['sys-date'].y}
            w={activeLayoutMap['sys-date'].w}
            h={activeLayoutMap['sys-date'].h}
            minW={4}
            minH={1}
          >
            <DateWidget
              settings={settings}
              resolvedColors={resolvedColors}
              isLight={isLight}
            />
          </GridItemPortal>
        )}

        {/* 2.1 Lunar Widget */}
        {(settings.showLunar ?? true) && activeLayoutMap['sys-lunar'] && (
          <GridItemPortal
            grid={grid}
            id="sys-lunar"
            x={activeLayoutMap['sys-lunar'].x}
            y={activeLayoutMap['sys-lunar'].y}
            w={activeLayoutMap['sys-lunar'].w}
            h={activeLayoutMap['sys-lunar'].h}
            minW={4}
            minH={1}
          >
            <LunarWidget
              settings={settings}
              resolvedColors={resolvedColors}
              isLight={isLight}
            />
          </GridItemPortal>
        )}

        {/* 3. Greeting Widget */}
        {(settings.showGreeting ?? true) && activeLayoutMap['sys-greeting'] && (
          <GridItemPortal
            grid={grid}
            id="sys-greeting"
            x={activeLayoutMap['sys-greeting'].x}
            y={activeLayoutMap['sys-greeting'].y}
            w={activeLayoutMap['sys-greeting'].w}
            h={activeLayoutMap['sys-greeting'].h}
            minW={6}
            minH={1}
          >
            <GreetingWidget
              settings={settings}
              resolvedColors={resolvedColors}
              isLight={isLight}
            />
          </GridItemPortal>
        )}

        {/* 4. Search Widget */}
        {(settings.showSearch ?? true) && activeLayoutMap['sys-search'] && (
          <GridItemPortal
            grid={grid}
            id="sys-search"
            x={activeLayoutMap['sys-search'].x}
            y={activeLayoutMap['sys-search'].y}
            w={activeLayoutMap['sys-search'].w}
            h={activeLayoutMap['sys-search'].h}
            minW={6}
            minH={1}
          >
            <SearchWidget
              settings={settings}
              resolvedColors={resolvedColors}
              isEditing={isEditing}
              onEngineChange={onEngineChange}
            />
          </GridItemPortal>
        )}

        {/* 5. Independent Draggable Category Pills (when showCategories is ON) */}
        {showCategories && categoryPills.map((item) => {
          const widgetKey = `cat-pill-${item.category.id}`;
          const layout = activeLayoutMap[widgetKey];
          if (!layout) return null;

          return (
            <GridItemPortal
              key={widgetKey}
              grid={grid}
              id={widgetKey}
              x={layout.x}
              y={layout.y}
              w={layout.w}
              h={layout.h}
              minW={3}
              minH={1}
            >
              <CategoryPillWidget
                category={item.category}
                isActive={selectedCatId === item.category.id}
                count={item.count}
                isLight={isLight}
                resolvedColors={resolvedColors}
                language={settings.language}
                isEditing={isEditing}
                onSelect={handleSelectTab}
                onContextMenu={(e, cat) => {
                  setContextMenuCat({ category: cat, x: e.clientX, y: e.clientY });
                }}
              />
            </GridItemPortal>
          );
        })}

        {/* 6. Site Cards on the Canvas */}
        {visibleSites.map((site, index) => {
          const widgetKey = `site-${site.id}`;
          const layout = activeLayoutMap[widgetKey];
          if (!layout) return null;

          return (
            <GridItemPortal
              key={site.id}
              grid={grid}
              id={widgetKey}
              x={layout.x}
              y={layout.y}
              w={layout.w}
              h={layout.h}
              minW={3}
              minH={2}
            >
              <SiteCard
                site={site}
                index={index}
                settings={settings}
                resolvedColors={resolvedColors}
                isLight={isLight}
                gridPages={gridPages}
                activeGridPageId={activeGridPageId}
                currentPageId={currentPageId}
                customWidth="100%"
                customHeight="100%"
                disableInternalDrag={true}
                isEditing={isEditing}
                onApplySizeToAll={handleApplySiteCardSizeToAll}
                onEdit={onEditSite}
                onDelete={onDeleteSite}
                onMoveSiteToPage={onMoveSiteToPage}
                onDragStart={() => {}}
                onDragOver={() => {}}
                onDrop={() => {}}
                onDragEnd={() => {}}
              />
            </GridItemPortal>
          );
        })}
      </div>

      {/* Desktop Page Indicator (Docked at bottom of canvas) */}
      {gridPages && gridPages.length > 0 && (
        <GridPageIndicator
          gridPages={gridPages}
          activeGridPageId={currentPageId}
          settings={settings}
          resolvedColors={resolvedColors}
          isLight={isLight}
          onSelectPage={onSelectPage || (() => {})}
          onAddPage={onAddPage}
          onRenamePage={onRenamePage || (() => {})}
          onDeletePage={onDeletePage || (() => {})}
        />
      )}

      {/* Category Pill Context Menu */}
      {contextMenuCat && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[10000] cursor-default"
          onClick={() => setContextMenuCat(null)}
          onContextMenu={(e) => {
            e.preventDefault();
            setContextMenuCat(null);
          }}
        >
          <div
            className={`fixed rounded-2xl shadow-2xl border p-1.5 min-w-[140px] text-xs font-medium glass-modal backdrop-blur-xl ${
              isLight
                ? 'bg-white/95 border-black/10 text-slate-800'
                : 'bg-slate-900/95 border-white/10 text-white/90'
            }`}
            style={{
              left: Math.min(contextMenuCat.x, window.innerWidth - 160),
              top: Math.min(contextMenuCat.y, window.innerHeight - 120),
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Edit Category */}
            <button
              type="button"
              onClick={() => {
                setModalCategory(contextMenuCat.category);
                setContextMenuCat(null);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5 opacity-70" />
              <span>{t('editCategory', settings.language)}</span>
            </button>

            {/* Delete Category */}
            {!contextMenuCat.category.isDefault && (
              <button
                type="button"
                onClick={() => {
                  setConfirmDeleteCat(contextMenuCat.category);
                  setContextMenuCat(null);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t('deleteCategory', settings.language)}</span>
              </button>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Category Modal for adding / editing categories */}
      <CategoryModal
        isOpen={modalCategory !== undefined}
        category={modalCategory ?? null}
        settings={settings}
        gridPages={gridPages}
        activeGridPageId={currentPageId}
        onClose={() => setModalCategory(undefined)}
        onSave={(catId, data) => {
          if (catId) {
            onUpdateCategory?.(catId, data);
          } else {
            onAddCategory?.({ ...data, pageId: currentPageId });
          }
          setModalCategory(undefined);
        }}
        onDelete={(catId, deleteSites) => {
          onDeleteCategory?.(catId, deleteSites);
          setModalCategory(undefined);
        }}
        siteCount={
          modalCategory ? pageSites.filter((s) => s.categoryId === modalCategory.id).length : 0
        }
      />

      {/* Confirm Delete Category Modal */}
      {confirmDeleteCat && (
        <ConfirmModal
          isOpen={true}
          type="danger"
          title={t('deleteCategory', settings.language)}
          message={t('confirmDeleteCategorySimple', settings.language)}
          confirmText={t('deleteCategory', settings.language)}
          cancelText={t('cancel', settings.language)}
          onConfirm={() => {
            onDeleteCategory?.(confirmDeleteCat.id, deleteCategorySites);
            setConfirmDeleteCat(null);
          }}
          onCancel={() => setConfirmDeleteCat(null)}
        />
      )}

      {/* Real-time Resizing Dimension HUD Pill (Zero-re-render overhead via direct DOM ref) */}
      <div
        ref={resizeHudRef}
        style={{ display: 'none', opacity: 0 }}
        className={`fixed z-[10001] pointer-events-none items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide border shadow-2xl backdrop-blur-xl transition-opacity duration-150 select-none ${
          isLight
            ? 'bg-slate-900/95 text-white border-white/20 shadow-black/35'
            : 'bg-white/95 text-slate-900 border-black/15 shadow-black/50'
        }`}
      />
    </div>
  );
});

FreeCanvas.displayName = 'FreeCanvas';
