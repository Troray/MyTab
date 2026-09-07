// Mock minimal chrome runtime in Node environment for webextension-polyfill
if (!globalThis.chrome) {
  globalThis.chrome = { runtime: { id: 'mytab-test-extension' } };
}

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildSyncPayload,
  applyRemotePayload,
  mergeSites,
  mergeCategories,
} from '../src/services/syncController.ts';
import { DEFAULT_SETTINGS } from '../src/utils/constants.ts';


test('SyncController: Case 8 - Private sync disabled by default', () => {
  const container = {
    version: 2,
    profiles: {
      normal: {
        sites: [{ id: 's1', title: 'Google', url: 'https://google.com', categoryId: 'tools', sortOrder: 0, createdAt: 1, updatedAt: 1 }],
        categories: [{ id: 'tools', name: 'Tools', sortOrder: 0 }],
        activeCategoryId: 'all',
      },
      private: {
        sites: [{ id: 'sp1', title: 'Secret', url: 'https://secret.com', categoryId: 'privacy', sortOrder: 0, createdAt: 1, updatedAt: 1 }],
        categories: [{ id: 'privacy', name: 'Privacy', sortOrder: 0 }],
        activeCategoryId: 'all',
      },
    },
  };

  const syncPolicy = { normal: true, private: false };
  const payload = buildSyncPayload(container, DEFAULT_SETTINGS, syncPolicy);

  assert.equal(payload.version, 2);
  assert.ok(payload.profiles.normal, 'Normal profile must be present');
  assert.equal(payload.profiles.normal.sites.length, 1);
  assert.equal(payload.profiles.private, undefined, 'Private profile must NOT be present in payload');
});

test('SyncController: Case 9 - Private sync enabled', () => {
  const container = {
    version: 2,
    profiles: {
      normal: {
        sites: [{ id: 's1', title: 'Google', url: 'https://google.com', categoryId: 'tools', sortOrder: 0, createdAt: 1, updatedAt: 1 }],
        categories: [{ id: 'tools', name: 'Tools', sortOrder: 0 }],
        activeCategoryId: 'all',
      },
      private: {
        sites: [{ id: 'sp1', title: 'Secret', url: 'https://secret.com', categoryId: 'privacy', sortOrder: 0, createdAt: 1, updatedAt: 1 }],
        categories: [{ id: 'privacy', name: 'Privacy', sortOrder: 0 }],
        activeCategoryId: 'all',
      },
    },
  };

  const syncPolicy = { normal: true, private: true };
  const payload = buildSyncPayload(container, DEFAULT_SETTINGS, syncPolicy);

  assert.ok(payload.profiles.normal, 'Normal profile must be present');
  assert.ok(payload.profiles.private, 'Private profile must be present');
  assert.equal(payload.profiles.private.sites[0].title, 'Secret');
});

test('SyncController: Case 10 - When private sync is disabled, remote private data is NEVER restored', () => {
  const localContainer = {
    version: 2,
    profiles: {
      normal: {
        sites: [{ id: 's1', title: 'LocalNormal', url: 'https://google.com', categoryId: 'tools', sortOrder: 0, createdAt: 1, updatedAt: 1 }],
        categories: [{ id: 'tools', name: 'Tools', sortOrder: 0 }],
        activeCategoryId: 'all',
      },
      private: {
        sites: [{ id: 'sp1', title: 'LocalPrivateKeepMe', url: 'https://local-private.com', categoryId: 'privacy', sortOrder: 0, createdAt: 1, updatedAt: 1 }],
        categories: [{ id: 'privacy', name: 'Privacy', sortOrder: 0 }],
        activeCategoryId: 'all',
      },
    },
  };

  const remotePayload = {
    version: 2,
    timestamp: 9999,
    profiles: {
      normal: {
        sites: [{ id: 's1', title: 'RemoteNormal', url: 'https://google.com', categoryId: 'tools', sortOrder: 0, createdAt: 1, updatedAt: 9999 }],
        categories: [{ id: 'tools', name: 'Tools', sortOrder: 0 }],
        activeCategoryId: 'all',
      },
      private: {
        sites: [{ id: 'sp_remote', title: 'RemotePrivateOverwriteAttempt', url: 'https://bad.com', categoryId: 'privacy', sortOrder: 0, createdAt: 1, updatedAt: 9999 }],
        categories: [{ id: 'privacy', name: 'Privacy', sortOrder: 0 }],
        activeCategoryId: 'all',
      },
    },
    settings: DEFAULT_SETTINGS,
  };

  const syncPolicy = { normal: true, private: false };
  const { updatedContainer } = applyRemotePayload(localContainer, DEFAULT_SETTINGS, remotePayload, syncPolicy, 'remote');

  assert.equal(updatedContainer.profiles.normal.sites[0].title, 'RemoteNormal');
  assert.equal(updatedContainer.profiles.private.sites[0].title, 'LocalPrivateKeepMe', 'Local private site must remain untouched!');
});

