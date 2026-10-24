import React from 'react';
import { Category, SiteItem, SearchEngine, ThemeSettings, WebdavConfig, GitSyncConfig, GitPlatformConfig, GridPage, PresetGradient, IconBgType } from '../types';
import { t, Locale } from '../locales';

export const DEFAULT_SEARCH_ENGINES: SearchEngine[] = [
  {
    id: 'google',
    name: 'Google',
    urlPattern: 'https://www.google.com/search?q=%s',
  },
  {
    id: 'bing',
    name: 'Bing',
    urlPattern: 'https://www.bing.com/search?q=%s',
  },
  {
    id: 'baidu',
    name: '百度',
    nameKey: 'engineBaidu',
    urlPattern: 'https://www.baidu.com/s?wd=%s',
  },
  {
    id: 'duckduckgo',
    name: 'DuckDuckGo',
    urlPattern: 'https://duckduckgo.com/?q=%s',
  },
  {
    id: 'yandex',
    name: 'Yandex',
    urlPattern: 'https://yandex.com/search/?text=%s',
  },
  {
    id: 'github',
    name: 'GitHub',
    urlPattern: 'https://github.com/search?q=%s',
  }
];

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'all', name: '全部', nameKey: 'allCategories', sortOrder: 0, isDefault: true },
  { id: 'work', name: '工作与开发', nameKey: 'categoryWork', sortOrder: 1 },
  { id: 'tools', name: '常用工具', nameKey: 'categoryTools', sortOrder: 2 },
  { id: 'media', name: '设计与灵感', nameKey: 'categoryMedia', sortOrder: 3 },
];

export const DEFAULT_GRID_PAGES: GridPage[] = [
  { id: 'page-1', name: '桌面 1', sortOrder: 0 },
];

