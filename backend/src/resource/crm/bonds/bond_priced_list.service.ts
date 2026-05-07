/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Prisma } from "@databases/generated/prisma/postgres";
import { db } from "@core/database/database";
import * as xlsx from "xlsx";
import moment from "moment";

/** `YYYY-MM-DD` → [start, end) in UTC for `timestamptz` / `timestamp` filters */
function utcDayRangeFromYmd(ymd: string | undefined): { gte: Date; lt: Date } | undefined {
  if (!ymd?.trim()) return undefined;
  const s = ymd.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return undefined;
  const y = Number(s.slice(0, 4));
  const mo = Number(s.slice(5, 7)) - 1;
  const d = Number(s.slice(8, 10));
  if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(d)) return undefined;
  const gte = new Date(Date.UTC(y, mo, d));
  const lt = new Date(Date.UTC(y, mo, d + 1));
  return { gte, lt };
}

function isDate(value: unknown): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

function toFloat(value: unknown): number | null {
  if (value == null) return null;
  const s = String(value).trim();
  if (!s) return null;
  // remove commas and percent signs
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

function toIstDateOnlyUtcMidnight(dt: Date | null) {
  if (!dt) return null;
  const ymd = moment(dt).utcOffset(330).format("YYYY-MM-DD");
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

/**
 * Upsert key `(isin, timestamp)`: use full DATE+TIME when present; otherwise UTC midnight
 * from a parseable DATE-only cell (same calendar day as legacy `quoteDate` behavior).
 */
/** Align with PostgreSQL `TIMESTAMP(3)` (ms precision) for stable `(isin, timestamp)` upserts. */
function normalizeTimestampForDb(d: Date): Date {
  return new Date(Math.trunc(d.getTime()));
}

function consolidatedTimestampFromParts(
  timestamp: Date | null,
  dateRaw: string | null,
): Date | null {
  if (timestamp && !Number.isNaN(timestamp.getTime())) {
    return normalizeTimestampForDb(timestamp);
  }
  if (dateRaw?.trim()) {
    const d = parseDate(dateRaw.trim(), [
      "YYYY-MM-DD",
      "DD-MM-YYYY",
      "DD/MM/YYYY",
      "DD/MM/YY",
      "DD-MMM-YYYY",
    ]);
    if (d && !Number.isNaN(d.getTime())) {
      return normalizeTimestampForDb(
        new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())),
      );
    }
  }
  return null;
}

type ConsolidatedRowPayload = {
  provider: string | null;
  dateRaw: string | null;
  timeRaw: string | null;
  timestamp: Date;
  timestampIst: Date;
  isin: string;
  issuerName: string | null;
  couponRate: number | null;
  maturityDate: Date | null;
  maturityDateIst: Date | null;
  yield: number | null;
  currency: string | null;
  faceValue: number | null;
  quantity: string | null;
  rating: string | null;
  ratingAgency: string | null;
  price: number | null;
  dirtyPrice: number | null;
  cleanPrice: number | null;
  accruedInterest: number | null;
  taxFree: boolean | null;
  isListed: string | null;
  raw: any;
  updatedAt: Date;
};

/** Same ISIN + same instant must appear once; last row wins (avoids P2002 from parallel duplicate creates). */
function dedupeConsolidatedRows(rows: ConsolidatedRowPayload[]): ConsolidatedRowPayload[] {
  const map = new Map<string, ConsolidatedRowPayload>();
  for (const row of rows) {
    const k = `${row.isin}\0${row.timestamp.getTime()}`;
    map.set(k, row);
  }
  return [...map.values()];
}

