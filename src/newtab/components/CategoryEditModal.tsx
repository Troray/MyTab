import React, { useState, useEffect } from 'react';
import { X, FolderEdit, Check } from 'lucide-react';
import { Category, ThemeSettings } from '../../types';
import { t } from '../../utils/i18n';

interface CategoryEditModalProps {
  isOpen: boolean;
  category: Category | null;
  settings: ThemeSettings;
  onClose: () => void;
  onSave: (catId: string, updates: { name: string; showInAll: boolean }) => void;
}

export const CategoryEditModal: React.FC<CategoryEditModalProps> = ({
  isOpen,
  category,
  settings,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [showInAll, setShowInAll] = useState(true);

  useEffect(() => {
    if (category) {
      setName(category.name || '');
      setShowInAll(category.showInAll !== false);
    }
  }, [category, isOpen]);

  if (!isOpen || !category) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(category.id, {
        name: name.trim(),
        showInAll,
      });
      onClose();
    }
  };

  const isLight = settings.mode === 'light';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        className={`relative w-full max-w-md rounded-3xl p-6 shadow-2xl transition-all duration-300 transform scale-100 animate-scale-in border ${
          isLight
            ? 'bg-white/95 text-slate-900 border-black/10 shadow-slate-200/50'
            : 'bg-slate-900/90 text-white border-white/10 backdrop-blur-xl'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
              <FolderEdit className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold">
              {t('editCategory', settings.language)}
            </h3>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
              isLight
                ? 'hover:bg-black/5 text-slate-500 hover:text-slate-900'
                : 'hover:bg-white/10 text-white/60 hover:text-white'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Category Name */}
          <div className="space-y-1.5">
            <label className={`text-xs font-medium ${isLight ? 'text-slate-700' : 'text-white/80'}`}>
              {t('categoryName', settings.language)}
            </label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('categoryName', settings.language)}
              className={`w-full px-4 py-2.5 rounded-2xl border text-sm outline-none transition-all ${
                isLight
                  ? 'bg-black/5 border-black/10 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                  : 'bg-white/5 border-white/10 text-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20'
              }`}
            />
          </div>

          {/* Show in "All" Toggle */}
          <div
            className={`p-3.5 rounded-2xl border transition-colors flex items-start justify-between gap-3 ${
              isLight ? 'bg-black/5 border-black/10' : 'bg-white/5 border-white/10'
            }`}
          >
            <div className="space-y-0.5 pr-2">
              <span className={`text-xs font-medium block ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {t('showInAll', settings.language)}
              </span>
              <span className={`text-[11px] leading-relaxed block ${isLight ? 'text-slate-500' : 'text-white/50'}`}>
                {t('showInAllDesc', settings.language)}
              </span>
            </div>
            <input
              type="checkbox"
              checked={showInAll}
              onChange={(e) => setShowInAll(e.target.checked)}
              className="mt-1 w-4 h-4 rounded bg-transparent border-gray-400 text-indigo-600 focus:ring-0 cursor-pointer shrink-0"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                isLight
                  ? 'bg-black/5 hover:bg-black/10 text-slate-700'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              {t('cancel', settings.language)}
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-medium shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{t('save', settings.language)}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
