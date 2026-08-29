import { Category, SiteItem, SearchEngine, ThemeSettings, WebdavConfig, GitSyncConfig, GitPlatformConfig } from '../types';

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
    title: '微博',
    url: 'https://weibo.com',
    icon: 'data:image/png;base64,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',
    categoryId: 'media',
    sortOrder: 2,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'site-bilibili',
    title: '哔哩哔哩',
    url: 'https://www.bilibili.com',
    icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAACVklEQVRYR+1WQWsTQRT+3jamKYqnCrb1IiKbBKGeVLwVT4meA0JMxJSiB+tv0YtSFJoYEHLW5mZvam8qks3Sgxdte/CiKGk02fFNN2mycbu7A2NrwTktu99873vfzrz3CAe8yDf+qojhU/MxHGRB4iWMIwvIn/2mpLW6fhzOryWAroDwAqeS85ijziiHv4CyVQTE8i6Y6BWMWCayiJ3gnTqEuDwISDdRTJUjCmjeApwnHnBUEb7BmYmMeRSSXk752tfWmohju7nqzUCi2YlEPIvcma+++/YMLvcl55Cjn9EckKhAMh8RqviekoEDO1nbtznr63zwzkHgmNKhCwMTvkPQB3bxGRLmo74broCaPYNW9zk/nQ/j0fT9LSbGriFnfibIzFvW2j4Gd3MgeofJ2EVC2brLV+6BpswUaWhRCnjNAi4N7azDQAk30puKbMHwp40pLmzyGmaGasMbQqXR5gMX331pYFp78D65K2JjSECbHWgIj/Ri2r826LJjJN4hEFC1M3B6ZdkwSsib9UAzwvDKDlSsDS5OU72rs4lCajpQQBheWYDqGQnDHz4Bw5YCWyim3d+x1wrDKztQsbMQXS4g1OWevoCCuRIsIASvLEDX/e/z/Bfw7zmwn82o9vEkWq1Bl+Up6c92TFhBYqKE3OktredPTl3b3SXuvNmRdtxchHDuaw0WlYyMe5zv+ji+dNa43s9G3acHR+9xInbhYIZSOQ8mjKvuUNpfcjht23fYiTyPaCn+V0f1ZNpjIfzgamrxMFrFuPnQO5ZrjaRG9nfHrwhafgPirzkOAcnEFwAAAABJRU5ErkJggg==',
    categoryId: 'media',
    sortOrder: 3,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'site-youtube',
    title: 'YouTube',
    url: 'https://youtube.com',
    icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAAAMFBMVEVHcEz/ADP/ADP/ADP/ADP/ADP/ADP/ADP/ADP/////hpT/2uH/Smj/s8D/JEv/b4eB3bNwAAAACHRSTlMAQB+z1GXri3bBstgAAAKRSURBVHic7ZrpduMwCIUrGW1xMn3/t602J25s59RARGeG+zd1+Y4QaLsfHyqVSqVSqVSqv0C2yCxyxh0r/9pVP7L4kKaGCSFMVTBBke+KO/Jx+bX+af6kKP+HUMnMD2mscSVmC7YXB6UKVXCceYlhQonLFnYXBSCYo/DTW0OvNO0h2GHhK8ImE/a9I7+RfxoEMzj+M4GB0fFjhBXB2PwvWs2DIBE/xiCZgKJ7EoQGIEbXZ4DQAOQhaLPASMWP0chmoOdApgabghWdAn0SWLn4MVrZOdhmoZMEcLJF0LqxYBHkBSkDCBZBLoMMMHwrspbPAJLxY0S1geuVD8Bi2sBlvv2RBUgpfTIBGEwfKgBp5smDQwOkdONAcJhG2AHSfKEjBApAQaADIDrxA4Ceh4kKkIglSQcg5mHCrEVPAKSSBBaAPBWweeACSOmCQwDMarwLkOZPDILnA8h5QCwQHrMdOALIJXl+NrICYEqSGeB8SbIDnC3JNwCcGwR+gJOLAzvA2UL4t6pgRvRj1k6IWBQZW/HtilsLuFZD5EGBazlGb4qAYUtG2pmy7AkpxzSGXTFyK8QFQD8XkE5GmD3Qd5GOZrhd4DMA/nRMS34X/nh+Y4heAXA3JKTSW8vg7ojIp/K7rPwtmfg9ofxNqfhdsfhtufh7gfiLifibkeSrmf8d74bSL6fib8fyr+dyOVhcJNIOCjkPyd1GI9QMlwH4BT4ikWYE3/xso71sWzfbcDfd1lk5tBjDJnydioNGwe86KitCmADeSuEBpkNPaWMwzcsLnPbWbqotDt/XrtoHRjUyd2dx9xYDPKzFR3EWU3HzFN9Nxa4ZnX8UeheneavX9upXst1VXT5Dx1SpVCqVSqX6j/QFgvdUtSxW0v0AAAAASUVORK5CYII=',
    categoryId: 'media',
    sortOrder: 4,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
];

export const PRESET_GRADIENTS = [
  { name: '极光暮色', value: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #311042 100%)' },
  { name: '黑耀星环', value: 'conic-gradient(from 90deg, #05050a 0.000deg, #090a0e 30.000deg, #0d0e12 60.000deg, #121316 90.000deg, #16171a 120.000deg, #1a1b1e 150.000deg, #1e1f22 180.000deg, #222326 210.000deg, #26272a 240.000deg, #292a2d 270.000deg, #2c2d30 300.000deg, #2e2f33 330.000deg, #303135 360.000deg)' },
  { name: '深空灰烬', value: 'linear-gradient(135deg, #292832 0.000%, #272530 8.333%, #24222e 16.667%, #201f2b 25.000%, #1c1b27 33.333%, #181624 41.667%, #141220 50.000%, #100e1c 58.333%, #0c0a18 66.667%, #080614 75.000%, #050311 83.333%, #02000e 91.667%, #00000b 100.000%)' },
  { name: '赛博幻梦', value: 'linear-gradient(135deg, #ff00cc, #333399)' },
  { name: '霓虹都市', value: 'linear-gradient(135deg, #3a1c71, #d76d77, #ffaf7b)' },
  { name: '静谧深渊', value: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)' },
  { name: '月见琉璃', value: 'linear-gradient(135deg, #1e3c72, #2a5298)' },
  { name: '星云紫霭', value: 'linear-gradient(135deg, #4b1248, #f0c27b)' },
  { name: '暗影森野', value: 'linear-gradient(135deg, #061712 0%, #0d281e 60%, #16382b 100%)' },
  { name: '晨曦暖光', value: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)' },
];

export const DEFAULT_SETTINGS: ThemeSettings = {
  mode: 'dark',
  backgroundType: 'custom',
  backgroundValue: './wallpapers/default-wallpaper.jpg',
  cardBlur: 50,      // 默认毛玻璃模糊度 50%
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
  unsplashActiveTab: 'nature',
  unsplashKeywords: ['nature', 'landscape'],
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