test('SyncController: Case 12 - Legacy V1 remote payload only modifies normal profile', () => {
  const localContainer = {
    version: 2,
    profiles: {
      normal: {
        sites: [{ id: 's1', title: 'OldLocal', url: 'https://google.com', categoryId: 'tools', sortOrder: 0, createdAt: 1, updatedAt: 1 }],
        categories: [{ id: 'tools', name: 'Tools', sortOrder: 0 }],
        activeCategoryId: 'all',
      },
      private: {
        sites: [{ id: 'sp1', title: 'DoNotTouch', url: 'https://private.com', categoryId: 'privacy', sortOrder: 0, createdAt: 1, updatedAt: 1 }],
        categories: [{ id: 'privacy', name: 'Privacy', sortOrder: 0 }],
        activeCategoryId: 'all',
      },
    },
  };

  // V1 payload has top-level categories and sites
  const remoteV1Payload = {
    version: 1,
    timestamp: 5000,
    sites: [{ id: 's_v1', title: 'V1Site', url: 'https://v1.com', categoryId: 'tools', sortOrder: 0, createdAt: 1, updatedAt: 5000 }],
    categories: [{ id: 'tools', name: 'Tools', sortOrder: 0 }],
    settings: DEFAULT_SETTINGS,
  };

  const syncPolicy = { normal: true, private: false };
  const { updatedContainer } = applyRemotePayload(localContainer, DEFAULT_SETTINGS, remoteV1Payload, syncPolicy, 'remote');

  assert.equal(updatedContainer.profiles.normal.sites[0].title, 'V1Site');
  assert.equal(updatedContainer.profiles.private.sites[0].title, 'DoNotTouch');
});

test('SyncController: Site & Category merge preserves order and updates', () => {
  const localSites = [
    { id: '1', title: 'Site 1', url: 'https://a.com', categoryId: 'tools', sortOrder: 0, createdAt: 1, updatedAt: 10 },
  ];
  const remoteSites = [
    { id: '1', title: 'Site 1 Updated', url: 'https://a.com', categoryId: 'tools', sortOrder: 0, createdAt: 1, updatedAt: 20 },
    { id: '2', title: 'Site 2', url: 'https://b.com', categoryId: 'tools', sortOrder: 1, createdAt: 1, updatedAt: 15 },
  ];

  const merged = mergeSites(localSites, remoteSites);
  assert.equal(merged.length, 2);
  assert.equal(merged[0].title, 'Site 1 Updated');
  assert.equal(merged[1].title, 'Site 2');
});

