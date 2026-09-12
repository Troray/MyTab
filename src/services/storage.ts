import {
  AppState,
  Category,
  GitSyncConfig,
  GridPage,
  ProfileContainer,
  ProfileData,
  ProfileId,
  ProfileSyncSettings,
  SiteItem,
  ThemeSettings,
  WallpaperSettings,
  WebdavConfig
} from '../types';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_SITES,
  DEFAULT_SETTINGS,
  DEFAULT_WEBDAV_CONFIG,
  DEFAULT_GIT_CONFIG,
  DEFAULT_PRIVATE_BACKGROUND_VALUE
} from '../utils/constants';
import { getCurrentProfileId } from './profile';

export const STORAGE_KEYS = {
  PROFILE_DATA: 'mytab_profile_data',
  SYNC_SETTINGS: 'mytab_sync_settings',
  SETTINGS: 'mytab_settings',
  WEBDAV: 'mytab_webdav',
  GIT: 'mytab_git',
  FIRST_LAUNCH: 'mytab_first_launch',
  POPUP_PREFS: 'mytab_popup_prefs',

  // Legacy keys used only for migration
  LEGACY_SITES: 'mytab_sites',
  LEGACY_CATEGORIES: 'mytab_categories',
  LEGACY_ACTIVE_CATEGORY: 'mytab_active_category'
} as const;

export const DEFAULT_PROFILE_SYNC_SETTINGS: ProfileSyncSettings = {
  normal: true,
  private: false,
};

// Check if running inside chrome/browser extension context
export const isExtension = typeof chrome !== 'undefined' && !!chrome.storage && !!chrome.storage.local;

export async function getItem<T>(key: string, defaultValue: T): Promise<T> {
  if (isExtension) {
    try {
      const res = await chrome.storage.local.get(key);
      if (res && res[key] !== undefined) {
        return res[key] as T;
      }
    } catch (e) {
      console.warn(`[Storage] Failed to read ${key} from extension storage`, e);
    }
  }

  if (typeof localStorage !== 'undefined') {
    const raw = localStorage.getItem(key);
    if (raw === null) return defaultValue;
    try {
      return JSON.parse(raw);
    } catch {
      return defaultValue;
    }
  }

  return defaultValue;
}

/**
 * Reads multiple items from storage in a single IPC / localStorage operation.
 */
export async function getMultipleItems<T extends Record<string, any>>(defaults: T): Promise<T> {
  const keys = Object.keys(defaults);
  if (isExtension) {
    try {
      const res = await chrome.storage.local.get(keys);
      const result = { ...defaults };
      for (const key of keys) {
        if (res && res[key] !== undefined) {
          (result as any)[key] = res[key];
        }
      }
      return result;
    } catch (e) {
      console.warn('[Storage] Failed to read multiple keys from extension storage', e);
    }
  }

  if (typeof localStorage !== 'undefined') {
    const result = { ...defaults };
    for (const key of keys) {
      const raw = localStorage.getItem(key);
      if (raw !== null) {
        try {
          (result as any)[key] = JSON.parse(raw);
        } catch {
          // preserve default
        }
      }
    }
    return result;
  }

  return defaults;
}

