import { addYears } from "date-fns";

export type DateInput = Date | string | number;

// Avoids the "Sept" vs "Sep" inconsistency from Intl.DateTimeFormat { month: "short" }
// introduced in newer ICU data (Node 18+, Chrome 110+).
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export type DateFormatToken =
  // Numeric dates
  | "DD MM YY"
  | "DD/MM/YYYY"
  | "YYYY-MM-DD"
  | "MM-DD-YYYY"
  | "DD.MM.YYYY"
  | "YYYY.MM.DD"
  // Text month names
  | "DD MMM YYYY"
  | "DD MMMM YYYY"
  | "MMMM DD, YYYY"
  | "MMM DD, YYYY"
  // Time formats
  | "HH:mm:ss"
  | "HH:mm"
  | "hh:mm AA"
  | "hh:mm:ss AA"
  | "hh:mm aa"
  // Combined date-time formats
  | "DD/MM/YYYY HH:mm:ss"
  | "YYYY-MM-DD HH:mm:ss"
  | "DD MMM YYYY HH:mm"
  | "DD MMMM YYYY hh:mm AA"
  | "DD MMM YYYY hh:mm AA"
  | "MMMM DD, YYYY HH:mm"
  | "YYYY.MM.DD HH:mm:ss"
  | "MM-DD-YYYY hh:mm AA";

/**
 * DateFormatString type allows either a predefined format or any string
 */

export const dateTimeUtils = {
  formatDateTime: (
    dateInput: DateInput | null | undefined,
    format: DateFormatToken,
    locale: string = "en-US"
  ): string => {
    if (dateInput === null || dateInput === undefined || dateInput === "")
      return "";

    let date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    if (isNaN(date.getTime()) && typeof dateInput === "string") {
      const parsed = dateTimeUtils.parseDate(dateInput);
      if (parsed) date = parsed;
    }
    if (isNaN(date.getTime())) return "Invalid Date";

    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
    const hours24 = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const ampm = hours24 >= 12 ? "PM" : "AM";
    const hours12 = hours24 % 12 || 12;

    const monthNamesLong = new Intl.DateTimeFormat(locale, { month: "long" }).format;

    let formatted = format as string;

    formatted = formatted
      .replace(/DD/g, String(day).padStart(2, "0"))
      .replace(/\bD(?!D)\b/g, String(day))
      .replace(/MMMM/g, monthNamesLong(new Date(2000, month, 1)))
      .replace(/MMM/g, MONTHS_SHORT[month])
      .replace(/MM/g, String(month + 1).padStart(2, "0"))
      .replace(/YYYY/g, String(year))
      .replace(/YY/g, String(year).slice(-2))
      .replace(/HH/g, String(hours24).padStart(2, "0"))
      .replace(/hh/g, String(hours12).padStart(2, "0"))
      .replace(/mm/g, String(minutes).padStart(2, "0"))
      .replace(/ss/g, String(seconds).padStart(2, "0"))
      // Only replace standalone AM/PM tokens (avoid changing "Apr", "Aug", etc.)
      .replace(/\bAA\b/g, ampm)
      .replace(/\bA\b/g, ampm.charAt(0))
      .replace(/\baa\b/g, ampm.toLowerCase());

    return formatted;
  },

  parseDate(input: Date | string): Date | null {
    if (input instanceof Date) return input;
    if (!input || typeof input !== "string") return null;

    const str = input.trim();

    // --- 1️⃣ ISO format (YYYY-MM-DD) ---
    // Must match exactly to prevent confusion
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      const [y, m, d] = str.split("-").map(Number);
      return new Date(y, m - 1, d); // ✅ always local time, no UTC issue
    }

    // --- 2️⃣ DD-MMM-YYYY / DD-MMM-YY (NSE RFQ master + order metadata deal dates) ---
    const mmmMatch = /^(\d{1,2})[-\/\s]([A-Za-z]{3})[-\/\s](\d{2}|\d{4})$/.exec(
      str,
    );
    if (mmmMatch) {
      const day = Number(mmmMatch[1]);
      const monToken = mmmMatch[2].slice(0, 1).toUpperCase() + mmmMatch[2].slice(1).toLowerCase();
      const month = MONTHS_SHORT.indexOf(monToken);
      let year = Number(mmmMatch[3]);
      if (mmmMatch[3].length === 2) {
        year += year >= 70 ? 1900 : 2000;
      }
      if (month >= 0 && day >= 1 && day <= 31) {
        return new Date(year, month, day);
      }
    }

    // --- 3️⃣ DD/MM/YYYY or MM/DD/YYYY (numeric only) ---
    const normalized = str.replace(/[.\-]/g, "/");
    const parts = normalized.split("/");

    if (parts.length === 3 && parts.every((p) => /^\d+$/.test(p))) {
      const [a, b, c] = parts.map(Number);

      if (a > 31 || b > 31) return null; // sanity check
      if (a > 12 && b <= 12) {
        // DD/MM/YYYY (common in India, UK)
        return new Date(c, b - 1, a);
      } else if (b > 12 && a <= 12) {
        // MM/DD/YYYY
        return new Date(c, a - 1, b);
      } else if (a > 999) {
        // YYYY/MM/DD
        return new Date(a, b - 1, c);
      } else {
        // Ambiguous → assume DD/MM/YYYY
        return new Date(c, b - 1, a);
      }
    }

    // --- 4️⃣ Fallback: textual formats ("Nov 2, 2001") ---
    const fallback = new Date(Date.parse(str));
    if (!isNaN(fallback.getTime())) return fallback;

    return null;
  },

  addDays(date: Date, days: number) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },

  /** Format local date to YYYY-MM-DD (no timezone surprises) */
  toIsoDate(dateInput: DateInput): string {
    const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
    if (isNaN(d.getTime())) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  },

  isPast(date: Date) {
    return date < new Date();
  },

  addYears(date: Date, years: number) {
    return addYears(date, years);
  },
};