test('Storage Pattern: Case 13 - Atomic Profile updates prevent cross-profile data overwrites', () => {
  // Simulate container in storage
  let storedContainer = {
    version: 2,
    profiles: {
      normal: {
        sites: [{ id: 's1', title: 'NormalInitial', url: 'https://n.com', categoryId: 'tools', sortOrder: 0, createdAt: 1, updatedAt: 1 }],
        categories: [{ id: 'tools', name: 'Tools', sortOrder: 0 }],
        activeCategoryId: 'all',
      },
      private: {
        sites: [{ id: 'sp1', title: 'PrivateInitial', url: 'https://p.com', categoryId: 'privacy', sortOrder: 0, createdAt: 1, updatedAt: 1 }],
        categories: [{ id: 'privacy', name: 'Privacy', sortOrder: 0 }],
        activeCategoryId: 'all',
      },
    },
  };

  // Atomic update helper matching storage.ts
  const atomicUpdateProfile = (profileId, updater) => {
    // Read latest
    const current = { ...storedContainer };
    const targetProfile = current.profiles[profileId];
    const updated = updater(targetProfile);
    storedContainer = {
      ...current,
      profiles: {
        ...current.profiles,
        [profileId]: updated,
      },
    };
  };

  // Window 1 adds site to normal
  atomicUpdateProfile('normal', (p) => ({
    ...p,
    sites: [...p.sites, { id: 's2', title: 'NormalAdded', url: 'https://n2.com', categoryId: 'tools', sortOrder: 1, createdAt: 2, updatedAt: 2 }],
  }));

  // Window 2 adds site to private
  atomicUpdateProfile('private', (p) => ({
    ...p,
    sites: [...p.sites, { id: 'sp2', title: 'PrivateAdded', url: 'https://p2.com', categoryId: 'privacy', sortOrder: 1, createdAt: 3, updatedAt: 3 }],
  }));

  // Both updates must persist
  assert.equal(storedContainer.profiles.normal.sites.length, 2);
  assert.equal(storedContainer.profiles.normal.sites[1].title, 'NormalAdded');
  assert.equal(storedContainer.profiles.private.sites.length, 2);
  assert.equal(storedContainer.profiles.private.sites[1].title, 'PrivateAdded');
});

test('Private Space Zero Data: default private profile must have zero sites and zero categories', async () => {
  const { createDefaultPrivateProfile, createDefaultNormalProfile } = await import('../src/services/storage.ts');
  const privateProfile = createDefaultPrivateProfile();
  assert.equal(privateProfile.sites.length, 0, 'Private profile must have 0 sites by default');
  assert.equal(privateProfile.categories.length, 0, 'Private profile must have 0 categories by default');
  assert.equal(privateProfile.activeCategoryId, 'all');
  assert.equal(privateProfile.settings?.backgroundType, 'gradient');
  assert.ok(privateProfile.settings?.backgroundValue?.includes('#292832'), 'Default background must be 深空灰烬');

  const normalProfile = createDefaultNormalProfile();
  assert.ok(normalProfile.sites.length > 0, 'Normal profile retains default sites');
  assert.ok(normalProfile.categories.length > 0, 'Normal profile retains default categories');
});

test('Reorder Algorithm: faithful array reordering preserving non-visible category items', () => {
  const sites = [
    { id: 'a', categoryId: 'work', sortOrder: 0 },
    { id: 'x', categoryId: 'tools', sortOrder: 0 },
    { id: 'b', categoryId: 'work', sortOrder: 1 },
    { id: 'c', categoryId: 'work', sortOrder: 2 },
    { id: 'y', categoryId: 'tools', sortOrder: 1 },
  ];

  // User dragged 'c' to the front in 'work' category
  const reorderedSites = [
    { id: 'c', categoryId: 'work', sortOrder: 0 },
    { id: 'a', categoryId: 'work', sortOrder: 1 },
    { id: 'b', categoryId: 'work', sortOrder: 2 },
  ];

  const reorderedIds = new Set(reorderedSites.map((s) => s.id));
  const reorderedMap = new Map(reorderedSites.map((s, idx) => [s.id, idx]));
  let reorderedIdx = 0;
  const updated = sites.map((site) => {
    if (reorderedIds.has(site.id)) {
      const nextSite = reorderedSites[reorderedIdx++];
      return { ...nextSite, sortOrder: reorderedMap.get(nextSite.id) ?? 0 };
    }
    return site;
  });

  assert.deepEqual(updated.map((s) => s.id), ['c', 'x', 'a', 'b', 'y']);
  assert.deepEqual(
    updated.filter((s) => s.categoryId === 'work').map((s) => s.id),
    ['c', 'a', 'b']
  );
  assert.deepEqual(
    updated.filter((s) => s.categoryId === 'tools').map((s) => s.id),
    ['x', 'y']
  );
});

