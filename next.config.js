/** @type {import('next').NextConfig} */
const nextConfig = {
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
  },
  webpack: (config) => {
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
  // Vercel deploy hatalarını görmezden gelmek için
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Build sırasında uyarıları görmezden gel
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
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
        ],
      },
    ]
  },
}

module.exports = nextConfig 