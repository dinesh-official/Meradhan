import { BASES_URLS } from "@/core/config/base.urls";
import { ASSETS_URL } from "../constants/domains";

/** Same token as backend `GET /files-public/*` (see packages/kyc-providers/pdf/helper.ts). */
const FILES_PUBLIC_TOKEN = "meradhan24873284sadsrFAD";

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

export function genCmsMediaUrl(mediaPath?: string | null): string {
  if (!mediaPath) return "/noimage.jpg";

  const isFullUrl = /^(https?:\/\/|data:|urn:)/i.test(mediaPath);

  if (isFullUrl) {
    return mediaPath;
  }

  return `${BASES_URLS.CMS}/assets/cms/media/${mediaPath.replace(/^\/+/, "")}`;
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

/**
 * Public URL for bond issuer logos (S3 paths or full https URLs).
 * Uses `/files-public` so `<img>` loads work without auth cookies.
 */
export function genBondLogoUrl(logoUrl?: string | null): string | null {
  if (!logoUrl) return null;
  const trimmed = logoUrl.trim();
  if (!trimmed || /^(n\/?a|none|-+|null|undefined)$/i.test(trimmed)) {
    return null;
  }

  if (/^(https?:\/\/|data:|urn:)/i.test(trimmed)) {
    return trimmed;
  }

  const key = trimmed.replace(/^\/+/, "").replace(/^files-public\//, "");
  if (!key) return null;

  return `${ASSETS_URL}/files-public/${key}?token=${FILES_PUBLIC_TOKEN}`;
}