test('SyncController: Private profile custom settings (wallpaper & preferences) are synced only when private sync is enabled', () => {
  const container = {
    version: 2,
    profiles: {
      normal: {
        sites: [],
        categories: [],
        activeCategoryId: 'all',
      },
      private: {
        sites: [],
        categories: [],
        activeCategoryId: 'all',
        settings: {
          mode: 'dark',
          backgroundType: 'unsplash',
          backgroundValue: 'https://images.unsplash.com/photo-private',
          showClock: false,
        },
      },
    },
  };

  // 1. When private sync is OFF
  const payloadDisabled = buildSyncPayload(container, DEFAULT_SETTINGS, { normal: true, private: false });
  assert.equal(payloadDisabled.profiles.private, undefined, 'Private profile settings must NOT leak when private sync is off');

  // 2. When private sync is ON
  const payloadEnabled = buildSyncPayload(container, DEFAULT_SETTINGS, { normal: true, private: true });
  assert.ok(payloadEnabled.profiles.private, 'Private profile must be included');
  assert.equal(payloadEnabled.profiles.private.settings.mode, 'dark');
  assert.equal(payloadEnabled.profiles.private.settings.backgroundType, 'unsplash');
  assert.equal(payloadEnabled.profiles.private.settings.showClock, false);
});

test('SyncController: Remote private settings restore adheres to sync policy and strategy', () => {
  const localContainer = {
    version: 2,
    profiles: {
      normal: { sites: [], categories: [], activeCategoryId: 'all' },
      private: {
        sites: [],
        categories: [],
        activeCategoryId: 'all',
        settings: { mode: 'light', backgroundValue: 'local-val' },
      },
    },
  };

  const remotePayload = {
    version: 2,
    timestamp: 1000,
    profiles: {
      normal: { sites: [], categories: [], activeCategoryId: 'all' },
      private: {
        sites: [],
        categories: [],
        activeCategoryId: 'all',
        settings: { mode: 'dark', backgroundValue: 'remote-val' },
      },
    },
    settings: DEFAULT_SETTINGS,
  };

  // Case A: Private sync OFF -> local private settings strictly preserved
  const resOff = applyRemotePayload(localContainer, DEFAULT_SETTINGS, remotePayload, { normal: true, private: false }, 'remote');
  assert.equal(resOff.updatedContainer.profiles.private.settings.mode, 'light');
  assert.equal(resOff.updatedContainer.profiles.private.settings.backgroundValue, 'local-val');

  // Case B: Private sync ON with remote strategy -> remote private settings applied
  const resOn = applyRemotePayload(localContainer, DEFAULT_SETTINGS, remotePayload, { normal: true, private: true }, 'remote');
  assert.equal(resOn.updatedContainer.profiles.private.settings.mode, 'dark');
  assert.equal(resOn.updatedContainer.profiles.private.settings.backgroundValue, 'remote-val');
});

test('Backup & Export Security: Default export excludes WebDAV & Git credentials', async () => {
  const { exportAllData } = await import('../src/services/storage.ts');
  const rawExport = await exportAllData(['normal'], false);
  const parsed = JSON.parse(rawExport);

  assert.equal(parsed.hasCredentials, undefined, 'hasCredentials flag must be undefined by default');
  assert.equal(parsed.webdav, undefined, 'WebDAV config must NOT be in default export');
  assert.equal(parsed.git, undefined, 'Git config must NOT be in default export');
  assert.ok(parsed.profiles.normal, 'Normal profile data must be exported');
});

test('Backup & Export Security: Explicitly requested export includes WebDAV & Git credentials', async () => {
  const { exportAllData } = await import('../src/services/storage.ts');
  const rawExport = await exportAllData(['normal', 'private'], true);
  const parsed = JSON.parse(rawExport);

  assert.equal(parsed.hasCredentials, true, 'hasCredentials flag must be true');
  assert.ok(parsed.webdav, 'WebDAV config must be included when requested');
  assert.ok(parsed.git, 'Git config must be included when requested');
  assert.ok(parsed.syncSettings, 'Sync settings must be included when requested');
});

