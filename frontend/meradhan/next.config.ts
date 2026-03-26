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
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,POST,PUT,DELETE,OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "*",
          },
        ],
      },
    ];
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
      // Note: /api/cms/graphql is handled by a route handler (route.ts) for security
      // Route handlers take precedence over rewrites, so graphql requests will be
      // proxied server-side with the token, while other /api/cms/* paths use this rewrite
      {
        source: "/api/cms/:path*",
        destination: `${BASES_URLS.CMS}/:path*`,
      },
      {
        source: "/assets/media/:path*",
        destination: `${BASES_URLS.ASSETS}/:path*`,
      },
      // Rewrite sitemap XML files to route handlers
      {
        source: "/sitemap-main.xml",
        destination: "/sitemap-main",
      },
      {
        source: "/api/meradhan/kra/uat/:path*",
        destination: `https://pilot.kra.ndml.in/:path*`,
      },
    ];
  },
};

export default nextConfig;
