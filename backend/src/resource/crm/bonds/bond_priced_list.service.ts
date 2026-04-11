/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@core/database/database";
import * as xlsx from "xlsx";
import moment from "moment";

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
      timestamp,
      isin,
      issuerName,
      couponRate: toFloat(row["COUPON"]),
      maturityDate,
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
      where: { isin },
      create: record,
      update: record,
    });

    return { isin };
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
          timestamp,
          isin,
          issuerName,
          couponRate: toFloat(row["COUPON"]),
          maturityDate,
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
      .filter(Boolean) as any[];

    if (data.length === 0) {
      return { inserted: 0 };
    }

    // ISIN is unique. If the ISIN already exists, update it.
    // Chunking keeps DB load reasonable for large files.
    const chunkSize = 250;
    const concurrency = 8;
    let processed = 0;

    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      const inFlight: Promise<unknown>[] = [];

      for (const row of chunk) {
        inFlight.push(
          db.dataBase.bondPricedListConsolidated.upsert({
            where: { isin: row.isin },
            create: row,
            update: {
              provider: row.provider,
              dateRaw: row.dateRaw,
              timeRaw: row.timeRaw,
              timestamp: row.timestamp,
              issuerName: row.issuerName,
              couponRate: row.couponRate,
              maturityDate: row.maturityDate,
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
          })
        );

        if (inFlight.length >= concurrency) {
          await Promise.all(inFlight);
          inFlight.length = 0;
        }
      }

      if (inFlight.length > 0) {
        await Promise.all(inFlight);
      }
      processed += chunk.length;
    }

    return { inserted: processed };
  }

  async listConsolidated(params: {
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
      db.dataBase.bondPricedListConsolidated.count({ where }),
      db.dataBase.bondPricedListConsolidated.findMany({
        where,
        orderBy: [{ timestamp: "desc" }, { id: "desc" }],
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

