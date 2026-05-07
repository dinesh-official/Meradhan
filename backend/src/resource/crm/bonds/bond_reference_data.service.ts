/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@core/database/database";
import moment from "moment";

function isDate(value: unknown): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

function toFloat(value: unknown): number | null {
  if (value == null) return null;
  const s = String(value).trim();
  if (!s) return null;
  const cleaned = s.replace(/,/g, "").replace(/%/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function toBoolean(value: unknown): boolean | null {
  if (value == null) return null;
  const s = String(value).trim().toLowerCase();
  if (!s) return null;
  if (["y", "yes", "true", "1"].includes(s)) return true;
  if (["n", "no", "false", "0"].includes(s)) return false;
  return null;
}

function toNullableString(value: unknown): string | null {
  if (value == null) return null;
  if (isDate(value)) return value.toISOString();
  const s = String(value).trim();
  return s ? s : null;
}

function parseDate(value: unknown, formats: string[]): Date | null {
  if (value == null) return null;
  if (isDate(value)) return value;
  const s = String(value).trim();
  if (!s) return null;
  const m = moment(s, formats, true);
  return m.isValid() ? m.toDate() : null;
}

/**
 * Parses a date value (string or Date) and stores it as UTC midnight of the
 * intended calendar date — no day-shifting, no timezone gymnastics.
 *
 * This round-trips cleanly:
 *  - DB tool shows the same date you put in
 *  - getUTCDate() / getUTCMonth() read the same date
 *  - IST formatting (5:30 AM IST) stays on the same calendar day
 */
function parseDateToIstDateOnlyUtcMidnight(
  value: unknown,
  formats: string[]
): Date | null {
  if (value == null) return null;

  const s = isDate(value) ? value.toISOString() : String(value).trim();
  if (!s) return null;

  const m = moment(s, formats, true);
  if (!m.isValid()) return null;

  // Store the calendar date as UTC midnight. No +1/+2 day shifts.
  const ymd = m.format("YYYY-MM-DD");
  return new Date(`${ymd}T00:00:00.000Z`);
}

/**
 * Parses an API ISO 8601 UTC timestamp and returns the IST calendar date
 * stored as UTC midnight (no day-shifting).
 */
function parseApiUtcTimestampToIstNextDayMidnight(value: unknown): Date | null {
  if (value == null) return null;
  const s = isDate(value) ? value.toISOString() : String(value).trim();
  if (!s) return null;

  const m = moment(s, moment.ISO_8601, true);
  if (!m.isValid()) return null;

  // Convert to IST calendar date, then store as UTC midnight of that date.
  const ymd = m.utcOffset(330).format("YYYY-MM-DD");
  return new Date(`${ymd}T00:00:00.000Z`);
}

function sanitizeJsonValue(value: unknown): any {
  if (value == null) return value;
  if (isDate(value)) return value.toISOString();
  if (Array.isArray(value)) return value.map(sanitizeJsonValue);
  if (typeof value === "object") {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = sanitizeJsonValue(v);
    }
    return out;
  }
  return value;
}

type UpsertIsinPayload = {
  adRow: Record<string, unknown>;
  couponPaymentRows?: Record<string, unknown>[];
  redemptionScheduleRows?: Record<string, unknown>[];
};

export class BondReferenceDataService {
  async upsertReferenceByIsin(payload: UpsertIsinPayload) {
    const ad = payload.adRow ?? {};
    const isin = String((ad as any)["ISIN"] ?? "").trim();
    if (!isin) throw new Error("Missing ISIN in AD row");

    const now = new Date();

    const record = {
      isin,
      issuerName: toNullableString((ad as any)["IssuerName"]),
      issueDate: parseDate((ad as any)["IssueDate"], [
        "YYYY-MM-DDTHH:mm:ss.SSSZ",
        "DD-MMM-YYYY",
        "DD/MMM/YYYY",
        "DD-MM-YYYY",
        "YYYY-MM-DD",
      ]),
      issueDateIst: parseDateToIstDateOnlyUtcMidnight((ad as any)["IssueDate"], [
        "YYYY-MM-DDTHH:mm:ss.SSSZ",
        "DD-MMM-YYYY",
        "DD/MMM/YYYY",
        "DD-MM-YYYY",
        "YYYY-MM-DD",
      ]),
      maturityDate: parseDate((ad as any)["MaturityDate"], [
        "YYYY-MM-DDTHH:mm:ss.SSSZ",
        "DD-MMM-YYYY",
        "DD/MMM/YYYY",
        "DD-MM-YYYY",
        "YYYY-MM-DD",
      ]),
      maturityDateIst: parseDateToIstDateOnlyUtcMidnight((ad as any)["MaturityDate"], [
        "YYYY-MM-DDTHH:mm:ss.SSSZ",
        "DD-MMM-YYYY",
        "DD/MMM/YYYY",
        "DD-MM-YYYY",
        "YYYY-MM-DD",
      ]),
      isPerpetual: toBoolean((ad as any)["Is Perpetual"]),
      issueCurrency: toNullableString((ad as any)["IssueCurrency"]),
      originalAmountIssued: toNullableString((ad as any)["OriginalAmountIssued"]),
      couponType: toNullableString((ad as any)["CouponType"]),
      bondType: toNullableString((ad as any)["BondType"]),
      couponRate: toFloat((ad as any)["CouponRate"]),
      interestPaymentFrequency: toNullableString(
        (ad as any)["Interest Payment Frequency"]
      ),
      seniority: toNullableString((ad as any)["Seniority"]),
      natureOfInstrument: toNullableString((ad as any)["Nature of Instrument"]),
      callableFlag: toNullableString((ad as any)["CallableFlag"]),
      puttableFlag: toNullableString((ad as any)["PuttableFlag"]),
      dayConvention: toNullableString((ad as any)["Day Convention"]),
      previousCouponDate: parseDate((ad as any)["Previous Coupon Date"], [
        "YYYY-MM-DDTHH:mm:ss.SSSZ",
        "DD-MMM-YYYY",
        "DD-MM-YYYY",
        "YYYY-MM-DD",
      ]),
      previousCouponDateIst: parseDateToIstDateOnlyUtcMidnight(
        (ad as any)["Previous Coupon Date"],
        ["YYYY-MM-DDTHH:mm:ss.SSSZ", "DD-MMM-YYYY", "DD-MM-YYYY", "YYYY-MM-DD"]
      ),
      lastCouponDate: parseDate((ad as any)["Last Coupon Date"], [
        "YYYY-MM-DDTHH:mm:ss.SSSZ",
        "DD-MMM-YYYY",
        "DD-MM-YYYY",
        "YYYY-MM-DD",
      ]),
      lastCouponDateIst: parseDateToIstDateOnlyUtcMidnight(
        (ad as any)["Last Coupon Date"],
        ["YYYY-MM-DDTHH:mm:ss.SSSZ", "DD-MMM-YYYY", "DD-MM-YYYY", "YYYY-MM-DD"]
      ),
      nextCouponDate: parseDate((ad as any)["Next Coupon Date"], [
        "YYYY-MM-DDTHH:mm:ss.SSSZ",
        "DD-MMM-YYYY",
        "DD-MM-YYYY",
        "YYYY-MM-DD",
      ]),
      nextCouponDateIst: parseDateToIstDateOnlyUtcMidnight(
        (ad as any)["Next Coupon Date"],
        ["YYYY-MM-DDTHH:mm:ss.SSSZ", "DD-MMM-YYYY", "DD-MM-YYYY", "YYYY-MM-DD"]
      ),
      isListed: toBoolean((ad as any)["Is Listed"]),
      exchangeName: toNullableString((ad as any)["Exchange Name"]),
      exchangeCode: toNullableString((ad as any)["Exchange Code"]),
      bloombergFigi: toNullableString((ad as any)["Bloomberg FIGI"]),
      bloombergTicker: toNullableString((ad as any)["Bloomberg Ticker"]),
      bloombergSecurityType: toNullableString((ad as any)["Bloomberg Security Type"]),
      marketSector: toNullableString((ad as any)["Market Sector"]),
      faceValue: toFloat((ad as any)["FaceValue"]),
      issuePrice: toFloat((ad as any)["IssuePrice"]),
      bondCategory: toNullableString((ad as any)["Bond Category"]),
      taxable: toNullableString((ad as any)["Taxable"]),
      modeOfIssuance: toNullableString((ad as any)["Mode of issuance"]),
      yield: toFloat((ad as any)["Yield"]),
      lastTradedYield: toFloat((ad as any)["Last Traded Yield"]),
      lastTradedPrice: toFloat((ad as any)["Last Traded Price"]),
      raw: sanitizeJsonValue(ad),
      updatedAt: now,
    };

    const couponRows = (payload.couponPaymentRows ?? [])
      .filter(Boolean)
      .map((r) => ({
        isin,
        interestPaymentDates: toNullableString((r as any)["Interest Payment Dates"]),
        recordDays: toFloat((r as any)["Record Days"]),
        recordDate: parseDate((r as any)["Record Date"], [
          "YYYY-MM-DDTHH:mm:ss.SSSZ",
          "DD-MMM-YYYY",
          "DD-MM-YYYY",
          "YYYY-MM-DD",
        ]),
        recordDateIst: parseDateToIstDateOnlyUtcMidnight((r as any)["Record Date"], [
          "YYYY-MM-DDTHH:mm:ss.SSSZ",
          "DD-MMM-YYYY",
          "DD-MM-YYYY",
          "YYYY-MM-DD",
        ]),
        dueDate: parseDate((r as any)["Due Date"], [
          "YYYY-MM-DDTHH:mm:ss.SSSZ",
          "DD-MMM-YYYY",
          "DD-MM-YYYY",
          "YYYY-MM-DD",
        ]),
        dueDateIst: parseDateToIstDateOnlyUtcMidnight((r as any)["Due Date"], [
          "YYYY-MM-DDTHH:mm:ss.SSSZ",
          "DD-MMM-YYYY",
          "DD-MM-YYYY",
          "YYYY-MM-DD",
        ]),
        raw: sanitizeJsonValue(r),
        updatedAt: now,
      }));

    const redemptionRows = (payload.redemptionScheduleRows ?? [])
      .filter(Boolean)
      .map((r) => ({
        isin,
        redemptionType: toNullableString((r as any)["RedemptionType"]),
        startDate: parseDate((r as any)["StartDate"], [
          "YYYY-MM-DDTHH:mm:ss.SSSZ",
          "DD-MMM-YYYY",
          "DD-MM-YYYY",
          "YYYY-MM-DD",
        ]),
        startDateIst: parseDateToIstDateOnlyUtcMidnight((r as any)["StartDate"], [
          "YYYY-MM-DDTHH:mm:ss.SSSZ",
          "DD-MMM-YYYY",
          "DD-MM-YYYY",
          "YYYY-MM-DD",
        ]),
        endDate: parseDate((r as any)["EndDate"], [
          "YYYY-MM-DDTHH:mm:ss.SSSZ",
          "DD-MMM-YYYY",
          "DD-MM-YYYY",
          "YYYY-MM-DD",
        ]),
        endDateIst: parseDateToIstDateOnlyUtcMidnight((r as any)["EndDate"], [
          "YYYY-MM-DDTHH:mm:ss.SSSZ",
          "DD-MMM-YYYY",
          "DD-MM-YYYY",
          "YYYY-MM-DD",
        ]),
        price: toFloat((r as any)["Price"]),
        amount: toFloat((r as any)["Amount"]),
        optionType: toNullableString((r as any)["Option Type"]),
        optionFrequency: toNullableString((r as any)["Option Frequency"]),
        raw: sanitizeJsonValue(r),
        updatedAt: now,
      }));

    await db.dataBase.$transaction(async (tx) => {
      await tx.bondReferenceMetadata.upsert({
        where: { isin },
        create: record,
        update: record,
      });

      // Replace schedules for this ISIN so repeated uploads don't duplicate rows.
      await tx.bondReferenceCouponPaymentDate.deleteMany({ where: { isin } });
      await tx.bondReferenceRedemptionSchedule.deleteMany({ where: { isin } });

      if (couponRows.length) {
        await tx.bondReferenceCouponPaymentDate.createMany({
          data: couponRows,
        });
      }
      if (redemptionRows.length) {
        await tx.bondReferenceRedemptionSchedule.createMany({
          data: redemptionRows,
        });
      }
    });

    return {
      isin,
      couponRowsInserted: couponRows.length,
      redemptionRowsInserted: redemptionRows.length,
    };
  }

  async listReferenceMetadata(params: {
    search?: string;
    page: number;
    limit: number;
  }) {
    const page = Math.max(1, params.page);
    const limit = Math.min(200, Math.max(1, params.limit));
    const skip = (page - 1) * limit;
    const search = params.search?.trim();

    const where =
      search && search.length > 0
        ? {
          OR: [
            { isin: { contains: search, mode: "insensitive" as const } },
            {
              issuerName: { contains: search, mode: "insensitive" as const },
            },
          ],
        }
        : {};

    const [total, items] = await Promise.all([
      db.dataBase.bondReferenceMetadata.count({ where }),
      db.dataBase.bondReferenceMetadata.findMany({
        where,
        orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
        skip,
        take: limit,
        select: {
          id: true,
          isin: true,
          issuerName: true,
          issueDate: true,
          maturityDate: true,
          couponRate: true,
          yield: true,
          isListed: true,
          issueCurrency: true,
          faceValue: true,
          updatedAt: true,
          createdAt: true,
        },
      }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return {
      data: items,
      meta: { page, limit, total, totalPages },
    };
  }

  async getSchedulesByIsin(isin: string) {
    const normalized = String(isin || "").trim();
    if (!normalized) throw new Error("Missing ISIN");

    const [coupon, redemption] = await Promise.all([
      db.dataBase.bondReferenceCouponPaymentDate.findMany({
        where: { isin: normalized },
        orderBy: [{ dueDate: "asc" }, { id: "asc" }],
        select: {
          id: true,
          interestPaymentDates: true,
          recordDays: true,
          recordDate: true,
          dueDate: true,
        },
      }),
      db.dataBase.bondReferenceRedemptionSchedule.findMany({
        where: { isin: normalized },
        orderBy: [{ startDate: "asc" }, { id: "asc" }],
        select: {
          id: true,
          redemptionType: true,
          startDate: true,
          endDate: true,
          price: true,
          amount: true,
          optionType: true,
          optionFrequency: true,
        },
      }),
    ]);

    return { isin: normalized, coupon, redemption };
  }
}

