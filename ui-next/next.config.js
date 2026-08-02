/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable standalone output for Docker deployment
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9090',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3100',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9093',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },
  // Site configuration support
  env: {
    SITE_NAME: process.env.SITE_NAME || 'Monitoring in a Box',
    SITE_URL: process.env.SITE_URL || 'http://localhost:4000',
    SITE_DESCRIPTION: process.env.SITE_DESCRIPTION || 'Comprehensive DevOps monitoring solution with real-time metrics, centralized logging, and intelligent alerting.',
  },
  // Monitoring backends are reached through the authenticated route handler at
  // app/api/proxy/[service]/[...path], which works identically in development
  // and production. The previous dev-only rewrites here were unreachable (no
  // code called /api/prometheus/*) and silently disappeared in production.
};

module.exports = nextConfig;
