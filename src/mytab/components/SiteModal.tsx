import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles, Image as ImageIcon, Upload, Loader2, Check, AlertCircle } from 'lucide-react';
import { SiteItem, ThemeSettings, Category, GridPage } from '../../types';
import { fetchSiteMetadata, generateFallbackIcon, normalizeUrl, fileToBase64Icon, urlToBase64Icon } from '../../services/metadata';
import { t } from '../../utils/i18n';
import { CustomSelect } from './CustomSelect';
import { isLightMode, getCategoryDisplayName, getGridPageDisplayName } from '../../utils/constants';

interface SiteModalProps {
  isOpen: boolean;
  editingSite?: SiteItem | null;
  categories: Category[];
  activeCategoryId: string;
  gridPages?: GridPage[];
  activeGridPageId?: string;
  settings: ThemeSettings;
  onClose: () => void;
  onSave: (siteData: Partial<SiteItem>) => void;
}

export const SiteModal: React.FC<SiteModalProps> = ({
  isOpen,
  editingSite,
  categories,
  activeCategoryId,
  gridPages,
  activeGridPageId,
  settings,
  onClose,
  onSave,
}) => {
  const isBoard = settings.layoutMode === 'board';
  const defaultPageId =
    (activeGridPageId && gridPages?.some((p) => p.id === activeGridPageId) ? activeGridPageId : undefined) ||
    gridPages?.[0]?.id ||
    'page-1';

  const siteCategory = editingSite?.categoryId ? categories.find((c) => c.id === editingSite.categoryId) : undefined;
  const initialPageId = editingSite
    ? (editingSite.pageId && gridPages?.some((p) => p.id === editingSite.pageId)
        ? editingSite.pageId
        : (siteCategory?.pageId && gridPages?.some((p) => p.id === siteCategory.pageId)
            ? siteCategory.pageId
            : defaultPageId))
    : defaultPageId;

  const [url, setUrl] = useState(() => editingSite?.url || '');
  const [title, setTitle] = useState(() => editingSite?.title || '');
  const [icon, setIcon] = useState(() => editingSite?.icon || '');
  const [pageId, setPageId] = useState(() => initialPageId);

  const availableCategories = useMemo(() => {
    if (isBoard) {
      return categories.filter((c) => c.id !== 'all');
    }
    const pageCats = categories.filter(
      (c) => c.id !== 'all' && (c.pageId && gridPages?.some((p) => p.id === c.pageId) ? c.pageId : defaultPageId) === pageId
    );
    // Ensure the site's current category is always present in options so it displays correctly
    if (editingSite?.categoryId && editingSite.categoryId !== 'all' && !pageCats.some((c) => c.id === editingSite.categoryId)) {
      const currentCat = categories.find((c) => c.id === editingSite.categoryId && c.id !== 'all');
      if (currentCat) {
        return [...pageCats, currentCat];
      }
    }
    return pageCats;
  }, [isBoard, categories, pageId, defaultPageId, gridPages, editingSite?.categoryId]);

  const initialCategoryId = useMemo(() => {
    if (editingSite?.categoryId) {
      return editingSite.categoryId;
    }
    if (
      activeCategoryId !== 'all' &&
      activeCategoryId !== 'uncategorized' &&
      availableCategories.some((c) => c.id === activeCategoryId)
    ) {
      return activeCategoryId;
    }
    return availableCategories[0]?.id || 'all';
  }, [editingSite?.categoryId, activeCategoryId, availableCategories]);

  const [categoryId, setCategoryId] = useState<string>(() => initialCategoryId);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchMsg, setFetchMsg] = useState<{ success: boolean; text: string } | null>(null);
  const fetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
    };
  }, []);

  // Initialize form fields only when modal opens or editingSite changes
  useEffect(() => {
    if (!isOpen) return;

    if (editingSite) {
      setUrl(editingSite.url || '');
      setTitle(editingSite.title || '');
      setIcon(editingSite.icon || '');
      const validSitePageId = (editingSite.pageId && gridPages?.some((p) => p.id === editingSite.pageId))
        ? editingSite.pageId
        : (siteCategory?.pageId && gridPages?.some((p) => p.id === siteCategory.pageId)
            ? siteCategory.pageId
            : defaultPageId);
      setPageId(validSitePageId);
      setCategoryId(editingSite.categoryId || 'all');
    } else {
      const initialPage = defaultPageId;
      const initialCats = isBoard
        ? categories.filter((c) => c.id !== 'all')
        : categories.filter((c) => c.id !== 'all' && (c.pageId && gridPages?.some((p) => p.id === c.pageId) ? c.pageId : defaultPageId) === initialPage);
      const initialCat =
        activeCategoryId !== 'all' &&
        activeCategoryId !== 'uncategorized' &&
        initialCats.some((c) => c.id === activeCategoryId)
          ? activeCategoryId
          : (initialCats[0]?.id || 'all');

      setUrl('');
      setTitle('');
      setIcon('');
      setPageId(initialPage);
      setCategoryId(initialCat);
    }
    if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
    setFetchMsg(null);
  }, [editingSite, isOpen, defaultPageId, activeCategoryId, categories, isBoard, gridPages, siteCategory]);

  // Keep category synchronized when the user explicitly switches desktop page inside modal (grid mode only)
  const handlePageChange = (newPageId: string) => {
    setPageId(newPageId);
    if (!isBoard) {
      const newAvailable = categories.filter(
        (c) => c.id !== 'all' && (c.pageId && gridPages?.some((p) => p.id === c.pageId) ? c.pageId : defaultPageId) === newPageId
      );
      if (newAvailable.length > 0) {
        if (!newAvailable.some((c) => c.id === categoryId)) {
          setCategoryId(newAvailable[0].id);
        }
      } else {
        setCategoryId('all');
      }
    }
  };

  if (!isOpen) return null;

  const handleAutoFetch = async () => {
    if (!url.trim()) return;
    if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
    setIsFetching(true);
    setFetchMsg(null);

    try {
      const meta = await fetchSiteMetadata(url);
      if (!title.trim() || !editingSite) {
        setTitle(meta.title);
      }
      setIcon(meta.icon);
      setFetchMsg({ success: true, text: t('fetchSuccess', settings.language) });
      fetchTimerRef.current = setTimeout(() => {
        setFetchMsg(null);
      }, 3500);
    } catch {
      setFetchMsg({ success: false, text: t('fetchFailed', settings.language) });
      if (!icon) {
        setIcon(generateFallbackIcon(title || url));
      }
    } finally {
      setIsFetching(false);
    }
  };

  const handleUrlBlur = () => {
    if (url.trim() && !title.trim() && !editingSite) {
      handleAutoFetch();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await fileToBase64Icon(file, 128);
      setIcon(base64);
    } catch {
      // ignore
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalUrl = normalizeUrl(url);
    if (!finalUrl) return;

    const finalTitle = title.trim() || new URL(finalUrl).hostname.replace(/^www\./i, '');
    let finalIcon = icon.trim() || generateFallbackIcon(finalTitle);

    // If icon is remote http(s) URL, try to cache as Base64 to prevent future CORS/offline issues
    if (finalIcon && (finalIcon.startsWith('http://') || finalIcon.startsWith('https://'))) {
      try {
        const base64 = await urlToBase64Icon(finalIcon, 128);
        if (base64 && base64.startsWith('data:image/')) {
          finalIcon = base64;
        }
      } catch {
        // keep remote url as fallback
      }
    }

    onSave({
      url: finalUrl,
      title: finalTitle,
      icon: finalIcon,
      categoryId: categoryId || 'all',
      pageId: pageId || defaultPageId,
    });
  };

  const isLight = isLightMode(settings.mode);
  const previewIcon = icon.trim() || generateFallbackIcon(title.trim() || url.trim() || 'W');
  const content = (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 transition-opacity ${isLight ? 'bg-black/25' : 'bg-black/60'}`}
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className={`glass-modal relative z-10 w-full max-w-md rounded-3xl p-6 border shadow-2xl transition-all ${
          isLight
            ? 'border-black/10 shadow-black/15 text-slate-900'
            : 'border-white/15 shadow-black/80 text-white'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between pb-4 mb-4 border-b ${
          isLight ? 'border-black/10' : 'border-white/10'
        }`}>
          <h3 className="text-base font-semibold tracking-tight">
            {editingSite ? t('editSite', settings.language) : t('addSite', settings.language)}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
              isLight
                ? 'text-slate-500 hover:text-black hover:bg-black/5'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* URL Input with Auto Fetch Button */}
          <div>
            <label
              className={`block text-xs font-medium mb-1.5 ${
                isLight ? 'text-slate-700' : 'text-white/80'
              }`}
            >
              {t('siteUrl', settings.language)} <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                autoFocus
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onBlur={handleUrlBlur}
                placeholder={t('siteUrlPlaceholder', settings.language)}
                className="glass-input flex-1 px-3.5 py-2.5 rounded-xl text-sm"
              />
              <button
                type="button"
                onClick={handleAutoFetch}
                disabled={isFetching || !url.trim()}
                className="glass-btn-secondary flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs shrink-0 active:scale-95 disabled:opacity-50"
                title={t('autoFetch', settings.language)}
              >
                {isFetching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>{t('autoFetch', settings.language)}</span>
              </button>
            </div>
            {fetchMsg && (
              <div
                className={`text-[11px] mt-2 px-2.5 py-1.5 rounded-lg flex items-center justify-between gap-1.5 animate-fade-in ${
                  fetchMsg.success
                    ? isLight
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-emerald-500/15 text-emerald-200 border border-emerald-500/30'
                    : isLight
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'bg-amber-500/15 text-amber-200 border border-amber-500/30'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  {fetchMsg.success ? (
                    <Check className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                  )}
                  <span className="break-words">{fetchMsg.text}</span>
                </div>
                {!fetchMsg.success && (
                  <button
                    type="button"
                    onClick={() => setFetchMsg(null)}
                    className="p-0.5 rounded opacity-60 hover:opacity-100 transition-opacity shrink-0 cursor-pointer"
                    title={t('close', settings.language) || 'Close'}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Title Input */}
          <div>
            <label
              className={`block text-xs font-medium mb-1.5 ${
                isLight ? 'text-slate-700' : 'text-white/80'
              }`}
            >
              {t('siteTitle', settings.language)} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('siteTitlePlaceholder', settings.language)}
              className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm"
            />
          </div>

          {/* Icon Input & Preview */}
          <div>
            <label
              className={`block text-xs font-medium mb-1.5 ${
                isLight ? 'text-slate-700' : 'text-white/80'
              }`}
            >
              {t('siteIcon', settings.language)}
            </label>
            <div className="flex items-center gap-3">
              {/* Live Preview */}
              <div
                className={`w-11 h-11 rounded-xl border flex items-center justify-center overflow-hidden shrink-0 shadow-inner ${
                  isLight ? 'bg-black/5 border-black/10' : 'bg-white/10 border-white/20'
                }`}
              >
                <img
                  src={previewIcon}
                  alt="Preview"
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 object-contain rounded"
                  onError={(e) => {
                    (e.target as HTMLElement).setAttribute('src', generateFallbackIcon(title || 'W'));
                  }}
                />
              </div>

              {/* Icon URL Input */}
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder={t('siteIconPlaceholder', settings.language)}
                className="glass-input flex-1 px-3.5 py-2.5 rounded-xl text-sm"
              />

              {/* Upload Local File */}
              <label
                className={`p-2.5 rounded-xl border cursor-pointer transition-colors shrink-0 ${
                  isLight
                    ? 'bg-black/5 hover:bg-black/10 border-black/10 text-slate-700 hover:text-slate-900'
                    : 'bg-white/10 hover:bg-white/20 border-white/15 text-white/80 hover:text-white'
                }`}
                title={t('uploadIcon', settings.language)}
              >
                <Upload className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

        {/* Category Select (only shown if categories exist) */}
        {availableCategories.length > 0 && (
          <div>
            <label
              className={`block text-xs font-medium mb-1.5 ${
                isLight ? 'text-slate-700' : 'text-white/80'
              }`}
            >
              {t('siteCategory', settings.language)}
            </label>
            <CustomSelect
              value={categoryId}
              onChange={setCategoryId}
              isLight={isLight}
              options={availableCategories.map((cat) => ({
                value: cat.id,
                label: getCategoryDisplayName(cat, settings.language),
              }))}
            />
          </div>
        )}

        {/* Desktop Page Select (only shown in grid layout and if multiple desktop pages exist) */}
        {!isBoard && gridPages && gridPages.length > 1 && (
          <div>
            <label
              className={`block text-xs font-medium mb-1.5 ${
                isLight ? 'text-slate-700' : 'text-white/80'
              }`}
            >
              {t('siteDesktop', settings.language)}
            </label>
            <CustomSelect
              value={pageId}
              onChange={handlePageChange}
              isLight={isLight}
              options={gridPages.map((page, idx) => ({
                value: page.id,
                label: getGridPageDisplayName(page, idx, settings.language),
              }))}
            />
          </div>
        )}

 {/* Actions */}
 <div className="flex justify-end gap-3 pt-3">
 <button
 type="button"
 onClick={onClose}
 className="glass-btn-ghost px-4 py-2 rounded-xl text-sm font-medium"
 >
 {t('cancel', settings.language)}
 </button>
 <button
 type="submit"
 className="glass-btn-primary px-5 py-2 rounded-xl text-sm font-medium active:scale-95"
 >
 {t('save', settings.language)}
 </button>
 </div>
 </form>
  </div>
  </div>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : content;
};
