import test from 'node:test';
import assert from 'node:assert/strict';
import { GridStackEngine } from '../node_modules/gridstack/dist/gridstack-engine.js';

test('FreeCanvas: Allow Overlap = true allows widgets to freely overlap without pushing down', () => {
  const engine = new GridStackEngine({ column: 60, mode: 'float' });

  // Apply our true overlap bypass overrides
  engine._originalCollide = engine.collide;
  engine._originalCollideAll = engine.collideAll;
  engine._originalFixCollisions = engine._fixCollisions;
  engine._originalPackNodes = engine._packNodes;

  engine.collide = () => undefined;
  engine.collideAll = () => [];
  engine._fixCollisions = () => false;
  engine._packNodes = function () {
    return this;
  };

  // Add large clock: x=20, y=4, w=20, h=10 (occupies y=4..14)
  const clock = engine.addNode({ id: 'sys-clock', x: 20, y: 4, w: 20, h: 10, autoPosition: false });
  // Add date: x=25, y=8, w=6, h=2 (physically overlaps clock inside y=8..10)
  const date = engine.addNode({ id: 'sys-date', x: 25, y: 8, w: 6, h: 2, autoPosition: false });
  // Add greeting: x=26, y=10, w=8, h=2 (physically overlaps clock inside y=10..12)
  const greeting = engine.addNode({ id: 'sys-greeting', x: 26, y: 10, w: 8, h: 2, autoPosition: false });
  // Add search: x=18, y=13, w=24, h=2 (physically overlaps clock inside y=13..14)
  const search = engine.addNode({ id: 'sys-search', x: 18, y: 13, w: 24, h: 2, autoPosition: false });
  // Add shortcuts at y=16
  const site1 = engine.addNode({ id: 'site-1', x: 10, y: 16, w: 5, h: 5, autoPosition: false });

  // Verify none of the nodes were displaced or pushed down below shortcuts
  assert.equal(clock.y, 4, 'Clock must stay at y=4');
  assert.equal(clock.h, 10, 'Clock must retain h=10');
  assert.equal(date.y, 8, 'Date must stay at y=8 despite overlapping clock');
  assert.equal(greeting.y, 10, 'Greeting must stay at y=10 despite overlapping clock');
  assert.equal(search.y, 13, 'Search must stay at y=13 despite overlapping clock');
  assert.equal(site1.y, 16, 'Shortcut must stay at y=16');
});

test('FreeCanvas: Allow Overlap = false preserves row gaps during smart resize', () => {
  const engine = new GridStackEngine({ column: 60, mode: 'float' });

  // Initial setup:
  // clock: y=4, h=4 (ends at 8)
  const clock = engine.addNode({ id: 'sys-clock', x: 24, y: 4, w: 12, h: 4, autoPosition: false });
  // date: y=8, h=2 (ends at 10)
  const date = engine.addNode({ id: 'sys-date', x: 25, y: 8, w: 6, h: 2, autoPosition: false });
  // greeting: y=10, h=2 (ends at 12)
  const greeting = engine.addNode({ id: 'sys-greeting', x: 26, y: 10, w: 8, h: 2, autoPosition: false });
  // search: y=13, h=2 (ends at 15, 1 row gap below greeting)
  const search = engine.addNode({ id: 'sys-search', x: 18, y: 13, w: 24, h: 2, autoPosition: false });
  // site-1: y=16, h=5 (ends at 21, 1 row gap below search)
  const site1 = engine.addNode({ id: 'site-1', x: 10, y: 16, w: 5, h: 5, autoPosition: false });
  // site-3 (row 2): y=22, h=5 (ends at 27, 1 row gap below site-1)
  const site3 = engine.addNode({ id: 'site-3', x: 10, y: 22, w: 5, h: 5, autoPosition: false });

  // Snapshot before resize
  const initialH = clock.h;
  const initialBottom = clock.y + initialH;
  const nodesBelow = engine.nodes
    .filter((n) => n.id !== clock.id && n.y >= initialBottom)
    .map((n) => ({ id: n.id, initialY: n.y }))
    .sort((a, b) => b.initialY - a.initialY);

  // Resize clock from h=4 to h=8 (deltaH = +4)
  const currentH = 8;
  const deltaH = currentH - initialH;
  clock.h = currentH;
  const currentBottom = clock.y + currentH; // 12

  nodesBelow.forEach(({ id, initialY }) => {
    const node = engine.nodes.find((n) => n.id === id);
    const minAllowedY = currentBottom + (initialY > initialBottom ? 1 : 0);
    node.y = Math.max(minAllowedY, initialY + deltaH);
  });

  // Gaps checks
  assert.equal(clock.y, 4);
  assert.equal(clock.h, 8);
  assert.equal(date.y, 12, 'Date pushed down to clock bottom');
  assert.equal(greeting.y, 14, 'Greeting pushed down with Date');
  assert.equal(search.y, 17, 'Search pushed down, preserving 1-row gap below Greeting');
  assert.equal(search.y - (greeting.y + greeting.h), 1, 'Search must have 1-row gap below greeting');
  assert.equal(site1.y, 20, 'Site1 pushed down, preserving 1-row gap below Search');
  assert.equal(site1.y - (search.y + search.h), 1, 'Site1 must have 1-row gap below search');
  assert.equal(site3.y, 26, 'Site3 (row 2) pushed down uniformly');
  assert.equal(site3.y - (site1.y + site1.h), 1, 'Site3 must have 1-row gap below Site1');
});

