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

const LEGACY_MAX_BOND_QTY = 120;

/**
 * Integer cap for place-order bond quantity from CRM inventory (`crmAvailableQuantity`).
 * When the field is missing or invalid (older API), falls back to {@link LEGACY_MAX_BOND_QTY}.
 */
export function getMaxOrderQuantityFromBond(bond: {
  crmAvailableQuantity?: number;
}): number {
  const raw = bond.crmAvailableQuantity;
  if (raw == null) {
    return LEGACY_MAX_BOND_QTY;
  }
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) {
    return 0;
  }
  return Math.max(1, Math.floor(n));
}