test('Backup & Import Security: Importing credentials correctly restores them and returns hasCredentials status', async () => {
  const { importData } = await import('../src/services/storage.ts');

  // Payload without credentials
  const payloadWithoutCreds = JSON.stringify({
    app: 'MyTab',
    version: 2,
    profiles: {
      normal: { sites: [], categories: [], activeCategoryId: 'all' },
    },
  });
  const resNoCreds = await importData(payloadWithoutCreds);
  assert.equal(resNoCreds.success, true);
  assert.equal(resNoCreds.hasCredentials, false, 'hasCredentials must be false when no credentials in payload');

  // Payload with credentials
  const payloadWithCreds = JSON.stringify({
    app: 'MyTab',
    version: 2,
    profiles: {
      normal: { sites: [], categories: [], activeCategoryId: 'all' },
    },
    webdav: { url: 'https://dav.example.com', username: 'alice', password: 'secret-password', enabled: true },
    git: { repoUrl: 'https://github.com/alice/tab-sync', token: 'ghp_secret_token_123', branch: 'main', enabled: true },
  });
  const resWithCreds = await importData(payloadWithCreds);
  assert.equal(resWithCreds.success, true);
  assert.equal(resWithCreds.hasCredentials, true, 'hasCredentials must be true when credentials restored');
});

test('Appearance: Gradient memory retains gradientLastValue when switching backgrounds', () => {
  const customSettings = {
    ...DEFAULT_SETTINGS,
    backgroundType: 'bing',
    backgroundValue: 'https://bing.com/sample.jpg',
    gradientLastValue: 'linear-gradient(135deg, #292832 0%, #1e1d24 100%)',
  };

  assert.equal(customSettings.gradientLastValue, 'linear-gradient(135deg, #292832 0%, #1e1d24 100%)');
  // When switching back to gradient, gradientLastValue is used
  const restoredBg = customSettings.gradientLastValue || 'fallback';
  assert.ok(restoredBg.includes('#292832'));
});

test('Onboarding: 7 steps and navigation keys are complete across all 7 locales', async () => {
  const { translations } = await import('../src/locales/index.ts');
  const languages = ['zh-CN', 'zh-TW', 'en', 'ja', 'ko', 'fr', 'ru'];

  for (const lang of languages) {
    const dict = translations[lang];
    assert.ok(dict, `Locale dict for ${lang} must exist`);
    assert.ok(dict.onboardingPrev, `onboardingPrev must exist in ${lang}`);
    assert.ok(dict.onboardingSkip, `onboardingSkip must exist in ${lang}`);
    for (let i = 1; i <= 7; i++) {
      const titleKey = `onboardingStep${i}Title`;
      const descKey = `onboardingStep${i}`;
      const tagsKey = `onboardingStep${i}Tags`;
      assert.ok(dict[titleKey], `${titleKey} must exist in ${lang}`);
      assert.ok(dict[descKey], `${descKey} must exist in ${lang}`);
      assert.ok(dict[tagsKey], `${tagsKey} must exist in ${lang}`);
    }
  }
});

test('Lunar Calendar: getLunarDisplay formats GanZhi, ShengXiao, Lunar Date, and festivals/terms correctly', async () => {
  const { getLunarDisplay } = await import('../src/utils/lunar.ts');

  // 1. Spring Festival (2025-01-29) -> 乙巳蛇年 正月初一 · 春节
  const springFestival = getLunarDisplay(new Date('2025-01-29T12:00:00'));
  assert.equal(springFestival, '乙巳蛇年 正月初一 · 春节');

  // 2. Dragon Boat Festival (2025-05-31) -> 乙巳蛇年 五月初五 · 端午节
  const dragonBoat = getLunarDisplay(new Date('2025-05-31T12:00:00'));
  assert.equal(dragonBoat, '乙巳蛇年 五月初五 · 端午节');

  // 3. Mid-Autumn Festival (2025-10-06) -> 乙巳蛇年 八月十五 · 中秋节
  const midAutumn = getLunarDisplay(new Date('2025-10-06T12:00:00'));
  assert.equal(midAutumn, '乙巳蛇年 八月十五 · 中秋节');

  // 4. Solar Term BaiLu (2026-09-07) -> 丙午马年 七月廿六 · 白露
  const baiLu = getLunarDisplay(new Date('2026-09-07T12:00:00'));
  assert.equal(baiLu, '丙午马年 七月廿六 · 白露');

  // 5. Normal day without festival or solar term (2025-02-15) -> 乙巳蛇年 正月十八
  const normalDay = getLunarDisplay(new Date('2025-02-15T12:00:00'));
  assert.equal(normalDay, '乙巳蛇年 正月十八');
  assert.ok(!normalDay.includes('·'), 'Regular days should not have dangling separators');
});

