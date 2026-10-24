import React, { useState } from 'react';
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
  const [isHovered, setIsHovered] = useState(false);
  const displayName = getCategoryDisplayName(category, language);
  const hasCustomColor = Boolean(category.color);

  return (
    <div
      role="button"
      tabIndex={isEditing ? -1 : 0}
      title={isEditing ? t('freeLayoutEditingHint', language) : undefined}
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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`w-full h-full flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-xs md:text-sm font-medium transition-all duration-200 select-none border backdrop-blur-md ${
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
      {/* Edit Mode Grip Drag Handle (like SearchWidget's draggable area) */}
      {isEditing && (
        <GripVertical className="w-3.5 h-3.5 -ml-1 opacity-50 shrink-0 pointer-events-none" />
      )}

      {/* Category Color Dot (if custom color set) */}
      {hasCustomColor && category.color && (
        <span
          className="w-2 h-2 rounded-full shrink-0 shadow-xs pointer-events-none"
          style={{ backgroundColor: category.color }}
        />
      )}

      {/* Category Name */}
      <span
        className="truncate tracking-tight pointer-events-none"
        style={!isActive && resolvedColors?.tabs ? { color: resolvedColors.tabs } : undefined}
      >
        {displayName}
      </span>

      {/* Count Badge */}
      <span
        className={`text-[10px] px-1.5 py-0.2 rounded-full font-tabular shrink-0 pointer-events-none ${
          isActive
            ? isLight
              ? 'bg-black/15 text-slate-900 font-semibold'
              : 'bg-white/30 text-white font-semibold'
            : isLight
            ? 'bg-black/[0.06] text-slate-600'
            : 'bg-white/[0.12] text-white/70'
        }`}
      >
        {count}
      </span>
    </div>
  );
});

CategoryPillWidget.displayName = 'CategoryPillWidget';
