/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Remove standalone output for Vercel deployment
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },
  // Site configuration support
  env: {
    SITE_NAME: process.env.SITE_NAME || 'Monitoring in a Box',
    SITE_URL: process.env.SITE_URL || 'http://localhost:3000',
    SITE_DESCRIPTION: process.env.SITE_DESCRIPTION || 'Comprehensive DevOps monitoring solution with real-time metrics, centralized logging, and intelligent alerting.',
  },
  // Only apply rewrites in development
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/prometheus/:path*',
          destination: 'http://localhost:9090/api/v1/:path*',
        },
        {
          source: '/api/loki/:path*',
          destination: 'http://localhost:3100/loki/api/v1/:path*',
        },
        {
          source: '/api/alertmanager/:path*',
          destination: 'http://localhost:9093/api/v2/:path*',
        },
      ];
    }
    return [];
  },
};

module.exports = nextConfig;
