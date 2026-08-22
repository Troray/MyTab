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
 * Convert any image URL to a compact Base64 Data URL (max 128x128)
 */
export async function urlToBase64Icon(imageUrl: string, maxSize = 128): Promise<string> {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('data:image/')) return imageUrl;

  // 1. Try privileged background fetch if running as extension (bypasses all CORS and redirects)
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
        return resp.data;
      }
    } catch {
      // fallback to direct fetch
    }
  }

  // 2. Try direct fetch
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
      if (blob && blob.size > 0) {
        return await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result as string;
            resolve(result || imageUrl);
          };
          reader.onerror = () => resolve(imageUrl);
          reader.readAsDataURL(blob);
        });
      }
    }
  } catch {
    // direct fetch failed
  }

  // 3. Fallback: try DuckDuckGo or direct gstatic CDN (both support CORS and no 301 redirects)
  try {
    const domain = new URL(imageUrl).hostname;
    if (domain && !imageUrl.includes('gstatic.com') && !imageUrl.includes('duckduckgo.com')) {
      const fallbackUrl = `https://icons.duckduckgo.com/ip3/${domain}.ico`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(fallbackUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const blob = await res.blob();
        if (blob && blob.size > 0) {
          return await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const result = reader.result as string;
              resolve(result || imageUrl);
            };
            reader.onerror = () => resolve(imageUrl);
            reader.readAsDataURL(blob);
          });
        }
      }
    }
  } catch {
    // ignore
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
 * Get standard public Favicon API fallbacks
 */
export function getFaviconServiceUrls(hostname: string): string[] {
  return [
    `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${hostname}&size=128`,
    `https://icons.duckduckgo.com/ip3/${hostname}.ico`,
    `https://api.faviconkit.com/${hostname}/144`,
  ];
}

/**
 * Format domain name into clean display title (e.g. 'github.com' -> 'Github')
 */
function formatFallbackTitle(hostname: string): string {
  const root = hostname.replace(/^www\./i, '');
  const namePart = root.split('.')[0] || root;
  return namePart.charAt(0).toUpperCase() + namePart.slice(1);
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
  let extractedTitle = formatFallbackTitle(hostname);
  let extractedIcon = getFaviconServiceUrls(hostname)[0];

  // 1. Fetch HTML via privileged background service to bypass CORS, fallback to direct fetch
  let html = '';
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
      }
    } catch {
      // Direct fetch failed
    }
  }

  // 2. Parse HTML to extract title and high-resolution icons
  if (html) {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Extract Title: og:site_name -> application-name -> og:title -> twitter:title -> <title>
      const siteName = doc.querySelector('meta[property="og:site_name"]')?.getAttribute('content');
      const appName = doc.querySelector('meta[name="application-name"]')?.getAttribute('content');
      const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content');
      const twitterTitle = doc.querySelector('meta[name="twitter:title"]')?.getAttribute('content');
      const docTitle = doc.querySelector('title')?.innerText;

      const candidateTitle = (siteName || appName || ogTitle || twitterTitle || docTitle || '').trim();
      if (candidateTitle) {
        extractedTitle = candidateTitle;
      }

      // Extract Favicon: apple-touch-icon -> icon -> shortcut icon
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
    } catch {
      // ignore parse error
    }
  }

  // 4. Optimize & Cache as Base64 Data URL
  const cachedIcon = await urlToBase64Icon(extractedIcon);

  return {
    title: extractedTitle,
    icon: cachedIcon || extractedIcon,
    domain: hostname,
  };
}