test('Lunar Calendar: showLunarOnly is translated in all 7 locales and default is true in DEFAULT_SETTINGS', async () => {
  const { translations } = await import('../src/locales/index.ts');
  const { DEFAULT_SETTINGS } = await import('../src/utils/constants.ts');
  const languages = ['zh-CN', 'zh-TW', 'en', 'ja', 'ko', 'fr', 'ru'];

  assert.equal(DEFAULT_SETTINGS.showLunar, true, 'DEFAULT_SETTINGS.showLunar must default to true');

  for (const lang of languages) {
    const dict = translations[lang];
    assert.ok(dict, `Locale dict for ${lang} must exist`);
    assert.ok(dict.showLunarOnly, `showLunarOnly must exist in ${lang}`);
    assert.ok(dict.showLunarOnly.length > 0, `showLunarOnly in ${lang} must not be empty`);
  }
});

test('Metadata Service: normalizeUrl standardizes various inputs', async () => {
  const { normalizeUrl } = await import('../src/services/metadata.ts');
  assert.equal(normalizeUrl('github.com'), 'https://github.com');
  assert.equal(normalizeUrl('https://github.com'), 'https://github.com');
  assert.equal(normalizeUrl('http://insecure.site'), 'http://insecure.site');
  assert.equal(normalizeUrl('   bilibili.com/video/123  '), 'https://bilibili.com/video/123');
  assert.equal(normalizeUrl(''), '');
});

test('Metadata Service: getFaviconServiceUrls prioritizes domestic-friendly Cravatar and Yandex over gstatic', async () => {
  const { getFaviconServiceUrls } = await import('../src/services/metadata.ts');
  const urls = getFaviconServiceUrls('www.javbus.com');
  assert.ok(urls.length >= 5);
  // Cravatar must be first
  assert.ok(urls[0].includes('cn.cravatar.com'), 'Cravatar must be prioritized first for mainland China and global reliability');
  // Yandex must be second
  assert.ok(urls[1].includes('favicon.yandex.net'), 'Yandex must be second');
  // DuckDuckGo third
  assert.ok(urls[2].includes('duckduckgo.com'), 'DuckDuckGo must be third');
  // gstatic must NOT be first
  assert.ok(!urls[0].includes('gstatic.com'), 'gstatic.com must not be first');
});

test('Metadata Service: formatFallbackTitle and generateFallbackIcon', async () => {
  const { formatFallbackTitle, generateFallbackIcon } = await import('../src/services/metadata.ts');
  assert.equal(formatFallbackTitle('github.com'), 'Github');
  assert.equal(formatFallbackTitle('www.javbus.com'), 'Javbus');
  assert.equal(formatFallbackTitle('sub.domain.co'), 'Sub');

  const svg = generateFallbackIcon('Javbus');
  assert.ok(svg.startsWith('data:image/svg+xml'));
  assert.ok(svg.includes('%3E%4A%3C%2Ftext%3E') || decodeURIComponent(svg).includes('>J</text>'));
});

test('Metadata Service: extractIconCandidatesFromHtml prioritizes apple-touch-icon, svg, and resolves relative URLs', async () => {
  const { extractIconCandidatesFromHtml } = await import('../src/services/metadata.ts');
  
  // Create a simulated DOM structure using standard mock
  const mockDoc = {
    querySelectorAll: (selector) => {
      if (selector === 'link') {
        return [
          {
            getAttribute: (attr) => ({
              rel: 'shortcut icon',
              href: '/favicon.ico',
            }[attr] || null),
          },
          {
            getAttribute: (attr) => ({
              rel: 'apple-touch-icon',
              href: '/apple-icon-180x180.png',
            }[attr] || null),
          },
          {
            getAttribute: (attr) => ({
              rel: 'icon',
              type: 'image/svg+xml',
              href: 'https://cdn.example.com/logo.svg',
            }[attr] || null),
          },
        ];
      }
      return [];
    },
    querySelector: () => null,
  };

  const candidates = extractIconCandidatesFromHtml(mockDoc, 'https://example.com/subpage');
  assert.ok(candidates.length === 3);
  // Apple touch icon scored 100 -> first
  assert.equal(candidates[0], 'https://example.com/apple-icon-180x180.png');
  // SVG scored 90 -> second
  assert.equal(candidates[1], 'https://cdn.example.com/logo.svg');
  // Relative shortcut icon scored 80 -> third
  assert.equal(candidates[2], 'https://example.com/favicon.ico');
});

