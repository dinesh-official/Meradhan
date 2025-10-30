import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  trailingSlash: false,
  transpilePackages: ["@root/apiGateway", "@root/schema"],

  compress: false,
  devIndicators: {
    position: "bottom-left",
  },
  images: {
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
        destination: process.env.NODE_ENV === "development" ? "http://localhost:4000/api/:path*" : "http://3.110.126.202:4000/api/:path*",
      },
      {
        source: "/assets/media/:path*", // what user visits
        destination:
          "https://jfhfryiyfqrytbtzsdtj.supabase.co/storage/v1/object/public/:path*", // where it actually fetches
      },
    ];
  },
};

export default nextConfig;
