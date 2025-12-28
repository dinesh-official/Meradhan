import { dateTimeUtils } from "@/global/utils/datetime.utils";
import { useEffect, useMemo, useState } from "react";
import {
  formatToMMDDYYYY,
  FrequencyType,
  getBondCashflowJson,
  getXirr,
  prepareXirrValues,
} from "../_helpers/xirr";

// Map frequency types to numeric values
const frequencyMap: Record<FrequencyType, number> = {
  annual: 1,
  "semi-annual": 2,
  quarterly: 4,
  monthly: 12,
  maturity: 1, // Default to annual for maturity-only bonds
};

export const useXirr = () => {
  const [faceValue, setFaceValue] = useState("1000");
  const [cleanPrice, setCleanPrice] = useState("990");
  const [couponRate, setCouponRate] = useState("8.25");
  const [couponFrequency, setCouponFrequency] =
    useState<FrequencyType>("quarterly");
  // Initialize dates synchronously to avoid validation errors on mount
  const initialMaturityDate = dateTimeUtils.formatDateTime(
    dateTimeUtils.addYears(new Date(), 2),
    "YYYY-MM-DD"
  );
  const initialSettlementDate = dateTimeUtils.formatDateTime(new Date(), "YYYY-MM-DD");
  const initialMaturity = new Date(initialMaturityDate);
  initialMaturity.setHours(0, 0, 0, 0);
  
  // Calculate last coupon date as one coupon period before maturity (not always 1 year)
  const initialLastCouponDate = (() => {
    const monthsBack = 12 / frequencyMap["quarterly"]; // Default to quarterly
    const d = new Date(initialMaturity);
    // Logic to subtract months safely manually here since helper isn't hoisted yet
    // Or just use basic logic for initial state which is likely 2 years ahead so usually safe
    // But better to be consistent.
    const expectedMonth = (d.getMonth() - monthsBack + 1200) % 12;
    d.setMonth(d.getMonth() - monthsBack);
    if (d.getMonth() !== expectedMonth) d.setDate(0);
    return dateTimeUtils.formatDateTime(d, "YYYY-MM-DD");
  })();

  const [settlementDate, setSettlementDate] = useState(initialSettlementDate);
  const [maturityDate, setMaturityDate] = useState(initialMaturityDate);
  const [lastCouponDate, setLastCouponDate] = useState(initialLastCouponDate);
  const [isInitialized, setIsInitialized] = useState(false);

  // Auto-calculate last coupon date when maturity date or frequency changes
  useEffect(() => {
    if (isInitialized && maturityDate && couponFrequency) {
      const maturity = new Date(maturityDate);
      maturity.setHours(0, 0, 0, 0);
      
      // Calculate one coupon period before maturity based on frequency
      const monthsBack = 12 / frequencyMap[couponFrequency];
      const onePeriodBeforeMaturity = subtractMonths(maturity, monthsBack);
      
      setLastCouponDate(
        dateTimeUtils.formatDateTime(onePeriodBeforeMaturity, "YYYY-MM-DD")
      );
    }
  }, [maturityDate, couponFrequency, isInitialized]);

  // Mark as initialized after first render
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Validation functions
  // const isValidNumber = (value: string) => {
  //   const num = parseFloat(value);
  //   return !isNaN(num) && num > 0;
  // };

  // const isValidDate = (dateStr: string) => {
  //   const date = new Date(dateStr);
  //   return !isNaN(date.getTime());
  // };

  // Helper function to normalize dates (remove time component)
  const normalizeDate = (dateStr: string): Date => {
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  // Helper to safely subtract months with end-of-month clamping
  // e.g. Mar 31 - 1 month -> Feb 28 (not Mar 3)
  const subtractMonths = (date: Date, months: number): Date => {
    const d = new Date(date);
    const expectedMonth = (d.getMonth() - months + 1200) % 12; // Handle wrap-around safe
    d.setMonth(d.getMonth() - months);
    
    // Check for overflow (e.g. going from Mar 31 to Feb, results in Mar 2 or 3)
    if (d.getMonth() !== expectedMonth) {
      // Set to last day of previous month (which is the expected month)
      d.setDate(0); 
    }
    return d;
  };

  // Input validation - skip validation until initialization is complete
  const validationErrors = useMemo(() => {
    const errors: string[] = [];

    // Don't validate until initialization is complete
    if (!isInitialized) {
      return errors;
    }

    // Validate dates
    if (maturityDate && lastCouponDate && settlementDate) {
      const maturity = normalizeDate(maturityDate);
      const lastCoupon = normalizeDate(lastCouponDate);
      const settlement = normalizeDate(settlementDate);

      // Calculate one coupon period before maturity date based on frequency
      const monthsBack = 12 / frequencyMap[couponFrequency];
      const onePeriodBeforeMaturity = subtractMonths(maturity, monthsBack);
      onePeriodBeforeMaturity.setHours(0, 0, 0, 0);
      
      // Check if last coupon date is exactly one coupon period before maturity date (allow 1 day tolerance)
      const daysDiff = Math.abs(
        (lastCoupon.getTime() - onePeriodBeforeMaturity.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysDiff > 1) {
        const periodName = couponFrequency === "quarterly" ? "3 months" :
                          couponFrequency === "semi-annual" ? "6 months" :
                          couponFrequency === "monthly" ? "1 month" :
                          couponFrequency === "annual" ? "1 year" : "one period";
        errors.push(
          `Last Coupon Date must be exactly ${periodName} before Maturity Date (${onePeriodBeforeMaturity.toLocaleDateString("en-GB")})`
        );
      }

      // Check if last coupon date is after maturity date
      if (lastCoupon > maturity) {
        errors.push("Last Coupon Date cannot be after Maturity Date");
      }

      // Check if last coupon date is BEFORE settlement date (should be AFTER)
      if (lastCoupon <= settlement) {
        errors.push("Last Coupon Date must be after Purchase/Settlement Date");
      }

      // Check if settlement date is after maturity date
      if (settlement > maturity) {
        errors.push("Purchase/Settlement Date cannot be after Maturity Date");
      }
    }

    return errors;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    faceValue,
    cleanPrice,
    couponRate,
    maturityDate,
    lastCouponDate,
    settlementDate,
    couponFrequency,
    isInitialized,
  ]);

  const flowData = useMemo(() => {
    // Only calculate if there are no validation errors
    if (validationErrors.length > 0) {
      return {
        dayDiff: 0,
        accruedInterest: 0,
        totalCost: 0,
        cashflow: [
          {
            paymentDate: new Date().toISOString().split("T")[0],
            days: 0,
            amount: 0,
            mc: false,
            type: "Investment",
            extra: false,
            interest: 0,
          },
        ],
      };
    }

    try {
      return getBondCashflowJson({
        buyDate: settlementDate, // Already in YYYY-MM-DD format
        cleanPrice: +cleanPrice,
        couponRate: +couponRate,
        faceValue: +faceValue,
        frequency: couponFrequency,
        lastCouponReleaseDate: formatToMMDDYYYY(lastCouponDate), // Convert to MM/DD/YYYY
        maturityDate: maturityDate, // Already in YYYY-MM-DD format
      });
    } catch (error) {
      console.error("Error calculating cash flow:", error);
      return {
        dayDiff: 0,
        accruedInterest: 0,
        totalCost: 0,
        cashflow: [
          {
            paymentDate: new Date().toISOString().split("T")[0],
            days: 0,
            amount: 0,
            mc: false,
            type: "Investment",
            extra: false,
            interest: 0,
          },
        ],
      };
    }
  }, [
    settlementDate,
    cleanPrice,
    couponRate,
    faceValue,
    couponFrequency,
    lastCouponDate,
    maturityDate,
    validationErrors.length,
  ]);

  // Calculate XIRR (Effective Annual Yield) - this is the correct yield for bonds with irregular dates
  const xirrRate = useMemo(() => {
    if (
      !cleanPrice ||
      !faceValue ||
      !couponRate ||
      isNaN(parseFloat(cleanPrice)) ||
      isNaN(parseFloat(faceValue)) ||
      isNaN(parseFloat(couponRate)) ||
      parseFloat(cleanPrice) <= 0 ||
      parseFloat(faceValue) <= 0 ||
      parseFloat(couponRate) <= 0 ||
      !flowData ||
      flowData.cashflow.length === 0
    ) {
      return 0;
    }

    try {
      const xirrValues = prepareXirrValues(flowData.cashflow);
      const xirrResult = getXirr(xirrValues);
      
      // XIRR returns a decimal (e.g., 0.088008), convert to percentage
      return typeof xirrResult === "number" ? xirrResult * 100 : 0;
    } catch (error) {
      console.error("Error calculating XIRR:", error);
      return 0;
    }
  }, [flowData, cleanPrice, faceValue, couponRate]);

  const ytmPercent = (Number(faceValue) * Number(couponRate)) / 100;

  return {
    faceValue,
    setFaceValue,
    cleanPrice,
    setCleanPrice,
    couponRate,
    setCouponRate,
    couponFrequency,
    setCouponFrequency,
    maturityDate,
    setMaturityDate,
    lastCouponDate,
    setLastCouponDate,
    settlementDate,
    setSettlementDate,
    flowData,
    validationErrors,
    isValid: validationErrors.length === 0,
    yieldVal: (Number(ytmPercent) / Number(cleanPrice)) * 100,
    xirrRate, // XIRR (Effective Annual Yield) - use this instead of textbook YTM
  };
};
