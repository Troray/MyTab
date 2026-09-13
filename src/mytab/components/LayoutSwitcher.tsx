import React from 'react';
import { LayoutGrid, Columns3 } from 'lucide-react';
import { ThemeSettings } from '../../types';
import { t } from '../../utils/i18n';

interface LayoutSwitcherProps {
  layoutMode: 'grid' | 'board';
  onChange: (mode: 'grid' | 'board') => void;
  settings: ThemeSettings;
  isLight?: boolean;
  variant?: 'icon' | 'segmented';
  className?: string;
}

export const LayoutSwitcher: React.FC<LayoutSwitcherProps> = ({
  layoutMode,
  onChange,
  settings,
  isLight: isLightProp,
  variant = 'icon',
  className = '',
}) => {
  const isLight = isLightProp !== undefined
    ? isLightProp
    : settings.mode === 'light' || (settings.mode === 'system' && typeof window !== 'undefined' && !window.matchMedia('(prefers-color-scheme: dark)').matches);
  const isGrid = layoutMode === 'grid';

  if (variant === 'icon') {
    return (
      <button
        onClick={() => onChange(isGrid ? 'board' : 'grid')}
        className={`p-2.5 rounded-xl border shadow-sm transition-all duration-150 cursor-pointer active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-black/20 dark:focus-visible:ring-white/20 ${
          isLight
            ? 'bg-white/80 hover:bg-white text-slate-700 hover:text-black border-black/10 shadow-black/[0.02]'
            : 'bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border-white/10'
        } ${className}`}
        title={isGrid ? t('layoutBoard', settings.language) : t('layoutGrid', settings.language)}
      >
        {isGrid ? (
          <Columns3 className="w-4.5 h-4.5" />
        ) : (
          <LayoutGrid className="w-4.5 h-4.5" />
        )}
      </button>
    );
  }

  // Segmented control variant for Settings Drawer
  return (
    <div
      className={`inline-flex p-1 rounded-xl border backdrop-blur-md ${
        isLight
          ? 'bg-black/[0.04] border-black/5'
          : 'bg-white/[0.06] border-white/10'
      } ${className}`}
    >
      <button
        type="button"
        onClick={() => onChange('grid')}
        className={`glass-segment-item flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${!isGrid ? "glass-segment-item-active" : ""}`}
      >
        <LayoutGrid className="w-3.5 h-3.5" />
        <span>{t('layoutGrid', settings.language)}</span>
      </button>

      <button
        type="button"
        onClick={() => onChange('board')}
        className={`glass-segment-item flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${isGrid ? "glass-segment-item-active" : ""}`}
      >
        <Columns3 className="w-3.5 h-3.5" />
        <span>{t('layoutBoard', settings.language)}</span>
      </button>
    </div>
  );
};