export async function setItem<T>(key: string, value: T): Promise<void> {
  if (isExtension) {
    try {
      await chrome.storage.local.set({ [key]: value });
      return;
    } catch (e) {
      console.warn(`[Storage] Failed to write ${key} to extension storage`, e);
    }
  }

  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

export const DEFAULT_GRID_PAGES: GridPage[] = [
  { id: 'page-1', name: '桌面 1', sortOrder: 0 },
];

/**
 * Creates default data for the normal profile.
 */
export function createDefaultNormalProfile(): ProfileData {
  return {
    sites: DEFAULT_SITES,
    categories: DEFAULT_CATEGORIES,
    activeCategoryId: 'all',
    gridPages: DEFAULT_GRID_PAGES,
    activeGridPageId: 'page-1',
  };
}

/**
 * Creates clean initial data for the private profile with zero data (no sites, no default categories).
 */
export function createDefaultPrivateProfile(): ProfileData {
  return {
    sites: [],
    categories: [],
    activeCategoryId: 'all',
    gridPages: DEFAULT_GRID_PAGES,
    activeGridPageId: 'page-1',
    settings: {
      backgroundType: 'gradient',
      backgroundValue: DEFAULT_PRIVATE_BACKGROUND_VALUE,
      gradientLastValue: DEFAULT_PRIVATE_BACKGROUND_VALUE,
    },
  };
}

/**
 * Loads the ProfileContainer from storage.
 * Performs idempotent V1 -> V2 migration if mytab_profile_data does not exist yet.
 */
export async function loadProfileContainer(): Promise<ProfileContainer> {
  const container = await getItem<ProfileContainer | null>(STORAGE_KEYS.PROFILE_DATA, null);

  if (container && container.version === 2 && container.profiles) {
    // Ensure both profiles exist
    let modified = false;
    const profiles = { ...container.profiles };
    if (!profiles.normal) {
      profiles.normal = createDefaultNormalProfile();
      modified = true;
    }
    if (!profiles.private) {
      profiles.private = createDefaultPrivateProfile();
      modified = true;
    } else if (!profiles.private.settings && !profiles.private.wallpaper) {
      profiles.private.settings = {
        backgroundType: 'gradient',
        backgroundValue: DEFAULT_PRIVATE_BACKGROUND_VALUE,
      };
      modified = true;
    } else if (
      // If private profile has 0 sites and still has DEFAULT_CATEGORIES, reset to zero data!
      profiles.private.sites.length === 0 &&
      profiles.private.categories.length === DEFAULT_CATEGORIES.length &&
      profiles.private.categories.every((c, idx) => c.id === DEFAULT_CATEGORIES[idx].id)
    ) {
      profiles.private.categories = [];
      modified = true;
    }
    if (modified) {
      const updatedContainer: ProfileContainer = { version: 2, profiles };
      await setItem(STORAGE_KEYS.PROFILE_DATA, updatedContainer);
      return updatedContainer;
    }
    return container;
  }

  // Migration from V1 (or fresh initialization)
  const [legacySites, legacyCategories, legacyActiveCategory] = await Promise.all([
    getItem<SiteItem[] | null>(STORAGE_KEYS.LEGACY_SITES, null),
    getItem<Category[] | null>(STORAGE_KEYS.LEGACY_CATEGORIES, null),
    getItem<string | null>(STORAGE_KEYS.LEGACY_ACTIVE_CATEGORY, null),
  ]);

  const hasLegacyData = legacySites !== null || legacyCategories !== null;

  const normalProfile: ProfileData = {
    sites: hasLegacyData && legacySites ? legacySites : DEFAULT_SITES,
    categories: hasLegacyData && legacyCategories ? legacyCategories : DEFAULT_CATEGORIES,
    activeCategoryId: legacyActiveCategory || 'all',
  };

  const privateProfile: ProfileData = createDefaultPrivateProfile();

  const newContainer: ProfileContainer = {
    version: 2,
    profiles: {
      normal: normalProfile,
      private: privateProfile,
    },
  };

  await setItem(STORAGE_KEYS.PROFILE_DATA, newContainer);
  // Keep legacy keys intact as safe backup (non-destructive migration)
  return newContainer;
}

/**
 * Saves the entire ProfileContainer to storage.
 */
export async function saveProfileContainer(container: ProfileContainer): Promise<void> {
  await setItem(STORAGE_KEYS.PROFILE_DATA, container);
}

let profileUpdateLock: Promise<any> = Promise.resolve();

/**
 * Concurrency-safe atomic profile updater.
 * Uses an in-memory sequential lock to guarantee strict ordering of concurrent writes.
 * Always reads the latest container from storage before applying updates to the target profile.
 */
export function updateProfile(
  profileId: ProfileId,
  updater: (profile: ProfileData) => ProfileData
): Promise<void> {
  const nextLock = profileUpdateLock.then(async () => {
    const container = await loadProfileContainer();
    const current = container.profiles[profileId] || (profileId === 'private' ? createDefaultPrivateProfile() : createDefaultNormalProfile());
    const updated = updater(current);

    await saveProfileContainer({
      ...container,
      profiles: {
        ...container.profiles,
        [profileId]: updated,
      },
    });
  });
  profileUpdateLock = nextLock.catch(() => {});
  return nextLock;
}

/**
 * Gets the profile data for a specific profile ID.
 */
export async function getProfileData(profileId: ProfileId): Promise<ProfileData> {
  const container = await loadProfileContainer();
  return container.profiles[profileId] || (profileId === 'private' ? createDefaultPrivateProfile() : createDefaultNormalProfile());
}

/**
 * Saves profile data directly for a specific profile ID.
 */
export async function saveProfileData(profileId: ProfileId, data: ProfileData): Promise<void> {
  await updateProfile(profileId, () => data);
}

/**
 * Gets the profile sync settings.
 */
export async function getProfileSyncSettings(): Promise<ProfileSyncSettings> {
  return await getItem<ProfileSyncSettings>(STORAGE_KEYS.SYNC_SETTINGS, DEFAULT_PROFILE_SYNC_SETTINGS);
}

/**
 * Saves the profile sync settings.
 */
export async function saveProfileSyncSettings(settings: ProfileSyncSettings): Promise<void> {
  await setItem(STORAGE_KEYS.SYNC_SETTINGS, settings);
}

/**
 * Loads the complete AppState for the requested profile (or resolves current window profile).
 */
export async function loadAppState(targetProfileId?: ProfileId): Promise<AppState> {
  const [profileId, storageData] = await Promise.all([
    targetProfileId ? Promise.resolve(targetProfileId) : getCurrentProfileId(),
    getMultipleItems<{
      [STORAGE_KEYS.PROFILE_DATA]: ProfileContainer | null;
      [STORAGE_KEYS.SETTINGS]: ThemeSettings;
      [STORAGE_KEYS.WEBDAV]: WebdavConfig;
      [STORAGE_KEYS.GIT]: GitSyncConfig;
      [STORAGE_KEYS.FIRST_LAUNCH]: boolean;
      [STORAGE_KEYS.SYNC_SETTINGS]: ProfileSyncSettings;
    }>({
      [STORAGE_KEYS.PROFILE_DATA]: null,
      [STORAGE_KEYS.SETTINGS]: DEFAULT_SETTINGS,
      [STORAGE_KEYS.WEBDAV]: DEFAULT_WEBDAV_CONFIG,
      [STORAGE_KEYS.GIT]: DEFAULT_GIT_CONFIG,
      [STORAGE_KEYS.FIRST_LAUNCH]: true,
      [STORAGE_KEYS.SYNC_SETTINGS]: DEFAULT_PROFILE_SYNC_SETTINGS,
    }),
  ]);

  let container = storageData[STORAGE_KEYS.PROFILE_DATA] as ProfileContainer | null;
  if (!container || container.version !== 2 || !container.profiles) {
    container = await loadProfileContainer();
  } else {
    // In-memory verification for normal/private profile existence
    let modified = false;
    const profiles = { ...container.profiles };
    if (!profiles.normal) {
      profiles.normal = createDefaultNormalProfile();
      modified = true;
    }
    if (!profiles.private) {
      profiles.private = createDefaultPrivateProfile();
      modified = true;
    }
    if (modified) {
      container = { version: 2, profiles };
      setItem(STORAGE_KEYS.PROFILE_DATA, container).catch(() => {});
    }
  }

  const settings = storageData[STORAGE_KEYS.SETTINGS] as ThemeSettings;
  const webdav = storageData[STORAGE_KEYS.WEBDAV] as WebdavConfig;
  const git = storageData[STORAGE_KEYS.GIT] as GitSyncConfig;
  const isFirst = storageData[STORAGE_KEYS.FIRST_LAUNCH] as boolean;
  const syncSettings = storageData[STORAGE_KEYS.SYNC_SETTINGS] as ProfileSyncSettings;

  const currentProfile = container.profiles[profileId] || (profileId === 'private' ? createDefaultPrivateProfile() : createDefaultNormalProfile());

  // Backward compatibility normalization for Git sync providers
  const activeProvider = git.provider || 'github';
  const existingProviders = git.providers || {};
  const currentPlatform = existingProviders[activeProvider] || {
    mode: git.mode || 'repo',
    gistId: git.gistId || '',
    owner: git.owner || '',
    repo: git.repo || '',
    branch: git.branch || (activeProvider === 'gitee' ? 'master' : 'main'),
    path: git.path || 'mytab-backup.json',
    token: git.token || '',
    lastSyncTime: git.lastSyncTime,
    lastSyncStatus: git.lastSyncStatus,
    lastSyncError: git.lastSyncError,
  };

  const normalizedGit: GitSyncConfig = {
    ...DEFAULT_GIT_CONFIG,
    ...git,
    providers: {
      github: existingProviders.github || {
        mode: activeProvider === 'github' ? currentPlatform.mode : 'repo',
        gistId: activeProvider === 'github' ? currentPlatform.gistId : '',
        owner: activeProvider === 'github' ? currentPlatform.owner : '',
        repo: activeProvider === 'github' ? currentPlatform.repo : '',
        branch: activeProvider === 'github' ? currentPlatform.branch : 'main',
        path: activeProvider === 'github' ? currentPlatform.path : 'mytab-backup.json',
        token: activeProvider === 'github' ? currentPlatform.token : '',
        lastSyncTime: activeProvider === 'github' ? currentPlatform.lastSyncTime : undefined,
        lastSyncStatus: activeProvider === 'github' ? currentPlatform.lastSyncStatus : undefined,
        lastSyncError: activeProvider === 'github' ? currentPlatform.lastSyncError : undefined,
      },
      gitee: existingProviders.gitee || {
        mode: activeProvider === 'gitee' ? currentPlatform.mode : 'repo',
        gistId: activeProvider === 'gitee' ? currentPlatform.gistId : '',
        owner: activeProvider === 'gitee' ? currentPlatform.owner : '',
        repo: activeProvider === 'gitee' ? currentPlatform.repo : '',
        branch: activeProvider === 'gitee' ? currentPlatform.branch : 'master',
        path: activeProvider === 'gitee' ? currentPlatform.path : 'mytab-backup.json',
        token: activeProvider === 'gitee' ? currentPlatform.token : '',
        lastSyncTime: activeProvider === 'gitee' ? currentPlatform.lastSyncTime : undefined,
        lastSyncStatus: activeProvider === 'gitee' ? currentPlatform.lastSyncStatus : undefined,
        lastSyncError: activeProvider === 'gitee' ? currentPlatform.lastSyncError : undefined,
      },
      [activeProvider]: currentPlatform,
    },
  };

  // Normalize settings with default values, filtering out any undefined/null values
  const cleanSettings = Object.fromEntries(
    Object.entries(settings || {}).filter(([_, v]) => v !== undefined && v !== null)
  );
  const normalizedSettings: ThemeSettings = { ...DEFAULT_SETTINGS, ...cleanSettings };

  // Profile-specific settings (Appearance & Preferences)
  let effectiveSettings = normalizedSettings;
  let hasCustom = false;

  const profileSettings = currentProfile.settings || (currentProfile.wallpaper ? { ...currentProfile.wallpaper } : undefined);
  if (profileId === 'private') {
    const cleanProfileSettings = profileSettings
      ? Object.fromEntries(
          Object.entries(profileSettings).filter(([_, v]) => v !== undefined && v !== null)
        )
      : {};

    const isInherited = Boolean((cleanProfileSettings as any).inheritNormal);

    if (!isInherited) {
      const privateDefaults: Partial<ThemeSettings> = {
        backgroundType: 'gradient',
        backgroundValue: DEFAULT_PRIVATE_BACKGROUND_VALUE,
        gradientLastValue: DEFAULT_PRIVATE_BACKGROUND_VALUE,
      };
      effectiveSettings = {
        ...normalizedSettings,
        ...privateDefaults,
        ...cleanProfileSettings,
      };
      const hasCustomBg =
        cleanProfileSettings.backgroundValue !== undefined &&
        cleanProfileSettings.backgroundValue !== DEFAULT_PRIVATE_BACKGROUND_VALUE;
      const hasOtherSettings = Object.keys(cleanProfileSettings).some(
        (k) => k !== 'backgroundType' && k !== 'backgroundValue' && k !== 'updatedAt' && k !== 'inheritNormal'
      );
      hasCustom = Boolean(profileSettings && (hasCustomBg || hasOtherSettings));
    } else {
      effectiveSettings = {
        ...normalizedSettings,
      };
      hasCustom = false;
    }
  }

  return {
    profileId,
    sites: currentProfile.sites,
    categories: currentProfile.categories,
    activeCategoryId: currentProfile.activeCategoryId,
    gridPages: currentProfile.gridPages && currentProfile.gridPages.length > 0 ? currentProfile.gridPages : DEFAULT_GRID_PAGES,
    activeGridPageId: currentProfile.activeGridPageId || (currentProfile.gridPages?.[0]?.id) || 'page-1',
    settings: effectiveSettings,
    webdav: { ...DEFAULT_WEBDAV_CONFIG, ...webdav },
    git: normalizedGit,
    syncSettings,
    isFirstLaunch: isFirst,
    hasCustomSettings: hasCustom,
    hasCustomWallpaper: hasCustom,
  };
}

export async function saveSites(sites: SiteItem[], profileId?: ProfileId): Promise<void> {
  const targetId = profileId || (await getCurrentProfileId());
  await updateProfile(targetId, (profile) => ({
    ...profile,
    sites,
  }));
}

export async function saveCategories(categories: Category[], profileId?: ProfileId): Promise<void> {
  const targetId = profileId || (await getCurrentProfileId());
  await updateProfile(targetId, (profile) => ({
    ...profile,
    categories,
  }));
}

export async function saveGridPages(gridPages: GridPage[], profileId?: ProfileId): Promise<void> {
  const targetId = profileId || (await getCurrentProfileId());
  await updateProfile(targetId, (profile) => ({
    ...profile,
    gridPages,
  }));
}

export async function deleteGridPage(pageIdToDelete: string, profileId?: ProfileId): Promise<void> {
  const targetId = profileId || (await getCurrentProfileId());
  await updateProfile(targetId, (profile) => {
    const existingPages = profile.gridPages && profile.gridPages.length > 0 ? profile.gridPages : DEFAULT_GRID_PAGES;
    const remainingPages = existingPages.filter((p) => p.id !== pageIdToDelete);
    const safeRemaining = remainingPages.length > 0 ? remainingPages : DEFAULT_GRID_PAGES;
    const fallbackPageId = safeRemaining[0].id;

    // Migrate any categories assigned to deleted page to fallbackPageId
    const updatedCategories = (profile.categories || []).map((c) => {
      if (c.pageId === pageIdToDelete) {
        return { ...c, pageId: fallbackPageId, updatedAt: Date.now() };
      }
      return c;
    });

    // Migrate any sites assigned to deleted page to fallbackPageId
    const updatedSites = (profile.sites || []).map((s) => {
      if (s.pageId === pageIdToDelete) {
        return { ...s, pageId: fallbackPageId, updatedAt: Date.now() };
      }
      return s;
    });

    return {
      ...profile,
      gridPages: safeRemaining,
      categories: updatedCategories,
      sites: updatedSites,
      activeGridPageId: profile.activeGridPageId === pageIdToDelete ? fallbackPageId : profile.activeGridPageId,
    };
  });
}

/**
 * Moves an entire category and all its contained sites to a target grid desktop page.
 */
export async function moveCategoryToGridPage(
  categoryId: string,
  targetPageId: string,
  profileId?: ProfileId
): Promise<void> {
  const targetId = profileId || (await getCurrentProfileId());
  const now = Date.now();
  await updateProfile(targetId, (profile) => ({
    ...profile,
    categories: (profile.categories || []).map((c) =>
      c.id === categoryId ? { ...c, pageId: targetPageId, updatedAt: now } : c
    ),
    sites: (profile.sites || []).map((s) =>
      s.categoryId === categoryId ? { ...s, pageId: targetPageId, updatedAt: now } : s
    ),
  }));
}

export async function saveActiveCategory(activeCategoryId: string, profileId?: ProfileId): Promise<void> {
  const targetId = profileId || (await getCurrentProfileId());
  await updateProfile(targetId, (profile) => ({
    ...profile,
    activeCategoryId,
  }));
}

export async function saveActiveGridPageId(activeGridPageId: string, profileId?: ProfileId): Promise<void> {
  const targetId = profileId || (await getCurrentProfileId());
  await updateProfile(targetId, (profile) => ({
    ...profile,
    activeGridPageId,
  }));
}

export async function saveProfileItems(
  updates: { sites?: SiteItem[]; categories?: Category[]; activeCategoryId?: string; gridPages?: GridPage[]; activeGridPageId?: string },
  profileId?: ProfileId
): Promise<void> {
  const targetId = profileId || (await getCurrentProfileId());
  await updateProfile(targetId, (profile) => ({
    ...profile,
    ...(updates.sites !== undefined ? { sites: updates.sites } : {}),
    ...(updates.categories !== undefined ? { categories: updates.categories } : {}),
    ...(updates.activeCategoryId !== undefined ? { activeCategoryId: updates.activeCategoryId } : {}),
    ...(updates.gridPages !== undefined ? { gridPages: updates.gridPages } : {}),
    ...(updates.activeGridPageId !== undefined ? { activeGridPageId: updates.activeGridPageId } : {}),
  }));
}

/**
 * Saves custom settings (appearance & preferences) for a specific profile.
 * Pass null to clear customizations and restore inheritance from normal space.
 */
export async function saveProfileSettings(
  profileId: ProfileId,
  updates: Partial<ThemeSettings> | null
): Promise<void> {
  await updateProfile(profileId, (profile) => {
    if (updates === null) {
      const { settings, wallpaper, ...rest } = profile;
      return rest;
    }
    const current = profile.settings || {};
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined && v !== null)
    );
    return {
      ...profile,
      settings: {
        ...current,
        ...cleanUpdates,
        updatedAt: Date.now(),
      },
    };
  });
}

