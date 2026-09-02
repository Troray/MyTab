import React, { useEffect, useState } from 'react';
import browser from 'webextension-polyfill';
import { BookmarkForm } from './components/BookmarkForm';

export type PopupStatus = 'loading' | 'ready' | 'saving' | 'success' | 'duplicate' | 'error' | 'unsupported';

export const App: React.FC = () => {
  const [status, setStatus] = useState<PopupStatus>('loading');
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [tabData, setTabData] = useState<{ title: string; url: string; favicon?: string }>({
    title: '',
    url: '',
  });

  useEffect(() => {
    async function init() {
      try {
        // Load theme from storage
        const { mytab_state } = await browser.storage.local.get('mytab_state');
        if (mytab_state?.settings?.mode) {
          const mode = mytab_state.settings.mode;
          const isDark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
          if (isDark) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }

        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        const currentTab = tabs[0];
        
        if (!currentTab || !currentTab.url) {
          setStatus('unsupported');
          return;
        }

        const url = currentTab.url;
        if (url.startsWith('chrome://') || url.startsWith('edge://') || url.startsWith('about:') || url.startsWith('moz-extension://') || url.startsWith('chrome-extension://')) {
          setStatus('unsupported');
          return;
        }

        setTabData({
          title: currentTab.title || new URL(url).hostname,
          url: url,
          favicon: currentTab.favIconUrl,
        });

        // Check if URL already exists
        const res = await browser.runtime.sendMessage({ type: 'CHECK_BOOKMARK_EXISTS', url });
        if (res.success && res.exists) {
          setIsDuplicate(true);
        }
        setStatus('ready');
      } catch (err) {
        console.error('Failed to init popup:', err);
        setStatus('error');
      }
    }
    
    init();
  }, []);

  return (
    <div className="w-full h-full min-h-[300px] bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 flex flex-col p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-bold text-xs">M</div>
        <h1 className="text-sm font-semibold">添加到 MyTab</h1>
      </div>

      {status === 'loading' && (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {status === 'unsupported' && (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
          <div className="text-3xl mb-2">🚫</div>
          <p className="text-sm font-medium">当前页面无法添加</p>
          <p className="text-xs text-slate-500 mt-1">请打开一个普通的网页后再试。</p>
        </div>
      )}

      {status === 'error' && (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
          <div className="text-3xl mb-2">⚠️</div>
          <p className="text-sm font-medium text-red-500">发生错误</p>
          <p className="text-xs text-slate-500 mt-1">请重试</p>
        </div>
      )}

      {status === 'success' && (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4 animate-fade-in">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm font-medium">已添加到 MyTab</p>
        </div>
      )}

      {(status === 'ready' || status === 'saving') && (
        <>
          {isDuplicate && (
            <div className="mb-3 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-700/30 rounded-xl text-xs flex items-start gap-2">
              <span className="text-sm">👀</span>
              <p>该网址已存在于 MyTab。您可以继续添加，或者修改路径以便区分。</p>
            </div>
          )}
          <BookmarkForm 
          initialData={tabData} 
          isSaving={status === 'saving'}
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
                }
              });
              if (res.success) {
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
