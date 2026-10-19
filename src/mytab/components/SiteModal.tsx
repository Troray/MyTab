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
  targetCategoryId?: string;
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
  targetCategoryId,
  gridPages,
  activeGridPageId,
  settings,
  onClose,
  onSave,
}) => {
  const isMultiCategoryView = settings.layoutMode === 'board' || settings.layoutMode === 'list';
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
  const [urlLan, setUrlLan] = useState(() => editingSite?.urlLan || '');
  const [description, setDescription] = useState(() => editingSite?.description || '');
  const [title, setTitle] = useState(() => editingSite?.title || '');
  const [icon, setIcon] = useState(() => editingSite?.icon || '');
  const [pageId, setPageId] = useState(() => initialPageId);

  const availableCategories = useMemo(() => {
    if (isMultiCategoryView) {
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
  }, [isMultiCategoryView, categories, pageId, defaultPageId, gridPages, editingSite?.categoryId]);

  const initialCategoryId = useMemo(() => {
    if (editingSite?.categoryId) {
      return editingSite.categoryId;
    }
    const preferredCatId = targetCategoryId || activeCategoryId;
    if (
      preferredCatId &&
      preferredCatId !== 'all' &&
      preferredCatId !== 'uncategorized' &&
      categories.some((c) => c.id === preferredCatId)
    ) {
      return preferredCatId;
    }
    return availableCategories[0]?.id || 'all';
  }, [editingSite?.categoryId, targetCategoryId, activeCategoryId, categories, availableCategories]);

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
      setUrlLan(editingSite.urlLan || '');
      setDescription(editingSite.description || '');
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
      const preferredCatId = targetCategoryId || activeCategoryId;
      const targetCatObj = preferredCatId ? categories.find((c) => c.id === preferredCatId) : undefined;
      const initialPage = (targetCatObj?.pageId && gridPages?.some((p) => p.id === targetCatObj.pageId))
        ? targetCatObj.pageId
        : defaultPageId;

      const initialCats = isMultiCategoryView
        ? categories.filter((c) => c.id !== 'all')
        : categories.filter((c) => c.id !== 'all' && (c.pageId && gridPages?.some((p) => p.id === c.pageId) ? c.pageId : defaultPageId) === initialPage);

      const initialCat =
        preferredCatId &&
        preferredCatId !== 'all' &&
        preferredCatId !== 'uncategorized' &&
        categories.some((c) => c.id === preferredCatId)
          ? preferredCatId
          : (initialCats[0]?.id || 'all');

      setUrl('');
      setUrlLan('');
      setDescription('');
      setTitle('');
      setIcon('');
      setPageId(initialPage);
      setCategoryId(initialCat);
    }
    if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
    setFetchMsg(null);
  }, [editingSite, isOpen, defaultPageId, activeCategoryId, targetCategoryId, categories, isMultiCategoryView, gridPages, siteCategory]);

  // Keep category synchronized when the user explicitly switches desktop page inside modal (grid mode only)
  const handlePageChange = (newPageId: string) => {
    setPageId(newPageId);
    if (!isMultiCategoryView) {
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
    const rawTarget = url.trim() || urlLan.trim();
    if (!rawTarget) return;
    if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
    setIsFetching(true);
    setFetchMsg(null);

    try {
      const meta = await fetchSiteMetadata(rawTarget);
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
        setIcon(generateFallbackIcon(title || rawTarget));
      }
    } finally {
      setIsFetching(false);
    }
  };

  const handleUrlBlur = () => {
    const rawTarget = url.trim() || urlLan.trim();
    if (rawTarget && !title.trim() && !editingSite) {
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
    const rawUrl = url.trim();
    const rawUrlLan = urlLan.trim();

    if (!rawUrl && !rawUrlLan) {
      setFetchMsg({
        success: false,
        text: t('siteUrlValidationEmpty', settings.language),
      });
      return;
    }

    const finalUrl = rawUrl ? normalizeUrl(rawUrl) : '';
    const finalUrlLan = rawUrlLan ? normalizeUrl(rawUrlLan) : undefined;
    const primaryUrl = finalUrl || finalUrlLan || '';

    let host = '';
    try {
      host = new URL(primaryUrl).hostname.replace(/^www\./i, '');
    } catch {
      host = primaryUrl;
    }

    const finalTitle = title.trim() || host;
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
      urlLan: finalUrlLan,
      description: description.trim() || undefined,
      title: finalTitle,
      icon: finalIcon,
      categoryId: categoryId || 'all',
      pageId: pageId || defaultPageId,
    });
  };

  const isLight = isLightMode(settings.mode);
  const previewIcon = icon.trim() || generateFallbackIcon(title.trim() || url.trim() || urlLan.trim() || 'W');
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
              {t('siteUrlWan', settings.language)}{' '}
              <span className="text-[10px] font-normal opacity-60">
                ({t('siteUrlRequiredHint', settings.language)})
              </span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
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
                disabled={isFetching || (!url.trim() && !urlLan.trim())}
                className="glass-btn-secondary flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs shrink-0 active:scale-95 disabled:opacity-50"
                aria-label={t('autoFetch', settings.language)}
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
                    aria-label={t('close', settings.language) || 'Close'}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* LAN URL Input */}
          <div>
            <label
              className={`block text-xs font-medium mb-1.5 ${
                isLight ? 'text-slate-700' : 'text-white/80'
              }`}
            >
              {t('siteUrlLan', settings.language)}{' '}
              <span className="text-[10px] font-normal opacity-60">
                ({t('siteUrlLanHint', settings.language)})
              </span>
            </label>
            <input
              type="text"
              value={urlLan}
              onChange={(e) => setUrlLan(e.target.value)}
              onBlur={handleUrlBlur}
              placeholder={t('siteUrlLanPlaceholder', settings.language)}
              className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm"
            />
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

          {/* Description / Remarks Input */}
          <div>
            <label
              className={`block text-xs font-medium mb-1.5 ${
                isLight ? 'text-slate-700' : 'text-white/80'
              }`}
            >
              {t('siteDescription', settings.language)}{' '}
              <span className="text-[10px] font-normal opacity-60">
                ({t('optional', settings.language)})
              </span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('siteDescriptionPlaceholder', settings.language)}
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
              <div className="relative group/tooltip flex items-center justify-center shrink-0">
                <label
                  aria-label={t('uploadIcon', settings.language)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-colors ${
                    isLight
                      ? 'bg-black/5 hover:bg-black/10 border-black/10 text-slate-700 hover:text-slate-900'
                      : 'bg-white/10 hover:bg-white/20 border-white/15 text-white/80 hover:text-white'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium tracking-tight whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-150 glass-tooltip z-50">
                  {t('uploadIcon', settings.language)}
                </span>
              </div>
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
        {!isMultiCategoryView && gridPages && gridPages.length > 1 && (
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
