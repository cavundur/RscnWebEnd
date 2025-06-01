/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // X-Powered-By başlığını kaldır (güvenlik)
  compress: true, // Gzip sıkıştırmayı etkinleştir
  
  images: {
    domains: [
      'placehold.co',
      'cavundur.online',
      'rscn.local',
    ],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'rscn.local',
        pathname: '/wp-content/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'cavundur.online',
        pathname: '/wp-content/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
    unoptimized: false, // Görüntü optimizasyonunu etkinleştir
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 86400, // 1 gün önbellek
    formats: ['image/webp', 'image/avif'], // Modern görsel formatlarını kullan
  },
  
  // Uygulama iyileştirmeleri
  experimental: {
    optimizeCss: true, // CSS optimizasyonu
    scrollRestoration: true, // Sayfa geçişlerinde kaydırma konumunu koru
    optimisticClientCache: true, // İstemci önbelleğini optimize et
    adjustFontFallbacks: true, // Font yedeklerini iyileştir
    legacyBrowsers: false, // Eski tarayıcı desteğini kapat, kod boyutunu küçült
  },
  
  webpack: (config, { dev, isServer }) => {
    // Üretim ortamında bundle analizi aktif et
    if (!dev && !isServer) {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: './analyze/client.html',
          openAnalyzer: false,
        })
      );
    }
    
    // Disable CSS modules
    config.module.rules.forEach((rule) => {
      if (rule.test && rule.test.toString().includes('css')) {
        rule.use = [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              modules: false,
            },
          },
        ];
      }
    });
    return config;
  },
  
  // Derleme ayarları
  swcMinify: true, // Rust tabanlı daha hızlı minifier kullan
  
  // Hata ayarları
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Önbellek ve sayfa yenileme ayarları
  onDemandEntries: {
    maxInactiveAge: 60 * 1000, // 60 saniye
    pagesBufferLength: 4, // Önbellek sayfa sayısını artır
  },
  
  async rewrites() {
    return [
      {
        source: '/wp-content/:path*',
        destination: 'http://cavundur.online/wp-content/:path*',
      },
      {
        source: '/api/:path*',
        destination: 'http://cavundur.online/wp-json/:path*',
      }
    ]
  },
  
  async headers() {
    return [
      {
        // Tüm sayfalar için önbellek başlıkları
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type',
          },
          // Tarayıcı önbellekleme
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
      // Statik dosyalar için önbellek başlıkları
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig 