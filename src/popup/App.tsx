import React, { useEffect, useState, useCallback } from 'react';
import browser from 'webextension-polyfill';
import { BookmarkForm } from './components/BookmarkForm';
import { t, Locale } from '../locales';

export type PopupStatus = 'loading' | 'ready' | 'saving' | 'success' | 'error' | 'unsupported';

/**
 * Formats a URL for clean display:
 * Strips protocol (https/http), leading www., and trailing slash
 */
function formatDisplayUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl.trim());
    const host = parsed.host.replace(/^www\./i, '');
    const pathname = parsed.pathname.replace(/\/+$/, '');
    return `${host}${pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return rawUrl.trim().replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/+$/, '');
  }
}

export const App: React.FC = () => {
  const [status, setStatus] = useState<PopupStatus>('loading');
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [sameDomainSite, setSameDomainSite] = useState<{ title: string; categoryId: string; url: string } | null>(null);
  const [language, setLanguage] = useState<Locale>('zh-CN');
  const [tabData, setTabData] = useState<{ title: string; url: string; favicon?: string }>({
    title: '',
    url: '',
  });

  const applyTheme = useCallback((mode: string = 'dark') => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = mode === 'dark' || (mode === 'system' && prefersDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  }, []);

  useEffect(() => {
    async function init() {
      try {
        // Load settings from storage
        const { mytab_settings } = await browser.storage.local.get('mytab_settings');
        if (mytab_settings?.language) {
          setLanguage(mytab_settings.language);
        }
        const mode = mytab_settings?.mode || localStorage.getItem('mytab_theme_mode') || 'dark';
        applyTheme(mode);

        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        const currentTab = tabs[0];

        if (!currentTab || !currentTab.url) {
          setStatus('unsupported');
          return;
        }

        const url = currentTab.url;
        if (
          url.startsWith('chrome://') ||
          url.startsWith('edge://') ||
          url.startsWith('about:') ||
          url.startsWith('moz-extension://') ||
          url.startsWith('chrome-extension://')
        ) {
          setStatus('unsupported');
          return;
        }

        setTabData({
          title: currentTab.title || new URL(url).hostname,
          url: url,
          favicon: currentTab.favIconUrl,
        });

        // Check if URL already exists or related same-domain bookmark exists
        const res = await browser.runtime.sendMessage({ type: 'CHECK_BOOKMARK_EXISTS', url });
        if (res && res.success) {
          if (res.exists) {
            setIsDuplicate(true);
          } else if (res.sameDomainSite) {
            setSameDomainSite(res.sameDomainSite);
          }
        }
        setStatus('ready');
      } catch (err) {
        console.error('Failed to init popup:', err);
        setStatus('error');
      }
    }

    init();

    // Listen to storage changes (e.g. if user updates theme/language in settings)
    const onStorageChange = (changes: Record<string, browser.Storage.StorageChange>, areaName: string) => {
      if (areaName === 'local' && changes.mytab_settings?.newValue) {
        const newSettings = changes.mytab_settings.newValue;
        if (newSettings.language) {
          setLanguage(newSettings.language);
        }
        if (newSettings.mode) {
          applyTheme(newSettings.mode);
        }
      }
    };
    browser.storage.onChanged.addListener(onStorageChange);

    // Listen to system theme change if mode is 'system'
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const onSystemThemeChange = () => {
      browser.storage.local.get('mytab_settings').then(({ mytab_settings }) => {
        const mode = mytab_settings?.mode || 'dark';
        if (mode === 'system') {
          applyTheme('system');
        }
      });
    };
    mediaQuery.addEventListener('change', onSystemThemeChange);

    return () => {
      browser.storage.onChanged.removeListener(onStorageChange);
      mediaQuery.removeEventListener('change', onSystemThemeChange);
    };
  }, [applyTheme]);

  return (
    <div className="glass-drawer w-full h-full min-h-[320px] text-slate-800 dark:text-white flex flex-col p-4 select-none">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3.5">
        <div className="w-6 h-6 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center font-bold text-xs shadow-sm">
          M
        </div>
        <h1 className="text-sm font-semibold text-slate-900 dark:text-white">
          {t('popupAddTitle', language)}
        </h1>
      </div>

      {status === 'loading' && (
        <div className="flex-1 flex items-center justify-center py-8">
          <div className="w-5 h-5 border-2 border-slate-700 dark:border-white/70 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {status === 'unsupported' && (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
          <div className="text-3xl mb-2">🚫</div>
          <p className="text-sm font-medium text-slate-800 dark:text-white/90">
            {t('popupUnsupportedTitle', language)}
          </p>
          <p className="text-xs text-slate-500 dark:text-white/60 mt-1">
            {t('popupUnsupportedDesc', language)}
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
          <div className="text-3xl mb-2">⚠️</div>
          <p className="text-sm font-medium text-red-500">{t('popupErrorTitle', language)}</p>
          <p className="text-xs text-slate-500 dark:text-white/60 mt-1">
            {t('popupErrorDesc', language)}
          </p>
        </div>
      )}

      {status === 'success' && (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4 animate-fade-in">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-900 dark:text-white">{t('popupSuccess', language)}</p>
        </div>
      )}

      {(status === 'ready' || status === 'saving') && (
        <>
          {isDuplicate ? (
            <div className="mb-3 px-3 py-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-xl text-xs flex items-start gap-2">
              <span className="text-sm shrink-0">👀</span>
              <p className="leading-relaxed">{t('popupDuplicateWarning', language)}</p>
            </div>
          ) : sameDomainSite ? (
            <div className="mb-3 px-3 py-2 bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 rounded-xl text-xs flex items-start gap-2">
              <span className="text-sm shrink-0">💡</span>
              <div className="min-w-0 flex-1">
                <p className="leading-relaxed truncate" title={sameDomainSite.url}>
                  {t('popupSameDomainNotice', language)}:{' '}
                  <span className="font-semibold text-slate-900 dark:text-white font-mono text-[11px]">
                    {formatDisplayUrl(sameDomainSite.url)}
                  </span>
                </p>
              </div>
            </div>
          ) : null}
          <BookmarkForm
            initialData={tabData}
            isSaving={status === 'saving'}
            language={language}
            sameDomainSite={sameDomainSite}
            onSave={async (data) => {
              setStatus('saving');
              try {
                const res = await browser.runtime.sendMessage({
                  type: 'ADD_BOOKMARK',
                  payload: {
                    title: data.title,
                    url: data.url,
                    icon: data.favicon,
                    categoryId: data.categoryId,
                  },
                });
                if (res && res.success) {
                  setStatus('success');
                  setTimeout(() => window.close(), 1000); // auto close
                } else {
                  setStatus('error');
                }
              } catch (err) {
                setStatus('error');
              }
            }}
          />
        </>
      )}
    </div>
  );
};
