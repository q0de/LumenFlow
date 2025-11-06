/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
  // Railway sets PORT environment variable automatically
  // Next.js will use it by default
}

module.exports = nextConfig

