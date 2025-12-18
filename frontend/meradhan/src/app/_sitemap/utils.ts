import type { SitemapEntry } from "./types";
import { BASES_URLS } from "@/core/config/base.urls";

/**
 * Get base URL for sitemap entries
 * Uses environment variable or falls back to localhost for development
 */
export function getBaseUrl(): string {
  // In development, use localhost if HOST is not set
  if (process.env.NODE_ENV === "development" && !BASES_URLS.HOST) {
    return "http://localhost:3000";
  }
  return BASES_URLS.HOST || "https://www.meradhan.com";
}

/**
 * Create a sitemap entry
 */
export function createSitemapEntry(
  path: string,
  options?: {
    lastModified?: Date;
    changeFrequency?:
      | "always"
      | "hourly"
      | "daily"
      | "weekly"
      | "monthly"
      | "yearly"
      | "never";
    priority?: number;
  }
): SitemapEntry {
  const baseUrl = getBaseUrl();
  const url = path.startsWith("http")
    ? path
    : `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;

  return {
    url,
    lastModified: options?.lastModified || new Date(),
    changeFrequency: options?.changeFrequency || "weekly",
    priority: options?.priority || 0.7,
  };
}

/**
 * Create sitemap entries for multiple paths
 */
export function createSitemapEntries(
  paths: string[],
  options?: {
    lastModified?: Date;
    changeFrequency?:
      | "always"
      | "hourly"
      | "daily"
      | "weekly"
      | "monthly"
      | "yearly"
      | "never";
    priority?: number;
  }
): SitemapEntry[] {
  return paths.map((path) => createSitemapEntry(path, options));
}
