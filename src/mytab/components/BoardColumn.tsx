import React from 'react';
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react';
import { Category, SiteItem, ThemeSettings } from '../../types';
import { ResolvedTextColors } from '../../utils/wallpaperAnalyzer';
import { DEFAULT_CATEGORY_COLORS, BOARD_DARK_TEXT_TOKENS } from '../../utils/constants';
import { t } from '../../utils/i18n';

interface BoardColumnProps {
  category: Category;
  index: number;
  sites: SiteItem[];
  settings: ThemeSettings;
  resolvedColors?: ResolvedTextColors;
  isEditing?: boolean;
  onOpenSite: (url: string) => void;
  onEditSite: (site: SiteItem) => void;
  onDeleteSite: (siteId: string) => void;
  onAddSiteToCategory: (categoryId: string) => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory?: (categoryId: string) => void;
  // DnD Props
  draggingSiteId?: string | null;
  dropTarget?: { categoryId: string; index: number } | null;
  onDragStart?: (e: React.DragEvent, siteId: string, categoryId: string) => void;
  onDragOverSite?: (e: React.DragEvent, siteId: string, categoryId: string, index: number) => void;
  onDragOverColumn?: (e: React.DragEvent, categoryId: string) => void;
  onDrop?: (e: React.DragEvent, categoryId: string) => void;
  onDragEnd?: () => void;
}

