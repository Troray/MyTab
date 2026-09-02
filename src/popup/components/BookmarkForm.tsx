import React, { useEffect, useState } from 'react';
import browser from 'webextension-polyfill';
import { t, Locale } from '../../locales';

interface Props {
  initialData: { title: string; url: string; favicon?: string };
  isSaving: boolean;
  language?: Locale;
  onSave: (data: { title: string; url: string; favicon?: string; categoryId: string }) => void;
}

export const BookmarkForm: React.FC<Props> = ({ initialData, isSaving, language = 'zh-CN', onSave }) => {
  const [title, setTitle] = useState(initialData.title);
  const [url, setUrl] = useState(initialData.url);
  const [favicon, setFavicon] = useState(initialData.favicon || '');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        // 1. Get groups
        const res = await browser.runtime.sendMessage({ type: 'GET_GROUPS' });
        let groups = [];
        if (res && res.success && res.data) {
          groups = res.data.filter((c: any) => c.id !== 'all');
        }
        
        setCategories(groups);

        // 2. Get last used group from local storage
        const { mytab_popup_prefs } = await browser.storage.local.get('mytab_popup_prefs');
        if (mytab_popup_prefs?.lastUsedGroupId) {
          setCategoryId(mytab_popup_prefs.lastUsedGroupId);
        } else if (groups.length > 0) {
          setCategoryId(groups[0].id);
        }
      } catch (err) {
        console.error('Failed to load popup form data:', err);
      }
    }
    loadData();
  }, []);

  return (
    <div className="flex-1 flex flex-col gap-3">
      <div className="space-y-1">
        <label className="text-[11px] font-medium text-slate-600 dark:text-white/70">{t('siteTitle', language)}</label>
        <input 
          type="text" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 dark:border-white/15 bg-black/[0.04] dark:bg-white/[0.08] text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-white/40 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none transition-colors"
        />
      </div>

      <div className="space-y-1">
        <label className="text-[11px] font-medium text-slate-600 dark:text-white/70">{t('siteUrl', language)}</label>
        <input 
          type="text" 
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 dark:border-white/15 bg-black/[0.04] dark:bg-white/[0.08] text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-white/40 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none transition-colors"
        />
      </div>

      <div className="space-y-1">
        <label className="text-[11px] font-medium text-slate-600 dark:text-white/70">{t('siteIcon', language)}</label>
        <div className="flex gap-2 items-center">
          {favicon ? (
            <img src={favicon} alt="" className="w-8 h-8 rounded-lg shrink-0 object-cover border border-black/10 dark:border-white/15 bg-white/10" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/15 flex items-center justify-center text-xs shrink-0">🌐</div>
          )}
          <input 
            type="text" 
            value={favicon}
            placeholder={t('popupIconPlaceholder', language)}
            onChange={(e) => setFavicon(e.target.value)}
            className="flex-1 min-w-0 px-3 py-2 text-xs rounded-xl border border-black/10 dark:border-white/15 bg-black/[0.04] dark:bg-white/[0.08] text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-white/40 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none transition-colors"
          />
        </div>
      </div>

      {categories.length > 0 && (
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-slate-600 dark:text-white/70">{t('siteCategory', language)}</label>
          <div className="relative">
            <select 
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 dark:border-white/15 bg-black/[0.04] dark:bg-white/[0.08] text-slate-800 dark:text-white appearance-none focus:border-indigo-500 dark:focus:border-indigo-400 outline-none transition-colors cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="bg-white dark:bg-[#40434b] text-slate-800 dark:text-white">{c.name}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-3 h-3 text-slate-400 dark:text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      )}

      <div className="mt-auto pt-4">
        <button 
          onClick={() => onSave({ title, url, favicon, categoryId: categoryId || 'all' })}
          disabled={isSaving || !title.trim() || !url.trim() || (categories.length > 0 && !categoryId)}
          className="w-full py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white text-xs font-semibold shadow-md active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
        >
          {isSaving ? t('popupSaving', language) : t('popupAddTitle', language)}
        </button>
      </div>
    </div>
  );
};
