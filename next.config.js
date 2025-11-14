/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['loopfreight.io'],
  },
}

module.exports = nextConfig