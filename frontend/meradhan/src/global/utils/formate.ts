/**
 * Truncate toward zero to `decimals` places via string slicing (does not round).
 * e.g. truncateDecimals(100.126, 2) → 100.12
 * When `formatted` is true, returns a comma-grouped string (e.g. "1,234.56").
 */
export function truncateDecimals(
  value: number | string,
  decimals?: number,
  formatted?: false,
): number;
export function truncateDecimals(
  value: number | string,
  decimals: number | undefined,
  formatted: true,
): string;
export function truncateDecimals(
  value: number | string,
  decimals = 2,
  formatted = false,
): number | string {
  const str = (typeof value === "string" ? value : String(value)).trim();
  const negative = str.startsWith("-");
  const raw = negative ? str.slice(1) : str;

  const dot = raw.indexOf(".");
  const intPart = dot === -1 ? raw : raw.slice(0, dot);
  const decPart = dot === -1 ? "" : raw.slice(dot + 1, dot + 1 + decimals);
  const sign = negative ? "-" : "";

  if (formatted) {
    const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `${sign}${withCommas}.${decPart.padEnd(decimals, "0")}`;
  }

  if (!decPart || /^0+$/.test(decPart)) {
    return Number(`${sign}${intPart}`);
  }

  const trimmed = decPart.replace(/0+$/, "");
  const result = trimmed
    ? `${sign}${intPart}.${trimmed}`
    : `${sign}${intPart}`;
  return Number(result);
}

/** Generic number format — min 2 dp; keeps extra precision when present. */
export function formatNumberTS(value: number | string): string {
  const n = Number(value);
  if (!isFinite(n)) return String(value);
  let maxDigits = 10;
  if (typeof value === "string") {
    const match = value.trim().match(/\.(\d+)/);
    if (match) maxDigits = Math.min(10, Math.max(2, match[1].length));
  }
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: maxDigits,
  }).format(n);
}

/**
 * Principal / accrued interest / settlement amount —
 * truncate then show exactly 2 decimals.
 */
export function formatInrMoney2dp(value: number | string): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value);
  return truncateDecimals(n, 2, true);
}

/** Clean price as % of face — truncate to exactly 4 decimals. */
export function formatCleanPricePercent(value: number | string): string {
  const n = Number(value);
  if (!isFinite(n)) return String(value);
  return truncateDecimals(n, 4, true)
}

export const makeFullname = ({
  firstName,
  middleName,
  lastName,
}: {
  firstName: string;
  middleName?: string | null;
  lastName?: string | null;
}) => {
  let fullName = firstName;
  if (middleName) {
    fullName += ` ${middleName}`;
  }
  if (lastName) {
    fullName += ` ${lastName}`;
  }
  return fullName;
};

/** Order list/card amounts — truncate to exactly 2 decimals. */
export function formatAmount(num: number | string) {
  const n = Number(num);
  if (!Number.isFinite(n)) return String(num);
  const truncated = truncateDecimals(n, 2);
  const fixedNum = truncated.toFixed(2);
  const parts = fixedNum.split(".");

  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return parts.join(".");
}

export function maskEmail(email: string) {
  const [username, domain] = email.split("@");

  if (!username || !domain) return email; // fallback

  // Show first 4 chars, rest masked as xxxx
  const visible = username.slice(0, 4);
  const masked = "xxxx";

  return `${visible}${masked}@${domain}`;
}
