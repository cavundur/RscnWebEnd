/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'rscn.local', // Local WordPress
      'localhost',
      'wp.rscn.org', // Production WordPress
      'rscn.org',
      'www.rscn.org',
      'admin.rscn.org',
      'cms.rscn.org',
      'media.rscn.org',
      'placekitten.com', // Geçici test için
      'picsum.photos' // Geçici test için
    ],
  },
}

export default nextConfig 