/**
 * Resets a profile's custom settings so that it follows normal space.
 */
export async function resetProfileSettings(profileId: ProfileId): Promise<void> {
  await updateProfile(profileId, (profile) => ({
    ...profile,
    settings: { inheritNormal: true } as any,
  }));
}

/**
 * Saves settings.
 * If profileId is 'private', updates private profile's custom settings (zero impact on normal space).
 * If profileId is 'normal' (or omitted), updates global/normal settings in STORAGE_KEYS.SETTINGS.
 */
export async function saveSettings(
  settings: Partial<ThemeSettings>,
  profileId?: ProfileId
): Promise<void> {
  const targetId = profileId || (await getCurrentProfileId());
  if (targetId === 'private') {
    await saveProfileSettings('private', settings);
  } else {
    const current = await getItem<ThemeSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    const clean = Object.fromEntries(
      Object.entries(settings || {}).filter(([_, v]) => v !== undefined && v !== null)
    );
    await setItem(STORAGE_KEYS.SETTINGS, {
      ...DEFAULT_SETTINGS,
      ...current,
      ...clean,
      updatedAt: Date.now(),
    });
  }
}

export async function saveWebdavConfig(webdav: WebdavConfig): Promise<void> {
  await setItem(STORAGE_KEYS.WEBDAV, webdav);
}

