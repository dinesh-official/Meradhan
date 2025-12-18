import type { MetadataRoute } from "next";
import { BASES_URLS } from "@/core/config/base.urls";

export default function robots(): MetadataRoute.Robots {
  const hostUrl = BASES_URLS.HOST || "https://www.meradhan.com";
  const isSandbox = BASES_URLS.DIGIO === "sandbox";

  // In sandbox mode, disallow all routes from search engines
  if (isSandbox) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
      sitemap: `${hostUrl}/sitemap.xml`,
    };
  }

  // Production mode: allow public routes, disallow private routes
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard/",
        "/place-order/",
        "/login/",
        "/signup/",
        "/logout/",
        "/reset-password/",
        "/forgot-password/",
        "/verify-email/",
        "/api/",
        "/_next/",
      ],
    },
    sitemap: `${hostUrl}/sitemap.xml`,
  };
}
