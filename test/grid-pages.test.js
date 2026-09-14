// Mock storage for Node test environment
const mockStorage = new Map();
globalThis.localStorage = {
  getItem: (key) => mockStorage.get(key) ?? null,
  setItem: (key, val) => mockStorage.set(key, String(val)),
  removeItem: (key) => mockStorage.delete(key),
  clear: () => mockStorage.clear(),
};

globalThis.chrome = {
  runtime: { id: 'mytab-test-extension' },
  storage: {
    local: {
      get: async (keys) => {
        if (typeof keys === 'string') {
          return { [keys]: mockStorage.get(keys) ? JSON.parse(mockStorage.get(keys)) : undefined };
        }
        const res = {};
        for (const k of (Array.isArray(keys) ? keys : Object.keys(keys))) {
          if (mockStorage.has(k)) {
            res[k] = JSON.parse(mockStorage.get(k));
          }
        }
        return res;
      },
      set: async (obj) => {
        for (const [k, v] of Object.entries(obj)) {
          mockStorage.set(k, JSON.stringify(v));
        }
      },
    },
  },
};

import test from 'node:test';
import assert from 'node:assert/strict';

const {
  DEFAULT_GRID_PAGES,
  saveGridPages,
  saveActiveGridPageId,
  deleteGridPage,
  moveCategoryToGridPage,
  moveSiteToGridPage,
  getProfileData,
  saveActiveCategory,
  savePageCategoryMap,
  saveCategories,
  saveSites,
  loadAppState,
  exportAllData,
  importData,
} = await import('../src/services/storage.ts');

const {
  buildSyncPayload,
  applyRemotePayload,
  mergeSites,
  mergeGridPages,
} = await import('../src/services/syncController.ts');

test('Grid Pages: DEFAULT_GRID_PAGES provides clean initial desktop page', () => {
  assert.equal(Array.isArray(DEFAULT_GRID_PAGES), true);
  assert.equal(DEFAULT_GRID_PAGES.length, 1);
  assert.equal(DEFAULT_GRID_PAGES[0].id, 'page-1');
  assert.equal(DEFAULT_GRID_PAGES[0].name, '桌面 1');
});

test('Grid Pages: saveGridPages persists multiple pages to profile', async () => {
  mockStorage.clear();
  const pages = [
    { id: 'page-1', name: '工作台', sortOrder: 0 },
    { id: 'page-2', name: '娱乐', sortOrder: 1 },
    { id: 'page-3', name: '常用工具', sortOrder: 2 },
  ];

  await saveGridPages(pages, 'normal');
  const profile = await getProfileData('normal');

  assert.equal(profile.gridPages?.length, 3);
  assert.equal(profile.gridPages?.[0].name, '工作台');
  assert.equal(profile.gridPages?.[1].name, '娱乐');
  assert.equal(profile.gridPages?.[2].name, '常用工具');
});

test('Grid Pages: deleteGridPage migrates assigned sites to remaining first page', async () => {
  mockStorage.clear();
  const pages = [
    { id: 'page-1', name: '桌面 1', sortOrder: 0 },
    { id: 'page-2', name: '桌面 2', sortOrder: 1 },
  ];
  await saveGridPages(pages, 'normal');

  const sites = [
    { id: 's1', title: 'Site 1', url: 'https://site1.com', categoryId: 'c1', sortOrder: 0, createdAt: 1, updatedAt: 1, pageId: 'page-1' },
    { id: 's2', title: 'Site 2', url: 'https://site2.com', categoryId: 'c1', sortOrder: 1, createdAt: 1, updatedAt: 1, pageId: 'page-2' },
    { id: 's3', title: 'Site 3', url: 'https://site3.com', categoryId: 'c2', sortOrder: 2, createdAt: 1, updatedAt: 1, pageId: 'page-2' },
  ];
  await saveSites(sites, 'normal');

  // Delete page-2
  await deleteGridPage('page-2', 'normal');
  const profile = await getProfileData('normal');

  // Verify page-2 is removed
  assert.equal(profile.gridPages?.length, 1);
  assert.equal(profile.gridPages?.[0].id, 'page-1');

  // Verify sites originally on page-2 are reassigned to page-1 without data loss
  const s2 = profile.sites.find((s) => s.id === 's2');
  const s3 = profile.sites.find((s) => s.id === 's3');
  assert.equal(s2?.pageId, 'page-1');
  assert.equal(s3?.pageId, 'page-1');
  assert.equal(profile.sites.length, 3);
});

