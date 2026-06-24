/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@core/database/database";
import type { AbsoluteDataBondItem } from "@modules/absolutedata/absolutedata.types";

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

/**
 * Frontend sends dates as exact `YYYY-MM-DD` strings — no parsing, no shifting.
 * We just turn that into a Date so Prisma accepts it.
 */
function ymdToDate(value: unknown): Date | null {
  if (value == null) return null;
  if (isDate(value)) return value;
  const s = String(value).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  return new Date(`${s}T00:00:00.000Z`);
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

    const issueDate = ymdToDate((ad as any)["IssueDate"]);
    const maturityDate = ymdToDate((ad as any)["MaturityDate"]);
    const previousCouponDate = ymdToDate((ad as any)["Previous Coupon Date"]);
    const lastCouponDate = ymdToDate((ad as any)["Last Coupon Date"]);
    const nextCouponDate = ymdToDate((ad as any)["Next Coupon Date"]);

    const record = {
      isin,
      issuerName: toNullableString((ad as any)["IssuerName"]),
      issueDate,
      issueDateIst: issueDate,
      maturityDate,
      maturityDateIst: maturityDate,
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
      previousCouponDate,
      previousCouponDateIst: previousCouponDate,
      lastCouponDate,
      lastCouponDateIst: lastCouponDate,
      nextCouponDate,
      nextCouponDateIst: nextCouponDate,
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
      .map((r) => {
        const recordDate = ymdToDate((r as any)["Record Date"]);
        const dueDate = ymdToDate((r as any)["Due Date"]);
        return {
          isin,
          interestPaymentDates: toNullableString((r as any)["Interest Payment Dates"]),
          recordDays: toFloat((r as any)["Record Days"]),
          recordDate,
          recordDateIst: recordDate,
          dueDate,
          dueDateIst: dueDate,
          raw: sanitizeJsonValue(r),
          updatedAt: now,
        };
      });

    const redemptionRows = (payload.redemptionScheduleRows ?? [])
      .filter(Boolean)
      .map((r) => {
        const startDate = ymdToDate((r as any)["StartDate"]);
        const endDate = ymdToDate((r as any)["EndDate"]);
        return {
          isin,
          redemptionType: toNullableString((r as any)["RedemptionType"]),
          startDate,
          startDateIst: startDate,
          endDate,
          endDateIst: endDate,
          price: toFloat((r as any)["Price"]),
          amount: toFloat((r as any)["Amount"]),
          optionType: toNullableString((r as any)["Option Type"]),
          optionFrequency: toNullableString((r as any)["Option Frequency"]),
          raw: sanitizeJsonValue(r),
          updatedAt: now,
        };
      });

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

  async upsertSchedulesFromAdItem(
    isin: string,
    adItem: AbsoluteDataBondItem,
  ): Promise<{ isin: string; couponRowsInserted: number; redemptionRowsInserted: number }> {
    const now = new Date();

    const couponRows = (adItem.coupon.payment_schedule ?? []).map((row) => {
      const dueDate = ymdToDate(row.payment_date);
      const recordDate = ymdToDate(row.record_date);
      return {
        isin,
        interestPaymentDates: toNullableString(row.payment_date),
        recordDays: toFloat(row.record_days),
        recordDate,
        recordDateIst: recordDate,
        dueDate,
        dueDateIst: dueDate,
        raw: sanitizeJsonValue(row) as object,
        updatedAt: now,
      };
    });

    const redemptionRows = (adItem.redemption_features.schedule ?? []).map((row) => {
      const startDate = ymdToDate(row.start_date);
      const endDate = ymdToDate(row.end_date);
      return {
        isin,
        redemptionType: toNullableString(row.type),
        startDate,
        startDateIst: startDate,
        endDate,
        endDateIst: endDate,
        price: toFloat(row.price),
        amount: toFloat(row.amount),
        optionType: toNullableString(row.option_type),
        optionFrequency: toNullableString(row.option_frequency),
        raw: sanitizeJsonValue(row) as object,
        updatedAt: now,
      };
    });

    await db.dataBase.$transaction(async (tx) => {
      await tx.bondReferenceCouponPaymentDate.deleteMany({ where: { isin } });
      await tx.bondReferenceRedemptionSchedule.deleteMany({ where: { isin } });

      if (couponRows.length) {
        await tx.bondReferenceCouponPaymentDate.createMany({ data: couponRows });
      }
      if (redemptionRows.length) {
        await tx.bondReferenceRedemptionSchedule.createMany({ data: redemptionRows });
      }
    });

    return { isin, couponRowsInserted: couponRows.length, redemptionRowsInserted: redemptionRows.length };
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
