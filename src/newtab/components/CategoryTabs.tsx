import React, { useState } from 'react';
import { FolderPlus, Pencil } from 'lucide-react';
import { Category, ThemeSettings } from '../../types';
import { CategoryModal } from './CategoryModal';
import { t } from '../../utils/i18n';

interface CategoryTabsProps {
  categories: Category[];
  activeCategoryId: string;
  settings: ThemeSettings;
  siteCounts: Record<string, number>;
  onSelectCategory: (id: string) => void;
  onAddCategory: (data: { name: string; showInAll: boolean }) => void;
  onUpdateCategory: (id: string, updates: Partial<Category>) => void;
  onDeleteCategory: (id: string) => void;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = React.memo(({
  categories,
  activeCategoryId,
  settings,
  siteCounts,
  onSelectCategory,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}) => {
  // modalCategory: undefined -> closed; null -> add mode; Category -> edit mode
  const [modalCategory, setModalCategory] = useState<Category | null | undefined>(undefined);

  const handleSaveCategory = (catId: string | null, data: { name: string; showInAll: boolean }) => {
    if (catId) {
      onUpdateCategory(catId, data);
    } else {
      onAddCategory(data);
    }
  };

  const isLight = settings.mode === 'light';

  return (
    <div className="flex items-center justify-center gap-1.5 max-w-4xl mx-auto px-4 py-2.5 flex-wrap transition-colors">
      {categories.map((cat) => {
        const isActive = activeCategoryId === cat.id;
        const count = siteCounts[cat.id] || 0;

        return (
          <div
            key={cat.id}
            className="group relative flex items-center"
          >
            <button
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs md:text-sm font-medium transition-all duration-150 cursor-pointer select-none active:scale-95 ${
                isActive
                  ? isLight
                    ? 'bg-slate-900 text-white shadow-md shadow-slate-900/15 ring-1 ring-black/10 font-semibold'
                    : 'bg-white text-slate-950 shadow-md shadow-white/10 ring-1 ring-white/30 font-semibold'
                  : isLight
                  ? 'text-slate-700 hover:text-black bg-white/70 hover:bg-white/95 backdrop-blur-md border border-black/8 shadow-sm shadow-black/[0.02]'
                  : 'text-white/75 hover:text-white bg-white/8 hover:bg-white/15 backdrop-blur-md border border-white/10'
              }`}
            >
              <span>{cat.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-tabular ${
                  isActive
                    ? isLight
                      ? 'bg-white/20 text-white'
                      : 'bg-black/15 text-slate-900 font-semibold'
                    : isLight
                    ? 'bg-black/[0.06] text-slate-600'
                    : 'bg-white/10 text-white/60'
                }`}
              >
                {count}
              </span>
            </button>

            {/* Edit button for custom category on hover */}
            {!cat.isDefault && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setModalCategory(cat);
                }}
                title={t('editCategory', settings.language)}
                className={`hidden group-hover:flex absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full items-center justify-center transition-transform hover:scale-110 shadow-sm cursor-pointer z-10 ${
                  isLight
                    ? 'bg-slate-800 text-white hover:bg-black'
                    : 'bg-white text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Pencil className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
        );
      })}

      {/* Add Category Button */}
      <button
        onClick={() => setModalCategory(null)}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border border-dashed transition-all cursor-pointer select-none active:scale-95 ${
          isLight
            ? 'text-slate-600 hover:text-black bg-white/50 hover:bg-white border-black/15 shadow-sm'
            : 'text-white/60 hover:text-white bg-white/[0.04] hover:bg-white/10 border-white/15'
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
    </div>
  );
});
