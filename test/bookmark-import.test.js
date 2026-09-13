// Mock minimal chrome runtime in Node environment
globalThis.chrome = {
  runtime: { id: 'mytab-test-extension' },
  permissions: {
    contains: async () => true,
    request: async () => true,
  },
  bookmarks: {
    getTree: async () => [],
  },
};

import test from 'node:test';
import assert from 'node:assert/strict';

const { transformBookmarkTree, calculateImportPreview } = await import('../src/services/bookmarkImporter.ts');
const { isValidWebUrl } = await import('../src/services/bookmarkHtmlParser.ts');

test('BookmarkImporter: isValidWebUrl correctly filters non-web schemes', () => {
  assert.equal(isValidWebUrl('https://google.com'), true);
  assert.equal(isValidWebUrl('http://github.com/test'), true);
  assert.equal(isValidWebUrl('chrome://bookmarks'), false);
  assert.equal(isValidWebUrl('edge://settings'), false);
  assert.equal(isValidWebUrl('javascript:void(0)'), false);
  assert.equal(isValidWebUrl('data:text/html,<h1>test</h1>'), false);
  assert.equal(isValidWebUrl('file:///C:/test.html'), false);
  assert.equal(isValidWebUrl(''), false);
  assert.equal(isValidWebUrl(undefined), false);
});

test('BookmarkImporter: Smart flatten creates category for direct links and ignores empty containers', () => {
  const mockTree = [
    {
      id: '1',
      title: '书签栏',
      children: [
        { id: 'bm1', title: 'Google', url: 'https://google.com' },
        {
          id: 'f-empty',
          title: '空目录',
          children: [],
        },
        {
          id: 'f-dev',
          title: '开发',
          children: [
            {
              id: 'f-frontend',
              title: '前端',
              children: [
                {
                  id: 'f-react',
                  title: 'React生态',
                  children: [
                    { id: 'bm2', title: 'React Docs', url: 'https://react.dev' },
                    { id: 'bm3', title: 'Next.js', url: 'https://nextjs.org' },
                  ],
                },
              ],
            },
            {
              id: 'f-backend',
              title: '后端',
              children: [
                { id: 'bm4', title: 'Node.js', url: 'https://nodejs.org' },
              ],
            },
          ],
        },
      ],
    },
  ];

  const groups = transformBookmarkTree(mockTree, {
    strategy: 'smart',
    duplicateStrategy: 'skip',
    selectedFolderIds: [],
    targetProfileId: 'normal',
  });

  // Expected groups:
  // 1. '书签栏' (contains Google)
  // 2. 'React生态' (contains React Docs, Next.js)
  // 3. '后端' (contains Node.js)
  // '开发' and '前端' have 0 direct links and only branch out to children with content -> ignored as empty containers
  assert.equal(groups.length, 3);
  assert.equal(groups[0].categoryName, '书签栏');
  assert.equal(groups[0].bookmarks.length, 1);

  assert.equal(groups[1].categoryName, 'React生态');
  assert.equal(groups[1].bookmarks.length, 2);

  assert.equal(groups[2].categoryName, '后端');
  assert.equal(groups[2].bookmarks.length, 1);
});

test('BookmarkImporter: Disambiguates duplicate category names using parent path', () => {
  const mockTree = [
    {
      id: 'root',
      title: '书签',
      children: [
        {
          id: 'f1',
          title: '工作',
          children: [
            {
              id: 'f1-fe',
              title: '前端',
              children: [
                { id: 'b1', title: 'Work Tool', url: 'https://work.internal' },
              ],
            },
          ],
        },
        {
          id: 'f2',
          title: '学习',
          children: [
            {
              id: 'f2-fe',
              title: '前端',
              children: [
                { id: 'b2', title: 'Study Tutorial', url: 'https://tutorial.com' },
              ],
            },
          ],
        },
      ],
    },
  ];

  const groups = transformBookmarkTree(mockTree, {
    strategy: 'smart',
    duplicateStrategy: 'skip',
    selectedFolderIds: [],
    targetProfileId: 'normal',
  });

  assert.equal(groups.length, 2);
  // Both folders were named '前端'. Disambiguation should prepend parent path
  assert.equal(groups[0].categoryName, '工作 / 前端');
  assert.equal(groups[1].categoryName, '学习 / 前端');
});

test('BookmarkImporter: Top-Level strategy rolls up child links into root child folders', () => {
  const mockTree = [
    {
      id: 'root',
      title: '书签栏',
      children: [
        {
          id: 'work',
          title: '工作',
          children: [
            { id: 'w1', title: 'Jira', url: 'https://jira.com' },
            {
              id: 'sub',
              title: '深层项目',
              children: [
                { id: 'w2', title: 'GitLab', url: 'https://gitlab.com' },
              ],
            },
          ],
        },
        {
          id: 'play',
          title: '娱乐',
          children: [
            { id: 'p1', title: 'YouTube', url: 'https://youtube.com' },
          ],
        },
      ],
    },
  ];

  const groups = transformBookmarkTree(mockTree, {
    strategy: 'top_level',
    duplicateStrategy: 'skip',
    selectedFolderIds: [],
    targetProfileId: 'normal',
  });

  assert.equal(groups.length, 2);
  const workGroup = groups.find((g) => g.categoryName === '工作');
  assert.ok(workGroup);
  // '工作' should contain both Jira and GitLab
  assert.equal(workGroup.bookmarks.length, 2);

  const playGroup = groups.find((g) => g.categoryName === '娱乐');
  assert.ok(playGroup);
  assert.equal(playGroup.bookmarks.length, 1);
});

test('BookmarkImporter: calculateImportPreview identifies existing duplicate URLs', () => {
  const mockTree = [
    {
      id: 'root',
      title: '书签栏',
      children: [
        { id: 'b1', title: 'GitHub', url: 'https://github.com/' },
        { id: 'b2', title: 'V2EX', url: 'https://v2ex.com' },
      ],
    },
  ];

  const existingSites = [
    {
      id: 's1',
      title: 'Existing GitHub',
      url: 'https://github.com', // identical after normalize
      categoryId: 'default',
      sortOrder: 0,
      createdAt: 1,
      updatedAt: 1,
    },
  ];

  const preview = calculateImportPreview(
    mockTree,
    {
      strategy: 'smart',
      duplicateStrategy: 'skip',
      selectedFolderIds: [],
      targetProfileId: 'normal',
    },
    existingSites
  );

  assert.equal(preview.totalUrls, 2);
  assert.equal(preview.duplicateUrls, 1);
  assert.equal(preview.predictedCategories.length, 1);
  assert.equal(preview.predictedCategories[0].siteCount, 2);
});
