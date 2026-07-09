import { AppError, HttpStatus } from "@utils/error/AppError";
import { getBondDealAutofill } from "./bond_clac";
import type { ExternalCalcResponse } from "./bond_clac";

export type BondCashflowRow = {
  period: number;
  date: string;
  coupon: string;
  principal: string;
  totalCashflow: string;
  totalCashflowRaw: number;
  days: number;
};

export type BondCashflowSummary = {
  settlementDate: string;
  finalPrice: string;
  finalYield: string;
  finalYieldRaw: number;
  settlementAmount: string;
  totalAccruedInterest: string;
  principalAmount: string;
  stampDuty: string;
  totalConsideration: string;
  accruedDays: number;
  quantity: string;
};

export type BondCashflowResult = {
  isin: string;
  quantity: number;
  summary: BondCashflowSummary;
  cashflow: BondCashflowRow[];
  warnings: string[];
  /** Payments in the full calc schedule before display window filtering. */
  totalSchedulePayments: number;
  /** Months shown from settlement (e.g. 12). */
  cashflowWindowMonths: number;
  maturityDate: string | null;
};

function parseCalcMoney(value: string | null | undefined): number {
  if (value == null || value === "" || value === "-") return 0;
  const n = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : 0;
}

function resolveCashflowTotal(
  row: ExternalCalcResponse["cf_rows"][number],
): { totalCashflow: string; totalCashflowRaw: number } {
  const coupon = parseCalcMoney(row.interest);
  const principal = parseCalcMoney(
    row.principal === "-" ? undefined : row.principal,
  );

  let totalRaw = Number(row.total_raw);
  if (!Number.isFinite(totalRaw)) {
    totalRaw = parseCalcMoney(row.total);
  }
  // Calc returns total "-" on coupon-only rows; total_raw is often unset too.
  if (totalRaw === 0 && (coupon !== 0 || principal !== 0)) {
    totalRaw = coupon + principal;
  }

  const totalCashflow =
    row.total && row.total !== "-"
      ? row.total
      : totalRaw.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });

  return { totalCashflow, totalCashflowRaw: totalRaw };
}

const CASHFLOW_DISPLAY_WINDOW_MONTHS = 12;

const MONTH_ABBREV: Record<string, number> = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
};

function parseBondCashflowDate(value: string): Date | null {
  const trimmed = value.trim();
  const dmy = trimmed.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/);
  if (dmy) {
    const month = MONTH_ABBREV[dmy[2]!.toLowerCase()];
    if (month == null) return null;
    return new Date(
      Date.UTC(Number(dmy[3]), month, Number(dmy[1]), 0, 0, 0, 0),
    );
  }
  const iso = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
  if (iso) {
    return new Date(`${iso[1]}T00:00:00.000Z`);
  }
  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function addCalendarMonths(anchor: Date, months: number): Date {
  const y = anchor.getUTCFullYear();
  const m = anchor.getUTCMonth() + months;
  const d = anchor.getUTCDate();
  return new Date(Date.UTC(y, m, d, 0, 0, 0, 0));
}

function rowHasPrincipal(row: BondCashflowRow): boolean {
  return (
    row.principal !== "-" && parseCalcMoney(row.principal) > 0
  );
}

function sameUtcCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

/**
 * Show at most 12 months of cashflows from settlement.
 * Drop rows past maturity (calc overflow) and rows beyond the 1-year window.
 */
function filterCashflowRowsForDisplay(
  rows: BondCashflowRow[],
  settlementDateStr: string,
  maturityDateYmd: string | null,
  windowMonths = CASHFLOW_DISPLAY_WINDOW_MONTHS,
): BondCashflowRow[] {
  const settlement = parseBondCashflowDate(settlementDateStr);
  if (!settlement) return rows;

  const windowEnd = addCalendarMonths(settlement, windowMonths);
  const maturity = maturityDateYmd
    ? parseBondCashflowDate(maturityDateYmd.slice(0, 10))
    : null;

  return rows.filter((row) => {
    const rowDate = parseBondCashflowDate(row.date);
    if (!rowDate) return true;

    if (maturity && rowDate.getTime() > maturity.getTime()) {
      return false;
    }

    if (rowDate.getTime() <= windowEnd.getTime()) {
      return true;
    }

    // Maturity principal row on maturity date within overflow tail — keep only if inside window.
    if (
      maturity &&
      rowHasPrincipal(row) &&
      sameUtcCalendarDay(rowDate, maturity)
    ) {
      return rowDate.getTime() <= windowEnd.getTime();
    }

    return false;
  });
}

