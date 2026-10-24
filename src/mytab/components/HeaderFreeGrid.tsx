import React, { useState, useRef, useEffect, useLayoutEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { GridStack } from 'gridstack';
import 'gridstack/dist/gridstack.min.css';
import { Columns2, AlignCenter, RotateCcw, Check } from 'lucide-react';
import { ThemeSettings, FreeCanvasLayoutMap } from '../../types';
import { ResolvedTextColors } from '../../utils/wallpaperAnalyzer';
import { ClockWidget } from './widgets/ClockWidget';
import { DateWidget } from './widgets/DateWidget';
import { LunarWidget } from './widgets/LunarWidget';
import { GreetingWidget } from './widgets/GreetingWidget';
import { SearchWidget } from './widgets/SearchWidget';
import { t } from '../../utils/i18n';
import { isLightMode } from '../../utils/constants';

const CANVAS_BASE_CELL_HEIGHT = 22;

interface HeaderFreeGridProps {
  settings: ThemeSettings;
  resolvedColors?: ResolvedTextColors;
  isLight?: boolean;
  isEditing: boolean;
  onToggleEditing?: () => void;
  headerLayout?: FreeCanvasLayoutMap;
  onUpdateLayout: (map: FreeCanvasLayoutMap) => void;
  onEngineChange: (engineId: string) => void;
}

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
 * Safely extract nodes array from GridStack engine
 */
const getSafeGridNodes = (grid: GridStack | null): any[] => {
  if (!grid || !grid.engine) return [];
  const nodes = (grid.engine as any).nodes;
  return Array.isArray(nodes) ? nodes : [];
};

/**
 * GridItemPortal renders an isolated GridStack widget using createPortal.
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

  // Synchronize external coordinate and dimension changes
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

GridItemPortal.displayName = 'HeaderGridItemPortal';

export const HeaderFreeGrid: React.FC<HeaderFreeGridProps> = React.memo(({
  settings,
  resolvedColors,
  isLight: propsIsLight,
  isEditing,
  onToggleEditing,
  headerLayout = {},
  onUpdateLayout,
  onEngineChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<GridStack | null>(null);
  const [grid, setGrid] = useState<GridStack | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isLight = propsIsLight !== undefined ? propsIsLight : isLightMode(settings.mode);

  // Compute default layout for Header: Centered layout (tight, zero wasted vertical space)
  const computeDefaults = useCallback((): FreeCanvasLayoutMap => {
    const map: FreeCanvasLayoutMap = {};

    // 1. Clock (x=16, y=0, w=28, h=5)
    if (settings.showClock ?? true) {
      map['sys-clock'] = {
        id: 'sys-clock',
        type: 'clock',
        x: 16,
        y: 0,
        w: 28,
        h: 5,
      };
    }

    // 2. Date & Lunar
    const showDate = settings.showDate ?? true;
    const showLunar = settings.showLunar ?? true;
    if (showDate && showLunar) {
      map['sys-date'] = { id: 'sys-date', type: 'date', x: 22, y: 5, w: 9, h: 1 };
      map['sys-lunar'] = { id: 'sys-lunar', type: 'lunar', x: 31, y: 5, w: 7, h: 1 };
    } else if (showDate) {
      map['sys-date'] = { id: 'sys-date', type: 'date', x: 24, y: 5, w: 12, h: 1 };
    } else if (showLunar) {
      map['sys-lunar'] = { id: 'sys-lunar', type: 'lunar', x: 25, y: 5, w: 10, h: 1 };
    }

    // 3. Greeting
    if (settings.showGreeting ?? true) {
      map['sys-greeting'] = {
        id: 'sys-greeting',
        type: 'greeting',
        x: 18,
        y: 6,
        w: 24,
        h: 1,
      };
    }

    // 4. Search Bar
    if (settings.showSearch ?? true) {
      map['sys-search'] = {
        id: 'sys-search',
        type: 'search',
        x: 16,
        y: 7,
        w: 28,
        h: 2,
      };
    }

    return map;
  }, [settings.showClock, settings.showDate, settings.showLunar, settings.showGreeting, settings.showSearch]);

  // Compute Split Left-Right Preset: Left Clock/Date, Right Search (only ~6 rows tall)
  const computeSplitPreset = useCallback((): FreeCanvasLayoutMap => {
    const map: FreeCanvasLayoutMap = {};

    if (settings.showClock ?? true) {
      map['sys-clock'] = { id: 'sys-clock', type: 'clock', x: 1, y: 0, w: 22, h: 4 };
    }

    const showDate = settings.showDate ?? true;
    const showLunar = settings.showLunar ?? true;
    if (showDate && showLunar) {
      map['sys-date'] = { id: 'sys-date', type: 'date', x: 1, y: 4, w: 9, h: 1 };
      map['sys-lunar'] = { id: 'sys-lunar', type: 'lunar', x: 10, y: 4, w: 8, h: 1 };
    } else if (showDate) {
      map['sys-date'] = { id: 'sys-date', type: 'date', x: 1, y: 4, w: 12, h: 1 };
    } else if (showLunar) {
      map['sys-lunar'] = { id: 'sys-lunar', type: 'lunar', x: 1, y: 4, w: 10, h: 1 };
    }

    if (settings.showGreeting ?? true) {
      map['sys-greeting'] = { id: 'sys-greeting', type: 'greeting', x: 1, y: 5, w: 20, h: 1 };
    }

    if (settings.showSearch ?? true) {
      map['sys-search'] = { id: 'sys-search', type: 'search', x: 26, y: 1, w: 33, h: 2 };
    }

    return map;
  }, [settings.showClock, settings.showDate, settings.showLunar, settings.showGreeting, settings.showSearch]);

  // Active Layout Map: merged with defaults and validated
  const activeLayoutMap = useMemo(() => {
    const defaults = computeDefaults();
    if (!headerLayout || Object.keys(headerLayout).length === 0) {
      return defaults;
    }

    const merged: FreeCanvasLayoutMap = {};
    Object.keys(defaults).forEach((key) => {
      const item = headerLayout[key];
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
      } else {
        merged[key] = defaults[key];
      }
    });

    return merged;
  }, [headerLayout, computeDefaults]);

  // Dynamically compute the bottom-most row of ONLY currently visible widgets
  const maxBottomRow = useMemo(() => {
    let maxBottom = 0;
    Object.entries(activeLayoutMap).forEach(([id, item]) => {
      if (id === 'sys-clock' && settings.showClock === false) return;
      if (id === 'sys-date' && settings.showDate === false) return;
      if (id === 'sys-lunar' && settings.showLunar === false) return;
      if (id === 'sys-greeting' && settings.showGreeting === false) return;
      if (id === 'sys-search' && settings.showSearch === false) return;
      if (item && typeof item.y === 'number' && typeof item.h === 'number') {
        const bottom = item.y + item.h;
        if (bottom > maxBottom) {
          maxBottom = bottom;
        }
      }
    });
    return maxBottom;
  }, [
    activeLayoutMap,
    settings.showClock,
    settings.showDate,
    settings.showLunar,
    settings.showGreeting,
    settings.showSearch,
  ]);

  // Persist layout
  const flushSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    const gs = gridRef.current;
    if (!gs || !gs.engine) return;
    const nodes = getSafeGridNodes(gs);
    if (nodes.length === 0) return;

    const newMap: FreeCanvasLayoutMap = {};
    nodes.forEach((n) => {
      if (!n.id) return;
      newMap[n.id] = {
        id: n.id,
        type: n.id.replace('sys-', '') as any,
        x: n.x ?? 0,
        y: n.y ?? 0,
        w: n.w ?? 4,
        h: n.h ?? 2,
      };
    });

    onUpdateLayout(newMap);
  }, [onUpdateLayout]);

  const flushSaveRef = useRef(flushSave);
  flushSaveRef.current = flushSave;

  // Initialize GridStack instance for header
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Clean orphaned DOM nodes
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
      minRow: 1,
      auto: false,
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

    // Apply overlap bypass
    const engine: any = gs.engine;
    if (engine) {
      engine.collide = () => undefined;
      engine.collideAll = () => [];
      engine._fixCollisions = () => false;
      engine._packNodes = function () {
        return this;
      };
    }

    gridRef.current = gs;
    setGrid(gs);

    return () => {
      flushSaveRef.current();
      try {
        gs.destroy(false);
      } catch {
        // already destroyed
      }
      gridRef.current = null;
      setGrid(null);
    };
  }, []);

  // Sync editing mode
  useLayoutEffect(() => {
    if (!grid) return;
    grid.setStatic(!isEditing);

    if (containerRef.current) {
      if (isEditing) {
        containerRef.current.classList.add('header-grid-editing');
      } else {
        containerRef.current.classList.remove('header-grid-editing');
      }
    }
  }, [grid, isEditing]);

  // Listen to drag/resize stops to persist
  useEffect(() => {
    if (!grid) return;

    const debouncedSave = () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => flushSaveRef.current(), 150);
    };

    grid.on('dragstop resizestop', debouncedSave);

    return () => {
      grid.off('dragstop resizestop');
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
        flushSaveRef.current();
      }
    };
  }, [grid]);

  // Apply split preset
  const handleApplySplit = () => {
    const split = computeSplitPreset();
    onUpdateLayout(split);
  };

  // Apply centered preset
  const handleApplyCentered = () => {
    const centered = computeDefaults();
    onUpdateLayout(centered);
  };

  const containerHeightPx = maxBottomRow > 0 ? maxBottomRow * (CANVAS_BASE_CELL_HEIGHT + 4) : 0;

  return (
    <div className="relative w-full max-w-[1920px] px-2 sm:px-6 mx-auto flex flex-col items-center select-none transition-all duration-300">
      <style>{`
        .header-grid-stack {
          position: relative;
          width: 100%;
          transition: min-height 0.25s ease-out, height 0.25s ease-out;
        }
        .header-grid-stack .grid-stack-item {
          touch-action: none;
        }
        .header-grid-stack .grid-stack-item[gs-id="sys-search"] {
          z-index: 25;
        }
        .header-grid-stack .grid-stack-item-content {
          overflow: visible !important;
          inset: 2px !important;
        }
        .header-grid-editing .grid-stack-item-content {
          outline: 1.5px dashed rgba(245, 158, 11, 0.45);
          outline-offset: -1px;
          border-radius: 1rem;
          cursor: move !important;
          background: rgba(245, 158, 11, 0.04);
        }
        .header-grid-editing .grid-stack-item-content:hover {
          outline: 2px dashed rgba(245, 158, 11, 0.85);
          background: rgba(245, 158, 11, 0.08);
        }
      `}</style>

      {/* Floating Toolbar when Editing Header (Portaled to document.body, does not displace content) */}
      {isEditing && typeof document !== 'undefined' && createPortal(
        <div
          className={`fixed top-3 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-1.5 px-3 py-1.5 rounded-2xl shadow-2xl border backdrop-blur-xl animate-fade-in text-xs font-medium select-none ${
            isLight
              ? 'bg-white/95 border-black/10 text-slate-800 shadow-black/10'
              : 'bg-slate-900/90 border-white/15 text-white shadow-black/40'
          }`}
        >
          {/* Centered Preset Button */}
          <button
            type="button"
            onClick={handleApplyCentered}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
              isLight ? 'hover:bg-black/5 text-slate-700' : 'hover:bg-white/10 text-white/80'
            }`}
            title="居中对称堆叠"
          >
            <AlignCenter className="w-3.5 h-3.5" />
            <span>居中排列</span>
          </button>

          {/* Left-Right Split Preset Button */}
          <button
            type="button"
            onClick={handleApplySplit}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
              isLight ? 'hover:bg-black/5 text-slate-700' : 'hover:bg-white/10 text-white/80'
            }`}
            title="左右双栏紧凑排布 (左时钟, 右搜索)"
          >
            <Columns2 className="w-3.5 h-3.5" />
            <span>左右双栏</span>
          </button>

          {/* Reset Button */}
          <button
            type="button"
            onClick={handleApplyCentered}
            className={`flex items-center gap-1 px-2 py-1 rounded-xl transition-all cursor-pointer ${
              isLight ? 'hover:bg-black/5 text-slate-500' : 'hover:bg-white/10 text-white/60'
            }`}
            title={t('resetCardLayout', settings.language)}
          >
            <RotateCcw className="w-3 h-3" />
          </button>

          <div className={`w-px h-4 mx-0.5 ${isLight ? 'bg-black/10' : 'bg-white/15'}`} />

          {/* Done Editing Button */}
          {onToggleEditing && (
            <button
              type="button"
              onClick={onToggleEditing}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-sm font-semibold transition-transform active:scale-95 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{t('doneEditingBoard', settings.language)}</span>
            </button>
          )}
        </div>,
        document.body
      )}

      {/* GridStack Canvas Container for Header */}
      <div
        ref={containerRef}
        data-tour="header-widgets"
        className="grid-stack header-grid-stack"
        style={{
          minHeight: `${containerHeightPx}px`,
          height: `${containerHeightPx}px`,
        }}
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

        {/* 3. Lunar Widget */}
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

        {/* 4. Greeting Widget */}
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

        {/* 5. Search Widget */}
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
      </div>
    </div>
  );
});

HeaderFreeGrid.displayName = 'HeaderFreeGrid';
