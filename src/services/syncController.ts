import type {
  Category,
  ConflictStrategy,
  GridPage,
  ProfileContainer,
  ProfileData,
  ProfileId,
  ProfileSyncSettings,
  SiteItem,
  SyncPayload,
  ThemeSettings,
} from '../types';

import { DEFAULT_SETTINGS, DEFAULT_GRID_PAGES } from '../utils/constants';

export const SYNC_PAYLOAD_VERSION = 2;

/**
 * Safely parses numeric sort order avoiding NaN.
 */
function getSortOrder(item: { sortOrder?: number | string | null }): number {
  if (typeof item.sortOrder === 'number' && !Number.isNaN(item.sortOrder)) {
    return item.sortOrder;
  }
  const parsed = Number(item.sortOrder);
  return Number.isNaN(parsed) ? 0 : parsed;
}

/**
 * Normalizes a URL for deduplication comparison.
 */
function normalizeUrlForDedupe(u?: string): string {
  if (!u) return '';
  try {
    const parsed = new URL(u);
    return (parsed.origin + parsed.pathname.replace(/\/+$/, '')).toLowerCase();
  } catch {
    return (u || '').trim().toLowerCase().replace(/\/+$/, '');
  }
}

/**
 * Merges two lists of sites based on updatedAt timestamp and URL-level deduplication.
 * Defends against duplicate shortcuts on the same desktop page/category.
 */
export function mergeSites(localSites: SiteItem[] = [], remoteSites: SiteItem[] = []): SiteItem[] {
  const safeLocal = Array.isArray(localSites) ? localSites : [];
  const safeRemote = Array.isArray(remoteSites) ? remoteSites : [];
  const map = new Map<string, SiteItem>();
  const urlToIdMap = new Map<string, string>();

  const getDedupeKey = (s: SiteItem) => {
    const normUrl = normalizeUrlForDedupe(s.url);
    if (!normUrl) return '';
    const catId = s.categoryId || 'work';
    const pageId = s.pageId || 'page-1';
    return `${normUrl}::${catId}::${pageId}`;
  };

  for (const s of safeLocal) {
    if (!s || typeof s !== 'object' || !s.id || typeof s.id !== 'string') continue;
    map.set(s.id, s);
    const key = getDedupeKey(s);
    if (key) {
      urlToIdMap.set(key, s.id);
    }
  }

  for (const s of safeRemote) {
    if (!s || typeof s !== 'object' || !s.id || typeof s.id !== 'string') continue;
    const existingById = map.get(s.id);
    if (existingById) {
      if ((s.updatedAt || 0) > (existingById.updatedAt || 0)) {
        map.set(s.id, s);
      }
      continue;
    }

    // Deduplicate sites with identical URL in the same category and same desktop page
    const key = getDedupeKey(s);
    const duplicateId = key ? urlToIdMap.get(key) : undefined;
    if (duplicateId && map.has(duplicateId)) {
      const duplicate = map.get(duplicateId)!;
      // Overwrite if remote is newer or local is an unedited default template site
      if ((s.updatedAt || 0) > (duplicate.updatedAt || 0) || duplicateId.startsWith('site-')) {
        map.set(duplicateId, {
          ...duplicate,
          ...s,
          id: duplicateId,
        });
      }
      continue;
    }

    map.set(s.id, s);
    if (key) {
      urlToIdMap.set(key, s.id);
    }
  }

  return Array.from(map.values()).sort((a, b) => {
    const orderDiff = getSortOrder(a) - getSortOrder(b);
    if (orderDiff !== 0) return orderDiff;
    return (a.id || '').localeCompare(b.id || '');
  });
}

/**
 * Merges two lists of categories preserving order, union, and latest timestamp updates.
 * Defends against null/undefined lists or corrupted entries.
 */
export function mergeCategories(localCats: Category[] = [], remoteCats: Category[] = []): Category[] {
  const safeLocal = Array.isArray(localCats) ? localCats : [];
  const safeRemote = Array.isArray(remoteCats) ? remoteCats : [];
  const map = new Map<string, Category>();

  for (const c of safeLocal) {
    if (!c || typeof c !== 'object' || !c.id || typeof c.id !== 'string') continue;
    map.set(c.id, c);
  }

  for (const c of safeRemote) {
    if (!c || typeof c !== 'object' || !c.id || typeof c.id !== 'string') continue;
    const existing = map.get(c.id);
    if (!existing) {
      map.set(c.id, c);
    } else {
      if ((c.updatedAt || 0) > (existing.updatedAt || 0)) {
        map.set(c.id, c);
      }
    }
  }

  return Array.from(map.values()).sort((a, b) => {
    const orderDiff = getSortOrder(a) - getSortOrder(b);
    if (orderDiff !== 0) return orderDiff;
    return (a.id || '').localeCompare(b.id || '');
  });
}

