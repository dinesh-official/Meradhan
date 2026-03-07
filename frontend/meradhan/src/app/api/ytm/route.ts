import { NextResponse } from "next/server";
import { XIRR } from "@formulajs/formulajs";
import {
  approximateYtm,
  calculateYtm,
  couponFrequency,
  dayCount,
  generateCashFlow,
  type YtmInput,
} from "./ytm";

const toNumber = (value: unknown, field: string) => {
  const num = Number(value);
  if (!Number.isFinite(num)) {
    throw new Error(`${field} must be a valid number`);
  }
  return num;
};

const parseDdMmYyyy = (value: string): Date | null => {
  const parts = value.split("-").map((p) => p.trim());
  if (parts.length !== 3) return null;
  const [ddRaw, mmRaw, yyyyRaw] = parts;
  const dd = Number(ddRaw);
  const mm = Number(mmRaw);
  const yyyy = Number(yyyyRaw);
  if (!dd || !mm || !yyyy) return null;
  const parsed = new Date(Date.UTC(yyyy, mm - 1, dd));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const parseIsoYyyyMmDd = (value: string): Date | null => {
  const parts = value.split("-").map((p) => p.trim());
  if (parts.length !== 3) return null;
  const [yyyyRaw, mmRaw, ddRaw] = parts;
  const yyyy = Number(yyyyRaw);
  const mm = Number(mmRaw);
  const dd = Number(ddRaw);
  if (!dd || !mm || !yyyy) return null;
  const parsed = new Date(Date.UTC(yyyy, mm - 1, dd));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const toDate = (value: unknown, field: string) => {
  if (typeof value !== "string") {
    throw new Error(`${field} must be a valid date`);
  }

  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`${field} must be a valid date`);
  }

  const ddMm = parseDdMmYyyy(trimmed);
  if (ddMm) return ddMm;

  const yyyyMm = parseIsoYyyyMmDd(trimmed);
  if (yyyyMm) return yyyyMm;

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`${field} must be a valid date`);
  }

  return new Date(
    Date.UTC(
      parsed.getUTCFullYear(),
      parsed.getUTCMonth(),
      parsed.getUTCDate()
    )
  );
};

const formatDateInput = (d: Date): string => {
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = d.getUTCFullYear();
  return `${dd}-${mm}-${yyyy}`;
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

    if (!Object.hasOwn(couponFrequency, couponFrequencyInput)) {
      return NextResponse.json(
        { error: "Invalid coupon frequency" },
        { status: 400 },
      );
    }

    if (!Object.hasOwn(dayCount, dayCountInput)) {
      return NextResponse.json(
        { error: "Invalid day count basis" },
        { status: 400 },
      );
    }

    const payload: YtmInput = {
      faceValue: toNumber(faceValue, "faceValue"),
      cleanPrice: toNumber(cleanPrice, "cleanPrice"),
      annualCouponRate: toNumber(annualCouponRate, "annualCouponRate") / 100,
      couponFrequency: couponFrequencyInput as keyof typeof couponFrequency,
      dayCount: dayCountInput as keyof typeof dayCount,
      issueDate: toDate(issueDate, "issueDate"),
      settlementDate: toDate(settlementDate, "settlementDate"),
      maturityDate: toDate(maturityDate, "maturityDate"),
      lastCouponDate: toDate(lastCouponDate, "lastCouponDate"),
    };

    const ytm = calculateYtm(payload);
    const cashFlow = generateCashFlow(ytm, payload);
    const approximateYtmValue = approximateYtm(payload, ytm);
    const xirrRaw = XIRR(
      cashFlow.map((row) => row.totalCashflow),
      cashFlow.map((row) => row.date),
    );


    const xirrPct =
      xirrRaw instanceof Error ? "ERROR" : (xirrRaw * 100).toFixed(4);

    return NextResponse.json({
      check: ytm.check,
      approximateYtm: approximateYtmValue.toFixed(4),
      ytm: typeof ytm.result === "number" ? ytm.result.toFixed(4) : ytm.result,
      xirr: xirrPct,
      cashflow: cashFlow.map((row, idx) => ({
        period: idx,
        date: formatDateInput(row.date),
        coupon: row.coupon.toFixed(2),
        principal: row.principal.toFixed(2),
        totalCashflow: row.totalCashflow.toFixed(2),
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