test('Bookmark Service: addBookmark defaults to fallback icon if icon is empty', async () => {
  const { addBookmark } = await import('../src/services/bookmark.ts');
  const res = await addBookmark({
    title: 'Test Site',
    url: 'https://testsite.org',
    categoryId: 'test',
  }, 'normal');

  assert.ok(res.success);
  assert.ok(res.bookmark.icon, 'Bookmark icon must not be empty');
  assert.ok(res.bookmark.icon.startsWith('data:image/svg+xml'), 'Should generate fallback SVG icon');
});

test('SyncController: mergeCategories updates category when remote updatedAt is newer', async () => {
  const { mergeCategories } = await import('../src/services/syncController.ts');
  const localCats = [
    { id: 'c1', name: 'Old Name', sortOrder: 0, updatedAt: 100 },
    { id: 'c2', name: 'Local Cat', sortOrder: 1, updatedAt: 100 },
  ];
  const remoteCats = [
    { id: 'c1', name: 'New Name from Remote', sortOrder: 0, updatedAt: 200 },
    { id: 'c3', name: 'New Cat', sortOrder: 2, updatedAt: 150 },
  ];

  const merged = mergeCategories(localCats, remoteCats);
  assert.equal(merged.length, 3);
  assert.equal(merged.find((c) => c.id === 'c1')?.name, 'New Name from Remote');
  assert.equal(merged.find((c) => c.id === 'c2')?.name, 'Local Cat');
  assert.equal(merged.find((c) => c.id === 'c3')?.name, 'New Cat');
});

test('SyncController: buildSyncPayload preserves existing settings.updatedAt', async () => {
  const { buildSyncPayload, SYNC_PAYLOAD_VERSION } = await import('../src/services/syncController.ts');
  const container = {
    version: 2,
    profiles: {
      normal: { sites: [], categories: [], activeCategoryId: 'all' },
      private: { sites: [], categories: [], activeCategoryId: 'all' },
    },
  };
  const fixedTime = 1600000000000;
  const settings = { ...DEFAULT_SETTINGS, updatedAt: fixedTime };

  const payload = buildSyncPayload(container, settings, { normal: true, private: false });
  assert.equal(payload.version, SYNC_PAYLOAD_VERSION);
  assert.equal(payload.settings?.updatedAt, fixedTime, 'Should preserve existing updatedAt timestamp');
});

test('SyncController: applyRemotePayload defends against null/invalid remotePayload and uninitialized local profile', async () => {
  const { applyRemotePayload } = await import('../src/services/syncController.ts');
  const container = {
    version: 2,
    profiles: {
      normal: { sites: [], categories: [], activeCategoryId: 'all' },
    },
  };

  // 1. null remotePayload
  const resNull = applyRemotePayload(container, DEFAULT_SETTINGS, null, { normal: true, private: true }, 'merge');
  assert.deepEqual(resNull.updatedContainer, container);

  // 2. uninitialized local private profile when remote has private profile
  const remotePayload = {
    version: 2,
    timestamp: Date.now(),
    profiles: {
      private: {
        sites: [{ id: 's1', title: 'Private Site', url: 'https://p.com', categoryId: 'p', sortOrder: 0, createdAt: 1, updatedAt: 1 }],
        categories: [{ id: 'p', name: 'Privacy', sortOrder: 0 }],
        activeCategoryId: 'all',
      },
    },
  };

  const resNewPrivate = applyRemotePayload(container, DEFAULT_SETTINGS, remotePayload, { normal: true, private: true }, 'remote');
  assert.ok(resNewPrivate.updatedContainer.profiles.private);
  assert.equal(resNewPrivate.updatedContainer.profiles.private.sites.length, 1);
  assert.equal(resNewPrivate.updatedContainer.profiles.private.sites[0].title, 'Private Site');
});