/**
 * Merges two lists of grid pages preserving order and unique desktop IDs.
 * Defends against empty lists by falling back to DEFAULT_GRID_PAGES.
 */
export function mergeGridPages(localPages: GridPage[] = [], remotePages: GridPage[] = []): GridPage[] {
  const safeLocal = Array.isArray(localPages) && localPages.length > 0 ? localPages : DEFAULT_GRID_PAGES;
  const safeRemote = Array.isArray(remotePages) && remotePages.length > 0 ? remotePages : [];

  if (safeRemote.length === 0) return safeLocal;

  const map = new Map<string, GridPage>();
  for (const p of safeLocal) {
    if (p && p.id) map.set(p.id, p);
  }

  for (const p of safeRemote) {
    if (p && p.id) {
      const existing = map.get(p.id);
      if (!existing) {
        map.set(p.id, p);
      } else {
        map.set(p.id, {
          ...existing,
          ...p,
        });
      }
    }
  }

  const result = Array.from(map.values()).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  return result.length > 0 ? result : DEFAULT_GRID_PAGES;
}

const DEFAULT_EMPTY_CONTAINER: ProfileContainer = {
  version: SYNC_PAYLOAD_VERSION,
  profiles: {
    normal: { sites: [], categories: [], activeCategoryId: 'all', gridPages: DEFAULT_GRID_PAGES, activeGridPageId: 'page-1', pageCategoryMap: { 'page-1': 'all' } },
    private: { sites: [], categories: [], activeCategoryId: 'all', gridPages: DEFAULT_GRID_PAGES, activeGridPageId: 'page-1', pageCategoryMap: { 'page-1': 'all' } },
  },
};

/**
 * Builds a SyncPayload adhering to the user's ProfileSyncSettings policy.
 * - If policy.normal is false, normal profile is excluded.
 * - If policy.private is false, private profile is NEVER included (remains on device).
 */
export function buildSyncPayload(
  container: ProfileContainer,
  settings: ThemeSettings,
  syncPolicy: ProfileSyncSettings
): SyncPayload {
  const now = Date.now();
  const safeContainer: ProfileContainer =
    container && typeof container === 'object' && container.profiles
      ? container
      : DEFAULT_EMPTY_CONTAINER;

  const safeSettings: ThemeSettings =
    settings && typeof settings === 'object' ? settings : { ...DEFAULT_SETTINGS };

  const profilesPayload: Partial<Record<ProfileId, ProfileData>> = {};

  if (syncPolicy?.normal && safeContainer.profiles.normal) {
    const normalSites = Array.isArray(safeContainer.profiles.normal.sites)
      ? safeContainer.profiles.normal.sites
      : [];
    const normalCats = Array.isArray(safeContainer.profiles.normal.categories)
      ? safeContainer.profiles.normal.categories
      : [];

    profilesPayload.normal = {
      sites: [...normalSites],
      categories: [...normalCats],
      activeCategoryId: safeContainer.profiles.normal.activeCategoryId || 'all',
      gridPages: safeContainer.profiles.normal.gridPages && safeContainer.profiles.normal.gridPages.length > 0
        ? [...safeContainer.profiles.normal.gridPages]
        : [...DEFAULT_GRID_PAGES],
      activeGridPageId: safeContainer.profiles.normal.activeGridPageId || 'page-1',
      pageCategoryMap: safeContainer.profiles.normal.pageCategoryMap
        ? { ...safeContainer.profiles.normal.pageCategoryMap }
        : { 'page-1': 'all' },
    };
  }

  if (syncPolicy?.private && safeContainer.profiles.private) {
    const privateSites = Array.isArray(safeContainer.profiles.private.sites)
      ? safeContainer.profiles.private.sites
      : [];
    const privateCats = Array.isArray(safeContainer.profiles.private.categories)
      ? safeContainer.profiles.private.categories
      : [];

    profilesPayload.private = {
      sites: [...privateSites],
      categories: [...privateCats],
      activeCategoryId: safeContainer.profiles.private.activeCategoryId || 'all',
      gridPages: safeContainer.profiles.private.gridPages && safeContainer.profiles.private.gridPages.length > 0
        ? [...safeContainer.profiles.private.gridPages]
        : [...DEFAULT_GRID_PAGES],
      activeGridPageId: safeContainer.profiles.private.activeGridPageId || 'page-1',
      pageCategoryMap: safeContainer.profiles.private.pageCategoryMap
        ? { ...safeContainer.profiles.private.pageCategoryMap }
        : { 'page-1': 'all' },
      ...(safeContainer.profiles.private.settings ? { settings: { ...safeContainer.profiles.private.settings } } : {}),
      ...(safeContainer.profiles.private.wallpaper ? { wallpaper: { ...safeContainer.profiles.private.wallpaper } } : {}),
    };
  }

  const payload: SyncPayload = {
    version: SYNC_PAYLOAD_VERSION,
    timestamp: now,
    profiles: profilesPayload,
    settings: { ...safeSettings, updatedAt: safeSettings.updatedAt || now },
    // V1 backward compatibility for older clients
    categories: profilesPayload.normal?.categories || [],
    sites: profilesPayload.normal?.sites || [],
    gridPages: profilesPayload.normal?.gridPages || [...DEFAULT_GRID_PAGES],
  };

  return payload;
}

