import { BackgroundType, ThemeSettings, TextColorMode, CustomTextColors } from '../types';

export interface WallpaperLuminance {
  topIsDark: boolean;    // 时钟、日期、问候语区域
  centerIsDark: boolean; // 搜索栏区域
  bottomIsDark: boolean; // 分类与快捷卡片区域
  overallIsDark: boolean;
}

export interface ResolvedTextColors {
  clock: string;
  date: string;
  greeting: string;
  search: string;
  tabs: string;
  cards: string;
  topIsDark: boolean;
  centerIsDark: boolean;
  bottomIsDark: boolean;
  clockShadow: string;
  dateShadow: string;
  searchShadow: string;
  cardShadow: string;
}

// 提取颜色字符串中的亮度
function parseHexLuminance(hex: string): number {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  const r = parseInt(clean.substring(0, 2), 16) || 0;
  const g = parseInt(clean.substring(2, 4), 16) || 0;
  const b = parseInt(clean.substring(4, 6), 16) || 0;
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

// 快速分析渐变色字符串中的平均亮度
function analyzeGradientLuminance(gradientStr: string): WallpaperLuminance {
  const hexMatches = gradientStr.match(/#([0-9a-fA-F]{3,8})/g);
  if (!hexMatches || hexMatches.length === 0) {
    return { topIsDark: true, centerIsDark: true, bottomIsDark: true, overallIsDark: true };
  }

  const luminances = hexMatches.map(parseHexLuminance);
  const avg = luminances.reduce((a, b) => a + b, 0) / luminances.length;
  const isDark = avg < 138;

  return {
    topIsDark: isDark,
    centerIsDark: isDark,
    bottomIsDark: isDark,
    overallIsDark: isDark,
  };
}

// 毫秒级分析壁纸区域亮度（20x20 微缩画布）
export function analyzeWallpaperLuminance(
  bgType: BackgroundType,
  bgValue: string,
  onResult: (result: WallpaperLuminance) => void
) {
  if (bgType === 'gradient') {
    const res = analyzeGradientLuminance(bgValue);
    onResult(res);
    return;
  }

  const img = new Image();
  if (bgValue.startsWith('http://') || bgValue.startsWith('https://')) {
    img.crossOrigin = 'anonymous';
  }
  img.src = bgValue;

  img.onload = () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 20;
      canvas.height = 20;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        onResult({ topIsDark: true, centerIsDark: true, bottomIsDark: true, overallIsDark: true });
        return;
      }

      ctx.drawImage(img, 0, 0, 20, 20);
      const imgData = ctx.getImageData(0, 0, 20, 20).data;

      // 分区采样：
      // Top: y 0 ~ 6 (时钟区)
      // Center: y 7 ~ 12 (搜索区)
      // Bottom: y 13 ~ 19 (卡片区)
      let topSum = 0, topCount = 0;
      let centerSum = 0, centerCount = 0;
      let bottomSum = 0, bottomCount = 0;

      for (let y = 0; y < 20; y++) {
        for (let x = 0; x < 20; x++) {
          const idx = (y * 20 + x) * 4;
          const r = imgData[idx];
          const g = imgData[idx + 1];
          const b = imgData[idx + 2];
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;

          if (y <= 6) {
            topSum += lum;
            topCount++;
          } else if (y <= 12) {
            centerSum += lum;
            centerCount++;
          } else {
            bottomSum += lum;
            bottomCount++;
          }
        }
      }

      const topAvg = topSum / (topCount || 1);
      const centerAvg = centerSum / (centerCount || 1);
      const bottomAvg = bottomSum / (bottomCount || 1);
      const overallAvg = (topAvg + centerAvg + bottomAvg) / 3;

      onResult({
        topIsDark: topAvg < 140,
        centerIsDark: centerAvg < 140,
        bottomIsDark: bottomAvg < 140,
        overallIsDark: overallAvg < 140,
      });
    } catch {
      // 跨域受阻时安全降级
      onResult({ topIsDark: true, centerIsDark: true, bottomIsDark: true, overallIsDark: true });
    }
  };

  img.onerror = () => {
    onResult({ topIsDark: true, centerIsDark: true, bottomIsDark: true, overallIsDark: true });
  };
}

