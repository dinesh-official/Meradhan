/**
 * Generates interest payment schedule from order date to maturity date
 * based on bond's payment frequency.
 * Output format: "20-Feb, 20-Mar, 20-Apr, ..." with a label e.g. "Twelve Times a Year".
 */

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export type PaymentFrequencyKey =
  | "MONTHLY"
  | "QUARTERLY"
  | "HALF_YEARLY"
  | "YEARLY"
  | "ON_MATURITY"
  | "UNKNOWN";

const FREQUENCY_CONFIG: Record<
  PaymentFrequencyKey,
  { paymentsPerYear: number; label: string; monthsBetween: number }
> = {
  MONTHLY: { paymentsPerYear: 12, label: "Monthly", monthsBetween: 1 },
  QUARTERLY: { paymentsPerYear: 4, label: "Quarterly", monthsBetween: 3 },
  HALF_YEARLY: { paymentsPerYear: 2, label: "Semi-Annual", monthsBetween: 6 },
  YEARLY: { paymentsPerYear: 1, label: "Yearly", monthsBetween: 12 },
  ON_MATURITY: { paymentsPerYear: 0, label: "On Maturity", monthsBetween: 0 },
  UNKNOWN: { paymentsPerYear: 12, label: "Monthly", monthsBetween: 1 },
};

function normalizeFrequency(frequency: string | undefined | null): PaymentFrequencyKey {
  if (!frequency || typeof frequency !== "string") return "UNKNOWN";
  const upper = frequency.toUpperCase().replace(/\s+/g, "_");
  if (upper.includes("MONTH") || upper === "12") return "MONTHLY";
  if (upper.includes("QUARTER") || upper === "4") return "QUARTERLY";
  if (upper.includes("HALF") || upper.includes("SEMI") || upper === "2") return "HALF_YEARLY";
  if (upper.includes("YEAR") || upper === "ANNUAL" || upper === "1") return "YEARLY";
  if (upper.includes("MATURITY") || upper.includes("BULLET")) return "ON_MATURITY";
  return "UNKNOWN";
}

/**
 * Add months to a date (handles month rollover and varying month lengths).
 */
function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

/**
 * Set day of month; if day is beyond month length, use last day of month.
 */
function setDayOfMonth(date: Date, day: number): Date {
  const result = new Date(date);
  const maxDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(day, maxDay));
  return result;
}

export interface InterestPaymentScheduleResult {
  /** Label for the frequency, e.g. "Twelve Times a Year" */
  frequencyLabel: string;
  /** Dates in "DD-MMM" format, e.g. ["20-Feb", "20-Mar", ...] */
  dates: string[];
  /** Same dates as ISO date strings for lastInterestPaymentDate etc. */
  dateStrings: string[];
}

export interface GetInterestPaymentScheduleParams {
  /** Bond maturity date (string or Date) */
  maturityDate: string | Date | null | undefined;
  /** Order/deal date to start from */
  orderDate: Date;
  /** Bond interest payment frequency, e.g. "MONTHLY", "Quarterly", "12" */
  interestPaymentFrequency?: string | null;
  /** Day of month for payment (1–31). Default 20. */
  paymentDayOfMonth?: number;
  /** Optional: use this date's day as payment day if set */
  nextCouponDate?: string | Date | null;
}

/**
 * Generates interest payment dates from order date up to maturity date
 * based on bond's payment frequency.
 */
export function getInterestPaymentSchedule(params: GetInterestPaymentScheduleParams): InterestPaymentScheduleResult {
  const {
    maturityDate,
    orderDate,
    interestPaymentFrequency,
    paymentDayOfMonth: preferredDay = 20,
    nextCouponDate,
  } = params;

  const maturity = maturityDate ? new Date(maturityDate) : null;
  const frequencyKey = normalizeFrequency(interestPaymentFrequency ?? null);
  const config = FREQUENCY_CONFIG[frequencyKey];

  let paymentDay = preferredDay;
  if (nextCouponDate) {
    const ref = new Date(nextCouponDate);
    if (!isNaN(ref.getTime())) paymentDay = ref.getDate();
  }
  paymentDay = Math.max(1, Math.min(31, paymentDay));

  if (config.paymentsPerYear === 0 || !maturity || isNaN(maturity.getTime())) {
    if (maturity && !isNaN(maturity.getTime())) {
      const d = maturity.getDate();
      const m = maturity.getMonth();
      return {
        frequencyLabel: config.label,
        dates: [`${String(d).padStart(2, "0")}-${MONTHS_SHORT[m] ?? "Jan"}`],
        dateStrings: [maturity.toISOString().split("T")[0] ?? ""],
      };
    }
    return {
      frequencyLabel: config.label,
      dates: [],
      dateStrings: [],
    };
  }

  const dates: string[] = [];
  const dateStrings: string[] = [];

  let current = new Date(orderDate.getFullYear(), orderDate.getMonth(), 1);
  current = setDayOfMonth(current, paymentDay);
  if (current < orderDate) {
    current = addMonths(current, config.monthsBetween);
  }

  while (current <= maturity) {
    const d = current.getDate();
    const m = current.getMonth();
    const monthShort = MONTHS_SHORT[m] ?? "Jan";
    dates.push(`${String(d).padStart(2, "0")}-${monthShort}`);
    dateStrings.push(current.toISOString().split("T")[0] ?? "");
    current = addMonths(current, config.monthsBetween);
  }

  return {
    frequencyLabel: config.label,
    dates,
    dateStrings,
  };
}