export async function saveGitConfig(git: GitSyncConfig): Promise<void> {
  await setItem(STORAGE_KEYS.GIT, git);
}

export async function setFirstLaunchComplete(): Promise<void> {
  await setItem(STORAGE_KEYS.FIRST_LAUNCH, false);
}

/**
 * Profile-aware popup preferences.
 * Stores lastUsedGroupId scoped to each Profile.
 */
interface PopupPrefs {
  normal?: { lastUsedGroupId?: string };
  private?: { lastUsedGroupId?: string };
  // Backward compatibility
  lastUsedGroupId?: string;
}

export async function getPopupLastUsedGroupId(profileId?: ProfileId): Promise<string | undefined> {
  const targetId = profileId || (await getCurrentProfileId());
  const prefs = await getItem<PopupPrefs>(STORAGE_KEYS.POPUP_PREFS, {});
  if (prefs[targetId]?.lastUsedGroupId) {
    return prefs[targetId]!.lastUsedGroupId;
  }
  // Fallback to legacy field for normal profile
  if (targetId === 'normal') {
    return prefs.lastUsedGroupId;
  }
  return undefined;
}

export async function savePopupLastUsedGroupId(groupId: string, profileId?: ProfileId): Promise<void> {
  const targetId = profileId || (await getCurrentProfileId());
  const prefs = await getItem<PopupPrefs>(STORAGE_KEYS.POPUP_PREFS, {});
  const updated: PopupPrefs = {
    ...prefs,
    [targetId]: {
      ...prefs[targetId],
      lastUsedGroupId: groupId,
    },
  };
  await setItem(STORAGE_KEYS.POPUP_PREFS, updated);
}

