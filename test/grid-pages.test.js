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
  getProfileData,
  saveActiveCategory,
  savePageCategoryMap,
  saveCategories,
  saveSites,
  loadAppState,
} = await import('../src/services/storage.ts');

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
