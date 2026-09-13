import browser from 'webextension-polyfill';
import {
  Category,
  ProfileId,
  RawBookmarkNode,
  SiteItem,
  BookmarkImportOptions,
  BookmarkImportPreviewStats,
  BookmarkImportPreviewCategory,
  BookmarkImportResult,
} from '../types';
import { loadAppState, updateProfile } from './storage';
import { generateFallbackIcon } from './metadata';
import { isValidWebUrl } from './bookmarkHtmlParser';

/**
 * Standardize URL for accurate duplicate comparison (protocol, hostname, trailing slashes, etc.)
 */
function normalizeForComparison(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl.trim());
    // Lowercase host and protocol, remove standard default ports, keep pathname & query
    return parsed.toString().toLowerCase().replace(/\/+$/, '');
  } catch {
    return rawUrl.trim().toLowerCase().replace(/\/+$/, '');
  }
}

/**
 * Checks if the extension currently possesses the 'bookmarks' permission.
 * If 'bookmarks' is already in manifest permissions, the API is available immediately.
 */
export async function checkBookmarkPermission(): Promise<boolean> {
  const bookmarksApi = (typeof browser !== 'undefined' && browser.bookmarks)
    ? browser.bookmarks
    : (typeof chrome !== 'undefined' && chrome.bookmarks)
    ? chrome.bookmarks
    : null;
  if (bookmarksApi) {
    return true;
  }
  try {
    if (typeof browser !== 'undefined' && browser.permissions?.contains) {
      return await browser.permissions.contains({ permissions: ['bookmarks'] });
    }
    if (typeof chrome !== 'undefined' && chrome.permissions?.contains) {
      return await chrome.permissions.contains({ permissions: ['bookmarks'] });
    }
  } catch {
    return false;
  }
  return false;
}

/**
 * Requests Chrome/Firefox bookmark permission on-demand if not already granted.
 * Returns true if granted or already possessed; false otherwise.
 */
export async function requestBookmarkPermission(): Promise<boolean> {
  const hasAlready = await checkBookmarkPermission();
  if (hasAlready) return true;

  try {
    if (typeof browser !== 'undefined' && browser.permissions?.request) {
      return await browser.permissions.request({ permissions: ['bookmarks'] });
    }
    if (typeof chrome !== 'undefined' && chrome.permissions?.request) {
      return await chrome.permissions.request({ permissions: ['bookmarks'] });
    }
  } catch (err) {
    console.warn('[BookmarkImporter] Permission request failed:', err);
  }
  return false;
}

/**
 * Fetches the browser's native bookmark tree and returns the primary top-level folders.
 */
export async function fetchNativeBookmarkTree(): Promise<RawBookmarkNode[]> {
  const bookmarksApi = (typeof browser !== 'undefined' && browser.bookmarks)
    ? browser.bookmarks
    : (typeof chrome !== 'undefined' && chrome.bookmarks)
    ? chrome.bookmarks
    : null;

  if (!bookmarksApi) {
    throw new Error('Browser bookmarks API is not available');
  }

  const tree = await bookmarksApi.getTree();
  if (!tree || tree.length === 0) return [];

  function mapNode(node: any): RawBookmarkNode {
    return {
      id: node.id,
      title: node.title || (node.url ? node.url : 'Folder'),
      url: node.url,
      dateAdded: node.dateAdded,
      children: node.children ? node.children.map(mapNode) : undefined,
    };
  }

  // The root node (id '0') usually contains '1' (Bookmarks Bar), '2' (Other Bookmarks), etc.
  const root = tree[0];
  if (root.children && root.children.length > 0) {
    return root.children.map(mapNode);
  }
  return [mapNode(root)];
}

interface TransformedGroup {
  categoryName: string;
  folderId?: string;
  path: string[];
  bookmarks: Array<{
    id: string;
    title: string;
    url: string;
    icon?: string;
    dateAdded?: number;
    path: string[];
  }>;
}

/**
 * Transforms a raw bookmark node tree into category groups based on the chosen strategy.
 */
