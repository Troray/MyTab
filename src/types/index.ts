export interface BookmarkSourceMeta {
  sourceId?: string;
  path?: string[];
  addDate?: number;
  importSource: 'browser_api' | 'html_file';
}

export interface GridPage {
  id: string;
  name: string;
  sortOrder: number;
}

export interface SiteItem {
  id: string;
  title: string;
  url: string;
  icon?: string;
  categoryId: string;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
  bookmark?: BookmarkSourceMeta;
  pageId?: string;
}

export interface Category {
  id: string;
  name: string;
  sortOrder: number;
  color?: string;
  isDefault?: boolean;
  showInAll?: boolean;
  createdAt?: number;
  updatedAt?: number;
  pageId?: string;
  bookmarkSource?: {
    folderId?: string;
    path?: string[];
  };
}

export interface SearchEngine {
  id: string;
  name: string;
  urlPattern: string; // e.g. 'https://www.google.com/search?q=%s'
  icon?: string;
}

export type ThemeMode = 'system' | 'dark' | 'light';
export type BackgroundType = 'gradient' | 'bing' | 'unsplash' | 'custom' | 'color';
export type TextColorMode = 'auto' | 'light' | 'dark' | 'custom';

export interface CustomTextColors {
  clock?: string;
  date?: string;
  greeting?: string;
  search?: string;
  tabs?: string;
  cards?: string;
  boardText?: string;
  boardTitle?: string;
}

import { Locale } from '../locales';

export interface CustomGreetings {
  morning?: string[];
  noon?: string[];
  afternoon?: string[];
  evening?: string[];
  night?: string[];
}

export interface ThemeSettings {
  mode: ThemeMode;
  layoutMode?: 'grid' | 'board';
  backgroundType: BackgroundType;
  backgroundValue: string;
  cardBlur?: number; // 废弃：保留可选兼容旧版存储
  cardOpacity: number; // 0.1 ~ 1.0 (default 0.2)
  cardSize: number; // in px or scale: e.g. 90 ~ 160 (default 110)
  iconSizeRatio?: number; // 0.28 ~ 0.68, default 0.42
  maxCardsPerRow?: number; // e.g. 4 ~ 12 (default 8)
  activeEngineId: string;
  openInNewTab: boolean;
  timeFormat?: '12h' | '24h';
  showSearch: boolean;
  showClock: boolean;
  showGreeting: boolean;
  showDate: boolean;
  showLunar?: boolean;
  showCardBackground?: boolean;
  showSiteTitle?: boolean;
  showCategories?: boolean;
  maxNavCategories?: number; // Max categories shown on navbar before folding to 'More' (0 means unlimited, default 6)
  iconSpacing?: number; // Spacing/compactness between icons in icon-only mode (8 ~ 48px, default 20)
  boardColumnsPerRow?: number; // Board view columns per row (2 ~ 8, default 5)
  boardCardGap?: number; // Board view gap between cards (8 ~ 32px, default 16)
  boardTitleAlign?: 'left' | 'center' | 'right'; // Board category title alignment (default 'left')
  boardTitleSize?: number; // Board category title font size (12 ~ 22px, default 15)
  boardItemSpacing?: number; // Board site item vertical spacing (2 ~ 14px, default 6)
  boardShowCardBackground?: boolean; // Board view show card background (default true)
  boardCardOpacity?: number; // Board view card opacity (0.05 ~ 0.95, default 0.20)
  boardAlign?: 'left' | 'center' | 'right'; // Board view column alignment when columns are fewer than max (default 'left')
  language: Locale;
  textColorMode?: TextColorMode;
  customTextColors?: CustomTextColors;
  textColorModeLight?: TextColorMode;
  customTextColorsLight?: CustomTextColors;
  textColorModeDark?: TextColorMode;
  customTextColorsDark?: CustomTextColors;
  customGreetings?: CustomGreetings;
  unsplashAccessKey?: string;
  unsplashActiveTab?: string;
  unsplashKeywords?: string[];
  unsplashCustomQuery?: string;
  unsplashAuthorName?: string;
  unsplashAuthorUrl?: string;
  unsplashLastUrl?: string;
  customBackgroundUrl?: string;
  gradientLastValue?: string;
  updatedAt?: number;
}

export type ConflictStrategy = 'local' | 'remote' | 'merge';

