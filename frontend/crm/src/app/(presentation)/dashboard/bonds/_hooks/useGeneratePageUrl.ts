"use client";

import { useQueryStates } from "nuqs";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Hook-based utility to generate page URLs with current query params
 * (auto-detects basePath and merges existing search params).
 */
export function useGeneratePageUrl() {
  const [query] = useQueryStates({});
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return ({
    basePath = pathname,
    page,
  }: {
    basePath?: string;
    page?: number;
  }): string => {
    const params = new URLSearchParams(searchParams.toString());

    // Remove existing page param and add the new one
    if (page) {
      params.delete("page");
      params.set("page", String(page));
    }

    // Preserve other params from Nuqs (if any)
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && key !== "page") {
        params.set(key, String(value));
      }
    }

    const queryString = params.toString();
    return queryString ? `${basePath}?${queryString}` : basePath;
  };
}
