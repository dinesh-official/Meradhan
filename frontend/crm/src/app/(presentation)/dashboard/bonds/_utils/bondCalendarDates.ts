import { format } from "date-fns";

/**
 * API calendar fields are `YYYY-MM-DD` or ISO datetimes. `new Date("YYYY-MM-DD")` is parsed as UTC and
 * shifts the day when shown in `<input type="date">` or via `toISOString()` in negative-offset timezones.
 */
export function parseApiDateStringToLocalDate(s: string): Date {
  const t = s.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) {
    const [y, m, d] = t.split("-").map(Number);
    return new Date(y!, m! - 1, d!);
  }
  const isoPrefix = t.match(/^(\d{4}-\d{2}-\d{2})/);
  if (isoPrefix?.[1]) {
    const [y, m, d] = isoPrefix[1].split("-").map(Number);
    return new Date(y!, m! - 1, d!);
  }
  return new Date(s);
}

export function formatDateForDateInput(d: Date): string {
  if (Number.isNaN(d.getTime())) return "";
  return format(d, "yyyy-MM-dd");
}
