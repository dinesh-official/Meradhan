// next.config.ts
import { BASES_URLS } from "@/core/config/base.urls";
import type { NextConfig } from "next";

// Next.js configuration
const nextConfig: NextConfig = {
  devIndicators: {
    position: "bottom-left",
  },
  webpack: (config) => {
    // Prevent canvas.node from being bundled
    config.externals.push({
      canvas: "commonjs canvas",
    });

    return config;
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },

  async rewrites() {
    return [
      {
        source: "/api/server/:path*",
        destination: `${BASES_URLS.API_SERVER}/api/:path*`,
      },
      {
        source: "/assets/cms/media/:path*",
        destination: `${BASES_URLS.CMS}/:path*`,
      },
      {
        source: "/api/cms/:path*",
        destination: `${BASES_URLS.CMS}/:path*`,
      },
      {
        source: "/assets/media/:path*",
        destination: `${BASES_URLS.ASSETS}/:path*`,
      },
    ];
  },
};

export default nextConfig;
