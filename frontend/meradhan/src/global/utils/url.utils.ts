import { ASSETS_URL } from "../constants/domains";

export function genMediaUrl(mediaPath?: string | null): string {
  if (!mediaPath) return "/noimage.jpg";

  // Check if already a full URL (http, https) or URN (data:, urn:)
  const isFullUrl = /^(https?:\/\/|data:|urn:)/i.test(mediaPath);

  if (isFullUrl) {
    return mediaPath;
  }

  // Remove any leading slashes from mediaPath to avoid double slashes
  const normalizedPath = mediaPath.replace(/^\/+/, "");

  // Return the full URL
  return `${ASSETS_URL}/files/${normalizedPath}`;
  // return `${ASSETS_URL}/${normalizedPath}`;

}

// utils/generatePageUrl.ts
export function generatePageUrl({
  basePath,
  page,
  currentQuery,
}: {
  basePath: string;
  page: number;
  currentQuery?: Record<string, string | number | undefined>;
}): string {
  // Copy current queries if provided
  const searchParams = new URLSearchParams();
  if (currentQuery) {
    for (const [key, value] of Object.entries(currentQuery)) {
      if (value !== undefined && key !== "page") {
        searchParams.set(key, String(value));
      }
    }
  }

  // Always set the new page
  searchParams.set("page", String(page));

  const queryString = searchParams.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
}
