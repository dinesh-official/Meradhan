import apiServerCaller from "@/core/connection/apiServerCaller";
import apiGateway from "@root/apiGateway";
import type { SitemapEntry } from "./types";
import { createSitemapEntry } from "./utils";

/**
 * Fetch bonds for a specific sitemap page
 * Only fetches bonds where isListed = "YES"
 * @param pageNumber - The sitemap page number (1-indexed)
 * @param pageSize - Number of bonds per sitemap (default: 500)
 */
export async function fetchBondsForSitemapPage(
  pageNumber: number,
  pageSize: number = 500
): Promise<SitemapEntry[]> {
  try {
    const apiCaller = new apiGateway.bondsApi.BondsApi(apiServerCaller);
    const bonds: SitemapEntry[] = [];
    const apiLimit = 100; // Fetch 100 bonds per API call
    const startIndex = (pageNumber - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    let currentIndex = 0;
    let apiPage = 1;
    let hasMore = true;

    while (hasMore && currentIndex < endIndex) {
      try {
        const { responseData } = await apiCaller.getListedBonds({
          filters: {},
          params: {
            page: apiPage.toString(),
            limit: apiLimit.toString(),
            category: "all",
          },
        });

        if (!responseData?.data || responseData.data.length === 0) {
          hasMore = false;
          break;
        }

        // Filter and create sitemap entries for listed bonds only
        for (const bond of responseData.data) {
          // Only include bonds where isListed = "YES"
          if (bond.isin && bond.isListed === "YES") {
            if (currentIndex >= startIndex && currentIndex < endIndex) {
              bonds.push(
                createSitemapEntry(`/bonds/detail/${bond.isin}`, {
                  lastModified: bond.updatedAt
                    ? new Date(bond.updatedAt)
                    : new Date(),
                  changeFrequency: "weekly",
                  priority: 0.9,
                })
              );
            }
            currentIndex++;

            // Stop if we've reached the end of this sitemap page
            if (currentIndex >= endIndex) {
              hasMore = false;
              break;
            }
          }
        }

        // Check if there are more pages from API
        const totalPages = responseData.meta?.total
          ? Math.ceil(responseData.meta.total / apiLimit)
          : 1;

        if (apiPage >= totalPages) {
          hasMore = false;
        } else {
          apiPage++;
        }
      } catch {
        hasMore = false;
      }
    }

    return bonds;
  } catch {
    return [];
  }
}

/**
 * Get total count of listed bonds for sitemap pagination
 */
export async function getListedBondsCount(): Promise<number> {
  try {
    const apiCaller = new apiGateway.bondsApi.BondsApi(apiServerCaller);
    const { responseData } = await apiCaller.getListedBonds({
      filters: {},
      params: {
        page: "1",
        limit: "1",
        category: "all",
      },
    });

    // Count only listed bonds
    // We need to fetch more to get accurate count, but for now use meta.total
    // In a real scenario, you might want to add a count endpoint
    if (responseData?.meta?.total) {
      // Fetch a sample to count listed bonds
      const sampleResponse = await apiCaller.getListedBonds({
        filters: {},
        params: {
          page: "1",
          limit: "1000", // Fetch larger sample to estimate
          category: "all",
        },
      });

      if (sampleResponse?.responseData?.data) {
        const listedCount = sampleResponse.responseData.data.filter(
          (bond) => bond.isListed === "YES"
        ).length;

        // Estimate total based on sample
        const totalPages = Math.ceil(responseData.meta.total / 1000);
        return listedCount * totalPages;
      }
    }

    return responseData?.meta?.total || 0;
  } catch {
    return 0;
  }
}

/**
 * Get total number of sitemap pages needed for bonds
 * @param pageSize - Number of bonds per sitemap (default: 500)
 */
export async function getBondsSitemapPageCount(
  pageSize: number = 500
): Promise<number> {
  try {
    const apiCaller = new apiGateway.bondsApi.BondsApi(apiServerCaller);
    let totalListedBonds = 0;
    let apiPage = 1;
    const apiLimit = 1000;
    let hasMore = true;

    // Count all listed bonds
    while (hasMore) {
      try {
        const { responseData } = await apiCaller.getListedBonds({
          filters: {},
          params: {
            page: apiPage.toString(),
            limit: apiLimit.toString(),
            category: "all",
          },
        });

        if (!responseData?.data || responseData.data.length === 0) {
          hasMore = false;
          break;
        }

        // Count only listed bonds
        const listedInPage = responseData.data.filter(
          (bond) => bond.isListed === "YES"
        ).length;
        totalListedBonds += listedInPage;

        // Check if there are more pages
        const totalPages = responseData.meta?.total
          ? Math.ceil(responseData.meta.total / apiLimit)
          : 1;

        if (apiPage >= totalPages) {
          hasMore = false;
        } else {
          apiPage++;
        }
      } catch {
        hasMore = false;
      }
    }

    return Math.ceil(totalListedBonds / pageSize);
  } catch {
    return 0;
  }
}