/**
 * When maturity principal falls in a month that already has a coupon row,
 * drop the separate maturity row (e.g. 20-Dec coupon + 31-Dec principal → keep coupon only).
 */
function dropSameMonthMaturityPrincipalRow(
  rows: BondCashflowRow[],
  maturityDateYmd: string | null,
): BondCashflowRow[] {
  const maturity = maturityDateYmd
    ? parseBondCashflowDate(maturityDateYmd.slice(0, 10))
    : null;
  if (!maturity) return rows;

  const matY = maturity.getUTCFullYear();
  const matM = maturity.getUTCMonth();

  return rows.filter((row) => {
    if (!rowHasPrincipal(row)) return true;
    const rowDate = parseBondCashflowDate(row.date);
    if (!rowDate) return true;
    if (rowDate.getUTCFullYear() !== matY || rowDate.getUTCMonth() !== matM) {
      return true;
    }
    const hasCouponSameMonth = rows.some((other) => {
      if (other === row || rowHasPrincipal(other)) return false;
      const otherDate = parseBondCashflowDate(other.date);
      return (
        otherDate != null &&
        otherDate.getUTCFullYear() === matY &&
        otherDate.getUTCMonth() === matM
      );
    });
    return !hasCouponSameMonth;
  });
}

function mapCalcCashflowRows(calc: ExternalCalcResponse): BondCashflowRow[] {
  return (calc.cf_rows ?? []).map((row) => {
    const { totalCashflow, totalCashflowRaw } = resolveCashflowTotal(row);
    return {
      period: row.num,
      date: row.date,
      coupon: row.interest,
      principal:
        row.principal === "-" || parseCalcMoney(row.principal) === 0
          ? "-"
          : row.principal,
      totalCashflow,
      totalCashflowRaw,
      days: row.days,
    };
  });
}

export class BondCashflowService {
  async getBondCashflow(
    isin: string,
    options?: {
      quantity?: number;
      settlementDate?: string;
      pricingYield?: number;
    },
  ): Promise<BondCashflowResult> {
    const quantity = Math.max(1, options?.quantity ?? 1);

    try {
      const autofill = await getBondDealAutofill({
        isin,
        quantity,
        settlementDate: options?.settlementDate,
        pricingYield: options?.pricingYield,
      });

      const calc = autofill.pricing.calc;
      const maturityDate = autofill.suggested.maturityDate ?? null;
      const allRows = mapCalcCashflowRows(calc);
      const displayRows = dropSameMonthMaturityPrincipalRow(
        filterCashflowRowsForDisplay(
          allRows,
          calc.settle_dt,
          maturityDate,
        ),
        maturityDate,
      );
      const warnings = [...(calc.warnings ?? [])];
      if (displayRows.length < allRows.length) {
        warnings.push(
          `Showing the next ${CASHFLOW_DISPLAY_WINDOW_MONTHS} months of cashflows from settlement. Remaining payments until maturity are hidden.`,
        );
      }

      return {
        isin,
        quantity: autofill.quantity,
        summary: {
          settlementDate: calc.settle_dt,
          finalPrice: calc.final_price,
          finalYield: calc.final_yield,
          finalYieldRaw: calc.final_yield_raw,
          settlementAmount: calc.settlement_amount,
          totalAccruedInterest: calc.total_ai,
          principalAmount: calc.principal_amount,
          stampDuty: calc.stamp_duty,
          totalConsideration: calc.total_consideration,
          accruedDays: calc.accrued_days,
          quantity: calc.quantity,
        },
        cashflow: displayRows,
        warnings,
        totalSchedulePayments: allRows.length,
        cashflowWindowMonths: CASHFLOW_DISPLAY_WINDOW_MONTHS,
        maturityDate,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.toLowerCase().includes("not found")) {
        throw new AppError("Bond not found", { statusCode: HttpStatus.NOT_FOUND });
      }
      throw new AppError(
        message || "Failed to compute bond cashflow",
        { statusCode: HttpStatus.BAD_GATEWAY },
      );
    }
  }
}
