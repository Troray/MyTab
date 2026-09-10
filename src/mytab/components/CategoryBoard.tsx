import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { FolderPlus } from 'lucide-react';
import { Category, SiteItem, ThemeSettings } from '../../types';
import { ResolvedTextColors } from '../../utils/wallpaperAnalyzer';
import { BoardColumn } from './BoardColumn';
import { CategoryModal } from './CategoryModal';
import { ConfirmModal } from './ConfirmModal';
import { t } from '../../utils/i18n';

interface CategoryBoardProps {
  categories: Category[];
  sites: SiteItem[];
  settings: ThemeSettings;
  resolvedColors?: ResolvedTextColors;
  isEditing?: boolean;
  onOpenSite: (url: string) => void;
  onEditSite: (site: SiteItem) => void;
  onDeleteSite: (siteId: string) => void;
  onAddSiteToCategory: (categoryId: string) => void;
  onAddCategory: (data: { name: string; showInAll: boolean; color?: string }) => void;
  onUpdateCategory: (id: string, updates: Partial<Category>) => void;
  onDeleteCategory: (id: string) => void;
  onReorderSites?: (reorderedSites: SiteItem[]) => void;
}

export const CategoryBoard: React.FC<CategoryBoardProps> = ({
  categories,
  sites,
  settings,
  resolvedColors,
  isEditing = false,
  onOpenSite,
  onEditSite,
  onDeleteSite,
  onAddSiteToCategory,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onReorderSites,
}) => {
  const isLight =
    settings.mode === 'light' ||
    (settings.mode === 'system' &&
      typeof window !== 'undefined' &&
      !window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Category modal for editing/adding directly within board view
  // undefined: closed; null: add; Category: edit
  const [modalCategory, setModalCategory] = useState<Category | null | undefined>(undefined);
  const [confirmingDeleteCategory, setConfirmingDeleteCategory] = useState<Category | null>(null);

  // Filter out virtual "all" category, sort categories by sortOrder,
  // and dynamically generate "uncategorized" column if orphan/uncategorized sites exist
  const { boardCategories, sitesByCategory } = useMemo(() => {
    const validCategories = categories
      .filter((cat) => cat.id !== 'all')
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

    const knownCatIds = new Set(validCategories.map((c) => c.id));
    const uncategorizedList = sites.filter((s) => !knownCatIds.has(s.categoryId));

    const map = new Map<string, SiteItem[]>();
    for (const cat of validCategories) {
      map.set(cat.id, []);
    }

    for (const site of sites) {
      if (knownCatIds.has(site.categoryId)) {
        map.get(site.categoryId)!.push(site);
      }
    }

    // Sort sites within each category by sortOrder
    map.forEach((list) => {
      list.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    });

    const displayCats: Category[] = [...validCategories];

    // If there are sites not matching any valid category (e.g. categoryId === 'all',
    // or in private mode with 0 categories, or orphan sites from imported bookmarks)
    if (uncategorizedList.length > 0) {
      const uncategorizedCat: Category = {
        id: 'uncategorized',
        name: t('uncategorized', settings.language),
        sortOrder: -1,
        isDefault: true,
      };
      // Place uncategorized column at the front
      displayCats.unshift(uncategorizedCat);
      uncategorizedList.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      map.set('uncategorized', uncategorizedList);
    }

    return { boardCategories: displayCats, sitesByCategory: map };
  }, [categories, sites, settings.language]);

  const handleSaveCategory = (catId: string | null, data: { name: string; showInAll: boolean; color?: string }) => {
    if (catId) {
      onUpdateCategory(catId, data);
    } else {
      onAddCategory(data);
    }
  };

  // Drag and Drop state across columns
  const [draggingSiteId, setDraggingSiteId] = useState<string | null>(null);
  const [draggingSourceCatId, setDraggingSourceCatId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ categoryId: string; index: number } | null>(null);
  // These refs mirror the corresponding state values so that useCallback handlers
  // (which capture a stale closure over state) can always read the *latest* value
  // without being listed in every dependency array. This is an intentional pattern,
  // NOT a side-effect — assigning ref.current during render is safe here because
  // refs don't trigger re-renders and we never read them during SSR.
  const dropTargetRef = useRef<{ categoryId: string; index: number } | null>(null);
  dropTargetRef.current = dropTarget;
  const draggingSiteIdRef = useRef<string | null>(null);
  draggingSiteIdRef.current = draggingSiteId;
  const draggingSourceCatIdRef = useRef<string | null>(null);
  draggingSourceCatIdRef.current = draggingSourceCatId;
  // RAF ref for smooth, frame-throttled visual state updates
  const rafRef = useRef<number | null>(null);

  const updateDropTarget = useCallback((target: { categoryId: string; index: number } | null) => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const current = dropTargetRef.current;
      if (
        (current === null && target === null) ||
        (current && target && current.categoryId === target.categoryId && current.index === target.index)
      ) {
        return;
      }
      setDropTarget(target);
    });
  }, []);

  const handleDragStart = useCallback((e: React.DragEvent, siteId: string, categoryId: string) => {
    e.dataTransfer.setData('text/plain', siteId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingSiteId(siteId);
    setDraggingSourceCatId(categoryId);
  }, []);

  const handleDragOverSite = useCallback((e: React.DragEvent, targetSiteId: string, categoryId: string, index: number) => {
    const currentDragId = draggingSiteIdRef.current;
    if (!currentDragId) return;

    // Hovering directly over the dragged item in its own category: clear target (no-op position)
    if (currentDragId === targetSiteId) {
      if (dropTargetRef.current !== null) {
        updateDropTarget(null);
      }
      return;
    }

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const relY = e.clientY - rect.top;
    const height = rect.height;
    if (height <= 0) return;

    // Hysteresis deadband around midpoint to prevent rapid oscillation
    const isCurrentTarget = dropTargetRef.current?.categoryId === categoryId;
    const currentIndex = isCurrentTarget ? dropTargetRef.current?.index : -1;

    let insertIndex: number;
    if (currentIndex === index) {
      // Currently targeting above this item: keep above until past 60% of height
      insertIndex = relY > height * 0.6 ? index + 1 : index;
    } else if (currentIndex === index + 1) {
      // Currently targeting below this item: keep below until above 40% of height
      insertIndex = relY < height * 0.4 ? index : index + 1;
    } else {
      insertIndex = relY > height * 0.5 ? index + 1 : index;
    }

    // In same category: dropping right above or right below the original position is a no-op
    const isSameCategory = draggingSourceCatIdRef.current === categoryId;
    if (isSameCategory) {
      const colSites = sitesByCategory.get(categoryId) || [];
      const fromIdx = colSites.findIndex((s) => s.id === currentDragId);
      if (fromIdx !== -1 && (insertIndex === fromIdx || insertIndex === fromIdx + 1)) {
        if (dropTargetRef.current !== null) {
          updateDropTarget(null);
        }
        return;
      }
    }

    updateDropTarget({ categoryId, index: insertIndex });
  }, [sitesByCategory, updateDropTarget]);

  const handleDragOverColumn = useCallback((e: React.DragEvent, categoryId: string) => {
    if (!draggingSiteIdRef.current) return;
    const colSites = sitesByCategory.get(categoryId) || [];

    if (colSites.length === 0) {
      updateDropTarget({ categoryId, index: 0 });
      return;
    }

    // When dragging over a non-empty column container, determine whether
    // pointer is near top or bottom to prevent spurious jump to the end of the list
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const relY = e.clientY - rect.top;
    const targetIdx = relY < 35 ? 0 : colSites.length;

    // If in same category and targetIdx is a no-op position for the dragged item
    const isSameCategory = draggingSourceCatIdRef.current === categoryId;
    if (isSameCategory) {
      const fromIdx = colSites.findIndex((s) => s.id === draggingSiteIdRef.current);
      if (fromIdx !== -1 && (targetIdx === fromIdx || targetIdx === fromIdx + 1)) {
        if (dropTargetRef.current !== null) {
          updateDropTarget(null);
        }
        return;
      }
    }

    updateDropTarget({ categoryId, index: targetIdx });
  }, [sitesByCategory, updateDropTarget]);

  const handleDragEnd = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setDraggingSiteId(null);
    setDraggingSourceCatId(null);
    setDropTarget(null);
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetCategoryId: string) => {
    e.preventDefault();
    const currentDragId = draggingSiteIdRef.current;
    const currentSourceCatId = draggingSourceCatIdRef.current;
    const currentDrop = dropTargetRef.current;

    // Reset visual DnD state immediately so UI is clean even if persistence fails
    handleDragEnd();

    if (!currentDragId || !onReorderSites) return;
    const draggedSite = sites.find((s) => s.id === currentDragId);
    if (!draggedSite) return;

    const sourceCatId = currentSourceCatId || draggedSite.categoryId;

    try {
      if (sourceCatId === targetCategoryId) {
        // If there is no explicit drop target (e.g. dropped on itself or outside valid slot), no-op
        if (!currentDrop || currentDrop.categoryId !== targetCategoryId) return;

        // In-column reordering within the same category
        const currentList = [...(sitesByCategory.get(targetCategoryId) || [])];
        const fromIdx = currentList.findIndex((s) => s.id === currentDragId);
        if (fromIdx === -1) return;

        let toIdx = currentDrop.index;
        if (fromIdx < toIdx) {
          toIdx = toIdx - 1;
        }
        toIdx = Math.max(0, Math.min(toIdx, currentList.length - 1));
        if (fromIdx === toIdx) return;

        const [moved] = currentList.splice(fromIdx, 1);
        currentList.splice(toIdx, 0, moved);

        const updatedCategorySites = currentList.map((site, idx) => ({
          ...site,
          sortOrder: idx,
          updatedAt: Date.now(),
        }));

        onReorderSites(updatedCategorySites);
      } else {
        // Cross-column move to another category
        const sourceList = [...(sitesByCategory.get(sourceCatId) || [])].filter((s) => s.id !== currentDragId);
        const targetList = [...(sitesByCategory.get(targetCategoryId) || [])];

        let toIdx = currentDrop && currentDrop.categoryId === targetCategoryId ? currentDrop.index : targetList.length;
        toIdx = Math.max(0, Math.min(toIdx, targetList.length));

        const movedSite: SiteItem = {
          ...draggedSite,
          categoryId: targetCategoryId,
          updatedAt: Date.now(),
        };
        targetList.splice(toIdx, 0, movedSite);

        const updatedSource = sourceList.map((s, idx) => ({ ...s, sortOrder: idx, updatedAt: Date.now() }));
        const updatedTarget = targetList.map((s, idx) => ({ ...s, sortOrder: idx, updatedAt: Date.now() }));

        onReorderSites([...updatedSource, ...updatedTarget]);
      }
    } catch (err) {
      console.warn('[MyTab] BoardColumn: Failed to persist reorder after drop:', err);
    }
  }, [sites, sitesByCategory, onReorderSites, handleDragEnd]);

  const cols = settings.boardColumnsPerRow || 5;
  const gap = settings.boardCardGap ?? 16;

  // Track window width for clean responsive adaptation
  const [windowWidth, setWindowWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1280
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Compute effective columns based on screen width and user setting
  const effectiveCols = useMemo(() => {
    if (windowWidth < 640) return 1;
    if (windowWidth < 768) return Math.min(2, cols);
    if (windowWidth < 1024) return Math.min(3, cols);
    return cols;
  }, [windowWidth, cols]);

  // Expand container max-width generously for high-column setups on desktop/ultrawide displays
  const containerMaxWidth = useMemo(() => {
    if (cols >= 7) return 'max-w-[1920px]';
    if (cols >= 6) return 'max-w-[1680px]';
    if (cols >= 5) return 'max-w-[1480px]';
    return 'max-w-7xl';
  }, [cols]);

  // Distribute categories round-robin across columns for natural left-to-right reading order
  const columnData = useMemo(() => {
    const columnCount = Math.max(1, effectiveCols);
    const result: {
      type: 'category' | 'add';
      category?: Category;
      originalIndex?: number;
    }[][] = Array.from({ length: columnCount }, () => []);

    boardCategories.forEach((cat, idx) => {
      const colIndex = idx % columnCount;
      result[colIndex].push({
        type: 'category',
        category: cat,
        originalIndex: idx,
      });
    });

    if (isEditing) {
      const addColIndex = boardCategories.length % columnCount;
      result[addColIndex].push({
        type: 'add',
      });
    }

    return result;
  }, [boardCategories, effectiveCols, isEditing]);

  const activeColumns = useMemo(() => {
    return columnData.filter((col) => col.length > 0);
  }, [columnData]);

  const boardAlign = settings.boardAlign || 'left';
  const isFewerColumns = activeColumns.length < effectiveCols;

  const columnWidthStyle = useMemo<React.CSSProperties>(() => {
    if (isFewerColumns) {
      return {
        width: `calc((100% - ${(effectiveCols - 1) * gap}px) / ${effectiveCols})`,
        flex: '0 0 auto',
        gap: `${gap}px`,
      };
    }
    return {
      flex: '1 1 0%',
      minWidth: 0,
      gap: `${gap}px`,
    };
  }, [isFewerColumns, effectiveCols, gap]);

  const justifyClass =
    boardAlign === 'center'
      ? 'justify-center'
      : boardAlign === 'right'
      ? 'justify-end'
      : 'justify-start';

  return (
    <div className={`w-full ${containerMaxWidth} mx-auto px-4 md:px-6 my-4 z-20`}>
      {/* Waterfall / Masonry Layout Container using Multi-Column Flex */}
      <div
        className={`w-full flex items-start ${justifyClass}`}
        style={{ gap: `${gap}px` }}
      >
        {activeColumns.map((colItems, colIdx) => (
          <div
            key={colIdx}
            className="flex flex-col min-w-0"
            style={columnWidthStyle}
          >
            {colItems.map((item) => {
              if (item.type === 'category' && item.category) {
                const categorySites = sitesByCategory.get(item.category.id) || [];
                return (
                  <BoardColumn
                    key={item.category.id}
                    category={item.category}
                    index={item.originalIndex ?? 0}
                    sites={categorySites}
                    settings={settings}
                    resolvedColors={resolvedColors}
                    isEditing={isEditing}
                    draggingSiteId={draggingSiteId}
                    dropTarget={dropTarget}
                    onDragStart={handleDragStart}
                    onDragOverSite={handleDragOverSite}
                    onDragOverColumn={handleDragOverColumn}
                    onDrop={handleDrop}
                    onDragEnd={handleDragEnd}
                    onOpenSite={onOpenSite}
                    onEditSite={onEditSite}
                    onDeleteSite={onDeleteSite}
                    onAddSiteToCategory={onAddSiteToCategory}
                    onEditCategory={(cat) => setModalCategory(cat)}
                    onDeleteCategory={(catId) => {
                      const target = categories.find((c) => c.id === catId);
                      if (target) setConfirmingDeleteCategory(target);
                    }}
                  />
                );
              }

              if (item.type === 'add') {
                return (
                  <div key="add-category-btn" className="w-full animate-fade-in">
                    <button
                      onClick={() => setModalCategory(null)}
                      className={`w-full min-h-[140px] flex flex-col items-center justify-center gap-2 rounded-2xl p-5 border border-dashed duration-0 hover:scale-[1.01] cursor-pointer group/add ${
                        isLight
                          ? 'border-black/15 hover:border-black/30 hover:bg-white/50 text-slate-500 hover:text-slate-900'
                          : 'border-white/15 hover:border-white/30 hover:bg-white/[0.05] text-white/40 hover:text-white'
                      }`}
                      title={t('addCategory', settings.language)}
                    >
                      <div
                        className={`p-3 rounded-full border transition-transform duration-200 group-hover/add:scale-110 ${
                          isLight
                            ? 'bg-black/[0.04] border-black/5 text-slate-700'
                            : 'bg-white/10 border-white/10 text-white'
                        }`}
                      >
                        <FolderPlus className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-semibold tracking-wide">
                        {t('addCategory', settings.language)}
                      </span>
                    </button>
                  </div>
                );
              }

              return null;
            })}
          </div>
        ))}
      </div>

      {/* Category Modal */}
      {modalCategory !== undefined && (
        <CategoryModal
          isOpen={true}
          category={modalCategory}
          settings={settings}
          onClose={() => setModalCategory(undefined)}
          onSave={handleSaveCategory}
          onDelete={onDeleteCategory}
        />
      )}

      {/* Delete Category Confirmation Modal */}
      {confirmingDeleteCategory && (
        <ConfirmModal
          isOpen={true}
          type="danger"
          title={t('deleteCategory', settings.language)}
          message={t('confirmDeleteCategory', settings.language)}
          confirmText={t('deleteCategory', settings.language)}
          language={settings.language}
          isLight={isLight}
          onConfirm={() => {
            onDeleteCategory(confirmingDeleteCategory.id);
            setConfirmingDeleteCategory(null);
          }}
          onCancel={() => setConfirmingDeleteCategory(null)}
        />
      )}

      {/* Empty State when no categories and no sites exist and not in editing mode */}
      {boardCategories.length === 0 && !isEditing && (
        <div className="w-full py-16 flex flex-col items-center justify-center text-center animate-fade-in gap-3">
          <p className={`text-sm select-none ${isLight ? 'text-slate-500' : 'text-white/50'}`}>
            {t('emptyCategorySites', settings.language)}
          </p>
          <button
            onClick={() => setModalCategory(null)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
              isLight
                ? 'bg-black/5 hover:bg-black/10 border-black/10 text-slate-700'
                : 'bg-white/10 hover:bg-white/15 border-white/15 text-white'
            }`}
          >
            <FolderPlus className="w-4 h-4" />
            <span>{t('addCategory', settings.language)}</span>
          </button>
        </div>
      )}
    </div>
  );
};