export function transformBookmarkTree(
  rootNodes: RawBookmarkNode[],
  options: BookmarkImportOptions
): TransformedGroup[] {
  const groups: TransformedGroup[] = [];
  const selectedSet = new Set(options.selectedFolderIds);
  const hasSelectionFilter = selectedSet.size > 0;

  // Helper: check if a node is selected
  function isNodeSelected(nodeId: string): boolean {
    if (!hasSelectionFilter) return true;
    return selectedSet.has(nodeId);
  }

  // Count total URLs recursively in a node
  function countUrlsInNode(node: RawBookmarkNode): number {
    let count = 0;
    if (node.url && isValidWebUrl(node.url)) {
      count++;
    }
    if (node.children) {
      for (const child of node.children) {
        count += countUrlsInNode(child);
      }
    }
    return count;
  }

  // 1. SMART FLATTEN STRATEGY (智能整理)
  if (options.strategy === 'smart') {
    function traverseSmart(
      node: RawBookmarkNode,
      currentPath: string[]
    ) {
      const selected = isNodeSelected(node.id);
      const isFolder = Boolean(node.children);

      if (!isFolder) return;

      const directLinks: RawBookmarkNode[] = [];
      const subFolders: RawBookmarkNode[] = [];

      for (const child of node.children || []) {
        if (child.url) {
          if (isValidWebUrl(child.url)) {
            directLinks.push(child);
          }
        } else if (child.children) {
          subFolders.push(child);
        }
      }

      const nextPath = node.title ? [...currentPath, node.title] : currentPath;

      // If selected and has direct links, create a category for this folder
      if (selected && directLinks.length > 0) {
        groups.push({
          categoryName: node.title || '书签',
          folderId: node.id,
          path: nextPath,
          bookmarks: directLinks.map((bm) => ({
            id: bm.id,
            title: bm.title || bm.url || '未命名书签',
            url: bm.url!,
            icon: bm.icon,
            dateAdded: bm.dateAdded,
            path: nextPath,
          })),
        });
      }

      // Continue to subfolders
      for (const sub of subFolders) {
        // Skip subfolder if whole branch has 0 URLs
        if (countUrlsInNode(sub) > 0) {
          traverseSmart(sub, nextPath);
        }
      }
    }

    for (const root of rootNodes) {
      traverseSmart(root, []);
    }
  }

  // 2. TOP-LEVEL STRATEGY (按一级目录)
  else if (options.strategy === 'top_level') {
    function collectAllLinks(node: RawBookmarkNode, path: string[]): Array<{
      id: string;
      title: string;
      url: string;
      icon?: string;
      dateAdded?: number;
      path: string[];
    }> {
      const links: Array<{
        id: string;
        title: string;
        url: string;
        icon?: string;
        dateAdded?: number;
        path: string[];
      }> = [];

      const nextPath = node.title ? [...path, node.title] : path;

      if (node.url && isValidWebUrl(node.url)) {
        links.push({
          id: node.id,
          title: node.title || node.url,
          url: node.url,
          icon: node.icon,
          dateAdded: node.dateAdded,
          path: nextPath,
        });
      }

      if (node.children) {
        for (const child of node.children) {
          if (child.children && hasSelectionFilter && !selectedSet.has(child.id)) {
            continue; // Subfolder was unchecked by user
          }
          links.push(...collectAllLinks(child, nextPath));
        }
      }
      return links;
    }

    // Top-level folders under the roots become categories
    for (const root of rootNodes) {
      const rootSelected = isNodeSelected(root.id);
      const children = root.children || [];

      // If root itself has direct URLs
      const directRootUrls = (root.children || []).filter((c) => c.url && isValidWebUrl(c.url));
      if (directRootUrls.length > 0 && (rootSelected || !hasSelectionFilter)) {
        groups.push({
          categoryName: root.title || '书签栏',
          folderId: root.id,
          path: [root.title || '书签栏'],
          bookmarks: directRootUrls.map((bm) => ({
            id: bm.id,
            title: bm.title || bm.url!,
            url: bm.url!,
            icon: bm.icon,
            dateAdded: bm.dateAdded,
            path: [root.title || '书签栏'],
          })),
        });
      }

      for (const child of children) {
        if (!child.children) continue; // skip loose top-level bookmarks already counted
        const childSelected = isNodeSelected(child.id);
        if (!childSelected && hasSelectionFilter) continue;

        const allUrls = collectAllLinks(child, [root.title || '书签']);
        if (allUrls.length > 0) {
          groups.push({
            categoryName: child.title || '常用网址',
            folderId: child.id,
            path: [root.title || '书签', child.title || '常用网址'],
            bookmarks: allUrls,
          });
        }
      }
    }
  }

  // 3. DEEPEST LEAF STRATEGY (按底层终端目录)
  else if (options.strategy === 'deepest_leaf') {
    function traverseLeaf(
      node: RawBookmarkNode,
      currentPath: string[]
    ) {
      const selected = isNodeSelected(node.id);
      const isFolder = Boolean(node.children);

      if (!isFolder) return;

      const directLinks: RawBookmarkNode[] = [];
      const subFolders: RawBookmarkNode[] = [];

      for (const child of node.children || []) {
        if (child.url) {
          if (isValidWebUrl(child.url)) {
            directLinks.push(child);
          }
        } else if (child.children) {
          subFolders.push(child);
        }
      }

      const nextPath = node.title ? [...currentPath, node.title] : currentPath;

      // If it's a leaf folder (no subfolders) or subfolders have 0 URLs, and has direct links
      const hasActiveSubfolders = subFolders.some((s) => countUrlsInNode(s) > 0);

      if (selected && directLinks.length > 0 && !hasActiveSubfolders) {
        groups.push({
          categoryName: node.title || '书签',
          folderId: node.id,
          path: nextPath,
          bookmarks: directLinks.map((bm) => ({
            id: bm.id,
            title: bm.title || bm.url || '未命名书签',
            url: bm.url!,
            icon: bm.icon,
            dateAdded: bm.dateAdded,
            path: nextPath,
          })),
        });
      } else if (selected && directLinks.length > 0 && hasActiveSubfolders) {
        // Non-leaf but has direct links: preserve direct links in this folder
        groups.push({
          categoryName: node.title || '书签',
          folderId: node.id,
          path: nextPath,
          bookmarks: directLinks.map((bm) => ({
            id: bm.id,
            title: bm.title || bm.url || '未命名书签',
            url: bm.url!,
            icon: bm.icon,
            dateAdded: bm.dateAdded,
            path: nextPath,
          })),
        });
      }

      for (const sub of subFolders) {
        if (countUrlsInNode(sub) > 0) {
          traverseLeaf(sub, nextPath);
        }
      }
    }

    for (const root of rootNodes) {
      traverseLeaf(root, []);
    }
  }

  // Disambiguate duplicate category names by prepending parent path
  const nameCounts = new Map<string, number>();
  for (const g of groups) {
    nameCounts.set(g.categoryName, (nameCounts.get(g.categoryName) || 0) + 1);
  }

  for (const g of groups) {
    if ((nameCounts.get(g.categoryName) || 0) > 1 && g.path.length >= 2) {
      const parentName = g.path[g.path.length - 2];
      g.categoryName = `${parentName} / ${g.categoryName}`;
    }
  }

  return groups;
}

