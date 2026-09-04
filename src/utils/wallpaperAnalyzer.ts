import { BackgroundType, ThemeSettings, TextColorMode, CustomTextColors } from '../types';

export interface ComponentLuminance {
  isDark: boolean;          // 该区域是否属于暗色背景（用于选用亮色文字）
  luminance: number;        // 平均亮度 0 ~ 255
  hasHighContrast: boolean; // 区域内是否存在剧烈明暗反差（如黑白二分、高频逆光斑块）
}

export interface WallpaperLuminance {
  clock: ComponentLuminance;
  date: ComponentLuminance;
  greeting: ComponentLuminance;
  search: ComponentLuminance;
  tabs: ComponentLuminance;
  cards: ComponentLuminance;
  overallIsDark: boolean;
  // 向后兼容旧字段
  topIsDark: boolean;
  centerIsDark: boolean;
  bottomIsDark: boolean;
}

export interface ResolvedTextColors {
  clock: string;
  date: string;
  greeting: string;
  search: string;
  tabs: string;
  cards: string;
  clockShadow: string;
  dateShadow: string;
  greetingShadow: string;
  searchShadow: string;
  tabsShadow: string;
  cardShadow: string;
  // 向后兼容
  topIsDark: boolean;
  centerIsDark: boolean;
  bottomIsDark: boolean;
}

export const DEFAULT_LUMINANCE: WallpaperLuminance = {
  clock: { isDark: true, luminance: 30, hasHighContrast: false },
  date: { isDark: true, luminance: 30, hasHighContrast: false },
  greeting: { isDark: true, luminance: 30, hasHighContrast: false },
  search: { isDark: true, luminance: 30, hasHighContrast: false },
  tabs: { isDark: true, luminance: 30, hasHighContrast: false },
  cards: { isDark: true, luminance: 30, hasHighContrast: false },
  overallIsDark: true,
  topIsDark: true,
  centerIsDark: true,
  bottomIsDark: true,
};

