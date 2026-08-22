import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { SearchEngine, ThemeSettings } from '../../types';
import { DEFAULT_SEARCH_ENGINES } from '../../utils/constants';
import { t } from '../../utils/i18n';

interface SearchBarProps {
  settings: ThemeSettings;
  onEngineChange: (engineId: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = React.memo(({ settings, onEngineChange }) => {
  const [query, setQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeEngine =
    DEFAULT_SEARCH_ENGINES.find((e) => e.id === settings.activeEngineId) ||
    DEFAULT_SEARCH_ENGINES[0];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Press '/' to focus search input if not currently inside an input/textarea
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanQuery = query.trim();
    if (!cleanQuery) return;

    const targetUrl = activeEngine.urlPattern.replace('%s', encodeURIComponent(cleanQuery));
    if (settings.openInNewTab) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = targetUrl;
    }
  };

  const isLight = settings.mode === 'light';

  return (
    <div className="relative z-30 w-full max-w-2xl mx-auto my-6 px-4 animate-slide-up">
      <form
        onSubmit={handleSearch}
        className={`relative flex items-center w-full h-14 rounded-2xl shadow-lg transition-all focus-within:ring-2 focus-within:ring-indigo-400/50 ${
          isLight
            ? 'border border-black/10 shadow-black/5'
            : 'border border-white/15 shadow-black/20'
        }`}
        style={{
          background: isLight
            ? `rgba(255, 255, 255, ${Math.max(0.85, settings.cardOpacity)})`
            : `rgba(255, 255, 255, ${Math.max(0.12, settings.cardOpacity)})`,
          backdropFilter: `blur(${settings.cardBlur}px)`,
          WebkitBackdropFilter: `blur(${settings.cardBlur}px)`,
          transform: 'translateZ(0)',
        }}
      >
        {/* Engine Selector */}
        <div className="relative h-full flex items-center" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`flex items-center gap-1.5 pl-4 pr-2.5 h-full text-sm font-medium transition-colors cursor-pointer select-none ${
              isLight
                ? 'text-slate-800 hover:text-indigo-600'
                : 'text-white/90 hover:text-white'
            }`}
          >
            <span>{activeEngine.name}</span>
            <ChevronDown className={`w-4 h-4 opacity-70 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Engine Dropdown */}
          {isDropdownOpen && (
            <div
              className={`absolute left-2 top-[calc(100%+8px)] w-44 py-1.5 rounded-2xl border shadow-2xl z-50 animate-scale-in overflow-hidden ${
                isLight
                  ? 'border-black/10 shadow-black/10'
                  : 'border-white/20 shadow-black/40'
              }`}
              style={{
                background: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 15, 25, 0.85)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
              }}
            >
              <div
                className={`px-3.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                  isLight ? 'text-slate-400' : 'text-white/50'
                }`}
              >
                选择搜索引擎
              </div>
              {DEFAULT_SEARCH_ENGINES.map((engine) => (
                <button
                  key={engine.id}
                  type="button"
                  onClick={() => {
                    onEngineChange(engine.id);
                    setIsDropdownOpen(false);
                    inputRef.current?.focus();
                  }}
                  className={`flex items-center justify-between w-full px-3.5 py-2 text-left text-xs font-medium transition-colors cursor-pointer ${
                    engine.id === activeEngine.id
                      ? 'bg-indigo-500/20 text-indigo-600 font-semibold'
                      : isLight
                      ? 'text-slate-700 hover:bg-black/5 hover:text-slate-900'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span>{engine.name}</span>
                  {engine.id === activeEngine.id && (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-sm" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={`w-px h-6 mr-2 ${isLight ? 'bg-black/10' : 'bg-white/20'}`} />

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('searchPlaceholder', settings.language)}
          className={`flex-1 bg-transparent border-none outline-none px-2 text-sm md:text-base selection:bg-indigo-500 selection:text-white ${
            isLight
              ? 'text-slate-900 placeholder-slate-400'
              : 'text-white placeholder-white/50'
          }`}
        />

        {/* Search Action Button */}
        <button
          type="submit"
          className={`p-3 mr-2 rounded-xl transition-colors cursor-pointer ${
            isLight
              ? 'text-slate-600 hover:text-indigo-600 hover:bg-black/5'
              : 'text-white/80 hover:text-white hover:bg-white/15'
          }`}
          title="Search"
        >
          <Search className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
});
