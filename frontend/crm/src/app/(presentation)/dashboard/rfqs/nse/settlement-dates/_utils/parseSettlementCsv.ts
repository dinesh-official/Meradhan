import { format, isValid, parse } from "date-fns";

/** Max rows returned for preview (UI safety). */
export const SETTLEMENT_CSV_MAX_ROWS = 500;

export type SettlementCsvRow = {
  id: string;
  /** Normalized yyyy-mm-dd for API / DB */
  date: string;
  settlementNo: string;
};

/**
 * Converts various settlement date strings (e.g. 02-Apr-26, yyyy-mm-dd) to yyyy-mm-dd.
 */
export function normalizeSettlementDateToIso(input: string): string | null {
  const s = input.trim();
  if (!s) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const d = parse(s, "yyyy-MM-dd", new Date());
    return isValid(d) ? format(d, "yyyy-MM-dd") : null;
  }

  const patterns = [
    "dd-MMM-yy",
    "d-MMM-yy",
    "dd-MMM-yyyy",
    "d-MMM-yyyy",
    "dd/MM/yyyy",
    "d/MM/yyyy",
    "yyyy/MM/dd",
  ];
  for (const pattern of patterns) {
    const d = parse(s, pattern, new Date());
    if (isValid(d)) return format(d, "yyyy-MM-dd");
  }

  const fallback = new Date(s);
  if (isValid(fallback)) return format(fallback, "yyyy-MM-dd");

  return null;
}

export type ParseSettlementCsvResult =
  | { ok: true; rows: SettlementCsvRow[]; truncated: boolean }
  | { ok: false; error: string };

/** Split one CSV line respecting simple double-quoted fields. */
export function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += c;
    }
  }
  result.push(current.trim());
  return result.map((s) => s.replace(/^"|"$/g, "").trim());
}

function lineLooksLikeHeader(firstLineCells: string[]): boolean {
  const text = firstLineCells.join(" ").toLowerCase();
  return (
    text.includes("date") &&
    (text.includes("settlement") || text.includes("no") || text.includes("id"))
  );
}

function resolveHeaderIndices(headers: string[]): {
  dateIdx: number;
  settlementIdx: number;
} | null {
  const cells = headers.map((h) => h.trim());
  if (cells.length < 2) return null;

  const lower = cells.map((h) => h.toLowerCase());

  let settlementIdx = lower.findIndex((h) =>
    /settlement\s*no\.?|settlementno|settlement_no|settlement\s*number/.test(h)
  );
  if (settlementIdx < 0) {
    settlementIdx = lower.findIndex(
      (h) => h === "no" || h === "id" || h === "settlement no"
    );
  }

  let dateIdx = lower.findIndex(
    (h, i) =>
      h.includes("date") &&
      i !== settlementIdx &&
      !/settlement\s*no|settlementno|settlement_no/.test(h)
  );

  if (dateIdx < 0) {
    dateIdx = lower.findIndex((h) => h === "date" || h.includes("settlement_date"));
  }

  if (dateIdx >= 0 && settlementIdx >= 0 && dateIdx !== settlementIdx) {
    return { dateIdx, settlementIdx };
  }

  if (cells.length === 2) {
    return { dateIdx: 0, settlementIdx: 1 };
  }

  return null;
}

function parseBodyLine(
  cells: string[],
  dateIdx: number,
  settlementIdx: number,
  rowIndex: number,
  dateIso: string
): SettlementCsvRow | null {
  const settlementRaw = (cells[settlementIdx] ?? "").trim();
  const settlementNo = settlementRaw === "" ? "" : String(settlementRaw);
  if (!dateIso && !settlementNo) return null;
  return {
    id: `${rowIndex}-${settlementNo || dateIso || "row"}`,
    date: dateIso,
    settlementNo,
  };
}

/**
 * Parse settlement date + settlement number from CSV text.
 * Optional header row when the first line mentions date and settlement/id columns.
 * Without a header, expects two columns: date, settlement number.
 */
export function parseSettlementCsv(text: string): ParseSettlementCsvResult {
  const rawLines = text.split(/\r?\n/).map((l) => l.trim());
  const nonEmptyLines = rawLines.filter((l) => l.length > 0);
  if (nonEmptyLines.length === 0) {
    return { ok: false, error: "File is empty." };
  }

  const firstCells = splitCsvLine(nonEmptyLines[0]!);
  if (firstCells.length < 2) {
    return {
      ok: false,
      error: "Need at least two columns: settlement date and settlement number.",
    };
  }

  let startDataIndex = 0;
  let dateIdx = 0;
  let settlementIdx = 1;

  if (lineLooksLikeHeader(firstCells)) {
    const resolved = resolveHeaderIndices(firstCells);
    if (!resolved) {
      return {
        ok: false,
        error: "Could not detect date and settlement number columns from the header row.",
      };
    }
    dateIdx = resolved.dateIdx;
    settlementIdx = resolved.settlementIdx;
    startDataIndex = 1;
  }

  const rows: SettlementCsvRow[] = [];
  let truncated = false;

  for (let i = startDataIndex; i < nonEmptyLines.length; i++) {
    if (rows.length >= SETTLEMENT_CSV_MAX_ROWS) {
      truncated = true;
      break;
    }
    const cells = splitCsvLine(nonEmptyLines[i]!);
    if (cells.length < Math.max(dateIdx, settlementIdx) + 1) continue;
    const rawDate = (cells[dateIdx] ?? "").trim();
    const dateIso = normalizeSettlementDateToIso(rawDate);
    if (!dateIso) {
      if (!rawDate && !(cells[settlementIdx] ?? "").trim()) continue;
      return {
        ok: false,
        error: `Invalid date in row ${i + 1}: "${rawDate}". Use formats like 02-Apr-26 or yyyy-mm-dd.`,
      };
    }
    const row = parseBodyLine(cells, dateIdx, settlementIdx, i, dateIso);
    if (row) {
      if (!row.settlementNo) {
        return {
          ok: false,
          error: `Missing settlement number in row ${i + 1}.`,
        };
      }
      rows.push(row);
    }
  }

  if (rows.length === 0) {
    return {
      ok: false,
      error: "No data rows found. Use two columns: Settlement Date, Settlement Number.",
    };
  }

  return { ok: true, rows, truncated };
}
