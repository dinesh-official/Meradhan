export function formatNumberTS(value: number | string): string {
  const n = Number(value);
  if (!isFinite(n)) return String(value);

  let maxDigits = 10;
  if (typeof value === "string") {
    const match = value.trim().match(/\.(\d+)/);
    if (match) maxDigits = Math.min(10, Math.max(2, match[1].length));
  }

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: maxDigits,
  }).format(n);
}

/** Truncate toward zero to `decimals` places (does not round). */
export function truncateDecimals(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.trunc(value * factor) / factor;
}

/** Order amounts — truncate to exactly 2 decimals. */
export function formatAmount(num: number | string) {
  const n = Number(num);
  if (!Number.isFinite(n)) return String(num);
  const fixedNum = truncateDecimals(n, 2).toFixed(2);
  const parts = fixedNum.split(".");

  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return parts.join(".");
}
