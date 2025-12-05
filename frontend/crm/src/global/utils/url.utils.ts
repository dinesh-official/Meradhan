import { ASSETS_URL } from "../constants/domains";

export function genMediaUrl(mediaPath?: string | null): string {
  if (!mediaPath || mediaPath === "/noimage.jpg") return "/noimage.jpg";

  // Check if already a full URL (http, https) or URN (data:, urn:)
  const isFullUrl = /^(https?:\/\/|data:|urn:)/i.test(mediaPath);

  if (isFullUrl) {
    return mediaPath;
  }

  // Remove any leading slashes from mediaPath to avoid double slashes
  const normalizedPath = mediaPath.replace(/^\/+/, "");

  // Return the full URL
  return `${ASSETS_URL}/${normalizedPath}`;
}
