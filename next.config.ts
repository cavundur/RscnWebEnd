import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['rscn.local', 'placehold.co', 'via.placeholder.com', 'placekitten.com'], 
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'placekitten.com',
        pathname: '**',
      },
      {
        protocol: 'http',
        hostname: 'rscn.local',
        pathname: '**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;
