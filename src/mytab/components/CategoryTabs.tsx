import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { FolderPlus, Pencil, Trash2 } from 'lucide-react';
import { Category, ThemeSettings } from '../../types';
import { ResolvedTextColors } from '../../utils/wallpaperAnalyzer';
import { CategoryModal } from './CategoryModal';
import { ConfirmModal } from './ConfirmModal';
import { t } from '../../utils/i18n';
import { isLightMode } from '../../utils/constants';

/**
 * Converts a hex color (#RGB, #RRGGBB, #RRGGBBAA) to an rgba() color string with custom alpha.
 * Preserves existing rgb/rgba strings if provided.
 */
function hexToRgba(hex: string, alpha: number): string {
  if (!hex) return '';
  if (hex.startsWith('rgba') || hex.startsWith('rgb')) {
    return hex;
  }
  let cleaned = hex.trim().replace('#', '');
  if (cleaned.length === 3) {
    cleaned = cleaned.split('').map((c) => c + c).join('');
  }
  if (cleaned.length === 6 || cleaned.length === 8) {
    const num = parseInt(cleaned.slice(0, 6), 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return hex;
}

interface CategoryTabItemProps {
  cat: Category;
  isActive: boolean;
  count: number;
  displayName: string;
  isDarkWallpaper: boolean;
  resolvedColors?: ResolvedTextColors;
  onSelect: () => void;
  onContextMenu: (e: React.MouseEvent, cat: Category) => void;
}

const CategoryTabItem: React.FC<CategoryTabItemProps> = ({
  cat,
  isActive,
  count,
  displayName,
  isDarkWallpaper,
  resolvedColors,
  onSelect,
  onContextMenu,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const color = cat.color?.trim();
  const hasCustomColor = Boolean(color);

  // Compute translucent dynamic styles when custom category color exists
  const customStyle = useMemo<React.CSSProperties | undefined>(() => {
    if (!hasCustomColor || !color) {
      if (!isActive && resolvedColors?.tabs) {
        return { color: resolvedColors.tabs };
      }
      return undefined;
    }

    if (isActive) {
      const bgOpacity = isDarkWallpaper ? 0.28 : 0.20;
      const borderOpacity = isDarkWallpaper ? 0.60 : 0.45;
      const glowOpacity = isDarkWallpaper ? 0.40 : 0.28;

      return {
        backgroundColor: hexToRgba(color, bgOpacity),
        borderColor: hexToRgba(color, borderOpacity),
        boxShadow: `0 3px 14px -2px ${hexToRgba(color, glowOpacity)}, inset 0 1px 0 rgba(255, 255, 255, ${
          isDarkWallpaper ? 0.2 : 0.45
        })`,
      };
    } else {
      const bgOpacity = isHovered
        ? isDarkWallpaper
          ? 0.20
          : 0.14
        : isDarkWallpaper
        ? 0.12
        : 0.08;
      const borderOpacity = isHovered
        ? isDarkWallpaper
          ? 0.42
          : 0.32
        : isDarkWallpaper
        ? 0.28
        : 0.20;
      const shadowOpacity = isHovered ? 0.25 : 0.08;

      const style: React.CSSProperties = {
        backgroundColor: hexToRgba(color, bgOpacity),
        borderColor: hexToRgba(color, borderOpacity),
        boxShadow: `0 2px 6px -1px ${hexToRgba(color, shadowOpacity)}`,
      };

      if (resolvedColors?.tabs) {
        style.color = resolvedColors.tabs;
      }
      return style;
    }
  }, [hasCustomColor, color, isActive, isHovered, isDarkWallpaper, resolvedColors?.tabs]);

  // Compute count badge style
  const badgeStyle = useMemo<React.CSSProperties | undefined>(() => {
    if (!hasCustomColor || !color) return undefined;
    if (isActive) {
      return {
        backgroundColor: hexToRgba(color, isDarkWallpaper ? 0.35 : 0.25),
        borderColor: hexToRgba(color, isDarkWallpaper ? 0.50 : 0.35),
      };
    } else {
      return {
        backgroundColor: hexToRgba(color, isDarkWallpaper ? 0.18 : 0.12),
        borderColor: hexToRgba(color, isDarkWallpaper ? 0.25 : 0.18),
      };
    }
  }, [hasCustomColor, color, isActive, isDarkWallpaper]);

  return (
    <div className="relative flex items-center">
      <button
        onClick={onSelect}
        onContextMenu={(e) => onContextMenu(e, cat)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={customStyle}
        className={`group flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs md:text-sm font-medium transition-all duration-150 cursor-pointer select-none active:scale-95 border backdrop-blur-md ${
          hasCustomColor
            ? isActive
              ? isDarkWallpaper
                ? 'text-white font-semibold'
                : 'text-slate-900 font-semibold'
              : isDarkWallpaper
              ? isHovered
                ? 'text-white'
                : 'text-white/90'
              : isHovered
              ? 'text-black'
              : 'text-slate-800'
            : isActive
            ? isDarkWallpaper
              ? 'bg-white/20 text-white shadow-sm border-white/25 font-semibold'
              : 'bg-white/85 text-slate-900 shadow-sm border-black/10 font-semibold'
            : isDarkWallpaper
            ? 'text-white/90 hover:text-white bg-white/10 hover:bg-white/20 border-white/15 shadow-xs'
            : 'text-slate-800 hover:text-black bg-white/70 hover:bg-white/90 border-black/8 shadow-sm shadow-black/[0.03]'
        }`}
      >
        {/* Themed micro-dot indicator if color is present */}
        {hasCustomColor && (
          <span
            className={`rounded-full shrink-0 transition-transform ${
              isActive ? 'w-2 h-2 scale-105' : 'w-1.5 h-1.5 opacity-80 group-hover:opacity-100'
            }`}
            style={{
              backgroundColor: color,
              boxShadow: isActive ? `0 0 6px ${color}` : undefined,
            }}
          />
        )}

        {/* Tab Name */}
        <span
          style={!hasCustomColor && !isActive && resolvedColors?.tabs ? { color: resolvedColors.tabs } : undefined}
          className={!hasCustomColor && !isActive && resolvedColors?.tabsShadow ? resolvedColors.tabsShadow : ''}
        >
          {displayName}
        </span>

        {/* Count Badge */}
        <span
          style={badgeStyle}
          className={`text-[10px] px-1.5 py-0.2 rounded-full font-tabular border ${
            hasCustomColor
              ? isActive
                ? isDarkWallpaper
                  ? 'text-white font-semibold'
                  : 'text-slate-900 font-semibold'
                : isDarkWallpaper
                ? 'text-white/80'
                : 'text-slate-700'
              : isActive
              ? isDarkWallpaper
                ? 'bg-white/20 text-white border-transparent font-semibold'
                : 'bg-black/10 text-slate-900 border-transparent font-semibold'
              : isDarkWallpaper
              ? 'bg-white/15 text-white/80 border-transparent'
              : 'bg-black/[0.05] text-slate-600 border-transparent'
          }`}
        >
          {count}
        </span>
      </button>
    </div>
  );
};

interface CategoryTabsProps {
  categories: Category[];
  activeCategoryId: string;
  settings: ThemeSettings;
  resolvedColors?: ResolvedTextColors;
  siteCounts: Record<string, number>;
  onSelectCategory: (id: string) => void;
  onAddCategory: (data: { name: string; showInAll: boolean; color?: string }) => void;
  onUpdateCategory: (id: string, updates: Partial<Category>) => void;
  onDeleteCategory: (id: string) => void;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = React.memo(({
  categories,
  activeCategoryId,
  settings,
  resolvedColors,
  siteCounts,
  onSelectCategory,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}) => {
  // modalCategory: undefined -> closed; null -> add mode; Category -> edit mode
  const [modalCategory, setModalCategory] = useState<Category | null | undefined>(undefined);
  const [activeMenu, setActiveMenu] = useState<{
    category: Category;
    x: number;
    y: number;
  } | null>(null);
  const [confirmDeleteCat, setConfirmDeleteCat] = useState<Category | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const isLight = isLightMode(settings.mode);
  const isDarkWallpaper = resolvedColors
    ? resolvedColors.tabsIsDark
    : !isLight;

  useEffect(() => {
    if (!activeMenu) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveMenu(null);
      }
    };

    const handleScroll = () => {
      setActiveMenu(null);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [activeMenu]);

  const handleContextMenu = (e: React.MouseEvent, cat: Category) => {
    if (cat.isDefault || cat.id === 'all') return;
    e.preventDefault();
    e.stopPropagation();
    const menuWidth = 136;
    const menuHeight = 88;
    const x = Math.min(e.clientX, window.innerWidth - menuWidth - 8);
    const y = Math.min(e.clientY, window.innerHeight - menuHeight - 8);
    setActiveMenu({ category: cat, x, y });
  };

  const handleSaveCategory = (catId: string | null, data: { name: string; showInAll: boolean; color?: string }) => {
    if (catId) {
      onUpdateCategory(catId, data);
    } else {
      onAddCategory(data);
    }
  };

  // When zero categories exist (e.g. fresh private space), show empty list.
  // When categories exist, ensure a root 'All' tab is available if not explicitly present.
  const displayCategories = useMemo(() => {
    if (!categories || categories.length === 0) return [];
    const hasAll = categories.some((c) => c.id === 'all');
    if (hasAll) return categories;
    return [
      {
        id: 'all',
        name: t('allCategories', settings.language) || 'All',
        isDefault: true,
        sortOrder: -1,
      } as Category,
      ...categories,
    ];
  }, [categories, settings.language]);

  return (
    <div id="mytab-tabs" className="flex items-center justify-center flex-wrap gap-2 px-4 mb-6 max-w-4xl mx-auto z-20">
      {displayCategories.map((cat) => {
        const isActive = activeCategoryId === cat.id;
        const count = siteCounts[cat.id] || 0;
        const displayName = cat.id === 'all' ? (t('allCategories', settings.language) || 'All') : cat.name;

        return (
          <CategoryTabItem
            key={cat.id}
            cat={cat}
            isActive={isActive}
            count={count}
            displayName={displayName}
            isDarkWallpaper={isDarkWallpaper}
            resolvedColors={resolvedColors}
            onSelect={() => onSelectCategory(cat.id)}
            onContextMenu={handleContextMenu}
          />
        );
      })}

      {/* Add Category Button */}
      <button
        onClick={() => setModalCategory(null)}
        style={
          resolvedColors?.tabs
            ? { color: resolvedColors.tabs }
            : undefined
        }
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-dashed backdrop-blur-md transition-all cursor-pointer select-none active:scale-95 ${
          isDarkWallpaper
            ? 'text-white/75 hover:text-white bg-white/[0.06] hover:bg-white/15 border-white/20'
            : 'text-slate-700 hover:text-black bg-white/60 hover:bg-white/90 border-black/15 shadow-sm'
        }`}
        title={t('addCategory', settings.language)}
      >
        <FolderPlus className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{t('addCategory', settings.language)}</span>
      </button>

      {/* Unified Add/Edit Category Modal */}
      <CategoryModal
        isOpen={modalCategory !== undefined}
        category={modalCategory ?? null}
        settings={settings}
        onClose={() => setModalCategory(undefined)}
        onSave={handleSaveCategory}
        onDelete={onDeleteCategory}
      />

      {/* Right-click Context Menu Portaled to document.body */}
      {activeMenu &&
        createPortal(
          <div
            ref={menuRef}
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            style={{
              top: `${activeMenu.y}px`,
              left: `${activeMenu.x}px`,
            }}
            className={`glass-dropdown fixed w-34 py-1.5 rounded-xl border shadow-2xl z-[9999] animate-scale-in text-xs font-medium overflow-hidden select-none ${
              isLight
                ? 'border-black/10 shadow-black/15 text-slate-800'
                : 'border-white/15 shadow-black/50 text-white'
            }`}
          >
            <button
              type="button"
              onClick={() => {
                const targetCat = activeMenu.category;
                setActiveMenu(null);
                setModalCategory(targetCat);
              }}
              className={`flex items-center gap-2.5 w-full px-3 py-2 text-left transition-colors cursor-pointer ${
                isLight
                  ? 'text-slate-700 hover:bg-black/5 hover:text-slate-900'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>{t('editCategory', settings.language)}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const targetCat = activeMenu.category;
                setActiveMenu(null);
                setConfirmDeleteCat(targetCat);
              }}
              className={`flex items-center gap-2.5 w-full px-3 py-2 text-left transition-colors cursor-pointer ${
                isLight
                  ? 'text-red-600 hover:bg-red-50'
                  : 'text-red-400 hover:bg-red-500/10'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t('deleteCategory', settings.language)}</span>
            </button>
          </div>,
          document.body
        )}

      {/* Delete Confirmation Modal for Direct Context Menu Deletion */}
      {confirmDeleteCat && (
        <ConfirmModal
          isOpen={Boolean(confirmDeleteCat)}
          type="danger"
          title={t('deleteCategory', settings.language)}
          message={t('confirmDeleteCategory', settings.language)}
          confirmText={t('deleteCategory', settings.language)}
          language={settings.language}
          onConfirm={() => {
            if (confirmDeleteCat) {
              onDeleteCategory(confirmDeleteCat.id);
              setConfirmDeleteCat(null);
            }
          }}
          onCancel={() => setConfirmDeleteCat(null)}
        />
      )}
    </div>
  );
});
