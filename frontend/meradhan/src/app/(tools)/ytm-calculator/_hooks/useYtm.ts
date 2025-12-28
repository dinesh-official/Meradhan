import { dateTimeUtils } from "@/global/utils/datetime.utils";
import { useEffect, useMemo, useState } from "react";
import {
  calculateNextCouponDate,
  calculateYtm,
  CouponFrequency,
  DayCountConvention,
  YtmResult,
} from "../_helpers/ytm";

export const useYtm = () => {
  // Input states
  const [faceValue, setFaceValue] = useState("1000");
  const [cleanPrice, setCleanPrice] = useState("990");
  const [couponRate, setCouponRate] = useState("8.25");
  const [couponFrequency, setCouponFrequency] =
    useState<CouponFrequency>("QUARTERLY");
  const [dayCountConvention, setDayCountConvention] =
    useState<DayCountConvention>("ACT_365F");

  // Date states
  const initialSettlementDate = dateTimeUtils.formatDateTime(
    new Date(),
    "YYYY-MM-DD"
  );
  const initialMaturityDate = dateTimeUtils.formatDateTime(
    dateTimeUtils.addYears(new Date(), 2),
    "YYYY-MM-DD"
  );
  const initialIssueDate = dateTimeUtils.formatDateTime(
    dateTimeUtils.addYears(new Date(), -1),
    "YYYY-MM-DD"
  );

  const [settlementDate, setSettlementDate] = useState(initialSettlementDate);
  const [maturityDate, setMaturityDate] = useState(initialMaturityDate);
  const [issueDate, setIssueDate] = useState(initialIssueDate);
  const [lastCouponDate, setLastCouponDate] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState(false);

  // Last Coupon Date is now user-entered only, no auto-calculation
  // Removed auto-calculation - user must enter Last Coupon Date manually

  // Mark as initialized after first render
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Calculate Next Coupon Date
  const nextCouponDate = useMemo(() => {
    if (!lastCouponDate || couponFrequency === "AT_MATURITY") {
      return "";
    }
    return calculateNextCouponDate(lastCouponDate, couponFrequency);
  }, [lastCouponDate, couponFrequency]);

  // Validation
  const validationErrors = useMemo(() => {
    const errors: string[] = [];

    if (!isInitialized) {
      return errors;
    }

    // Validate numeric inputs
    const faceValueNum = parseFloat(faceValue);
    const cleanPriceNum = parseFloat(cleanPrice);
    const couponRateNum = parseFloat(couponRate);

    if (isNaN(faceValueNum) || faceValueNum <= 0) {
      errors.push("Face Value must be greater than 0");
    }

    if (isNaN(cleanPriceNum) || cleanPriceNum <= 0) {
      errors.push("Clean Price must be greater than 0");
    }

    if (isNaN(couponRateNum) || couponRateNum < 0) {
      errors.push("Coupon Rate must be greater than or equal to 0");
    }

    // Validate dates
    if (issueDate && settlementDate && maturityDate) {
      const issue = new Date(issueDate);
      const settlement = new Date(settlementDate);
      const maturity = new Date(maturityDate);

      issue.setHours(0, 0, 0, 0);
      settlement.setHours(0, 0, 0, 0);
      maturity.setHours(0, 0, 0, 0);

      if (settlement < issue) {
        errors.push("Settlement Date must be on or after Issue Date");
      }

      if (maturity <= settlement) {
        errors.push("Maturity Date must be after Settlement Date");
      }

      if (maturity <= issue) {
        errors.push("Maturity Date must be after Issue Date");
      }

      // Validate Last Coupon Date
      if (lastCouponDate && couponFrequency !== "AT_MATURITY") {
        const lastCoupon = new Date(lastCouponDate);
        lastCoupon.setHours(0, 0, 0, 0);

        if (lastCoupon > settlement) {
          errors.push(
            "Last Coupon Date must be on or before Settlement Date"
          );
        }

        if (lastCoupon > maturity) {
          errors.push("Last Coupon Date must be on or before Maturity Date");
        }

        if (lastCoupon < issue) {
          errors.push("Last Coupon Date must be on or after Issue Date");
        }
      }
    }

    return errors;
  }, [
    faceValue,
    cleanPrice,
    couponRate,
    issueDate,
    settlementDate,
    maturityDate,
    lastCouponDate,
    couponFrequency,
    isInitialized,
  ]);

  // Calculate YTM
  const ytmResult = useMemo(() => {
    if (validationErrors.length > 0) {
      return {
        dayDiff: 0,
        accruedInterest: 0,
        dirtyPrice: 0,
        cashflow: [
          {
            paymentDate: settlementDate,
            days: 0,
            amount: 0,
            mc: false,
            type: "Investment",
            extra: false,
            interest: 0,
          },
        ],
        periodicYield: 0,
        nominalAnnualYtm: 0,
        effectiveAnnualYtm: 0,
        lastCouponDate: "",
        nextCouponDate: "",
      };
    }

    try {
      return calculateYtm({
        faceValue: parseFloat(faceValue),
        cleanPrice: parseFloat(cleanPrice),
        couponRate: parseFloat(couponRate),
        issueDate,
        settlementDate,
        maturityDate,
        couponFrequency,
        dayCountConvention,
        lastCouponDate: lastCouponDate || undefined,
      });
    } catch (error) {
      console.error("Error calculating YTM:", error);
      return {
        dayDiff: 0,
        accruedInterest: 0,
        dirtyPrice: 0,
        cashflow: [
          {
            paymentDate: settlementDate,
            days: 0,
            amount: 0,
            mc: false,
            type: "Investment",
            extra: false,
            interest: 0,
          },
        ],
        periodicYield: 0,
        nominalAnnualYtm: 0,
        effectiveAnnualYtm: 0,
        lastCouponDate: "",
        nextCouponDate: "",
      };
    }
  }, [
    faceValue,
    cleanPrice,
    couponRate,
    issueDate,
    settlementDate,
    maturityDate,
    couponFrequency,
    dayCountConvention,
    lastCouponDate,
    validationErrors.length,
  ]);

  // Ensure ytmResult is always defined - create default if needed
  const safeYtmResult: YtmResult = ytmResult || {
    dayDiff: 0,
    accruedInterest: 0,
    dirtyPrice: 0,
    cashflow: [
      {
        paymentDate: settlementDate || new Date().toISOString().split("T")[0],
        days: 0,
        amount: 0,
        mc: false,
        type: "Investment",
        extra: false,
        interest: 0,
      },
    ],
    periodicYield: 0,
    annualYtm: 0,
    lastCouponDate: "",
    nextCouponDate: "",
  };

  return {
    // Inputs
    faceValue,
    setFaceValue,
    cleanPrice,
    setCleanPrice,
    couponRate,
    setCouponRate,
    couponFrequency,
    setCouponFrequency,
    dayCountConvention,
    setDayCountConvention,
    issueDate,
    setIssueDate,
    settlementDate,
    setSettlementDate,
    maturityDate,
    setMaturityDate,
    lastCouponDate,
    setLastCouponDate,
    nextCouponDate,
    // Results
    ytmResult: safeYtmResult,
    validationErrors,
    isValid: validationErrors.length === 0,
  };
};

