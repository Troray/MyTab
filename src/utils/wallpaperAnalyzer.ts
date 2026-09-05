import { BackgroundType, ThemeSettings, TextColorMode, CustomTextColors } from '../types';

export type ProtectionLevel = 'none' | 'shadow' | 'pill' | 'container';

export interface ComponentReadability {
  // 向后兼容字段
  isDark: boolean;               // 是否推荐亮色/白色文字
  luminance: number;             // 平均亮度 0 ~ 255 (ITU-R BT.601)
  hasHighContrast: boolean;      // 区域内是否存在剧烈明暗反差（如黑白二分、高频逆光斑块）
  variance: number;              // 方差
  range: number;                 // 极差 (max - min)

  // 现代可读性指标体系
  recommendedColor: '#ffffff' | '#0f172a';
  protectionLevel: ProtectionLevel;
  whiteScore: number;            // 白字综合可读性评分
  blackScore: number;            // 黑字综合可读性评分
  minContrast: number;           // 胜出方案的最恶劣单点/区域对比度
  medianLuminance: number;       // 中位数亮度 (0 ~ 255)
  p10: number;                   // 10% 分位数（代表最暗局部区域）
  p90: number;                   // 90% 分位数（代表最亮局部区域）
  darkRatio: number;             // 极暗像素占比 (< 75)
  lightRatio: number;            // 极亮像素占比 (> 175)
}

// 保持类型别名兼容
export type ComponentLuminance = ComponentReadability;

export interface CardsReadability extends ComponentReadability {
  rows: number;
  columns: number;
  gridComplexity: number;        // 4x4 二维网格离散复杂度 (0 ~ 1)
  conflictRatio: number;         // 网格黑白偏好冲突率 (0 ~ 1)
}

