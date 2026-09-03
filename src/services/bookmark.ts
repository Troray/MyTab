import { SiteItem } from '../types';
import { loadAppState, saveSites } from './storage';

export interface AddBookmarkInput {
  title: string;
  url: string;
  icon?: string;
  categoryId: string;
}

export interface AddBookmarkResult {
  success: boolean;
  bookmark?: SiteItem;
  error?: string;
  duplicate?: boolean;
}

/**
 * Checks if a bookmark with the exact URL already exists.
 */
export async function checkBookmarkExists(url: string): Promise<boolean> {
  const state = await loadAppState();
  return state.sites.some((site) => site.url === url);
}

/**
 * Adds a new bookmark to the storage.
 * Handles duplicate checking and ID generation.
 */
export async function addBookmark(input: AddBookmarkInput): Promise<AddBookmarkResult> {
  try {
    const state = await loadAppState();
    
    // (Removed strict duplicate block. The popup now warns users instead of blocking.)

    // 2. Determine sort order (append to end)
    const sortOrder = state.sites.length;
    const now = Date.now();

    // 3. Create the new site item
    const newSite: SiteItem = {
      id: `site-${now}-${Math.random().toString(36).substring(2, 7)}`,
      title: input.title || 'Untitled',
      url: input.url,
      icon: input.icon,
      categoryId: input.categoryId || 'tools',
      sortOrder,
      createdAt: now,
      updatedAt: now,
    };

    // 4. Save to storage
    const updatedSites = [...state.sites, newSite];
    await saveSites(updatedSites);

    return { success: true, bookmark: newSite };
  } catch (err: any) {
    console.error('[Bookmark Service] Failed to add bookmark:', err);
    return { success: false, error: err.message || 'Failed to add bookmark' };
  }
}
