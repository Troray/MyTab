export interface SiteItem {
  id: string;
  title: string;
  url: string;
  icon?: string;
  categoryId: string;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
}

export interface Category {
  id: string;
  name: string;
  sortOrder: number;
  isDefault?: boolean;
}

export interface SearchEngine {
  id: string;
  name: string;
  urlPattern: string; // e.g. 'https://www.google.com/search?q=%s'
  icon?: string;
}

export type ThemeMode = 'system' | 'dark' | 'light';
export type BackgroundType = 'gradient' | 'bing' | 'unsplash' | 'custom' | 'color';

import { Locale } from '../locales';

export interface ThemeSettings {
  mode: ThemeMode;
  backgroundType: BackgroundType;
  backgroundValue: string;
  cardBlur: number; // in px, e.g. 16
  cardOpacity: number; // 0.1 ~ 1.0 (default 0.3)
  cardSize: number; // in px or scale: e.g. 90 ~ 160 (default 110)
  iconSizeRatio?: number; // 0.28 ~ 0.68, default 0.42
  maxCardsPerRow?: number; // e.g. 4 ~ 12 (default 8)
  activeEngineId: string;
  openInNewTab: boolean;
  showClock: boolean;
  showGreeting: boolean;
  showDate: boolean;
  language: Locale;
  updatedAt?: number;
}

export type ConflictStrategy = 'local' | 'remote' | 'merge';

export interface WebdavConfig {
  enabled: boolean;
  url: string;
  username: string;
  password?: string;
  syncPath: string; // e.g. '/mytab/sync.json'
  autoSync: boolean;
  lastSyncTime?: number;
  lastSyncStatus?: 'success' | 'failed' | 'in_progress';
  lastSyncError?: string;
  conflictStrategy: ConflictStrategy;
}

export type GitProvider = 'github' | 'gitee';

export interface GitSyncConfig {
  enabled: boolean;
  provider: GitProvider;
  owner: string;
  repo: string;
  branch: string;
  path: string; // e.g. 'mytab-backup.json'
  token: string;
  autoSync: boolean;
  lastSyncTime?: number;
  lastSyncStatus?: 'success' | 'failed' | 'in_progress';
  lastSyncError?: string;
}

export interface SyncPayload {
  version: number;
  timestamp: number;
  categories: Category[];
  sites: SiteItem[];
  settings: ThemeSettings;
}

export interface AppState {
  categories: Category[];
  sites: SiteItem[];
  settings: ThemeSettings;
  webdav: WebdavConfig;
  git: GitSyncConfig;
  activeCategoryId: string;
  isFirstLaunch: boolean;
}
