import React, { useState } from 'react';
import { Plus, X, FolderPlus, Check, Pencil } from 'lucide-react';
import { Category, ThemeSettings } from '../../types';
import { ConfirmModal } from './ConfirmModal';
import { CategoryEditModal } from './CategoryEditModal';
import { t } from '../../utils/i18n';

interface CategoryTabsProps {
  categories: Category[];
  activeCategoryId: string;
  settings: ThemeSettings;
  siteCounts: Record<string, number>;
  onSelectCategory: (id: string) => void;
  onAddCategory: (name: string) => void;
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
  const [isAdding, setIsAdding] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [deletingCat, setDeletingCat] = useState<Category | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCatName.trim()) {
      onAddCategory(newCatName.trim());
      setNewCatName('');
      setIsAdding(false);
    }
  };

  const handleEdit = (e: React.MouseEvent, cat: Category) => {
    e.stopPropagation();
    setEditingCat(cat);
  };

  const handleDelete = (e: React.MouseEvent, cat: Category) => {
    e.stopPropagation();
    setDeletingCat(cat);
  };

  const confirmDeleteCat = () => {
    if (deletingCat) {
      onDeleteCategory(deletingCat.id);
      setDeletingCat(null);
    }
  };

  const isLight = settings.mode === 'light';

  return (
    <div className="flex items-center justify-center gap-2 max-w-4xl mx-auto px-4 py-3 flex-wrap transition-colors">
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
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs md:text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 backdrop-blur-md ring-1 ring-white/20'
                  : isLight
                  ? 'text-slate-700 hover:text-slate-900 bg-white/80 hover:bg-white backdrop-blur-md border border-black/10 shadow-sm'
                  : 'text-white/80 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10'
              }`}
            >
              <span>{cat.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive
                    ? 'bg-indigo-700/60 text-indigo-100'
                    : isLight
                    ? 'bg-black/10 text-slate-700'
                    : 'bg-white/10 text-white/70'
                }`}
              >
                {count}
              </span>
            </button>

            {/* Action buttons for custom category */}
            {!cat.isDefault && (
              <div className="hidden group-hover:flex absolute -top-1.5 -right-1.5 items-center gap-1 z-10 animate-fade-in">
                <button
                  onClick={(e) => handleEdit(e, cat)}
                  title={t('editCategory', settings.language)}
                  className="w-4 h-4 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white flex items-center justify-center transition-transform hover:scale-110 shadow cursor-pointer"
                >
                  <Pencil className="w-2.5 h-2.5" />
                </button>
                <button
                  onClick={(e) => handleDelete(e, cat)}
                  title={t('confirmDelete', settings.language)}
                  className="w-4 h-4 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-transform hover:scale-110 shadow cursor-pointer"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* Add Category Form/Button */}
      {isAdding ? (
        <form onSubmit={handleCreate} className="flex items-center gap-1.5 animate-scale-in">
          <input
            type="text"
            autoFocus
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder={t('categoryName', settings.language)}
            className={`px-3.5 py-1.5 text-xs rounded-full backdrop-blur-md border outline-none w-36 transition-colors shadow-sm ${
              isLight
                ? 'bg-white text-slate-900 placeholder-slate-400 border-indigo-400 focus:ring-1 focus:ring-indigo-400'
                : 'bg-white/10 text-white placeholder-white/40 border-indigo-400/60 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/50'
            }`}
          />
          {/* Submit button */}
          <button
            type="submit"
            className="p-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer shadow-sm shrink-0"
            title="确认添加"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsAdding(false)}
            className={`p-1.5 rounded-full transition-colors cursor-pointer shrink-0 ${
              isLight
                ? 'bg-black/5 hover:bg-black/10 text-slate-600 hover:text-slate-900'
                : 'bg-white/10 hover:bg-white/20 text-white/70 hover:text-white'
            }`}
            title="取消"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </form>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border border-dashed transition-colors cursor-pointer ${
            isLight
              ? 'text-slate-700 hover:text-slate-900 bg-white/60 hover:bg-white border-slate-300 shadow-sm'
              : 'text-white/70 hover:text-white bg-white/5 hover:bg-white/15 border-white/20'
          }`}
          title={t('addCategory', settings.language)}
        >
          <FolderPlus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t('addCategory', settings.language)}</span>
        </button>
      )}

      {/* Edit Category Modal */}
      <CategoryEditModal
        isOpen={Boolean(editingCat)}
        category={editingCat}
        settings={settings}
        onClose={() => setEditingCat(null)}
        onSave={onUpdateCategory}
      />

      {/* Delete Category Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingCat)}
        type="danger"
        title={settings.language === 'zh-CN' ? `删除分类「${deletingCat?.name}」` : `Delete category "${deletingCat?.name}"`}
        message={
          settings.language === 'zh-CN'
            ? `确定要删除此分类吗？\n该分类下的所有网址卡片将自动保留并归入「常用工具」分类中。`
            : `Are you sure you want to delete this category?\nAll shortcuts inside will be preserved and moved to "Tools".`
        }
        confirmText={settings.language === 'zh-CN' ? '确定删除' : 'Delete'}
        language={settings.language}
        onConfirm={confirmDeleteCat}
        onCancel={() => setDeletingCat(null)}
      />
    </div>
  );
});
