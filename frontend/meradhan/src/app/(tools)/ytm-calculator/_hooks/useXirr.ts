import { dateTimeUtils } from "@/global/utils/datetime.utils";
import { useEffect, useMemo, useState } from "react";
import {
  formatToMMDDYYYY,
  FrequencyType,
  getBondCashflowJson,
  bondYtmExcelEquivalent,
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
  const [settlementDate, setSettlementDate] = useState(
    dateTimeUtils.formatDateTime(
      dateTimeUtils.addDays(new Date(), -30),
      "YYYY-MM-DD"
    )
  );
  const [maturityDate, setMaturityDate] = useState(
    dateTimeUtils.formatDateTime(
      dateTimeUtils.addDays(new Date(), -30),
      "YYYY-MM-DD"
    )
  );
  const [lastCouponDate, setLastCouponDate] = useState(
    dateTimeUtils.formatDateTime(
      dateTimeUtils.addDays(new Date(), -30),
      "YYYY-MM-DD"
    )
  );

  useEffect(() => {
    setLastCouponDate(
      dateTimeUtils.formatDateTime(
        dateTimeUtils.addDays(new Date(), -30),
        "YYYY-MM-DD"
      )
    );
    setMaturityDate(
      dateTimeUtils.formatDateTime(
        dateTimeUtils.addYears(new Date(), 2),
        "YYYY-MM-DD"
      )
    );
    setSettlementDate(dateTimeUtils.formatDateTime(new Date(), "YYYY-MM-DD"));
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

  // Input validation
  const validationErrors = useMemo(() => {
    const errors: string[] = [];

    return errors;
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Calculate years to maturity: maturity = (MaturityDate - SettlementDate) / 365
  const yearsToMaturity = useMemo(() => {
    const settlement = new Date(settlementDate);
    const maturity = new Date(maturityDate);
    const diffTime = maturity.getTime() - settlement.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays / 365;
  }, [settlementDate, maturityDate]);

  // Calculate YTM using the bond YTM Excel equivalent function
  const ytm = useMemo(() => {
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
      yearsToMaturity <= 0
    ) {
      return 0;
    }

    try {
      const price = parseFloat(cleanPrice);
      const fv = parseFloat(faceValue);
      const rate = parseFloat(couponRate) / 100; // Convert percentage to decimal
      const frequency = frequencyMap[couponFrequency];

      const ytmValue = bondYtmExcelEquivalent({
        price,
        faceValue: fv,
        couponRate: rate,
        yearsToMaturity,
        frequency,
      });

      return ytmValue * 100; // Convert to percentage
    } catch (error) {
      console.error("Error calculating YTM:", error);
      return 0;
    }
  }, [cleanPrice, faceValue, couponRate, yearsToMaturity, couponFrequency]);

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
    ytm,
  };
};
