import { NextRequest } from 'next/server';

// Önbellek için basit bir TTL değeri (1 gün)
const CACHE_TTL = 86400;

/**
 * WordPress görsellerini CORS sorunu olmadan sunmak için proxy endpoint.
 * Sadece belirli domainlere izin verir ve görselleri önbelleğe alır.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');

    // URL boş ya da geçersizse hata döndür
    if (!url || !url.startsWith('http')) {
      return new Response('Invalid URL provided', { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // İzin verilen domainleri kontrol et
    const allowedDomains = ['cavundur.online', 'rscn.local'];
    const urlObj = new URL(url);
    
    if (!allowedDomains.some(domain => urlObj.hostname.includes(domain))) {
      return new Response('Unauthorized domain', { 
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Sadece wp-content/uploads ve medya dosyalarına izin ver
    if (!urlObj.pathname.includes('/wp-content/uploads/')) {
      return new Response('Only media files are allowed', { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // İstek başlıklarını hazırla
    const headers = new Headers();
    headers.set('User-Agent', 'Mozilla/5.0 (compatible; RSCN-Proxy/1.0)');
    
    // Tarayıcının Cache-Control değerini kontrol et
    const cacheControl = req.headers.get('cache-control');
    if (cacheControl && cacheControl.includes('no-cache')) {
      // Eğer tarayıcı önbellek kullanmak istemiyorsa, Next.js önbelleğine de bunu bildir
      headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    }

    // Görseli fetch et
    const response = await fetch(url, {
      headers,
      next: {
        revalidate: CACHE_TTL // 24 saat önbelleğe al
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        // Görsel bulunamadıysa varsayılan görsel döndür
        const fallbackImage = new URL('/images/placeholder.jpg', req.nextUrl.origin);
        return Response.redirect(fallbackImage.toString(), 302);
      }

      return new Response(`Failed to fetch image: ${response.status} ${response.statusText}`, { 
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // İçerik tipini ve diğer önemli başlıkları al
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const contentLength = response.headers.get('content-length');
    const lastModified = response.headers.get('last-modified');
    
    // Yanıt başlıklarını oluştur
    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', contentType);
    responseHeaders.set('Cache-Control', `public, max-age=${CACHE_TTL}`); // 24 saat istemcide önbelleğe al
    
    if (contentLength) {
      responseHeaders.set('Content-Length', contentLength);
    }
    
    if (lastModified) {
      responseHeaders.set('Last-Modified', lastModified);
    }
    
    // CORS başlıkları ekle
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    
    // Cache kontrolü için ETag ve diğer başlıkları ekle
    const etag = response.headers.get('etag');
    if (etag) {
      responseHeaders.set('ETag', etag);
    }

    // Tarayıcıdan gelen If-None-Match kontrolü
    const ifNoneMatch = req.headers.get('if-none-match');
    if (ifNoneMatch && etag && ifNoneMatch === etag) {
      return new Response(null, { 
        status: 304, // Not Modified
        headers: responseHeaders
      });
    }
    
    // Veriyi döndür
    const data = await response.arrayBuffer();
    return new Response(data, { 
      headers: responseHeaders,
      status: 200
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    
    // Kritik hatalar için varsayılan görsel döndür
    try {
      const fallbackImagePath = '/images/placeholder.jpg'; 
      const fallbackUrl = new URL(fallbackImagePath, new URL(req.url).origin);
      
      return Response.redirect(fallbackUrl.toString(), 302);
    } catch (redirectError) {
      // Son çare olarak metin hata mesajı döndür
      return new Response(`Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}`, { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
} 