/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // API proxy to analytics service
  async rewrites() {
    return [
      {
        source: '/api/analytics/:path*',
        destination: process.env.NEXT_PUBLIC_ANALYTICS_API_URL + '/:path*',
      },
    ];
  },
  
  // Image optimization
  images: {
    domains: ['localhost'],
    formats: ['image/avif', 'image/webp'],
  },
  
  // Performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['recharts', 'lodash'],
  },
  
  // Headers for security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
