import React, { useState, useEffect, useRef, useLayoutEffect, useCallback, useMemo } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Plus } from 'lucide-react';
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
  const defaultPageId = gridPages?.[0]?.id || 'page-1';

  const pagesToRender = useMemo(() => {
    if (gridPages && gridPages.length > 0) {
      return gridPages;
    }
    return [{ id: defaultPageId, name: `${t('defaultDesktopName', settings.language)} 1`, sortOrder: 0 }];
  }, [gridPages, defaultPageId, settings.language]);

  const activePageIndex = Math.max(
    0,
    pagesToRender.findIndex((p) => p.id === activeGridPageId)
  );

  // Partition sites by desktop page for seamless continuous track rendering
  const sitesByPage = useMemo(() => {
    const map = new Map<string, SiteItem[]>();
    for (const p of pagesToRender) {
      map.set(p.id, []);
    }
    for (const s of sites) {
      const pId = s.pageId || defaultPageId;
      const list = map.get(pId);
      if (list) {
        list.push(s);
      } else {
        const firstList = map.get(defaultPageId);
        if (firstList) {
          firstList.push(s);
        } else {
          map.set(pId, [s]);
        }
      }
    }
    return map;
  }, [sites, pagesToRender, defaultPageId]);

  const currentActivePageSites = useMemo(() => {
    return sitesByPage.get(activeGridPageId || defaultPageId) || [];
  }, [sitesByPage, activeGridPageId, defaultPageId]);

  const [displaySites, setDisplaySites] = useState<SiteItem[]>(currentActivePageSites);
  const [draggingSiteId, setDraggingSiteId] = useState<string | null>(null);
  const [justDroppedSiteId, setJustDroppedSiteId] = useState<string | null>(null);

  // Sync displaySites when currentActivePageSites changes outside of active drag
  useEffect(() => {
    if (!draggingSiteId) {
      setDisplaySites(currentActivePageSites);
    }
  }, [currentActivePageSites, draggingSiteId]);

  // Refs for callbacks to avoid breaking React.memo on SiteCards
  const displaySitesRef = useRef<SiteItem[]>(currentActivePageSites);
  const draggingSiteIdRef = useRef<string | null>(null);

  useEffect(() => {
    displaySitesRef.current = draggingSiteId ? displaySites : currentActivePageSites;
  }, [displaySites, currentActivePageSites, draggingSiteId]);

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

  const handleDragStart = useCallback((e: React.DragEvent, siteId: string) => {
    draggingSiteIdRef.current = siteId;
    displaySitesRef.current = currentActivePageSites;
    setDisplaySites(currentActivePageSites);
    setDraggingSiteId(siteId);
    lastSwapTime.current = Date.now();
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', siteId);
  }, [currentActivePageSites]);

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
    const currentDragId = draggingSiteIdRef.current || draggingSiteId;
    draggingSiteIdRef.current = null;
    if (currentDragId) {
      const committedSites = displaySitesRef.current.map((site, index) => ({
        ...site,
        sortOrder: index,
        updatedAt: Date.now(),
      }));

      onReorderSites(committedSites);
      setJustDroppedSiteId(currentDragId);
    }
    setDraggingSiteId(null);

    setTimeout(() => {
      setJustDroppedSiteId(null);
    }, 550);
  }, [draggingSiteId, onReorderSites]);

  const handleDragEnd = useCallback(() => {
    const currentDragId = draggingSiteIdRef.current || draggingSiteId;
    draggingSiteIdRef.current = null;
    if (currentDragId) {
      const committedSites = displaySitesRef.current.map((site, index) => ({
        ...site,
        sortOrder: index,
        updatedAt: Date.now(),
      }));
      onReorderSites(committedSites);
      setJustDroppedSiteId(currentDragId);
    }
    setDraggingSiteId(null);

    setTimeout(() => {
      setJustDroppedSiteId(null);
    }, 550);
  }, [draggingSiteId, onReorderSites]);

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

  // Embla Carousel Integration for authentic mobile-grade momentum & spring swipe
  const initialIndexRef = useRef(activePageIndex);
  const pagesCountRef = useRef(pagesToRender.length);

  useEffect(() => {
    pagesCountRef.current = pagesToRender.length;
  }, [pagesToRender.length]);

  // Static options so useEmblaCarousel NEVER triggers reInit() on page index changes!
  const emblaOptions = useMemo(
    () => ({
      loop: false,
      duration: 35,
      skipSnaps: false,
      startIndex: initialIndexRef.current,
      watchDrag: (_emblaApi: any, evt: MouseEvent | TouchEvent) => {
        if (pagesCountRef.current <= 1) return false;
        const target = evt.target as HTMLElement | null;
        if (!target) return true;
        // Do not start carousel drag if interacting with a card, button, link, form control, modal, etc.
        if (
          target.closest('[data-site-card]') ||
          target.closest('button') ||
          target.closest('a') ||
          target.closest('input') ||
          target.closest('textarea') ||
          target.closest('select') ||
          target.closest('[role="dialog"]') ||
          target.closest('[role="menu"]')
        ) {
          return false;
        }
        return true;
      },
    }),
    []
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(emblaOptions);

  // Embla Tween Scale & Opacity for authentic iOS/iPadOS/Android launcher depth
  const applyTween = useCallback(() => {
    if (!emblaApi) return;
    const scrollProgress = emblaApi.scrollProgress();
    const scrollSnaps = emblaApi.scrollSnapList();
    const slideNodes = emblaApi.slideNodes();
    const pagesCount = scrollSnaps.length;

    if (pagesCount <= 1 || !slideNodes || slideNodes.length === 0) {
      slideNodes?.forEach((node) => {
        const inner = node.querySelector<HTMLElement>('.embla-slide-inner');
        if (inner) {
          inner.style.transform = '';
          inner.style.opacity = '';
        }
      });
      return;
    }

    scrollSnaps.forEach((scrollSnap, snapIndex) => {
      const slideNode = slideNodes[snapIndex];
      if (!slideNode) return;
      const inner = slideNode.querySelector<HTMLElement>('.embla-slide-inner');
      if (!inner) return;

      const diffToTarget = Math.abs(scrollSnap - scrollProgress) * (pagesCount - 1);
      const normalizedDiff = Math.min(Math.max(diffToTarget, 0), 1);
      // Cosine easing creates smooth deceleration near 0
      const factor = Math.cos(normalizedDiff * Math.PI * 0.5);

      const scale = 0.90 + 0.10 * factor;
      const opacity = 0.25 + 0.75 * factor;

      inner.style.transform = `scale(${scale.toFixed(4)})`;
      inner.style.opacity = opacity.toFixed(4);
    });
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    applyTween();
    emblaApi.on('init', applyTween);
    emblaApi.on('scroll', applyTween);
    emblaApi.on('reInit', applyTween);
    emblaApi.on('settle', applyTween);

    return () => {
      emblaApi.off('init', applyTween);
      emblaApi.off('scroll', applyTween);
      emblaApi.off('reInit', applyTween);
      emblaApi.off('settle', applyTween);
    };
  }, [emblaApi, applyTween]);

  // Sync active page when user drags/swipes Embla to another slide
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const index = emblaApi.selectedScrollSnap();
    const targetPage = pagesToRender[index];
    if (targetPage && targetPage.id !== activeGridPageId && onSelectPage) {
      onSelectPage(targetPage.id);
    }
  }, [emblaApi, pagesToRender, activeGridPageId, onSelectPage]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Sync Embla scroll position when activeGridPageId changes externally (e.g. indicator dots, keyboard)
  useEffect(() => {
    if (!emblaApi) return;
    const currentIndex = emblaApi.selectedScrollSnap();
    if (currentIndex !== activePageIndex) {
      emblaApi.scrollTo(activePageIndex);
    }
  }, [emblaApi, activePageIndex]);

  // Re-init Embla when pages count changes
  useEffect(() => {
    if (emblaApi) {
      emblaApi.reInit();
    }
  }, [emblaApi, pagesToRender.length]);

  return (
    <div className="w-full flex-1 flex flex-col items-center">
      {/* Embla Viewport */}
      <div
        id="mytab-cards"
        ref={emblaRef}
        className="relative flex-1 w-full max-w-7xl mx-auto px-4 pt-3 pb-28 min-h-[min(540px,calc(100vh-320px))] overflow-hidden cursor-default"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {/* Embla Container */}
        <div className="flex flex-row w-full min-h-full touch-pan-y">
          {pagesToRender.map((page: GridPage) => {
            const isCurrent = page.id === (activeGridPageId || defaultPageId);
            const pageSites = isCurrent && draggingSiteId
              ? displaySites
              : (sitesByPage.get(page.id) || []);

            return (
              <div
                key={page.id}
                className="flex-[0_0_100%] min-w-0 flex flex-col items-center min-h-full"
              >
                <div
                  className="embla-slide-inner w-full flex flex-col items-center will-change-[transform,opacity]"
                  style={{
                    transformOrigin: 'center 35%',
                  }}
                >
                  <div
                    className="flex flex-wrap justify-center items-center mx-auto w-full"
                    style={{
                      gap: `${gap}px`,
                      maxWidth: `${gridMaxWidth}px`,
                    }}
                  >
                    {pageSites.map((site: SiteItem, index: number) => (
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

                    {pageSites.length === 0 && (
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
              </div>
            );
          })}
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
