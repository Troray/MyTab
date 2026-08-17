import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Plus } from 'lucide-react';
import { SiteItem, ThemeSettings } from '../../types';
import { SiteCard } from './SiteCard';
import { t } from '../../utils/i18n';

interface SiteGridProps {
  sites: SiteItem[];
  settings: ThemeSettings;
  onEditSite: (site: SiteItem) => void;
  onDeleteSite: (siteId: string) => void;
  onAddSite: () => void;
  onReorderSites: (newSites: SiteItem[]) => void;
}

export const SiteGrid: React.FC<SiteGridProps> = React.memo(({
  sites,
  settings,
  onEditSite,
  onDeleteSite,
  onAddSite,
  onReorderSites,
}) => {
  const [displaySites, setDisplaySites] = useState<SiteItem[]>(sites);
  const [draggingSiteId, setDraggingSiteId] = useState<string | null>(null);
  const [justDroppedSiteId, setJustDroppedSiteId] = useState<string | null>(null);
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

        // Play: smoothly slide to new position in the next animation frame
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            el.style.transition = 'transform 320ms cubic-bezier(0.25, 1, 0.5, 1)';
            el.style.transform = '';
          });
        });
      }
    });

    prevRects.current.clear();
  }, [displaySites]);

  // Sync displaySites when sites prop changes outside of active drag
  useEffect(() => {
    if (!draggingSiteId) {
      setDisplaySites(sites);
    }
  }, [sites, draggingSiteId]);

  const handleDragStart = (e: React.DragEvent, siteId: string) => {
    setDraggingSiteId(siteId);
    lastSwapTime.current = Date.now();
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', siteId);
  };

  const handleDragOver = (e: React.DragEvent, targetSiteId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (!draggingSiteId || draggingSiteId === targetSiteId) return;

    // 1. Swap Debounce Cooldown (prevents high-frequency flip-flop ping-pong)
    const now = Date.now();
    if (now - lastSwapTime.current < 200) {
      return;
    }

    const fromIndex = displaySites.findIndex((s) => s.id === draggingSiteId);
    const toIndex = displaySites.findIndex((s) => s.id === targetSiteId);
    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return;

    // 2. Midpoint Hysteresis (only trigger swap when passing through the target card center)
    const targetEl = cardElements.current.get(targetSiteId);
    if (targetEl) {
      const rect = targetEl.getBoundingClientRect();
      const midX = rect.left + rect.width / 2;

      // If dragging from left to right, pointer must pass beyond target midpoint
      if (fromIndex < toIndex && e.clientX < midX) {
        return;
      }
      // If dragging from right to left, pointer must pass before target midpoint
      if (fromIndex > toIndex && e.clientX > midX) {
        return;
      }
    }

    lastSwapTime.current = now;
    recordRects();

    setDisplaySites((prev) => {
      const fIdx = prev.findIndex((s) => s.id === draggingSiteId);
      const tIdx = prev.findIndex((s) => s.id === targetSiteId);
      if (fIdx === -1 || tIdx === -1 || fIdx === tIdx) return prev;

      const next = [...prev];
      const [moved] = next.splice(fIdx, 1);
      next.splice(tIdx, 0, moved);
      return next;
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggingSiteId) return;

    const currentDragId = draggingSiteId;
    const committedSites = displaySites.map((site, index) => ({
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
  };

  const handleDragEnd = () => {
    if (draggingSiteId) {
      const currentDragId = draggingSiteId;
      const committedSites = displaySites.map((site, index) => ({
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
    }
  };

  const gap = Math.max(12, Math.round(cardSize * 0.14));
  const maxPerRow = settings.maxCardsPerRow || 8;
  const gridMaxWidth = maxPerRow * cardSize + (maxPerRow - 1) * gap;

  return (
    <div
      className="w-full max-w-7xl mx-auto px-4 py-4 flex justify-center"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
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
            <p className="text-xs">{settings.language === 'zh-CN' ? '当前分类下暂无快捷方式' : 'No shortcuts in this category'}</p>
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
  );
});
