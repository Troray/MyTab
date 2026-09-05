import React, { useState, useEffect, useRef } from 'react';
import { Palette, Check, RotateCcw, Sparkles, X } from 'lucide-react';
import { ThemeSettings, TextColorMode, CustomTextColors } from '../../types';
import { TranslationKey } from '../../locales/types';
import { t } from '../../utils/i18n';

interface TextColorCustomizerProps {
  settings: ThemeSettings;
  onUpdateSettings: (newSettings: Partial<ThemeSettings>) => void;
  onClose: () => void;
}

type ElementTarget = 'all' | 'clock' | 'date' | 'greeting' | 'search' | 'tabs' | 'cards';

interface PaletteItem {
  labelKey: TranslationKey;
  value: string;
}

const PRESET_PALETTE: PaletteItem[] = [
  { labelKey: 'colorWhite', value: '#ffffff' },
  { labelKey: 'colorBlack', value: '#0f172a' },
  { labelKey: 'colorGold', value: '#f59e0b' },
  { labelKey: 'colorSkyBlue', value: '#38bdf8' },
  { labelKey: 'colorEmerald', value: '#10b981' },
  { labelKey: 'colorCoral', value: '#f43f5e' },
  { labelKey: 'colorLilac', value: '#a855f7' },
  { labelKey: 'colorMoonGray', value: '#94a3b8' },
];

