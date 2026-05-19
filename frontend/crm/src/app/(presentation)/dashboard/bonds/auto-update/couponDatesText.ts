import {
  formatDateForDateInput,
  parseApiDateStringToLocalDate,
} from "../_utils/bondCalendarDates";

export function couponDatesToText(dates: Date[] | undefined | null): string {
  if (!dates?.length) return "";
  return dates
    .map((d) => formatDateForDateInput(d instanceof Date ? d : parseApiDateStringToLocalDate(String(d))))
    .filter(Boolean)
    .join("\n");
}

export function textToCouponDates(text: string): Date[] {
  const lines = text
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const dates: Date[] = [];
  for (const line of lines) {
    const dt = parseApiDateStringToLocalDate(line);
    if (!Number.isNaN(dt.getTime())) dates.push(dt);
  }
  return dates;
}

export function formatCouponDatesDisplay(dates: Date[] | undefined | null): string {
  const t = couponDatesToText(dates);
  return t || "—";
}
