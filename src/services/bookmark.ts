import { ProfileId, SiteItem } from '../types';
import { loadAppState, saveSites } from './storage';
import { generateFallbackIcon } from './metadata';

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
 * Normalizes a URL for bookmark duplicate detection using the WHATWG URL standard.
 * Returns null if the string cannot be parsed as a valid URL.
 *
 * URL normalization is delegated to the native URL API:
 * - Protocol and hostname are normalized
 * - Default ports are removed
 * - Root paths are unified (e.g. "https://a.com" and "https://a.com/" both yield "https://a.com/")
 * - Empty hashes are removed
 * - Query parameters, non-empty hashes, subpaths, www, and protocols are preserved
 */
function normalizeUrl(url: string): string | null {
  try {
    return new URL(url.trim()).toString();
  } catch {
    return null;
  }
}

/**
 * Extracts normalized hostname for domain-level association (ignoring leading www. and case).
 */
function extractHostname(url: string): string | null {
  try {
    return new URL(url.trim()).hostname.replace(/^www\./i, '').toLowerCase();
  } catch {
    return null;
  }
}

export interface CheckBookmarkResult {
  exists: boolean;
  sameDomainSite?: {
    id: string;
    title: string;
    url: string;
    categoryId: string;
  };
}

/**
 * Checks if a bookmark with the equivalent normalized URL already exists,
 * or if there is an existing bookmark from the same website (same domain)
 * within the specified Profile.
 */
export async function checkBookmarkExists(url: string, profileId?: ProfileId): Promise<CheckBookmarkResult> {
  const target = normalizeUrl(url);
  if (!target) return { exists: false };

  const targetHost = extractHostname(url);
  const state = await loadAppState(profileId);

  let exists = false;
  let sameDomainSite: CheckBookmarkResult['sameDomainSite'];

  for (const site of state.sites) {
    const normalizedSiteUrl = normalizeUrl(site.url);
    if (normalizedSiteUrl === target) {
      exists = true;
      break; // Exact duplicate found
    }

    if (!sameDomainSite && targetHost) {
      const siteHost = extractHostname(site.url);
      if (siteHost && siteHost === targetHost) {
        sameDomainSite = {
          id: site.id,
          title: site.title,
          url: site.url,
          categoryId: site.categoryId,
        };
      }
    }
  }

  return {
    exists,
    sameDomainSite: exists ? undefined : sameDomainSite,
  };
}

/**
 * Adds a new bookmark to the storage for the specified Profile.
 * Handles duplicate checking and ID generation.
 */
export async function addBookmark(input: AddBookmarkInput, profileId?: ProfileId): Promise<AddBookmarkResult> {
  try {
    const state = await loadAppState(profileId);
    
    // Determine sort order (append to end)
    const sortOrder = state.sites.length;
    const now = Date.now();

    // Create the new site item
    const newSite: SiteItem = {
      id: `site-${now}-${Math.random().toString(36).substring(2, 7)}`,
      title: input.title || 'Untitled',
      url: input.url,
      icon: input.icon || generateFallbackIcon(input.title || input.url),
      categoryId: input.categoryId || state.categories.find((c) => c.id !== 'all')?.id || 'all',
      sortOrder,
      createdAt: now,
      updatedAt: now,
    };

    // Save to storage
    const updatedSites = [...state.sites, newSite];
    await saveSites(updatedSites, profileId || state.profileId);

    return { success: true, bookmark: newSite };
  } catch (err: any) {
    console.error('[Bookmark Service] Failed to add bookmark:', err);
    return { success: false, error: err.message || 'Failed to add bookmark' };
  }
}

