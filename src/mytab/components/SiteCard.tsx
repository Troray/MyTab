import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Edit2, Trash2, FolderInput } from 'lucide-react';
import { SiteItem, ThemeSettings, GridPage } from '../../types';
import { ResolvedTextColors } from '../../utils/wallpaperAnalyzer';
import { generateFallbackIcon } from '../../services/metadata';
import { t } from '../../utils/i18n';
import { getSiteDisplayName, getGridPageDisplayName } from '../../utils/constants';

interface SiteCardProps {
  site: SiteItem;
  index: number;
  settings: ThemeSettings;
  resolvedColors?: ResolvedTextColors;
  isLight?: boolean;
  isDragging?: boolean;
  isAnyDragging?: boolean;
  isJustDropped?: boolean;
  gridPages?: GridPage[];
  activeGridPageId?: string;
  currentPageId?: string;
  onEdit: (site: SiteItem) => void;
  onDelete: (siteId: string) => void;
  onMoveSiteToPage?: (siteId: string, targetPageId: string) => void;
  onDragStart: (e: React.DragEvent, siteId: string) => void;
  onDragOver: (e: React.DragEvent, siteId: string) => void;
  onDrop: (e: React.DragEvent, targetSiteId?: string) => void;
  onDragEnd: () => void;
}