export interface WallpaperLuminance {
  clock: ComponentReadability;
  date: ComponentReadability;
  greeting: ComponentReadability;
  search: ComponentReadability;
  tabs: ComponentReadability;
  cards: CardsReadability;
  overallIsDark: boolean;
  // 向后兼容旧视口字段
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
  // 保护等级
  clockProtection: ProtectionLevel;
  dateProtection: ProtectionLevel;
  greetingProtection: ProtectionLevel;
  searchProtection: ProtectionLevel;
  tabsProtection: ProtectionLevel;
  cardsProtection: ProtectionLevel;
  // 各自独立的明暗标志（向后兼容）
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

const DEFAULT_COMP: ComponentReadability = {
  isDark: true,
  luminance: 30,
  hasHighContrast: false,
  variance: 0,
  range: 0,
  recommendedColor: '#ffffff',
  protectionLevel: 'none',
  whiteScore: 18.5,
  blackScore: 1.2,
  minContrast: 15.0,
  medianLuminance: 30,
  p10: 25,
  p90: 35,
  darkRatio: 1,
  lightRatio: 0,
};

const DEFAULT_CARDS_COMP: CardsReadability = {
  ...DEFAULT_COMP,
  rows: 4,
  columns: 4,
  gridComplexity: 0,
  conflictRatio: 0,
};

export const DEFAULT_LUMINANCE: WallpaperLuminance = {
  clock: DEFAULT_COMP,
  date: DEFAULT_COMP,
  greeting: DEFAULT_COMP,
  search: DEFAULT_COMP,
  tabs: DEFAULT_COMP,
  cards: DEFAULT_CARDS_COMP,
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

// WCAG 2.1 相对亮度算法 (Relative Luminance, 0.0 ~ 1.0)
export function getRelativeLuminance(r: number, g: number, b: number): number {
  const rs = r / 255;
  const gs = g / 255;
  const bs = b / 255;

  const R = rs <= 0.03928 ? rs / 12.92 : Math.pow((rs + 0.055) / 1.055, 2.4);
  const G = gs <= 0.03928 ? gs / 12.92 : Math.pow((gs + 0.055) / 1.055, 2.4);
  const B = bs <= 0.03928 ? bs / 12.92 : Math.pow((bs + 0.055) / 1.055, 2.4);

  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

// WCAG 2.1 对比度公式: (L1 + 0.05) / (L2 + 0.05) -> 范围 1.0 ~ 21.0
export function getContrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// 施密特滞回记忆表（模块级记忆各组件当前颜色，消除临界点跳动）
const hysteresisMemory = new Map<string, '#ffffff' | '#0f172a'>();

export interface RawSampleData {
  lums: number[];
  relLums: number[];
  meanLum: number;
  meanRelLum: number;
  variance: number;
  range: number;
  minLum: number;
  maxLum: number;
  minRelLum: number;
  maxRelLum: number;
  p10RelLum: number;
  p90RelLum: number;
  medianLum: number;
  darkRatio: number;
  lightRatio: number;
  hasHighContrast: boolean;
}

/**
 * 稳态施密特滞回仲裁器（White-First Principle）
 * 在任何桌面/锁屏壁纸设计中：
 * 白色文字 + 自适应微光晕（Halo Shadow）是绝对的标准解，通透优雅且天然具备防御力；
 * 深色/墨黑文字（#0f172a）只有在背景【整体大面积纯白/极浅且无暗部】时才启用。
 */
export function arbitrateColorWithHysteresis(
  componentKey: string,
  stats: RawSampleData
): '#ffffff' | '#0f172a' {
  const prev = hysteresisMemory.get(componentKey);
  let choice: '#ffffff' | '#0f172a';

  // 严格的浅色/极亮白底判定条件：
  // 1. 平均亮度 > 165，中位数 > 160
  // 2. 极暗像素（< 75）占比极低（< 10%），防止深色字撞上暗斑导致局部不可读
  // 3. 最暗局部分位 P10 > 0.12 (BT.601 约 > 70)
  const isClearlyLightBackground =
    stats.meanLum > 165 &&
    stats.medianLum > 160 &&
    stats.darkRatio < 0.10 &&
    stats.p10RelLum > 0.12;

  if (prev === '#ffffff') {
    // 当前是白字：切换为黑字需要极其确定且稳态（均值 > 172，极暗占比 < 8%）
    choice = (stats.meanLum > 172 && stats.darkRatio < 0.08 && stats.p10RelLum > 0.15)
      ? '#0f172a'
      : '#ffffff';
  } else if (prev === '#0f172a') {
    // 当前是黑字：一旦背景均值 < 155 或暗部占比 >= 15%，立刻恢复白字稳态
    choice = (stats.meanLum < 155 || stats.darkRatio >= 0.15 || stats.p10RelLum < 0.10)
      ? '#ffffff'
      : '#0f172a';
  } else {
    // 初始状态白字优先
    choice = isClearlyLightBackground ? '#0f172a' : '#ffffff';
  }

  hysteresisMemory.set(componentKey, choice);
  return choice;
}

// 快速分析渐变色字符串
function analyzeGradientLuminance(gradientStr: string): WallpaperLuminance {
  const hexMatches = gradientStr.match(/#([0-9a-fA-F]{3,8})/g);
  if (!hexMatches || hexMatches.length === 0) {
    return DEFAULT_LUMINANCE;
  }

  const btLums = hexMatches.map(parseHexLuminance);
  const relLums = hexMatches.map((hex) => {
    let clean = hex.replace('#', '');
    if (clean.length === 3) clean = clean.split('').map((c) => c + c).join('');
    const r = parseInt(clean.substring(0, 2), 16) || 0;
    const g = parseInt(clean.substring(2, 4), 16) || 0;
    const b = parseInt(clean.substring(4, 6), 16) || 0;
    return getRelativeLuminance(r, g, b);
  });

  const avgBt = btLums.reduce((a, b) => a + b, 0) / btLums.length;
  const avgRel = relLums.reduce((a, b) => a + b, 0) / relLums.length;
  const minRel = Math.min(...relLums);
  const maxRel = Math.max(...relLums);

  const whiteScore = Number(getContrastRatio(1.0, maxRel).toFixed(2));
  const blackScore = Number(getContrastRatio(0.0, minRel).toFixed(2));
  const isLight = avgBt > 165 && minRel > 0.15;
  const recommendedColor = isLight ? '#0f172a' : '#ffffff';
  const hasHighContrast = maxRel - minRel > 0.45;

  const comp: ComponentReadability = {
    isDark: recommendedColor === '#ffffff',
    luminance: Math.round(avgBt),
    hasHighContrast,
    variance: 0,
    range: Math.round((maxRel - minRel) * 255),
    recommendedColor,
    protectionLevel: hasHighContrast ? 'shadow' : 'none',
    whiteScore,
    blackScore,
    minContrast: recommendedColor === '#ffffff' ? whiteScore : blackScore,
    medianLuminance: Math.round(avgBt),
    p10: Math.round(minRel * 255),
    p90: Math.round(maxRel * 255),
    darkRatio: avgRel < 0.15 ? 1 : 0,
    lightRatio: avgRel > 0.5 ? 1 : 0,
  };

  const cardsComp: CardsReadability = {
    ...comp,
    rows: 4,
    columns: 4,
    gridComplexity: hasHighContrast ? 0.2 : 0,
    conflictRatio: 0,
    protectionLevel: hasHighContrast ? 'shadow' : 'none',
  };

  return {
    clock: comp,
    date: comp,
    greeting: comp,
    search: comp,
    tabs: comp,
    cards: cardsComp,
    overallIsDark: recommendedColor === '#ffffff',
    topIsDark: recommendedColor === '#ffffff',
    centerIsDark: recommendedColor === '#ffffff',
    bottomIsDark: recommendedColor === '#ffffff',
  };
}

// 核心采样统计函数：提取 ROI 像素的分布、极值与分位数
export function extractPixelStats(
  imgData: Uint8ClampedArray,
  canvasWidth: number,
  x0: number,
  x1: number,
  y0: number,
  y1: number
): RawSampleData {
  let sumLum = 0;
  let sumRelLum = 0;
  let count = 0;
  let minLum = 255;
  let maxLum = 0;
  let minRelLum = 1.0;
  let maxRelLum = 0.0;
  let darkCount = 0;
  let lightCount = 0;

  const lums: number[] = [];
  const relLums: number[] = [];

  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const idx = (y * canvasWidth + x) * 4;
      const r = imgData[idx];
      const g = imgData[idx + 1];
      const b = imgData[idx + 2];
      const a = imgData[idx + 3];
      if (a < 128) continue;

      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      const relLum = getRelativeLuminance(r, g, b);

      sumLum += lum;
      sumRelLum += relLum;
      count++;

      if (lum < minLum) minLum = lum;
      if (lum > maxLum) maxLum = lum;
      if (relLum < minRelLum) minRelLum = relLum;
      if (relLum > maxRelLum) maxRelLum = relLum;

      if (lum < 75) darkCount++;
      if (lum > 175) lightCount++;

      lums.push(lum);
      relLums.push(relLum);
    }
  }

  const validCount = count || 1;
  const meanLum = sumLum / validCount;
  const meanRelLum = sumRelLum / validCount;

  let varianceSum = 0;
  for (let i = 0; i < lums.length; i++) {
    varianceSum += (lums[i] - meanLum) ** 2;
  }
  const variance = varianceSum / validCount;

  // 快速排序计算分位数
  relLums.sort((a, b) => a - b);
  lums.sort((a, b) => a - b);

  const p10RelLum = relLums.length > 0 ? relLums[Math.floor(relLums.length * 0.1)] : 0;
  const p90RelLum = relLums.length > 0 ? relLums[Math.min(relLums.length - 1, Math.floor(relLums.length * 0.9))] : 1;
  const medianLum = lums.length > 0 ? lums[Math.floor(lums.length * 0.5)] : meanLum;

  const darkRatio = darkCount / validCount;
  const lightRatio = lightCount / validCount;

  // 高反差复合背景判定：极差大、方差剧烈、或明暗像素占比双高
  const hasHighContrast =
    maxLum - minLum > 100 ||
    variance > 1000 ||
    (darkRatio > 0.20 && lightRatio > 0.20);

  return {
    lums,
    relLums,
    meanLum,
    meanRelLum,
    variance,
    range: maxLum - minLum,
    minLum,
    maxLum,
    minRelLum,
    maxRelLum,
    p10RelLum,
    p90RelLum,
    medianLum,
    darkRatio,
    lightRatio,
    hasHighContrast,
  };
}

// 普通组件的可读性分析器
function computeComponentReadability(
  componentKey: string,
  stats: RawSampleData
): ComponentReadability {
  const whiteWorstContrast = getContrastRatio(1.0, stats.p90RelLum);
  const blackWorstContrast = getContrastRatio(0.0, stats.p10RelLum);
  const whiteAvgContrast = getContrastRatio(1.0, stats.meanRelLum);
  const blackAvgContrast = getContrastRatio(0.0, stats.meanRelLum);

  const whiteScore = Number((whiteWorstContrast * 0.7 + whiteAvgContrast * 0.3).toFixed(2));
  const blackScore = Number((blackWorstContrast * 0.7 + blackAvgContrast * 0.3).toFixed(2));

  // 施密特滞回与白字优先原则决策
  const recommendedColor = arbitrateColorWithHysteresis(componentKey, stats);
  const minContrast = Number(
    (recommendedColor === '#ffffff' ? whiteWorstContrast : blackWorstContrast).toFixed(2)
  );

  // 防护等级：依靠抗眩光微光晕（Halo Shadow），不设实体遮挡盒
  const needsEnhancedShadow =
    stats.hasHighContrast ||
    stats.variance > 700 ||
    stats.range > 90 ||
    stats.lightRatio > 0.15;

  const protectionLevel: ProtectionLevel = needsEnhancedShadow ? 'shadow' : 'none';

  return {
    isDark: recommendedColor === '#ffffff',
    luminance: Math.round(stats.meanLum),
    hasHighContrast: stats.hasHighContrast,
    variance: Math.round(stats.variance),
    range: Math.round(stats.range),
    recommendedColor,
    protectionLevel,
    whiteScore,
    blackScore,
    minContrast,
    medianLuminance: Math.round(stats.medianLum),
    p10: Math.round(stats.p10RelLum * 255),
    p90: Math.round(stats.p90RelLum * 255),
    darkRatio: Number(stats.darkRatio.toFixed(2)),
    lightRatio: Number(stats.lightRatio.toFixed(2)),
  };
}

// Cards 专用 4×4 Sub-grid 采样分析器
function computeCardsReadability(
  imgData: Uint8ClampedArray,
  canvasWidth: number,
  canvasHeight: number,
  x0: number,
  x1: number,
  y0: number,
  y1: number
): CardsReadability {
  const globalStats = extractPixelStats(imgData, canvasWidth, x0, x1, y0, y1);
  const baseComp = computeComponentReadability('cards', globalStats);

  // 4×4 Sub-grid 二维采样检测网格复杂度
  const rows = 4;
  const cols = 4;
  const cellWidth = Math.max(1, Math.floor((x1 - x0 + 1) / cols));
  const cellHeight = Math.max(1, Math.floor((y1 - y0 + 1) / rows));

  const cellMeans: number[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx0 = x0 + c * cellWidth;
      const cx1 = Math.min(x1, cx0 + cellWidth - 1);
      const cy0 = y0 + r * cellHeight;
      const cy1 = Math.min(y1, cy0 + cellHeight - 1);

      if (cx1 >= cx0 && cy1 >= cy0) {
        const cellStats = extractPixelStats(imgData, canvasWidth, cx0, cx1, cy0, cy1);
        cellMeans.push(cellStats.meanLum);
      }
    }
  }

  const totalCells = cellMeans.length || 1;
  const gridMean = cellMeans.reduce((a, b) => a + b, 0) / totalCells;
  const gridVar = cellMeans.reduce((a, b) => a + (b - gridMean) ** 2, 0) / totalCells;
  const gridComplexity = Number(Math.min(1.0, Math.sqrt(gridVar) / 100).toFixed(2));

  // 卡片保持悬浮独立，防眩光通过文字微阴影达成
  const needsEnhancedShadow =
    globalStats.hasHighContrast ||
    gridComplexity > 0.15 ||
    globalStats.variance > 700;

  return {
    ...baseComp,
    protectionLevel: needsEnhancedShadow ? 'shadow' : 'none',
    rows,
    columns: cols,
    gridComplexity,
    conflictRatio: 0,
  };
}

/**
 * 现代动态文字可读性与防眩光分析引擎
 * 架构：CSS-Cover 像素映射 + 60xN 全局环境感知 + DOM ROI 两级局部高精采样 + Cards 4x4 Sub-grid
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

      // 1. Tier-1: 60xN 全局视口感知画布（用于全局兜底与环境光感知）
      const canvasWidth = 60;
      const canvasHeight = Math.max(30, Math.min(60, Math.round(canvasWidth * (viewportH / viewportW))));
      const globalCanvas = document.createElement('canvas');
      globalCanvas.width = canvasWidth;
      globalCanvas.height = canvasHeight;
      const globalCtx = globalCanvas.getContext('2d', { willReadFrequently: true });
      if (!globalCtx) {
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

      // 投影到微缩画布
      const destX = (offsetX / viewportW) * canvasWidth;
      const destY = (offsetY / viewportH) * canvasHeight;
      const destW = (scaledW / viewportW) * canvasWidth;
      const destH = (scaledH / viewportH) * canvasHeight;

      globalCtx.drawImage(img, destX, destY, destW, destH);
      const globalImgData = globalCtx.getImageData(0, 0, canvasWidth, canvasHeight).data;

      // 2. Tier-2: 局部高精微离屏画布（硬件加速局部裁剪，彻底消除低分辨率采样损失）
      const localCanvas = document.createElement('canvas');
      const localCtx = localCanvas.getContext('2d', { willReadFrequently: true });

      // 将视口物理矩形坐标反向映射到壁纸原始图片像素坐标
      const getImgSourceCrop = (rect: { left: number; right: number; top: number; bottom: number }) => {
        const srcX0 = Math.max(0, Math.min(imgW - 1, (rect.left - offsetX) / scale));
        const srcX1 = Math.max(0, Math.min(imgW, (rect.right - offsetX) / scale));
        const srcY0 = Math.max(0, Math.min(imgH - 1, (rect.top - offsetY) / scale));
        const srcY1 = Math.max(0, Math.min(imgH, (rect.bottom - offsetY) / scale));
        return {
          sx: srcX0,
          sy: srcY0,
          sw: Math.max(1, srcX1 - srcX0),
          sh: Math.max(1, srcY1 - srcY0),
        };
      };

      // 提取普通组件的高精 ROI 分析
      const analyzeComponentROI = (
        id: string,
        fallbackPercent: [number, number, number, number], // [x0, x1, y0, y1]
        compKey: string
      ): ComponentReadability => {
        if (typeof document !== 'undefined' && localCtx) {
          const el = document.getElementById(id);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
              const left = Math.max(0, rect.left - 6);
              const right = Math.min(viewportW, rect.right + 6);
              const top = Math.max(0, rect.top - 6);
              const bottom = Math.min(viewportH, rect.bottom + 6);

              // 针对该组件进行 80x40 硬件加速高精度局部采样（耗时 < 0.1ms）
              const localW = 80;
              const localH = 40;
              localCanvas.width = localW;
              localCanvas.height = localH;

              const crop = getImgSourceCrop({ left, right, top, bottom });
              localCtx.drawImage(img, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, localW, localH);
              const localData = localCtx.getImageData(0, 0, localW, localH).data;

              const stats = extractPixelStats(localData, localW, 0, localW - 1, 0, localH - 1);
              return computeComponentReadability(compKey, stats);
            }
          }
        }

        // DOM 未挂载时使用 Tier-1 微缩画布保底
        const x0 = Math.max(0, Math.floor(fallbackPercent[0] * canvasWidth));
        const x1 = Math.min(canvasWidth - 1, Math.ceil(fallbackPercent[1] * canvasWidth));
        const y0 = Math.max(0, Math.floor(fallbackPercent[2] * canvasHeight));
        const y1 = Math.min(canvasHeight - 1, Math.ceil(fallbackPercent[3] * canvasHeight));
        const stats = extractPixelStats(globalImgData, canvasWidth, x0, x1, y0, y1);
        return computeComponentReadability(compKey, stats);
      };

      // 提取 Cards 二维区域分析
      const analyzeCardsROI = (): CardsReadability => {
        if (typeof document !== 'undefined' && localCtx) {
          const el = document.getElementById('mytab-cards');
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
              const left = Math.max(0, rect.left - 8);
              const right = Math.min(viewportW, rect.right + 8);
              const top = Math.max(0, rect.top - 8);
              const bottom = Math.min(viewportH, rect.bottom + 8);

              const localW = 96;
              const localH = 64;
              localCanvas.width = localW;
              localCanvas.height = localH;

              const crop = getImgSourceCrop({ left, right, top, bottom });
              localCtx.drawImage(img, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, localW, localH);
              const localData = localCtx.getImageData(0, 0, localW, localH).data;

              return computeCardsReadability(localData, localW, localH, 0, localW - 1, 0, localH - 1);
            }
          }
        }

        // 保底采样
        const x0 = Math.max(0, Math.floor(0.05 * canvasWidth));
        const x1 = Math.min(canvasWidth - 1, Math.ceil(0.95 * canvasWidth));
        const y0 = Math.max(0, Math.floor(0.48 * canvasHeight));
        const y1 = Math.min(canvasHeight - 1, Math.ceil(0.92 * canvasHeight));
        return computeCardsReadability(globalImgData, canvasWidth, canvasHeight, x0, x1, y0, y1);
      };

      // 依次执行各组件的可读性分析
      const clockRead = analyzeComponentROI('mytab-clock', [0.25, 0.75, 0.05, 0.22], 'clock');
      const dateRead = analyzeComponentROI('mytab-date', [0.20, 0.80, 0.18, 0.26], 'date');
      const greetingRead = analyzeComponentROI('mytab-greeting', [0.20, 0.80, 0.24, 0.32], 'greeting');
      const searchRead = analyzeComponentROI('mytab-search', [0.15, 0.85, 0.30, 0.40], 'search');
      const tabsRead = analyzeComponentROI('mytab-tabs', [0.10, 0.90, 0.37, 0.47], 'tabs');
      const cardsRead = analyzeCardsROI();

      const overallAvg =
        (clockRead.luminance +
          dateRead.luminance +
          greetingRead.luminance +
          searchRead.luminance +
          tabsRead.luminance +
          cardsRead.luminance) /
        6;

      onResult({
        clock: clockRead,
        date: dateRead,
        greeting: greetingRead,
        search: searchRead,
        tabs: tabsRead,
        cards: cardsRead,
        overallIsDark: overallAvg < 155,
        topIsDark: clockRead.isDark,
        centerIsDark: searchRead.isDark,
        bottomIsDark: cardsRead.isDark,
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
      clockShadow: 'drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)]',
      dateShadow: 'drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]',
      greetingShadow: 'drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]',
      searchShadow: 'drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]',
      tabsShadow: 'drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]',
      cardShadow: 'drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]',
      clockProtection: 'none',
      dateProtection: 'none',
      greetingProtection: 'none',
      searchProtection: 'none',
      tabsProtection: 'none',
      cardsProtection: 'none',
      clockIsDark: true,
      dateIsDark: true,
      greetingIsDark: true,
      searchIsDark: true,
      tabsIsDark: true,
      cardsIsDark: true,
      topIsDark: true,
      centerIsDark: true,
      bottomIsDark: true,
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
      clockShadow: 'drop-shadow-sm',
      dateShadow: 'drop-shadow-none',
      greetingShadow: 'drop-shadow-none',
      searchShadow: 'drop-shadow-none',
      tabsShadow: 'drop-shadow-none',
      cardShadow: 'drop-shadow-none',
      clockProtection: 'none',
      dateProtection: 'none',
      greetingProtection: 'none',
      searchProtection: 'none',
      tabsProtection: 'none',
      cardsProtection: 'none',
      clockIsDark: false,
      dateIsDark: false,
      greetingIsDark: false,
      searchIsDark: false,
      tabsIsDark: false,
      cardsIsDark: false,
      topIsDark: false,
      centerIsDark: false,
      bottomIsDark: false,
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
      clockShadow: isClockDark ? 'drop-shadow-none' : 'drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)]',
      dateShadow: isDateDark ? 'drop-shadow-none' : 'drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]',
      greetingShadow: isGreetingDark ? 'drop-shadow-none' : 'drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]',
      searchShadow: isSearchDark ? 'drop-shadow-none' : 'drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]',
      tabsShadow: isTabsDark ? 'drop-shadow-none' : 'drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]',
      cardShadow: isCardsDark ? 'drop-shadow-none' : 'drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]',
      clockProtection: 'none',
      dateProtection: 'none',
      greetingProtection: 'none',
      searchProtection: 'none',
      tabsProtection: 'none',
      cardsProtection: 'none',
      clockIsDark: !isClockDark,
      dateIsDark: !isDateDark,
      greetingIsDark: !isGreetingDark,
      searchIsDark: !isSearchDark,
      tabsIsDark: !isTabsDark,
      cardsIsDark: !isCardsDark,
      topIsDark: !isClockDark,
      centerIsDark: !isSearchDark,
      bottomIsDark: !isCardsDark,
    };
  }

  // 4. 精细自适应模式（auto）：白字优先 + 自适应抗眩光微光晕
  const clock = luminance.clock;
  const date = luminance.date;
  const greeting = luminance.greeting;
  const search = luminance.search;
  const tabs = luminance.tabs;
  const cards = luminance.cards;

  const getAdaptiveShadow = (comp: ComponentReadability, level: 'large' | 'medium' | 'small') => {
    const isWhite = comp.recommendedColor === '#ffffff';
    if (isWhite) {
      // 存在高反差、强光斑或复杂背景时：启用双层高质感抗眩光光晕
      if (comp.hasHighContrast || comp.variance > 700 || comp.protectionLevel === 'shadow') {
        return level === 'large'
          ? 'drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] drop-shadow-[0_3px_12px_rgba(0,0,0,0.7)]'
          : level === 'medium'
          ? 'drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] drop-shadow-[0_2px_6px_rgba(0,0,0,0.65)]'
          : 'drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] drop-shadow-[0_1px_5px_rgba(0,0,0,0.55)]';
      }
      // 纯净暗色背景：柔和自然环境光影
      return level === 'large'
        ? 'drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)]'
        : level === 'medium'
        ? 'drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]'
        : 'drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]';
    } else {
      // 极浅背景（黑字）：极简微阴影或无阴影
      if (comp.hasHighContrast) {
        return 'drop-shadow-[0_1px_2px_rgba(255,255,255,0.95)] drop-shadow-[0_1px_4px_rgba(0,0,0,0.25)]';
      }
      return level === 'large' ? 'drop-shadow-sm' : 'drop-shadow-none';
    }
  };

  return {
    clock: clock.recommendedColor,
    date: clock.recommendedColor === '#ffffff' ? 'rgba(255, 255, 255, 0.95)' : '#334155',
    greeting: greeting.recommendedColor === '#ffffff' ? 'rgba(255, 255, 255, 0.95)' : '#334155',
    search: search.recommendedColor === '#ffffff' ? 'rgba(255, 255, 255, 0.92)' : '#1e293b',
    tabs: tabs.recommendedColor,
    cards: cards.recommendedColor,
    clockShadow: getAdaptiveShadow(clock, 'large'),
    dateShadow: getAdaptiveShadow(date, 'medium'),
    greetingShadow: getAdaptiveShadow(greeting, 'medium'),
    searchShadow: getAdaptiveShadow(search, 'medium'),
    tabsShadow: getAdaptiveShadow(tabs, 'small'),
    cardShadow: getAdaptiveShadow(cards, 'small'),
    clockProtection: clock.protectionLevel,
    dateProtection: date.protectionLevel,
    greetingProtection: greeting.protectionLevel,
    searchProtection: search.protectionLevel,
    tabsProtection: tabs.protectionLevel,
    cardsProtection: cards.protectionLevel,
    clockIsDark: clock.recommendedColor === '#ffffff',
    dateIsDark: date.recommendedColor === '#ffffff',
    greetingIsDark: greeting.recommendedColor === '#ffffff',
    searchIsDark: search.recommendedColor === '#ffffff',
    tabsIsDark: tabs.recommendedColor === '#ffffff',
    cardsIsDark: cards.recommendedColor === '#ffffff',
    topIsDark: clock.recommendedColor === '#ffffff',
    centerIsDark: search.recommendedColor === '#ffffff',
    bottomIsDark: cards.recommendedColor === '#ffffff',
  };
}