/**
 * Export data supporting Profile selection.
 * By default exports normal profile (and private if explicitly requested).
 */
export async function exportAllData(
  profilesToExport?: ProfileId[],
  includeCredentials = false
): Promise<string> {
  const container = await loadProfileContainer();
  const settings = await getItem<ThemeSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);

  const selectedProfiles = profilesToExport && profilesToExport.length > 0 ? profilesToExport : (['normal'] as ProfileId[]);
  const exportProfiles: Partial<Record<ProfileId, ProfileData>> = {};

  for (const pid of selectedProfiles) {
    if (container.profiles[pid]) {
      exportProfiles[pid] = container.profiles[pid];
    }
  }

  const exportPayload: any = {
    app: 'MyTab',
    version: 2,
    exportTime: Date.now(),
    profiles: exportProfiles,
    settings,
    // V1 backward compatibility for external tools or older version imports
    categories: exportProfiles.normal?.categories || [],
    sites: exportProfiles.normal?.sites || [],
  };

  if (includeCredentials) {
    const [webdav, git, syncSettings] = await Promise.all([
      getItem<WebdavConfig>(STORAGE_KEYS.WEBDAV, DEFAULT_WEBDAV_CONFIG),
      getItem<GitSyncConfig>(STORAGE_KEYS.GIT, DEFAULT_GIT_CONFIG),
      getProfileSyncSettings(),
    ]);
    exportPayload.webdav = webdav;
    exportPayload.git = git;
    exportPayload.syncSettings = syncSettings;
    exportPayload.hasCredentials = true;
  }

  return JSON.stringify(exportPayload, null, 2);
}

