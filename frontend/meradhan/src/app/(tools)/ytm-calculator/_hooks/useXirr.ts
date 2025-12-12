import { dateTimeUtils } from "@/global/utils/datetime.utils";
import { RATE } from "@formulajs/formulajs";
import { useEffect, useMemo, useState } from "react";
import {
  formatToMMDDYYYY,
  FrequencyType,
  getBondCashflowJson,
} from "../_helpers/xirr";
import { yearfrac } from "./rate.";

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

  const ytmPercent = (Number(faceValue) * Number(couponRate)) / 100;

  // YEARFRAC (Actual/Actual)
  const yertoMac = yearfrac(
    new Date(settlementDate),
    new Date(maturityDate),
    1
  );

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
    ytm: Number(
      RATE(yertoMac, ytmPercent, -Number(cleanPrice), Number(faceValue)) * 100
    ),
  };
};
