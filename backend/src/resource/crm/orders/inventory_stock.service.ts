import type { Prisma } from "@databases/generated/prisma/postgres";
import { db } from "@core/database/database";
import logger from "@utils/logger/logger";
import * as xlsx from "xlsx";
import moment from "moment-timezone";

const TZ = "Asia/Kolkata";
const LINE_CHUNK = 500;

function stripBom(s: string): string {
  return s.replace(/^\uFEFF/, "");
}

function normHeaderKey(key: string): string {
  return stripBom(String(key)).trim().toLowerCase().replace(/\s+/g, "");
}

function toFloat(value: unknown): number | null {
  if (value == null) return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const s = String(value).trim().replace(/,/g, "");
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function findIsinAndQuantityKeys(
  row: Record<string, unknown>,
): { isinKey: string; qtyKey: string } | null {
  const keys = Object.keys(row);
  let isinKey: string | null = null;
  let qtyKey: string | null = null;
  for (const k of keys) {
    const n = normHeaderKey(k);
    if (n === "isin") isinKey = k;
    if (n === "quantity" || n === "qty" || n === "units" || n === "availableqty" || n === "available") {
      qtyKey = k;
    }
  }
  if (isinKey && qtyKey) return { isinKey, qtyKey };
  for (const k of keys) {
    const n = normHeaderKey(k);
    if (!isinKey && n.includes("isin")) isinKey = k;
    if (!qtyKey && (n.includes("quantity") || n === "qty")) qtyKey = k;
  }
  if (isinKey && qtyKey) return { isinKey, qtyKey };
  return null;
}

export function parseInventoryStockRows(buffer: Buffer): {
  rows: { isin: string; quantity: number }[];
  parseWarnings: string[];
} {
  const wb = xlsx.read(buffer, { type: "buffer", raw: false, cellDates: true });
  const sheetName = wb.SheetNames[0];
  if (!sheetName) {
    throw new Error("File has no sheets");
  }
  const ws = wb.Sheets[sheetName]!;
  const jsonRows = xlsx.utils.sheet_to_json<Record<string, unknown>>(ws, {
    defval: "",
    raw: false,
  });
  if (!jsonRows.length) {
    return { rows: [], parseWarnings: ["No data rows found"] };
  }

  const keysResolved = findIsinAndQuantityKeys(jsonRows[0]!);
  if (!keysResolved) {
    throw new Error(
      'Could not detect columns. Expected headers like "ISIN" and "Quantity" (or Qty).',
    );
  }

  const { isinKey, qtyKey } = keysResolved;
  const byIsin = new Map<string, number>();
  const parseWarnings: string[] = [];

  for (let i = 0; i < jsonRows.length; i++) {
    const row = jsonRows[i]!;
    const isinRaw = row[isinKey];
    const qtyRaw = row[qtyKey];
    const isin = String(isinRaw ?? "")
      .trim()
      .toUpperCase();
    if (!isin || isin === "ISIN") continue;
    const qty = toFloat(qtyRaw);
    if (qty == null) {
      parseWarnings.push(`Row ${i + 2}: skipped invalid quantity for ${isin}`);
      continue;
    }
    if (qty < 0) {
      parseWarnings.push(`Row ${i + 2}: skipped negative quantity for ${isin}`);
      continue;
    }
    byIsin.set(isin, qty);
  }

  return {
    rows: [...byIsin.entries()].map(([isin, quantity]) => ({ isin, quantity })),
    parseWarnings,
  };
}

export class CrmInventoryStockService {
  async uploadFromBuffer(params: {
    buffer: Buffer;
    originalFileName: string;
    uploadedByUserId?: number;
    uploadedByEmail?: string;
  }) {
    const { rows, parseWarnings } = parseInventoryStockRows(params.buffer);
    if (rows.length === 0) {
      throw new Error("No valid ISIN / quantity rows to import");
    }

    const dayKey = moment().tz(TZ).format("YYYY-MM-DD");

    const batch = await db.dataBase.$transaction(async (tx) => {
      const b = await tx.crmInventoryStockBatch.create({
        data: {
          dayKey,
          sourceFileName: params.originalFileName || null,
          lineCount: rows.length,
          uploadedByUserId: params.uploadedByUserId ?? null,
          uploadedByEmail: params.uploadedByEmail ?? null,
        },
      });

      for (let i = 0; i < rows.length; i += LINE_CHUNK) {
        const slice = rows.slice(i, i + LINE_CHUNK);
        await tx.crmInventoryStockLine.createMany({
          data: slice.map((r) => ({
            batchId: b.id,
            isin: r.isin,
            quantity: r.quantity,
          })),
        });
      }

      return b;
    });

    return {
      batchId: batch.id,
      dayKey: batch.dayKey,
      uploadedAt: batch.uploadedAt,
      lineCount: rows.length,
      parseWarnings,
    };
  }

  async listDays() {
    const grouped = await db.dataBase.crmInventoryStockBatch.groupBy({
      by: ["dayKey"],
      _count: { _all: true },
      _max: { uploadedAt: true },
      orderBy: { dayKey: "desc" },
    });
    return grouped.map((g) => ({
      dayKey: g.dayKey,
      batchCount: g._count._all,
      lastUploadedAt: g._max.uploadedAt,
    }));
  }

  async listBatchesForDay(dayKey: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dayKey.trim())) {
      throw new Error("dayKey must be YYYY-MM-DD");
    }
    const dk = dayKey.trim();
    return db.dataBase.crmInventoryStockBatch.findMany({
      where: { dayKey: dk },
      orderBy: { uploadedAt: "desc" },
      select: {
        id: true,
        dayKey: true,
        uploadedAt: true,
        sourceFileName: true,
        lineCount: true,
        uploadedByEmail: true,
      },
    });
  }

  async getLatestBatchSummary() {
    const batch = await db.dataBase.crmInventoryStockBatch.findFirst({
      orderBy: { uploadedAt: "desc" },
      select: {
        id: true,
        dayKey: true,
        uploadedAt: true,
        sourceFileName: true,
        lineCount: true,
        uploadedByEmail: true,
      },
    });
    return batch;
  }

  async getBatchLines(params: {
    batchId: number;
    page: number;
    limit: number;
    search?: string;
  }) {
    const page = Math.max(1, params.page);
    const limit = Math.min(200, Math.max(1, params.limit));
    const skip = (page - 1) * limit;
    const search = params.search?.trim();

    const where: Prisma.CrmInventoryStockLineWhereInput = {
      batchId: params.batchId,
      ...(search
        ? {
            isin: { contains: search, mode: "insensitive" as const },
          }
        : {}),
    };

    const [total, lines] = await Promise.all([
      db.dataBase.crmInventoryStockLine.count({ where }),
      db.dataBase.crmInventoryStockLine.findMany({
        where,
        orderBy: { isin: "asc" },
        skip,
        take: limit,
        select: { id: true, isin: true, quantity: true },
      }),
    ]);

    return {
      data: lines,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  /**
   * Manual stock adjustment for a single line in a batch snapshot.
   * Send either `quantity` (absolute) or `delta` (relative), not both.
   */
  async updateLineQuantity(params: {
    lineId: number;
    quantity?: number;
    delta?: number;
  }) {
    const hasQ = params.quantity !== undefined;
    const hasD = params.delta !== undefined;
    if (hasQ === hasD) {
      throw new Error("Provide exactly one of: quantity (absolute) or delta (relative)");
    }

    const line = await db.dataBase.crmInventoryStockLine.findUnique({
      where: { id: params.lineId },
      select: { id: true, quantity: true, isin: true, batchId: true },
    });
    if (!line) {
      throw new Error("Stock line not found");
    }

    let next: number;
    if (hasD) {
      const d = params.delta!;
      if (!Number.isFinite(d)) throw new Error("Invalid delta");
      next = line.quantity + d;
    } else {
      const q = params.quantity!;
      if (!Number.isFinite(q)) throw new Error("Invalid quantity");
      next = q;
    }

    if (next < 0) {
      throw new Error("Quantity cannot be negative");
    }

    // Normalise float noise for common bond lot sizes
    next = Math.round(next * 1_000_000) / 1_000_000;

    const updated = await db.dataBase.crmInventoryStockLine.update({
      where: { id: line.id },
      data: { quantity: next },
      select: { id: true, isin: true, quantity: true, batchId: true },
    });

    return updated;
  }

  async deleteBatch(batchId: number) {
    const found = await db.dataBase.crmInventoryStockBatch.findUnique({
      where: { id: batchId },
      select: { id: true },
    });
    if (!found) {
      throw new Error("Batch not found");
    }
    await db.dataBase.crmInventoryStockBatch.delete({
      where: { id: batchId },
    });
    return { deletedId: batchId };
  }

  /**
   * After payment capture: subtract sold units from the latest CRM inventory batch line
   * for this ISIN (same snapshot as `getLatestCrmInventoryWholeUnitsForIsin`).
   */
  async applyPaidOrderInventoryDecrement(
    tx: Prisma.TransactionClient,
    params: { isin: string; quantity: number },
  ): Promise<void> {
    const isin = String(params.isin ?? "")
      .trim()
      .toUpperCase();
    const sold = Math.floor(Number(params.quantity));
    if (!isin || !Number.isFinite(sold) || sold < 1) {
      return;
    }

    const batch = await tx.crmInventoryStockBatch.findFirst({
      orderBy: { uploadedAt: "desc" },
      select: { id: true },
    });
    if (!batch) {
      logger.logInfo("CRM inventory decrement skipped: no batch", { isin, sold });
      return;
    }

    const atomic = await tx.crmInventoryStockLine.updateMany({
      where: {
        batchId: batch.id,
        isin,
        quantity: { gte: sold },
      },
      data: {
        quantity: { decrement: sold },
      },
    });

    if (atomic.count > 0) {
      return;
    }

    const line = await tx.crmInventoryStockLine.findFirst({
      where: { batchId: batch.id, isin },
      select: { id: true, quantity: true },
    });
    if (!line) {
      logger.logInfo("CRM inventory decrement skipped: no line for ISIN on latest batch", {
        isin,
        sold,
        batchId: batch.id,
      });
      return;
    }

    const had = Number(line.quantity);
    if (had <= 0) {
      return;
    }

    logger.logError("CRM inventory undershot at payment capture; zeroing line", {
      isin,
      sold,
      had,
      batchId: batch.id,
      lineId: line.id,
    });
    await tx.crmInventoryStockLine.update({
      where: { id: line.id },
      data: { quantity: 0 },
    });
  }
}
