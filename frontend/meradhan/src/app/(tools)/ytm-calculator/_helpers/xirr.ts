import xirr, { CashFlow } from "@webcarrot/xirr";

export type FrequencyType =
  | "monthly"
  | "quarterly"
  | "semi-annual"
  | "annual"
  | "maturity";
export const formatToMMDDYYYY = (dateStr: string): string => {
  const [yyyy, mm, dd] = dateStr.split("-");
  return `${mm}/${dd}/${yyyy}`;
};
export function removeFirstLast<T>(arr: T[]): {
  trimmedArray: T[];
  firstItem: T | null;
  lastItem: T | null;
} {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  arr = arr.filter((e: any) => !e.mc);
  if (arr.length <= 3) {
    return { trimmedArray: arr, firstItem: null, lastItem: null };
  }

  if (!Array.isArray(arr) || arr.length === 0) {
    return { trimmedArray: [], firstItem: null, lastItem: null };
  }

  if (arr.length === 1) {
    return { trimmedArray: [], firstItem: arr[0], lastItem: arr[0] };
  }

  const firstItem = arr[0];
  const lastItem = arr[arr.length - 1];
  const trimmedArray = arr.slice(1, -1); // excludes first and last

  return { trimmedArray, firstItem, lastItem };
}

export const prepareXirrValues = (data: Cashflow[]): CashFlow[] => {
  const filtered = data.filter((e) => !e.extra);
  //   const dates = filtered.map((e) => e.paymentDate);
  //   const amount = filtered.map((e) => e.amount);
  //   return { dates, amount };

  const filterData = filtered.map((e, i) => {
    return {
      date: new Date(e.paymentDate),
      amount:
        i == filtered.length - 1
          ? +(e.amount + e.interest).toFixed(2)
          : e.amount,
    };
  });
  console.log(filterData);
  return filterData;
};

export function getMinMax(arr: number[]): {
  min: number | null;
  max: number | null;
} {
  if (!Array.isArray(arr) || arr.length === 0) {
    return { min: null, max: null };
  }

  const min = Math.min(...arr);
  const max = Math.max(...arr);

  return { min, max };
}

const monthInterval: Record<FrequencyType, number> = {
  monthly: 1,
  quarterly: 3,
  "semi-annual": 6,
  annual: 12,
  maturity: 0,
};

export interface Cashflow {
  paymentDate: string;
  days: number;
  amount: number;
  mc: boolean;
  type: string;
  extra: boolean;
  interest: number;
}

export interface CashFlowData {
  dayDiff: number;
  accruedInterest: number;
  totalCost: number;
  cashflow: Cashflow[];
}

interface Input {
  lastCouponReleaseDate: string; // MM/DD/YYYY
  maturityDate: string; // YYYY-MM-DD
  buyDate: string; // YYYY-MM-DD
  cleanPrice: number;
  faceValue: number;
  couponRate: number;
  frequency: FrequencyType;
}

// ✅ Format date to IST in YYYY-MM-DD format
const formatDate = (date: Date): string =>
  date.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

// ✅ Parse MM/DD/YYYY to Date in local timezone (not UTC)
const parseMMDDYYYY = (input: string): Date => {
  const [month, day, year] = input.split("/").map(Number);
  return new Date(year, month - 1, day);
};

// ✅ Days between two dates
const daysBetween = (a: Date, b: Date): number =>
  Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));

// ✅ Returns valid date closest to targetDay in month
const getValidPaymentDate = (
  year: number,
  month: number,
  targetDay: number
): Date => {
  const lastDay = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(targetDay, lastDay));
};

