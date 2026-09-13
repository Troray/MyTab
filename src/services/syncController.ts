import type {
  Category,
  ConflictStrategy,
  ProfileContainer,
  ProfileData,
  ProfileId,
  ProfileSyncSettings,
  SiteItem,
  SyncPayload,
  ThemeSettings,
} from '../types';

import { DEFAULT_SETTINGS } from '../utils/constants';

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
 * Merges two lists of sites based on updatedAt timestamp.
 * Defends against null/undefined lists or corrupted entries.
 */
export function mergeSites(localSites: SiteItem[] = [], remoteSites: SiteItem[] = []): SiteItem[] {
  const safeLocal = Array.isArray(localSites) ? localSites : [];
  const safeRemote = Array.isArray(remoteSites) ? remoteSites : [];
  const map = new Map<string, SiteItem>();

  for (const s of safeLocal) {
    if (!s || typeof s !== 'object' || !s.id || typeof s.id !== 'string') continue;
    map.set(s.id, s);
  }

  for (const s of safeRemote) {
    if (!s || typeof s !== 'object' || !s.id || typeof s.id !== 'string') continue;
    const existing = map.get(s.id);
    if (!existing) {
      map.set(s.id, s);
    } else {
      if ((s.updatedAt || 0) > (existing.updatedAt || 0)) {
        map.set(s.id, s);
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

const DEFAULT_EMPTY_CONTAINER: ProfileContainer = {
  version: SYNC_PAYLOAD_VERSION,
  profiles: {
    normal: { sites: [], categories: [], activeCategoryId: 'all' },
    private: { sites: [], categories: [], activeCategoryId: 'all' },
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
      ...(safeContainer.profiles.normal.pageCategoryMap ? { pageCategoryMap: { ...safeContainer.profiles.normal.pageCategoryMap } } : {}),
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
      ...(safeContainer.profiles.private.pageCategoryMap ? { pageCategoryMap: { ...safeContainer.profiles.private.pageCategoryMap } } : {}),
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
      result.normal = {
        sites: Array.isArray(remotePayload.profiles.normal.sites) ? remotePayload.profiles.normal.sites : [],
        categories: Array.isArray(remotePayload.profiles.normal.categories) ? remotePayload.profiles.normal.categories : [],
        activeCategoryId: remotePayload.profiles.normal.activeCategoryId || 'all',
        ...(remotePayload.profiles.normal.pageCategoryMap ? { pageCategoryMap: { ...remotePayload.profiles.normal.pageCategoryMap } } : {}),
        ...(remotePayload.profiles.normal.settings ? { settings: { ...remotePayload.profiles.normal.settings } } : {}),
        ...(remotePayload.profiles.normal.wallpaper ? { wallpaper: { ...remotePayload.profiles.normal.wallpaper } } : {}),
      };
    }
    if (remotePayload.profiles.private && typeof remotePayload.profiles.private === 'object') {
      result.private = {
        sites: Array.isArray(remotePayload.profiles.private.sites) ? remotePayload.profiles.private.sites : [],
        categories: Array.isArray(remotePayload.profiles.private.categories) ? remotePayload.profiles.private.categories : [],
        activeCategoryId: remotePayload.profiles.private.activeCategoryId || 'all',
        ...(remotePayload.profiles.private.pageCategoryMap ? { pageCategoryMap: { ...remotePayload.profiles.private.pageCategoryMap } } : {}),
        ...(remotePayload.profiles.private.settings ? { settings: { ...remotePayload.profiles.private.settings } } : {}),
        ...(remotePayload.profiles.private.wallpaper ? { wallpaper: { ...remotePayload.profiles.private.wallpaper } } : {}),
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
    };
    const remote = remoteProfiles[pid]!;

    if (strategy === 'remote') {
      const remoteSites = Array.isArray(remote.sites) ? remote.sites : (local.sites || []);
      const remoteCats = Array.isArray(remote.categories) ? remote.categories : (local.categories || []);
      const preferredCat = remote.activeCategoryId || local.activeCategoryId || 'all';
      const isValidCat = preferredCat === 'all' || remoteCats.some((c) => c && c.id === preferredCat);

      updatedProfiles[pid] = {
        sites: remoteSites,
        categories: remoteCats,
        activeCategoryId: isValidCat ? preferredCat : 'all',
        settings: remote.settings !== undefined ? remote.settings : local.settings,
        wallpaper: remote.wallpaper !== undefined ? remote.wallpaper : local.wallpaper,
      };
    } else if (strategy === 'local') {
      // Local strategy keeps local data
      updatedProfiles[pid] = local;
    } else {
      // 'merge' strategy
      const mergedSites = mergeSites(local.sites || [], remote.sites || []);
      const mergedCats = mergeCategories(local.categories || [], remote.categories || []);
      const preferredCat = local.activeCategoryId || remote.activeCategoryId || 'all';
      const isValidCat = preferredCat === 'all' || mergedCats.some((c) => c && c.id === preferredCat);

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
        sites: mergedSites,
        categories: mergedCats,
        activeCategoryId: isValidCat ? preferredCat : 'all',
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
