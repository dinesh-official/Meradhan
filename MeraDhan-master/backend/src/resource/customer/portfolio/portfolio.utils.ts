export const isNA = (value: string): boolean => {
  const v = value.trim().toLowerCase();
  return v === "n/a" || v === "na" || v === "n.a";
};

export const formatDateStr = (d: Date): string => {
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export const parseSettleDate = (raw: string): Date => {
  const parts = raw.split("-");
  if (parts.length === 3) {
    return new Date(`${parts[2]}-${parts[1]}-${parts[0]}T00:00:00Z`);
  }
  return new Date(raw);
};


export const getMaturityBucketLabel = (yearsRemaining: number): string | null => {
  if (yearsRemaining < 0) return null;
  if (yearsRemaining < 1) return "Below 1 year";
  if (yearsRemaining < 3) return "1 - 3 years";
  if (yearsRemaining < 5) return "3 - 5 years";
  if (yearsRemaining < 8) return "5 - 8 years";
  if (yearsRemaining < 15) return "8 - 15 years";
  return null;
};

export const getCouponBucket = (rate: number): string | null => {
  if (rate >= 0 && rate < 4) return "0-3";
  if (rate >= 4 && rate < 8) return "4-7";
  if (rate >= 8 && rate < 11) return "8-10";
  if (rate > 10) return ">10";
  return null;
};

export const lastDayOfMonth = (year: number, month: number): number =>
  new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

export const isEndOfMonth = (d: Date): boolean =>
  d.getUTCDate() === lastDayOfMonth(d.getUTCFullYear(), d.getUTCMonth());

export const addMonths = (d: Date, n: number, snapToEOM: boolean): Date => {
  const targetMonth = d.getUTCMonth() + n;
  const newYear = d.getUTCFullYear() + Math.floor(targetMonth / 12);
  const newMonth = ((targetMonth % 12) + 12) % 12;
  const newDay = snapToEOM ? lastDayOfMonth(newYear, newMonth) : d.getUTCDate();
  return new Date(Date.UTC(newYear, newMonth, newDay));
};

export const monthStepForMode = (mode: string): number => {
  if (mode === "YEARLY") return 12;
  if (mode === "HALF_YEARLY") return 6;
  if (mode === "QUARTERLY") return 3;
  return 1;
};

export const validateAlignment = (
  allotment: Date,
  maturity: Date,
  mode: string
): { valid: boolean; isEOM: boolean } => {
  const bothEOM = isEndOfMonth(allotment) && isEndOfMonth(maturity);
  const allotDay = allotment.getUTCDate();
  const matDay = maturity.getUTCDate();
  const allotMonth = allotment.getUTCMonth() + 1;
  const matMonth = maturity.getUTCMonth() + 1;

  if (!bothEOM && allotDay !== matDay) return { valid: false, isEOM: false };

  if (mode === "MONTHLY") return { valid: true, isEOM: bothEOM };
  if (mode === "YEARLY") return { valid: allotMonth === matMonth, isEOM: bothEOM };

  const diff = ((matMonth - allotMonth) % 12 + 12) % 12;
  if (mode === "HALF_YEARLY") return { valid: diff % 6 === 0, isEOM: bothEOM };
  if (mode === "QUARTERLY") return { valid: diff % 3 === 0, isEOM: bothEOM };

  return { valid: false, isEOM: false };
};

export const getAdjustedStartDate = (
  settleDate: Date,
  allotment: Date,
  maturity: Date,
  monthStep: number,
  isEOM: boolean
): Date => {
  let cursor = new Date(allotment);
  let lastBoundary = new Date(allotment);

  while (cursor <= maturity) {
    const next = addMonths(cursor, monthStep, isEOM);
    cursor = next > maturity ? new Date(maturity) : next;

    if (cursor <= settleDate) {
      lastBoundary = new Date(cursor);
    } else {
      break;
    }

    if (cursor.getTime() === maturity.getTime()) break;
  }

  return lastBoundary;
};

export const calcInterest = (
  annualInterest: number,
  fromDate: Date,
  toDate: Date
): number => {
  let total = 0;
  let cursor = new Date(fromDate);

  while (cursor < toDate) {
    const year = cursor.getUTCFullYear();
    const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    const daysInYear = isLeap ? 366 : 365;

    const yearEnd = new Date(Date.UTC(year + 1, 0, 1));
    const periodEnd = yearEnd < toDate ? yearEnd : toDate;
    const daysInPeriod = Math.floor(
      (periodEnd.getTime() - cursor.getTime()) / (1000 * 60 * 60 * 24)
    );

    total += (annualInterest / daysInYear) * daysInPeriod;
    cursor = periodEnd;
  }

  return total;
};
