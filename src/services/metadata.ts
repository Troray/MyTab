export interface MetadataResult {
  title: string;
  icon: string;
  domain: string;
}

/**
 * Standardize input URL (e.g. 'github.com' -> 'https://github.com')
 */
export function normalizeUrl(input: string): string {
  let url = input.trim();
  if (!url) return '';
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }
  return url;
}

/**
 * Generate a dynamic high-aesthetic SVG Data URI as the ultimate fallback icon
 */
export function generateFallbackIcon(text: string): string {
  const char = (text.trim()[0] || 'W').toUpperCase();
  // Generate consistent gradient colors based on char code
  const code = char.charCodeAt(0);
  const hue1 = (code * 47) % 360;
  const hue2 = (hue1 + 45) % 360;

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="hsl(${hue1}, 70%, 55%)" />
      <stop offset="100%" stop-color="hsl(${hue2}, 85%, 45%)" />
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="32" fill="url(#grad)" />
  <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="64" font-weight="700" fill="#ffffff">${char}</text>
</svg>`.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Optimize a base64 image data URL (resize to max dimensions using Canvas if in browser environment)
 */
export async function optimizeBase64Image(dataUrl: string, maxSize = 128): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith('data:image/')) return dataUrl;
  if (dataUrl.startsWith('data:image/svg+xml')) return dataUrl; // Vector SVG stays crisp and lightweight
  if (typeof Image === 'undefined' || typeof document === 'undefined') return dataUrl; // SSR / Node test fallback

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let width = img.naturalWidth || 64;
      let height = img.naturalHeight || 64;
      if (width <= maxSize && height <= maxSize) {
        resolve(dataUrl);
        return;
      }
      if (width > height) {
        height = Math.round((height * maxSize) / width);
        width = maxSize;
      } else {
        width = Math.round((width * maxSize) / height);
        height = maxSize;
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/png', 0.92));
      } else {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/**
 * Convert any image URL to a compact Base64 Data URL (max 128x128)
 */
export async function urlToBase64Icon(imageUrl: string, maxSize = 128): Promise<string> {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('data:image/')) {
    return optimizeBase64Image(imageUrl, maxSize);
  }

  // 1. Try privileged background fetch if running as extension
  if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
    try {
      const resp = await new Promise<any>((resolve) => {
        chrome.runtime.sendMessage({ type: 'FETCH_BLOB_BASE64', url: imageUrl }, (res) => {
          if (chrome.runtime.lastError || !res) {
            resolve(null);
          } else {
            resolve(res);
          }
        });
      });
      if (resp && resp.success && resp.data && resp.data.startsWith('data:image/')) {
        return optimizeBase64Image(resp.data, maxSize);
      }
    } catch {
      // fallback to direct fetch
    }
  }

  // 2. Direct fetch with timeout (for dev mode)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(imageUrl, {
      signal: controller.signal,
      headers: {
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const blob = await res.blob();
      if (blob && blob.size > 50) {
        const rawBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve((reader.result as string) || imageUrl);
          reader.onerror = () => resolve(imageUrl);
          reader.readAsDataURL(blob);
        });
        if (rawBase64.startsWith('data:image/')) {
          return optimizeBase64Image(rawBase64, maxSize);
        }
      }
    }
  } catch {
    // direct fetch failed
  }

  return imageUrl;
}

/**
 * Convert a File object to an optimized Base64 Data URL
 */
export async function fileToBase64Icon(file: File, maxSize = 128): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.naturalWidth || 64;
        let height = img.naturalHeight || 64;
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          } else {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/png', 0.9));
        } else {
          resolve(reader.result as string);
        }
      };
      img.onerror = () => resolve(reader.result as string);
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Get prioritized public Favicon service URLs (Domestic-friendly Cravatar, Yandex, DuckDuckGo, Google, FaviconKit)
 */
export function getFaviconServiceUrls(hostname: string): string[] {
  const cleanHost = hostname.replace(/^www\./i, '').toLowerCase();
  return [
    `https://cn.cravatar.com/favicon/api/index.php?url=${hostname}`,
    `https://favicon.yandex.net/favicon/v2/https://${hostname}?size=64`,
    `https://icons.duckduckgo.com/ip3/${hostname}.ico`,
    `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${hostname}&size=128`,
    `https://api.faviconkit.com/${hostname}/144`,
    ...(cleanHost !== hostname ? [
      `https://cn.cravatar.com/favicon/api/index.php?url=${cleanHost}`,
      `https://favicon.yandex.net/favicon/v2/https://${cleanHost}?size=64`,
    ] : []),
  ];
}

