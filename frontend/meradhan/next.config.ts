// next.config.ts
import { BASES } from "@/core/config/base.urls";
import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";
// Select current environment base
const BASE = isDev ? BASES.development : BASES.production;

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
        destination: `${BASE.API_SERVER}/api/:path*`,
      },
      {
        source: "/assets/cms/media/:path*",
        destination: `${BASE.CMS}/:path*`,
      },
      {
        source: "/api/cms/:path*",
        destination: `${BASE.CMS}/:path*`,
      },
      {
        source: "/assets/media/:path*",
        destination: `${BASE.ASSETS}/:path*`,
      },
    ];
  },
};

export default nextConfig;
