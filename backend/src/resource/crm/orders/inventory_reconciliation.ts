/**
 * Pure reconciliation of a Demat holding-statement balance against in-flight
 * (paid-but-not-yet-settled) customer order quantities.
 *
 * The Demat PDF reports bonds physically held in the firm's Demat account.
 * Because NSE settlement is T+1 (or later), bonds already sold to customers but
 * not yet settled still appear in the statement, while the CRM already reduced
 * them at payment capture. So the true available quantity is:
 *
 *     correctedQty = max(0, pdfBalance - inFlight)
 *
 * See docs/superpowers/specs/2026-06-17-demat-pdf-inventory-reconciliation-design.md
 */

export interface DematPdfRow {
  isin: string;
  balance: number;
  companyName?: string;
}

export interface ReconciledLine {
  isin: string;
  companyName?: string;
  pdfBalance: number;
  inFlight: number;
  correctedQty: number;
}

export interface ReconcileResult {
  lines: ReconciledLine[];
  /** Rows where in-flight exceeded the PDF balance (corrected floored to 0). */
  anomalies: { isin: string; pdfBalance: number; inFlight: number }[];
  /** ISINs present in the prior batch but missing from the uploaded PDF. */
  disappearedIsins: string[];
}

export function reconcileInventory(params: {
  pdfRows: DematPdfRow[];
  inFlightByIsin: Map<string, number>;
  priorIsins?: string[];
}): ReconcileResult {
  const { pdfRows, inFlightByIsin } = params;

  const lines: ReconciledLine[] = [];
  const anomalies: ReconcileResult["anomalies"] = [];

  for (const row of pdfRows) {
    const inFlight = inFlightByIsin.get(row.isin) ?? 0;
    const raw = row.balance - inFlight;
    const correctedQty = raw < 0 ? 0 : raw;

    const line: ReconciledLine = {
      isin: row.isin,
      pdfBalance: row.balance,
      inFlight,
      correctedQty,
    };
    if (row.companyName !== undefined) line.companyName = row.companyName;
    lines.push(line);

    if (raw < 0) {
      anomalies.push({ isin: row.isin, pdfBalance: row.balance, inFlight });
    }
  }

  lines.sort((a, b) => a.isin.localeCompare(b.isin));

  const pdfIsins = new Set(pdfRows.map((r) => r.isin));
  const disappearedIsins = (params.priorIsins ?? []).filter((isin) => !pdfIsins.has(isin));

  return { lines, anomalies, disappearedIsins };
}
