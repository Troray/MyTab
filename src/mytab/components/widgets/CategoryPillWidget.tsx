import React, { useState, useRef, useCallback } from 'react';
import { GripVertical } from 'lucide-react';
import { Category } from '../../../types';
import { ResolvedTextColors } from '../../../utils/wallpaperAnalyzer';
import { getCategoryDisplayName } from '../../../utils/constants';
import { t } from '../../../utils/i18n';

interface CategoryPillWidgetProps {
  category: Category;
  isActive: boolean;
  count: number;
  isLight?: boolean;
  resolvedColors?: ResolvedTextColors;
  language: string;
  isEditing?: boolean;
  onSelect: (id: string) => void;
  onContextMenu?: (e: React.MouseEvent, cat: Category) => void;
}

export const CategoryPillWidget: React.FC<CategoryPillWidgetProps> = React.memo(({
  category,
  isActive,
  count,
  isLight,
  resolvedColors,
  language,
  isEditing = false,
  onSelect,
  onContextMenu,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [overflowDist, setOverflowDist] = useState(0);

  const displayName = getCategoryDisplayName(category, language);
  const hasCustomColor = Boolean(category.color);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    if (!isEditing && containerRef.current && textRef.current) {
      const containerW = containerRef.current.clientWidth;
      const textW = textRef.current.scrollWidth;
      const diff = textW - containerW;
      setOverflowDist(diff > 2 ? diff : 0);
    }
  }, [isEditing]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setOverflowDist(0);
  }, []);

  const isMarqueeActive = overflowDist > 0 && isHovered && !isEditing;
  const marqueeDuration = Math.max(2.8, 1.8 + (overflowDist / 30) * 1.5);

  return (
    <div
      role="button"
      tabIndex={isEditing ? -1 : 0}
      title={isEditing ? t('freeLayoutEditingHint', language) : `${displayName} (${count})`}
      onClick={() => {
        if (!isEditing) onSelect(category.id);
      }}
      onKeyDown={(e) => {
        if (!isEditing && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onSelect(category.id);
        }
      }}
      onContextMenu={(e) => {
        if (onContextMenu && category.id !== 'all' && category.id !== 'uncategorized') {
          e.preventDefault();
          e.stopPropagation();
          onContextMenu(e, category);
        }
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`w-full h-full flex items-center justify-center px-2.5 py-1 rounded-full text-xs md:text-sm font-medium transition-all duration-200 select-none border backdrop-blur-md ${
        isEditing ? 'cursor-move' : 'cursor-pointer active:scale-95'
      } ${
        isActive
          ? isLight
            ? 'bg-black/10 text-slate-900 border-black/15 shadow-sm font-semibold'
            : 'bg-white/25 text-white border-white/30 shadow-md font-semibold'
          : isLight
          ? 'bg-black/[0.04] text-slate-700 hover:text-slate-950 hover:bg-black/[0.08] border-black/10'
          : 'bg-white/[0.08] text-white/80 hover:text-white hover:bg-white/[0.16] border-white/10'
      }`}
      style={
        hasCustomColor && category.color
          ? {
              borderColor: isActive ? category.color : undefined,
              boxShadow: isActive ? `0 0 12px ${category.color}40` : undefined,
            }
          : undefined
      }
    >
      {/* Edit Mode Grip Drag Handle */}
      {isEditing && (
        <GripVertical className="w-3.5 h-3.5 -ml-1 opacity-50 shrink-0 pointer-events-none" />
      )}

      {/* Category Name Container with Hover Marquee */}
      <div
        ref={containerRef}
        className="w-full h-full min-w-0 overflow-hidden flex items-center justify-center pointer-events-none"
      >
        <span
          ref={textRef}
          className={`tracking-tight select-none pointer-events-none transition-colors duration-200 ${
            isMarqueeActive
              ? 'whitespace-nowrap shrink-0 animate-pill-marquee'
              : 'truncate max-w-full'
          }`}
          style={{
            ...(!isActive && resolvedColors?.tabs ? { color: resolvedColors.tabs } : {}),
            ...(isMarqueeActive
              ? ({
                  '--marquee-dist': `${overflowDist}px`,
                  '--marquee-duration': `${marqueeDuration}s`,
                  marginLeft: 0,
                  marginRight: 'auto',
                } as React.CSSProperties)
              : {}),
          }}
        >
          {displayName}
        </span>
      </div>
    </div>
  );
});

CategoryPillWidget.displayName = 'CategoryPillWidget';
