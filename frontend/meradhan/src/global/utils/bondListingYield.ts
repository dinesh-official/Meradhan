/** Parse the public listing `yield` field (not buyYield). */
export function parseBondListingYield(
  value: string | number | null | undefined,
): number | null {
  if (value == null) return null;
  const raw = typeof value === "string" ? value.trim() : value;
  if (raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

/** e.g. "11.50%" or null when listing yield is absent / invalid. */
export function formatBondListingYield(
  value: string | number | null | undefined,
): string | null {
  const n = parseBondListingYield(value);
  return n == null ? null : `${n.toFixed(2)}%`;
}

export function formatBondListingYieldLabel(
  value: string | number | null | undefined,
  fallback = "Coming Soon",
): string {
  return formatBondListingYield(value) ?? fallback;
}
