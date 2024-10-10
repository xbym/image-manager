/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: 'build',
  experimental: {
    serverComponentsExternalPackages: ['mongodb'],
  },
}

export default nextConfig;