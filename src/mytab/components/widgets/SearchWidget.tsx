import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Search, ChevronDown, Check } from 'lucide-react';
import { ThemeSettings } from '../../../types';
import { ResolvedTextColors } from '../../../utils/wallpaperAnalyzer';
import { DEFAULT_SEARCH_ENGINES, isLightMode } from '../../../utils/constants';
import { t } from '../../../utils/i18n';

interface SearchWidgetProps {
  settings: ThemeSettings;
  resolvedColors?: ResolvedTextColors;
  width?: number;
  height?: number;
  isEditing?: boolean;
  onEngineChange: (engineId: string) => void;
}

export const SearchWidget: React.FC<SearchWidgetProps> = React.memo(({
  settings,
  resolvedColors,
  width = 560,
  height = 52,
  isEditing = false,
  onEngineChange,
}) => {
  const [query, setQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const activeEngine =
    DEFAULT_SEARCH_ENGINES.find((e) => e.id === settings.activeEngineId) ||
    DEFAULT_SEARCH_ENGINES[0];

  const updateDropdownPos = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuWidth = 176;
      const left = Math.max(8, Math.min(rect.left, window.innerWidth - menuWidth - 8));
      const top = rect.bottom + 6;
      setDropdownPos({ top, left });
    }
  }, []);

  const handleToggleDropdown = () => {
    if (isEditing) return;
    if (!isDropdownOpen) {
      updateDropdownPos();
      setIsDropdownOpen(true);
    } else {
      setIsDropdownOpen(false);
    }
  };

  // Keyboard shortcut '/' to focus search input
  useEffect(() => {
    if (isEditing) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isEditing]);

  // Dropdown dismissal on outside click / escape and auto-reposition on scroll / resize
  useEffect(() => {
    if (!isDropdownOpen || isEditing) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };

    const handleReposition = () => {
      updateDropdownPos();
    };

    window.addEventListener('scroll', handleReposition, true);
    window.addEventListener('resize', handleReposition);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('scroll', handleReposition, true);
      window.removeEventListener('resize', handleReposition);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen, isEditing, updateDropdownPos]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) return;
    const cleanQuery = query.trim();
    if (!cleanQuery) return;

    const targetUrl = activeEngine.urlPattern.replace('%s', encodeURIComponent(cleanQuery));
    if (settings.openInNewTab) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = targetUrl;
    }
  };

  const isLight = isLightMode(settings.mode);
  const isCompact = width < 320 || height < 44;

  return (
    <div className={`relative w-full h-full flex items-center justify-center ${isEditing ? 'cursor-move' : ''}`}>
      <form
        onSubmit={handleSearch}
        className={`relative flex items-center w-full h-full rounded-2xl transition-all duration-200 ${
          isEditing ? 'cursor-move select-none' : ''
        } ${
          isFocused
            ? isLight
              ? 'ring-2 ring-black/15 shadow-xl shadow-black/5 border-black/20'
              : 'ring-2 ring-white/25 shadow-2xl shadow-black/40 border-white/30'
            : isLight
            ? 'border border-black/10 shadow-lg shadow-black/5 hover:border-black/20'
            : 'border border-white/10 shadow-xl shadow-black/20 hover:border-white/20'
        }`}
        style={{
          background: 'rgba(255, 255, 255, 0.06)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        {/* Front Blank Draggable Area (搜索栏左侧空白区可直接按住拖拽) */}
        <div
          className={`h-full flex items-center shrink-0 ${
            isEditing ? 'cursor-move w-4 md:w-5' : 'w-2 md:w-3'
          }`}
          title={isEditing ? t('freeLayoutEditingHint', settings.language) : undefined}
        />

        {/* Engine Selector */}
        {!isCompact && (
          <div
            className={`relative h-full flex items-center shrink-0 ${
              isEditing ? 'pointer-events-none select-none' : ''
            }`}
          >
            <button
              ref={buttonRef}
              type="button"
              disabled={isEditing}
              onClick={handleToggleDropdown}
              style={resolvedColors ? { color: resolvedColors.search } : undefined}
              className={`flex items-center gap-1.5 pl-1.5 pr-2.5 h-full text-xs md:text-sm font-medium transition-all select-none opacity-80 hover:opacity-100 ${
                isEditing ? 'pointer-events-none cursor-move' : 'cursor-pointer'
              } ${
                !resolvedColors ? (isLight ? 'text-slate-800 hover:text-black' : 'text-white/80 hover:text-white') : ''
              }`}
            >
              <span className="truncate max-w-[80px]">
                {activeEngine.nameKey ? t(activeEngine.nameKey, settings.language) : activeEngine.name}
              </span>
              {!isEditing && (
                <ChevronDown className={`w-3.5 h-3.5 opacity-60 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              )}
            </button>
          </div>
        )}

        {/* Divider */}
        {!isCompact && (
          <div className={`h-5 w-[1px] shrink-0 ${isLight ? 'bg-black/10' : 'bg-white/15'}`} />
        )}

        {/* Input Field (pointer-events-none during isEditing to allow smooth dragging anywhere on the search bar) */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          disabled={isEditing}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={t('searchPlaceholder', settings.language)}
          style={
            resolvedColors
              ? ({
                  color: resolvedColors.search,
                  '--search-placeholder-color': resolvedColors.search,
                } as React.CSSProperties)
              : undefined
          }
          className={`flex-1 min-w-0 bg-transparent px-3.5 h-full text-sm md:text-base font-normal outline-none search-input-field ${
            isEditing ? 'pointer-events-none select-none cursor-move' : ''
          } ${
            !resolvedColors ? (isLight ? 'text-slate-800' : 'text-white') : ''
          }`}
        />

        {/* Search Action / Hotkey Hint */}
        <div className={`flex items-center pr-3 gap-1.5 shrink-0 ${isEditing ? 'pointer-events-none' : ''}`}>
          {query.trim() ? (
            <button
              type="submit"
              disabled={isEditing}
              className={`p-1.5 rounded-lg transition-transform active:scale-95 ${isEditing ? 'cursor-move' : 'cursor-pointer'} ${
                isLight ? 'text-slate-700 hover:text-black hover:bg-black/5' : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Search className="w-4 h-4" />
            </button>
          ) : (
            <span
              className={`hidden sm:inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-medium rounded border tracking-widest ${
                isLight ? 'text-slate-500 border-black/10 bg-black/5' : 'text-white/40 border-white/10 bg-white/5'
              }`}
            >
              /
            </span>
          )}
        </div>
      </form>

      {/* Dropdown Menu (Portaled directly to document.body to prevent clipping by site cards or gridstack items) */}
      {isDropdownOpen && !isEditing && dropdownPos && typeof document !== 'undefined' && createPortal(
        <div
          ref={dropdownRef}
          className="fixed w-44 rounded-xl shadow-2xl border py-1.5 z-[10002] glass-dropdown animate-fade-in backdrop-blur-xl select-none"
          style={{
            top: `${dropdownPos.top}px`,
            left: `${dropdownPos.left}px`,
            background: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(30, 41, 59, 0.95)',
            borderColor: isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.15)',
          }}
        >
          {DEFAULT_SEARCH_ENGINES.map((engine) => {
            const isSelected = engine.id === activeEngine.id;
            return (
              <button
                key={engine.id}
                type="button"
                onClick={() => {
                  onEngineChange(engine.id);
                  setIsDropdownOpen(false);
                }}
                className={`flex items-center justify-between w-full px-3.5 py-2 text-xs md:text-sm transition-colors cursor-pointer select-none ${
                  isSelected
                    ? isLight
                      ? 'bg-slate-200/60 font-semibold text-slate-900'
                      : 'bg-white/15 font-semibold text-white'
                    : isLight
                    ? 'text-slate-700 hover:bg-slate-100 hover:text-black'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span>{engine.nameKey ? t(engine.nameKey, settings.language) : engine.name}</span>
                {isSelected && <Check className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </div>
  );
});

SearchWidget.displayName = 'SearchWidget';
