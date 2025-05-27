import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * WordPress medya URL'lerini proxy URL'lerine dönüştürür
 * @param url WordPress medya URL'si
 * @returns Proxy URL'si
 */
export function convertToProxyUrl(url: string): string {
  if (!url) return '';
  
  try {
    const urlObj = new URL(url);
    // Hem HTTP hem HTTPS için kontrol et
    if ((urlObj.hostname === 'cavundur.online' || urlObj.hostname === 'rscn.local') && 
        urlObj.pathname.startsWith('/wp-content/')) {
      return urlObj.pathname;
    }
    return url;
  } catch (error) {
    console.error('Error converting URL:', error);
    return url;
  }
}
