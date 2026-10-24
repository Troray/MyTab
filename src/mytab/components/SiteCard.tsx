import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Edit2, Trash2, FolderInput, Globe, Home, Maximize2, ExternalLink } from 'lucide-react';
import { SiteItem, ThemeSettings, GridPage } from '../../types';
import { ResolvedTextColors } from '../../utils/wallpaperAnalyzer';
import { generateFallbackIcon } from '../../services/metadata';
import { t } from '../../utils/i18n';
import {
  getSiteDisplayName,
  getGridPageDisplayName,
  resolveSiteUrl,
  getEffectiveIconSize,
  getEffectiveIconBg,
  isColorDark,
} from '../../utils/constants';

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
  customWidth?: number | string;
  customHeight?: number | string;
  disableInternalDrag?: boolean;
  isEditing?: boolean;
  onApplySizeToAll?: (siteId: string) => void;
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
  customWidth,
  customHeight,
  disableInternalDrag,
  isEditing = false,
  onApplySizeToAll,
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
  const pointerDownPos = useRef<{ x: number; y: number } | null>(null);
  const hasDragged = useRef(false);
  const lastClickTime = useRef(0);
  const [cardDims, setCardDims] = useState<{ w: number; h: number }>({ w: 100, h: 100 });

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

  const targetUrl = resolveSiteUrl(site, settings.networkMode);
  const showBadge = settings.showNetworkBadge !== false;
  const hasDualUrl = showBadge && Boolean(site.url && site.urlLan);
  const isOnlyLan = showBadge && !site.url && Boolean(site.urlLan);
  const isCurrentLan = settings.networkMode === 'lan';
  const iconSrc = imgError || !site.icon ? generateFallbackIcon(site.title || targetUrl) : site.icon;
  const cardSize = settings.cardSize || 110;
  const iconRatio = settings.iconSizeRatio ?? 0.60;
  const isLight =
    propsIsLight !== undefined
      ? propsIsLight
      : settings.mode === 'light' ||
        (settings.mode === 'system' &&
          typeof window !== 'undefined' &&
          !window.matchMedia('(prefers-color-scheme: dark)').matches);

  const handleClick = (e?: React.MouseEvent) => {
    if (e && ((e.target as HTMLElement).closest('.site-card-action') || (e.target as HTMLElement).closest('.glass-dropdown'))) {
      return;
    }

    if (!targetUrl) return;

    if (settings.openInNewTab) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = targetUrl;
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('.glass-dropdown, .site-card-action')) {
      pointerDownPos.current = null;
      return;
    }
    if (e.button === 0) {
      pointerDownPos.current = { x: e.clientX, y: e.clientY };
      hasDragged.current = false;
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (pointerDownPos.current) {
      const dx = Math.abs(e.clientX - pointerDownPos.current.x);
      const dy = Math.abs(e.clientY - pointerDownPos.current.y);
      if (dx >= 6 || dy >= 6) {
        hasDragged.current = true;
      }
    }
  };

  const handlePointerUp = () => {
    pointerDownPos.current = null;
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

  // Observe card actual dimensions to adapt between wide widget, tall widget, and standard icon tile
  useEffect(() => {
    const el = internalCardRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          setCardDims({
            w: Math.round(entry.contentRect.width),
            h: Math.round(entry.contentRect.height),
          });
        }
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = internalCardRef.current;
    if (!el || disableInternalDrag) return;
    const protectDragStart = (e: DragEvent) => {
      e.preventDefault = () => {};
    };
    el.addEventListener('dragstart', protectDragStart);
    return () => el.removeEventListener('dragstart', protectDragStart);
  }, [disableInternalDrag]);

  const handleDragStartInternal = (e: React.DragEvent<HTMLDivElement>) => {
    if (disableInternalDrag) return;
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

  const showTitle = settings.showSiteTitle !== false;
  const showTooltip = settings.gridShowTooltip !== false;

  // Layout mode adaptation:
  // - Wide widget (Fig 2): width >= 140px and aspect ratio >= 1.35 -> Icon on left, Title + Remarks on right
  // - Tall widget: height >= 135px and aspect ratio <= 0.75 -> Icon on top, Title in middle, Remarks below
  // - Standard tile: Icon on top, Title below
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1440;
  const targetIconSize = getEffectiveIconSize(viewportWidth, settings);

  // Invariant typography & spacing: strictly honors user settings without rubber-band viewport scaling
  const baseFontSize = settings.gridTitleFontSize || 14;
  const fontSizeNum = Math.max(10, baseFontSize);
  const titleFontSize = `${fontSizeNum}px`;
  const iconTextGap = Math.max(4, settings.gridIconTextGap ?? 8);
  const textLineGap = settings.gridTextLineGap ?? 2;

  // Layout mode adaptation:
  // - Wide banner: width >= 130px and aspect ratio >= 1.25 -> Icon on left, Title (+ Remarks/URL) on right
  // - Tall widget: height >= 125px and aspect ratio >= 1.3 -> Icon on top, Upright multi-line title, clean spacing
  // - Large square widget: width >= 115 && height >= 105 -> Enlarged square card with frosted container & scaled icon
  // - Standard classic tile: Icon on top, Title below
  const isWide = cardDims.w >= 130 && cardDims.w / Math.max(1, cardDims.h) >= 1.25;
  const isTall = !isWide && cardDims.h >= 125 && cardDims.h / Math.max(1, cardDims.w) >= 1.3;
  const isLargeSquare = !isWide && !isTall && cardDims.w >= 115 && cardDims.h >= 105;

  // Smart condition for wide card:
  // Lowered threshold so normal card heights comfortably display two lines (Title + Subtitle/URL)
  // without crowding, only collapsing to single line when height is strictly flat (< ~32px).
  const showWideSubtitle = cardDims.h >= Math.round(fontSizeNum * 1.35 + 14);

  // Adaptive line count for subtitle: when card height and width are sufficient, allow remarks/URL to wrap
  const maxSubtitleLines =
    cardDims.h >= 105 ? 4 : cardDims.h >= 75 ? 3 : cardDims.h >= 52 ? 2 : 1;

  // 1. Standard Classic Tile:
  // Clamped only if user manually resized the card boundaries smaller than targetIconSize
  const maxTileW = cardDims.w > 0 ? cardDims.w - 8 : targetIconSize + 16;
  const maxTileH = cardDims.h > 0 ? cardDims.h - fontSizeNum - iconTextGap - 8 : targetIconSize + 16;
  const iconBoxSize = Math.max(22, Math.min(targetIconSize, maxTileW, maxTileH));
  const iconImgSize = Math.max(20, Math.round(iconBoxSize * 0.90));

  // 2. Wide Banner Mode:
  // Consistent unified icon size, aligned on left, clamped to card height
  const maxWideH = cardDims.h > 0 ? cardDims.h - 8 : targetIconSize;
  const wideIconSize = Math.max(22, Math.min(targetIconSize, maxWideH));
  const wideIconImgSize = Math.max(20, Math.round(wideIconSize * 0.90));

  // 3. Large Square Mode:
  // Dynamically scale icon to fill available square space cleanly
  const squarePad = cardDims.w >= 180 ? 16 : 10;
  const squareAvailH = Math.max(
    32,
    cardDims.h - (showTitle ? fontSizeNum + iconTextGap + 8 : 0) - (cardDims.h >= 150 ? 22 : 0) - squarePad * 2
  );
  const squareAvailW = Math.max(32, cardDims.w - squarePad * 2);
  const maxSquareDim = Math.min(squareAvailW, squareAvailH);
  const squareIconBoxSize = Math.min(128, Math.max(targetIconSize, Math.round(maxSquareDim * 0.72)));
  const squareIconImgSize = Math.max(24, Math.round(squareIconBoxSize * 0.88));
  const squareTitleSize = Math.min(
    20,
    Math.max(fontSizeNum, Math.round(fontSizeNum * (1 + (squareIconBoxSize - targetIconSize) / 120)))
  );

  // 4. Tall Widget Mode:
  const maxTallW = cardDims.w > 0 ? cardDims.w - 12 : targetIconSize;
  const tallIconSize = Math.max(26, Math.min(targetIconSize, maxTallW, 52));
  const tallIconImgSize = Math.max(20, Math.round(tallIconSize * 0.88));
  const tallTitleSize = Math.min(14, Math.max(11, fontSizeNum));
  const availableTallTextHeight = Math.max(0, cardDims.h - tallIconSize - iconTextGap - 20);
  const canShowTallDoubleCol = cardDims.w >= 48 && availableTallTextHeight >= 35;

  const cellWidth = customWidth ?? cardSize;
  const cellHeight = customHeight ?? cardSize;
  const effectiveBg = getEffectiveIconBg(site, settings, isLight);

  // Card container background for wide banner and tall card layouts (that long strip)
  const stripContainerStyle: React.CSSProperties =
    effectiveBg.type === 'white'
      ? { backgroundColor: '#ffffff' }
      : effectiveBg.type === 'dark'
      ? { backgroundColor: '#0f172a' }
      : effectiveBg.type === 'transparent'
      ? { backgroundColor: 'transparent' }
      : effectiveBg.type === 'custom'
      ? {
          backgroundColor: effectiveBg.style.backgroundColor,
          borderColor: isLight ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.20)',
        }
      : {};

  const stripContainerClass =
    effectiveBg.type === 'white'
      ? 'bg-white border-black/[0.08] shadow-sm hover:shadow-md hover:border-black/15'
      : effectiveBg.type === 'dark'
      ? 'bg-slate-900 border-white/15 shadow-md shadow-black/40 hover:bg-slate-800 hover:border-white/25'
      : effectiveBg.type === 'transparent'
      ? 'bg-transparent border-transparent shadow-none hover:bg-white/5'
      : effectiveBg.type === 'custom'
      ? 'border shadow-md hover:shadow-lg'
      : isLight
      ? 'bg-white/75 border-black/[0.08] shadow-sm hover:shadow-md hover:bg-white/90 backdrop-blur-md'
      : 'bg-white/[0.13] border-white/10 shadow-md backdrop-blur-md hover:bg-white/[0.20]';

  const isCustomDark = effectiveBg.type === 'custom' && isColorDark(effectiveBg.style.backgroundColor as string);
  const isCustomLight = effectiveBg.type === 'custom' && !isCustomDark;

  const stripTitleColor =
    effectiveBg.type === 'white' || isCustomLight
      ? '#0f172a'
      : effectiveBg.type === 'dark' || isCustomDark
      ? '#ffffff'
      : resolvedColors?.cards;

  const stripTitleShadow =
    effectiveBg.type === 'white' || isCustomLight
      ? 'text-slate-900 font-semibold'
      : effectiveBg.type === 'dark' || isCustomDark
      ? 'text-white font-semibold'
      : resolvedColors?.cardShadow || (isLight ? 'text-slate-900' : 'text-white drop-shadow-sm');

  const stripDescColor =
    effectiveBg.type === 'white' || isCustomLight
      ? 'text-slate-600'
      : effectiveBg.type === 'dark' || isCustomDark
      ? 'text-white/70'
      : isLight
      ? 'text-slate-600'
      : 'text-white/70';

  const stripSubColor =
    effectiveBg.type === 'white' || isCustomLight
      ? 'text-slate-500'
      : effectiveBg.type === 'dark' || isCustomDark
      ? 'text-white/50'
      : isLight
      ? 'text-slate-400'
      : 'text-white/45';

  return (
    <div
      ref={setCardRef}
      data-site-card="true"
      data-tour={index === 0 ? "site-card" : undefined}
      draggable={!disableInternalDrag}
      onDragStart={handleDragStartInternal}
      onDragOver={(e) => {
        if (disableInternalDrag) return;
        e.preventDefault();
        onDragOver(e, site.id);
      }}
      onDrop={(e) => {
        if (disableInternalDrag) return;
        onDrop(e, site.id);
      }}
      onDragEnd={disableInternalDrag ? undefined : onDragEnd}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={(e) => {
        if (isEditing) return;
        if (hasDragged.current) {
          hasDragged.current = false;
          return;
        }
        const now = Date.now();
        if (now - lastClickTime.current < 400) return;
        lastClickTime.current = now;
        handleClick(e);
      }}
      onContextMenu={handleContextMenu}
      style={{
        width: typeof cellWidth === 'number' ? `${cellWidth}px` : cellWidth,
        height: typeof cellHeight === 'number' ? `${cellHeight}px` : cellHeight,
      }}
      className={`relative shrink-0 select-none ${
        disableInternalDrag ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'
      } ${
        isDragging ? 'opacity-30 scale-95 will-change-transform' : isJustDropped ? 'will-change-transform' : ''
      }`}
    >
      {/* 1. Horizontal Banner Widget Layout */}
      {isWide ? (
        <div
          data-tooltip={showTooltip && site.description?.trim() ? site.description : undefined}
          style={stripContainerStyle}
          className={`group relative flex flex-row items-center rounded-2xl border duration-0 transition-all h-full w-full px-3 py-1.5 overflow-hidden ${jiggleClass} ${stripContainerClass}`}
        >
          {/* Icon Container (Left side) */}
          <div
            style={{
              width: `${wideIconSize}px`,
              height: `${wideIconSize}px`,
              ...(effectiveBg.type === 'white'
                ? { backgroundColor: '#f3f3f3' }
                : effectiveBg.type === 'dark'
                ? { backgroundColor: 'rgba(255,255,255,0.08)' }
                : effectiveBg.type === 'frosted'
                ? {}
                : effectiveBg.style),
            }}
            className={`rounded-xl flex items-center justify-center overflow-hidden shrink-0 pointer-events-none duration-0 ${
              effectiveBg.type === 'white'
                ? 'bg-slate-100 border border-black/[0.06] shadow-xs'
                : effectiveBg.type === 'dark'
                ? 'bg-white/10 border border-white/10 shadow-xs'
                : effectiveBg.className
            }`}
          >
            <img
              src={iconSrc}
              alt={getSiteDisplayName(site, settings.language)}
              draggable={false}
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              style={{ width: `${wideIconImgSize}px`, height: `${wideIconImgSize}px` }}
              className="object-contain rounded-lg select-none pointer-events-none"
              loading="lazy"
            />
          </div>

          {/* Title & Remarks (Stacked on Right side, or Single Title if height is compact) */}
          <div
            style={{ marginLeft: `${iconTextGap}px` }}
            className="flex flex-col justify-center min-w-0 flex-1 text-left overflow-hidden"
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                style={{ fontSize: titleFontSize, color: stripTitleColor }}
                className={`font-semibold truncate tracking-tight select-none pointer-events-none leading-tight ${stripTitleShadow}`}
              >
                {getSiteDisplayName(site, settings.language)}
              </span>

              {/* Dual URL indicator badge */}
              {hasDualUrl && (
                <span
                  className={`shrink-0 px-1 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${
                    isCurrentLan
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                  }`}
                  title={
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
                  className="shrink-0 px-1 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                  title={`${t('networkModeLan', settings.language)}: ${site.urlLan}`}
                >
                  LAN
                </span>
              )}
            </div>

            {/* Subtitle: Only shown when height is sufficient */}
            {showWideSubtitle && (
              site.description?.trim() ? (
                <span
                  style={{
                    fontSize: `${Math.max(10, Math.round(fontSizeNum * 0.82))}px`,
                    marginTop: `${textLineGap}px`,
                    display: maxSubtitleLines > 1 ? '-webkit-box' : 'block',
                    WebkitLineClamp: maxSubtitleLines > 1 ? maxSubtitleLines : undefined,
                    WebkitBoxOrient: maxSubtitleLines > 1 ? 'vertical' : undefined,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: maxSubtitleLines > 1 ? 'normal' : 'nowrap',
                    wordBreak: 'break-all',
                    lineHeight: 1.25,
                  }}
                  className={`select-none pointer-events-none ${stripDescColor}`}
                >
                  {site.description.trim()}
                </span>
              ) : (
                <span
                  style={{
                    fontSize: `${Math.max(9, Math.round(fontSizeNum * 0.78))}px`,
                    marginTop: `${textLineGap}px`,
                    display: maxSubtitleLines > 1 ? '-webkit-box' : 'block',
                    WebkitLineClamp: maxSubtitleLines > 1 ? maxSubtitleLines : undefined,
                    WebkitBoxOrient: maxSubtitleLines > 1 ? 'vertical' : undefined,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: maxSubtitleLines > 1 ? 'normal' : 'nowrap',
                    wordBreak: 'break-all',
                    lineHeight: 1.25,
                  }}
                  className={`select-none pointer-events-none ${stripSubColor}`}
                >
                  {(() => {
                    try {
                      return site.url ? new URL(site.url).hostname.replace(/^www\./, '') : '';
                    } catch {
                      return site.url || '';
                    }
                  })()}
                </span>
              )
            )}
          </div>
        </div>
      ) : isTall ? (
        /* 2. Vertical Tall Widget Layout (Sideways 90-degree Rotated Text, Spine Reading) */
        <div
          data-tooltip={showTooltip && site.description?.trim() ? site.description : undefined}
          style={stripContainerStyle}
          className={`group relative flex flex-col items-center rounded-2xl border duration-0 transition-all h-full w-full px-1.5 py-2.5 overflow-hidden ${jiggleClass} ${stripContainerClass}`}
        >
          {/* Centered Icon at Top with WAN/LAN badge */}
          <div className="relative shrink-0 flex items-center justify-center">
            <div
              style={{
                width: `${tallIconSize}px`,
                height: `${tallIconSize}px`,
                ...(effectiveBg.type === 'white'
                  ? { backgroundColor: '#f3f3f3' }
                  : effectiveBg.type === 'dark'
                  ? { backgroundColor: 'rgba(255,255,255,0.08)' }
                  : effectiveBg.type === 'frosted'
                  ? {}
                  : effectiveBg.style),
              }}
              className={`rounded-xl flex items-center justify-center overflow-hidden shrink-0 pointer-events-none duration-0 ${
                effectiveBg.type === 'white'
                  ? 'bg-slate-100 border border-black/[0.06] shadow-xs'
                  : effectiveBg.type === 'dark'
                  ? 'bg-white/10 border border-white/10 shadow-xs'
                  : effectiveBg.type === 'frosted'
                  ? isLight ? 'bg-black/[0.04] border border-black/5' : 'bg-white/10 border border-white/10'
                  : effectiveBg.className
              }`}
            >
              <img
                src={iconSrc}
                alt={getSiteDisplayName(site, settings.language)}
                draggable={false}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                style={{ width: `${tallIconImgSize}px`, height: `${tallIconImgSize}px` }}
                className="object-contain rounded-lg select-none pointer-events-none"
                loading="lazy"
              />
            </div>

            {/* Dual URL indicator badge */}
            {hasDualUrl && (
              <span
                style={{ top: '-4px', right: '-4px' }}
                className={`absolute z-10 px-1 py-0.2 rounded text-[8px] font-bold uppercase tracking-wider shadow-xs pointer-events-none ${
                  isCurrentLan
                    ? 'bg-emerald-500 text-white border border-emerald-600'
                    : 'bg-blue-500 text-white border border-blue-600'
                }`}
                title={
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
                style={{ top: '-4px', right: '-4px' }}
                className="absolute z-10 px-1 py-0.2 rounded text-[8px] font-bold uppercase tracking-wider bg-emerald-500 text-white border border-emerald-600 shadow-xs pointer-events-none"
                title={`${t('networkModeLan', settings.language)}: ${site.urlLan}`}
              >
                LAN
              </span>
            )}
          </div>

          {/* Vertical-RL Sideways Rotated Text: Name/Title on RIGHT, Remarks/URL on LEFT */}
          {showTitle && (
            <div
              style={{ marginTop: `${Math.min(iconTextGap, 8)}px` }}
              className="flex-1 min-h-0 w-full flex justify-center items-start overflow-hidden pb-1"
            >
              <div
                style={{
                  writingMode: 'vertical-rl',
                  WebkitWritingMode: 'vertical-rl',
                  textOrientation: 'sideways',
                  WebkitTextOrientation: 'sideways',
                  gap: `${Math.max(3, textLineGap + 1)}px`,
                }}
                className="flex flex-col items-start justify-start max-h-full max-w-full overflow-hidden select-none"
              >
                {/* 1. Name/Title on the RIGHT (先读右侧名称) */}
                <span
                  style={{
                    fontSize: `${tallTitleSize}px`,
                    color: stripTitleColor,
                  }}
                  className={`font-semibold tracking-normal truncate max-h-full select-none pointer-events-none leading-tight ${stripTitleShadow}`}
                >
                  {getSiteDisplayName(site, settings.language)}
                </span>

                {/* 2. Remark/URL on the LEFT (后读左侧备注/网址, 仅当宽度允许双排时自适应显示) */}
                {canShowTallDoubleCol && (
                  site.description?.trim() ? (
                    <span
                      style={{
                        fontSize: `${Math.max(10, Math.round(fontSizeNum * 0.82))}px`,
                      }}
                      className={`tracking-normal truncate max-h-full select-none pointer-events-none leading-tight ${stripDescColor}`}
                    >
                      {site.description.trim()}
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: `${Math.max(9, Math.round(fontSizeNum * 0.78))}px`,
                      }}
                      className={`tracking-normal truncate max-h-full select-none pointer-events-none leading-tight ${stripSubColor}`}
                    >
                      {(() => {
                        try {
                          return site.url ? new URL(site.url).hostname.replace(/^www\./, '') : '';
                        } catch {
                          return site.url || '';
                        }
                      })()}
                    </span>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      ) : isLargeSquare ? (
        /* 3. Large Square Card Widget (Visible Card Background + Proportional Large Icon) */
        <div
          data-tooltip={showTooltip && site.description?.trim() ? site.description : undefined}
          style={stripContainerStyle}
          className={`group relative flex flex-col items-center justify-center rounded-2xl border duration-0 transition-all h-full w-full p-2.5 overflow-hidden ${jiggleClass} ${stripContainerClass}`}
        >
          {/* Centered Large Icon with WAN/LAN badge */}
          <div className="relative shrink-0 flex items-center justify-center">
            <div
              style={{
                width: `${squareIconBoxSize}px`,
                height: `${squareIconBoxSize}px`,
                marginBottom: showTitle ? `${iconTextGap}px` : '0px',
                ...(effectiveBg.type === 'white'
                  ? { backgroundColor: '#f3f3f3' }
                  : effectiveBg.type === 'dark'
                  ? { backgroundColor: 'rgba(255,255,255,0.08)' }
                  : effectiveBg.type === 'frosted'
                  ? {}
                  : effectiveBg.style),
              }}
              className={`rounded-2xl flex items-center justify-center overflow-hidden shrink-0 pointer-events-none duration-0 ${
                effectiveBg.type === 'white'
                  ? 'bg-slate-100 border border-black/[0.06] shadow-xs'
                  : effectiveBg.type === 'dark'
                  ? 'bg-white/10 border border-white/10 shadow-xs'
                  : effectiveBg.type === 'frosted'
                  ? isLight ? 'bg-black/[0.04] border border-black/5' : 'bg-white/10 border border-white/10'
                  : effectiveBg.className
              }`}
            >
              <img
                src={iconSrc}
                alt={getSiteDisplayName(site, settings.language)}
                draggable={false}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                style={{ width: `${squareIconImgSize}px`, height: `${squareIconImgSize}px` }}
                className="object-contain rounded-xl select-none pointer-events-none"
                loading="lazy"
              />
            </div>

            {/* Dual URL indicator badge */}
            {hasDualUrl && (
              <span
                style={{ top: '-4px', right: '-4px' }}
                className={`absolute z-10 px-1 py-0.2 rounded text-[8px] font-bold uppercase tracking-wider shadow-xs pointer-events-none ${
                  isCurrentLan
                    ? 'bg-emerald-500 text-white border border-emerald-600'
                    : 'bg-blue-500 text-white border border-blue-600'
                }`}
                title={
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
                style={{ top: '-4px', right: '-4px' }}
                className="absolute z-10 px-1 py-0.2 rounded text-[8px] font-bold uppercase tracking-wider bg-emerald-500 text-white border border-emerald-600 shadow-xs pointer-events-none"
                title={`${t('networkModeLan', settings.language)}: ${site.urlLan}`}
              >
                LAN
              </span>
            )}
          </div>

          {/* Site Title */}
          {showTitle && (
            <span
              draggable={false}
              style={{
                fontSize: `${squareTitleSize}px`,
                color: stripTitleColor,
              }}
              className={`font-semibold truncate max-w-full text-center tracking-tight px-1 select-none pointer-events-none leading-tight pb-0.5 shrink-0 ${stripTitleShadow}`}
            >
              {getSiteDisplayName(site, settings.language)}
            </span>
          )}

          {/* Optional remarks/URL if card height is tall enough */}
          {cardDims.h >= 150 && (
            <span
              style={{
                fontSize: `${Math.max(10, Math.round(fontSizeNum * 0.80))}px`,
                marginTop: `${textLineGap}px`,
              }}
              className={`truncate max-w-full text-center tracking-normal select-none pointer-events-none leading-tight px-2 shrink-0 ${stripDescColor}`}
            >
              {site.description?.trim() || (() => {
                try {
                  return site.url ? new URL(site.url).hostname.replace(/^www\./, '') : '';
                } catch {
                  return site.url || '';
                }
              })()}
            </span>
          )}
        </div>
      ) : (
        /* 4. Classic 1x1 Icon Tile (No Clipping on Title) */
        <div
          data-tooltip={showTooltip && site.description?.trim() ? site.description : undefined}
          className={`group relative flex flex-col items-center justify-center duration-0 transition-all h-full w-full p-1 overflow-visible ${jiggleClass}`}
        >
          {/* Icon Container with WAN/LAN badge */}
          <div className="relative shrink-0 flex items-center justify-center">
            <div
              style={{
                width: `${iconBoxSize}px`,
                height: `${iconBoxSize}px`,
                marginBottom: showTitle ? `${iconTextGap}px` : '0px',
                ...effectiveBg.style,
              }}
              className={`rounded-2xl flex items-center justify-center overflow-hidden shrink-0 pointer-events-none duration-0 ${effectiveBg.className}`}
            >
              <img
                src={iconSrc}
                alt={getSiteDisplayName(site, settings.language)}
                draggable={false}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                style={{ width: `${iconImgSize}px`, height: `${iconImgSize}px` }}
                className="object-contain rounded-xl select-none pointer-events-none"
                loading="lazy"
              />
            </div>

            {/* Dual URL indicator badge */}
            {hasDualUrl && (
              <span
                style={{ top: '-4px', right: '-4px' }}
                className={`absolute z-10 px-1 py-0.2 rounded text-[8px] font-bold uppercase tracking-wider shadow-xs pointer-events-none ${
                  isCurrentLan
                    ? 'bg-emerald-500 text-white border border-emerald-600'
                    : 'bg-blue-500 text-white border border-blue-600'
                }`}
                title={
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
                style={{ top: '-4px', right: '-4px' }}
                className="absolute z-10 px-1 py-0.2 rounded text-[8px] font-bold uppercase tracking-wider bg-emerald-500 text-white border border-emerald-600 shadow-xs pointer-events-none"
                title={`${t('networkModeLan', settings.language)}: ${site.urlLan}`}
              >
                LAN
              </span>
            )}
          </div>

          {/* Site Title: Guaranteed clearance so descenders are never clipped */}
          {showTitle && (
            <span
              draggable={false}
              style={{
                fontSize: titleFontSize,
                color: resolvedColors?.cards,
              }}
              className={`font-medium truncate max-w-full text-center tracking-wide px-1 select-none pointer-events-none leading-tight pb-0.5 shrink-0 ${
                resolvedColors?.cardShadow || (isLight ? 'text-slate-800 group-hover:text-black' : 'text-white/90 group-hover:text-white drop-shadow')
              }`}
            >
              {getSiteDisplayName(site, settings.language)}
            </span>
          )}
        </div>
      )}

      {/* Custom Desktop Context Menu (Triggered by Right-Click) */}
      {menuPos && typeof document !== 'undefined' && createPortal(
        <div
          ref={menuRef}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          style={{
            top: `${menuPos.y}px`,
            left: `${menuPos.x}px`,
          }}
          className={`glass-dropdown fixed min-w-[170px] max-w-[230px] py-1.5 rounded-xl border shadow-2xl z-[9999] animate-scale-in text-xs font-medium overflow-hidden select-none ${
            isLight
              ? 'border-black/10 shadow-black/15 text-slate-800'
              : 'border-white/15 shadow-black/50 text-white'
          }`}
        >
          {/* 1. Open in new tab (default URL) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMenuPos(null);
              window.open(targetUrl, '_blank', 'noopener,noreferrer');
            }}
            className={`flex items-center gap-2.5 w-full px-3 py-2 text-left transition-colors cursor-pointer ${
              isLight
                ? 'text-slate-700 hover:bg-black/5 hover:text-slate-900'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-70" />
            <span>{t('openInNewTab', settings.language)}</span>
          </button>

          {/* 2. Open WAN URL option */}
          {site.url && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuPos(null);
                window.open(site.url, '_blank', 'noopener,noreferrer');
              }}
              className={`flex items-center gap-2.5 w-full px-3 py-2 text-left transition-colors cursor-pointer ${
                isLight
                  ? 'text-slate-700 hover:bg-black/5 hover:text-slate-900'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span className="truncate">{t('openWanUrl', settings.language)}</span>
            </button>
          )}

          {/* 3. Open LAN URL option */}
          {site.urlLan && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuPos(null);
                window.open(site.urlLan, '_blank', 'noopener,noreferrer');
              }}
              className={`flex items-center gap-2.5 w-full px-3 py-2 text-left transition-colors cursor-pointer ${
                isLight
                  ? 'text-slate-700 hover:bg-black/5 hover:text-slate-900'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Home className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="truncate">{t('openLanUrl', settings.language)}</span>
            </button>
          )}

          <div className={`my-1 border-t ${isLight ? 'border-black/5' : 'border-white/10'}`} />

          {/* 4. Edit Mode: Apply this card's size to all cards */}
          {isEditing && onApplySizeToAll && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuPos(null);
                onApplySizeToAll(site.id);
              }}
              className="flex items-center gap-2.5 w-full px-3 py-2 text-left transition-colors cursor-pointer text-amber-500 font-semibold hover:bg-amber-500/10"
            >
              <Maximize2 className="w-3.5 h-3.5 shrink-0" />
              <span>{t('applySizeToAllSites', settings.language)}</span>
            </button>
          )}

          {/* 5. Move to another desktop options */}
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
                {targetPages.map((page) => {
                  const originalIdx = gridPages.findIndex((gp) => gp.id === page.id);
                  const pageDisplayName = getGridPageDisplayName(page, originalIdx, settings.language);
                  return (
                    <button
                      key={page.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuPos(null);
                        onMoveSiteToPage(site.id, page.id);
                      }}
                      className={`flex items-center gap-2.5 w-full px-3 py-2 text-left transition-colors cursor-pointer ${
                        isLight
                          ? 'text-slate-700 hover:bg-black/5 hover:text-slate-900'
                          : 'text-white/80 hover:bg-white/10 hover:text-white'
                      }`}
                      aria-label={`${t('moveToDesktop', settings.language)}: ${pageDisplayName}`}
                    >
                      <FolderInput className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span className="truncate">
                        {t('moveToDesktop', settings.language)}: {pageDisplayName}
                      </span>
                    </button>
                  );
                })}
              </>
            );
          })()}

          {/* 6. Edit Site */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
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

          {/* 7. Delete Site */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
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
  );
}));

SiteCard.displayName = 'SiteCard';
