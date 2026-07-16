/**
 * Shared UI decimal display for order / bond pricing fields.
 * See `.cursor/rules/order-pricing-decimal-display.mdc`.
 *
 * Minimum decimals are a floor (always pad to at least N).
 * Extra significant decimals beyond the minimum are shown (up to MAX_FRACTION_DIGITS).
 */

/** Cap to avoid float noise; still allows more than each field's minimum. */
const MAX_FRACTION_DIGITS = 10;

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

  // Prefer raw string fractional length when the API sent a decimal string,
  // so we don't lose trailing precision to Number() rounding.
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

/** YTM / yield % — at least 2 decimals; more if present. */
export function formatYtmDisplay(
  value: number | string | null | undefined,
): string {
  const formatted = formatWithMinDecimals(value, 2);
  return formatted == null ? "—" : `${formatted}%`;
}

/** Clean price — at least 4 decimals; more if present. */
export function formatCleanPriceDisplay(
  value: number | string | null | undefined,
): string {
  return formatWithMinDecimals(value, 4) ?? "—";
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
 * Principal, accrued interest, total consideration, stamp duty, settlement —
 * at least 2 decimals; more if present (optional ₹).
 */
export function formatInrMoneyDisplay(
  value: number | string | null | undefined,
  opts?: { withRupee?: boolean },
): string {
  const formatted = formatWithMinDecimals(value, 2);
  if (formatted == null) return "—";
  return opts?.withRupee === false ? formatted : `₹${formatted}`;
}
