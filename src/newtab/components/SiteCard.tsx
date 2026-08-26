import React, { useState } from 'react';
import { MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { SiteItem, ThemeSettings } from '../../types';
import { generateFallbackIcon } from '../../services/metadata';
import { t } from '../../utils/i18n';

interface SiteCardProps {
  site: SiteItem;
  index: number;
  settings: ThemeSettings;
  isDragging?: boolean;
  isAnyDragging?: boolean;
  isJustDropped?: boolean;
  onEdit: (site: SiteItem) => void;
  onDelete: (siteId: string) => void;
  onDragStart: (e: React.DragEvent, siteId: string) => void;
  onDragOver: (e: React.DragEvent, siteId: string) => void;
  onDrop: (e: React.DragEvent, targetSiteId?: string) => void;
  onDragEnd: () => void;
}

export const SiteCard = React.memo(React.forwardRef<HTMLDivElement, SiteCardProps>(({
  site,
  index,
  settings,
  isDragging,
  isAnyDragging,
  isJustDropped,
  onEdit,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}, ref) => {
  const [imgError, setImgError] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const iconSrc = imgError || !site.icon ? generateFallbackIcon(site.title || site.url) : site.icon;
  const cardSize = settings.cardSize || 110;
  const iconRatio = settings.iconSizeRatio || 0.42;
  const isLight = settings.mode === 'light';

  // Responsive scaling calculations based on cardSize and custom icon ratio
  const iconBoxSize = Math.max(24, Math.round(cardSize * iconRatio));
  const iconImgSize = Math.max(16, Math.round(iconBoxSize * 0.70));
  const paddingPx = Math.max(6, Math.round(cardSize * 0.10));
  const blurPx = Math.round(((settings.cardBlur ?? 50) / 100) * 32);

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

  const handleDragStartInternal = (e: React.DragEvent<HTMLDivElement>) => {
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

  return (
    <div
      ref={ref}
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
      style={{
        width: `${cardSize}px`,
        minHeight: `${cardSize}px`,
      }}
      className={`relative shrink-0 select-none cursor-grab active:cursor-grabbing will-change-transform ${
        isDragging ? 'opacity-30 scale-95' : ''
      }`}
    >
      {/* Inner Animated Visual Card Layer */}
      <div
        style={{
          width: '100%',
          minHeight: `${cardSize}px`,
          background: isDragging
            ? isLight
              ? 'rgba(0, 0, 0, 0.06)'
              : 'rgba(255, 255, 255, 0.15)'
            : isJustDropped
            ? isLight
              ? 'rgba(0, 0, 0, 0.08)'
              : 'rgba(255, 255, 255, 0.18)'
            : isLight
            ? `rgba(255, 255, 255, ${Math.max(0.82, settings.cardOpacity)})`
            : `rgba(255, 255, 255, ${settings.cardOpacity})`,
          backdropFilter: `blur(${blurPx}px)`,
          WebkitBackdropFilter: `blur(${blurPx}px)`,
          padding: `${paddingPx}px`,
          transform: 'translateZ(0)',
        }}
        className={`group relative flex flex-col items-center justify-center rounded-2xl border transition-all duration-200 ease-out h-full w-full ${jiggleClass} ${
          isDragging
            ? 'ios-dragged border-amber-500/60 ring-2 ring-amber-500/30'
            : isJustDropped
            ? 'ios-drop-spring border-amber-500/80 ring-2 ring-amber-500/40'
            : isLight
            ? 'border-black/10 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5 hover:border-black/20 hover:scale-[1.02]'
            : 'border-white/10 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40 hover:border-white/25 hover:scale-[1.02]'
        }`}
      >
        {/* Icon Inset Container */}
        <div
          style={{ width: `${iconBoxSize}px`, height: `${iconBoxSize}px` }}
          className={`rounded-xl flex items-center justify-center shadow-inner overflow-hidden mb-2 transition-transform duration-150 group-hover:scale-105 shrink-0 pointer-events-none ${
            isLight
              ? 'bg-black/[0.03] border border-black/5'
              : 'bg-white/[0.08] border border-white/10'
          }`}
        >
          <img
            src={iconSrc}
            alt={site.title}
            draggable={false}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            style={{ width: `${iconImgSize}px`, height: `${iconImgSize}px` }}
            className="object-contain rounded-md select-none pointer-events-none"
            loading="lazy"
          />
        </div>

        {/* Site Title */}
        <span
          draggable={false}
          style={{
            fontSize: cardSize < 95 ? '11px' : cardSize > 130 ? '14px' : '12px',
          }}
          className={`font-medium truncate max-w-full text-center tracking-wide px-1 select-none pointer-events-none transition-colors ${
            isLight
              ? 'text-slate-800 group-hover:text-black'
              : 'text-white/90 group-hover:text-white drop-shadow'
          }`}
        >
          {site.title || 'Untitled'}
        </span>

        {/* Action Menu Button */}
        <div className="site-card-action absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className={`p-1 rounded-lg transition-colors ${
              isLight
                ? 'text-slate-500 hover:text-slate-900 hover:bg-black/10'
                : 'text-white/70 hover:text-white hover:bg-white/20'
            }`}
            title="More actions"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div
              onClick={(e) => e.stopPropagation()}
              className={`absolute right-0 top-6 w-28 py-1 rounded-xl border shadow-2xl z-40 animate-scale-in text-xs font-medium overflow-hidden ${
                isLight
                  ? 'border-black/10 shadow-black/10 bg-white/95 text-slate-800'
                  : 'border-white/15 shadow-black/60 bg-slate-900/90 text-white'
              }`}
              style={{
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
              }}
            >
              <button
                onClick={() => {
                  setShowMenu(false);
                  onEdit(site);
                }}
                className={`flex items-center gap-2 w-full px-3 py-2 text-left transition-colors cursor-pointer ${
                  isLight
                    ? 'text-slate-700 hover:bg-black/5 hover:text-slate-900'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>{t('editSite', settings.language)}</span>
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  onDelete(site.id);
                }}
                className={`flex items-center gap-2 w-full px-3 py-2 text-left transition-colors cursor-pointer ${
                  isLight
                    ? 'text-red-600 hover:bg-red-50'
                    : 'text-red-400 hover:bg-red-500/10'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t('deleteSite', settings.language)}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}));
