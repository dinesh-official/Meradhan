import type { NextConfig } from "next";
import { BASES } from "./src/core/config/base.urls";

// Environment detection
const isDev = process.env.NODE_ENV === "development";
const BASE = isDev ? BASES.development : BASES.production;

const nextConfig: NextConfig = {
  /* config options here */
  typedRoutes: true,
  trailingSlash: false,
  reactStrictMode: false,
  transpilePackages: ["@root/apiGateway", "@root/schema"],
  devIndicators: {
    position: "bottom-left",
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/server/:path*",
        destination: `${BASE.API_SERVER}/api/:path*`,
      },
      {
        source: "/assets/media/:path*", // what user visits
        destination: `${BASE.ASSETS}/:path*`, // where it actually fetches
      },
    ];
  },
};

export default nextConfig;
