/**
 * Parser for HDFC "Depository Holding Details" statement PDFs.
 *
 * `parseDematHoldingText` is pure (text -> rows) so it is fully unit-testable;
 * `parseDematHoldingPdf` is a thin wrapper that extracts text from a PDF buffer
 * (via `pdf-parse`, lazily required) and delegates to it.
 *
 * Strategy: text extractors flatten the table to a token stream, so we anchor on
 * the 12-char ISIN, take the segment up to the next ISIN, find the row's Status
 * keyword (Free / Pledged / ...), and read the Balance as the third-from-last
 * numeric token before the status (the columns are Balance, Rate, Value). Only
 * "Free" holdings are sellable inventory; anything else is skipped with a warning.
 */

import type { DematPdfRow } from "./inventory_reconciliation";

export interface DematParseResult {
  rows: DematPdfRow[];
  parseWarnings: string[];
}

// ISIN: 2 letters + 9 alphanumerics + 1 check digit (12 chars total), e.g.
// INE08XP07324. NOT \b-anchored: pdf-parse glues the ISIN to the company name
// that follows it (e.g. "INE08XP07324AKARA CAPITAL..."), so word boundaries fail.
const ISIN_RE = /[A-Z]{2}[A-Z0-9]{9}[0-9]/g;

// Holding statuses; "Free" is the only sellable one. Account-type prefixes like
// "Free Balance" are matched as whole words.
const STATUS_ALT = "Free|Pledged|Locked|Earmarked|Pledge|Lock";

// The trailing columns arrive concatenated with no separators, e.g.
// "10.00096,300.00963,000.00Free". They split cleanly on the decimal pattern:
// Balance has 3 decimals, Rate and Value have 2. `\s*` tolerates the
// space-separated variant some extractors produce.
const TAIL_RE = new RegExp(
  `([\\d,]+\\.\\d{3})\\s*([\\d,]+\\.\\d{2})\\s*([\\d,]+\\.\\d{2})\\s*(${STATUS_ALT})`,
  "i",
);

export function parseDematHoldingText(text: string): DematParseResult {
  const raw = String(text ?? "");
  const matches = [...raw.matchAll(ISIN_RE)];
  const parseWarnings: string[] = [];

  if (!matches.length) {
    return { rows: [], parseWarnings: ["No holdings (ISIN rows) found in the PDF"] };
  }

  const balanceByIsin = new Map<string, number>();
  const nameByIsin = new Map<string, string>();

  for (let i = 0; i < matches.length; i++) {
    const m = matches[i]!;
    const isin = m[0];
    const segStart = (m.index ?? 0) + isin.length;
    const segEnd = i + 1 < matches.length ? (matches[i + 1]!.index ?? raw.length) : raw.length;
    const segment = raw.slice(segStart, segEnd);

    const tail = TAIL_RE.exec(segment);
    if (!tail) {
      parseWarnings.push(`Skipped ${isin}: could not parse Balance/Rate/Value/Status columns`);
      continue;
    }

    const status = tail[4]!;
    if (status.toLowerCase() !== "free") {
      parseWarnings.push(`Skipped ${isin}: non-Free balance (${status}) is not sellable`);
      continue;
    }

    const balance = Number(tail[1]!.replace(/,/g, ""));
    if (!Number.isFinite(balance) || balance < 0) {
      parseWarnings.push(`Skipped ${isin}: invalid Balance value`);
      continue;
    }

    balanceByIsin.set(isin, (balanceByIsin.get(isin) ?? 0) + balance);

    // Best-effort company name: the text between the ISIN and the first digit
    // (which starts the scrip type's coupon / face value). Glued layout makes
    // this imperfect (a trailing series token may stick on) — it is display-only.
    if (!nameByIsin.has(isin)) {
      const beforeFirstDigit = segment.slice(0, tail.index);
      const cut = beforeFirstDigit.search(/\d/);
      const name = (cut >= 0 ? beforeFirstDigit.slice(0, cut) : beforeFirstDigit)
        .replace(/\s+/g, " ")
        .trim();
      if (name) nameByIsin.set(isin, name);
    }
  }

  const rows: DematPdfRow[] = [...balanceByIsin.entries()].map(([isin, balance]) => {
    const row: DematPdfRow = { isin, balance };
    const name = nameByIsin.get(isin);
    if (name) row.companyName = name;
    return row;
  });

  if (!rows.length && !parseWarnings.length) {
    parseWarnings.push("No Free-balance holdings found in the PDF");
  }

  return { rows, parseWarnings };
}

/**
 * Extract holdings from a Demat statement PDF buffer.
 * `pdf-parse` is required lazily so the pure parser above stays dependency-free.
 */
export async function parseDematHoldingPdf(buffer: Buffer): Promise<DematParseResult> {
  if (!buffer?.length) {
    return { rows: [], parseWarnings: ["Empty file"] };
  }
  // Magic-byte check: a real PDF starts with "%PDF" (allowing a small BOM/offset).
  if (!buffer.subarray(0, 1024).toString("latin1").includes("%PDF")) {
    throw new Error("Uploaded file is not a valid PDF");
  }
  type PdfParseFn = (b: Buffer) => Promise<{ text: string }>;
  // Import the library module directly, not the package index: pdf-parse@1's
  // index.js runs a debug block at import time (reads a bundled sample PDF) when
  // `module.parent` is falsy, which throws under bun/ESM interop. The specifier
  // is held in a variable so the toolchain doesn't statically resolve the
  // untyped .js entrypoint (it has no bundled declarations).
  const pdfParseSpecifier = "pdf-parse/lib/pdf-parse.js";
  const mod = (await import(pdfParseSpecifier)) as { default?: PdfParseFn } | PdfParseFn;
  const pdfParse: PdfParseFn = typeof mod === "function" ? mod : (mod.default as PdfParseFn);
  let extracted: { text: string };
  try {
    extracted = await pdfParse(buffer);
  } catch (e) {
    throw new Error(
      `Could not read PDF: ${e instanceof Error ? e.message : "unknown error"}`,
    );
  }
  return parseDematHoldingText(extracted.text ?? "");
}