export type ExchangeHolidaySet = ReadonlySet<string>; // YYYY-MM-DD

function normalizeToLocalMidnight(dateInput: DateInput): Date {
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function isWeekend(dateInput: DateInput): boolean {
  const d = normalizeToLocalMidnight(dateInput);
  const day = d.getDay(); // 0 Sun, 6 Sat
  return day === 0 || day === 6;
}

export function isExchangeHoliday(
  dateInput: DateInput,
  holidays: ExchangeHolidaySet
): boolean {
  const iso = dateTimeUtils.toIsoDate(dateInput);
  return !!iso && holidays.has(iso);
}

export function isNonWorkingDay(
  dateInput: DateInput,
  holidays: ExchangeHolidaySet
): boolean {
  return isWeekend(dateInput) || isExchangeHoliday(dateInput, holidays);
}

/**
 * Returns the same day if it is a working day; otherwise advances to the next working day.
 * Working day = not weekend and not in `holidays` (YYYY-MM-DD).
 */
export function nextWorkingDay(
  dateInput: DateInput,
  holidays: ExchangeHolidaySet
): Date {
  let d = normalizeToLocalMidnight(dateInput);
  while (isNonWorkingDay(d, holidays)) {
    d = dateTimeUtils.addDays(d, 1);
  }
  return d;
}

/**
 * Adds N working days (N>=0). If start date is non-working, first moves to next working day.
 * Example: addWorkingDays(Fri, 1) => next working day (Mon, unless holiday).
 */
export function addWorkingDays(
  dateInput: DateInput,
  workingDaysToAdd: number,
  holidays: ExchangeHolidaySet
): Date {
  let d = nextWorkingDay(dateInput, holidays);
  let remaining = Math.max(0, Math.floor(workingDaysToAdd));
  while (remaining > 0) {
    d = dateTimeUtils.addDays(d, 1);
    if (!isNonWorkingDay(d, holidays)) {
      remaining -= 1;
    }
  }
  return d;
}

export function calculateReadTime(html: string) {
  // 1. Remove all HTML tags
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // 2. Count words
  const wordCount = text.split(/\s+/).length;

  // 3. Calculate read time (assuming 200 words per minute)
  const wordsPerMinute = 200;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  // 4. Format result
  if (hours > 0 && remainingMinutes > 0) {
    return `${hours} hour${hours > 1 ? "s" : ""} ${remainingMinutes} min read`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? "s" : ""} read`;
  } else {
    return `${minutes} min read`;
  }
}

export function convertUTCtoIST(utcStr?: string): string | undefined {
  if (!utcStr) {
    return undefined;
  }
  const utcDate = new Date(utcStr);

  // Calculate IST offset: 5 hours 30 minutes in milliseconds
  // const istOffsetMs = (5 * 60 + 30) * 60 * 1000;

  // Get IST date
  const istDate = new Date(utcDate.getTime());

  // Helper to pad numbers
  const pad = (num: number): string => num.toString().padStart(2, "0");

  const year = istDate.getFullYear();
  const month = pad(istDate.getMonth() + 1);
  const day = pad(istDate.getDate());
  const hours = pad(istDate.getHours());
  const minutes = pad(istDate.getMinutes());
  const seconds = pad(istDate.getSeconds());

  // Return formatted string with +05:30
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+05:30`;
}

export function formatDateCustom(dateStr: string): string {
  const date = new Date(dateStr);

  const day = date.getDate().toString().padStart(2, "0");
  const month = MONTHS_SHORT[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}
