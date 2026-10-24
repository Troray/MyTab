import React, { useState, useEffect, useRef } from 'react';
import { Palette, Check, RotateCcw, Sparkles, X, LayoutGrid, Kanban, List } from 'lucide-react';
import { ThemeSettings, TextColorMode, CustomTextColors } from '../../types';
import { TranslationKey } from '../../locales/types';
import { t } from '../../utils/i18n';
import { isLightMode } from '../../utils/constants';

interface TextColorCustomizerProps {
  settings: ThemeSettings;
  onUpdateSettings: (newSettings: Partial<ThemeSettings>) => void;
  onClose: () => void;
}

type LayoutType = 'grid' | 'board' | 'list';

type ElementTarget =
  | 'all'
  | 'clock'
  | 'date'
  | 'greeting'
  | 'search'
  | 'cards'
  | 'boardTitle'
  | 'boardText'
  | 'listCategory'
  | 'listTitle'
  | 'listDesc';

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
  const isLight = isLightMode(settings.mode);

  // Selected layout mode tab (defaults to current desktop layout)
  const [selectedLayout, setSelectedLayout] = useState<LayoutType>(settings.layoutMode || 'grid');

  // Dual-mode separation: light and dark maintain their own independent settings
  const customColors: CustomTextColors = (isLight
    ? settings.customTextColorsLight ?? settings.customTextColors
    : settings.customTextColorsDark ?? settings.customTextColors) || {};

  const defaultColor = isLight ? '#0f172a' : '#ffffff';

  // Read the active mode for a specific layout
  const getLayoutMode = (layout: LayoutType): TextColorMode => {
    if (isLight) {
      if (layout === 'grid') return settings.gridTextColorModeLight ?? settings.gridTextColorMode ?? settings.textColorModeLight ?? settings.textColorMode ?? 'auto';
      if (layout === 'board') return settings.boardTextColorModeLight ?? settings.boardTextColorMode ?? settings.textColorModeLight ?? settings.textColorMode ?? 'auto';
      if (layout === 'list') return settings.listTextColorModeLight ?? settings.listTextColorMode ?? settings.textColorModeLight ?? settings.textColorMode ?? 'auto';
    } else {
      if (layout === 'grid') return settings.gridTextColorModeDark ?? settings.gridTextColorMode ?? settings.textColorModeDark ?? settings.textColorMode ?? 'auto';
      if (layout === 'board') return settings.boardTextColorModeDark ?? settings.boardTextColorMode ?? settings.textColorModeDark ?? settings.textColorMode ?? 'auto';
      if (layout === 'list') return settings.listTextColorModeDark ?? settings.listTextColorMode ?? settings.textColorModeDark ?? settings.textColorMode ?? 'auto';
    }
    return 'auto';
  };

  const currentMode = getLayoutMode(selectedLayout);

  // Snapshot initial settings on mount to allow abandoning all changes on close
  const initialSettings = useRef<Partial<ThemeSettings>>({
    textColorModeLight: settings.textColorModeLight,
    textColorModeDark: settings.textColorModeDark,
    gridTextColorModeLight: settings.gridTextColorModeLight,
    gridTextColorModeDark: settings.gridTextColorModeDark,
    boardTextColorModeLight: settings.boardTextColorModeLight,
    boardTextColorModeDark: settings.boardTextColorModeDark,
    listTextColorModeLight: settings.listTextColorModeLight,
    listTextColorModeDark: settings.listTextColorModeDark,
    customTextColorsLight: settings.customTextColorsLight,
    customTextColorsDark: settings.customTextColorsDark,
  });

  const [activeTarget, setActiveTarget] = useState<ElementTarget>('all');

  const getTargetsForLayout = (layout: LayoutType): { id: ElementTarget; labelKey: TranslationKey }[] => {
    const common: { id: ElementTarget; labelKey: TranslationKey }[] = [
      { id: 'all', labelKey: 'textColorTargetAll' },
      { id: 'clock', labelKey: 'textColorTargetClock' },
      { id: 'date', labelKey: 'textColorTargetDate' },
      { id: 'greeting', labelKey: 'textColorTargetGreeting' },
      { id: 'search', labelKey: 'textColorTargetSearch' },
    ];
    if (layout === 'grid') {
      return [
        ...common,
        { id: 'cards', labelKey: 'textColorTargetCards' },
      ];
    }
    if (layout === 'board') {
      return [
        ...common,
        { id: 'boardTitle', labelKey: 'textColorTargetBoardTitle' },
        { id: 'boardText', labelKey: 'textColorTargetBoard' },
      ];
    }
    return [
      ...common,
      { id: 'listCategory', labelKey: 'textColorTargetListCategory' },
      { id: 'listTitle', labelKey: 'textColorTargetListTitle' },
      { id: 'listDesc', labelKey: 'textColorTargetListDesc' },
    ];
  };

  const currentTargets = getTargetsForLayout(selectedLayout);

  // When switching layout tabs, ensure activeTarget is valid for the new layout
  useEffect(() => {
    const targetIds = getTargetsForLayout(selectedLayout).map((t) => t.id);
    if (!targetIds.includes(activeTarget)) {
      setActiveTarget('all');
    }
  }, [selectedLayout]);

  const handleCancel = () => {
    onUpdateSettings(initialSettings.current);
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

  const handleModeSelect = (newMode: TextColorMode) => {
    const key = isLight
      ? (selectedLayout === 'grid' ? 'gridTextColorModeLight' : selectedLayout === 'board' ? 'boardTextColorModeLight' : 'listTextColorModeLight')
      : (selectedLayout === 'grid' ? 'gridTextColorModeDark' : selectedLayout === 'board' ? 'boardTextColorModeDark' : 'listTextColorModeDark');

    onUpdateSettings({
      [key]: newMode,
    });
  };

  const getCurrentColor = (target: ElementTarget): string => {
    if (target === 'all') return customColors.clock || defaultColor;
    if (target === 'clock') return customColors.clock || defaultColor;
    if (target === 'date') return customColors.date || defaultColor;
    if (target === 'greeting') return customColors.greeting || defaultColor;
    if (target === 'search') return customColors.search || defaultColor;
    if (target === 'cards') return customColors.cards || defaultColor;
    if (target === 'boardTitle') return customColors.boardTitle || defaultColor;
    if (target === 'boardText') return customColors.boardText || defaultColor;
    if (target === 'listCategory') return customColors.listCategory || defaultColor;
    if (target === 'listTitle') return customColors.listTitle || defaultColor;
    if (target === 'listDesc') return customColors.listDesc || defaultColor;
    return defaultColor;
  };

  const handleColorChange = (hex: string) => {
    const modeKey = isLight
      ? (selectedLayout === 'grid' ? 'gridTextColorModeLight' : selectedLayout === 'board' ? 'boardTextColorModeLight' : 'listTextColorModeLight')
      : (selectedLayout === 'grid' ? 'gridTextColorModeDark' : selectedLayout === 'board' ? 'boardTextColorModeDark' : 'listTextColorModeDark');

    const colorsKey = isLight ? 'customTextColorsLight' : 'customTextColorsDark';

    if (activeTarget === 'all') {
      const updates: Partial<CustomTextColors> = {
        clock: hex,
        date: hex,
        greeting: hex,
        search: hex,
      };
      if (selectedLayout === 'grid') {
        updates.cards = hex;
      } else if (selectedLayout === 'board') {
        updates.boardTitle = hex;
        updates.boardText = hex;
      } else if (selectedLayout === 'list') {
        updates.listCategory = hex;
        updates.listTitle = hex;
        updates.listDesc = hex;
      }

      onUpdateSettings({
        [modeKey]: 'custom',
        [colorsKey]: {
          ...customColors,
          ...updates,
        },
      });
    } else {
      onUpdateSettings({
        [modeKey]: 'custom',
        [colorsKey]: {
          ...customColors,
          [activeTarget]: hex,
        },
      });
    }
  };

  const handleReset = () => {
    handleModeSelect('auto');
  };

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
        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-black/5 dark:border-white/10">
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

        {/* Layout Tabs: Free Canvas | Board | List */}
        <div className="flex items-center gap-1 mb-2.5 p-1 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] text-xs font-medium">
          <button
            type="button"
            onClick={() => setSelectedLayout('grid')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              selectedLayout === 'grid'
                ? isLight
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'bg-white/20 text-white font-semibold shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>{t('layoutGrid', settings.language)}</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedLayout('board')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              selectedLayout === 'board'
                ? isLight
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'bg-white/20 text-white font-semibold shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>{t('layoutBoard', settings.language)}</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedLayout('list')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              selectedLayout === 'list'
                ? isLight
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'bg-white/20 text-white font-semibold shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>{t('layoutList', settings.language)}</span>
          </button>
        </div>

        {/* Mode Selector for Selected Layout */}
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
                    : 'bg-white/20 text-white font-semibold shadow-sm'
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
                    : 'bg-white/20 text-white font-semibold shadow-sm'
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
                    : 'bg-white/20 text-white font-semibold shadow-sm'
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
                    : 'bg-white/20 text-white font-semibold shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <span>🎨</span>
              <span>{t('textColorCustom', settings.language)}</span>
            </button>
          </div>
        </div>

        {/* Custom Section for Selected Layout */}
        {currentMode === 'custom' && (
          <div className="space-y-3 pt-1 border-t border-black/5 dark:border-white/10 animate-in fade-in duration-150">
            {/* Target Element Tabs: Wrap naturally without horizontal scroll */}
            <div className="flex items-center flex-wrap gap-1.5 pt-1">
              {currentTargets.map((tgt) => (
                <button
                  key={tgt.id}
                  type="button"
                  onClick={() => setActiveTarget(tgt.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all duration-150 cursor-pointer ${
                    activeTarget === tgt.id
                      ? isLight
                        ? 'bg-slate-900 text-white font-semibold shadow-xs'
                        : 'bg-white/20 text-white font-semibold shadow-xs'
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
                      aria-label={t(c.labelKey, settings.language)}
                      data-tooltip={t(c.labelKey, settings.language)}
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
              className="glass-btn-ghost flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('reset', settings.language)}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="glass-btn-primary flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-semibold active:scale-95 duration-0"
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