/**
 * Result of applying remote payload.
 */
export interface ApplyRemoteResult {
  updatedContainer: ProfileContainer;
  updatedSettings: ThemeSettings;
}

/**
 * Normalizes remote payload into a profile-based map.
 * Converts legacy V1 payloads (with top-level categories & sites) into profiles.normal.
 * Defends against malformed structures or missing array fields.
 */
function extractRemoteProfiles(remotePayload?: SyncPayload | null): Partial<Record<ProfileId, ProfileData>> {
  const result: Partial<Record<ProfileId, ProfileData>> = {};
  if (!remotePayload || typeof remotePayload !== 'object') {
    return result;
  }

  // If V2 profiles object exists:
  if (remotePayload.profiles && typeof remotePayload.profiles === 'object') {
    if (remotePayload.profiles.normal && typeof remotePayload.profiles.normal === 'object') {
      const norm = remotePayload.profiles.normal;
      result.normal = {
        sites: Array.isArray(norm.sites) ? norm.sites : [],
        categories: Array.isArray(norm.categories) ? norm.categories : [],
        activeCategoryId: norm.activeCategoryId || 'all',
        gridPages: Array.isArray(norm.gridPages) && norm.gridPages.length > 0 ? norm.gridPages : undefined,
        activeGridPageId: typeof norm.activeGridPageId === 'string' ? norm.activeGridPageId : undefined,
        pageCategoryMap: norm.pageCategoryMap && typeof norm.pageCategoryMap === 'object' ? { ...norm.pageCategoryMap } : undefined,
        ...(norm.settings ? { settings: { ...norm.settings } } : {}),
        ...(norm.wallpaper ? { wallpaper: { ...norm.wallpaper } } : {}),
      };
    }
    if (remotePayload.profiles.private && typeof remotePayload.profiles.private === 'object') {
      const priv = remotePayload.profiles.private;
      result.private = {
        sites: Array.isArray(priv.sites) ? priv.sites : [],
        categories: Array.isArray(priv.categories) ? priv.categories : [],
        activeCategoryId: priv.activeCategoryId || 'all',
        gridPages: Array.isArray(priv.gridPages) && priv.gridPages.length > 0 ? priv.gridPages : undefined,
        activeGridPageId: typeof priv.activeGridPageId === 'string' ? priv.activeGridPageId : undefined,
        pageCategoryMap: priv.pageCategoryMap && typeof priv.pageCategoryMap === 'object' ? { ...priv.pageCategoryMap } : undefined,
        ...(priv.settings ? { settings: { ...priv.settings } } : {}),
        ...(priv.wallpaper ? { wallpaper: { ...priv.wallpaper } } : {}),
      };
    }
  } else if (
    (remotePayload.sites && Array.isArray(remotePayload.sites)) ||
    (remotePayload.categories && Array.isArray(remotePayload.categories))
  ) {
    // V1 fallback: treat top-level sites & categories as normal profile
    result.normal = {
      sites: Array.isArray(remotePayload.sites) ? remotePayload.sites : [],
      categories: Array.isArray(remotePayload.categories) ? remotePayload.categories : [],
      activeCategoryId: 'all',
      gridPages: Array.isArray(remotePayload.gridPages) && remotePayload.gridPages.length > 0 ? remotePayload.gridPages : undefined,
    };
  }

  return result;
}