export class BondPricedListService {
  async upsertConsolidatedRow(row: any) {
    const provider = row["PROVIDER"] || null;
    const dateCell = row["DATE"];
    const timeCell = row["TIMESTAMP"];

    // Store raw as strings (schema expects String?)
    const dateRaw =
      dateCell == null
        ? null
        : isDate(dateCell)
          ? moment(dateCell).format("YYYY-MM-DD")
          : String(dateCell).trim() || null;
    const timeRaw = toNullableString(timeCell);

    const timestamp = (() => {
      if (!dateRaw || !timeRaw) return null;
      return parseDate(`${dateRaw} ${timeRaw}`, [
        "DD-MM-YYYY HH:mm:ss",
        "DD-MM-YYYY HH:mm",
        "YYYY-MM-DD HH:mm:ss",
        "YYYY-MM-DD HH:mm",
        "YYYY-MM-DDTHH:mm:ss.SSSZ",
      ]);
    })();

    const isin = String(row["ISIN"] || "").trim();
    if (!isin) {
      throw new Error("Missing ISIN in row");
    }

    const timestampResolved = consolidatedTimestampFromParts(timestamp, dateRaw);
    if (!timestampResolved) {
      throw new Error(
        "Cannot determine timestamp: need DATE + TIMESTAMP columns, or a parseable DATE cell.",
      );
    }

    const issuerName = row["ISSUER_NAME"] || null;

    const maturityDate = parseDate(row["MATURITY"], [
      "DD-MMM-YYYY",
      "DD-MMM-YY",
      "DD/MMM/YYYY",
      "DD/MMM/YY",
      "YYYY-MM-DD",
    ]);

    const record = {
      provider,
      dateRaw,
      timeRaw,
      timestamp: timestampResolved,
      timestampIst: toIstDateOnlyUtcMidnight(timestampResolved)!,
      isin,
      issuerName,
      couponRate: toFloat(row["COUPON"]),
      maturityDate,
      maturityDateIst: toIstDateOnlyUtcMidnight(maturityDate),
      yield: toFloat(row["YIELD"]),
      currency: row["CURRENCY"] || null,
      faceValue: toFloat(row["FACE_VALUE"]),
      quantity: row["QUANTITY"] ? String(row["QUANTITY"]) : null,
      rating: row["RATING"] || null,
      ratingAgency: row["RATING_AGENCY"] || null,
      price: toFloat(row["PRICE"]),
      dirtyPrice: toFloat(row["DIRTY_PRICE"]),
      cleanPrice: toFloat(row["CLEAN_PRICE"]),
      accruedInterest: toFloat(row["ACCRUED_INTEREST"]),
      taxFree: toBoolean(row["TAX_FREE"]),
      isListed: row["IS_LISTED"] || null,
      raw: sanitizeJsonValue(row),
      updatedAt: new Date(),
    };

    await db.dataBase.bondPricedListConsolidated.upsert({
      where: {
        bond_priced_list_consolidated_isin_timestamp_key: {
          isin,
          timestamp: timestampResolved,
        },
      },
      create: record,
      update: {
        provider: record.provider,
        dateRaw: record.dateRaw,
        timeRaw: record.timeRaw,
        timestamp: record.timestamp,
        timestampIst: record.timestampIst,
        issuerName: record.issuerName,
        couponRate: record.couponRate,
        maturityDate: record.maturityDate,
        maturityDateIst: record.maturityDateIst,
        yield: record.yield,
        currency: record.currency,
        faceValue: record.faceValue,
        quantity: record.quantity,
        rating: record.rating,
        ratingAgency: record.ratingAgency,
        price: record.price,
        dirtyPrice: record.dirtyPrice,
        cleanPrice: record.cleanPrice,
        accruedInterest: record.accruedInterest,
        taxFree: record.taxFree,
        isListed: record.isListed,
        raw: record.raw,
        updatedAt: record.updatedAt,
      },
    });

    return { isin, timestamp: timestampResolved };
  }

