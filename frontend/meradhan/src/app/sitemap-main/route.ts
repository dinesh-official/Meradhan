import { NextResponse } from "next/server";
import type { MetadataRoute } from "next";
import {
  getStaticRoutes,
  fetchBlogsForSitemap,
  fetchNewsForSitemap,
  fetchIssuerNotesForSitemap,
  fetchBlogCategoriesForSitemap,
  fetchNewsCategoriesForSitemap,
  fetchRegulatoryCategoriesForSitemap,
} from "../_sitemap";

/**
 * Generate main sitemap (all content except bonds)
 * Route: /sitemap-main.xml
 */
export async function GET() {
  try {
    const staticRoutes = getStaticRoutes();

    // Fetch all non-bonds data in parallel
    const [
      blogs,
      news,
      issuerNotes,
      blogCategories,
      newsCategories,
      regulatoryCategories,
    ] = await Promise.all([
      fetchBlogsForSitemap(),
      fetchNewsForSitemap(),
      fetchIssuerNotesForSitemap(),
      fetchBlogCategoriesForSitemap(),
      fetchNewsCategoriesForSitemap(),
      fetchRegulatoryCategoriesForSitemap(),
    ]);

    // Combine all routes
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

    // Generate XML sitemap
    const sitemap = generateSitemapXML(allRoutes);

    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate",
      },
    });
  } catch (error) {
    console.error("Error generating main sitemap:", error);
    return new NextResponse("Error generating sitemap", { status: 500 });
  }
}

/**
 * Generate XML sitemap from entries
 */
function generateSitemapXML(entries: MetadataRoute.Sitemap): string {
  const urls = entries
    .map((entry) => {
      const lastmod = entry.lastModified
        ? new Date(entry.lastModified).toISOString()
        : new Date().toISOString();
      const changefreq = entry.changeFrequency || "weekly";
      const priority = entry.priority || 0.7;

      return `  <url>
    <loc>${escapeXML(entry.url)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

/**
 * Escape XML special characters
 */
function escapeXML(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

