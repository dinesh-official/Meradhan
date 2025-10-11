import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  distDir: 'build',
  typedRoutes: true,
  trailingSlash: false,
  transpilePackages: ['@root/apiGateway', '@root/schema'],
  devIndicators: {
    position: "bottom-left",
  },
  cacheMaxMemorySize: 0, // disable default in-memory caching
  async rewrites() {
    return [
      {
        source: '/api/server/:path*',
        destination: 'http://localhost:4000/:path*',
      },
    ];
  },
};

export default nextConfig;
