import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FolderPlus, Pencil, Trash2, ChevronDown, Check, FolderInput } from 'lucide-react';
import { Category, GridPage, ThemeSettings } from '../../types';
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
  onSelect: (id: string) => void;
  onContextMenu: (e: React.MouseEvent, cat: Category) => void;
}

const CategoryTabItem: React.FC<CategoryTabItemProps> = React.memo(({
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
        onClick={() => onSelect(cat.id)}
        onContextMenu={(e) => onContextMenu(e, cat)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={customStyle}
        className={`group flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs md:text-sm font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-out cursor-pointer select-none active:scale-95 border backdrop-blur-md ${
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
});

interface CategoryTabsProps {
  categories: Category[];
  activeCategoryId: string;
  settings: ThemeSettings;
  resolvedColors?: ResolvedTextColors;
  siteCounts: Record<string, number>;
  gridPages?: GridPage[];
  activeGridPageId?: string;
  onSelectCategory: (id: string) => void;
  onAddCategory: (data: { name: string; showInAll: boolean; color?: string; pageId?: string }) => void;
  onUpdateCategory: (id: string, updates: Partial<Category>) => void;
  onDeleteCategory: (id: string) => void;
  onMoveCategoryToPage?: (categoryId: string, targetPageId: string) => void;
  onOpenBookmarkImport?: () => void;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = React.memo(({
  categories,
  activeCategoryId,
  settings,
  resolvedColors,
  siteCounts,
  gridPages,
  activeGridPageId,
  onSelectCategory,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onMoveCategoryToPage,
  onOpenBookmarkImport,
}) => {
  // modalCategory: undefined -> closed; null -> add mode; Category -> edit mode
  const [modalCategory, setModalCategory] = useState<Category | null | undefined>(undefined);
  const [activeMenu, setActiveMenu] = useState<{
    category: Category;
    x: number;
    y: number;
  } | null>(null);
  const [confirmDeleteCat, setConfirmDeleteCat] = useState<Category | null>(null);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const moreDropdownRef = useRef<HTMLDivElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const isLight = isLightMode(settings.mode);
  const isDarkWallpaper = resolvedColors
    ? resolvedColors.tabsIsDark
    : !isLight;

  const prevPageIdRef = useRef(activeGridPageId);

  useEffect(() => {
    if (prevPageIdRef.current && activeGridPageId && prevPageIdRef.current !== activeGridPageId) {
      setIsMoreOpen(false);
      setActiveMenu(null);
      prevPageIdRef.current = activeGridPageId;
    } else if (activeGridPageId) {
      prevPageIdRef.current = activeGridPageId;
    }
  }, [activeGridPageId]);

  useEffect(() => {
    if (!isMoreOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        moreDropdownRef.current &&
        !moreDropdownRef.current.contains(e.target as Node) &&
        moreButtonRef.current &&
        !moreButtonRef.current.contains(e.target as Node)
      ) {
        setIsMoreOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMoreOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMoreOpen]);

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

  const handleContextMenu = useCallback((e: React.MouseEvent, cat: Category) => {
    if (cat.isDefault || cat.id === 'all') return;
    e.preventDefault();
    e.stopPropagation();
    const menuWidth = 180;
    const menuHeight = 160;
    const x = Math.min(e.clientX, window.innerWidth - menuWidth - 8);
    const y = Math.min(e.clientY, window.innerHeight - menuHeight - 8);
    setActiveMenu({ category: cat, x, y });
  }, []);

  const handleSaveCategory = (catId: string | null, data: { name: string; showInAll: boolean; color?: string; pageId?: string }) => {
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

  // Configurable navbar visible categories limit.
  // maxNavCategories: 0 means unlimited (no folding); > 0 (default 6) folds excess categories into "More" dropdown
  const { visibleCategories, overflowCategories } = useMemo(() => {
    const limit = settings.maxNavCategories ?? 6;
    if (limit > 0 && displayCategories.length > limit) {
      return {
        visibleCategories: displayCategories.slice(0, limit),
        overflowCategories: displayCategories.slice(limit),
      };
    }
    return {
      visibleCategories: displayCategories,
      overflowCategories: [],
    };
  }, [displayCategories, settings.maxNavCategories]);

  const isOverflowActive = useMemo(() => {
    return overflowCategories.some((c) => c.id === activeCategoryId);
  }, [overflowCategories, activeCategoryId]);

  const activeOverflowCategory = useMemo(() => {
    return overflowCategories.find((c) => c.id === activeCategoryId);
  }, [overflowCategories, activeCategoryId]);

  return (
    <div
      id="mytab-tabs"
      className="flex items-center justify-center flex-wrap gap-2 px-4 mb-6 max-w-4xl mx-auto z-20"
    >
      <div className="flex items-center justify-center flex-wrap gap-2">
        {visibleCategories.map((cat) => {
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
              onSelect={onSelectCategory}
              onContextMenu={handleContextMenu}
            />
          );
        })}

        {/* Overflow "More" Categories Dropdown */}
        {overflowCategories.length > 0 && (
          <div className="relative flex items-center">
            <button
              ref={moreButtonRef}
              onClick={() => setIsMoreOpen((prev) => !prev)}
              style={
                isOverflowActive && activeOverflowCategory?.color
                  ? {
                      backgroundColor: hexToRgba(activeOverflowCategory.color, isDarkWallpaper ? 0.28 : 0.20),
                      borderColor: hexToRgba(activeOverflowCategory.color, isDarkWallpaper ? 0.60 : 0.45),
                    }
                  : !isOverflowActive && resolvedColors?.tabs
                  ? { color: resolvedColors.tabs }
                  : undefined
              }
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs md:text-sm font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-out cursor-pointer select-none active:scale-95 border backdrop-blur-md ${
                isOverflowActive
                  ? isDarkWallpaper
                    ? 'bg-white/20 text-white shadow-sm border-white/25 font-semibold'
                    : 'bg-white/85 text-slate-900 shadow-sm border-black/10 font-semibold'
                  : isDarkWallpaper
                  ? 'text-white/90 hover:text-white bg-white/10 hover:bg-white/20 border-white/15 shadow-xs'
                  : 'text-slate-800 hover:text-black bg-white/70 hover:bg-white/90 border-black/8 shadow-sm shadow-black/[0.03]'
              }`}
            >
              <span>
                {isOverflowActive && activeOverflowCategory
                  ? `${t('moreCategories', settings.language)}: ${activeOverflowCategory.name}`
                  : t('moreCategories', settings.language)}
              </span>
              {isOverflowActive && activeOverflowCategory && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-tabular border ${
                    isDarkWallpaper
                      ? 'bg-white/20 text-white border-transparent font-semibold'
                    : 'bg-black/10 text-slate-900 border-transparent font-semibold'
                  }`}
                >
                  {siteCounts[activeOverflowCategory.id] || 0}
                </span>
              )}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isMoreOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Standardized Frosted Glass Dropdown Menu */}
            {isMoreOpen && (
              <div
                ref={moreDropdownRef}
                className={`glass-dropdown absolute top-[calc(100%+8px)] right-0 z-50 min-w-[210px] max-h-[340px] overflow-y-auto py-1.5 px-1.5 rounded-2xl border shadow-2xl animate-scale-in scrollbar-thin select-none ${
                  isLight
                    ? 'border-black/10 shadow-black/15 text-slate-900'
                    : 'border-white/15 shadow-black/50 text-white'
                }`}
              >
                <div
                  className={`px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider ${
                    isLight ? 'text-slate-400' : 'text-white/40'
                  }`}
                >
                  {t('moreCategories', settings.language)} ({overflowCategories.length})
                </div>
                <div className="space-y-0.5 mt-0.5">
                  {overflowCategories.map((cat) => {
                    const isCatActive = activeCategoryId === cat.id;
                    const count = siteCounts[cat.id] || 0;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          onSelectCategory(cat.id);
                          setIsMoreOpen(false);
                        }}
                        onContextMenu={(e) => {
                          handleContextMenu(e, cat);
                          setIsMoreOpen(false);
                        }}
                        className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer text-left ${
                          isCatActive
                            ? isLight
                              ? 'bg-black/5 font-semibold text-black'
                              : 'bg-white/15 font-semibold text-white'
                            : isLight
                            ? 'text-slate-700 hover:bg-black/5 hover:text-slate-900'
                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {cat.color ? (
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                              style={{ backgroundColor: cat.color }}
                            />
                          ) : (
                            <span
                              className={`w-2 h-2 rounded-full shrink-0 ${
                                isLight ? 'bg-slate-300' : 'bg-white/30'
                              }`}
                            />
                          )}
                          <span className="truncate">{cat.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded-full font-tabular ${
                              isLight
                                ? 'bg-black/[0.05] text-slate-600'
                                : 'bg-white/10 text-white/60'
                            }`}
                          >
                            {count}
                          </span>
                          {isCatActive && (
                            <Check
                              className={`w-3.5 h-3.5 shrink-0 ml-1 ${
                                isLight ? 'text-blue-600' : 'text-blue-400'
                              }`}
                            />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Unified Add/Edit Category Modal */}
      <CategoryModal
        isOpen={modalCategory !== undefined}
        category={modalCategory ?? null}
        settings={settings}
        gridPages={gridPages}
        activeGridPageId={activeGridPageId}
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
            className={`glass-dropdown fixed min-w-[160px] max-w-[220px] py-1.5 rounded-xl border shadow-2xl z-[9999] animate-scale-in text-xs font-medium overflow-hidden select-none ${
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

            {/* Move to another desktop options */}
            {gridPages && gridPages.length > 1 && onMoveCategoryToPage && (
              <>
                <div className={`my-1 border-t ${isLight ? 'border-black/5' : 'border-white/10'}`} />
                {gridPages
                  .filter((p) => p.id !== (activeMenu.category.pageId || activeGridPageId || (gridPages && gridPages[0]?.id)))
                  .map((page, pIdx) => {
                    const pageDisplayName = page.name || `${t('defaultDesktopName', settings.language)} ${pIdx + 1}`;
                    return (
                      <button
                        key={page.id}
                        type="button"
                        onClick={() => {
                          const catId = activeMenu.category.id;
                          setActiveMenu(null);
                          onMoveCategoryToPage(catId, page.id);
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
            )}

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
