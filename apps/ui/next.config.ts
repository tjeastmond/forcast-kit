import type { NextConfig } from 'next';

const apiOrigin = process.env.FORECAST_KIT_API_URL ?? 'http://127.0.0.1:3847';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@forecast-kit/core'],
  rewrites() {
    return Promise.resolve([
      {
        source: '/api/:path*',
        destination: `${apiOrigin}/:path*`,
      },
    ]);
  },
};

export default nextConfig;
