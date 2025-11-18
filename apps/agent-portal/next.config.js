/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ['@airline-ops/shared-types'],

  // Environment variables available to the browser
  env: {
    NEXT_PUBLIC_DCS_SERVICE_URL: process.env.NEXT_PUBLIC_DCS_SERVICE_URL || 'http://localhost:3010',
    NEXT_PUBLIC_SOCKET_IO_URL: process.env.NEXT_PUBLIC_SOCKET_IO_URL || 'http://localhost:3011',
  },

  // Rewrites for API proxy
  async rewrites() {
    return [
      {
        source: '/api/dcs/:path*',
        destination: `${process.env.NEXT_PUBLIC_DCS_SERVICE_URL}/api/v1/:path*`,
      },
    ];
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Experimental features
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
};

module.exports = nextConfig;
