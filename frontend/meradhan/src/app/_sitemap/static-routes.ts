import type { SitemapEntry } from "./types";
import { createSitemapEntries } from "./utils";

/**
 * Static routes that don't change frequently
 */
export function getStaticRoutes(): SitemapEntry[] {
  const staticPaths = [
    // Home
    "/",

    // Pages
    "/about-us",
    "/contact-us",
    "/faqs",
    "/privacy-policy",
    "/terms-of-use",
    "/cookie-policy",
    "/disclaimer",

    // Tools
    "/ytm-calculator",
    "/fd-calculator",
    "/dhangpt",

    // Other pages
    "/economic-calendar",
    "/glossary",
    "/issuer-notes",
    "/regulatory-circulars",

    // Bonds main pages
    "/bonds",
    "/bonds/comparison",

    // Bond categories
    "/bonds/tax-free",
    "/bonds/corporate",
    "/bonds/bank",
    "/bonds/nbfc",
    "/bonds/psu",
    "/bonds/perpetual",
    "/bonds/zero-coupon",
    "/bonds/latest-release",

    // Blog & News
    "/blog",
    "/news",
  ];

  return createSitemapEntries(staticPaths, {
    changeFrequency: "monthly",
    priority: 0.8,
  });
}

