import { ThemeSettings } from '../types';

export interface UnsplashPhotoResult {
  url: string;
  authorName?: string;
  authorUrl?: string;
  error?: string;
}

// Curated high-resolution wallpaper fallback pool categorized for instant preview without API Key
const CURATED_WALLPAPERS: Record<string, { url: string; author: string; authorUrl: string }[]> = {
  nature: [
    {
      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2560&q=85',
      author: 'Bailey Zindel',
      authorUrl: 'https://unsplash.com/@baileyzindel',
    },
    {
      url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=2560&q=85',
      author: 'David Marcu',
      authorUrl: 'https://unsplash.com/@davidmarcu',
    },
    {
      url: 'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=2560&q=85',
      author: 'Luca Bravo',
      authorUrl: 'https://unsplash.com/@lucabravo',
    },
    {
      url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=2560&q=85',
      author: 'Vadim Sherbakov',
      authorUrl: 'https://unsplash.com/@vadimsherbakov',
    },
    {
      url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=2560&q=85',
      author: 'Benjamin Davies',
      authorUrl: 'https://unsplash.com/@bendavisual',
    },
  ],
  city: [
    {
      url: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=2560&q=85',
      author: 'Pedro Lastra',
      authorUrl: 'https://unsplash.com/@peterlaster',
    },
    {
      url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=2560&q=85',
      author: 'Aleksandar Pasaric',
      authorUrl: 'https://unsplash.com/@apasaric',
    },
    {
      url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2560&q=85',
      author: 'Sean Pollock',
      authorUrl: 'https://unsplash.com/@seanpollock',
    },
    {
      url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=2560&q=85',
      author: 'Ryo Yoshitake',
      authorUrl: 'https://unsplash.com/@ryoyoshitake',
    },
  ],
  abstract: [
    {
      url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=2560&q=85',
      author: 'Geordanna Cordero',
      authorUrl: 'https://unsplash.com/@geordannacordero',
    },
    {
      url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=2560&q=85',
      author: 'Paweł Czerwiński',
      authorUrl: 'https://unsplash.com/@pawel_czerwinski',
    },
    {
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=2560&q=85',
      author: 'Milad Fakurian',
      authorUrl: 'https://unsplash.com/@fakurian',
    },
  ],
  space: [
    {
      url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=2560&q=85',
      author: 'NASA',
      authorUrl: 'https://unsplash.com/@nasa',
    },
    {
      url: 'https://images.unsplash.com/photo-1538370965046-79c0d6907d47?auto=format&fit=crop&w=2560&q=85',
      author: 'Guillermo Ferla',
      authorUrl: 'https://unsplash.com/@gferla',
    },
    {
      url: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?auto=format&fit=crop&w=2560&q=85',
      author: 'Bryan Goff',
      authorUrl: 'https://unsplash.com/@bryangoffphotography',
    },
  ],
  cozy: [
    {
      url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=2560&q=85',
      author: 'Daiga Ellaby',
      authorUrl: 'https://unsplash.com/@daiga_ellaby',
    },
    {
      url: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=2560&q=85',
      author: 'Federico Respini',
      authorUrl: 'https://unsplash.com/@federicorespini',
    },
  ],
  travel: [
    {
      url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=2560&q=85',
      author: 'Francesca Tirico',
      authorUrl: 'https://unsplash.com/@francescatirico',
    },
    {
      url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=2560&q=85',
      author: 'Jezael Melgoza',
      authorUrl: 'https://unsplash.com/@jezael',
    },
  ],
};

export async function fetchUnsplashRandomPhoto(settings: ThemeSettings): Promise<UnsplashPhotoResult> {
  const activeTab = settings.unsplashActiveTab || 'nature';
  const selectedKeywords = settings.unsplashKeywords || [];
  const customQuery = settings.unsplashCustomQuery?.trim() || '';

  // Combine selected tags + custom query
  const queryParts: string[] = [];
  if (selectedKeywords.length > 0) {
    queryParts.push(selectedKeywords.join(','));
  }
  if (customQuery) {
    queryParts.push(customQuery);
  }
  const query = queryParts.length > 0 ? queryParts.join(',') : activeTab;
  const accessKey = settings.unsplashAccessKey?.trim();

  // If user provided an Access Key, make the official API call
  if (accessKey) {
    const controller = new AbortController();
    const fetchTimer = setTimeout(() => controller.abort(), 10000);

    try {
      const endpoint = `https://api.unsplash.com/photos/random?client_id=${encodeURIComponent(
        accessKey
      )}&query=${encodeURIComponent(query)}&orientation=landscape&content_filter=high`;

      const response = await fetch(endpoint, { signal: controller.signal });
      clearTimeout(fetchTimer);

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        const msg = (errJson as any)?.errors?.[0] || `HTTP ${response.status}`;
        throw new Error(msg);
      }

      const data = await response.json();
      const rawUrl = data.urls?.raw;
      const fallbackUrl = data.urls?.regular || data.urls?.full;

      if (!rawUrl && !fallbackUrl) {
        throw new Error('No photo URL found in response');
      }

      // Optimize image width and compression to keep payload small (~200KB-400KB WebP) for instant loading
      const finalUrl = rawUrl
        ? `${rawUrl}&auto=format&fit=crop&w=1920&q=75`
        : fallbackUrl;

      const authorName = data.user?.name || data.user?.username || 'Unsplash Photographer';
      const authorUrl = data.user?.links?.html
        ? `${data.user.links.html}?utm_source=mytab&utm_medium=referral`
        : 'https://unsplash.com/?utm_source=mytab&utm_medium=referral';

      return {
        url: finalUrl,
        authorName,
        authorUrl,
      };
    } catch (e: any) {
      clearTimeout(fetchTimer);
      console.warn('[Unsplash] API request failed, falling back to curated pool:', e);
      // Fallback to curated pool if API fails
      const fallbackList = CURATED_WALLPAPERS[activeTab] || CURATED_WALLPAPERS.nature;
      const picked = fallbackList[Math.floor(Math.random() * fallbackList.length)];
      return {
        url: picked.url,
        authorName: picked.author,
        authorUrl: picked.authorUrl,
        error: e.name === 'AbortError' ? 'API connection timed out' : e.message || 'API request failed',
      };
    }
  }

  // Without Access Key: Pick randomly from high-res curated pool for the selected category
  const fallbackList = CURATED_WALLPAPERS[activeTab] || CURATED_WALLPAPERS.nature;
  const picked = fallbackList[Math.floor(Math.random() * fallbackList.length)];

  return {
    url: picked.url,
    authorName: picked.author,
    authorUrl: picked.authorUrl,
  };
}

/**
 * Preloads an image into browser memory with a strict short timeout (2.5s)
 * so UI never hangs even if the CDN connection is throttled.
 */
export function preloadImage(url: string, timeoutMs = 2500): Promise<void> {
  return new Promise((resolve) => {
    if (!url) {
      resolve();
      return;
    }
    const img = new Image();
    let isSettled = false;

    const timer = setTimeout(() => {
      if (!isSettled) {
        isSettled = true;
        resolve(); // Ensure UI always unlocks quickly
      }
    }, timeoutMs);

    img.onload = () => {
      if (!isSettled) {
        isSettled = true;
        clearTimeout(timer);
        resolve();
      }
    };

    img.onerror = () => {
      if (!isSettled) {
        isSettled = true;
        clearTimeout(timer);
        resolve();
      }
    };

    img.src = url;
  });
}

