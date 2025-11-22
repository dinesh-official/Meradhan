import { ASSETS_URL } from "../constants/domains";

const hostPath =
  "https://jfhfryiyfqrytbtzsdtj.supabase.co/storage/v1/object/public";

export function genMediaUrl(mediaPath?: string | null): string {
  if (!mediaPath || mediaPath === "/noimage.jpg") return "/noimage.jpg";

  // Check if already a full URL (http, https) or URN (data:, urn:)
  const isFullUrl = /^(https?:\/\/|data:|urn:)/i.test(mediaPath);

  if (isFullUrl) {
    if (mediaPath.startsWith(hostPath)) {
      return mediaPath.replace(hostPath, ASSETS_URL);
    }
    return mediaPath;
  }

  // Remove any leading slashes from mediaPath to avoid double slashes
  const normalizedPath = mediaPath.replace(/^\/+/, "");

  // Return the full URL
  return `${normalizedPath}`;
}
