import { NextResponse } from "next/server";
import { calculateYtm } from "./ytm";

const couponFrequency = {
  Annual: 1,
  "Semi-Annual": 2,
  Quarterly: 4,
  Monthly: 12,
} as const;

const dayCount = {
  "Actual/Actual": 1,
  "30/360 (US)": 0,
  "Actual/360": 2,
  "Actual/365": 3,
  "30E/360 (EU)": 4,
} as const;

type CouponFrequency = keyof typeof couponFrequency;
type DayCount = keyof typeof dayCount;

const toNumber = (value: unknown, field: string) => {
  const num = Number(value);
  if (!Number.isFinite(num)) {
    throw new Error(`${field} must be a valid number`);
  }
  return num;
};

function dateWithTimeZone(date: Date, timeZone: string): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const get = (type: string) => parts.find((p) => p.type === type)?.value;

  // Rebuild as UTC to preserve the exact instant
  return new Date(
    Date.UTC(
      Number(get("year")),
      Number(get("month")) - 1,
      Number(get("day")),
      Number(get("hour")),
      Number(get("minute")),
      Number(get("second")),
    ),
  );
}

const toDate = (value: unknown, field: string) => {
  const date = dateWithTimeZone(new Date(value as string), "Asia/Kolkata")
    .toISOString()
    .split("T")[0];
  if (!date) {
    throw new Error(`${field} must be a valid date`);
  }
  return new Date(date);
};

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      faceValue,
      cleanPrice,
      annualCouponRate,
      couponFrequency: couponFrequencyInput,
      dayCount: dayCountInput,
      issueDate,
      settlementDate,
      maturityDate,
      lastCouponDate,
    } = body ?? {};

    // Basic presence check
    if (
      [
        faceValue,
        cleanPrice,
        annualCouponRate,
        couponFrequencyInput,
        dayCountInput,
        issueDate,
        settlementDate,
        maturityDate,
        lastCouponDate,
      ].some((item) => item === undefined)
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const paymentsPerYear =
      couponFrequency[(couponFrequencyInput as CouponFrequency) ?? ""];
    const YEARFRAC_Basis = dayCount[(dayCountInput as DayCount) ?? ""];

    if (!paymentsPerYear || YEARFRAC_Basis === undefined) {
      return NextResponse.json(
        { error: "Invalid coupon frequency or day count basis" },
        { status: 400 },
      );
    }

    const payload = {
      faceValue: toNumber(faceValue, "faceValue"),
      cleanPrice: toNumber(cleanPrice, "cleanPrice"),
      annualCouponRate: toNumber(annualCouponRate, "annualCouponRate"),
      couponFrequency: couponFrequencyInput as CouponFrequency,
      dayCount: dayCountInput as DayCount,
      issueDate: toDate(issueDate, "issueDate"),
      settlementDate: toDate(settlementDate, "settlementDate"),
      maturityDate: toDate(maturityDate, "maturityDate"),
      lastCouponDate: toDate(lastCouponDate, "lastCouponDate"),
    };

    const result = calculateYtm(payload);

    return NextResponse.json({
      result: result.result,
      check: result.check,
      derived: {
        ...result.drived,
        nextCouponDate: result.drived.nextCouponDate.toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