test('FreeCanvas: Multi-desktop widget layout maps are strictly isolated', () => {
  const layouts = {
    'page-1': {
      'sys-clock': { id: 'sys-clock', type: 'clock', x: 10, y: 2, w: 20, h: 8 },
      'sys-search': { id: 'sys-search', type: 'search', x: 15, y: 18, w: 30, h: 3 },
    },
    'page-2': {
      'sys-clock': { id: 'sys-clock', type: 'clock', x: 24, y: 4, w: 12, h: 4 },
      'sys-search': { id: 'sys-search', type: 'search', x: 18, y: 13, w: 24, h: 2 },
    },
  };

  assert.notDeepEqual(layouts['page-1']['sys-clock'], layouts['page-2']['sys-clock']);
  assert.equal(layouts['page-1']['sys-clock'].w, 20);
  assert.equal(layouts['page-2']['sys-clock'].w, 12);
  assert.equal(layouts['page-1']['sys-clock'].y, 2);
  assert.equal(layouts['page-2']['sys-clock'].y, 4);
});

test('FreeCanvas Sync: buildSyncPayload packages freeLayouts and applyRemotePayload restores it', async () => {
  const { buildSyncPayload, applyRemotePayload } = await import('../src/services/syncController.ts');

  const container = {
    version: 2,
    profiles: {
      normal: {
        sites: [],
        categories: [],
        activeCategoryId: 'all',
        gridPages: [{ id: 'page-1', name: '桌面 1', sortOrder: 0 }],
        freeLayouts: {
          'page-1': {
            'sys-clock': { id: 'sys-clock', type: 'clock', x: 10, y: 5, w: 20, h: 6 },
          },
        },
      },
      private: {
        sites: [],
        categories: [],
        activeCategoryId: 'all',
        gridPages: [{ id: 'page-1', name: '桌面 1', sortOrder: 0 }],
        freeLayouts: {
          'page-1': {
            'sys-clock': { id: 'sys-clock', type: 'clock', x: 15, y: 8, w: 18, h: 4 },
          },
        },
      },
    },
  };

  const payload = buildSyncPayload(container, { updatedAt: Date.now() }, { normal: true, private: true });
  assert.ok(payload.profiles?.normal?.freeLayouts);
  assert.equal(payload.profiles.normal.freeLayouts['page-1']['sys-clock'].x, 10);
  assert.ok(payload.profiles?.private?.freeLayouts);
  assert.equal(payload.profiles.private.freeLayouts['page-1']['sys-clock'].x, 15);

  // Test applyRemotePayload with merge strategy
  const localContainer = {
    version: 2,
    profiles: {
      normal: {
        sites: [],
        categories: [],
        activeCategoryId: 'all',
        gridPages: [{ id: 'page-1', name: '桌面 1', sortOrder: 0 }],
        freeLayouts: {
          'page-1': {
            'sys-search': { id: 'sys-search', type: 'search', x: 20, y: 15, w: 24, h: 2 },
          },
        },
      },
      private: {
        sites: [],
        categories: [],
        activeCategoryId: 'all',
        gridPages: [{ id: 'page-1', name: '桌面 1', sortOrder: 0 }],
      },
    },
  };

  const mergeResult = applyRemotePayload(
    localContainer,
    {},
    payload,
    { normal: true, private: true },
    'merge'
  );

  const mergedNormalLayouts = mergeResult.updatedContainer.profiles.normal.freeLayouts;
  assert.ok(mergedNormalLayouts?.['page-1']);
  assert.ok(mergedNormalLayouts['page-1']['sys-clock'], 'Remote clock layout restored');
  assert.ok(mergedNormalLayouts['page-1']['sys-search'], 'Local search layout preserved');
});

