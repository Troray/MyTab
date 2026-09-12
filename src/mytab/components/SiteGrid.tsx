import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { SiteItem, ThemeSettings, GridPage } from '../../types';
import { ResolvedTextColors } from '../../utils/wallpaperAnalyzer';
import { SiteCard } from './SiteCard';
import { GridPageIndicator } from './GridPageIndicator';
import { t } from '../../utils/i18n';

interface SiteGridProps {
  sites: SiteItem[];
  settings: ThemeSettings;
  resolvedColors?: ResolvedTextColors;
  isLight?: boolean;
  gridPages?: GridPage[];
  activeGridPageId?: string;
  onEditSite: (site: SiteItem) => void;
  onDeleteSite: (siteId: string) => void;
  onAddSite: () => void;
  onReorderSites: (newSites: SiteItem[]) => void;
  onSelectPage?: (pageId: string) => void;
  onAddPage?: (name?: string) => void;
  onRenamePage?: (pageId: string, newName: string) => void;
  onDeletePage?: (pageId: string) => void;
}

export const SiteGrid: React.FC<SiteGridProps> = React.memo(({
  sites,
  settings,
  resolvedColors,
  isLight,
  gridPages,
  activeGridPageId,
  onEditSite,
  onDeleteSite,
  onAddSite,
  onReorderSites,
  onSelectPage,
  onAddPage,
  onRenamePage,
  onDeletePage,
}) => {
  const [displaySites, setDisplaySites] = useState<SiteItem[]>(sites);
  const [draggingSiteId, setDraggingSiteId] = useState<string | null>(null);
  const [justDroppedSiteId, setJustDroppedSiteId] = useState<string | null>(null);
  const [slideAnim, setSlideAnim] = useState<'left' | 'right' | null>(null);
  const prevPageIdRef = useRef<string | undefined>(activeGridPageId);

  useEffect(() => {
    if (activeGridPageId && prevPageIdRef.current && prevPageIdRef.current !== activeGridPageId) {
      const oldIdx = gridPages?.findIndex((p) => p.id === prevPageIdRef.current) ?? 0;
      const newIdx = gridPages?.findIndex((p) => p.id === activeGridPageId) ?? 0;
      setSlideAnim(newIdx > oldIdx ? 'right' : 'left');
      const timer = setTimeout(() => setSlideAnim(null), 250);
      prevPageIdRef.current = activeGridPageId;
      return () => clearTimeout(timer);
    }
    prevPageIdRef.current = activeGridPageId;
  }, [activeGridPageId, gridPages]);

  // Refs for callbacks to avoid breaking React.memo on SiteCards
  const displaySitesRef = useRef<SiteItem[]>(sites);
  const draggingSiteIdRef = useRef<string | null>(null);

  useEffect(() => {
    displaySitesRef.current = displaySites;
  }, [displaySites]);

  useEffect(() => {
    draggingSiteIdRef.current = draggingSiteId;
  }, [draggingSiteId]);
  const cardSize = settings.cardSize || 110;

  // DOM node references and previous bounding rects for FLIP animation
  const cardElements = useRef<Map<string, HTMLDivElement>>(new Map());
  const prevRects = useRef<Map<string, DOMRect>>(new Map());
  const lastSwapTime = useRef<number>(0);

  // Record bounding rects before reordering
  const recordRects = () => {
    const rects = new Map<string, DOMRect>();
    cardElements.current.forEach((el, id) => {
      if (el) {
        rects.set(id, el.getBoundingClientRect());
      }
    });
    prevRects.current = rects;
  };

  // FLIP Animation: Smoothly glide cards to their new visual positions
  useLayoutEffect(() => {
    if (prevRects.current.size === 0) return;

    const movedElements: HTMLDivElement[] = [];

    cardElements.current.forEach((el, id) => {
      const oldRect = prevRects.current.get(id);
      if (!oldRect || !el) return;

      const newRect = el.getBoundingClientRect();
      const dx = oldRect.left - newRect.left;
      const dy = oldRect.top - newRect.top;

      if (dx !== 0 || dy !== 0) {
        // Invert: snap element to previous visual position
        el.style.transform = `translate(${dx}px, ${dy}px)`;
        el.style.transition = 'none';
        movedElements.push(el);
      }
    });

    if (movedElements.length > 0) {
      // Play: smoothly slide all moved cards to new positions in a single unified animation frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          for (let i = 0; i < movedElements.length; i++) {
            const el = movedElements[i];
            el.style.transition = 'transform 320ms cubic-bezier(0.25, 1, 0.5, 1)';
            el.style.transform = '';
          }
        });
      });
    }

    prevRects.current.clear();
  }, [displaySites]);

  // Sync displaySites when sites prop changes outside of active drag
  useEffect(() => {
    if (!draggingSiteId) {
      setDisplaySites(sites);
    }
  }, [sites, draggingSiteId]);

  const handleDragStart = useCallback((e: React.DragEvent, siteId: string) => {
    setDraggingSiteId(siteId);
    lastSwapTime.current = Date.now();
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', siteId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, targetSiteId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const currentDragId = draggingSiteIdRef.current;
    if (!currentDragId || currentDragId === targetSiteId) return;

    // 1. Swap Debounce Cooldown
    const now = Date.now();
    if (now - lastSwapTime.current < 200) {
      return;
    }

    const currentDisplaySites = displaySitesRef.current;
    const fromIndex = currentDisplaySites.findIndex((s) => s.id === currentDragId);
    const toIndex = currentDisplaySites.findIndex((s) => s.id === targetSiteId);
    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return;

    // 2. Midpoint Hysteresis
    const targetEl = cardElements.current.get(targetSiteId);
    if (targetEl) {
      const rect = targetEl.getBoundingClientRect();
      const midX = rect.left + rect.width / 2;

      if (fromIndex < toIndex && e.clientX < midX) return;
      if (fromIndex > toIndex && e.clientX > midX) return;
    }

    lastSwapTime.current = now;
    recordRects();

    setDisplaySites((prev) => {
      const fIdx = prev.findIndex((s) => s.id === currentDragId);
      const tIdx = prev.findIndex((s) => s.id === targetSiteId);
      if (fIdx === -1 || tIdx === -1 || fIdx === tIdx) return prev;

      const next = [...prev];
      const [moved] = next.splice(fIdx, 1);
      next.splice(tIdx, 0, moved);
      return next;
    });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const currentDragId = draggingSiteIdRef.current;
    if (!currentDragId) return;
    draggingSiteIdRef.current = null;

    const committedSites = displaySitesRef.current.map((site, index) => ({
      ...site,
      sortOrder: index,
      updatedAt: Date.now(),
    }));

    onReorderSites(committedSites);
    setJustDroppedSiteId(currentDragId);
    setDraggingSiteId(null);

    setTimeout(() => {
      setJustDroppedSiteId(null);
    }, 550);
  }, [onReorderSites]);

  const handleDragEnd = useCallback(() => {
    const currentDragId = draggingSiteIdRef.current;
    if (!currentDragId) return;
    draggingSiteIdRef.current = null;

    const committedSites = displaySitesRef.current.map((site, index) => ({
      ...site,
      sortOrder: index,
      updatedAt: Date.now(),
    }));
    onReorderSites(committedSites);
    setJustDroppedSiteId(currentDragId);
    setDraggingSiteId(null);

    setTimeout(() => {
      setJustDroppedSiteId(null);
    }, 550);
  }, [onReorderSites]);

  const showCardBg = settings.showCardBackground !== false;
  const showTitle = settings.showSiteTitle !== false;
  const iconSpacing = settings.iconSpacing ?? 20;
  const iconRatio = settings.iconSizeRatio || 0.42;
  const iconBoxSize = Math.max(24, Math.round(cardSize * iconRatio));
  const cellWidth = showCardBg
    ? cardSize
    : showTitle
    ? Math.max(iconBoxSize + 16, Math.min(cardSize, Math.round(iconBoxSize + 8 + iconSpacing * 0.9)))
    : iconBoxSize + 16;
  const gap = showCardBg ? Math.max(12, Math.round(cardSize * 0.14)) : iconSpacing;
  const maxPerRow = settings.maxCardsPerRow || 8;
  const gridMaxWidth = maxPerRow * cellWidth + (maxPerRow - 1) * gap;
  const activePageIndex = gridPages && activeGridPageId
    ? Math.max(0, gridPages.findIndex((p) => p.id === activeGridPageId))
    : 0;

  return (
    <div
      id="mytab-cards"
      className="relative w-full max-w-7xl mx-auto px-4 py-3 flex flex-col items-center"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      {/* Floating Side Nav Arrows (Desktop) */}
      {gridPages && gridPages.length > 1 && onSelectPage && (
        <>
          {activePageIndex > 0 && (
            <button
              type="button"
              onClick={() => onSelectPage(gridPages[activePageIndex - 1].id)}
              className={`hidden md:flex items-center justify-center absolute left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full backdrop-blur-md border transition-all cursor-pointer shadow-lg active:scale-95 ${
                isLight
                  ? 'bg-white/70 hover:bg-white/95 text-slate-700 border-black/10'
                  : 'bg-black/30 hover:bg-black/60 text-white/80 hover:text-white border-white/15'
              }`}
              title={t('prevPage', settings.language)}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {activePageIndex < gridPages.length - 1 && (
            <button
              type="button"
              onClick={() => onSelectPage(gridPages[activePageIndex + 1].id)}
              className={`hidden md:flex items-center justify-center absolute right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full backdrop-blur-md border transition-all cursor-pointer shadow-lg active:scale-95 ${
                isLight
                  ? 'bg-white/70 hover:bg-white/95 text-slate-700 border-black/10'
                  : 'bg-black/30 hover:bg-black/60 text-white/80 hover:text-white border-white/15'
              }`}
              title={t('nextPage', settings.language)}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </>
      )}

      {/* Cards Grid Container with horizontal sliding transition */}
      <div
        className={`w-full flex justify-center transition-all duration-200 ${
          slideAnim === 'right'
            ? 'animate-in slide-in-from-right-8 fade-in-50 duration-200'
            : slideAnim === 'left'
            ? 'animate-in slide-in-from-left-8 fade-in-50 duration-200'
            : ''
        }`}
      >
        <div
          className="flex flex-wrap justify-center items-center mx-auto"
          style={{
            gap: `${gap}px`,
            maxWidth: `${gridMaxWidth}px`,
          }}
        >
          {displaySites.map((site, index) => (
            <SiteCard
              key={site.id}
              ref={(el) => {
                if (el) {
                  cardElements.current.set(site.id, el);
                } else {
                  cardElements.current.delete(site.id);
                }
              }}
              site={site}
              index={index}
              settings={settings}
              resolvedColors={resolvedColors}
              isLight={isLight}
              isDragging={draggingSiteId === site.id}
              isAnyDragging={Boolean(draggingSiteId)}
              isJustDropped={justDroppedSiteId === site.id}
              onEdit={onEditSite}
              onDelete={onDeleteSite}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
            />
          ))}

          {displaySites.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-white/50 space-y-3">
              <p className="text-xs">{t('noSitesInCategory', settings.language)}</p>
              <button
                type="button"
                onClick={onAddSite}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/15 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t('addSite', settings.language)}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Multi-Page Indicator & Controls */}
      {gridPages && gridPages.length > 0 && activeGridPageId && (
        <GridPageIndicator
          gridPages={gridPages}
          activeGridPageId={activeGridPageId}
          settings={settings}
          resolvedColors={resolvedColors}
          isLight={isLight}
          onSelectPage={onSelectPage || (() => {})}
          onAddPage={onAddPage || (() => {})}
          onRenamePage={onRenamePage || (() => {})}
          onDeletePage={onDeletePage || (() => {})}
        />
      )}
    </div>
  );
});
