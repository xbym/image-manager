/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: '.next',
  experimental: {
    serverComponentsExternalPackages: ['mongodb'],
  },
}

export default nextConfig;