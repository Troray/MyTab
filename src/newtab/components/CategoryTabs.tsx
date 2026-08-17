import React, { useState } from 'react';
import { Plus, X, FolderPlus, Check } from 'lucide-react';
import { Category, ThemeSettings } from '../../types';
import { ConfirmModal } from './ConfirmModal';
import { t } from '../../utils/i18n';

interface CategoryTabsProps {
  categories: Category[];
  activeCategoryId: string;
  settings: ThemeSettings;
  siteCounts: Record<string, number>;
  onSelectCategory: (id: string) => void;
  onAddCategory: (name: string) => void;
  onDeleteCategory: (id: string) => void;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = React.memo(({
  categories,
  activeCategoryId,
  settings,
  siteCounts,
  onSelectCategory,
  onAddCategory,
  onDeleteCategory,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [deletingCat, setDeletingCat] = useState<Category | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCatName.trim()) {
      onAddCategory(newCatName.trim());
      setNewCatName('');
      setIsAdding(false);
    }
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

  return (
    <div className="flex items-center justify-center gap-2 max-w-4xl mx-auto px-4 py-3 flex-wrap">
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
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs md:text-sm font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'bg-indigo-600/80 text-white shadow-md shadow-indigo-600/30 backdrop-blur-md ring-1 ring-white/20'
                  : 'text-white/80 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10'
              }`}
            >
              <span>{cat.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                isActive ? 'bg-indigo-700/60 text-indigo-100' : 'bg-white/10 text-white/70'
              }`}>
                {count}
              </span>
            </button>

            {/* Delete custom category button with confirmation */}
            {!cat.isDefault && (
              <button
                onClick={(e) => handleDelete(e, cat)}
                title={t('confirmDelete', settings.language)}
                className="hidden group-hover:flex absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500/80 hover:bg-red-600 text-white items-center justify-center transition-transform hover:scale-110 shadow cursor-pointer"
              >
                <X className="w-2.5 h-2.5" />
              </button>
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
            className="px-3.5 py-1.5 text-xs rounded-full bg-white/10 backdrop-blur-md border border-indigo-400/60 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/50 text-white placeholder-white/40 outline-none w-36 transition-colors shadow-sm"
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
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors cursor-pointer shrink-0"
            title="取消"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </form>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-white/70 hover:text-white bg-white/5 hover:bg-white/15 border border-dashed border-white/20 transition-colors cursor-pointer"
          title={t('addCategory', settings.language)}
        >
          <FolderPlus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t('addCategory', settings.language)}</span>
        </button>
      )}

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
