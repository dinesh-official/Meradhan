import { useMemo, useState } from "react";
import {
  formatToMMDDYYYY,
  FrequencyType,
  getBondCashflowJson,
} from "../_helpers/xirr";

export const useXirr = () => {
  const [faceValue, setFaceValue] = useState("10000");
  const [cleanPrice, setCleanPrice] = useState("9990");
  const [couponRate, setCouponRate] = useState("8.25");
  const [couponFrequency, setCouponFrequency] =
    useState<FrequencyType>("quarterly");
  const [maturityDate, setMaturityDate] = useState("2027-05-29");
  const [lastCouponDate, setLastCouponDate] = useState("2025-05-29");
  const [settlementDate, setSettlementDate] = useState("2025-07-01");

  // Validation functions
  const isValidNumber = (value: string) => {
    const num = parseFloat(value);
    return !isNaN(num) && num > 0;
  };

  const isValidDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  };

  // Input validation
  const validationErrors = useMemo(() => {
    const errors: string[] = [];

    // Date logic validation
    if (isValidDate(settlementDate) && isValidDate(maturityDate)) {
      if (new Date(settlementDate) >= new Date(maturityDate)) {
        errors.push("Settlement date must be before maturity date");
      }
    }

    if (isValidDate(lastCouponDate) && isValidDate(settlementDate)) {
      if (new Date(lastCouponDate) > new Date(settlementDate)) {
        errors.push(
          "Last coupon date must be before or equal to settlement date"
        );
      }
    }

    return errors;
  }, [
    faceValue,
    cleanPrice,
    couponRate,
    maturityDate,
    lastCouponDate,
    settlementDate,
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
        buyDate: formatToMMDDYYYY(settlementDate),
        cleanPrice: +cleanPrice,
        couponRate: +couponRate,
        faceValue: +faceValue,
        frequency: couponFrequency,
        lastCouponReleaseDate: formatToMMDDYYYY(lastCouponDate),
        maturityDate: formatToMMDDYYYY(maturityDate),
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
  };
};