test('Grid Pages: moveCategoryToGridPage migrates category and its sites to target desktop page', async () => {
  mockStorage.clear();
  const categories = [
    { id: 'cat-work', name: '工作', sortOrder: 0, pageId: 'page-1' },
    { id: 'cat-life', name: '生活', sortOrder: 1, pageId: 'page-1' },
  ];
  await saveCategories(categories, 'normal');

  const sites = [
    { id: 's1', title: 'Work 1', url: 'https://w1.com', categoryId: 'cat-work', sortOrder: 0, createdAt: 1, updatedAt: 1, pageId: 'page-1' },
    { id: 's2', title: 'Work 2', url: 'https://w2.com', categoryId: 'cat-work', sortOrder: 1, createdAt: 1, updatedAt: 1, pageId: 'page-1' },
    { id: 's3', title: 'Life 1', url: 'https://l1.com', categoryId: 'cat-life', sortOrder: 2, createdAt: 1, updatedAt: 1, pageId: 'page-1' },
  ];
  await saveSites(sites, 'normal');

  // Move 'cat-work' to 'page-2'
  await moveCategoryToGridPage('cat-work', 'page-2', 'normal');
  const profile = await getProfileData('normal');

  // Category pageId updated
  const movedCat = profile.categories.find((c) => c.id === 'cat-work');
  assert.equal(movedCat?.pageId, 'page-2');

  // Sites in cat-work migrated to page-2
  const s1 = profile.sites.find((s) => s.id === 's1');
  const s2 = profile.sites.find((s) => s.id === 's2');
  const s3 = profile.sites.find((s) => s.id === 's3');
  assert.equal(s1?.pageId, 'page-2');
  assert.equal(s2?.pageId, 'page-2');
  // Site in cat-life remains on page-1
  assert.equal(s3?.pageId, 'page-1');
});

test('CategoryTabs: Configurable maxNavCategories folds categories correctly', () => {
  const computeSplit = (cats, maxNav = 6) => {
    if (maxNav > 0 && cats.length > maxNav) {
      return {
        visible: cats.slice(0, maxNav),
        overflow: cats.slice(maxNav),
      };
    }
    return {
      visible: cats,
      overflow: [],
    };
  };

  const tenCats = Array.from({ length: 10 }, (_, i) => ({ id: `cat-${i}`, name: `Cat ${i}` }));

  // Limit 6 (default): 6 visible, 4 overflow
  const resDefault = computeSplit(tenCats, 6);
  assert.equal(resDefault.visible.length, 6);
  assert.equal(resDefault.overflow.length, 4);

  // Limit 4: 4 visible, 6 overflow
  const res4 = computeSplit(tenCats, 4);
  assert.equal(res4.visible.length, 4);
  assert.equal(res4.overflow.length, 6);

  // Limit 0 (Unlimited): 10 visible, 0 overflow
  const resUnlimited = computeSplit(tenCats, 0);
  assert.equal(resUnlimited.visible.length, 10);
  assert.equal(resUnlimited.overflow.length, 0);
});