export const SiteCard = React.memo(React.forwardRef<HTMLDivElement, SiteCardProps>(({
  site,
  index,
  settings,
  resolvedColors,
  isLight: propsIsLight,
  isDragging,
  isAnyDragging,
  isJustDropped,
  gridPages,
  activeGridPageId,
  currentPageId,
  onEdit,
  onDelete,
  onMoveSiteToPage,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}, ref) => {
  const [imgError, setImgError] = useState(false);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuPos) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuPos(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuPos(null);
      }
    };

    const handleScroll = () => {
      setMenuPos(null);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [menuPos]);

  const iconSrc = imgError || !site.icon ? generateFallbackIcon(site.title || site.url) : site.icon;
  const cardSize = settings.cardSize || 110;
  const iconRatio = settings.iconSizeRatio ?? 0.55;
  const isLight =
    propsIsLight !== undefined
      ? propsIsLight
      : settings.mode === 'light' ||
        (settings.mode === 'system' &&
          typeof window !== 'undefined' &&
          !window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Responsive scaling calculations based on cardSize and custom icon ratio
  const iconBoxSize = Math.max(24, Math.round(cardSize * iconRatio));
  const iconImgSize = Math.max(16, Math.round(iconBoxSize * 0.70));
  const paddingPx = Math.max(6, Math.round(cardSize * 0.10));

  const handleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.site-card-action')) {
      return;
    }

    if (settings.openInNewTab) {
      window.open(site.url, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = site.url;
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const menuWidth = 180;
    const menuHeight = 160;
    const x = Math.min(e.clientX, window.innerWidth - menuWidth - 8);
    const y = Math.min(e.clientY, window.innerHeight - menuHeight - 8);
    setMenuPos({ x, y });
  };

  const internalCardRef = useRef<HTMLDivElement | null>(null);

  const setCardRef = useCallback((el: HTMLDivElement | null) => {
    internalCardRef.current = el;
    if (typeof ref === 'function') {
      ref(el);
    } else if (ref && 'current' in ref) {
      (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
    }
  }, [ref]);

  useEffect(() => {
    const el = internalCardRef.current;
    if (!el) return;
    const protectDragStart = (e: DragEvent) => {
      // Disarm preventDefault so parent carousel listeners (e.g. Embla) do not abort HTML5 drag
      e.preventDefault = () => {};
    };
    el.addEventListener('dragstart', protectDragStart);
    return () => el.removeEventListener('dragstart', protectDragStart);
  }, []);

  const handleDragStartInternal = (e: React.DragEvent<HTMLDivElement>) => {
    setMenuPos(null);
    if (e.currentTarget) {
      const w = e.currentTarget.offsetWidth;
      const h = e.currentTarget.offsetHeight;
      if (e.dataTransfer.setDragImage) {
        e.dataTransfer.setDragImage(e.currentTarget, w / 2, h / 2);
      }
    }
    onDragStart(e, site.id);
  };

  const jiggleClass =
    isAnyDragging && !isDragging
      ? index % 2 === 0
        ? 'ios-jiggle-even'
        : 'ios-jiggle-odd'
      : '';

  const showCardBg = settings.showCardBackground ?? false;
  const showTitle = settings.showSiteTitle !== false;
  const iconSpacing = settings.iconSpacing ?? 20;

  // When card background is off, cell wraps the icon compactly according to icon spacing
  const cellWidth = showCardBg
    ? cardSize
    : showTitle
    ? Math.max(iconBoxSize + 16, Math.min(cardSize, Math.round(iconBoxSize + 8 + iconSpacing * 0.9)))
    : iconBoxSize + 16;
  const cellHeight = showCardBg ? cardSize : Math.round(iconBoxSize + (showTitle ? 28 : 14));

  return (
    <div
      ref={setCardRef}
      data-site-card="true"
      draggable
      onDragStart={handleDragStartInternal}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver(e, site.id);
      }}
      onDrop={(e) => {
        onDrop(e, site.id);
      }}
      onDragEnd={onDragEnd}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      style={{
        width: `${cellWidth}px`,
        minHeight: `${cellHeight}px`,
      }}
      className={`relative shrink-0 select-none cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-30 scale-95 will-change-transform' : isJustDropped ? 'will-change-transform' : ''
      }`}
    >
      {/* Inner Animated Visual Card Layer */}
      <div
        style={{
          width: '100%',
          minHeight: `${cellHeight}px`,
          background: !showCardBg
            ? 'transparent'
            : isDragging
            ? isLight
              ? 'rgba(0, 0, 0, 0.06)'
              : 'rgba(255, 255, 255, 0.15)'
            : isJustDropped
            ? isLight
              ? 'rgba(0, 0, 0, 0.08)'
              : 'rgba(255, 255, 255, 0.18)'
            : isLight
            ? `rgba(255, 255, 255, ${settings.cardOpacity})`
            : `rgba(255, 255, 255, ${settings.cardOpacity})`,
          padding: showCardBg ? `${paddingPx}px` : '5px 3px',
        }}
        className={`group relative flex flex-col items-center justify-center rounded-2xl border duration-0 transition-all h-full w-full ${jiggleClass} ${
          isDragging
            ? 'ios-dragged border-amber-500/60 ring-2 ring-amber-500/30'
            : isJustDropped
            ? 'ios-drop-spring border-amber-500/80 ring-2 ring-amber-500/40'
            : !showCardBg
            ? 'border-transparent hover:border-transparent'
            : isLight
            ? 'border-black/[0.06] hover:border-black/15 shadow-md shadow-black/[0.04] hover:shadow-xl hover:shadow-black/[0.08]'
            : 'border-white/10 hover:border-white/30 shadow-md shadow-black/20'
        }`}
      >
        {/* Instant Kanban-style Card Surface Highlight Overlay (0ms latency visual feedback) */}
        {showCardBg && !isDragging && (
          <div
            className={`absolute inset-0 rounded-2xl pointer-events-none duration-0 transition-colors ${
              isLight
                ? 'group-hover:bg-white/55 group-active:bg-white/70'
                : 'group-hover:bg-white/[0.14] group-active:bg-white/[0.20]'
            }`}
          />
        )}

        {/* Icon Inset Container */}
        <div
          style={{ width: `${iconBoxSize}px`, height: `${iconBoxSize}px` }}
          className={`rounded-xl flex items-center justify-center overflow-hidden shrink-0 pointer-events-none duration-0 transition-all ${
            showTitle ? 'mb-2' : ''
          } ${
            showCardBg
              ? isLight
                ? 'bg-white/60 border border-black/[0.05] shadow-sm group-hover:bg-white group-hover:border-black/15 group-hover:shadow-md group-hover:shadow-black/[0.08]'
                : 'bg-white/[0.08] border border-white/10 shadow-inner group-hover:bg-white/[0.16] group-hover:border-white/25'
              : isLight
              ? 'bg-white/80 border border-black/[0.08] shadow-md shadow-black/10 group-hover:bg-white group-hover:shadow-xl group-hover:shadow-black/15 group-hover:border-black/20 group-hover:ring-2 group-hover:ring-white/90 group-active:bg-white/95'
              : 'bg-white/[0.14] border border-white/15 shadow-md shadow-black/30 group-hover:bg-white/[0.25] group-hover:border-white/35 group-active:bg-white/[0.30]'
          }`}
        >
          <img
            src={iconSrc}
            alt={getSiteDisplayName(site, settings.language)}
            draggable={false}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            style={{ width: `${iconImgSize}px`, height: `${iconImgSize}px` }}
            className="object-contain rounded-md select-none pointer-events-none"
            loading="lazy"
          />
        </div>

        {/* Site Title */}
        {showTitle && (
          <span
            draggable={false}
            style={{
              fontSize: cardSize < 95 ? '11px' : cardSize > 130 ? '14px' : '12px',
              color: resolvedColors?.cards,
            }}
            className={`font-medium truncate max-w-full text-center tracking-wide px-1 select-none pointer-events-none duration-0 ${
              resolvedColors?.cardShadow || (isLight ? 'text-slate-800 group-hover:text-black' : 'text-white/90 group-hover:text-white drop-shadow')
            }`}
          >
            {getSiteDisplayName(site, settings.language)}
          </span>
        )}

        {/* Custom Desktop Context Menu (Triggered by Right-Click) */}
        {menuPos && typeof document !== 'undefined' && createPortal(
          <div
            ref={menuRef}
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            style={{
              top: `${menuPos.y}px`,
              left: `${menuPos.x}px`,
            }}
            className={`glass-dropdown fixed min-w-[160px] max-w-[220px] py-1.5 rounded-xl border shadow-2xl z-[9999] animate-scale-in text-xs font-medium overflow-hidden select-none ${
              isLight
                ? 'border-black/10 shadow-black/15 text-slate-800'
                : 'border-white/15 shadow-black/50 text-white'
            }`}
          >
            <button
              type="button"
              onClick={() => {
                setMenuPos(null);
                onEdit(site);
              }}
              className={`flex items-center gap-2.5 w-full px-3 py-2 text-left transition-colors cursor-pointer ${
                isLight
                  ? 'text-slate-700 hover:bg-black/5 hover:text-slate-900'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Edit2 className="w-3.5 h-3.5 shrink-0" />
              <span>{t('editSite', settings.language)}</span>
            </button>

            {/* Move to another desktop options */}
            {gridPages && gridPages.length > 1 && onMoveSiteToPage && (() => {
              const currentDesktopId =
                currentPageId ||
                (site.pageId && gridPages.some((p) => p.id === site.pageId) ? site.pageId : undefined) ||
                (activeGridPageId && gridPages.some((p) => p.id === activeGridPageId) ? activeGridPageId : undefined) ||
                gridPages[0]?.id;
              const targetPages = gridPages.filter((p) => p.id !== currentDesktopId);
              if (targetPages.length === 0) return null;

              return (
                <>
                  <div className={`my-1 border-t ${isLight ? 'border-black/5' : 'border-white/10'}`} />
                  {targetPages.map((page) => {
                    const originalIdx = gridPages.findIndex((gp) => gp.id === page.id);
                    const pageDisplayName = getGridPageDisplayName(page, originalIdx, settings.language);
                    return (
                      <button
                        key={page.id}
                        type="button"
                        onClick={() => {
                          setMenuPos(null);
                          onMoveSiteToPage(site.id, page.id);
                        }}
                        className={`flex items-center gap-2.5 w-full px-3 py-2 text-left transition-colors cursor-pointer ${
                          isLight
                            ? 'text-slate-700 hover:bg-black/5 hover:text-slate-900'
                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                        }`}
                        title={`${t('moveToDesktop', settings.language)}: ${pageDisplayName}`}
                      >
                        <FolderInput className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="truncate">
                          {t('moveToDesktop', settings.language)}: {pageDisplayName}
                        </span>
                      </button>
                    );
                  })}
                  <div className={`my-1 border-t ${isLight ? 'border-black/5' : 'border-white/10'}`} />
                </>
              );
            })()}

            <button
              type="button"
              onClick={() => {
                setMenuPos(null);
                onDelete(site.id);
              }}
              className={`flex items-center gap-2.5 w-full px-3 py-2 text-left transition-colors cursor-pointer ${
                isLight
                  ? 'text-red-600 hover:bg-red-50'
                  : 'text-red-400 hover:bg-red-500/10'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5 shrink-0" />
              <span>{t('deleteSite', settings.language)}</span>
            </button>
          </div>,
          document.body
        )}
      </div>
    </div>
  );
}));
