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
        cashflow: mapCalcCashflowRows(calc),
        warnings: calc.warnings ?? [],
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