export const DEFAULT_SITES: SiteItem[] = [
  {
    id: 'site-github',
    title: 'GitHub',
    url: 'https://github.com',
    icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAADqElEQVRYR71X0U4aQRSdOyxCrUb0sU8YpQVRHJM26Zv4BdUvqH6B+gXiF4hfUPoF6hfIY5M2cQQRWjD6akwKjdWWws50ZmVhd5ldFGj3ibAzc889c+69ZwE98iGEhO4aeJUhfRlzRDigMGI8ZGzHUAOOrhgg6tMhOxpER5TS2mOOhl6LooSEG3WWAgzv2gF7bRLvOYaM3w+7JUqvvJa7AjAyrrMdjtDWI+K5LgENpZ/7pnYpzSoZUQJ4yJofA+LhQYKbezmCK38AVlRsdAGIxOOEMe1gWMGtIHCzuVYuF6g1KRuAYWfuZE/FRBuAvPPbOj+xZi43ADDKOSZPZkRUBtfRIcaiYjgnVibGA5NLpibaACKxxJ5TcJjj9W8l+lFujsQX1hnDOwaQVtlxzjrCwpgYVSLeYR22zH3ReZJs6uzYRrsQZjmf25b/GQAk9c06u3RSBs3AUrn8uX1nJJkM/a7VQm6lFSVvw0EUrFkVL/9r1u+7ztYCeFqeYwCYiSUy4sd7JwAtMCoWffKs415V4gZA9omLwukGyKx+Xn+vqg4CzDfKhXymVxCv99H51+IK/tiuwFgPUBsbmZwGebecwQe1Yp+J2h2MAZng7XXVJm4zlkwQ3Oi3CnAQBgyNKYQo/xfVlREMLJ5w1ikTM9hYYGrSrX32A2g2vlh1zhIxXyioXsj6vyieTvcTyG2PMlGhA5iNJUT5259/AWA2tiCECMmuUv9fANyuWnkFEuXQNaBgWpaiqwiRxlcr+fzRMHTg1gsMEbqVoSiSbKWYXxkGALcYrTJUNyIjMMbblQJNDwLiVYxs6ogpz5C95qEV31QvXf0eoFTlPLfbDwiv4KbOuoYRBryrcyQmIN8zPYAsSw1BGnzaaensS9YLTCTyhmCtscwwFy2+u8GZeyX9FyW60RrHnZEpgyEdtsdfhLJ3N9XjrkMAH1bO6ZoKxOzcwgHisPoYtsxJ2zYkM/FEGhjaNDaL8tBGYAmhIGrUf9nMqebDK6UzqmTBred3NTqM9i8KOcNtdyyZY2rx1iI5zxuN+y3ByoQGQL8W6b5XhqrGZl0vGVZaMrnICGbJGJq6cER2F9uLXi8AD6bUPuJ72nLpXDQGlGH8AzM20S8DMjjGI2vlQsfi2a7AmpmTCeu7SjHn+TnnNlucmZtneh72co6kGGc7gwCQWhr3T6We9GnWzcZ9yjStPRmQxkM8XIdDfzAoPk69LV3Pr2MTDCHCkiN3S26uU1lzL+H+BS8oBvVeyJ3FAAAAAElFTkSuQmCC',
    categoryId: 'work',
    sortOrder: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'site-google',
    title: 'Google',
    url: 'https://www.google.com',
    icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAFZUlEQVRYR71XDUyUdRj/vXdyBwfHyYeKimlEIYSDpCI/ckxWWNmX9qG2liaZpUtNc7SGZk6TOTdZthXoXE601mZbLWe6cIvBMChkls0MkJwf+I1yx3Fw9/b7v7738r7HwR2M9b89d++9/+f5Pb//8zz/LwlhNlmWY6k61+fzzZYkKYvPKRS7an6bvy3UaTSZTD/z+UfqiHchmxRKg6BpdFpEwAWUyFD6op82nZSDJLONNmcHsumXAAFsdLyZAKso5nAcB+oQo4eyk0Q2EKMzGEZQAjR6gPIdjTKG4jgIkVPEmkf5J7CvDwE6nkr5icqJgcreSxfQdfwouhvq0dPaDF/7LRFvmGIdME9MgSVrKqz5c2AeP6EPb2JeJeaTlJP6TgMBdeTVgc69ly/CWfYZuqoqFYcDNkmCdUYeopevgjlpnEFVJTFdHwmNADujKb8Ght197DA6Sksgu4OmsF8uUpQN9rUfwZr3RCAJkY5cf01oBLxe7w4Wy/t6bdfXX8G5+/Mhl0FkwVzYP9jQx57Fvd1sNq8XHQoBMdUof+qrXYz8TsnHQZ2PSEmF5dHpMI8dTwQJ3osX4KmrQU9T74yLfOZF2FcXKf3BZgd9pYtUKL0c/V6OfrFfURTbzcKFkLvcBlvhMIaglpzcoMQ89bW4s2MLrDPzELNi7YCRYxT2MAqFEkfuoFzWLzLO0vfg+qHWABCRngnH1lJIdv/iFxxfdjkh2aJDpo0+XfSZJAgsonaF30LubIa3KgOuyrHoqh+lvDbFJyCu/ABMjriQwINUWCAx/LsZ/qV+Q9+5T+Fr2qj89fw1Eq7DExGzaiNEQQ13YxrKJH7VMRQPa/n/vQDyzeOaL9/tZFie/RsYMWK4/YviPyEIXCeBeD96TxVXMU+b5kwa8xLMmQf6dZ6/1Rk2seIXrMjL6B2IsjCRgIcEIjQCldzwZJ8GappUBNN9nwwLgaV5FiyarrkSEfD8rwRenxmBxbMs2mD8BK4xAgn9pmD0fJinHByWCCzPt+DlXEMElBQYi7BhDuQb3HTU1mZJx+gZvyHCNLgibLnqQ2G5cf/YOM+KWZMNNXAiyDQs4TQsVtwf6UpGyZ0srHtkJZ5PyQ+72ITiN7XdKKv0GGwqVtiQ5OhdmpVpyDwspJZW5nLnObhrMrCzIwOH3JMUgPhIBw4U7EBC5MiwSHS4ZSz5shM3nL1b9z2JJuxdFhVo/6ogEKsuxVrvztrNqGhtNChPjkvBrrxiOCwDL8XdXqD4Wzfqmvmga28z/68Y8y+W4jH+zWgPV8M3/fqXnFex4MgauHqMm1GSLRHrc97C4+Nygkbi7K1WlPxSi5Y/nmJ/7zEyPlrCvneiEGUxhL+cm9Ey/3Z8P6Nwmoy0CjnSWoXi2tKgjibFjse0pIcwISaJu62EK53X0XDlNBqvnYHMj9mdClvbSkg9d/eOTfMjMTOtlxB9davbcZP+QLKdUVin97j/zPcoPbkvrLwHKkleO6La3sWSnCzD3Bd6LL5tHP2H4ll/JLMpa7MkZerBjv5bjS11XzAdgzuSmXmSL0x/DYVTnjNwE5cX+niMouQ38FCaSoUadt7dh9V22XUNuxr349j5avhCHUppkzP6QazOfgOicPWN2G3EFofSZv/7YMfybCoeDSQhDERxChJ1bafQ1H4eN7valUOyw2rHRPs4ZI+ajPzkaUiLu7dP2lTnBcQ1TK/+LiYiEoeoPGVIBRBgpIZdXEy0kfcbAX8HjaJYLJtotEY/OwZDSFQ7RZy2BY5xTqtA4VxOU9XL6UKC2MIhIM57lAo6LqFN00A2IQnoIiKWwKcDrucOtb+dv80i1Or1/DAdd4RD9j/w5nJL3xmBhgAAAABJRU5ErkJggg==',
    categoryId: 'tools',
    sortOrder: 1,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'site-weibo',
    title: 'Weibo',
    titleKey: 'siteWeibo',
    url: 'https://weibo.com',
    icon: 'data:image/png;base64,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',
    categoryId: 'media',
    sortOrder: 2,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'site-youtube',
    title: 'YouTube',
    url: 'https://youtube.com',
    icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAAAMFBMVEVHcEz/ADP/ADP/ADP/ADP/ADP/ADP/ADP/ADP/////hpT/2uH/Smj/s8D/JEv/b4eB3bNwAAAACHRSTlMAQB+z1GXri3bBstgAAAKRSURBVHic7ZrpduMwCIUrGW1xMn3/t602J25s59RARGeG+zd1+Y4QaLsfHyqVSqVSqVSqv0C2yCxyxh0r/9pVP7L4kKaGCSFMVTBBke+KO/Jx+bX+af6kKP+HUMnMD2mscSVmC7YXB6UKVXCceYlhQonLFnYXBSCYo/DTW0OvNO0h2GHhK8ImE/a9I7+RfxoEMzj+M4GB0fFjhBXB2PwvWs2DIBE/xiCZgKJ7EoQGIEbXZ4DQAOQhaLPASMWP0chmoOdApgabghWdAn0SWLn4MVrZOdhmoZMEcLJF0LqxYBHkBSkDCBZBLoMMMHwrspbPAJLxY0S1geuVD8Bi2sBlvv2RBUgpfTIBGEwfKgBp5smDQwOkdONAcJhG2AHSfKEjBApAQaADIDrxA4Ceh4kKkIglSQcg5mHCrEVPAKSSBBaAPBWweeACSOmCQwDMarwLkOZPDILnA8h5QCwQHrMdOALIJXl+NrICYEqSGeB8SbIDnC3JNwCcGwR+gJOLAzvA2UL4t6pgRvRj1k6IWBQZW/HtilsLuFZD5EGBazlGb4qAYUtG2pmy7AkpxzSGXTFyK8QFQD8XkE5GmD3Qd5GOZrhd4DMA/nRMS34X/nh+Y4heAXA3JKTSW8vg7ojIp/K7rPwtmfg9ofxNqfhdsfhtufh7gfiLifibkeSrmf8d74bSL6fib8fyr+dyOVhcJNIOCjkPyd1GI9QMlwH4BT4ikWYE3/xso71sWzfbcDfd1lk5tBjDJnydioNGwe86KitCmADeSuEBpkNPaWMwzcsLnPbWbqotDt/XrtoHRjUyd2dx9xYDPKzFR3EWU3HzFN9Nxa4ZnX8UeheneavX9upXst1VXT5Dx1SpVCqVSqX6j/QFgvdUtSxW0v0AAAAASUVORK5CYII=',
    categoryId: 'media',
    sortOrder: 3,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
];

export const PRESET_GRADIENTS: PresetGradient[] = [
  { name: '暗岩流沙', nameKey: 'gradientDarkSand', value: 'conic-gradient(from 210deg, #c5bbb8 0.000deg, #c5bbb8 24.000deg, #b8b5b8 calc(24.000deg + 0.1deg), #b8b5b8 48.000deg, #a9afb7 calc(48.000deg + 0.1deg), #a9afb7 72.000deg, #9aa8b5 calc(72.000deg + 0.1deg), #9aa8b5 96.000deg, #8ba1b3 calc(96.000deg + 0.1deg), #8ba1b3 120.000deg, #7d98af calc(120.000deg + 0.1deg), #7d98af 144.000deg, #7090ab calc(144.000deg + 0.1deg), #7090ab 168.000deg, #6587a6 calc(168.000deg + 0.1deg), #6587a6 192.000deg, #5c7ea1 calc(192.000deg + 0.1deg), #5c7ea1 216.000deg, #55759b calc(216.000deg + 0.1deg), #55759b 240.000deg, #516c94 calc(240.000deg + 0.1deg), #516c94 264.000deg, #4f638d calc(264.000deg + 0.1deg), #4f638d 288.000deg, #505a85 calc(288.000deg + 0.1deg), #505a85 312.000deg, #54537d calc(312.000deg + 0.1deg), #54537d 336.000deg, #5b4b74 calc(336.000deg + 0.1deg) 360.000deg)' },
  { name: '琥珀金秋', nameKey: 'gradientAmberAutumn', value: 'conic-gradient(from 90deg, #bb7702 0.000deg, #bb7702 27.692deg, #ca861b calc(27.692deg + 0.1deg), #ca861b 55.385deg, #d29336 calc(55.385deg + 0.1deg), #d29336 83.077deg, #d29e4f calc(83.077deg + 0.1deg), #d29e4f 110.769deg, #cba566 calc(110.769deg + 0.1deg), #cba566 138.462deg, #bca979 calc(138.462deg + 0.1deg), #bca979 166.154deg, #a8aa88 calc(166.154deg + 0.1deg), #a8aa88 193.846deg, #92a690 calc(193.846deg + 0.1deg), #92a690 221.538deg, #7b9f92 calc(221.538deg + 0.1deg), #7b9f92 249.231deg, #67948d calc(249.231deg + 0.1deg), #67948d 276.923deg, #588782 calc(276.923deg + 0.1deg), #588782 304.615deg, #4f7871 calc(304.615deg + 0.1deg), #4f7871 332.308deg, #4f695c calc(332.308deg + 0.1deg) 360.000deg)' },
  { name: '赤陶青瓷', nameKey: 'gradientTerracottaCeladon', value: 'linear-gradient(45deg, #c2615d 0.000%, #c2615d 7.692%, #c1625e calc(7.692% + 1px), #c1625e 15.385%, #bd6761 calc(15.385% + 1px), #bd6761 23.077%, #b76f66 calc(23.077% + 1px), #b76f66 30.769%, #ae796e calc(30.769% + 1px), #ae796e 38.462%, #a38478 calc(38.462% + 1px), #a38478 46.154%, #979184 calc(46.154% + 1px), #979184 53.846%, #8b9d90 calc(53.846% + 1px), #8b9d90 61.538%, #7fa99b calc(61.538% + 1px), #7fa99b 69.231%, #75b3a6 calc(69.231% + 1px), #75b3a6 76.923%, #6cbab0 calc(76.923% + 1px), #6cbab0 84.615%, #66bfb8 calc(84.615% + 1px), #66bfb8 92.308%, #62c0bd calc(92.308% + 1px) 100.000%)' },
  { name: '霓虹琉璃', nameKey: 'gradientNeonGlaze', value: 'conic-gradient(from 45deg, #88deba 0.000deg, #88deba 27.692deg, #79dfc5 calc(27.692deg + 0.1deg), #79dfc5 55.385deg, #70d9d1 calc(55.385deg + 0.1deg), #70d9d1 83.077deg, #6dcfdc calc(83.077deg + 0.1deg), #6dcfdc 110.769deg, #72c1e5 calc(110.769deg + 0.1deg), #72c1e5 138.462deg, #7db1ea calc(138.462deg + 0.1deg), #7db1ea 166.154deg, #8ca1ea calc(166.154deg + 0.1deg), #8ca1ea 193.846deg, #9f93e6 calc(193.846deg + 0.1deg), #9f93e6 221.538deg, #b389de calc(221.538deg + 0.1deg), #b389de 249.231deg, #c683d3 calc(249.231deg + 0.1deg), #c683d3 276.923deg, #d584c7 calc(276.923deg + 0.1deg), #d584c7 304.615deg, #de89bc calc(304.615deg + 0.1deg), #de89bc 332.308deg, #e194b3 calc(332.308deg + 0.1deg) 360.000deg)' },
  { name: '灰蓝晕影', nameKey: 'gradientSlateVignette', value: 'radial-gradient(circle at 50% 50%, #c5bbb8 0.000%, #b8b5b8 7.143%, #a9afb7 14.286%, #9aa8b5 21.429%, #8ba1b3 28.571%, #7d98af 35.714%, #7090ab 42.857%, #6587a6 50.000%, #5c7ea1 57.143%, #55759b 64.286%, #516c94 71.429%, #4f638d 78.571%, #505a85 85.714%, #54537d 92.857%, #5b4b74 100.000%)' },
  { name: '抹茶奶栗', nameKey: 'gradientMatchaChestnut', value: 'radial-gradient(circle at 50% 50%, #dac5b3 0.000%, #acb6a4 25.000%, #799d8d 50.000%, #567f70 75.000%, #515f4f 100.000%)' },
  { name: '鸢尾柔暮', nameKey: 'gradientIrisDusk', value: 'radial-gradient(circle at 50% 50%, #989ecb 0.000%, #8ca4c6 16.667%, #92a9be 33.333%, #a7acb4 50.000%, #c4afa8 66.667%, #dfaf9d 83.333%, #eeae93 100.000%)' },
  { name: '樱花冰沙', nameKey: 'gradientSakuraSmoothie', value: 'radial-gradient(circle at 50% 50%, #fcb8e2 0.000%, #ffc8ed 20.000%, #fbe8f9 40.000%, #e8f9ff 60.000%, #d0ecff 80.000%, #b8cdfa 100.000%)' },
  { name: '黑耀星环', nameKey: 'gradientObsidianRing', value: 'conic-gradient(from 90deg, #05050a 0.000deg, #090a0e 30.000deg, #0d0e12 60.000deg, #121316 90.000deg, #16171a 120.000deg, #1a1b1e 150.000deg, #1e1f22 180.000deg, #222326 210.000deg, #26272a 240.000deg, #292a2d 270.000deg, #2c2d30 300.000deg, #2e2f33 330.000deg, #303135 360.000deg)' },
  { name: '深空灰烬', nameKey: 'gradientDeepSpaceAsh', value: 'linear-gradient(135deg, #292832 0.000%, #272530 8.333%, #24222e 16.667%, #201f2b 25.000%, #1c1b27 33.333%, #181624 41.667%, #141220 50.000%, #100e1c 58.333%, #0c0a18 66.667%, #080614 75.000%, #050311 83.333%, #02000e 91.667%, #00000b 100.000%)' },
];

/**
 * Returns localized category name for display.
 * If user has customized the name away from default, returns category.name.
 */
export function getCategoryDisplayName(cat: Category, lang: Locale = 'zh-CN'): string {
  if (cat.nameKey) {
    const translated = t(cat.nameKey, lang);
    if (translated) return translated;
  }
  if (cat.id === 'all') {
    return t('allCategories', lang) || 'All';
  }
  if (cat.id === 'work' && (!cat.name || cat.name === '工作与开发' || cat.name === 'Work & Dev')) {
    return t('categoryWork', lang) || cat.name || 'Work & Dev';
  }
  if (cat.id === 'tools' && (!cat.name || cat.name === '常用工具' || cat.name === 'Tools')) {
    return t('categoryTools', lang) || cat.name || 'Tools';
  }
  if (cat.id === 'media' && (!cat.name || cat.name === '设计与灵感' || cat.name === 'Design & Inspiration')) {
    return t('categoryMedia', lang) || cat.name || 'Design & Inspiration';
  }
  return cat.name;
}

/**
 * Returns localized grid page (desktop) name for display.
 * If user has customized the name away from default, returns page.name.
 */
export function getGridPageDisplayName(page: GridPage, idx: number, lang: Locale = 'zh-CN'): string {
  const defaultZh = `桌面 ${idx + 1}`;
  const defaultEn = `Desktop ${idx + 1}`;
  if (page.name && page.name !== defaultZh && page.name !== defaultEn && page.name !== '桌面 1' && page.name !== 'Desktop 1') {
    return page.name;
  }
  return `${t('defaultDesktopName', lang)} ${idx + 1}`;
}

/**
 * Returns localized site title for display.
 * If user customized the site title, returns site.title.
 */
export function getSiteDisplayName(site: SiteItem, lang: Locale = 'zh-CN'): string {
  if (site.titleKey) {
    const translated = t(site.titleKey, lang);
    if (translated) return translated;
  }
  if (site.id === 'site-weibo' && (!site.title || site.title === '微博' || site.title === 'Weibo')) {
    return t('siteWeibo', lang) || site.title;
  }
  return site.title || 'Untitled';
}

export const DEFAULT_PRIVATE_BACKGROUND_VALUE =
  'linear-gradient(135deg, #292832 0.000%, #272530 8.333%, #24222e 16.667%, #201f2b 25.000%, #1c1b27 33.333%, #181624 41.667%, #141220 50.000%, #100e1c 58.333%, #0c0a18 66.667%, #080614 75.000%, #050311 83.333%, #02000e 91.667%, #00000b 100.000%)';

export const DEFAULT_CATEGORY_COLORS = [
  '#ffffff', // White
  '#000000', // Black
  '#f43f5e', // Rose / Red (media)
  '#8b5cf6', // Violet / Purple (social)
  '#f59e0b', // Amber / Orange (others)
  '#10b981', // Emerald / Green (ai)
  '#0ea5e9', // Sky Blue
  '#ec4899', // Pink
];

/**
 * Slate color tokens that are considered "dark text" in the board layout.
 * Used by BoardColumn to decide whether to apply dark-on-light or light-on-dark
 * UI patterns (hover backgrounds, button colors, etc.) based on the resolved
 * wallpaper text color.
 */
export const BOARD_DARK_TEXT_TOKENS = ['#0f172a', '#334155', '#1e293b'] as const;

export const DEFAULT_SETTINGS: ThemeSettings = {
  mode: 'dark',
  layoutMode: 'grid',
  backgroundType: 'custom',
  backgroundValue: './wallpapers/default-wallpaper.svg',
  cardOpacity: 0.20, // 默认卡片透明度 20%
  cardSize: 110,     // 默认卡片大小 110px
  iconSizeRatio: 0.60, // 默认图标占比 60%
  maxCardsPerRow: 8, // 默认每行最多 8 个卡片
  activeEngineId: 'google',
  openInNewTab: true,
  timeFormat: '24h',
  showSearch: true,
  showClock: true,
  showGreeting: true,
  showDate: true,
  showLunar: true,
  showCardBackground: false, // 默认不显示卡片背景
  showSiteTitle: true,
  showCategories: false, // 默认关闭分类/分组功能
  categoryDisplayMode: 'groups', // 开启时默认使用分组容器模式
  maxNavCategories: 6,
  iconSpacing: 20,
  gridShowTooltip: true,
  boardShowTooltip: true,
  listShowTooltip: true,
  boardColumnsPerRow: 5,
  boardCardGap: 16,
  boardTitleAlign: 'left',
  boardTitleSize: 15,
  boardItemSpacing: 6,
  boardShowCardBackground: true,
  boardCardOpacity: 0.20,
  boardAlign: 'center',
  language: 'zh-CN',
  textColorMode: 'light',
  customTextColors: {},
  textColorModeLight: 'auto',
  customTextColorsLight: {},
  textColorModeDark: 'light',
  customTextColorsDark: {},
  gridTextColorMode: 'auto',
  gridTextColorModeLight: 'auto',
  gridTextColorModeDark: 'light',
  boardTextColorMode: 'auto',
  boardTextColorModeLight: 'auto',
  boardTextColorModeDark: 'light',
  listTextColorMode: 'auto',
  listTextColorModeLight: 'auto',
  listTextColorModeDark: 'light',
  networkMode: 'wan',
  showNetworkBadge: true,
  gridGapX: 20,
  gridGapY: 20,
  gridTitleFontSize: 14,
  gridIconSize: 48,
  gridCategoryFontSize: 14,
  gridIconTextGap: 8,
  gridTextLineGap: 2,
  gridIconBgType: 'frosted',
  gridIconBgColor: '#ffffff',
  boardAlwaysShowIcons: false,
  boardIconSize: 18,
  boardSiteFontSize: 13,
  boardIconTextGap: 8,
  listCardWidth: 200,
  listCardHeight: 50,
  listIconSize: 40,
  listTitleFontSize: 16,
  listDescFontSize: 14,
  listCategoryFontSize: 18,
  listGapX: 10,
  listGapY: 12,
  listIconTextGap: 10,
  listCardOpacity: 0.25,
  listShowCardBackground: true,
  listIconBgType: 'frosted',
  listIconBgColor: '#ffffff',
  freeLayoutAllowOverlap: true,
  freeLayoutSnapGrid: 0,
  unsplashActiveTab: 'nature',
  unsplashKeywords: ['nature', 'landscape'],
  gradientLastValue: PRESET_GRADIENTS[0].value,
  updatedAt: 0,
};

export const DEFAULT_WEBDAV_CONFIG: WebdavConfig = {
  enabled: false,
  url: '',
  username: '',
  password: '',
  syncPath: '/mytab/MyTab-Backup.json',
  autoSync: false,
  conflictStrategy: 'merge',
};

export const DEFAULT_GIT_PLATFORM_CONFIG: GitPlatformConfig = {
  mode: 'repo',
  gistId: '',
  owner: '',
  repo: '',
  branch: 'main',
  path: 'mytab-backup.json',
  token: '',
};

export const DEFAULT_GIT_CONFIG: GitSyncConfig = {
  enabled: false,
  provider: 'github',
  autoSync: false,
  providers: {
    github: { ...DEFAULT_GIT_PLATFORM_CONFIG },
    gitee: { ...DEFAULT_GIT_PLATFORM_CONFIG, branch: 'master' },
  },
  mode: 'repo',
  gistId: '',
  owner: '',
  repo: '',
  branch: 'main',
  path: 'mytab-backup.json',
  token: '',
};

/**
 * Detects if the current effective theme is light mode.
 * Accurately handles 'light', 'dark', and 'system' with fallback to HTML class and media query.
 */
export function isLightMode(mode?: string): boolean {
  if (mode === 'light') return true;
  if (mode === 'dark') return false;
  // When mode is 'system' or omitted, query the operating system preference directly
  if (typeof window !== 'undefined' && window.matchMedia) {
    return !window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  // SSR or fallback check
  if (typeof document !== 'undefined' && document.documentElement) {
    if (document.documentElement.classList.contains('light')) return true;
    if (document.documentElement.classList.contains('dark')) return false;
  }
  return false;
}

/**
 * Resolves the target URL for a site according to the current network mode (WAN vs LAN).
 * Gracefully falls back to the other URL if the preferred one is not set.
 */
export function resolveSiteUrl(site: SiteItem, networkMode: 'wan' | 'lan' = 'wan'): string {
  if (networkMode === 'lan') {
    return site.urlLan?.trim() || site.url?.trim() || '';
  }
  return site.url?.trim() || site.urlLan?.trim() || '';
}

/**
 * Bootstrap Breakpoint System for Responsive Icon & Grid Scaling:
 * - xxl (>= 1400px): default icon size ~65px
 * - xl (1200px - 1399px): default icon size ~60px
 * - lg (992px - 1199px): default icon size ~55px
 * - md (768px - 991px): default icon size ~50px
 * - sm (576px - 767px): default icon size ~48px
 * - xs (< 576px): default icon size ~45px
 */
export type BootstrapBreakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

export interface BootstrapBreakpointConfig {
  name: BootstrapBreakpoint;
  minWidth: number;
  maxWidth?: number;
  defaultIconSize: number;
  cellHeight: number;
  scaleFactor: number;
}

export const BOOTSTRAP_BREAKPOINTS: Record<BootstrapBreakpoint, BootstrapBreakpointConfig> = {
  xxl: {
    name: 'xxl',
    minWidth: 1400,
    defaultIconSize: 65,
    cellHeight: 22,
    scaleFactor: 1.0,
  },
  xl: {
    name: 'xl',
    minWidth: 1200,
    maxWidth: 1399,
    defaultIconSize: 60,
    cellHeight: 20,
    scaleFactor: 60 / 65,
  },
  lg: {
    name: 'lg',
    minWidth: 992,
    maxWidth: 1199,
    defaultIconSize: 55,
    cellHeight: 19,
    scaleFactor: 55 / 65,
  },
  md: {
    name: 'md',
    minWidth: 768,
    maxWidth: 991,
    defaultIconSize: 50,
    cellHeight: 18,
    scaleFactor: 50 / 65,
  },
  sm: {
    name: 'sm',
    minWidth: 576,
    maxWidth: 767,
    defaultIconSize: 48,
    cellHeight: 17,
    scaleFactor: 48 / 65,
  },
  xs: {
    name: 'xs',
    minWidth: 0,
    maxWidth: 575,
    defaultIconSize: 45,
    cellHeight: 16,
    scaleFactor: 45 / 65,
  },
};

export function getBootstrapBreakpoint(width: number): BootstrapBreakpointConfig {
  if (width >= 1400) return BOOTSTRAP_BREAKPOINTS.xxl;
  if (width >= 1200) return BOOTSTRAP_BREAKPOINTS.xl;
  if (width >= 992) return BOOTSTRAP_BREAKPOINTS.lg;
  if (width >= 768) return BOOTSTRAP_BREAKPOINTS.md;
  if (width >= 576) return BOOTSTRAP_BREAKPOINTS.sm;
  return BOOTSTRAP_BREAKPOINTS.xs;
}

export function getEffectiveIconSize(
  viewportWidth: number,
  settings: { gridIconSize?: number; iconSizeRatio?: number }
): number {
  if (settings.gridIconSize !== undefined) {
    return Math.max(20, settings.gridIconSize);
  }
  if (settings.iconSizeRatio !== undefined && settings.iconSizeRatio !== 0.60) {
    const customBaseline = Math.round(65 * (settings.iconSizeRatio / 0.60));
    return Math.max(20, customBaseline);
  }
  const bp = getBootstrapBreakpoint(viewportWidth);
  return bp.defaultIconSize;
}

/**
 * Calculates whether a hex color string is dark (perceived luminance < 140).
 */
export function isColorDark(color?: string): boolean {
  if (!color || typeof color !== 'string') return false;
  const hex = color.trim().replace(/^#/, '');
  if (hex.length === 3) {
    const r = parseInt(hex[0] + hex[0], 16);
    const g = parseInt(hex[1] + hex[1], 16);
    const b = parseInt(hex[2] + hex[2], 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) < 140;
  }
  if (hex.length === 6) {
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) < 140;
  }
  return false;
}

export interface EffectiveIconBgResult {
  type: IconBgType;
  className: string;
  style: React.CSSProperties;
}

export function getEffectiveIconBg(
  site: Partial<SiteItem> | undefined,
  settings: Partial<ThemeSettings> | undefined,
  isLight: boolean,
  mode: 'grid' | 'list' = 'grid'
): EffectiveIconBgResult {
  const globalType: IconBgType = (mode === 'list'
    ? (settings?.listIconBgType || 'frosted')
    : (settings?.gridIconBgType || 'frosted'));

  const globalColor = (mode === 'list'
    ? (settings?.listIconBgColor || '#ffffff')
    : (settings?.gridIconBgColor || '#ffffff'));

  const siteType = site?.iconBgType;
  const effectiveType: IconBgType = (siteType && siteType !== 'inherit')
    ? siteType
    : globalType;

  const customColor = (siteType && siteType !== 'inherit' && site?.iconBgColor)
    ? site.iconBgColor
    : globalColor;

  if (effectiveType === 'white') {
    return {
      type: 'white',
      className: 'bg-white border border-black/[0.08] shadow-md shadow-black/15 group-hover:shadow-xl group-hover:border-black/15 transition-all',
      style: { backgroundColor: '#ffffff' },
    };
  }

  if (effectiveType === 'dark') {
    return {
      type: 'dark',
      className: 'bg-slate-900 border border-white/15 shadow-md shadow-black/40 group-hover:bg-slate-800 group-hover:border-white/25 transition-all',
      style: { backgroundColor: '#0f172a' },
    };
  }

  if (effectiveType === 'transparent') {
    return {
      type: 'transparent',
      className: 'bg-transparent border border-transparent shadow-none transition-all',
      style: { backgroundColor: 'transparent' },
    };
  }

  if (effectiveType === 'custom') {
    return {
      type: 'custom',
      className: 'border shadow-md transition-all',
      style: {
        backgroundColor: customColor,
        borderColor: isLight ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.20)',
      },
    };
  }

  // Default: 'frosted'
  return {
    type: 'frosted',
    className: isLight
      ? 'bg-white/85 border border-black/[0.08] shadow-md shadow-black/10 group-hover:bg-white group-hover:shadow-xl group-hover:border-black/20 group-active:bg-white/95 backdrop-blur-md transition-all'
      : 'bg-white/[0.14] border border-white/15 shadow-md shadow-black/30 group-hover:bg-white/[0.25] group-hover:border-white/35 group-active:bg-white/[0.30] backdrop-blur-md transition-all',
    style: {},
  };
}
