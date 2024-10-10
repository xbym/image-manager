/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: 'build',
  api: {
    bodyParser: false,
    responseLimit: false,
  },
}

export default nextConfig;