/**
 * Format domain name into clean display title (e.g. 'github.com' -> 'Github')
 */
export function formatFallbackTitle(hostname: string): string {
  const root = hostname.replace(/^www\./i, '');
  const namePart = root.split('.')[0] || root;
  return namePart.charAt(0).toUpperCase() + namePart.slice(1);
}

/**
 * Extract prioritized list of candidate favicon URLs from HTML document
 */
export function extractIconCandidatesFromHtml(doc: Document, baseUrl: string): string[] {
  interface ScoredCandidate {
    url: string;
    score: number;
  }
  const scored: ScoredCandidate[] = [];

  // 1. Process all link tags
  const links = Array.from(doc.querySelectorAll('link'));
  for (const link of links) {
    const rel = (link.getAttribute('rel') || '').trim().toLowerCase();
    const href = (link.getAttribute('href') || '').trim();
    const sizes = (link.getAttribute('sizes') || '').trim().toLowerCase();
    const type = (link.getAttribute('type') || '').trim().toLowerCase();

    if (!href || !rel) continue;

    let fullUrl = '';
    try {
      if (href.startsWith('data:image/')) {
        fullUrl = href;
      } else {
        fullUrl = new URL(href, baseUrl).href;
      }
    } catch {
      continue;
    }

    let score = 0;
    if (rel.includes('apple-touch-icon')) {
      score = 100;
    } else if (rel.includes('icon')) {
      if (sizes.includes('192x192') || sizes.includes('180x180') || sizes.includes('144x144') || sizes.includes('128x128')) {
        score = 95;
      } else if (type.includes('svg') || href.toLowerCase().endsWith('.svg')) {
        score = 90;
      } else if (sizes.includes('96x96') || sizes.includes('64x64') || sizes.includes('48x48') || sizes.includes('32x32')) {
        score = 85;
      } else if (rel.includes('shortcut') || rel === 'icon') {
        score = 80;
      } else {
        score = 70;
      }
    } else if (rel.includes('mask-icon') || rel.includes('fluid-icon')) {
      score = 60;
    }

    if (score > 0) {
      scored.push({ url: fullUrl, score });
    }
  }

  // 2. Process meta tags (msapplication-TileImage, og:image, twitter:image)
  const msTile = doc.querySelector('meta[name="msapplication-TileImage" i]')?.getAttribute('content')?.trim();
  if (msTile) {
    try {
      scored.push({ url: new URL(msTile, baseUrl).href, score: 75 });
    } catch {}
  }

  const ogImage = doc.querySelector('meta[property="og:image" i]')?.getAttribute('content')?.trim();
  if (ogImage && /icon|logo|avatar|favicon|brand/i.test(ogImage)) {
    try {
      scored.push({ url: new URL(ogImage, baseUrl).href, score: 70 });
    } catch {}
  }

  // Sort by score descending and deduplicate
  scored.sort((a, b) => b.score - a.score);
  const seen = new Set<string>();
  const results: string[] = [];
  for (const item of scored) {
    if (!seen.has(item.url)) {
      seen.add(item.url);
      results.push(item.url);
    }
  }
  return results;
}

/**
 * Filter out generic / error page titles
 */
function sanitizeExtractedTitle(candidateTitle: string, hostname: string): string {
  const t = candidateTitle.trim();
  if (!t) return formatFallbackTitle(hostname);

  const lower = t.toLowerCase();
  const errorPatterns = [
    '403 forbidden',
    '404 not found',
    '500 internal server error',
    '502 bad gateway',
    '503 service temporarily unavailable',
    'attention required! | cloudflare',
    'just a moment...',
    'access denied',
    'error',
  ];

  for (const pattern of errorPatterns) {
    if (lower === pattern || (lower.startsWith(pattern) && t.length < 35)) {
      return formatFallbackTitle(hostname);
    }
  }
  return t;
}

/**
 * Probe candidates list to resolve the best non-empty image as Base64 Data URI
 */