// 提取颜色字符串中的感知亮度 (ITU-R BT.601)
function parseHexLuminance(hex: string): number {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  const r = parseInt(clean.substring(0, 2), 16) || 0;
  const g = parseInt(clean.substring(2, 4), 16) || 0;
  const b = parseInt(clean.substring(4, 6), 16) || 0;
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

// 快速分析渐变色字符串中的平均亮度与明暗极差
function analyzeGradientLuminance(gradientStr: string): WallpaperLuminance {
  const hexMatches = gradientStr.match(/#([0-9a-fA-F]{3,8})/g);
  if (!hexMatches || hexMatches.length === 0) {
    return DEFAULT_LUMINANCE;
  }

  const luminances = hexMatches.map(parseHexLuminance);
  const avg = luminances.reduce((a, b) => a + b, 0) / luminances.length;
  const min = Math.min(...luminances);
  const max = Math.max(...luminances);
  const isDark = avg < 138;
  const hasHighContrast = max - min > 110;

  const comp: ComponentLuminance = {
    isDark,
    luminance: Math.round(avg),
    hasHighContrast,
  };

  return {
    clock: comp,
    date: comp,
    greeting: comp,
    search: comp,
    tabs: comp,
    cards: comp,
    overallIsDark: isDark,
    topIsDark: isDark,
    centerIsDark: isDark,
    bottomIsDark: isDark,
  };
}

// 辅助函数：针对指定兴趣区域（ROI）提取亮度统计值
function sampleROI(
  imgData: Uint8ClampedArray,
  canvasWidth: number,
  x0: number,
  x1: number,
  y0: number,
  y1: number
): ComponentLuminance {
  let sum = 0;
  let count = 0;
  let min = 255;
  let max = 0;
  const lums: number[] = [];

  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const idx = (y * canvasWidth + x) * 4;
      const r = imgData[idx];
      const g = imgData[idx + 1];
      const b = imgData[idx + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      sum += lum;
      count++;
      if (lum < min) min = lum;
      if (lum > max) max = lum;
      lums.push(lum);
    }
  }

  const mean = sum / (count || 1);
  let varianceSum = 0;
  for (let i = 0; i < lums.length; i++) {
    varianceSum += (lums[i] - mean) ** 2;
  }
  const variance = varianceSum / (count || 1);

  // 当样本极差超过 110 或方差超过 1200 时，判定为高反差复合背景（如左右黑白二分或强烈光斑）
  const hasHighContrast = max - min > 110 || variance > 1200;

  return {
    isDark: mean < 140,
    luminance: Math.round(mean),
    hasHighContrast,
  };
}

/**
 * 毫秒级多视口精细壁纸分析引擎（40x30 微缩画布）
 * 将时钟、日期、问候语、搜索框、分类栏、卡片六大元素彻底解耦独立采样
 */
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
      // 采用 40x30 微缩画布，像素数仅 1200，耗时不足 0.3ms，但水平采样精度较此前提升一倍
      const canvasWidth = 40;
      const canvasHeight = 30;
      const canvas = document.createElement('canvas');
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        onResult(DEFAULT_LUMINANCE);
        return;
      }

      ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
      const imgData = ctx.getImageData(0, 0, canvasWidth, canvasHeight).data;

      // 依据实际页面 DOM 流进行 6 大物理视口 ROI 精确采样：
      // 1. Clock (时钟区): y: 10%~23%, x: 30%~70% (中轴居中)
      const clockLum = sampleROI(imgData, canvasWidth, 12, 27, 3, 7);

      // 2. Date (日期区): y: 23%~30%, x: 25%~75%
      const dateLum = sampleROI(imgData, canvasWidth, 10, 29, 7, 9);

      // 3. Greeting (问候语区): y: 30%~37%, x: 25%~75%
      const greetingLum = sampleROI(imgData, canvasWidth, 10, 29, 9, 11);

      // 4. Search (搜索框区): y: 37%~47%, x: 20%~80%
      const searchLum = sampleROI(imgData, canvasWidth, 8, 31, 11, 14);

      // 5. Tabs (分类标签区): y: 47%~57%, x: 15%~85% (彻底脱离底部，归入真实中部物理高度)
      const tabsLum = sampleROI(imgData, canvasWidth, 6, 33, 14, 17);

      // 6. Cards (快捷卡片区): y: 57%~93%, x: 8%~92% (大范围网格覆盖)
      const cardsLum = sampleROI(imgData, canvasWidth, 3, 36, 17, 28);

      const overallAvg =
        (clockLum.luminance +
          dateLum.luminance +
          greetingLum.luminance +
          searchLum.luminance +
          tabsLum.luminance +
          cardsLum.luminance) /
        6;

      onResult({
        clock: clockLum,
        date: dateLum,
        greeting: greetingLum,
        search: searchLum,
        tabs: tabsLum,
        cards: cardsLum,
        overallIsDark: overallAvg < 140,
        topIsDark: clockLum.isDark,
        centerIsDark: searchLum.isDark,
        bottomIsDark: cardsLum.isDark,
      });
    } catch {
      // 跨域受阻时安全降级
      onResult(DEFAULT_LUMINANCE);
    }
  };

  img.onerror = () => {
    onResult(DEFAULT_LUMINANCE);
  };
}

