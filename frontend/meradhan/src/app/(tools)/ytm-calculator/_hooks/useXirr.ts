import { useEffect, useMemo, useState } from "react";
import {
  formatToMMDDYYYY,
  FrequencyType,
  getBondCashflowJson,
} from "../_helpers/xirr";
import { dateTimeUtils } from "@/global/utils/datetime.utils";

export const useXirr = () => {
  const [faceValue, setFaceValue] = useState("10000");
  const [cleanPrice, setCleanPrice] = useState("9990");
  const [couponRate, setCouponRate] = useState("8.25");
  const [couponFrequency, setCouponFrequency] =
    useState<FrequencyType>("quarterly");
  const [settlementDate, setSettlementDate] = useState("2025-12-10");
  const [maturityDate, setMaturityDate] = useState("2030-12-10");
  const [lastCouponDate, setLastCouponDate] = useState("2025-05-29");

  useEffect(() => {
    setLastCouponDate(dateTimeUtils.formatDateTime(new Date(), "YYYY-MM-DD"));
    setMaturityDate(
      dateTimeUtils.formatDateTime(
        dateTimeUtils.addYears(new Date(), 2),
        "YYYY-MM-DD"
      )
    );
    setSettlementDate(
      dateTimeUtils.formatDateTime(
        dateTimeUtils.addDays(new Date(), -30),
        "YYYY-MM-DD"
      )
    );
  }, []);

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

  const ytmPercent = (Number(faceValue) * Number(couponRate)) / 100;
  console.log(ytmPercent);

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
    ytm: (Number(ytmPercent) / Number(cleanPrice)) * 100,
  };
};
