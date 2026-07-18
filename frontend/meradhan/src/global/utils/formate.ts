/**
 * Truncate toward zero to `decimals` places (does not round).
 * e.g. truncateDecimals(100.126, 2) → 100.12
 */
export function truncateDecimals(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.trunc(value * factor) / factor;
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
  return truncateDecimals(n, 2).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Clean price as % of face — truncate to exactly 4 decimals. */
export function formatCleanPricePercent(value: number | string): string {
  const n = Number(value);
  if (!isFinite(n)) return String(value);
  return truncateDecimals(n, 4).toLocaleString("en-IN", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  });
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
