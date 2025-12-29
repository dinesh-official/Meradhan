import { useCallback, useEffect, useState } from "react";
import {
  calculateCompoundReturn,
  calculateDate,
  calculateFraction,
  calculateRate,
  calculateValueNPER,
  calculateYearFraction,
  validateInputs,
} from "./formula";
export const cFrequencyMap = {
  Annual: 1,
  "Semi-Annual": 2,
  Quarterly: 4,
  Monthly: 12,
} as const;

export const dayCountMap = {
  "Actual/Actual": 1,
  "30/360 (US)": 0,
  "Actual/360": 2,
  "Actual/365": 3,
  "30E/360 (EU)": 4,
} as const;

export type T_CF = keyof typeof cFrequencyMap;
export type T_DC = keyof typeof dayCountMap;

const defaultDates = () => {
  const today = new Date();

  const settlement = new Date(today);

  const issue = new Date(today);
  issue.setFullYear(issue.getFullYear() - 1);

  const maturity = new Date(today);
  maturity.setFullYear(maturity.getFullYear() + 2);

  const monthsBackMap: Record<T_CF, number> = {
    Annual: 12,
    "Semi-Annual": 6,
    Quarterly: 3,
    Monthly: 1,
  };

  const defaultFrequency: T_CF = "Quarterly";
  const lastCoupon = new Date(today);
  lastCoupon.setMonth(
    lastCoupon.getMonth() - monthsBackMap[defaultFrequency],
    lastCoupon.getDate()
  );

  return {
    issue,
    settlement,
    maturity,
    lastCoupon,
    defaultFrequency,
  };
};

export const useYtm = () => {
  const {
    issue,
    settlement,
    maturity,
    lastCoupon,
    defaultFrequency,
  } = defaultDates();
  const [faceValue, setFaceValue] = useState<number>(10000);
  const [cleanPrice, setCleanPrice] = useState<number>(9990);
  const [annualCouponRate, setAnnualCouponRate] = useState(8.25);
  const [couponFrequency, setCouponFrequency] =
    useState<T_CF>(defaultFrequency);
  const [dayCount, setDayCount] = useState<T_DC>("Actual/Actual");
  const [issueDate, setIssueDate] = useState<Date>(issue);
  const [settlementDate, setSettlementDate] = useState<Date>(settlement);
  const [maturityDate, setMaturityDate] = useState<Date>(maturity);
  const [lastCouponDate, setLastCouponDateState] = useState<Date>(lastCoupon);
  const setLastCouponDate = useCallback((date: Date) => {
    setLastCouponDateState(date);
  }, []);

  useEffect(() => {
    const paymentsPerYear = cFrequencyMap[couponFrequency];
    if (!paymentsPerYear) return;
    const monthsPerPeriod = 12 / paymentsPerYear;

    let current = new Date(issueDate);
    let last = new Date(issueDate);
    let guard = 0;

    while (guard < 500) {
      const next = new Date(current);
      next.setMonth(next.getMonth() + monthsPerPeriod);
      if (next > settlementDate) break;
      last = next;
      current = next;
      guard += 1;
    }

    setLastCouponDateState(last);
  }, [couponFrequency, issueDate, settlementDate]);

  // RESULT
  const [result, setResult] = useState({
    answer: 0,
    status: true,
  });

  const calculate = useCallback(() => {
    const paymentsPerYear = cFrequencyMap[couponFrequency];
    const YEARFRAC_Basis = dayCountMap[dayCount];

    const monthsPerPeriod = 12 / paymentsPerYear;
    const nextCouponDate = calculateDate(
      lastCouponDate,
      monthsPerPeriod,
      settlementDate
    );

    const yearsToMaturity = calculateYearFraction(
      settlementDate,
      maturityDate,
      YEARFRAC_Basis
    );

    const NPER = calculateValueNPER(
      nextCouponDate,
      maturityDate,
      YEARFRAC_Basis,
      paymentsPerYear
    );
    const PMT = (faceValue * annualCouponRate) / paymentsPerYear;
    const annualCouponAmount = faceValue * YEARFRAC_Basis;
    const accruedFraction = calculateFraction(
      lastCouponDate,
      settlementDate,
      nextCouponDate,
      YEARFRAC_Basis
    );
    const accruedInterest = (PMT * accruedFraction) / 100;
    const dirtyPrice = cleanPrice + accruedInterest;

    const check = validateInputs({
      C10: settlementDate,
      C11: maturityDate,
      C12: lastCouponDate,
      C15: paymentsPerYear,
      C16: monthsPerPeriod,
      C17: YEARFRAC_Basis,
      C18: nextCouponDate,
      C4: faceValue,
      C5: cleanPrice,
      C6: annualCouponRate,
      C9: issueDate,
    });

    const Periodic_R_RATE = calculateRate({
      C26: check,
      C25: Number(dirtyPrice),
      C21: Number(PMT / 100),
      C20: Number(NPER),
      C4: faceValue,
    });

    const data = calculateCompoundReturn({
      C15: paymentsPerYear,
      C26: check,
      I9: Periodic_R_RATE,
    });

    return {
      result: data * 100,
      check: check,
      drived: {
        Periodic_R_RATE,
        paymentsPerYear,
        YEARFRAC_Basis,
        monthsPerPeriod,
        nextCouponDate,
        yearsToMaturity,
        NPER,
        PMT,
        annualCouponAmount,
        accruedFraction,
        accruedInterest,
        dirtyPrice,
      },
    };
  }, [
    annualCouponRate,
    cleanPrice,
    couponFrequency,
    dayCount,
    faceValue,
    issueDate,
    lastCouponDate,
    maturityDate,
    settlementDate,
  ]);

  useEffect(() => {
    try {
      const res = calculate();
      console.log(res);

      setResult({
        answer: res.result,
        status: res.check == "OK",
      });
    } catch (error) {
      console.error(error);
      setResult({
        answer: NaN,
        status: false,
      });
    }
  }, [calculate]);

  return {
    result,
    manager: {
      // state
      faceValue,
      cleanPrice,
      annualCouponRate,
      couponFrequency,
      dayCount,
      issueDate,
      settlementDate,
      lastCouponDate,
      maturityDate,
      // updates
      setAnnualCouponRate,
      setCleanPrice,
      setCouponFrequency,
      setDayCount,
      setFaceValue,
      setIssueDate,
      setLastCouponDate,
      setMaturityDate,
      setSettlementDate,
    },
  };
};