  async bulkUploadConsolidatedCsv(filePath: string) {
    const wb = xlsx.readFile(filePath, { raw: false, cellDates: true });
    const sheetName = wb.SheetNames[0];
    if (!sheetName) throw new Error("CSV has no sheet");
    const ws = wb.Sheets[sheetName]!;
    const rows = xlsx.utils.sheet_to_json(ws, {
      defval: "",
    }) as any[];

    const data = rows
      .map((row) => {
        const provider = row["PROVIDER"] || null;
        const dateCell = row["DATE"];
        const timeCell = row["TIMESTAMP"];

        // Store raw as strings (schema expects String?)
        const dateRaw =
          dateCell == null
            ? null
            : isDate(dateCell)
              ? moment(dateCell).format("YYYY-MM-DD")
              : String(dateCell).trim() || null;
        const timeRaw = toNullableString(timeCell);

        const timestamp = (() => {
          if (!dateRaw || !timeRaw) return null;
          // Accept both the original DD-MM-YYYY and normalized YYYY-MM-DD
          return parseDate(`${dateRaw} ${timeRaw}`, [
            "DD-MM-YYYY HH:mm:ss",
            "DD-MM-YYYY HH:mm",
            "YYYY-MM-DD HH:mm:ss",
            "YYYY-MM-DD HH:mm",
            "YYYY-MM-DDTHH:mm:ss.SSSZ",
          ]);
        })();

        const isin = String(row["ISIN"] || "").trim();
        if (!isin) return null;

        const timestampResolved = consolidatedTimestampFromParts(timestamp, dateRaw);
        if (!timestampResolved) return null;

        const issuerName = row["ISSUER_NAME"] || null;

        const maturityDate = parseDate(row["MATURITY"], [
          "DD-MMM-YYYY",
          "DD-MMM-YY",
          "DD/MMM/YYYY",
          "DD/MMM/YY",
          "YYYY-MM-DD",
        ]);

        return {
          provider,
          dateRaw,
          timeRaw,
          timestamp: timestampResolved,
          timestampIst: toIstDateOnlyUtcMidnight(timestampResolved)!,
          isin,
          issuerName,
          couponRate: toFloat(row["COUPON"]),
          maturityDate,
          maturityDateIst: toIstDateOnlyUtcMidnight(maturityDate),
          yield: toFloat(row["YIELD"]),
          currency: row["CURRENCY"] || null,
          faceValue: toFloat(row["FACE_VALUE"]),
          quantity: row["QUANTITY"] ? String(row["QUANTITY"]) : null,
          rating: row["RATING"] || null,
          ratingAgency: row["RATING_AGENCY"] || null,
          price: toFloat(row["PRICE"]),
          dirtyPrice: toFloat(row["DIRTY_PRICE"]),
          cleanPrice: toFloat(row["CLEAN_PRICE"]),
          accruedInterest: toFloat(row["ACCRUED_INTEREST"]),
          taxFree: toBoolean(row["TAX_FREE"]),
          isListed: row["IS_LISTED"] || null,
          raw: sanitizeJsonValue(row),
          // updatedAt is required by the SQL migration; Prisma will set @updatedAt but for raw SQL deploy ensure value exists
          updatedAt: new Date(),
        };
      })
      .filter(Boolean) as ConsolidatedRowPayload[];

    const deduped = dedupeConsolidatedRows(data);

    if (deduped.length === 0) {
      return { inserted: 0 };
    }

    // Upsert on (isin, timestamp): same ISIN at another instant is a new row.
    // Sequential upserts within a chunk avoid P2002 when duplicate keys were concurrent inserts.
    const chunkSize = 250;
    let processed = 0;

    for (let i = 0; i < deduped.length; i += chunkSize) {
      const chunk = deduped.slice(i, i + chunkSize);
      for (const row of chunk) {
        await db.dataBase.bondPricedListConsolidated.upsert({
          where: {
            bond_priced_list_consolidated_isin_timestamp_key: {
              isin: row.isin,
              timestamp: row.timestamp,
            },
          },
          create: row,
          update: {
            provider: row.provider,
            dateRaw: row.dateRaw,
            timeRaw: row.timeRaw,
            timestamp: row.timestamp,
            timestampIst: row.timestampIst,
            issuerName: row.issuerName,
            couponRate: row.couponRate,
            maturityDate: row.maturityDate,
            maturityDateIst: row.maturityDateIst,
            yield: row.yield,
            currency: row.currency,
            faceValue: row.faceValue,
            quantity: row.quantity,
            rating: row.rating,
            ratingAgency: row.ratingAgency,
            price: row.price,
            dirtyPrice: row.dirtyPrice,
            cleanPrice: row.cleanPrice,
            accruedInterest: row.accruedInterest,
            taxFree: row.taxFree,
            isListed: row.isListed,
            raw: row.raw,
            updatedAt: new Date(),
          },
        });
        processed += 1;
      }
    }

    return { inserted: processed, skippedDuplicateRows: data.length - deduped.length };
  }

  async listConsolidated(params: {
    search?: string;
    page: number;
    limit: number;
    /** `YYYY-MM-DD` — UTC calendar day filter on `timestamp` */
    pricingDate?: string;
    /** Sort by date fields: newest first (`desc`) or oldest first (`asc`) */
    sortOrder?: "asc" | "desc";
  }) {
    const page = Math.max(1, params.page);
    const limit = Math.min(200, Math.max(1, params.limit));
    const skip = (page - 1) * limit;
    const search = params.search?.trim();
    const dayRange = utcDayRangeFromYmd(params.pricingDate);
    const dir: Prisma.SortOrder = params.sortOrder === "asc" ? "asc" : "desc";

    const filters: Prisma.BondPricedListConsolidatedWhereInput[] = [];
    if (dayRange) {
      filters.push({
        timestamp: { gte: dayRange.gte, lt: dayRange.lt },
      });
    }
    if (search && search.length > 0) {
      filters.push({
        OR: [
          { isin: { contains: search, mode: "insensitive" } },
          { issuerName: { contains: search, mode: "insensitive" } },
        ],
      });
    }
    const where: Prisma.BondPricedListConsolidatedWhereInput =
      filters.length > 0 ? { AND: filters } : {};

    const [total, items] = await Promise.all([
      db.dataBase.bondPricedListConsolidated.count({ where }),
      db.dataBase.bondPricedListConsolidated.findMany({
        where,
        orderBy: [{ timestamp: dir }, { id: dir }],
        skip,
        take: limit,
        select: {
          id: true,
          provider: true,
          timestamp: true,
          isin: true,
          issuerName: true,
          couponRate: true,
          maturityDate: true,
          yield: true,
          price: true,
          dirtyPrice: true,
          cleanPrice: true,
          rating: true,
          ratingAgency: true,
          taxFree: true,
          isListed: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return {
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }
}

