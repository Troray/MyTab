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

async function sendBackgroundMessage<T = any>(msg: any): Promise<T | null> {
  if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
    try {
      const res = await chrome.runtime.sendMessage(msg);
      if (res !== undefined && res !== null) {
        return res;
      }
    } catch {
      // fallback to callback
    }

    try {
      return await new Promise<T | null>((resolve) => {
        chrome.runtime.sendMessage(msg, (response) => {
          if (chrome.runtime.lastError || !response) {
            resolve(null);
          } else {
            resolve(response);
          }
        });
      });
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Convert any image URL to a compact Base64 Data URL (max 128x128)
 */
export async function urlToBase64Icon(imageUrl: string, maxSize = 128): Promise<string> {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('data:image/')) return imageUrl;

  // 1. Privileged background fetch (bypasses all CORS and redirects in extension environment)
  if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
    const resp = await sendBackgroundMessage<{ success: boolean; data?: string }>({
      type: 'FETCH_BLOB_BASE64',
      url: imageUrl,
    });

    if (resp?.success && resp.data && resp.data.startsWith('data:image/')) {
      return resp.data;
    }

    // 2. Fallback: ask background to fetch DuckDuckGo CDN icon
    try {
      const domain = new URL(imageUrl).hostname;
      if (domain && !imageUrl.includes('duckduckgo.com')) {
        const fallbackUrl = `https://icons.duckduckgo.com/ip3/${domain}.ico`;
        const fbResp = await sendBackgroundMessage<{ success: boolean; data?: string }>({
          type: 'FETCH_BLOB_BASE64',
          url: fallbackUrl,
        });

        if (fbResp?.success && fbResp.data && fbResp.data.startsWith('data:image/')) {
          return fbResp.data;
        }
      }
    } catch {
      // ignore
    }

    // 3. Fallback: ask background to fetch Google gstatic Favicon V2 CDN
    try {
      const domain = new URL(imageUrl).hostname;
      if (domain && !imageUrl.includes('gstatic.com')) {
        const gstaticUrl = `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=128`;
        const gResp = await sendBackgroundMessage<{ success: boolean; data?: string }>({
          type: 'FETCH_BLOB_BASE64',
          url: gstaticUrl,
        });

        if (gResp?.success && gResp.data && gResp.data.startsWith('data:image/')) {
          return gResp.data;
        }
      }
    } catch {
      // ignore
    }

    // If all failed, return SVG fallback icon
    try {
      const domain = new URL(imageUrl).hostname;
      return generateFallbackIcon(domain || 'W');
    } catch {
      return generateFallbackIcon('W');
    }
  }

  // Standalone dev preview (outside extension environment)
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
 * Get standard public Favicon API fallbacks
 */
export function getFaviconServiceUrls(hostname: string): string[] {
  return [
    `https://icons.duckduckgo.com/ip3/${hostname}.ico`,
    `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${hostname}&size=128`,
    `https://api.faviconkit.com/${hostname}/144`,
  ];
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

  const hostname = parsed.hostname;
  const defaultTitle = hostname.replace(/^www\./i, '');
  let extractedTitle = defaultTitle;
  let extractedIcon = getFaviconServiceUrls(hostname)[0];

  // Try to parse HTML via background privileged fetch or direct fetch
  try {
    let html = '';
    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      const resp = await sendBackgroundMessage<{ success: boolean; data?: string }>({
        type: 'FETCH_HTML',
        url,
      });
      if (resp && resp.success && resp.data) {
        html = resp.data;
      }
    } else {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { 'Accept': 'text/html,application/xhtml+xml' },
        mode: 'cors',
      });
      clearTimeout(timeoutId);
      if (response.ok) {
        html = await response.text();
      }
    }

    if (html) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // 1. Extract Title: og:title -> twitter:title -> <title>
      const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content');
      const twitterTitle = doc.querySelector('meta[name="twitter:title"]')?.getAttribute('content');
      const docTitle = doc.querySelector('title')?.innerText;

      const candidateTitle = (ogTitle || twitterTitle || docTitle || '').trim();
      if (candidateTitle) {
        extractedTitle = candidateTitle;
      }

      // 2. Extract Favicon: apple-touch-icon -> icon -> shortcut icon
      const iconSelectors = [
        'link[rel="apple-touch-icon"]',
        'link[rel="apple-touch-icon-precomposed"]',
        'link[rel="icon"][sizes="192x192"]',
        'link[rel="icon"][sizes="128x128"]',
        'link[rel="icon"][sizes="96x96"]',
        'link[rel="icon"][type="image/svg+xml"]',
        'link[rel="icon"][type="image/png"]',
        'link[rel="icon"]',
        'link[rel="shortcut icon"]',
      ];

      for (const selector of iconSelectors) {
        const link = doc.querySelector(selector);
        const href = link?.getAttribute('href');
        if (href) {
          try {
            extractedIcon = new URL(href, url).href;
            break;
          } catch {
            // ignore invalid url
          }
        }
      }
    }
  } catch {
    extractedIcon = getFaviconServiceUrls(hostname)[0];
  }

  // Optimize & Cache as Base64 Data URL
  const cachedIcon = await urlToBase64Icon(extractedIcon);

  return {
    title: extractedTitle,
    icon: cachedIcon || extractedIcon,
    domain: hostname,
  };
}
