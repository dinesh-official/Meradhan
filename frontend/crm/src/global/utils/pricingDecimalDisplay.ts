/**
 * Shared UI decimal display for order / bond pricing fields.
 * See `.cursor/rules/order-pricing-decimal-display.mdc`.
 *
 * Money amounts (principal / accrued / settlement): truncate then show exactly 2 dp.
 * Clean price: truncate then show exactly 4 dp.
 * YTM / unit: min floor; extra precision kept when present.
 */

/** Cap to avoid float noise for fields that allow extra precision. */
const MAX_FRACTION_DIGITS = 10;

/**
 * Truncate toward zero to `decimals` places (does not round).
 * e.g. truncateDecimals(100.126, 2) → 100.12
 */
export function truncateDecimals(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.trunc(value * factor) / factor;
}

function asFinite(value: number | string | null | undefined): number | null {
  if (value == null) return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

/**
 * Format with a minimum fraction-digit floor.
 * Values with more precision than `minDigits` keep those extra decimals
 * (up to MAX_FRACTION_DIGITS). Values with fewer are padded to `minDigits`.
 */
function formatWithMinDecimals(
  value: number | string | null | undefined,
  minDigits: number,
): string | null {
  const n = asFinite(value);
  if (n == null) return null;

  let preferredMax = MAX_FRACTION_DIGITS;
  if (typeof value === "string") {
    const match = value.trim().match(/\.(\d+)/);
    if (match) {
      preferredMax = Math.min(
        MAX_FRACTION_DIGITS,
        Math.max(minDigits, match[1].length),
      );
    }
  }

  return n.toLocaleString("en-IN", {
    minimumFractionDigits: minDigits,
    maximumFractionDigits: preferredMax,
  });
}

/** Truncate then format with an exact digit count (no extra decimals). */
function formatExactTruncated(
  value: number | string | null | undefined,
  decimals: number,
): string | null {
  const n = asFinite(value);
  if (n == null) return null;
  return truncateDecimals(n, decimals).toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** YTM / yield % — at least 2 decimals; more if present. */
export function formatYtmDisplay(
  value: number | string | null | undefined,
): string {
  const formatted = formatWithMinDecimals(value, 2);
  return formatted == null ? "—" : `${formatted}%`;
}

/** Clean price — truncate to exactly 4 decimals. */
export function formatCleanPriceDisplay(
  value: number | string | null | undefined,
): string {
  return formatExactTruncated(value, 4) ?? "—";
}

/** Unit / unit price — at least 4 decimals; more if present (optional ₹). */
export function formatUnitPriceDisplay(
  value: number | string | null | undefined,
  opts?: { withRupee?: boolean },
): string {
  const formatted = formatWithMinDecimals(value, 4);
  if (formatted == null) return "—";
  return opts?.withRupee === false ? formatted : `₹${formatted}`;
}

/**
 * Principal, accrued interest, settlement (and other INR money) —
 * truncate to exactly 2 decimals (optional ₹).
 */
export function formatInrMoneyDisplay(
  value: number | string | null | undefined,
  opts?: { withRupee?: boolean },
): string {
  const formatted = formatExactTruncated(value, 2);
  if (formatted == null) return "—";
  return opts?.withRupee === false ? formatted : `₹${formatted}`;
}
