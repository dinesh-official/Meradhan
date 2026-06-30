import { createHmac, randomInt } from "node:crypto";

export type ChecksumMessageParts = {
  uuid: string;
  merchantId: number | string;
  merchantName: string;
  merchantEmail: string;
  publicIp: string;
};

/** Build the checksum message: `{uuid}|{merchant_id}|{merchant_name}|{merchant_email}|{public_ip}` (no spaces). */
export function buildChecksumMessage(parts: ChecksumMessageParts): string {
  return [
    parts.uuid,
    String(parts.merchantId),
    parts.merchantName,
    parts.merchantEmail,
    parts.publicIp,
  ].join("|");
}

/** HMAC-SHA256 of `message` with `secretKey`, Base64-encoded. */
export function signChecksum(message: string, secretKey: string): string {
  return createHmac("sha256", secretKey).update(message, "utf8").digest("base64");
}

/** Fresh per-request UUID: `{merchantId}|{timestampMs}|{randomInt}`. */
export function generateUuid(merchantId: number | string): string {
  return `${merchantId}|${Date.now()}|${randomInt(1, 1_000_000_000)}`;
}

export type AuthConfig = {
  merchantId: number | string;
  merchantName: string;
  merchantEmail: string;
  publicIp: string;
  secretKey: string;
};

export type AuthFields = {
  merchant_id: number | string;
  uuid: string;
  checksum: string;
};

/** Produce the per-request auth fields (fresh uuid + checksum) to merge into a request body. */
export function buildAuthFields(cfg: AuthConfig): AuthFields {
  const uuid = generateUuid(cfg.merchantId);
  const message = buildChecksumMessage({
    uuid,
    merchantId: cfg.merchantId,
    merchantName: cfg.merchantName,
    merchantEmail: cfg.merchantEmail,
    publicIp: cfg.publicIp,
  });
  return {
    merchant_id: cfg.merchantId,
    uuid,
    checksum: signChecksum(message, cfg.secretKey),
  };
}