/**
 * Calculates pre-import preview statistics and predicted categories.
 */
export function calculateImportPreview(
  rootNodes: RawBookmarkNode[],
  options: BookmarkImportOptions,
  existingSites: SiteItem[]
): BookmarkImportPreviewStats {
  const groups = transformBookmarkTree(rootNodes, options);

  const existingUrlSet = new Set(existingSites.map((s) => normalizeForComparison(s.url)));

  let totalUrls = 0;
  let validUrls = 0;
  let duplicateUrls = 0;

  const predictedCategories: BookmarkImportPreviewCategory[] = [];

  for (const g of groups) {
    const sampleSites: Array<{ title: string; url: string }> = [];

    for (const bm of g.bookmarks) {
      totalUrls++;
      validUrls++;
      const norm = normalizeForComparison(bm.url);
      if (existingUrlSet.has(norm)) {
        duplicateUrls++;
      }
      if (sampleSites.length < 5) {
        sampleSites.push({ title: bm.title, url: bm.url });
      }
    }

    if (g.bookmarks.length > 0) {
      predictedCategories.push({
        name: g.categoryName,
        originalPath: g.path,
        siteCount: g.bookmarks.length,
        sampleSites,
      });
    }
  }

  return {
    totalUrls,
    validUrls,
    duplicateUrls,
    ignoredFolders: 0,
    predictedCategories,
  };
}