export const getBondCashflowJson = ({
  lastCouponReleaseDate,
  maturityDate,
  buyDate,
  cleanPrice,
  faceValue,
  couponRate,
  frequency,
}: Input) => {
  console.log(
    lastCouponReleaseDate,
    maturityDate,
    buyDate,
    cleanPrice,
    faceValue,
    couponRate,
    frequency
  );

  const start = new Date(buyDate);
  const lastCoupon = parseMMDDYYYY(lastCouponReleaseDate);
  const maturity = new Date(maturityDate);

  const targetDay = lastCoupon.getDate(); // e.g., 29
  let interval = monthInterval[frequency];
  if (frequency == "maturity") {
    interval = Math.ceil(daysBetween(start, maturity) / 30); // Convert days to approximate months
  }
  console.log(frequency);

  const dayDiff = daysBetween(lastCoupon, start);

  const accruedInterest = faceValue * (couponRate / 100) * (dayDiff / 365);
  const totalCost = cleanPrice + accruedInterest;

  const cashflow: Cashflow[] = [];

  let current = new Date(lastCoupon);
  let safetyCounter = 0; // ⛑️ Avoid infinite loop

  while (true) {
    let nextMonth = current.getMonth() + interval;
    let nextYear = current.getFullYear();
    while (nextMonth > 11) {
      nextMonth -= 12;
      nextYear += 1;
    }

    const nextDate = getValidPaymentDate(nextYear, nextMonth, targetDay);

    // 🛑 Safety check 1: Break if loop starts going backward
    if (nextDate <= current) break;

    // ✅ Exit condition
    if (nextDate >= maturity) break;

    const days = daysBetween(current, nextDate);
    const interest = faceValue * (couponRate / 100) * (days / 365);

    cashflow.push({
      paymentDate: formatDate(nextDate),
      days,
      amount: parseFloat(interest.toFixed(2)),
      mc: false,
      type: "Coupon",
      extra: false,
      interest: interest,
    });

    current = nextDate;

    // 🛑 Safety check 2: Max 1000 iterations
    if (++safetyCounter > 1000) {
      console.error(
        "Loop exceeded safe limit. Check bond frequency/date logic."
      );
      break;
    }
  }

  // Final payment at maturity
  const finalDays = daysBetween(current, maturity);
  const finalInterest = faceValue * (couponRate / 100) * (finalDays / 365);

  cashflow.push({
    paymentDate: formatDate(maturity),
    days: finalDays,
    amount: parseFloat(finalInterest.toFixed(2)),
    mc: frequency == "maturity",
    type: "Coupon",
    extra: true,
    interest: finalInterest,
  });

  cashflow.push({
    paymentDate: formatDate(maturity),
    days: finalDays,
    amount: parseFloat(faceValue.toFixed(2)),
    mc: false,
    type: "Principal",
    extra: false,
    interest: finalInterest,
  });

  return {
    dayDiff,
    accruedInterest: parseFloat(accruedInterest.toFixed(8)),
    totalCost: parseFloat(totalCost.toFixed(8)),
    cashflow: [
      {
        paymentDate: formatDate(start),
        days: 0,
        amount: -parseFloat(totalCost.toFixed(2)),
        type: "Investment",
        mc: false,
        extra: false,
        interest: finalInterest,
      },
      ...cashflow,
    ],
  };
};

export const getXirr = (value: CashFlow[]) => {
  try {
    return xirr(value);
  } catch {
    return 0;
  }
};

/**
 * Bond YTM calculation equivalent to Excel's YIELD function
 * Uses Newton-Raphson method to solve for yield to maturity
 */
export function bondYtmExcelEquivalent({
  price, // clean price (e.g. 95)
  faceValue, // usually 100
  couponRate, // annual coupon rate (e.g. 0.06)
  yearsToMaturity,
  frequency, // 1, 2, 4, or 12
}: {
  price: number;
  faceValue: number;
  couponRate: number;
  yearsToMaturity: number;
  frequency: number;
}): number {
  const nper = yearsToMaturity * frequency;
  const coupon = (faceValue * couponRate) / frequency;

  // Initial guess (Excel uses an internal guess; this is stable)
  let rate = 0.05 / frequency;

  const MAX_ITER = 100;
  const TOL = 1e-10;

  for (let i = 0; i < MAX_ITER; i++) {
    let f = -price;
    let df = 0;

    for (let t = 1; t <= nper; t++) {
      const discount = Math.pow(1 + rate, t);

      // Bond pricing function
      f += coupon / discount;

      // Derivative of pricing function
      df -= (t * coupon) / (discount * (1 + rate));
    }

    // Principal repayment
    const principalDiscount = Math.pow(1 + rate, nper);
    f += faceValue / principalDiscount;
    df -= (nper * faceValue) / (principalDiscount * (1 + rate));

    // Newton–Raphson update
    const newRate = rate - f / df;

    if (Math.abs(newRate - rate) < TOL) {
      rate = newRate;
      break;
    }

    rate = newRate;
  }

  // Annualise (same as Excel)
  return rate * frequency;
}

export type XirrResult = ReturnType<typeof getBondCashflowJson>;