export interface WebdavConfig {
  enabled: boolean;
  url: string;
  username: string;
  password?: string;
  syncPath: string; // e.g. '/mytab/MyTab-Backup.json'
  autoSync: boolean;
  lastSyncTime?: number;
  lastSyncStatus?: 'success' | 'failed' | 'in_progress';
  lastSyncError?: string;
  conflictStrategy: ConflictStrategy;
}

export type GitProvider = 'github' | 'gitee';
export type GitSyncMode = 'gist' | 'repo';

export interface GitPlatformConfig {
  mode?: GitSyncMode;
  gistId?: string;
  owner: string;
  repo: string;
  branch: string;
  path: string;
  token: string;
  lastSyncTime?: number;
  lastSyncStatus?: 'success' | 'failed' | 'in_progress';
  lastSyncError?: string;
}

export interface GitSyncConfig {
  enabled: boolean;
  provider: GitProvider;
  autoSync: boolean;
  providers?: {
    github?: GitPlatformConfig;
    gitee?: GitPlatformConfig;
  };
  // Active provider properties (for backward compatibility & direct access)
  mode?: GitSyncMode; // 'repo' (default) or 'gist'
  gistId?: string; // Gist ID for gist mode
  owner: string;
  repo: string;
  branch: string;
  path: string; // e.g. 'mytab-backup.json'
  token: string;
  lastSyncTime?: number;
  lastSyncStatus?: 'success' | 'failed' | 'in_progress';
  lastSyncError?: string;
}

export type ProfileId = 'normal' | 'private';

export interface WallpaperSettings {
  backgroundType?: BackgroundType;
  backgroundValue?: string;
  customBackgroundUrl?: string;
  unsplashAccessKey?: string;
  unsplashActiveTab?: string;
  unsplashKeywords?: string[];
  unsplashCustomQuery?: string;
  unsplashAuthorName?: string;
  unsplashAuthorUrl?: string;
  unsplashLastUrl?: string;
  textColorMode?: TextColorMode;
  customTextColors?: CustomTextColors;
  textColorModeLight?: TextColorMode;
  customTextColorsLight?: CustomTextColors;
  textColorModeDark?: TextColorMode;
  customTextColorsDark?: CustomTextColors;
}

export interface ProfileData {
  sites: SiteItem[];
  categories: Category[];
  activeCategoryId: string;
  gridPages?: GridPage[];
  settings?: Partial<ThemeSettings>;
  wallpaper?: WallpaperSettings;
}

export interface ProfileContainer {
  version: number;
  profiles: Record<ProfileId, ProfileData>;
}

export interface ProfileSyncSettings {
  normal: boolean;
  private: boolean;
}

export interface SyncPayload {
  version: number;
  timestamp: number;
  profiles?: Partial<Record<ProfileId, ProfileData>>;
  categories?: Category[]; // V1 backward compatibility
  sites?: SiteItem[];      // V1 backward compatibility
  gridPages?: GridPage[];
  settings: ThemeSettings;
}

export interface AppState {
  profileId: ProfileId;
  categories: Category[];
  sites: SiteItem[];
  gridPages?: GridPage[];
  activeGridPageId?: string;
  settings: ThemeSettings;
  webdav: WebdavConfig;
  git: GitSyncConfig;
  syncSettings: ProfileSyncSettings;
  activeCategoryId: string;
  isFirstLaunch: boolean;
  hasCustomSettings?: boolean;
  hasCustomWallpaper?: boolean;
}

export type BookmarkOrganizeStrategy = 'smart' | 'top_level' | 'deepest_leaf';
export type BookmarkDuplicateStrategy = 'skip' | 'overwrite' | 'keep_both';

export interface RawBookmarkNode {
  id: string;
  title: string;
  url?: string;
  icon?: string;
  children?: RawBookmarkNode[];
  dateAdded?: number;
}

export interface BookmarkImportOptions {
  strategy: BookmarkOrganizeStrategy;
  duplicateStrategy: BookmarkDuplicateStrategy;
  selectedFolderIds: string[];
  targetProfileId: ProfileId;
}

export interface BookmarkImportPreviewCategory {
  name: string;
  originalPath: string[];
  siteCount: number;
  sampleSites: Array<{ title: string; url: string }>;
}

export interface BookmarkImportPreviewStats {
  totalUrls: number;
  validUrls: number;
  duplicateUrls: number;
  ignoredFolders: number;
  predictedCategories: BookmarkImportPreviewCategory[];
}

export interface BookmarkImportResult {
  success: boolean;
  importedSitesCount: number;
  importedCategoriesCount: number;
  skippedDuplicatesCount: number;
  error?: string;
}



