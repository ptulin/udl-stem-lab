/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Subpath deployment support (optional)
  // 
  // RECOMMENDATION: Use subdomain deployment (udl-stem-lab.disruptiveexperience.com)
  // for simpler setup. Subpath requires basePath configuration and rebuild.
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
}

module.exports = nextConfig
