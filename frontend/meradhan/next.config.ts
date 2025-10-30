// next.config.ts
import type { NextConfig } from "next";

// ✅ Environment flag
const isDev = process.env.NODE_ENV === "development";

// ✅ Centralized base URLs for all environments
const BASES = {
  development: {
    API_SERVER: "http://localhost:4000/api",
    CMS: "http://3.110.126.202:1337",
    ASSETS: "https://jfhfryiyfqrytbtzsdtj.supabase.co/storage/v1/object/public",
  },
  production: {
    API_SERVER: "http://3.110.126.202:4000/api",
    CMS: "http://3.110.126.202:1337",
    ASSETS: "https://jfhfryiyfqrytbtzsdtj.supabase.co/storage/v1/object/public",
  },
};

// ✅ Select current environment base
const BASE = isDev ? BASES.development : BASES.production;

// ✅ Next.js configuration
const nextConfig: NextConfig = {
  trailingSlash: false,
  transpilePackages: ["@root/apiGateway", "@root/schema"],
  compress: false,

  devIndicators: {
    position: "bottom-left",
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },

  async rewrites() {
    return [
      {
        source: "/api/server/:path*",
        destination: `${BASE.API_SERVER}/:path*`,
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
