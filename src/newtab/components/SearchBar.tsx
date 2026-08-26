import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';
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
  const [isFocused, setIsFocused] = useState(false);
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
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

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
  const blurPx = Math.round(((settings.cardBlur ?? 50) / 100) * 32);

  return (
    <div className="relative z-30 w-full max-w-2xl mx-auto my-6 px-4">
      <form
        onSubmit={handleSearch}
        className={`relative flex items-center w-full h-14 rounded-2xl transition-all duration-200 ${
          isFocused
            ? isLight
              ? 'ring-2 ring-black/15 shadow-xl shadow-black/5 border-black/20'
              : 'ring-2 ring-white/25 shadow-2xl shadow-black/40 border-white/30'
            : isLight
            ? 'border border-black/10 shadow-lg shadow-black/5 hover:border-black/20'
            : 'border border-white/10 shadow-xl shadow-black/20 hover:border-white/20'
        }`}
        style={{
          background: isLight
            ? `rgba(255, 255, 255, ${Math.max(0.88, settings.cardOpacity)})`
            : `rgba(255, 255, 255, ${Math.max(0.08, settings.cardOpacity)})`,
          backdropFilter: `blur(${blurPx}px)`,
          WebkitBackdropFilter: `blur(${blurPx}px)`,
          transform: 'translateZ(0)',
        }}
      >
        {/* Engine Selector */}
        <div className="relative h-full flex items-center" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`flex items-center gap-1.5 pl-4 pr-3 h-full text-xs md:text-sm font-medium transition-colors cursor-pointer select-none ${
              isLight
                ? 'text-slate-800 hover:text-black'
                : 'text-white/90 hover:text-white'
            }`}
          >
            <span>{activeEngine.name}</span>
            <ChevronDown className={`w-3.5 h-3.5 opacity-60 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Engine Dropdown Popover */}
          {isDropdownOpen && (
            <div
              className={`absolute left-2 top-[calc(100%+8px)] w-48 py-1.5 rounded-2xl border shadow-2xl z-50 overflow-hidden transition-all ${
                isLight
                  ? 'border-black/10 shadow-black/10 bg-white/95'
                  : 'border-white/15 shadow-black/60 bg-slate-900/90'
              }`}
              style={{
                backdropFilter: 'blur(28px)',
                WebkitBackdropFilter: 'blur(28px)',
              }}
            >
              <div
                className={`px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider ${
                  isLight ? 'text-slate-400' : 'text-white/40'
                }`}
              >
                {t('searchEngine', settings.language)}
              </div>
              {DEFAULT_SEARCH_ENGINES.map((engine) => {
                const isSelected = engine.id === activeEngine.id;
                return (
                  <button
                    key={engine.id}
                    type="button"
                    onClick={() => {
                      onEngineChange(engine.id);
                      setIsDropdownOpen(false);
                      inputRef.current?.focus();
                    }}
                    className={`flex items-center justify-between w-full px-3.5 py-2 text-left text-xs font-medium transition-colors cursor-pointer ${
                      isSelected
                        ? isLight
                          ? 'bg-black/5 text-black font-semibold'
                          : 'bg-white/10 text-white font-semibold'
                        : isLight
                        ? 'text-slate-700 hover:bg-black/5 hover:text-slate-900'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span>{engine.name}</span>
                    {isSelected && (
                      <Check className={`w-3.5 h-3.5 ${isLight ? 'text-amber-600' : 'text-amber-400'}`} />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className={`w-px h-5 mr-2 ${isLight ? 'bg-black/10' : 'bg-white/15'}`} />

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('searchPlaceholder', settings.language)}
          className={`flex-1 bg-transparent border-none outline-none px-2 text-sm md:text-base ${
            isLight
              ? 'text-slate-900 placeholder-slate-400 selection:bg-slate-300'
              : 'text-white placeholder-white/40 selection:bg-white/20'
          }`}
        />

        {/* Keyboard shortcut badge (only when empty and not focused) */}
        {!query && !isFocused && (
          <kbd
            onClick={() => inputRef.current?.focus()}
            className={`hidden sm:inline-flex items-center justify-center mr-2 px-1.5 py-0.5 text-[10px] font-mono rounded border cursor-pointer select-none transition-colors ${
              isLight
                ? 'text-slate-400 border-black/10 bg-black/[0.02]'
                : 'text-white/40 border-white/10 bg-white/[0.04]'
            }`}
          >
            /
          </kbd>
        )}

        {/* Search Action Button */}
        <button
          type="submit"
          className={`p-2.5 mr-2 rounded-xl transition-all cursor-pointer active:scale-95 ${
            isLight
              ? 'text-slate-600 hover:text-black hover:bg-black/5'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
          title="Search"
        >
          <Search className="w-4.5 h-4.5" />
        </button>
      </form>
    </div>
  );
});
