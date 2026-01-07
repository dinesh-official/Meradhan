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
  return `${ASSETS_URL}/files/${normalizedPath}`;
}

/**
 * Encodes a numeric ID to a URL-safe base64 string
 * @param id - The numeric ID to encode
 * @returns Encoded string safe for use in URLs
 * @throws Error if id is not a valid number
 */
export function encodeId(id: number | string): string {
  const numId = typeof id === "string" ? Number(id) : id;

  if (isNaN(numId) || !Number.isInteger(numId) || numId < 0) {
    throw new Error(
      `Invalid ID to encode: ${id}. Must be a non-negative integer.`
    );
  }

  // Convert number to string and encode to base64url
  const idString = numId.toString();
  const base64 = Buffer.from(idString, "utf-8").toString("base64");
  // Convert base64 to base64url (replace + with -, / with _, remove padding)
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

/**
 * Decodes a URL-safe base64 string back to a numeric ID
 * @param encodedId - The encoded ID string from the URL
 * @returns The decoded numeric ID
 * @throws Error if encodedId is invalid or cannot be decoded
 */
export function decodeId(encodedId: string): number {
  if (!encodedId || typeof encodedId !== "string") {
    throw new Error(
      `Invalid encoded ID: ${encodedId}. Must be a non-empty string.`
    );
  }

  try {
    // Convert base64url back to base64 (replace - with +, _ with /, add padding if needed)
    let base64 = encodedId.replace(/-/g, "+").replace(/_/g, "/");
    // Add padding if needed
    while (base64.length % 4) {
      base64 += "=";
    }

    // Decode from base64
    const decoded = Buffer.from(base64, "base64").toString("utf-8");
    const numId = Number(decoded);

    if (isNaN(numId) || !Number.isInteger(numId) || numId < 0) {
      throw new Error(`Decoded value is not a valid ID: ${decoded}`);
    }

    return numId;
  } catch (error) {
    throw new Error(
      `Failed to decode ID "${encodedId}": ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Type-safe helper to get decoded ID from route params
 * Useful in Next.js page components
 */
export function getDecodedIdFromParams(
  params: Promise<{ id: string }> | { id: string }
): Promise<number> {
  return Promise.resolve(params).then(async (p) => {
    const resolvedParams = await p;
    return decodeId(resolvedParams.id);
  });
}
