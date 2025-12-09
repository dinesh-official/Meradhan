import type { NextConfig } from "next";
import { BASES_URLS } from "./src/core/config/base.urls";

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
        destination: `${BASES_URLS.API_SERVER}/api/:path*`,
      },
      {
        source: "/assets/media/:path*", // what user visits
        destination: `${BASES_URLS.ASSETS}/:path*`, // where it actually fetches
      },
    ];
  },
};

export default nextConfig;