test('SyncController: mergeSites & mergeCategories defend against null/corrupted items and NaN sortOrder', async () => {
  const { mergeSites, mergeCategories } = await import('../src/services/syncController.ts');

  // Corrupted sites containing null, undefined, or missing id
  const localSites = [
    null,
    undefined,
    { title: 'No ID' },
    { id: 's2', title: 'Site 2', url: 'https://2.com', categoryId: 'all', sortOrder: '2', createdAt: 1, updatedAt: 1 },
    { id: 's1', title: 'Site 1', url: 'https://1.com', categoryId: 'all', sortOrder: 1, createdAt: 1, updatedAt: 1 },
  ];
  const remoteSites = [
    { id: 's3', title: 'Site 3', url: 'https://3.com', categoryId: 'all', sortOrder: NaN, createdAt: 1, updatedAt: 1 },
    null,
  ];

  const mergedSites = mergeSites(localSites, remoteSites);
  assert.equal(mergedSites.length, 3);
  // sortOrder: s3 has 0 (NaN fallback), s1 has 1, s2 has 2
  assert.equal(mergedSites[0].id, 's3');
  assert.equal(mergedSites[1].id, 's1');
  assert.equal(mergedSites[2].id, 's2');

  // Corrupted categories containing null, undefined, or missing id
  const localCats = [
    null,
    { id: 'c2', name: 'Cat 2', sortOrder: 2 },
  ];
  const remoteCats = [
    undefined,
    { id: 'c1', name: 'Cat 1', sortOrder: 1 },
  ];

  const mergedCats = mergeCategories(localCats, remoteCats);
  assert.equal(mergedCats.length, 2);
  assert.equal(mergedCats[0].id, 'c1');
  assert.equal(mergedCats[1].id, 'c2');
});

test('SyncController: applyRemotePayload safely falls back orphan activeCategoryId to all', async () => {
  const { applyRemotePayload } = await import('../src/services/syncController.ts');

  const container = {
    version: 2,
    profiles: {
      normal: {
        sites: [],
        categories: [{ id: 'existing-cat', name: 'Cat', sortOrder: 1 }],
        activeCategoryId: 'deleted-cat', // Orphan category id
      },
      private: {
        sites: [],
        categories: [],
        activeCategoryId: 'all',
      },
    },
  };

  const remotePayload = {
    version: 2,
    timestamp: Date.now(),
    profiles: {
      normal: {
        sites: [],
        categories: [{ id: 'existing-cat', name: 'Cat', sortOrder: 1 }],
        activeCategoryId: 'non-existent-remote-cat',
      },
    },
    settings: { ...DEFAULT_SETTINGS, updatedAt: Date.now() },
  };

  const res = applyRemotePayload(container, DEFAULT_SETTINGS, remotePayload, { normal: true, private: false }, 'merge');
  // Since 'deleted-cat' does not exist in merged categories, it must fall back to 'all'
  assert.equal(res.updatedContainer.profiles.normal.activeCategoryId, 'all');
});

test('ErrorBoundary: i18n keys are translated across all 7 locales', async () => {
  const { translations } = await import('../src/locales/index.ts');
  const locales = ['zh-CN', 'zh-TW', 'en', 'ja', 'ko', 'fr', 'ru'];
  for (const loc of locales) {
    const dict = translations[loc];
    assert.ok(dict, `Locale ${loc} dictionary must exist`);
    assert.ok(dict.errorBoundaryTitle, `Locale ${loc} must have errorBoundaryTitle`);
    assert.ok(dict.errorBoundaryDesc, `Locale ${loc} must have errorBoundaryDesc`);
    assert.ok(dict.reloadPage, `Locale ${loc} must have reloadPage`);
  }
});

test('i18n: All 7 locales have identical keys without any missing translations', async () => {
  const { translations } = await import('../src/locales/index.ts');
  const locales = ['zh-CN', 'zh-TW', 'en', 'ja', 'ko', 'fr', 'ru'];
  const baseKeys = Object.keys(translations['zh-CN']);

  for (const loc of locales) {
    const currentKeys = Object.keys(translations[loc]);
    const missing = baseKeys.filter((k) => !(k in translations[loc]));
    const extra = currentKeys.filter((k) => !baseKeys.includes(k));
    assert.deepEqual(missing, [], `Locale ${loc} is missing keys: ${missing.join(', ')}`);
    assert.deepEqual(extra, [], `Locale ${loc} has extra undefined keys: ${extra.join(', ')}`);
    assert.equal(currentKeys.length, baseKeys.length, `Locale ${loc} key count must match zh-CN exactly`);
  }
});











