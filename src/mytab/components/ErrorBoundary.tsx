import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { t, Locale } from '../../locales';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  lang?: Locale;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

function resolveBrowserLocale(): Locale {
  if (typeof navigator !== 'undefined' && navigator.language) {
    const l = navigator.language.toLowerCase();
    if (l.startsWith('zh')) {
      return l.includes('tw') || l.includes('hk') || l.includes('hant') ? 'zh-TW' : 'zh-CN';
    }
    if (l.startsWith('ja')) return 'ja';
    if (l.startsWith('ko')) return 'ko';
    if (l.startsWith('fr')) return 'fr';
    if (l.startsWith('ru')) return 'ru';
  }
  return 'en';
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[MyTab ErrorBoundary caught error]:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      const lang = this.props.lang || resolveBrowserLocale();
      return (
        <div className="flex flex-col items-center justify-center min-h-screen text-white p-6 select-none bg-slate-950/90 backdrop-blur-md animate-fade-in">
          <div className="glass-modal relative bg-slate-900/80 border border-white/15 rounded-3xl p-7 max-w-md w-full shadow-2xl text-center space-y-4 animate-scale-in">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center shadow-lg text-amber-400">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              {t('errorBoundaryTitle', lang)}
            </h2>
            <p className="text-xs text-white/70 leading-relaxed break-words px-2">
              {this.state.error?.message || t('errorBoundaryDesc', lang)}
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-950 rounded-xl text-xs font-semibold shadow-lg transition-all cursor-pointer active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('reloadPage', lang)}</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

