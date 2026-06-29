const MONTHS: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/** `DD-MMM-YYYY` (e.g. `11-Apr-2028`) → IST-aligned ISO string; null for null/N/A/"-"/""/unparseable. */
export function deridataDateToIstIso(s: string | null | undefined): string | null {
  const v = (s ?? "").trim();
  if (!v || /^(n\/?a|-)$/i.test(v)) return null;
  const m = /^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/.exec(v);
  if (!m) return null;
  const day = Number(m[1]);
  const mon = MONTHS[m[2]!.toLowerCase()];
  const year = Number(m[3]);
  if (!mon) return null;
  const utc = new Date(Date.UTC(year, mon - 1, day, 0, 0, 0));
  if (Number.isNaN(utc.getTime())) return null;
  return new Date(utc.getTime() + IST_OFFSET_MS).toISOString();
}

/** Same as `deridataDateToIstIso` but returns a `Date` (for `@db.Date` columns) or `undefined`. */
export function deridataDateToIstDateOnly(s: string | null | undefined): Date | undefined {
  const iso = deridataDateToIstIso(s);
  return iso ? new Date(iso) : undefined;
}