test('BookmarkImport: Tree cascading selection and tri-state calculation', () => {
  const tree = [
    {
      id: 'root-1',
      title: '书签栏',
      children: [
        {
          id: 'sub-dev',
          title: '开发',
          children: [
            { id: 'sub-fe', title: '前端', children: [{ id: 'bm1', title: 'Vue', url: 'https://vuejs.org' }] },
            { id: 'sub-be', title: '后端', children: [{ id: 'bm2', title: 'Go', url: 'https://golang.org' }] },
          ],
        },
      ],
    },
  ];

  function getDescendantFolderIds(node) {
    const ids = [];
    if (node.children) {
      ids.push(node.id);
      for (const child of node.children) {
        if (child.children) {
          ids.push(...getDescendantFolderIds(child));
        }
      }
    }
    return ids;
  }

  function toggleFolder(selectedIds, targetNode) {
    const subtreeIds = getDescendantFolderIds(targetNode);
    const allSelected = subtreeIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      const toRemove = new Set(subtreeIds);
      return selectedIds.filter((id) => !toRemove.has(id));
    } else {
      const toAdd = subtreeIds.filter((id) => !selectedIds.includes(id));
      return [...selectedIds, ...toAdd];
    }
  }

  const devNode = tree[0].children[0];
  const feNode = devNode.children[0];

  // 1. Initial selection of 'devNode' selects 'sub-dev', 'sub-fe', and 'sub-be'
  let selected = toggleFolder([], devNode);
  assert.equal(selected.includes('sub-dev'), true);
  assert.equal(selected.includes('sub-fe'), true);
  assert.equal(selected.includes('sub-be'), true);

  // 2. Deselecting only 'sub-fe' manually:
  selected = toggleFolder(selected, feNode);
  assert.equal(selected.includes('sub-fe'), false);
  assert.equal(selected.includes('sub-dev'), true);
  assert.equal(selected.includes('sub-be'), true);

  // Check tri-state for 'devNode'
  const devSubtreeIds = getDescendantFolderIds(devNode);
  const selectedCount = devSubtreeIds.filter((id) => selected.includes(id)).length;
  const isAllSelected = selectedCount === devSubtreeIds.length;
  const isIndeterminate = selectedCount > 0 && selectedCount < devSubtreeIds.length;

  assert.equal(isAllSelected, false);
  assert.equal(isIndeterminate, true);

  // 3. Clicking indeterminate 'devNode' again re-selects all descendants
  selected = toggleFolder(selected, devNode);
  assert.equal(selected.includes('sub-fe'), true);
  assert.equal(selected.includes('sub-be'), true);

  // 4. Clicking fully selected 'devNode' deselects all descendants
  selected = toggleFolder(selected, devNode);
  assert.equal(selected.includes('sub-dev'), false);
  assert.equal(selected.includes('sub-fe'), false);
  assert.equal(selected.includes('sub-be'), false);
});

test('Grid Pages: activeGridPageId is persisted and restored via loadAppState', async () => {
  mockStorage.clear();
  const pages = [
    { id: 'page-1', name: '桌面 1', sortOrder: 0 },
    { id: 'page-2', name: '桌面 2', sortOrder: 1 },
    { id: 'page-3', name: '桌面 3', sortOrder: 2 },
  ];
  await saveGridPages(pages, 'normal');

  // Initial load defaults to page-1
  let state = await loadAppState('normal');
  assert.equal(state.activeGridPageId, 'page-1');

  // Switch to page-3 and persist
  await saveActiveGridPageId('page-3', 'normal');

  // Next tab loadAppState restores page-3
  state = await loadAppState('normal');
  assert.equal(state.activeGridPageId, 'page-3');

  // Deleting the active page-3 falls back to page-1
  await deleteGridPage('page-3', 'normal');
  state = await loadAppState('normal');
  assert.equal(state.activeGridPageId, 'page-1');
});

test('Grid Pages: pageCategoryMap is persisted per desktop and restored via loadAppState', async () => {
  mockStorage.clear();
  const pages = [
    { id: 'page-1', name: '桌面 1', sortOrder: 0 },
    { id: 'page-2', name: '桌面 2', sortOrder: 1 },
  ];
  await saveGridPages(pages, 'normal');

  // Select category 'cat-work' on page-1
  const map1 = { 'page-1': 'cat-work' };
  await saveActiveCategory('cat-work', map1, 'normal');

  let state = await loadAppState('normal');
  assert.equal(state.pageCategoryMap?.['page-1'], 'cat-work');
  assert.equal(state.activeCategoryId, 'cat-work');

  // Select category 'cat-design' on page-2
  const map2 = { 'page-1': 'cat-work', 'page-2': 'cat-design' };
  await saveActiveCategory('cat-design', map2, 'normal');

  state = await loadAppState('normal');
  assert.equal(state.pageCategoryMap?.['page-1'], 'cat-work');
  assert.equal(state.pageCategoryMap?.['page-2'], 'cat-design');

  // Delete page-2 -> pageCategoryMap removes 'page-2'
  await deleteGridPage('page-2', 'normal');
  state = await loadAppState('normal');
  assert.equal(state.pageCategoryMap?.['page-1'], 'cat-work');
  assert.equal(state.pageCategoryMap?.['page-2'], undefined);
});

