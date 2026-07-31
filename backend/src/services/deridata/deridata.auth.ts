import { createHmac, randomInt } from "node:crypto";

/**
 * DeriData Merchant API V3.1 auth:
 * - uuid: `{merchant_id}|{epoch_ms}|{random_number}`
 * - checksum message: `{uuid}|{merchant_id}|{merchant_name}|{merchant_email}|{public_ip}`
 * - checksum: Base64(HMAC-SHA256(secret_key, message))
 */
export function buildDeriDataUuid(merchantId: number): string {
  return `${merchantId}|${Date.now()}|${randomInt(100000, 999999999)}`;
}

export function buildDeriDataChecksum(
  secretKey: string,
  message: string,
): string {
  return createHmac("sha256", secretKey).update(message).digest("base64");
}

export function buildDeriDataChecksumMessage(input: {
  uuid: string;
  merchantId: number;
  merchantName: string;
  merchantEmail: string;
  publicIp: string;
}): string {
  return [
    input.uuid,
    String(input.merchantId),
    input.merchantName,
    input.merchantEmail,
    input.publicIp,
  ].join("|");
}

export function buildDeriDataAuth(input: {
  merchantId: number;
  secretKey: string;
  merchantName: string;
  merchantEmail: string;
  publicIp: string;
}): {
  uuid: string;
  message: string;
  checksum: string;
} {
  const uuid = buildDeriDataUuid(input.merchantId);
  const message = buildDeriDataChecksumMessage({
    uuid,
    merchantId: input.merchantId,
    merchantName: input.merchantName,
    merchantEmail: input.merchantEmail,
    publicIp: input.publicIp,
  });
  const checksum = buildDeriDataChecksum(input.secretKey, message);
  return { uuid, message, checksum };
}
