import { Category, SiteItem, SearchEngine, ThemeSettings, WebdavConfig, GitSyncConfig } from '../types';

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
  { id: 'all', name: '全部', sortOrder: 0, isDefault: true },
  { id: 'work', name: '工作与开发', sortOrder: 1 },
  { id: 'tools', name: '常用工具', sortOrder: 2 },
  { id: 'media', name: '设计与灵感', sortOrder: 3 },
];

export const DEFAULT_SITES: SiteItem[] = [
  {
    id: 'site-github',
    title: 'GitHub',
    url: 'https://github.com',
    icon: 'https://github.githubassets.com/favicons/favicon.png',
    categoryId: 'work',
    sortOrder: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'site-google',
    title: 'Google',
    url: 'https://www.google.com',
    icon: 'https://www.google.com/favicon.ico',
    categoryId: 'tools',
    sortOrder: 1,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'site-v2ex',
    title: 'V2EX',
    url: 'https://www.v2ex.com',
    icon: 'https://www.v2ex.com/static/favicon.ico',
    categoryId: 'work',
    sortOrder: 2,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'site-bilibili',
    title: '哔哩哔哩',
    url: 'https://www.bilibili.com',
    icon: 'https://www.bilibili.com/favicon.ico',
    categoryId: 'media',
    sortOrder: 3,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'site-zhihu',
    title: '知乎',
    url: 'https://www.zhihu.com',
    icon: 'https://static.zhihu.com/heifetz/favicon.ico',
    categoryId: 'media',
    sortOrder: 4,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'site-weibo',
    title: '微博',
    url: 'https://weibo.com',
    icon: 'https://weibo.com/favicon.ico',
    categoryId: 'media',
    sortOrder: 5,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
];

export const PRESET_GRADIENTS = [
  { name: '极光暮色 (默认)', value: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #311042 100%)' },
  { name: '赛博深蓝', value: 'linear-gradient(135deg, #090d16 0%, #101f3c 60%, #0d2847 100%)' },
  { name: '暗影森野', value: 'linear-gradient(135deg, #061712 0%, #0d281e 60%, #16382b 100%)' },
  { name: '薄暮落日', value: 'linear-gradient(135deg, #2b1055 0%, #591a75 50%, #b0445d 100%)' },
  { name: '晨曦暖光 (明亮)', value: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)' },
  { name: '春樱柔粉 (明亮)', value: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fbcfe8 100%)' },
];

export const DEFAULT_SETTINGS: ThemeSettings = {
  mode: 'dark',
  backgroundType: 'custom',
  backgroundValue: './wallpapers/default-wallpaper.jpg',
  cardBlur: 16,
  cardOpacity: 0.30, // 默认卡片透明度 30%
  cardSize: 110,     // 默认卡片大小 110px
  iconSizeRatio: 0.42, // 默认图标占比 42%
  maxCardsPerRow: 8, // 默认每行最多 8 个卡片
  activeEngineId: 'google',
  openInNewTab: true,
  showClock: true,
  showGreeting: true,
  showDate: true,
  language: 'zh-CN',
  updatedAt: 0,
};

export const DEFAULT_WEBDAV_CONFIG: WebdavConfig = {
  enabled: false,
  url: '',
  username: '',
  password: '',
  syncPath: '/mytab/sync.json',
  autoSync: false,
  conflictStrategy: 'merge',
};

export const DEFAULT_GIT_CONFIG: GitSyncConfig = {
  enabled: false,
  provider: 'github',
  mode: 'gist',
  gistId: '',
  owner: '',
  repo: '',
  branch: 'main',
  path: 'mytab-backup.json',
  token: '',
  autoSync: false,
};
