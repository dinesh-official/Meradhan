import { db } from "@core/database/database";
import { env } from "@packages/config/src/env";
import * as XLSX from "xlsx";
import { deridataApiFromEnv, type DeridataApi } from "./deridata.api";
import {
  persistIssueDetail, persistCalculator, persistEbp,
  persistSecondaryTrades, persistSecurityCovenant, persistDocuments,
} from "./deridata.persist";

const prisma = db.dataBase;
export const DEFAULT_AUTOFILL_CSV = "scripts/deridata-autofill-isins.csv";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const istToday = () => new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);

/** Read + normalize the ISIN column (12-char, deduped) from an Excel/CSV file. */
export function readAutofillIsins(file: string = DEFAULT_AUTOFILL_CSV): string[] {
  const wb = XLSX.readFile(file);
  const sheet = wb.Sheets[wb.SheetNames[0]!]!;
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
  const seen = new Set<string>();
  const out: string[] = [];
  for (const row of rows) {
    const key = Object.keys(row).find((k) => k.trim().toLowerCase() === "isin");
    if (!key) continue;
    const v = String(row[key] ?? "").trim().toUpperCase();
    if (v.length !== 12 || seen.has(v)) continue;
    seen.add(v);
    out.push(v);
  }
  return out;
}

export type PopulateIsinResult = { status: "ok" | "not_found" | "error"; failed: string[]; message?: string };

/** Fetch all 6 Deridata endpoints for one ISIN (issue-detail gates the rest) and persist. */
export async function populateOneIsin(
  api: DeridataApi,
  isin: string,
  valueDate: string,
): Promise<PopulateIsinResult> {
  const issue = await api.getIssueDetail(isin);
  await sleep(100);
  if (!issue.ok) {
    if (issue.code === "NOT_FOUND") return { status: "not_found", failed: [] };
    return { status: "error", failed: [], message: `issue-detail ${issue.code}: ${issue.error}` };
  }
  await persistIssueDetail(issue.data);

  const failed: string[] = [];
  const steps: Array<[string, () => Promise<void>]> = [
    ["calculator", async () => {
      const r = await api.calculate({ isin, value_date: valueDate, amount: 1, yield_to_price: false, selected_yield: "ytm", clean_price: 100, cashflow_shut_flag: false });
      if (r.ok) await persistCalculator(isin, r.data, valueDate); else throw new Error(`${r.code}: ${r.error}`);
    }],
    ["ebp", async () => { const r = await api.getEbp(isin); if (r.ok) await persistEbp(r.data); else throw new Error(`${r.code}: ${r.error}`); }],
    ["secondary-trades", async () => { const r = await api.getSecondaryTrades(isin); if (r.ok) await persistSecondaryTrades(r.data); else throw new Error(`${r.code}: ${r.error}`); }],
    ["security-covenant", async () => { const r = await api.getSecurityCovenant(isin); if (r.ok) await persistSecurityCovenant(r.data); else throw new Error(`${r.code}: ${r.error}`); }],
    ["documents", async () => { const r = await api.getDocuments(isin); if (r.ok) await persistDocuments(r.data); else throw new Error(`${r.code}: ${r.error}`); }],
  ];
  for (const [name, run] of steps) {
    try { await run(); } catch (e) { failed.push(`${name}(${(e as Error).message})`); }
    await sleep(100);
  }
  return { status: "ok", failed };
}

export type PopulateSummary = {
  total: number; populated: number; skipped: number; notFound: number; errored: number;
};

/**
 * Populate Deridata data for the autofill ISIN list. Idempotent: by default skips ISINs
 * that already have an issue-detail row (so re-deploys make ~0 API calls). Pass `force`
 * to refetch all. No-op unless DERIDATA_ENABLED.
 */
export async function populateDeridata(opts: {
  file?: string;
  force?: boolean;
  log?: (msg: string) => void;
} = {}): Promise<PopulateSummary> {
  const log = opts.log ?? ((m: string) => console.log(m));
  const summary: PopulateSummary = { total: 0, populated: 0, skipped: 0, notFound: 0, errored: 0 };

  if (!env.DERIDATA_ENABLED) {
    log("deridata populate skipped: DERIDATA_ENABLED is false");
    return summary;
  }

  const isins = readAutofillIsins(opts.file);
  summary.total = isins.length;
  if (!isins.length) {
    log(`deridata populate: no ISINs found in ${opts.file ?? DEFAULT_AUTOFILL_CSV}`);
    return summary;
  }

  const api = deridataApiFromEnv();
  const valueDate = istToday();
  log(`deridata populate: ${isins.length} ISINs (force=${Boolean(opts.force)})`);

  for (const isin of isins) {
    if (!opts.force) {
      const existing = await prisma.deridataIssueDetail.findUnique({ where: { isin }, select: { id: true } });
      if (existing) { summary.skipped++; continue; }
    }
    const res = await populateOneIsin(api, isin, valueDate);
    if (res.status === "ok") {
      summary.populated++;
      log(`✓ ${isin}${res.failed.length ? ` | failed: ${res.failed.join(", ")}` : " | all 6 ok"}`);
    } else if (res.status === "not_found") {
      summary.notFound++;
      log(`• ${isin}: no Deridata data (404)`);
    } else {
      summary.errored++;
      log(`✗ ${isin}: ${res.message}`);
    }
  }

  log(`deridata populate done: ${JSON.stringify(summary)}`);
  return summary;
}
