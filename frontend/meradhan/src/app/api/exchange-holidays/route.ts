import { NextResponse } from "next/server";

function parseHolidayList(raw: string | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((v) => (typeof v === "string" ? v.trim() : ""))
      .filter((v) => /^\d{4}-\d{2}-\d{2}$/.test(v));
  } catch {
    return [];
  }
}

export async function GET() {
  // Config-backed list of exchange holidays as YYYY-MM-DD strings.
  // Source: EXCHANGE_HOLIDAYS_JSON='["2026-03-16","2026-08-15"]'
  const holidays = parseHolidayList(process.env.EXCHANGE_HOLIDAYS_JSON);
  return NextResponse.json({ holidays });
}

