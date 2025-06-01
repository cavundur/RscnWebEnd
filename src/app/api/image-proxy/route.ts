import { NextRequest } from 'next/server';

/**
 * WordPress görsellerini CORS sorunu olmadan sunmak için proxy endpoint.
 * Sadece belirli domainlere izin verir.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');

  // Güvenlik: Sadece belirli domainlere izin ver
  if (!url || !url.startsWith('http') || !url.includes('cavundur.online/wp-content/uploads')) {
    return new Response('Invalid or unauthorized URL', { status: 400 });
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return new Response('Image not found', { status: 404 });
    }
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = await response.arrayBuffer();
    return new Response(Buffer.from(buffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (e) {
    return new Response('Proxy error', { status: 500 });
  }
} 