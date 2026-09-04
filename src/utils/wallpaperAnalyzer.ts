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
  // 各自独立的明暗标志
  clockIsDark: boolean;
  dateIsDark: boolean;
  greetingIsDark: boolean;
  searchIsDark: boolean;
  tabsIsDark: boolean;
  cardsIsDark: boolean;
  // 向后兼容
  topIsDark: boolean;
  centerIsDark: boolean;
  bottomIsDark: boolean;
}

export const DEFAULT_LUMINANCE: WallpaperLuminance = {
  clock: { isDark: true, luminance: 30, hasHighContrast: false, variance: 0, range: 0 },
  date: { isDark: true, luminance: 30, hasHighContrast: false, variance: 0, range: 0 },
  greeting: { isDark: true, luminance: 30, hasHighContrast: false, variance: 0, range: 0 },
  search: { isDark: true, luminance: 30, hasHighContrast: false, variance: 0, range: 0 },
  tabs: { isDark: true, luminance: 30, hasHighContrast: false, variance: 0, range: 0 },
  cards: { isDark: true, luminance: 30, hasHighContrast: false, variance: 0, range: 0 },
  overallIsDark: true,
  topIsDark: true,
  centerIsDark: true,
  bottomIsDark: true,
};

// 提取颜色字符串中的感知亮度 (ITU-R BT.601)
export function parseHexLuminance(hex: string): number {
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
    variance: 0,
    range: Math.round(max - min),
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
      const a = imgData[idx + 3];
      if (a < 128) continue;

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
    luminance: Math.round(mean),
    isDark: mean < 140,
    hasHighContrast,
    variance: Math.round(variance),
    range: Math.round(max - min),
  };
}