// 统一解析各个组件的最终字色与投影
export function resolveTextColors(
  settings: ThemeSettings,
  luminance: WallpaperLuminance,
  activeThemeMode: 'light' | 'dark' = 'dark'
): ResolvedTextColors {
  // Dual-mode support: light and dark maintain their own independent text color settings
  const mode: TextColorMode = (activeThemeMode === 'light'
    ? settings.textColorModeLight ?? settings.textColorMode
    : settings.textColorModeDark ?? settings.textColorMode) || 'auto';

  const custom: CustomTextColors = (activeThemeMode === 'light'
    ? settings.customTextColorsLight ?? settings.customTextColors
    : settings.customTextColorsDark ?? settings.customTextColors) || {};

  // 1. 全局强制亮白
  if (mode === 'light') {
    return {
      clock: '#ffffff',
      date: '#ffffff',
      greeting: '#ffffff',
      search: '#ffffff',
      tabs: '#ffffff',
      cards: '#ffffff',
      topIsDark: true,
      centerIsDark: true,
      bottomIsDark: true,
      clockShadow: 'drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)]',
      dateShadow: 'drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]',
      searchShadow: 'drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]',
      cardShadow: 'drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]',
    };
  }

  // 2. 全局强制墨黑
  if (mode === 'dark') {
    return {
      clock: '#0f172a',
      date: '#334155',
      greeting: '#334155',
      search: '#1e293b',
      tabs: '#1e293b',
      cards: '#0f172a',
      topIsDark: false,
      centerIsDark: false,
      bottomIsDark: false,
      clockShadow: 'drop-shadow-sm',
      dateShadow: 'drop-shadow-none',
      searchShadow: 'drop-shadow-none',
      cardShadow: 'drop-shadow-none',
    };
  }

  // 3. 深度自定义模式 (各个元素完全解耦，独立定制，不再级联回退到 clockColor)
  if (mode === 'custom') {
    const defaultColor = activeThemeMode === 'light' ? '#0f172a' : '#ffffff';
    const clockColor = custom.clock || defaultColor;
    const dateColor = custom.date || defaultColor;
    const greetingColor = custom.greeting || defaultColor;
    const searchColor = custom.search || defaultColor;
    const tabsColor = custom.tabs || defaultColor;
    const cardsColor = custom.cards || defaultColor;

    const isClockDark = parseHexLuminance(clockColor) < 135;
    const isDateDark = parseHexLuminance(dateColor) < 135;
    const isSearchDark = parseHexLuminance(searchColor) < 135;
    const isCardsDark = parseHexLuminance(cardsColor) < 135;

    return {
      clock: clockColor,
      date: dateColor,
      greeting: greetingColor,
      search: searchColor,
      tabs: tabsColor,
      cards: cardsColor,
      topIsDark: !isClockDark,
      centerIsDark: !isSearchDark,
      bottomIsDark: !isCardsDark,
      clockShadow: isClockDark ? 'drop-shadow-none' : 'drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)]',
      dateShadow: isDateDark ? 'drop-shadow-none' : 'drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]',
      searchShadow: isSearchDark ? 'drop-shadow-none' : 'drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]',
      cardShadow: isCardsDark ? 'drop-shadow-none' : 'drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]',
    };
  }

  // 4. 智能自适应模式（auto）：依据 Canvas 采样结果动态赋色
  const topDark = luminance.topIsDark;
  const centerDark = luminance.centerIsDark;
  const bottomDark = luminance.bottomIsDark;

  return {
    clock: topDark ? '#ffffff' : '#0f172a',
    date: topDark ? 'rgba(255, 255, 255, 0.95)' : '#334155',
    greeting: topDark ? 'rgba(255, 255, 255, 0.95)' : '#334155',
    search: centerDark ? 'rgba(255, 255, 255, 0.92)' : '#1e293b',
    tabs: bottomDark ? '#ffffff' : '#1e293b',
    cards: bottomDark ? '#ffffff' : '#0f172a',
    topIsDark: topDark,
    centerIsDark: centerDark,
    bottomIsDark: bottomDark,
    clockShadow: topDark ? 'drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)]' : 'drop-shadow-sm',
    dateShadow: topDark ? 'drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]' : 'drop-shadow-none',
    searchShadow: centerDark ? 'drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]' : 'drop-shadow-none',
    cardShadow: bottomDark ? 'drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]' : 'drop-shadow-none',
  };
}