async function resolveBestFavicon(candidates: string[]): Promise<string | null> {
  if (!candidates || candidates.length === 0) return null;

  // 1. Privileged background candidate resolution (bypasses CORS, tests validity, converts to Base64)
  if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
    try {
      const resp = await new Promise<any>((resolve) => {
        chrome.runtime.sendMessage({ type: 'RESOLVE_FAVICON_CANDIDATES', candidates }, (res) => {
          if (chrome.runtime.lastError || !res) {
            resolve(null);
          } else {
            resolve(res);
          }
        });
      });
      if (resp && resp.success && resp.data && resp.data.startsWith('data:image/')) {
        return resp.data;
      }
    } catch {
      // background candidate probe failed, fall back to frontend
    }
  }

  // 2. Frontend candidate probe (for dev server and standalone testing)
  const probeFrontendCandidate = async (candUrl: string, timeoutMs = 2500): Promise<string | null> => {
    if (!candUrl) return null;
    if (candUrl.startsWith('data:image/')) return candUrl;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(candUrl, {
        signal: controller.signal,
        headers: {
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        },
        mode: 'cors',
      });
      if (!res.ok) return null;
      const contentType = (res.headers.get('content-type') || '').toLowerCase();
      if (
        contentType.includes('text/html') ||
        contentType.includes('text/plain') ||
        contentType.includes('application/json')
      ) {
        return null;
      }
      const blob = await res.blob();
      if (!blob || blob.size < 50) return null;

      if (typeof FileReader !== 'undefined') {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve((reader.result as string) || '');
          reader.onerror = () => resolve('');
          reader.readAsDataURL(blob);
        });
        return base64.startsWith('data:image/') ? base64 : null;
      } else {
        const buf = await blob.arrayBuffer();
        const bytes = new Uint8Array(buf);
        let binary = '';
        const chunkSize = 8192;
        for (let i = 0; i < bytes.length; i += chunkSize) {
          const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
          binary += String.fromCharCode.apply(null, chunk as any);
        }
        const mime = blob.type || 'image/png';
        return `data:${mime};base64,${btoa(binary)}`;
      }
    } catch {
      return null;
    } finally {
      clearTimeout(timeoutId);
    }
  };

  const isCdn = (u: string) =>
    u.includes('cravatar.com') ||
    u.includes('yandex.net') ||
    u.includes('duckduckgo.com') ||
    u.includes('gstatic.com') ||
    u.includes('faviconkit.com');

  const directCandidates = candidates.filter((c) => !isCdn(c));
  const cdnCandidates = candidates.filter((c) => isCdn(c));

  // Try direct candidates concurrently (up to 3 in parallel)
  if (directCandidates.length > 0) {
    const directPromises = directCandidates.slice(0, 3).map((u) => probeFrontendCandidate(u, 1600));
    const results = await Promise.allSettled(directPromises);
    for (const r of results) {
      if (r.status === 'fulfilled' && r.value) {
        return r.value;
      }
    }
  }

  // Race top 3 CDN candidates concurrently
  if (cdnCandidates.length > 0) {
    const cdnPromises = cdnCandidates.slice(0, 3).map((u) => probeFrontendCandidate(u, 2600));
    try {
      const winner = await Promise.any(
        cdnPromises.map((p) =>
          p.then((res) => {
            if (res) return res;
            throw new Error('failed');
          })
        )
      );
      if (winner) return winner;
    } catch {
      for (const remaining of cdnCandidates.slice(3)) {
        const res = await probeFrontendCandidate(remaining, 2000);
        if (res) return res;
      }
    }
  }

  return null;
}

/**
 * Extract title and favicon by querying HTML or using robust fallback APIs
 */
