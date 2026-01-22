/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Static export for shared hosting (no Node.js required)
  output: 'export',
  // Subpath deployment support (optional)
  // 
  // For subpath deployment (/udl-stem-lab), set environment variable:
  // NEXT_PUBLIC_BASE_PATH=/udl-stem-lab
  // Then rebuild: npm run build
  //
  // For subdomain deployment, leave NEXT_PUBLIC_BASE_PATH unset or empty.
  ...(process.env.NEXT_PUBLIC_BASE_PATH && {
    basePath: process.env.NEXT_PUBLIC_BASE_PATH,
    assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH,
  }),
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