/**
 * Applies a remote sync payload onto the local ProfileContainer and ThemeSettings
 * according to the conflict strategy and local ProfileSyncSettings.
 *
 * CRITICAL SAFETY RULES:
 * 1. If syncPolicy.private is false, local private profile is NEVER overwritten or modified.
 * 2. If remote payload is V1, it ONLY affects normal profile (if syncPolicy.normal is true).
 * 3. Only enabled sync profiles participate in pull/merge/restore.
 */
export function applyRemotePayload(
  localContainer: ProfileContainer,
  localSettings: ThemeSettings,
  remotePayload: SyncPayload,
  syncPolicy: ProfileSyncSettings,
  strategy: ConflictStrategy
): ApplyRemoteResult {
  const safeLocalContainer: ProfileContainer =
    localContainer && typeof localContainer === 'object' && localContainer.profiles
      ? localContainer
      : DEFAULT_EMPTY_CONTAINER;

  const safeLocalSettings: ThemeSettings =
    localSettings && typeof localSettings === 'object' ? localSettings : { ...DEFAULT_SETTINGS };

  if (!remotePayload || typeof remotePayload !== 'object') {
    return {
      updatedContainer: safeLocalContainer,
      updatedSettings: safeLocalSettings,
    };
  }

  const remoteProfiles = extractRemoteProfiles(remotePayload);
  const updatedProfiles = { ...safeLocalContainer.profiles };

  const profilesToProcess: ProfileId[] = (['normal', 'private'] as ProfileId[]).filter(
    (pid) => syncPolicy && syncPolicy[pid] && remoteProfiles[pid]
  );

  for (const pid of profilesToProcess) {
    const local = safeLocalContainer.profiles[pid] || {
      sites: [],
      categories: [],
      activeCategoryId: 'all',
      gridPages: DEFAULT_GRID_PAGES,
      activeGridPageId: 'page-1',
      pageCategoryMap: { 'page-1': 'all' },
    };
    const remote = remoteProfiles[pid]!;

    if (strategy === 'remote') {
      const remoteSites = Array.isArray(remote.sites) ? remote.sites : (local.sites || []);
      const remoteCats = Array.isArray(remote.categories) ? remote.categories : (local.categories || []);
      const preferredCat = remote.activeCategoryId || local.activeCategoryId || 'all';
      const isValidCat = preferredCat === 'all' || remoteCats.some((c) => c && c.id === preferredCat);

      const remotePages = Array.isArray(remote.gridPages) && remote.gridPages.length > 0
        ? remote.gridPages
        : (local.gridPages && local.gridPages.length > 0 ? local.gridPages : DEFAULT_GRID_PAGES);
      const preferredPageId = remote.activeGridPageId || local.activeGridPageId || remotePages[0]?.id || 'page-1';
      const isValidPage = remotePages.some((p) => p && p.id === preferredPageId);
      const validRemotePageIds = new Set(remotePages.map((p) => p.id));
      const fallbackPageId = isValidPage ? preferredPageId : (remotePages[0]?.id || 'page-1');
      const cleanRemoteSites = remoteSites.map((s) => {
        if (!s.pageId || !validRemotePageIds.has(s.pageId)) {
          return { ...s, pageId: fallbackPageId };
        }
        return s;
      });
      const cleanRemoteCats = remoteCats.map((c) => {
        if (!c.pageId || !validRemotePageIds.has(c.pageId)) {
          return { ...c, pageId: fallbackPageId };
        }
        return c;
      });

      const mergedPageCategoryMap = {
        ...(local.pageCategoryMap || {}),
        ...(remote.pageCategoryMap || {}),
      };

      updatedProfiles[pid] = {
        sites: cleanRemoteSites,
        categories: cleanRemoteCats,
        activeCategoryId: isValidCat ? preferredCat : 'all',
        gridPages: remotePages,
        activeGridPageId: fallbackPageId,
        pageCategoryMap: mergedPageCategoryMap,
        settings: remote.settings !== undefined ? remote.settings : local.settings,
        wallpaper: remote.wallpaper !== undefined ? remote.wallpaper : local.wallpaper,
      };
    } else if (strategy === 'local') {
      // Local strategy keeps local data
      updatedProfiles[pid] = {
        ...local,
        gridPages: local.gridPages && local.gridPages.length > 0 ? local.gridPages : DEFAULT_GRID_PAGES,
        activeGridPageId: local.activeGridPageId || 'page-1',
        pageCategoryMap: local.pageCategoryMap || { 'page-1': 'all' },
      };
    } else {
      // 'merge' strategy
      const mergedSites = mergeSites(local.sites || [], remote.sites || []);
      const mergedCats = mergeCategories(local.categories || [], remote.categories || []);
      const preferredCat = local.activeCategoryId || remote.activeCategoryId || 'all';
      const isValidCat = preferredCat === 'all' || mergedCats.some((c) => c && c.id === preferredCat);

      const mergedPages = mergeGridPages(local.gridPages || DEFAULT_GRID_PAGES, remote.gridPages || []);
      const preferredPageId = local.activeGridPageId || remote.activeGridPageId || mergedPages[0]?.id || 'page-1';
      const isValidPage = mergedPages.some((p) => p && p.id === preferredPageId);
      const validMergedPageIds = new Set(mergedPages.map((p) => p.id));
      const fallbackPageId = isValidPage ? preferredPageId : (mergedPages[0]?.id || 'page-1');

      const cleanSites = mergedSites.map((s) => {
        if (!s.pageId || !validMergedPageIds.has(s.pageId)) {
          return { ...s, pageId: fallbackPageId };
        }
        return s;
      });
      const cleanCats = mergedCats.map((c) => {
        if (!c.pageId || !validMergedPageIds.has(c.pageId)) {
          return { ...c, pageId: fallbackPageId };
        }
        return c;
      });

      const mergedPageCategoryMap = {
        ...(local.pageCategoryMap || {}),
        ...(remote.pageCategoryMap || {}),
      };

      // Timestamp-based arbitration for private profile settings
      let mergedSettings = local.settings;
      if (remote.settings && !local.settings) {
        mergedSettings = remote.settings;
      } else if (remote.settings && local.settings) {
        const remoteUpdated = remote.settings.updatedAt || 0;
        const localUpdated = local.settings.updatedAt || 0;
        mergedSettings = remoteUpdated >= localUpdated ? remote.settings : local.settings;
      }

      // Wallpaper arbitration
      const mergedWallpaper = remote.wallpaper !== undefined ? remote.wallpaper : local.wallpaper;

      updatedProfiles[pid] = {
        sites: cleanSites,
        categories: cleanCats,
        activeCategoryId: isValidCat ? preferredCat : 'all',
        gridPages: mergedPages,
        activeGridPageId: fallbackPageId,
        pageCategoryMap: mergedPageCategoryMap,
        settings: mergedSettings,
        wallpaper: mergedWallpaper,
      };
    }
  }

  // Resolve ThemeSettings
  let updatedSettings = { ...safeLocalSettings };
  if (remotePayload.settings && typeof remotePayload.settings === 'object') {
    const localTime = safeLocalSettings.updatedAt || 0;
    const remoteTime = remotePayload.settings.updatedAt || remotePayload.timestamp || 0;

    const cleanRemoteSettings = Object.fromEntries(
      Object.entries(remotePayload.settings).filter(([_, v]) => v !== undefined && v !== null)
    );

    if (strategy === 'remote') {
      // Strict remote overwrite with fallback to defaults
      updatedSettings = { ...DEFAULT_SETTINGS, ...cleanRemoteSettings };
    } else if (strategy === 'merge' && remoteTime > localTime) {
      // Merge newer remote settings on top of current local settings
      updatedSettings = { ...DEFAULT_SETTINGS, ...safeLocalSettings, ...cleanRemoteSettings };
    }
  }

  return {
    updatedContainer: {
      version: SYNC_PAYLOAD_VERSION,
      profiles: updatedProfiles,
    },
    updatedSettings,
  };
}