/**
 * 毫秒级多视口精细壁纸分析引擎（CSS-Cover 像素级 1:1 视口仿真 + DOM 真实 Rect 定位）
 * 彻底避免固定百分比假设失准，无论屏幕尺寸、分辨率、缩放比或组件显隐，均精准采样
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
      const viewportW = (typeof window !== 'undefined' && window.innerWidth) || 1920;
      const viewportH = (typeof window !== 'undefined' && window.innerHeight) || 1080;

      // 动态微缩画布（根据视口纵横比自适应，宽度60，高度30~60）
      // 像素数仅 ~2400，计算耗时仅 ~0.15ms，但实现像素级视口映射
      const canvasWidth = 60;
      const canvasHeight = Math.max(30, Math.min(60, Math.round(canvasWidth * (viewportH / viewportW))));
      const canvas = document.createElement('canvas');
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        onResult(DEFAULT_LUMINANCE);
        return;
      }

      // 严格仿真 CSS background-size: cover; background-position: center;
      const imgW = img.naturalWidth || img.width || viewportW;
      const imgH = img.naturalHeight || img.height || viewportH;

      const scale = Math.max(viewportW / imgW, viewportH / imgH);
      const scaledW = imgW * scale;
      const scaledH = imgH * scale;
      const offsetX = (viewportW - scaledW) / 2;
      const offsetY = (viewportH - scaledH) / 2;

      // 将视口覆盖投影到微缩画布坐标（与屏幕渲染 1:1 精确对应）
      const destX = (offsetX / viewportW) * canvasWidth;
      const destY = (offsetY / viewportH) * canvasHeight;
      const destW = (scaledW / viewportW) * canvasWidth;
      const destH = (scaledH / viewportH) * canvasHeight;

      ctx.drawImage(img, destX, destY, destW, destH);
      const imgData = ctx.getImageData(0, 0, canvasWidth, canvasHeight).data;

      // 获取元素在视口中的精确 DOM 物理坐标，未挂载时平滑退化为科学经验比例
      const getROI = (
        id: string,
        fallbackPercent: [number, number, number, number] // [x0, x1, y0, y1]
      ) => {
        if (typeof document !== 'undefined') {
          const el = document.getElementById(id);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
              const left = Math.max(0, rect.left - 4);
              const right = Math.min(viewportW, rect.right + 4);
              const top = Math.max(0, rect.top - 4);
              const bottom = Math.min(viewportH, rect.bottom + 4);

              const x0 = Math.max(0, Math.floor((left / viewportW) * canvasWidth));
              const x1 = Math.min(canvasWidth - 1, Math.ceil((right / viewportW) * canvasWidth));
              const y0 = Math.max(0, Math.floor((top / viewportH) * canvasHeight));
              const y1 = Math.min(canvasHeight - 1, Math.ceil((bottom / viewportH) * canvasHeight));

              if (x1 >= x0 && y1 >= y0) {
                return sampleROI(imgData, canvasWidth, x0, x1, y0, y1);
              }
            }
          }
        }
        const x0 = Math.max(0, Math.floor(fallbackPercent[0] * canvasWidth));
        const x1 = Math.min(canvasWidth - 1, Math.ceil(fallbackPercent[1] * canvasWidth));
        const y0 = Math.max(0, Math.floor(fallbackPercent[2] * canvasHeight));
        const y1 = Math.min(canvasHeight - 1, Math.ceil(fallbackPercent[3] * canvasHeight));
        return sampleROI(imgData, canvasWidth, x0, x1, y0, y1);
      };

      // 依据实际页面 DOM 流进行 6 大物理视口精确采样：
      // 1. Clock (时钟区)
      const clockLum = getROI('mytab-clock', [0.25, 0.75, 0.05, 0.22]);

      // 2. Date (日期区)
      const dateLum = getROI('mytab-date', [0.20, 0.80, 0.18, 0.26]);

      // 3. Greeting (问候语区)
      const greetingLum = getROI('mytab-greeting', [0.20, 0.80, 0.24, 0.32]);

      // 4. Search (搜索框区)
      const searchLum = getROI('mytab-search', [0.15, 0.85, 0.30, 0.40]);

      // 5. Tabs (分类标签区) - 精确锁定分类栏物理位置
      const tabsLum = getROI('mytab-tabs', [0.10, 0.90, 0.37, 0.47]);

      // 6. Cards (快捷卡片区) - 网格实际范围
      const cardsLum = getROI('mytab-cards', [0.05, 0.95, 0.48, 0.92]);

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
      clockIsDark: true,
      dateIsDark: true,
      greetingIsDark: true,
      searchIsDark: true,
      tabsIsDark: true,
      cardsIsDark: true,
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
      clockIsDark: false,
      dateIsDark: false,
      greetingIsDark: false,
      searchIsDark: false,
      tabsIsDark: false,
      cardsIsDark: false,
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
      clockIsDark: !isClockDark,
      dateIsDark: !isDateDark,
      greetingIsDark: !isGreetingDark,
      searchIsDark: !isSearchDark,
      tabsIsDark: !isTabsDark,
      cardsIsDark: !isCardsDark,
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

  // 4. 精细自适应模式（auto）
  const clock = luminance.clock;
  const date = luminance.date;
  const greeting = luminance.greeting;
  const search = luminance.search;
  const tabs = luminance.tabs;
  const cards = luminance.cards;

  const getAdaptiveShadow = (comp: ComponentLuminance, level: 'large' | 'medium' | 'small') => {
    if (comp.isDark) {
      if (comp.hasHighContrast) {
        return level === 'large'
          ? 'drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] drop-shadow-[0_3px_10px_rgba(0,0,0,0.7)]'
          : level === 'medium'
          ? 'drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]'
          : 'drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] drop-shadow-[0_1px_5px_rgba(0,0,0,0.55)]';
      }
      return level === 'large'
        ? 'drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)]'
        : level === 'medium'
        ? 'drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]'
        : 'drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]';
    } else {
      if (comp.hasHighContrast) {
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
    clockIsDark: clock.isDark,
    dateIsDark: date.isDark,
    greetingIsDark: greeting.isDark,
    searchIsDark: search.isDark,
    tabsIsDark: tabs.isDark,
    cardsIsDark: cards.isDark,
    topIsDark: clock.isDark,
    centerIsDark: search.isDark,
    bottomIsDark: cards.isDark,
  };
}