export const TextColorCustomizer: React.FC<TextColorCustomizerProps> = ({
  settings,
  onUpdateSettings,
  onClose,
}) => {
  const isLight = settings.mode === 'light';

  // Dual-mode separation: light and dark maintain their own independent settings
  const currentMode: TextColorMode = (isLight
    ? settings.textColorModeLight ?? settings.textColorMode
    : settings.textColorModeDark ?? settings.textColorMode) || 'auto';

  const customColors: CustomTextColors = (isLight
    ? settings.customTextColorsLight ?? settings.customTextColors
    : settings.customTextColorsDark ?? settings.customTextColors) || {};

  const defaultColor = isLight ? '#0f172a' : '#ffffff';

  // Snapshot initial settings on mount to allow abandoning all changes on close
  const initialMode = useRef<TextColorMode>(currentMode);
  const initialColors = useRef<CustomTextColors>({ ...customColors });

  const [activeTarget, setActiveTarget] = useState<ElementTarget>('all');

  const applyColorUpdate = (newMode: TextColorMode, newColors?: CustomTextColors) => {
    if (isLight) {
      onUpdateSettings({
        textColorModeLight: newMode,
        ...(newColors ? { customTextColorsLight: newColors } : {}),
      });
    } else {
      onUpdateSettings({
        textColorModeDark: newMode,
        ...(newColors ? { customTextColorsDark: newColors } : {}),
      });
    }
  };

  const handleCancel = () => {
    if (isLight) {
      onUpdateSettings({
        textColorModeLight: initialMode.current,
        customTextColorsLight: initialColors.current,
      });
    } else {
      onUpdateSettings({
        textColorModeDark: initialMode.current,
        customTextColorsDark: initialColors.current,
      });
    }
    onClose();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleModeSelect = (mode: TextColorMode) => {
    applyColorUpdate(mode);
  };

  const getCurrentColor = (target: ElementTarget): string => {
    if (target === 'all') return customColors.clock || defaultColor;
    if (target === 'clock') return customColors.clock || defaultColor;
    if (target === 'date') return customColors.date || defaultColor;
    if (target === 'greeting') return customColors.greeting || defaultColor;
    if (target === 'search') return customColors.search || defaultColor;
    if (target === 'tabs') return customColors.tabs || defaultColor;
    if (target === 'cards') return customColors.cards || defaultColor;
    return defaultColor;
  };

  const handleColorChange = (hex: string) => {
    if (activeTarget === 'all') {
      applyColorUpdate('custom', {
        clock: hex,
        date: hex,
        greeting: hex,
        search: hex,
        tabs: hex,
        cards: hex,
      });
    } else {
      const nextColors: CustomTextColors = {
        clock: customColors.clock || defaultColor,
        date: customColors.date || defaultColor,
        greeting: customColors.greeting || defaultColor,
        search: customColors.search || defaultColor,
        tabs: customColors.tabs || defaultColor,
        cards: customColors.cards || defaultColor,
        ...customColors,
        [activeTarget]: hex,
      };
      applyColorUpdate('custom', nextColors);
    }
  };

  const handleReset = () => {
    applyColorUpdate(isLight ? 'auto' : 'light', {});
  };

  const targets: { id: ElementTarget; labelKey: TranslationKey }[] = [
    { id: 'all', labelKey: 'textColorTargetAll' },
    { id: 'clock', labelKey: 'textColorTargetClock' },
    { id: 'date', labelKey: 'textColorTargetDate' },
    { id: 'greeting', labelKey: 'textColorTargetGreeting' },
    { id: 'search', labelKey: 'textColorTargetSearch' },
    { id: 'tabs', labelKey: 'textColorTargetTabs' },
    { id: 'cards', labelKey: 'textColorTargetCards' },
  ];

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[94vw] max-w-[540px] animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div
        className={`rounded-2xl shadow-2xl border p-4 backdrop-blur-2xl transition-all ${
          isLight
            ? 'bg-white/95 border-slate-200/90 text-slate-900 shadow-slate-900/15'
            : 'bg-slate-900/95 border-white/15 text-white shadow-black/50'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-black/5 dark:border-white/10">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-semibold tracking-wide">
              {t('textColorCustomizerTitle', settings.language)}
            </span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                isLight ? 'bg-amber-100 text-amber-800' : 'bg-white/10 text-white/80'
              }`}
            >
              {isLight ? t('themeLight', settings.language) : t('themeDark', settings.language)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCancel}
            aria-label={t('cancel', settings.language)}
            className={`p-1.5 rounded-xl transition-colors cursor-pointer duration-0 ${
              isLight
                ? 'hover:bg-black/5 text-slate-400 hover:text-slate-800'
                : 'hover:bg-white/10 text-white/50 hover:text-white'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="mb-3">
          <div
            className={`grid grid-cols-4 gap-1 p-1 rounded-xl border text-xs font-medium ${
              isLight ? 'bg-slate-100 border-black/5' : 'bg-black/20 border-white/10'
            }`}
          >
            <button
              type="button"
              onClick={() => handleModeSelect('auto')}
              className={`flex items-center justify-center gap-1 py-1.5 rounded-lg duration-0 cursor-pointer ${
                currentMode === 'auto'
                  ? isLight
                    ? 'bg-white text-slate-900 font-semibold shadow-sm'
                    : 'bg-white text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>{t('textColorAuto', settings.language)}</span>
            </button>

            <button
              type="button"
              onClick={() => handleModeSelect('light')}
              className={`flex items-center justify-center gap-1 py-1.5 rounded-lg duration-0 cursor-pointer ${
                currentMode === 'light'
                  ? isLight
                    ? 'bg-white text-slate-900 font-semibold shadow-sm'
                    : 'bg-white text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <span>⚪</span>
              <span>{t('textColorWhite', settings.language)}</span>
            </button>

            <button
              type="button"
              onClick={() => handleModeSelect('dark')}
              className={`flex items-center justify-center gap-1 py-1.5 rounded-lg duration-0 cursor-pointer ${
                currentMode === 'dark'
                  ? isLight
                    ? 'bg-white text-slate-900 font-semibold shadow-sm'
                    : 'bg-white text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <span>⚫</span>
              <span>{t('textColorBlack', settings.language)}</span>
            </button>

            <button
              type="button"
              onClick={() => handleModeSelect('custom')}
              className={`flex items-center justify-center gap-1 py-1.5 rounded-lg duration-0 cursor-pointer ${
                currentMode === 'custom'
                  ? isLight
                    ? 'bg-white text-slate-900 font-semibold shadow-sm'
                    : 'bg-white text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <span>🎨</span>
              <span>{t('textColorCustom', settings.language)}</span>
            </button>
          </div>
        </div>

        {/* Custom Section */}
        {currentMode === 'custom' && (
          <div className="space-y-3 pt-1 border-t border-black/5 dark:border-white/10 animate-in fade-in duration-150">
            {/* Target Element Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
              {targets.map((tgt) => (
                <button
                  key={tgt.id}
                  type="button"
                  onClick={() => setActiveTarget(tgt.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 duration-0 cursor-pointer ${
                    activeTarget === tgt.id
                      ? isLight
                        ? 'bg-slate-900 text-white font-semibold shadow-xs'
                        : 'bg-white text-slate-950 font-semibold shadow-xs'
                      : isLight
                      ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      : 'bg-white/10 text-white/70 hover:bg-white/15'
                  }`}
                >
                  {t(tgt.labelKey, settings.language)}
                </button>
              ))}
            </div>

            {/* Color Palette & Custom Picker */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                {PRESET_PALETTE.map((c) => {
                  const isSelected = getCurrentColor(activeTarget).toLowerCase() === c.value.toLowerCase();
                  return (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => handleColorChange(c.value)}
                      title={t(c.labelKey, settings.language)}
                      className={`w-6 h-6 rounded-full border cursor-pointer duration-0 active:scale-95 transition-transform flex items-center justify-center ${
                        isSelected
                          ? 'ring-2 ring-amber-500 ring-offset-2 dark:ring-offset-slate-900 scale-110'
                          : 'border-black/15 dark:border-white/20 hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.value }}
                    >
                      {isSelected && (
                        <Check
                          className={`w-3 h-3 ${
                            c.value === '#ffffff' ? 'text-slate-900' : 'text-white'
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Native Color Picker Dropper */}
              <div className="relative shrink-0 flex items-center gap-1.5">
                <label
                  htmlFor="custom-color-input"
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs cursor-pointer shadow-xs duration-0 active:scale-95 ${
                    isLight
                      ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      : 'bg-white/10 border-white/15 text-white hover:bg-white/15'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/10 inline-block"
                    style={{ backgroundColor: getCurrentColor(activeTarget) }}
                  />
                  <span className="font-mono uppercase text-[11px]">
                    {getCurrentColor(activeTarget)}
                  </span>
                </label>
                <input
                  id="custom-color-input"
                  type="color"
                  value={getCurrentColor(activeTarget)}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer pointer-events-auto"
                />
              </div>
            </div>
          </div>
        )}

        {/* Footer: Tip & Action Buttons */}
        <div className="flex items-center justify-between gap-2 pt-2.5 mt-2.5 border-t border-black/5 dark:border-white/10 text-[11px]">
          <span className="text-slate-500 dark:text-white/50 truncate max-w-[180px] sm:max-w-[240px]">
            {currentMode === 'auto'
              ? t('textColorAutoHint', settings.language)
              : t('textColorWysiwygHint', settings.language)}
          </span>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleReset}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors duration-0 active:scale-95 ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  : 'bg-white/10 hover:bg-white/15 text-white/80 hover:text-white'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('reset', settings.language)}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className={`flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-sm cursor-pointer active:scale-95 duration-0 ${
                isLight
                  ? 'bg-slate-900 hover:bg-black text-white'
                  : 'bg-white hover:bg-slate-100 text-slate-950'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>{t('done', settings.language)}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
