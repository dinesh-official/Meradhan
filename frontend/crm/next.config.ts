import type { NextConfig } from "next";
import path from "path";
import { BASES_URLS } from "./src/core/config/base.urls";

const reactDir = path.resolve(__dirname, "node_modules/react");
const reactDomDir = path.resolve(__dirname, "node_modules/react-dom");

const nextConfig: NextConfig = {
  /* config options here */
  typedRoutes: true,
  trailingSlash: false,
  reactStrictMode: false,
  transpilePackages: ["@root/apiGateway", "@root/schema", "kyc-providers"],
  // Keep PDF/native deps out of the RSC server graph (avoids createContext errors).
  serverExternalPackages: [
    "@react-pdf/renderer",
    "@ag-media/react-pdf-table",
    "canvas",
    "pdf-poppler",
    "pdf-to-img",
  ],
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
  webpack: (config, { isServer }) => {
    // Linked packages (kyc-providers → @react-pdf/renderer) can install a nested
    // React copy. Deduplicate on the client only — aliasing React on the server
    // breaks Next DevTools SSR (useContext null / invalid hook via SegmentTrieNode).
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        react: reactDir,
        "react$": reactDir,
        "react/jsx-runtime": path.join(reactDir, "jsx-runtime.js"),
        "react/jsx-dev-runtime": path.join(reactDir, "jsx-dev-runtime.js"),
        "react-dom": reactDomDir,
        "react-dom$": reactDomDir,
        "react-dom/client": path.join(reactDomDir, "client.js"),
      };
    }
    return config;
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
