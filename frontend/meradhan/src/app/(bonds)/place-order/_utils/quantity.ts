export function parseQuantityValue(value: unknown): number | null {
  if (value == null) return null;
  const raw = String(value).trim();
  if (!raw) return null;

  // Accept values like "120", "1,200", "120 Qty.", etc.
  const digitsOnly = raw.replace(/[^\d]/g, "");
  if (!digitsOnly) return null;

  const parsed = Number.parseInt(digitsOnly, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

export function getMaxPurchasableQuantity(
  primary: unknown,
  fallback?: unknown
): number {
  return parseQuantityValue(primary) ?? parseQuantityValue(fallback) ?? 1;
}

