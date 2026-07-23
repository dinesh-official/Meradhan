// next.config.ts
import { BASES_URLS } from "@/core/config/base.urls";
import type { NextConfig } from "next";
import path from "path";

const reactDir = path.resolve(__dirname, "node_modules/react");
const reactDomDir = path.resolve(__dirname, "node_modules/react-dom");

// Next.js configuration
const nextConfig: NextConfig = {
  devIndicators: {
    position: "bottom-left",
  },
  transpilePackages: ["@root/apiGateway", "@root/schema"],
  // Linked apiGateway → kyc-providers can pull PDF/native deps into the RSC graph
  // and break page-data collection with "createContext is not a function".
  serverExternalPackages: [
    "@react-pdf/renderer",
    "@ag-media/react-pdf-table",
    "canvas",
    "pdf-poppler",
    "pdf-to-img",
    "pdf2pic",
    "react-pdf-tailwind",
  ],
  webpack: (config, { isServer, webpack }) => {
    // Prevent canvas.node from being bundled
    config.externals.push({
      canvas: "commonjs canvas",
    });

    // Optional native dep of `natural` classifiers — not installable in Next.js; ignore if traced
    config.plugins.push(
      new webpack.IgnorePlugin({ resourceRegExp: /^webworker-threads$/ }),
    );

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
      config.externals.push(
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
      );
    }

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
        source: "/api/dhangpt/:path*",
        destination: `http://localhost:6003/:path*`,
      },
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
