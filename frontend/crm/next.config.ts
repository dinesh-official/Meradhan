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
        destination: 'http://3.110.126.202:4000/api/:path*',
      },
       {
        source: '/assets/media/:path*',        // what user visits
        destination: 'https://bgzlloqonccvfegaxgcm.supabase.co/storage/v1/object/public/public_storage/:path*', // where it actually fetches
      },
    ];
  },
};

export default nextConfig;