// 统一解析各个组件的最终字色与抗眩光微投影
export function resolveTextColors(
  settings: ThemeSettings,
  luminance: WallpaperLuminance,
  activeThemeMode: 'light' | 'dark' = 'dark'
): ResolvedTextColors {
  const mode: TextColorMode =
    (activeThemeMode === 'light'
      ? settings.textColorModeLight ?? settings.textColorMode
      : settings.textColorModeDark ?? settings.textColorMode) || 'auto';

  const custom: CustomTextColors =
    (activeThemeMode === 'light'
      ? settings.customTextColorsLight ?? settings.customTextColors
      : settings.customTextColorsDark ?? settings.customTextColors) || {};

  // 1. 全局强制亮白模式
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
      greetingShadow: 'drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]',
      searchShadow: 'drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]',
      tabsShadow: 'drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]',
      cardShadow: 'drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]',
    };
  }

  // 2. 全局强制墨黑模式
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
      greetingShadow: 'drop-shadow-none',
      searchShadow: 'drop-shadow-none',
      tabsShadow: 'drop-shadow-none',
      cardShadow: 'drop-shadow-none',
    };
  }

  // 3. 深度自定义模式 (各个元素完全解耦，独立定制)
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
    const isGreetingDark = parseHexLuminance(greetingColor) < 135;
    const isSearchDark = parseHexLuminance(searchColor) < 135;
    const isTabsDark = parseHexLuminance(tabsColor) < 135;
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
      greetingShadow: isGreetingDark ? 'drop-shadow-none' : 'drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]',
      searchShadow: isSearchDark ? 'drop-shadow-none' : 'drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]',
      tabsShadow: isTabsDark ? 'drop-shadow-none' : 'drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]',
      cardShadow: isCardsDark ? 'drop-shadow-none' : 'drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]',
    };
  }

  // 4. 精细自适应模式（auto）：6 大元素各自独立判定颜色与高反差复合微投影
  const clock = luminance.clock || { isDark: luminance.topIsDark, hasHighContrast: false };
  const date = luminance.date || { isDark: luminance.topIsDark, hasHighContrast: false };
  const greeting = luminance.greeting || { isDark: luminance.topIsDark, hasHighContrast: false };
  const search = luminance.search || { isDark: luminance.centerIsDark, hasHighContrast: false };
  const tabs = luminance.tabs || { isDark: luminance.centerIsDark, hasHighContrast: false };
  const cards = luminance.cards || { isDark: luminance.bottomIsDark, hasHighContrast: false };

  // 构造专属的高对比微投影：
  // 当背景存在高反差（如左右二分黑白）时，文字若为白色，必须加重双层边缘微轮廓，确保在浅色那一半清晰可辨！
  const getAdaptiveShadow = (comp: ComponentLuminance, level: 'large' | 'medium' | 'small') => {
    if (comp.isDark) {
      if (comp.hasHighContrast) {
        // 高反差暗基底（白字 + 双层抗眩光深影）：在浅色半边能靠深色轮廓清晰突围
        return level === 'large'
          ? 'drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] drop-shadow-[0_3px_10px_rgba(0,0,0,0.7)]'
          : level === 'medium'
          ? 'drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]'
          : 'drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] drop-shadow-[0_1px_5px_rgba(0,0,0,0.55)]';
      }
      // 纯净深色背景：柔和羽化投影
      return level === 'large'
        ? 'drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)]'
        : level === 'medium'
        ? 'drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]'
        : 'drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]';
    } else {
      if (comp.hasHighContrast) {
        // 高反差亮基底（黑字 + 浅色发光微轮廓）
        return 'drop-shadow-[0_1px_2px_rgba(255,255,255,0.95)] drop-shadow-[0_1px_4px_rgba(0,0,0,0.25)]';
      }
      return level === 'large' ? 'drop-shadow-sm' : 'drop-shadow-none';
    }
  };

  return {
    clock: clock.isDark ? '#ffffff' : '#0f172a',
    date: date.isDark ? 'rgba(255, 255, 255, 0.95)' : '#334155',
    greeting: greeting.isDark ? 'rgba(255, 255, 255, 0.95)' : '#334155',
    search: search.isDark ? 'rgba(255, 255, 255, 0.92)' : '#1e293b',
    tabs: tabs.isDark ? '#ffffff' : '#1e293b',
    cards: cards.isDark ? '#ffffff' : '#0f172a',
    clockShadow: getAdaptiveShadow(clock, 'large'),
    dateShadow: getAdaptiveShadow(date, 'medium'),
    greetingShadow: getAdaptiveShadow(greeting, 'medium'),
    searchShadow: getAdaptiveShadow(search, 'medium'),
    tabsShadow: getAdaptiveShadow(tabs, 'small'),
    cardShadow: getAdaptiveShadow(cards, 'small'),
    topIsDark: clock.isDark,
    centerIsDark: search.isDark,
    bottomIsDark: cards.isDark,
  };
}
