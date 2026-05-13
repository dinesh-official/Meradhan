/**
 * Cashflow timeline period presets.
 *
 * Quarters follow calendar quarters (Jan–Mar, Apr–Jun, Jul–Sep, Oct–Dec).
 * Financial Year follows the Indian convention (Apr 1 → Mar 31).
 *
 * Outputs are local `YYYY-MM-DD` strings ready to send as backend query params.
 */

export type CashflowPeriodPreset =
  | "THIS_MONTH"
  | "NEXT_MONTH"
  | "THIS_QUARTER"
  | "NEXT_QUARTER"
  | "THIS_FY"
  | "NEXT_FY"
  | "CUSTOM";

export const CASHFLOW_PERIOD_OPTIONS: ReadonlyArray<{
  value: CashflowPeriodPreset;
  label: string;
}> = [
  { value: "THIS_MONTH", label: "This Month" },
  { value: "NEXT_MONTH", label: "Next Month" },
  { value: "THIS_QUARTER", label: "This Quarter" },
  { value: "NEXT_QUARTER", label: "Next Quarter" },
  { value: "THIS_FY", label: "This FY" },
  { value: "NEXT_FY", label: "Next FY" },
  { value: "CUSTOM", label: "Custom range" },
];

export const DEFAULT_CASHFLOW_PERIOD: CashflowPeriodPreset = "THIS_MONTH";

const pad = (n: number) => String(n).padStart(2, "0");
const toIso = (year: number, month: number, day: number) =>
  `${year}-${pad(month + 1)}-${pad(day)}`;
const lastDayOfMonth = (year: number, month: number) =>
  new Date(year, month + 1, 0).getDate();

/** Indian FY: months Apr–Dec (3–11) belong to FY starting this calendar year; Jan–Mar belong to the previous one. */
const fyStartYear = (year: number, month: number) =>
  month >= 3 ? year : year - 1;

const monthRange = (year: number, month: number) => {
  const y = year + Math.floor(month / 12);
  const m = ((month % 12) + 12) % 12;
  return { fromDate: toIso(y, m, 1), toDate: toIso(y, m, lastDayOfMonth(y, m)) };
};

const quarterRange = (year: number, quarterStartMonth: number) => {
  const y = year + Math.floor(quarterStartMonth / 12);
  const start = ((quarterStartMonth % 12) + 12) % 12;
  const end = start + 2;
  return {
    fromDate: toIso(y, start, 1),
    toDate: toIso(y, end, lastDayOfMonth(y, end)),
  };
};

const fyRange = (fyStart: number) => ({
  fromDate: toIso(fyStart, 3, 1),
  toDate: toIso(fyStart + 1, 2, 31),
});

export function getCashflowPeriodRange(
  preset: CashflowPeriodPreset,
  reference: Date = new Date(),
): { fromDate: string; toDate: string } {
  const y = reference.getFullYear();
  const m = reference.getMonth();

  switch (preset) {
    case "THIS_MONTH":
      return monthRange(y, m);
    case "NEXT_MONTH":
      return monthRange(y, m + 1);
    case "THIS_QUARTER":
      return quarterRange(y, Math.floor(m / 3) * 3);
    case "NEXT_QUARTER":
      return quarterRange(y, Math.floor(m / 3) * 3 + 3);
    case "THIS_FY":
      return fyRange(fyStartYear(y, m));
    case "NEXT_FY":
      return fyRange(fyStartYear(y, m) + 1);
    case "CUSTOM":
      throw new Error(
        "getCashflowPeriodRange: CUSTOM uses explicit fromDate/toDate from filters",
      );
  }
}
