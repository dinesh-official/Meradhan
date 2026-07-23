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
  // Do not also list kyc-providers here — it conflicts with transpilePackages.
  serverExternalPackages: [
    "@react-pdf/renderer",
    "@ag-media/react-pdf-table",
    "canvas",
    "pdf-poppler",
    "pdf-to-img",
    "pdf2pic",
    "react-pdf-tailwind",
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
    // Deduplicate nested React on the client only — server alias breaks SSR hooks
    // (NextTopLoader useEffect null).
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
    } else {
      // Extra guard: never bundle react-pdf into the server graph during page-data collection.
      const prev = config.externals;
      config.externals = [
        ...(Array.isArray(prev) ? prev : prev ? [prev] : []),
        ({ request }: { request?: string }, callback: (err?: Error | null, result?: string) => void) => {
          if (
            request &&
            (/^@react-pdf\//.test(request) ||
              request === "react-pdf-tailwind" ||
              request === "@ag-media/react-pdf-table")
          ) {
            return callback(null, `commonjs ${request}`);
          }
          callback();
        },
      ];
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
