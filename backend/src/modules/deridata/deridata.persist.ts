import { db, type DataBaseSchema } from "@core/database/database";
import { mapIssueDetailToRow } from "./deridata.issue-detail.mapper";
import {
  mapCalculator, mapEbp, mapSecondaryTrades, mapSecurityCovenant, mapDocuments,
} from "./deridata.mappers";
import type {
  IssueDetail, CalculatorResponse, EbpResponse, SecondaryTradesResponse,
  SecurityCovenant, DocumentsResponse,
} from "./deridata.api";

const prisma = db.dataBase;

/** Upsert the Issue Detail row for an ISIN (idempotent). */
export async function persistIssueDetail(data: IssueDetail): Promise<void> {
  const row = mapIssueDetailToRow(data);
  const { isin: _omit, ...update } = row;
  await prisma.deridataIssueDetail.upsert({ where: { isin: row.isin }, create: row, update });
}

/** Replace the Calculator snapshot (+ cashflows) for an ISIN. */
export async function persistCalculator(
  isin: string,
  data: CalculatorResponse,
  valueDate: string,
): Promise<void> {
  const { row, cashflows } = mapCalculator(
    isin,
    { valueDate, mode: "price_to_yield", selectedYield: "ytm", inputPrice: 100 },
    data,
  );
  await prisma.$transaction([
    prisma.deridataCalculator.deleteMany({ where: { isin } }),
    prisma.deridataCalculator.create({
      data: {
        ...row,
        cashflows: { create: cashflows as DataBaseSchema.DeridataCashflowCreateWithoutCalculatorInput[] },
      },
    }),
  ]);
}

/** Replace EBP items for an ISIN. */
export async function persistEbp(data: EbpResponse): Promise<void> {
  const rows = mapEbp(data);
  const isin = rows[0]?.isin ?? String(data.isin ?? "").trim().toUpperCase();
  await prisma.$transaction([
    prisma.deridataEbpItem.deleteMany({ where: { isin } }),
    ...(rows.length ? [prisma.deridataEbpItem.createMany({ data: rows })] : []),
  ]);
}

/** Replace the secondary-trades summary (+ history) for an ISIN. */
export async function persistSecondaryTrades(data: SecondaryTradesResponse): Promise<void> {
  const { row, history } = mapSecondaryTrades(data);
  await prisma.$transaction([
    prisma.deridataSecondaryTrade.deleteMany({ where: { isin: row.isin } }),
    prisma.deridataSecondaryTrade.create({
      data: {
        ...row,
        history: { create: history as DataBaseSchema.DeridataTradeHistoryCreateWithoutTradeInput[] },
      },
    }),
  ]);
}

/** Upsert the Security & Covenant row for an ISIN. */
export async function persistSecurityCovenant(data: SecurityCovenant): Promise<void> {
  const row = mapSecurityCovenant(data);
  const { isin: _omit, ...update } = row;
  await prisma.deridataSecurityCovenant.upsert({ where: { isin: row.isin }, create: row, update });
}

/** Replace the Documents row (+ press releases) for an ISIN. */
export async function persistDocuments(data: DocumentsResponse): Promise<void> {
  const { row, pressReleases } = mapDocuments(data);
  await prisma.$transaction([
    prisma.deridataDocument.deleteMany({ where: { isin: row.isin } }),
    prisma.deridataDocument.create({
      data: {
        ...row,
        pressReleases: { create: pressReleases as DataBaseSchema.DeridataPressReleaseCreateWithoutDocumentInput[] },
      },
    }),
  ]);
}
