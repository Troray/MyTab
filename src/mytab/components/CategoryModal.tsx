import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, FolderPlus, FolderEdit, Check, Trash2, RotateCcw } from 'lucide-react';
import { Category, ThemeSettings } from '../../types';
import { ConfirmModal } from './ConfirmModal';
import { ToggleSwitch } from './ToggleSwitch';
import { DEFAULT_CATEGORY_COLORS } from '../../utils/constants';
import { t } from '../../utils/i18n';
import { isLightMode } from '../../utils/constants';

interface CategoryModalProps {
  isOpen: boolean;
  category: Category | null; // null 表示新增，非 null 表示编辑
  settings: ThemeSettings;
  onClose: () => void;
  onSave: (catId: string | null, data: { name: string; showInAll: boolean; color?: string }) => void;
  onDelete?: (catId: string) => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  category,
  settings,
  onClose,
  onSave,
  onDelete,
}) => {
  const isEdit = Boolean(category);
  const [name, setName] = useState('');
  const [color, setColor] = useState('');
  const [showInAll, setShowInAll] = useState(true);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    if (category) {
      setName(category.name || '');
      setColor(category.color || '');
      setShowInAll(category.showInAll !== false);
    } else {
      setName('');
      setColor('');
      setShowInAll(true);
    }
    setIsConfirmingDelete(false);
  }, [category, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(category ? category.id : null, {
        name: name.trim(),
        showInAll,
        color: color || undefined,
      });
      onClose();
    }
  };

  const handleDelete = () => {
    if (category && onDelete) {
      onDelete(category.id);
      setIsConfirmingDelete(false);
      onClose();
    }
  };

  const isLight = isLightMode(settings.mode);

  const content = (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className={`fixed inset-0 transition-opacity animate-fade-in ${isLight ? 'bg-black/25' : 'bg-black/60'}`}
          onClick={onClose}
        />

        {/* Modal Card */}
        <div
          className={`glass-modal relative w-full max-w-md rounded-3xl p-6 shadow-2xl transition-all duration-200 transform scale-100 animate-scale-in border ${
            isLight
              ? 'border-black/10 text-slate-900 shadow-black/15'
              : 'border-white/15 text-white shadow-black/80'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/10">
            <div className="flex items-center gap-2.5">
              <div
                className={`p-2 rounded-xl border ${
                  isLight
                    ? 'bg-black/[0.04] border-black/5 text-slate-800'
                    : 'bg-white/10 border-white/10 text-white'
                }`}
                style={color ? { color: color, borderColor: `${color}40` } : undefined}
              >
                {isEdit ? <FolderEdit className="w-4.5 h-4.5" /> : <FolderPlus className="w-4.5 h-4.5" />}
              </div>
              <h3 className="text-base font-semibold tracking-tight">
                {isEdit ? t('editCategory', settings.language) : t('addCategory', settings.language)}
              </h3>
            </div>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                isLight
                  ? 'hover:bg-black/5 text-slate-500 hover:text-black'
                  : 'hover:bg-white/10 text-white/60 hover:text-white'
              }`}
            >
              <X className="w-4.5 h-4.5" />
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
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all ${
                  isLight
                    ? 'bg-black/5 border-black/10 text-slate-900 focus:border-black/30 focus:ring-2 focus:ring-black/10 placeholder-slate-400'
                    : 'bg-white/10 border-white/15 text-white focus:border-white/30 focus:ring-2 focus:ring-white/20 placeholder-white/40'
                }`}
              />
            </div>

            {/* Category Color Picker */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className={`text-xs font-medium ${isLight ? 'text-slate-700' : 'text-white/80'}`}>
                  {t('categoryColor', settings.language)}
                </label>
                {color && (
                  <button
                    type="button"
                    onClick={() => setColor('')}
                    className="text-[11px] text-amber-500 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{t('reset', settings.language)}</span>
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap pt-0.5">
                {DEFAULT_CATEGORY_COLORS.map((preset) => {
                  const isSelected = color?.toLowerCase() === preset.toLowerCase();
                  const isWhite = preset.toLowerCase() === '#ffffff' || preset.toLowerCase() === '#fff';
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setColor(preset)}
                      style={{ backgroundColor: preset }}
                      className={`w-7 h-7 rounded-full transition-all cursor-pointer relative flex items-center justify-center ${
                        isWhite
                          ? 'border border-black/20 dark:border-white/30'
                          : preset.toLowerCase() === '#000000'
                          ? 'border border-white/20 dark:border-white/20'
                          : ''
                      } ${
                        isSelected
                          ? isWhite
                            ? 'scale-110 ring-2 ring-offset-2 ring-slate-800 dark:ring-white dark:ring-offset-slate-900 shadow-md'
                            : 'scale-110 ring-2 ring-offset-2 ring-white/90 dark:ring-offset-slate-900 shadow-md'
                          : 'hover:scale-105 opacity-80 hover:opacity-100'
                      }`}
                    >
                      {isSelected && (
                        <Check
                          className={`w-3.5 h-3.5 ${
                            isWhite ? 'text-slate-900' : 'text-white'
                          } drop-shadow-sm`}
                        />
                      )}
                    </button>
                  );
                })}
                {/* Custom Color Input */}
                <label
                  title={t('categoryColorCustom', settings.language)}
                  className={`w-7 h-7 rounded-full border border-dashed flex items-center justify-center cursor-pointer transition-all relative overflow-hidden ${
                    isLight ? 'border-slate-400 hover:border-slate-700' : 'border-white/40 hover:border-white/80'
                  }`}
                >
                  <input
                    type="color"
                    value={color || '#f43f5e'}
                    onChange={(e) => setColor(e.target.value)}
                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                  />
                  <div
                    className="w-3.5 h-3.5 rounded-full"
                    style={{ backgroundColor: color || 'transparent' }}
                  />
                </label>
              </div>
            </div>

            {/* Show in "All" Toggle */}
            <div
              className={`p-3.5 rounded-2xl border transition-colors flex items-start justify-between gap-3 ${
                isLight ? 'bg-black/[0.03] border-black/8' : 'bg-white/[0.05] border-white/10'
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
              <div className="mt-1 flex-shrink-0">
                <ToggleSwitch
                  checked={showInAll}
                  onChange={setShowInAll}
                  isLight={isLight}
                />
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-3">
              {/* Delete button (only in edit mode for custom categories) */}
              <div>
                {isEdit && !category?.isDefault && onDelete && (
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDelete(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-red-500 hover:text-red-600 bg-red-500/10 hover:bg-red-500/15 transition-colors cursor-pointer active:scale-95"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t('deleteCategory', settings.language)}</span>
                  </button>
                )}
              </div>

              {/* Cancel & Save buttons */}
              <div className="flex items-center gap-2.5">
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
                  className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-medium shadow-sm transition-all cursor-pointer disabled:opacity-40 active:scale-95 ${
                    isLight
                      ? 'bg-slate-900 hover:bg-black text-white'
                      : 'bg-white/20 hover:bg-white/30 text-white border border-white/25 font-semibold'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isEdit ? t('save', settings.language) : t('addCategory', settings.language)}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isConfirmingDelete}
        type="danger"
        title={t('deleteCategory', settings.language)}
        message={t('confirmDeleteCategory', settings.language)}
        confirmText={t('deleteCategory', settings.language)}
        language={settings.language}
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmingDelete(false)}
      />
    </>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : content;
};
