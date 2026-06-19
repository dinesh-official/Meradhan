/**
 * TEMPORARY — logo.dev integration. Delete this file, the CRM route, and
 * BondLogoField "Auto-fetch" UI when no longer needed.
 */
import { putFileS3 } from "@modules/file_upload/s3_file_uploader";
import fs from "fs";
import os from "os";
import path from "path";

/** Not stored in DB/env — remove with this module. */
const LOGO_DEV_TOKEN = "live_6a1a28fd-6420-4492-aeb0-b297461d9de2";

export function buildLogoDevIssuerUrl(bondName: string): string {
  const encoded = encodeURIComponent(bondName.trim());
  const params = new URLSearchParams({
    token: LOGO_DEV_TOKEN,
    format: "webp",
    retina: "true",
    size: "128",
  });
  return `https://img.logo.dev/name/${encoded}?${params.toString()}`;
}

export async function fetchIssuerLogoFromLogoDev(
  bondName: string,
): Promise<Buffer> {
  const name = bondName.trim();
  if (!name) {
    throw new Error("Bond name is required");
  }

  const url = buildLogoDevIssuerUrl(name);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`logo.dev returned ${response.status}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.startsWith("image/")) {
    throw new Error("logo.dev did not return an image");
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length < 64) {
    throw new Error("logo.dev returned an empty image");
  }

  return buffer;
}

export async function uploadLogoDevImageToS3(
  imageBuffer: Buffer,
): Promise<string> {
  const tmpPath = path.join(
    os.tmpdir(),
    `bond-logo-dev-${Date.now()}-${Math.random().toString(36).slice(2)}.webp`,
  );

  try {
    fs.writeFileSync(tmpPath, imageBuffer);
    const result = await putFileS3(tmpPath, "bond-logos");
    if (!result.success || !result.location) {
      throw new Error("Failed to upload logo to S3");
    }
    return result.location;
  } finally {
    try {
      fs.unlinkSync(tmpPath);
    } catch {
      // ignore cleanup errors
    }
  }
}

export async function importIssuerLogoFromLogoDev(
  bondName: string,
): Promise<string> {
  const imageBuffer = await fetchIssuerLogoFromLogoDev(bondName);
  return uploadLogoDevImageToS3(imageBuffer);
}
