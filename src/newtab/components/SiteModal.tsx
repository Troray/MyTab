import React, { useState, useEffect } from 'react';
import { X, Sparkles, Image as ImageIcon, Upload, Loader2 } from 'lucide-react';
import { SiteItem, ThemeSettings, Category } from '../../types';
import { fetchSiteMetadata, generateFallbackIcon, normalizeUrl, fileToBase64Icon, urlToBase64Icon } from '../../services/metadata';
import { t } from '../../utils/i18n';
import { CustomSelect } from './CustomSelect';

interface SiteModalProps {
  isOpen: boolean;
  editingSite?: SiteItem | null;
  categories: Category[];
  activeCategoryId: string;
  settings: ThemeSettings;
  onClose: () => void;
  onSave: (siteData: Partial<SiteItem>) => void;
}

export const SiteModal: React.FC<SiteModalProps> = ({
  isOpen,
  editingSite,
  categories,
  activeCategoryId,
  settings,
  onClose,
  onSave,
}) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState('');
  const [categoryId, setCategoryId] = useState(
    activeCategoryId === 'all' ? (categories[1]?.id || 'tools') : activeCategoryId
  );
  const [isFetching, setIsFetching] = useState(false);
  const [fetchMsg, setFetchMsg] = useState('');

  useEffect(() => {
    if (editingSite) {
      setUrl(editingSite.url);
      setTitle(editingSite.title);
      setIcon(editingSite.icon || '');
      setCategoryId(editingSite.categoryId);
    } else {
      setUrl('');
      setTitle('');
      setIcon('');
      setCategoryId(activeCategoryId === 'all' ? (categories[1]?.id || 'tools') : activeCategoryId);
    }
    setFetchMsg('');
  }, [editingSite, isOpen, activeCategoryId, categories]);

  if (!isOpen) return null;

  const handleAutoFetch = async () => {
    if (!url.trim()) return;
    setIsFetching(true);
    setFetchMsg('');

    try {
      const meta = await fetchSiteMetadata(url);
      if (!title.trim() || !editingSite) {
        setTitle(meta.title);
      }
      setIcon(meta.icon);
      setFetchMsg(t('fetchSuccess', settings.language));
    } catch {
      setFetchMsg(t('fetchFailed', settings.language));
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

    if (finalIcon.startsWith('http://') || finalIcon.startsWith('https://')) {
      finalIcon = await urlToBase64Icon(finalIcon, 128);
    }

    onSave({
      url: finalUrl,
      title: finalTitle,
      icon: finalIcon,
      categoryId,
    });
  };

  const previewIcon = icon.trim() || generateFallbackIcon(title || url || 'W');
  const isLight = settings.mode === 'light';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div
        className={`relative w-full max-w-md p-6 rounded-3xl border shadow-2xl animate-scale-in transition-colors ${
          isLight
            ? 'border-black/10 text-slate-900 shadow-black/15'
            : 'border-white/15 text-white shadow-black/50'
        }`}
        style={{
          background: isLight ? 'rgba(255, 255, 255, 0.75)' : undefined,
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
        }}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between pb-4 mb-4 border-b ${
            isLight ? 'border-black/10' : 'border-white/10'
          }`}
        >
          <h3 className="text-lg font-semibold tracking-wide">
            {editingSite ? t('editSite', settings.language) : t('addSite', settings.language)}
          </h3>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-full transition-colors ${
              isLight
                ? 'text-slate-400 hover:text-slate-800 hover:bg-black/5'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <X className="w-5 h-5" />
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
                className={`flex-1 px-3.5 py-2.5 rounded-xl border focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm transition-all ${
                  isLight
                    ? 'bg-black/5 border-black/10 text-slate-900 placeholder-slate-400'
                    : 'bg-white/10 border-white/15 text-white placeholder-white/40'
                }`}
              />
              <button
                type="button"
                onClick={handleAutoFetch}
                disabled={isFetching || !url.trim()}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-medium transition-all shadow-md shadow-indigo-600/30 cursor-pointer shrink-0"
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
              <p
                className={`text-[11px] mt-1.5 ${
                  isLight ? 'text-indigo-600 font-medium' : 'text-indigo-300'
                }`}
              >
                {fetchMsg}
              </p>
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
              className={`w-full px-3.5 py-2.5 rounded-xl border focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm transition-all ${
                isLight
                  ? 'bg-black/5 border-black/10 text-slate-900 placeholder-slate-400'
                  : 'bg-white/10 border-white/15 text-white placeholder-white/40'
              }`}
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
                className={`w-11 h-11 rounded-xl border flex items-center justify-center overflow-hidden shrink-0 shadow ${
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
                className={`flex-1 px-3.5 py-2.5 rounded-xl border focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm transition-all ${
                  isLight
                    ? 'bg-black/5 border-black/10 text-slate-900 placeholder-slate-400'
                    : 'bg-white/10 border-white/15 text-white placeholder-white/40'
                }`}
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

          {/* Category Select */}
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
              options={categories
                .filter((c) => c.id !== 'all')
                .map((cat) => ({
                  value: cat.id,
                  label: cat.name,
                }))}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-black/5'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {t('cancel', settings.language)}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              {t('save', settings.language)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
