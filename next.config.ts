import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV === 'development';

// Defense-in-depth: headers also applied at the framework level
// (middleware applies them first; this covers static files and edge cases)
const securityHeaders = [
  { key: 'X-Content-Type-Options',     value: 'nosniff' },
  { key: 'X-Frame-Options',             value: 'DENY' },
  { key: 'X-XSS-Protection',            value: '1; mode=block' },
  { key: 'Referrer-Policy',             value: 'strict-origin-when-cross-origin' },
  { key: 'Cross-Origin-Opener-Policy',  value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy',value: 'same-origin' },
  ...(!isDev ? [
    { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  ] : []),
];

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'placebeard.it',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatar.iran.liara.run',
        port: '',
        pathname: '/**',
      },
    ],
  },
  devIndicators: {
    position: 'bottom-right',
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  // Disable X-Powered-By at the framework level
  poweredByHeader: false,
};

export default nextConfig;
