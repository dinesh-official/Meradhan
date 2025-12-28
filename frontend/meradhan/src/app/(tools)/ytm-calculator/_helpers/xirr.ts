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
  // Filter out only the extra rows that are truly not part of cashflow
  // Keep all real cashflows: Investment, Coupons, and Principal
  const filtered = data.filter((e) => !e.extra);

  // Map to XIRR format - DO NOT add interest to principal
  // Interest is already included as separate coupon rows
  const filterData = filtered.map((e) => {
    return {
      date: new Date(e.paymentDate),
      amount: Number(e.amount.toFixed(2)),
    };
  });

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

// ✅ Parse YYYY-MM-DD or MM/DD/YYYY to Date in local timezone (midnight)
const parseDateLocal = (dateStr: string): Date => {
  if (!dateStr) return new Date();

  // Handle YYYY-MM-DD
  if (dateStr.includes("-")) {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  // Handle MM/DD/YYYY
  if (dateStr.includes("/")) {
    const [m, d, y] = dateStr.split("/").map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date(dateStr);
};

// ✅ Parse MM/DD/YYYY to Date in local timezone (not UTC) - Legacy wrapper
const parseMMDDYYYY = (input: string): Date => {
  return parseDateLocal(input);
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

  const start = parseDateLocal(buyDate);
  const lastCoupon = parseDateLocal(lastCouponReleaseDate);
  const maturity = parseDateLocal(maturityDate);

  const targetDay = lastCoupon.getDate(); // e.g., 27
  let interval = monthInterval[frequency];
  if (frequency == "maturity") {
    interval = Math.ceil(daysBetween(start, maturity) / 30); // Convert days to approximate months
  }
  console.log(frequency);

  // Find the coupon date immediately before settlement date
  // Calculate directly based on settlement date and coupon frequency
  let couponBeforeSettlement: Date | null = null;

  if (start <= lastCoupon) {
    // Settlement is before or on last coupon date
    // Calculate the coupon date directly from settlement date
    const settlementMonth = start.getMonth(); // 0-indexed (0=Jan, 11=Dec)
    const settlementYear = start.getFullYear();
    const settlementDay = start.getDate();

    // Find the coupon month in the current period
    // For quarterly: find which quarter (Mar/Jun/Sep/Dec) settlement falls in
    // For semi-annual: find which half (Jun/Dec) settlement falls in
    // For monthly: use current month
    // For annual: use December

    let couponMonth: number;
    let couponYear = settlementYear;

    if (interval === 3) {
      // Quarterly: Mar(2), Jun(5), Sep(8), Dec(11)
      if (settlementMonth < 3) couponMonth = 11; // Dec of previous year
      else if (settlementMonth < 6) couponMonth = 2; // Mar
      else if (settlementMonth < 9) couponMonth = 5; // Jun
      else if (settlementMonth < 12) couponMonth = 8; // Sep
      else couponMonth = 11; // Dec

      // If we're in Dec and day is before target, or if we're before the coupon month, go to previous quarter
      if (
        (settlementMonth === couponMonth && settlementDay < targetDay) ||
        settlementMonth < couponMonth
      ) {
        couponMonth -= 3;
        if (couponMonth < 0) {
          couponMonth += 12;
          couponYear -= 1;
        }
      }
    } else if (interval === 6) {
      // Semi-annual: Jun(5), Dec(11)
      couponMonth = settlementMonth < 6 ? 11 : 5; // Dec or Jun
      if (
        (settlementMonth === couponMonth && settlementDay < targetDay) ||
        settlementMonth < couponMonth
      ) {
        couponMonth -= 6;
        if (couponMonth < 0) {
          couponMonth += 12;
          couponYear -= 1;
        }
      }
    } else if (interval === 1) {
      // Monthly: use previous month if day < target, otherwise current month
      couponMonth =
        settlementDay < targetDay ? settlementMonth - 1 : settlementMonth;
      if (couponMonth < 0) {
        couponMonth += 12;
        couponYear -= 1;
      }
    } else {
      // Annual: December
      couponMonth = 11; // December
      if (
        settlementMonth < 11 ||
        (settlementMonth === 11 && settlementDay < targetDay)
      ) {
        couponYear -= 1;
      }
    }

    const calculatedCouponDate = getValidPaymentDate(
      couponYear,
      couponMonth,
      targetDay
    );

    // Verify this coupon date is before settlement
    if (calculatedCouponDate < start) {
      couponBeforeSettlement = calculatedCouponDate;
    } else {
      // If calculated date is not before settlement, go back one more period
      couponMonth -= interval;
      if (couponMonth < 0) {
        couponMonth += 12;
        couponYear -= 1;
      }
      const prevCouponDate = getValidPaymentDate(
        couponYear,
        couponMonth,
        targetDay
      );
      if (prevCouponDate < start) {
        couponBeforeSettlement = prevCouponDate;
      }
    }
  } else {
    // Settlement is after last coupon date
    couponBeforeSettlement = lastCoupon;
  }

  // Calculate accrued interest
  // Excel Formula: FaceValue * CouponRate * (Days since last coupon / 365)
  // Uses Actual/365 day count convention
  let accruedInterest = 0;
  let dayDiff = 0;

  if (couponBeforeSettlement) {
    dayDiff = daysBetween(couponBeforeSettlement, start);
    if (dayDiff > 0) {
      accruedInterest = faceValue * (couponRate / 100) * (dayDiff / 365);
    }
  }

  const totalCost = cleanPrice + accruedInterest;

  const cashflow: Cashflow[] = [];

  // Find the starting point for coupon generation
  // Start from the first coupon date AFTER settlement date
  let current: Date;

  if (start <= lastCoupon) {
    // Settlement is before or on last coupon date
    // Find first coupon date after settlement
    current = new Date(lastCoupon);
    let safetyCounter = 0;

    // Work backwards to find the coupon date before settlement, then go forward one interval
    let tempDate = new Date(lastCoupon);
    while (tempDate > start && safetyCounter < 1000) {
      let prevMonth = tempDate.getMonth() - interval;
      let prevYear = tempDate.getFullYear();

      while (prevMonth < 0) {
        prevMonth += 12;
        prevYear -= 1;
      }

      const prevDate = getValidPaymentDate(prevYear, prevMonth, targetDay);

      if (prevDate <= start) {
        // Found coupon before settlement, next coupon is after settlement
        let nextMonth = prevDate.getMonth() + interval;
        let nextYear = prevDate.getFullYear();
        while (nextMonth > 11) {
          nextMonth -= 12;
          nextYear += 1;
        }
        current = getValidPaymentDate(nextYear, nextMonth, targetDay);
        break;
      }

      tempDate = prevDate;
      safetyCounter++;
    }

    // If we couldn't find it, start from lastCoupon
    if (!current || current <= start) {
      current = new Date(lastCoupon);
    }
  } else {
    // Settlement is after last coupon date, start from first coupon after lastCoupon
    let nextMonth = lastCoupon.getMonth() + interval;
    let nextYear = lastCoupon.getFullYear();
    while (nextMonth > 11) {
      nextMonth -= 12;
      nextYear += 1;
    }
    current = getValidPaymentDate(nextYear, nextMonth, targetDay);
  }

  let safetyCounter = 0; // ⛑️ Avoid infinite loop

  // Track previous coupon date for day count calculation
  // Initialize with the coupon date immediately preceding settlement
  // If no coupon before settlement (new issue), use start date?
  // Standard bond math usually assumes a "theoretical" previous coupon date if settlement is in first period.
  // We calculated couponBeforeSettlement above, so use that.
  let previousCouponDate = couponBeforeSettlement || start;

  while (true) {
    // Skip coupons that are before or on settlement date
    if (current <= start) {
      // If we are skipping this coupon, it becomes the "previous" coupon for the next one
      // But only if it's the one immediately preceding the first valid coupon.
      // Actually, couponBeforeSettlement should already cover this.
      // Just ensure we update previousCouponDate if we skip?
      // No, couponBeforeSettlement is specifically the one before settlement.

      // However, if 'current' iterates through past coupons, we need to advance 'current'
      // until it is > start.

      let nextMonth = current.getMonth() + interval;
      let nextYear = current.getFullYear();
      while (nextMonth > 11) {
        nextMonth -= 12;
        nextYear += 1;
      }
      // Update previousCouponDate to the skipped coupon effectively?
      // The logic below uses daysBetween(previousCouponDate, current).
      // If we skip 'current', we shouldn't use it as previous for the *next* iteration
      // UNLESS it is the one immediately before the first valid coupon.

      // Let's stick to the user's logic:
      // The loop should iterate through ALL coupons, but we only PUSH cashflows that are > start.
      // But 'days' calculation depends on the *actual* previous coupon.

      // Better approach: Calculate days for EVERY coupon, but only push if date > start.
      // But 'couponBeforeSettlement' is already the one before settlement.
      // So 'current' starts as the first coupon AFTER settlement (mostly).

      // Let's advance 'current' to be the first coupon > settlement, as we did in the finding logic.
      // The finding logic block above sets 'current' to the first coupon date > settlement (or start).
      // So we don't need to skip inside the loop if 'current' is already set correctly.

      // The 'finding logic' above:
      // if (start <= lastCoupon) { ... finds couponBeforeSettlement ... current = next coupon ... }
      // else { ... current = next coupon after lastCoupon ... }

      // So 'current' IS already the first coupon after settlement.
      // We might not need the "if (current <= start)" check if the setup is correct.
      // But let's keep a safety check.

      if (current <= start) {
        // This shouldn't happen with the logic above, but if it does:
        previousCouponDate = current;

        let nextMonth = current.getMonth() + interval;
        let nextYear = current.getFullYear();
        while (nextMonth > 11) {
          nextMonth -= 12;
          nextYear += 1;
        }
        current = getValidPaymentDate(nextYear, nextMonth, targetDay);
        continue;
      }
    }

    // ✅ Exit condition - reached or passed maturity
    if (current > maturity) break;

    // If current coupon is exactly on maturity date, handle it in final payment section
    if (current.getTime() === maturity.getTime()) {
      break;
    }

    const couponDays = daysBetween(previousCouponDate, current);
    const couponInterest = faceValue * (couponRate / 100) * (couponDays / 365);

    cashflow.push({
      paymentDate: formatDate(current),
      days: couponDays,
      amount: parseFloat(couponInterest.toFixed(2)),
      mc: false,
      type: "Coupon",
      extra: false,
      interest: couponInterest,
    });

    // Update previous coupon date for next iteration
    previousCouponDate = current;

    // Move to next coupon date
    let nextMonth = current.getMonth() + interval;
    let nextYear = current.getFullYear();
    while (nextMonth > 11) {
      nextMonth -= 12;
      nextYear += 1;
    }
    current = getValidPaymentDate(nextYear, nextMonth, targetDay);

    // 🛑 Safety check 2: Max 1000 iterations
    if (++safetyCounter > 1000) {
      console.error(
        "Loop exceeded safe limit. Check bond frequency/date logic."
      );
      break;
    }
  }

  // Final payment at maturity
  // Calculate days from last coupon payment to maturity
  const lastCouponPaymentDate = previousCouponDate;

  const finalDays = daysBetween(lastCouponPaymentDate, maturity);
  const finalInterest = faceValue * (couponRate / 100) * (finalDays / 365);

  // For maturity-only bonds, combine interest and principal into one payment
  if (frequency === "maturity") {
    cashflow.push({
      paymentDate: formatDate(maturity),
      days: finalDays,
      amount: parseFloat((faceValue + finalInterest).toFixed(2)),
      mc: true,
      type: "Principal",
      extra: false,
      interest: finalInterest,
    });
  } else {
    // For regular bonds, separate final coupon and principal
    // Final coupon is a real cashflow - include it in XIRR
    cashflow.push({
      paymentDate: formatDate(maturity),
      days: finalDays,
      amount: parseFloat(finalInterest.toFixed(2)),
      mc: false,
      type: "Coupon",
      extra: false, // This is a real cashflow, include in XIRR
      interest: finalInterest,
    });

    // Principal repayment
    cashflow.push({
      paymentDate: formatDate(maturity),
      days: finalDays,
      amount: parseFloat(faceValue.toFixed(2)),
      mc: false,
      type: "Principal",
      extra: false,
      interest: 0, // Principal doesn't have interest
    });
  }

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