export async function fetchSiteMetadata(rawUrl: string): Promise<MetadataResult> {
  const url = normalizeUrl(rawUrl);
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return {
      title: rawUrl,
      icon: generateFallbackIcon(rawUrl),
      domain: rawUrl,
    };
  }

  const hostname = parsed.hostname.toLowerCase();
  const origin = parsed.origin;
  const cleanHost = hostname.replace(/^www\./i, '');
  let extractedTitle = formatFallbackTitle(hostname);

  // 1. Fetch HTML via privileged background service to bypass CORS, fallback to direct fetch
  let html = '';
  let finalUrl = url;

  if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
    try {
      const resp = await new Promise<any>((resolve) => {
        chrome.runtime.sendMessage({ type: 'FETCH_HTML', url }, (res) => {
          if (chrome.runtime.lastError || !res) {
            resolve(null);
          } else {
            resolve(res);
          }
        });
      });
      if (resp && resp.success && resp.data) {
        html = resp.data;
        if (resp.finalUrl) {
          finalUrl = resp.finalUrl;
        }
      }
    } catch {
      // background fetch failed
    }
  }

  if (!html) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        mode: 'cors',
      });
      clearTimeout(timeoutId);
      if (response.ok) {
        html = await response.text();
        finalUrl = response.url || url;
      }
    } catch {
      // Direct fetch failed
    }
  }

  // 2. Parse HTML to extract title and candidate icons
  let htmlIconCandidates: string[] = [];
  if (html && typeof DOMParser !== 'undefined') {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Title: og:site_name -> application-name -> og:title -> twitter:title -> <title>
      const siteName = doc.querySelector('meta[property="og:site_name" i]')?.getAttribute('content');
      const appName = doc.querySelector('meta[name="application-name" i]')?.getAttribute('content');
      const ogTitle = doc.querySelector('meta[property="og:title" i]')?.getAttribute('content');
      const twitterTitle = doc.querySelector('meta[name="twitter:title" i]')?.getAttribute('content');
      const docTitle = doc.querySelector('title')?.innerText;

      const candidateTitle = (ogTitle || twitterTitle || appName || siteName || docTitle || '').trim();
      extractedTitle = sanitizeExtractedTitle(candidateTitle, hostname);

      // Extract icons from HTML
      htmlIconCandidates = extractIconCandidatesFromHtml(doc, finalUrl);
    } catch {
      // DOMParser error
    }
  }

  // 3. Assemble full prioritized candidates list
  // 3.1 Check if any open browser tab matches the target domain and has a cached favicon
  let tabFavicon = '';
  if (typeof chrome !== 'undefined' && chrome.tabs?.query) {
    try {
      const tabs = await chrome.tabs.query({});
      for (const t of tabs) {
        if (t.url && t.favIconUrl) {
          try {
            const tHost = new URL(t.url).hostname.replace(/^www\./i, '').toLowerCase();
            if (tHost === cleanHost) {
              tabFavicon = t.favIconUrl;
              break;
            }
          } catch {}
        }
      }
    } catch {}
  }

  // 3.2 Chrome internal favicon service URL (cached in browser profile)
  let chromeFaviconUrl = '';
  if (typeof chrome !== 'undefined' && chrome.runtime?.id) {
    chromeFaviconUrl = `chrome-extension://${chrome.runtime.id}/_favicon/?pageUrl=${encodeURIComponent(url)}&size=64`;
  }

  const directCandidates: string[] = [
    `${origin}/favicon.ico`,
    `${origin}/favicon.png`,
  ];
  if (hostname.startsWith('www.')) {
    directCandidates.push(`https://${cleanHost}/favicon.ico`);
    directCandidates.push(`https://${cleanHost}/favicon.png`);
  } else {
    directCandidates.push(`https://www.${hostname}/favicon.ico`);
  }

  const cdnCandidates = getFaviconServiceUrls(hostname);

  // Combine and deduplicate
  const allCandidates: string[] = [];
  const candidateSet = new Set<string>();
  const initialPool = [
    tabFavicon,
    chromeFaviconUrl,
    ...htmlIconCandidates,
    ...directCandidates,
    ...cdnCandidates,
  ];

  for (const c of initialPool) {
    if (c && !candidateSet.has(c)) {
      candidateSet.add(c);
      allCandidates.push(c);
    }
  }

  // 4. Resolve the best valid icon
  const resolvedBase64 = await resolveBestFavicon(allCandidates);
  let finalIcon = '';
  if (resolvedBase64) {
    finalIcon = await optimizeBase64Image(resolvedBase64, 128);
  } else {
    finalIcon = generateFallbackIcon(extractedTitle || hostname);
  }

  return {
    title: extractedTitle,
    icon: finalIcon,
    domain: hostname,
  };
}