/**
 * Imports data from JSON string.
 * Supports both V2 (profile-aware) and V1 (single profile) formats.
 */
export async function importData(
  jsonString: string,
  targetProfileId?: ProfileId
): Promise<{ success: boolean; error?: string; hasCredentials?: boolean }> {
  try {
    const data = JSON.parse(jsonString);
    let hasCredentials = false;

    // Check V2 format with profiles
    if (data.version === 2 && data.profiles && typeof data.profiles === 'object') {
      const currentContainer = await loadProfileContainer();
      const updatedProfiles = { ...currentContainer.profiles };

      for (const key of Object.keys(data.profiles) as ProfileId[]) {
        const p = data.profiles[key];
        if (p && Array.isArray(p.sites) && Array.isArray(p.categories)) {
          // If a specific targetProfileId was chosen for import, map it
          const destId = targetProfileId || key;
          const isValidCat =
            !p.activeCategoryId ||
            p.activeCategoryId === 'all' ||
            p.categories.some((c: Category) => c && c.id === p.activeCategoryId);
          updatedProfiles[destId] = {
            sites: p.sites,
            categories: p.categories,
            activeCategoryId: isValidCat ? (p.activeCategoryId || 'all') : 'all',
            ...(p.settings ? { settings: p.settings } : {}),
            ...(p.wallpaper ? { wallpaper: p.wallpaper } : {}),
          };
        }
      }

      await saveProfileContainer({
        ...currentContainer,
        profiles: updatedProfiles,
      });

      if (data.settings && typeof data.settings === 'object') {
        const clean = Object.fromEntries(
          Object.entries(data.settings).filter(([_, v]) => v !== undefined && v !== null)
        );
        await saveSettings({ ...DEFAULT_SETTINGS, ...clean });
      }

      if (data.webdav && typeof data.webdav === 'object') {
        await saveWebdavConfig({ ...DEFAULT_WEBDAV_CONFIG, ...data.webdav });
        hasCredentials = true;
      }

      if (data.git && typeof data.git === 'object') {
        await saveGitConfig({ ...DEFAULT_GIT_CONFIG, ...data.git });
        hasCredentials = true;
      }

      if (data.syncSettings && typeof data.syncSettings === 'object') {
        await saveProfileSyncSettings({ ...DEFAULT_PROFILE_SYNC_SETTINGS, ...data.syncSettings });
      }

      return { success: true, hasCredentials };
    }

    // V1 format: check sites array
    if (!data.sites || !Array.isArray(data.sites)) {
      return { success: false, error: 'Invalid data: missing sites array' };
    }

    const targetId = targetProfileId || 'normal';
    await updateProfile(targetId, (prev) => {
      const newCats: Category[] = data.categories && Array.isArray(data.categories) ? data.categories : prev.categories;
      const isValidCat =
        !prev.activeCategoryId ||
        prev.activeCategoryId === 'all' ||
        newCats.some((c: Category) => c && c.id === prev.activeCategoryId);
      return {
        ...prev,
        categories: newCats,
        sites: data.sites,
        activeCategoryId: isValidCat ? prev.activeCategoryId : 'all',
      };
    });

    if (data.settings && typeof data.settings === 'object') {
      const clean = Object.fromEntries(
        Object.entries(data.settings).filter(([_, v]) => v !== undefined && v !== null)
      );
      await saveSettings({ ...DEFAULT_SETTINGS, ...clean });
    }

    if (data.webdav && typeof data.webdav === 'object') {
      await saveWebdavConfig({ ...DEFAULT_WEBDAV_CONFIG, ...data.webdav });
      hasCredentials = true;
    }

    if (data.git && typeof data.git === 'object') {
      await saveGitConfig({ ...DEFAULT_GIT_CONFIG, ...data.git });
      hasCredentials = true;
    }

    return { success: true, hasCredentials };
  } catch (err: any) {
    return { success: false, error: err.message || 'JSON parse error' };
  }
}
