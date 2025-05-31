import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

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

  try {
    const urlObj = new URL(url);
    
    // WordPress medya URL'si mi kontrol et
    if (
      (urlObj.hostname === 'cavundur.online' || urlObj.hostname === 'rscn.local') &&
      urlObj.pathname.startsWith('/wp-content/')
    ) {
      // Sadece pathname'i döndür, proxy bunu kullanacak
      return urlObj.pathname;
    }
    
    // WordPress medya URL'si değilse orijinal URL'yi döndür
    return url;
  } catch (error) {
    console.error('Error converting URL:', error);
    return '/images/placeholder.jpg'; // Hata durumunda varsayılan görsel
  }
}