export const BoardColumn: React.FC<BoardColumnProps> = ({
  category,
  index,
  sites,
  settings,
  resolvedColors,
  isEditing = false,
  onOpenSite,
  onEditSite,
  onDeleteSite,
  onAddSiteToCategory,
  onEditCategory,
  onDeleteCategory,
  draggingSiteId,
  dropTarget,
  onDragStart,
  onDragOverSite,
  onDragOverColumn,
  onDrop,
  onDragEnd,
}) => {
  const isLight =
    settings.mode === 'light' ||
    (settings.mode === 'system' &&
      typeof window !== 'undefined' &&
      !window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Category Title Color: category.color (per-category custom) -> custom boardTitle -> preset palette fallback
  const titleColor =
    category.color ||
    (settings.textColorMode === 'custom' && settings.customTextColors?.boardTitle
      ? resolvedColors?.boardTitle
      : DEFAULT_CATEGORY_COLORS[index % DEFAULT_CATEGORY_COLORS.length]);

  // Site text color: resolvedColors.boardText -> light/dark default
  const siteTextColor =
    resolvedColors?.boardText ||
    (isLight ? '#334155' : 'rgba(255, 255, 255, 0.88)');

  // Use centralized token list to decide dark-text vs light-text UI patterns
  const isDarkText = (BOARD_DARK_TEXT_TOKENS as readonly string[]).includes(siteTextColor);
  const titleAlign = settings.boardTitleAlign || 'left';
  const titleSize = settings.boardTitleSize ?? 15;
  const itemSpacing = settings.boardItemSpacing ?? 6;

  const showCardBg = settings.boardShowCardBackground !== false;
  const boardOpacity = settings.boardCardOpacity ?? 0.20;

  // 与网格模式一致的纯净透明度机制：采用 rgba(255, 255, 255, opacity) 且不叠加高斯模糊滤镜，呈现真实通透的壁纸质感
  const cardBgStyle: React.CSSProperties = showCardBg
    ? {
        backgroundColor: `rgba(255, 255, 255, ${boardOpacity})`,
      }
    : {
        backgroundColor: 'transparent',
      };

  const isThisColTarget = dropTarget?.categoryId === category.id;

  return (
    <div
      style={cardBgStyle}
      onDragOver={(e) => {
        if (isEditing) {
          e.preventDefault();
          if (e.target === e.currentTarget) {
            onDragOverColumn?.(e, category.id);
          }
        }
      }}
      onDrop={(e) => {
        if (isEditing) {
          e.preventDefault();
          if (e.target === e.currentTarget) {
            onDrop?.(e, category.id);
          }
        }
      }}
      className={`w-full flex flex-col rounded-2xl pt-3 px-3.5 pb-3 border duration-0 ${
        showCardBg
          ? isLight
            ? isEditing
              ? 'border-blue-500/30 ring-1 ring-blue-500/20 shadow-md shadow-black/[0.04]'
              : 'border-transparent hover:border-transparent shadow-md shadow-black/[0.04] hover:shadow-lg hover:shadow-black/10 hover:scale-[1.01]'
            : isEditing
              ? 'border-blue-400/30 ring-1 ring-blue-400/20 shadow-md shadow-black/20'
              : 'border-white/10 hover:border-white/30 shadow-md shadow-black/20 hover:shadow-lg hover:shadow-black/40 hover:scale-[1.01]'
          : isEditing
            ? isLight
              ? 'border border-dashed border-blue-500/40 bg-white/20'
              : 'border border-dashed border-blue-400/40 bg-white/[0.04]'
            : 'border-transparent'
      }`}
    >
      {/* Column Header */}
      <div
        className={`group/header relative flex items-center pb-1.5 mb-1.5 border-b ${isDarkText ? 'border-black/[0.06]' : 'border-white/10'} ${
          titleAlign === 'center'
            ? 'justify-center text-center'
            : titleAlign === 'right'
            ? 'justify-end text-right'
            : 'justify-between text-left'
        }`}
      >
        <h3
          style={{ fontSize: `${titleSize}px`, color: titleColor }}
          className={`font-bold tracking-wide truncate min-w-0 select-none cursor-default font-mono ${
            titleAlign === 'center'
              ? 'text-center w-full'
              : titleAlign === 'right'
              ? 'text-right flex-1'
              : 'text-left flex-1'
          }`}
          title={category.name}
        >
          {category.name}
        </h3>

        {/* Category Actions: Only shown on hover during Edit Mode */}
        {isEditing && (
          <div
            className={`flex items-center gap-1 opacity-0 group-hover/header:opacity-100 transition-opacity duration-150 ${
              titleAlign === 'center'
                ? 'absolute right-0 top-0'
                : titleAlign === 'right'
                ? 'absolute left-0 top-0'
                : ''
            }`}
          >
            {category.id !== 'uncategorized' && (
              <button
                onClick={() => onEditCategory(category)}
                className={`p-1 rounded-md transition-colors cursor-pointer ${
                  isDarkText
                    ? 'hover:bg-black/5 text-slate-400 hover:text-slate-800'
                    : 'hover:bg-white/10 text-white/40 hover:text-white'
                }`}
                title={t('editCategory', settings.language)}
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
            {!category.isDefault && onDeleteCategory && (
              <button
                onClick={() => onDeleteCategory(category.id)}
                className={`p-1 rounded-md transition-colors cursor-pointer ${
                  isDarkText
                    ? 'text-slate-400 hover:text-red-600 hover:bg-red-500/10'
                    : 'text-white/40 hover:text-red-400 hover:bg-red-500/10'
                }`}
                title={t('deleteCategory', settings.language)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Sites List */}
      <div
        className={`py-0.5 rounded-xl transition-colors duration-150 ${
          isEditing && isThisColTarget && sites.length === 0
            ? 'ring-2 ring-blue-500/50 bg-blue-500/[0.08]'
            : ''
        }`}
        onDragOver={(e) => {
          if (isEditing) {
            e.preventDefault();
            // Only handle column-level dragover when the pointer is directly on
            // the container background (not on any child item or indicator line).
            if (e.target === e.currentTarget) {
              onDragOverColumn?.(e, category.id);
            }
          }
        }}
        onDrop={(e) => {
          if (isEditing) {
            e.preventDefault();
            onDrop?.(e, category.id);
          }
        }}
      >
        {sites.length === 0 ? (
          <div
            className={`py-4 text-center text-xs rounded-lg transition-colors select-none border border-dashed ${
              isEditing && isThisColTarget
                ? 'border-blue-500/60 bg-blue-500/10 text-blue-500 font-medium'
                : 'border-transparent opacity-40'
            }`}
          >
            {t('emptyCategorySites', settings.language)}
          </div>
        ) : (
          sites.map((site, siteIdx) => {
            const isBeingDragged = draggingSiteId === site.id;
            // Visual indicator conditions for drop target
            const showLineAbove = isThisColTarget && dropTarget?.index === siteIdx && !isBeingDragged;
            const showLineBelow =
              isThisColTarget &&
              dropTarget?.index === siteIdx + 1 &&
              siteIdx === sites.length - 1 &&
              !isBeingDragged;

            return (
              <div
                key={site.id}
                draggable={isEditing}
                aria-label={site.title}
                aria-roledescription={isEditing ? 'draggable shortcut' : undefined}
                tabIndex={isEditing ? 0 : undefined}
                onDragStart={(e) => {
                  if (isEditing) {
                    onDragStart?.(e, site.id, category.id);
                  }
                }}
                onDragOver={(e) => {
                  if (isEditing) {
                    e.preventDefault();
                    e.stopPropagation();
                    onDragOverSite?.(e, site.id, category.id, siteIdx);
                  }
                }}
                onDrop={(e) => {
                  if (isEditing) {
                    e.preventDefault();
                    e.stopPropagation();
                    onDrop?.(e, category.id);
                  }
                }}
                onDragEnd={() => {
                  if (isEditing) {
                    onDragEnd?.();
                  }
                }}
                style={{
                  paddingTop: `${Math.max(1, itemSpacing / 2)}px`,
                  paddingBottom: `${Math.max(1, itemSpacing / 2)}px`,
                }}
                className={`group/item relative flex items-center justify-between px-2 -mx-1 rounded-lg duration-0 transition-colors ${
                  isBeingDragged ? 'opacity-30' : 'opacity-100'
                } ${
                  isEditing
                    ? 'cursor-grab active:cursor-grabbing select-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-400/60 rounded-lg'
                    : 'cursor-pointer'
                } ${
                  isDarkText
                    ? 'hover:bg-black/[0.06] active:bg-black/[0.10]'
                    : 'hover:bg-white/[0.14] active:bg-white/[0.18]'
                }`}
                onClick={() => {
                  if (!isEditing) {
                    onOpenSite(site.url);
                  }
                }}
              >
                {/* Zero-layout-shift Drop Indicator: Above
                   Rendered absolute inside the item row so the DOM layout never shifts during dragover */}
                {showLineAbove && (
                  <div className="absolute -top-[1.5px] left-1 right-1 h-[3px] bg-blue-500 rounded-full shadow-sm shadow-blue-500/50 pointer-events-none z-20" />
                )}

                {/* Zero-layout-shift Drop Indicator: Below (only for the last item when appending to end) */}
                {showLineBelow && (
                  <div className="absolute -bottom-[1.5px] left-1 right-1 h-[3px] bg-blue-500 rounded-full shadow-sm shadow-blue-500/50 pointer-events-none z-20" />
                )}

                {/* Grip Handle for visual drag affordance in Edit Mode */}
                {isEditing && (
                  <GripVertical className="w-3.5 h-3.5 -ml-1 mr-1 flex-shrink-0 opacity-25 group-hover/item:opacity-75 transition-opacity pointer-events-none" />
                )}

                {/* Site Title */}
                <span
                  style={{ color: siteTextColor }}
                  className="text-[13px] font-medium tracking-tight truncate min-w-0 flex-1 select-none pr-2 transition-colors leading-tight pointer-events-none"
                  title={`${site.title} (${site.url})`}
                >
                  {site.title}
                </span>

                {/* Site Action Icons: Only shown on hover during Edit Mode */}
                {isEditing && (
                  <div
                    className="flex items-center gap-0.5 opacity-0 group-hover/item:opacity-100 transition-opacity duration-150"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => onEditSite(site)}
                      className={`p-0.5 rounded transition-colors cursor-pointer ${
                        isDarkText
                          ? 'text-slate-400 hover:text-slate-800 hover:bg-black/5'
                          : 'text-white/40 hover:text-white hover:bg-white/10'
                      }`}
                      title={t('editSite', settings.language)}
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onDeleteSite(site.id)}
                      className={`p-0.5 rounded transition-colors cursor-pointer ${
                        isDarkText
                          ? 'text-slate-400 hover:text-red-600 hover:bg-red-500/10'
                          : 'text-white/40 hover:text-red-400 hover:bg-red-500/10'
                      }`}
                      title={t('deleteSite', settings.language)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Quick Add Site Button: Only shown in Edit Mode (Minimalist '+' icon button) */}
      {isEditing && (
        <div className="mt-2 pt-1 border-t border-dashed border-black/10 dark:border-white/10 flex justify-center animate-fade-in">
          <button
            onClick={() => onAddSiteToCategory(category.id)}
            className={`p-1.5 rounded-full transition-all duration-150 cursor-pointer group/add-site flex items-center justify-center ${
              isDarkText
                ? 'text-slate-400 hover:text-slate-800 hover:bg-black/[0.05] active:scale-95'
                : 'text-white/40 hover:text-white hover:bg-white/10 active:scale-95'
            }`}
            title={t('addSiteToCategory', settings.language)}
          >
            <Plus className="w-4 h-4 transition-transform duration-150 group-hover/add-site:scale-110" />
          </button>
        </div>
      )}
    </div>
  );
};