/**
 * Executes bookmark import atomically to the target profile.
 */
export async function executeBookmarkImport(
  rootNodes: RawBookmarkNode[],
  options: BookmarkImportOptions
): Promise<BookmarkImportResult> {
  try {
    const currentState = await loadAppState(options.targetProfileId);
    const existingSites = currentState.sites || [];
    const existingCategories = currentState.categories || [];

    const groups = transformBookmarkTree(rootNodes, options);
    if (groups.length === 0) {
      return {
        success: true,
        importedSitesCount: 0,
        importedCategoriesCount: 0,
        skippedDuplicatesCount: 0,
      };
    }

    const existingUrlMap = new Map<string, SiteItem>();
    for (const s of existingSites) {
      existingUrlMap.set(normalizeForComparison(s.url), s);
    }

    const newCategories: Category[] = [];
    const newSites: SiteItem[] = [];
    let skippedDuplicatesCount = 0;
    const now = Date.now();

    // Map each group to a Category and its SiteItems
    for (let i = 0; i < groups.length; i++) {
      const g = groups[i];
      if (g.bookmarks.length === 0) continue;

      const categoryId = `cat-bm-${now}-${i}-${Math.random().toString(36).substring(2, 6)}`;
      let sitesForThisCategoryCount = 0;

      for (let j = 0; j < g.bookmarks.length; j++) {
        const bm = g.bookmarks[j];
        const norm = normalizeForComparison(bm.url);
        const duplicateMatch = existingUrlMap.get(norm);

        if (duplicateMatch) {
          if (options.duplicateStrategy === 'skip') {
            skippedDuplicatesCount++;
            continue;
          } else if (options.duplicateStrategy === 'overwrite') {
            // Overwrite existing site properties
            duplicateMatch.title = bm.title || duplicateMatch.title;
            duplicateMatch.updatedAt = now;
            duplicateMatch.bookmark = {
              sourceId: bm.id,
              path: bm.path,
              addDate: bm.dateAdded,
              importSource: 'browser_api',
            };
            if (bm.icon) duplicateMatch.icon = bm.icon;
            continue;
          }
          // 'keep_both' proceeds to create a new site item below
        }

        const siteId = `site-bm-${now}-${newSites.length}-${Math.random().toString(36).substring(2, 7)}`;
        const fallbackIcon = bm.icon || generateFallbackIcon(bm.title || bm.url);

        const newSite: SiteItem = {
          id: siteId,
          title: bm.title || '未命名书签',
          url: bm.url,
          icon: fallbackIcon,
          categoryId,
          sortOrder: existingSites.length + newSites.length,
          createdAt: bm.dateAdded || now,
          updatedAt: now,
          bookmark: {
            sourceId: bm.id,
            path: bm.path,
            addDate: bm.dateAdded,
            importSource: 'browser_api',
          },
        };

        newSites.push(newSite);
        sitesForThisCategoryCount++;
        // Track newly added site to avoid duplicates within the import batch itself
        existingUrlMap.set(norm, newSite);
      }

      // Only create the category if at least one site was imported into it
      if (sitesForThisCategoryCount > 0) {
        newCategories.push({
          id: categoryId,
          name: g.categoryName,
          sortOrder: existingCategories.length + newCategories.length,
          bookmarkSource: {
            folderId: g.folderId,
            path: g.path,
          },
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    // Atomic storage persistence
    await updateProfile(options.targetProfileId, (profile) => ({
      ...profile,
      categories: [...profile.categories, ...newCategories],
      sites: [...profile.sites, ...newSites],
    }));

    return {
      success: true,
      importedSitesCount: newSites.length,
      importedCategoriesCount: newCategories.length,
      skippedDuplicatesCount,
    };
  } catch (err: any) {
    console.error('[BookmarkImporter] Import execution error:', err);
    return {
      success: false,
      importedSitesCount: 0,
      importedCategoriesCount: 0,
      skippedDuplicatesCount: 0,
      error: err.message || 'Failed to import bookmarks',
    };
  }
}
