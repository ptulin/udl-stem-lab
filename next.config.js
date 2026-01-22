/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Static export for shared hosting (no Node.js required)
  output: 'export',
  // Subpath deployment - app is at /udl-stem-lab/
  basePath: '/udl-stem-lab',
  assetPrefix: '/udl-stem-lab',
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
