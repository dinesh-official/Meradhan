/**
 * Sitemap utilities - centralized exports
 * 
 * This folder contains all sitemap-related utilities:
 * - types.ts: Type definitions
 * - utils.ts: Helper functions for creating sitemap entries
 * - static-routes.ts: Static routes configuration
 * - fetch-bonds.ts: Fetch all bonds via API
 * - fetch-content.ts: Fetch blogs, news, and issuer notes via GraphQL
 */

export * from "./types";
export * from "./utils";
export * from "./static-routes";
export * from "./fetch-bonds";
export * from "./fetch-content";

// Export bonds-specific functions
export {
  fetchBondsForSitemapPage,
  getBondsSitemapPageCount,
  getListedBondsCount,
} from "./fetch-bonds";

