import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Sadece geliştirme ortamında console.log kullanacak yardımcı fonksiyon
 */
export const devLog = (message: string, ...data: any[]) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(message, ...data);
  }
};

// Proxy URL'leri için basit önbellek
const proxyUrlCache = new Map<string, string>();

/**
 * WordPress medya URL'lerini proxy URL'lerine dönüştürür
 * @param url WordPress medya URL'si
 * @returns Proxy URL'si
 */
export function convertToProxyUrl(url: string | null): string {
  // Eğer url null veya boşsa varsayılan görsel yolunu döndür
  if (!url) {
    return '/images/placeholder.jpg'; // Projedeki bir varsayılan görsel
  }

  // Önbellekte varsa doğrudan döndür (performans için önemli)
  if (proxyUrlCache.has(url)) {
    return proxyUrlCache.get(url)!;
  }

  try {
    const urlObj = new URL(url);
    
    // WordPress medya URL'si mi kontrol et
    if (
      (urlObj.hostname === 'cavundur.online' || urlObj.hostname === 'rscn.local') &&
      urlObj.pathname.startsWith('/wp-content/')
    ) {
      // Proxy endpoint'ini kullanarak görsel URL'sini oluştur
      const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(url)}`;
      
      // Önbelleğe al
      proxyUrlCache.set(url, proxyUrl);
      
      return proxyUrl;
    }
    
    // WordPress medya URL'si değilse orijinal URL'yi döndür
    // Önbelleğe al
    proxyUrlCache.set(url, url);
    
    return url;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error converting URL:', error);
    }
    return '/images/placeholder.jpg'; // Hata durumunda varsayılan görsel
  }
}

/**
 * Performans için sayfa geçişlerini iyileştirmeye yardımcı olan yardımcı fonksiyonlar
 */

// Sayfa geçişleri sırasında kullanılan görselleri önceden yükler
export function preloadImage(src: string): void {
  if (typeof window !== 'undefined') {
    const img = new Image();
    img.src = src;
  }
}

// Belirli sayfalar için veri önceden yüklenebilir
export async function preloadPageData(slug: string, type: 'post' | 'project' | 'event' = 'post'): Promise<void> {
  try {
    // Henüz gerekli API çağrısını yap
    if (type === 'project') {
      const wpApi = await import('@/lib/api/wordpress');
      wpApi.default.getProjectBySlug(slug);
    } else if (type === 'event') {
      const wpApi = await import('@/lib/api/wordpress');
      wpApi.default.getEventBySlug(slug);
    } else {
      const wpApi = await import('@/lib/api/wordpress');
      wpApi.default.getPostBySlug(slug);
    }
  } catch (error) {
    console.error(`Error preloading ${type} data for ${slug}:`, error);
  }
}
