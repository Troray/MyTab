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

export const SiteCard = React.forwardRef<HTMLDivElement, SiteCardProps>(({
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
        isDragging ? 'pointer-events-none opacity-40' : ''
      }`}
    >
      {/* Inner Animated Visual Card Layer */}
      <div
        style={{
          width: '100%',
          minHeight: `${cardSize}px`,
          background: isDragging
            ? `rgba(99, 102, 241, 0.35)`
            : isJustDropped
            ? `rgba(99, 102, 241, 0.40)`
            : `rgba(255, 255, 255, ${settings.cardOpacity})`,
          backdropFilter: `blur(${settings.cardBlur}px)`,
          WebkitBackdropFilter: `blur(${settings.cardBlur}px)`,
          padding: `${paddingPx}px`,
          transform: 'translateZ(0)',
        }}
        className={`group relative flex flex-col items-center justify-center rounded-2xl border transition-all duration-200 ease-out h-full w-full ${jiggleClass} ${
          isDragging
            ? 'ios-dragged border-indigo-400 ring-2 ring-indigo-400/60'
            : isJustDropped
            ? 'ios-drop-spring border-indigo-400 ring-2 ring-indigo-400/90'
            : 'border-white/15 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/25 hover:border-white/35 hover:scale-[1.02]'
        }`}
      >
        {/* Icon Container */}
        <div
          style={{ width: `${iconBoxSize}px`, height: `${iconBoxSize}px` }}
          className="rounded-xl flex items-center justify-center bg-white/10 shadow-sm overflow-hidden mb-2 transition-transform duration-150 group-hover:scale-105 shrink-0 pointer-events-none"
        >
          <img
            src={iconSrc}
            alt={site.title}
            draggable={false}
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
          className="font-medium text-white/90 group-hover:text-white truncate max-w-full text-center tracking-wide drop-shadow px-1 select-none pointer-events-none"
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
            className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-colors"
            title="More actions"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-6 w-28 py-1 rounded-xl border border-white/15 shadow-2xl z-40 animate-scale-in text-xs font-medium overflow-hidden"
              style={{
                background: 'rgba(15, 15, 25, 0.75)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
              }}
            >
              <button
                onClick={() => {
                  setShowMenu(false);
                  onEdit(site);
                }}
                className="flex items-center gap-2 w-full px-3 py-1.5 text-left text-white/80 hover:bg-white/10 hover:text-white transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>{t('editSite', settings.language)}</span>
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  onDelete(site.id);
                }}
                className="flex items-center gap-2 w-full px-3 py-1.5 text-left text-red-400 hover:bg-red-500/20 transition-colors"
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
});