test('Grid Pages Sync: buildSyncPayload packages multi-desktop gridPages, activeGridPageId, and pageCategoryMap', () => {
  const container = {
    version: 2,
    profiles: {
      normal: {
        sites: [{ id: 's1', title: 'GitHub', url: 'https://github.com', categoryId: 'cat-1', pageId: 'page-1' }],
        categories: [{ id: 'cat-1', name: '开发', pageId: 'page-1' }, { id: 'cat-2', name: '设计', pageId: 'page-2' }],
        activeCategoryId: 'cat-1',
        gridPages: [
          { id: 'page-1', name: '桌面 1', sortOrder: 0 },
          { id: 'page-2', name: '桌面 2', sortOrder: 1 },
        ],
        activeGridPageId: 'page-2',
        pageCategoryMap: { 'page-1': 'cat-1', 'page-2': 'cat-2' },
      },
      private: {
        sites: [],
        categories: [],
        activeCategoryId: 'all',
        gridPages: DEFAULT_GRID_PAGES,
        activeGridPageId: 'page-1',
        pageCategoryMap: { 'page-1': 'all' },
      },
    },
  };

  const payload = buildSyncPayload(container, {}, { normal: true, private: true });

  assert.ok(payload.profiles?.normal);
  assert.equal(payload.profiles.normal.gridPages?.length, 2);
  assert.equal(payload.profiles.normal.gridPages[1].id, 'page-2');
  assert.equal(payload.profiles.normal.activeGridPageId, 'page-2');
  assert.equal(payload.profiles.normal.pageCategoryMap?.['page-2'], 'cat-2');

  assert.ok(payload.profiles?.private);
  assert.equal(payload.profiles.private.gridPages?.length, 1);
});

test('Grid Pages Sync: applyRemotePayload restores multi-desktop structure and deduplicates sites', () => {
  const localContainer = {
    version: 2,
    profiles: {
      normal: {
        sites: [
          { id: 'site-github', title: 'GitHub', url: 'https://github.com', categoryId: 'work', pageId: 'page-1', updatedAt: 1000 },
        ],
        categories: [{ id: 'work', name: '工作', pageId: 'page-1' }],
        activeCategoryId: 'work',
        gridPages: DEFAULT_GRID_PAGES,
        activeGridPageId: 'page-1',
        pageCategoryMap: { 'page-1': 'work' },
      },
      private: { sites: [], categories: [], activeCategoryId: 'all' },
    },
  };

  const remotePayload = {
    version: 2,
    timestamp: Date.now(),
    profiles: {
      normal: {
        sites: [
          // Duplicate site with custom ID on remote, same URL, same category, same page
          { id: 'site-custom-1', title: 'GitHub Pro', url: 'https://github.com/', categoryId: 'work', pageId: 'page-1', updatedAt: 2000 },
          // Site on desktop 2
          { id: 'site-figma', title: 'Figma', url: 'https://figma.com', categoryId: 'design', pageId: 'page-2', updatedAt: 2000 },
        ],
        categories: [
          { id: 'work', name: '工作', pageId: 'page-1' },
          { id: 'design', name: '设计与灵感', pageId: 'page-2' },
        ],
        activeCategoryId: 'design',
        gridPages: [
          { id: 'page-1', name: '工作台', sortOrder: 0 },
          { id: 'page-2', name: '设计创作', sortOrder: 1 },
        ],
        activeGridPageId: 'page-2',
        pageCategoryMap: { 'page-1': 'work', 'page-2': 'design' },
      },
    },
    settings: {},
  };

  // Test 'remote' overwrite strategy
  const resRemote = applyRemotePayload(localContainer, {}, remotePayload, { normal: true, private: false }, 'remote');
  const normalProfile = resRemote.updatedContainer.profiles.normal;

  assert.equal(normalProfile.gridPages?.length, 2);
  assert.equal(normalProfile.gridPages[1].name, '设计创作');
  assert.equal(normalProfile.activeGridPageId, 'page-2');
  assert.equal(normalProfile.pageCategoryMap?.['page-2'], 'design');
  assert.equal(normalProfile.categories.length, 2);
  assert.equal(normalProfile.sites.length, 2); // No duplicate github shortcuts

  // Test 'merge' strategy with site deduplication
  const resMerge = applyRemotePayload(localContainer, {}, remotePayload, { normal: true, private: false }, 'merge');
  const mergedNormal = resMerge.updatedContainer.profiles.normal;

  assert.equal(mergedNormal.gridPages?.length, 2);
  assert.equal(mergedNormal.pageCategoryMap?.['page-2'], 'design');
  // Duplicate github.com should be merged into 1 site, not 2!
  const githubSites = mergedNormal.sites.filter(s => s.url.includes('github.com'));
  assert.equal(githubSites.length, 1);
  assert.equal(githubSites[0].title, 'GitHub Pro'); // Kept newer title from remote
});

