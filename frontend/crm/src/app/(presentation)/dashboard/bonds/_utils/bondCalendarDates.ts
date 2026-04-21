const IST_TZ = "Asia/Kolkata";

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** Get calendar Y-M-D for a Date in IST */
function getIstYmdParts(d: Date): { y: number; m: number; day: number } {
  // Use Intl parts to avoid local timezone affecting the date input.
  const parts = new Intl.DateTimeFormat("en-IN", {
    timeZone: IST_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);

  const y = Number(parts.find((p) => p.type === "year")?.value);
  const m = Number(parts.find((p) => p.type === "month")?.value);
  const day = Number(parts.find((p) => p.type === "day")?.value);
  return { y, m, day };
}

/**
 * API calendar fields are `YYYY-MM-DD` or ISO datetimes. `new Date("YYYY-MM-DD")` is parsed as UTC and
 * shifts the day when shown in `<input type="date">` or via `toISOString()` in negative-offset timezones.
 */
export function parseApiDateStringToLocalDate(s: string): Date {
  const t = s.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) {
    const [y, m, d] = t.split("-").map(Number);
    // Treat as a calendar date in IST; store as UTC midnight so it round-trips safely.
    return new Date(Date.UTC(y!, m! - 1, d!));
  }
  // ISO datetime / other date strings: parse to Date, then normalize to IST calendar day.
  const parsed = new Date(t);
  if (!Number.isNaN(parsed.getTime())) {
    const { y, m, day } = getIstYmdParts(parsed);
    if (Number.isFinite(y) && Number.isFinite(m) && Number.isFinite(day)) {
      return new Date(Date.UTC(y, m - 1, day));
    }
    return parsed;
  }
  return parsed;
}

export function formatDateForDateInput(d: Date): string {
  if (Number.isNaN(d.getTime())) return "";
  const { y, m, day } = getIstYmdParts(d);
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(day)) return "";
  return `${y}-${pad2(m)}-${pad2(day)}`;
}
