import type { MetadataRoute } from "next";
import { getBaseUrl } from "./_sitemap/utils";
import {
  getStaticRoutes,
  fetchBlogsForSitemap,
  fetchNewsForSitemap,
  fetchIssuerNotesForSitemap,
  fetchBlogCategoriesForSitemap,
  fetchNewsCategoriesForSitemap,
  fetchRegulatoryCategoriesForSitemap,
} from "./_sitemap";
import { getBondsSitemapPageCount } from "./_sitemap/fetch-bonds";

/**
 * Generate sitemap index for the application
 * Main sitemap includes:
 * - Static routes and other content (blogs, news, etc.)
 * - References to separate bonds sitemaps (sitemap-bonds-1.xml, sitemap-bonds-2.xml, etc.)
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();
  const staticRoutes = getStaticRoutes();

  try {
    // Fetch all non-bonds data in parallel
    const [
      blogs,
      news,
      issuerNotes,
      blogCategories,
      newsCategories,
      regulatoryCategories,
      bondsPageCount,
    ] = await Promise.all([
      fetchBlogsForSitemap(),
      fetchNewsForSitemap(),
      fetchIssuerNotesForSitemap(),
      fetchBlogCategoriesForSitemap(),
      fetchNewsCategoriesForSitemap(),
      fetchRegulatoryCategoriesForSitemap(),
      getBondsSitemapPageCount(500),
    ]);

    // Combine all non-bonds routes
    const allRoutes = [
      ...staticRoutes,
      ...blogs,
      ...news,
      ...issuerNotes,
      ...blogCategories,
      ...newsCategories,
      ...regulatoryCategories,
    ];

    // Sort by priority (highest first) and then by URL
    allRoutes.sort((a, b) => {
      const priorityDiff = (b.priority || 0) - (a.priority || 0);
      if (priorityDiff !== 0) return priorityDiff;
      return a.url.localeCompare(b.url);
    });

    // If we have bonds sitemaps, create a sitemap index
    if (bondsPageCount > 0) {
      const sitemapIndex = [
        // Main sitemap with all non-bonds content
        {
          url: `${baseUrl}/sitemap-main.xml`,
          lastModified: new Date(),
        },
        // Individual bonds sitemaps
        ...Array.from({ length: bondsPageCount }, (_, i) => ({
          url: `${baseUrl}/bonds/${i + 1}/sitemap.xml`,
          lastModified: new Date(),
        })),
      ];

      return sitemapIndex;
    }

    // If no bonds, return regular sitemap
    return allRoutes;
  } catch {
    // Return at least static routes even if dynamic content fails
    return staticRoutes;
  }
}