test('Grid Pages Backup: exportAllData & importData restore multi-desktop structure', async () => {
  mockStorage.clear();

  const pages = [
    { id: 'page-1', name: '主桌面', sortOrder: 0 },
    { id: 'page-2', name: '副桌面', sortOrder: 1 },
  ];
  await saveGridPages(pages, 'normal');
  await saveActiveGridPageId('page-2', 'normal');
  await savePageCategoryMap({ 'page-1': 'cat-1', 'page-2': 'cat-2' }, 'normal');

  const jsonBackup = await exportAllData(['normal']);
  assert.ok(jsonBackup.includes('副桌面'));

  // Reset to single page
  mockStorage.clear();
  let state = await loadAppState('normal');
  assert.equal(state.gridPages?.length, 1);

  // Restore from JSON backup
  const importRes = await importData(jsonBackup);
  assert.equal(importRes.success, true);

  state = await loadAppState('normal');
  assert.equal(state.gridPages?.length, 2);
  assert.equal(state.gridPages[1].name, '副桌面');
  assert.equal(state.activeGridPageId, 'page-2');
  assert.equal(state.pageCategoryMap?.['page-2'], 'cat-2');
});

test('Grid Pages: moveSiteToGridPage moves single site to target desktop page', async () => {
  mockStorage.clear();

  const initialSites = [
    { id: 'site-1', title: 'Site 1', url: 'https://site1.com', categoryId: 'cat-1', pageId: 'page-1' },
    { id: 'site-2', title: 'Site 2', url: 'https://site2.com', categoryId: 'cat-1', pageId: 'page-1' },
  ];
  await saveSites(initialSites, 'normal');

  // Move site-1 to page-2 with category 'cat-2'
  await moveSiteToGridPage('site-1', 'page-2', 'cat-2', 'normal');

  const profile = await getProfileData('normal');
  const site1 = profile.sites.find((s) => s.id === 'site-1');
  const site2 = profile.sites.find((s) => s.id === 'site-2');

  assert.equal(site1.pageId, 'page-2');
  assert.equal(site1.categoryId, 'cat-2');
  assert.equal(site2.pageId, 'page-1');
  assert.equal(site2.categoryId, 'cat-1');
});

