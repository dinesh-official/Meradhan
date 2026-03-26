import { NextResponse } from "next/server";
import type { MetadataRoute } from "next";
import { fetchBondsForSitemapPage } from "../../../_sitemap/fetch-bonds";

/**
 * Generate individual bonds sitemap file
 * Each file contains max 500 bonds
 * Route: /bonds/1/sitemap.xml, /bonds/2/sitemap.xml, etc.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ page: string }> }
) {
  try {
    const { page } = await params;
    const pageNumber = parseInt(page, 10);

    if (isNaN(pageNumber) || pageNumber < 1) {
      return new NextResponse("Invalid page number", { status: 400 });
    }

    const bonds = await fetchBondsForSitemapPage(pageNumber, 500);

    // Generate XML sitemap
    const sitemap = generateSitemapXML(bonds);

    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate",
      },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return new NextResponse(`Error generating sitemap: ${errorMessage}`, {
      status: 500,
    });
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
