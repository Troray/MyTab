import { Solar } from 'lunar-javascript';

/**
 * Formats a given Date into Chinese Lunar Calendar representation with:
 * - GanZhi + ShengXiao Year (e.g. 乙巳蛇年 / 丙午马年)
 * - Lunar Month & Day (e.g. 正月初一 / 七月廿六)
 * - Solar Terms or Traditional/Public Festivals appended if occurring today (e.g. · 春节 / · 白露)
 */
export function getLunarDisplay(date: Date = new Date()): string {
  try {
    const solar = Solar.fromDate(date);
    const lunar = solar.getLunar();

    const yearGanZhi = lunar.getYearInGanZhi();
    const shengXiao = lunar.getYearShengXiao();
    const month = lunar.getMonthInChinese();
    const day = lunar.getDayInChinese();
    const jieQi = lunar.getJieQi();
    const lunarFestivals = lunar.getFestivals();
    const solarFestivals = solar.getFestivals();

    // Priority: Traditional Lunar Festivals > 24 Solar Terms (JieQi) > Solar Festivals
    let tag = '';
    if (lunarFestivals && lunarFestivals.length > 0) {
      tag = lunarFestivals[0];
    } else if (jieQi) {
      tag = jieQi;
    } else if (solarFestivals && solarFestivals.length > 0) {
      tag = solarFestivals[0];
    }

    if (tag) {
      return `${yearGanZhi}${shengXiao}年 ${month}月${day} · ${tag}`;
    }
    return `${yearGanZhi}${shengXiao}年 ${month}月${day}`;
  } catch (err) {
    console.warn('[Lunar] Failed to resolve lunar date:', err);
    return '';
  }
}
