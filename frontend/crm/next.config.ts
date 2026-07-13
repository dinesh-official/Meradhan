import type { NextConfig } from "next";
import { BASES_URLS } from "./src/core/config/base.urls";

const nextConfig: NextConfig = {
  /* config options here */
  typedRoutes: true,
  trailingSlash: false,
  reactStrictMode: false,
  transpilePackages: ["@root/apiGateway", "@root/schema", "kyc-providers"],
  experimental: {
    // Increase request-body buffering limit (default 10mb) for large uploads proxied through Next.js.
    // Docs: https://nextjs.org/docs/15/pages/api-reference/config/next-config-js/middlewareClientMaxBodySize
    middlewareClientMaxBodySize: "40mb",
    // If any uploads ever go through Server Actions, bump that limit too.
    serverActions: {
      bodySizeLimit: "40mb",
    },
    // Default rewrite proxyTimeout is 30s — DeriData autofill (2 calculator calls) often exceeds that.
    // Matches CRM axios / CrmBondAutoUpdateApi 120s timeouts.
    proxyTimeout: 120_000,
  },
  // Skip lint and type-check during `next build` so build succeeds even with lint/type issues
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
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