test('Grid Pages: importData and loadAppState normalize legacy or dangling pageId', async () => {
  mockStorage.clear();

  // Simulated backup data with custom desktop IDs where sites have legacy pageId ('page-1' or undefined or dangling)
  const legacyBackup = {
    version: 2,
    timestamp: Date.now(),
    profiles: {
      normal: {
        gridPages: [
          { id: 'page-custom-1', name: '工作桌面', sortOrder: 0 },
          { id: 'page-custom-2', name: '娱乐桌面', sortOrder: 1 },
        ],
        activeGridPageId: 'page-custom-1',
        categories: [
          { id: 'cat-1', name: '工作分类', pageId: 'page-1' }, // Legacy pageId 'page-1' does not exist in gridPages
          { id: 'cat-2', name: '娱乐分类', pageId: 'page-custom-2' },
        ],
        sites: [
          { id: 's1', title: 'Site 1', url: 'https://1.com', categoryId: 'cat-1', pageId: 'page-1' }, // Legacy pageId 'page-1'
          { id: 's2', title: 'Site 2', url: 'https://2.com', categoryId: 'cat-1' }, // Missing pageId
          { id: 's3', title: 'Site 3', url: 'https://3.com', categoryId: 'cat-2', pageId: 'page-custom-2' },
        ],
        pageCategoryMap: { 'page-custom-1': 'cat-1', 'page-custom-2': 'cat-2' },
      },
    },
  };

  const res = await importData(JSON.stringify(legacyBackup));
  assert.equal(res.success, true);

  const state = await loadAppState('normal');
  assert.equal(state.gridPages?.length, 2);
  assert.equal(state.activeGridPageId, 'page-custom-1');

  // s1 and s2 should have been normalized to page-custom-1, s3 remains on page-custom-2
  const s1 = state.sites.find((s) => s.id === 's1');
  const s2 = state.sites.find((s) => s.id === 's2');
  const s3 = state.sites.find((s) => s.id === 's3');
  assert.equal(s1?.pageId, 'page-custom-1');
  assert.equal(s2?.pageId, 'page-custom-1');
  assert.equal(s3?.pageId, 'page-custom-2');

  // cat-1 should have been normalized to page-custom-1
  const cat1 = state.categories.find((c) => c.id === 'cat-1');
  const cat2 = state.categories.find((c) => c.id === 'cat-2');
  assert.equal(cat1?.pageId, 'page-custom-1');
  assert.equal(cat2?.pageId, 'page-custom-2');
});

test('Grid Pages: Desktop context menu never shows current desktop in Move To options', () => {
  const gridPages = [
    { id: 'page-custom-1', name: '桌面 1', sortOrder: 0 },
    { id: 'page-custom-2', name: '桌面 2', sortOrder: 1 },
  ];

  // Helper simulating the filter logic used in SiteCard and CategoryTabs
  function getMoveTargets(site, currentPageId, activeGridPageId) {
    const currentDesktopId =
      currentPageId ||
      (site.pageId && gridPages.some((p) => p.id === site.pageId) ? site.pageId : undefined) ||
      (activeGridPageId && gridPages.some((p) => p.id === activeGridPageId) ? activeGridPageId : undefined) ||
      gridPages[0]?.id;
    return gridPages.filter((p) => p.id !== currentDesktopId);
  }

  // Case 1: Site physically rendered on Desktop 1 (currentPageId = 'page-custom-1') with legacy pageId = 'page-1'
  const siteWithLegacyPageId = { id: 's1', title: 'Test', url: 'https://test.com', pageId: 'page-1' };
  const targets1 = getMoveTargets(siteWithLegacyPageId, 'page-custom-1', 'page-custom-1');
  assert.equal(targets1.length, 1);
  assert.equal(targets1[0].id, 'page-custom-2');
  assert.equal(targets1.some((p) => p.id === 'page-custom-1'), false);

  // Case 2: Site with missing pageId rendered on Desktop 1
  const siteNoPageId = { id: 's2', title: 'Test', url: 'https://test.com' };
  const targets2 = getMoveTargets(siteNoPageId, 'page-custom-1', 'page-custom-2');
  assert.equal(targets2.length, 1);
  assert.equal(targets2[0].id, 'page-custom-2');
  assert.equal(targets2.some((p) => p.id === 'page-custom-1'), false);

  // Case 3: Site rendered on Desktop 2
  const siteOnPage2 = { id: 's3', title: 'Test', url: 'https://test.com', pageId: 'page-custom-2' };
  const targets3 = getMoveTargets(siteOnPage2, 'page-custom-2', 'page-custom-1');
  assert.equal(targets3.length, 1);
  assert.equal(targets3[0].id, 'page-custom-1');
  assert.equal(targets3.some((p) => p.id === 'page-custom-2'), false);
});


