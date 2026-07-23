// next.config.ts
import { BASES_URLS } from "@/core/config/base.urls";
import type { NextConfig } from "next";
import path from "path";

// Next.js configuration
const nextConfig: NextConfig = {
  devIndicators: {
    position: "bottom-left",
  },
  webpack: (config, { isServer, webpack }) => {
    // Prevent canvas.node from being bundled
    config.externals.push({
      canvas: "commonjs canvas",
    });

    // Optional native dep of `natural` classifiers — not installable in Next.js; ignore if traced
    config.plugins.push(
      new webpack.IgnorePlugin({ resourceRegExp: /^webworker-threads$/ }),
    );

    // Deduplicate React on the client only. Aliasing on the server breaks Next's
    // SSR/devtools (useContext null / invalid hook call via SegmentTrieNode).
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        react: path.resolve(__dirname, "node_modules/react"),
        "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
        "react/jsx-runtime": path.resolve(
          __dirname,
          "node_modules/react/jsx-runtime.js",
        ),
        "react/jsx-dev-runtime": path.resolve(
          __dirname,
          "node_modules/react/jsx-dev-runtime.js",
        ),
      };
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
