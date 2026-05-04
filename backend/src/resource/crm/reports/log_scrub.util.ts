/**
 * Safe display helpers for log / JSON payloads (no secrets persisted here;
 * extend redaction keys if you add full `details` to order report APIs).
 */
const REDACT_KEYS = new Set([
  "password",
  "token",
  "authorization",
  "accessToken",
  "refreshToken",
  "secret",
  "signature",
]);

export function scrubJsonValue(value: unknown, maxDepth = 4, maxLen = 4000): unknown {
  if (maxDepth < 0) return "[maxDepth]";
  if (value == null || typeof value !== "object") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((v) => scrubJsonValue(v, maxDepth - 1, maxLen));
  }
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (REDACT_KEYS.has(k.toLowerCase())) {
      out[k] = "[REDACTED]";
    } else {
      out[k] = scrubJsonValue(v, maxDepth - 1, maxLen);
    }
  }
  try {
    const s = JSON.stringify(out);
    if (s.length > maxLen) return `${s.slice(0, maxLen)}…`;
  } catch {
    return "[unserializable]";
  }
  return out;
}
