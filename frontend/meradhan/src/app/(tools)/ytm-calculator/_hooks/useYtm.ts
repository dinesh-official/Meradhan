import { useCallback, useEffect, useState } from "react";
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

export type ApiCashflowItem = {
  period: number;
  date: string;
  coupon: string;
  principal: string;
  totalCashflow: string;
};

export const useYtm = () => {
  const { issue, settlement, maturity, lastCoupon, defaultFrequency } =
    defaultDates();
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
  const [result, setResult] = useState<{
    ytm: number;
    xirr: number;
    approximateYtm: number;
    cashflow: ApiCashflowItem[];
    status: boolean;
  }>({
    ytm: 0,
    xirr: 0,
    approximateYtm: 0,
    cashflow: [],
    status: true,
  });

  useEffect(() => {
    const controller = new AbortController();

    const fetchYtm = async () => {
      try {
        const res = await fetch("/api/ytm", {
          method: "POST",
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            faceValue,
            cleanPrice,
            annualCouponRate,
            couponFrequency,
            dayCount,
            issueDate,
            settlementDate,
            maturityDate,
            lastCouponDate,
          }),
        });

        if (!res.ok) {
          throw new Error(`Request failed (${res.status})`);
        }

        const data = (await res.json()) as {
          check: string;
          ytm: string | number;
          approximateYtm: string | number;
          xirr: string | number;
          cashflow: ApiCashflowItem[];
        };

        const toNumeric = (value: string | number) => {
          const parsed = Number(value);
          return Number.isFinite(parsed) ? parsed : NaN;
        };

        setResult({
          ytm: toNumeric(data.ytm),
          xirr: toNumeric(data.xirr),
          cashflow: Array.isArray(data.cashflow) ? data.cashflow : [],
          status: data.check === "OK",
          approximateYtm: toNumeric(data.approximateYtm),
        });
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        console.error(error);
        setResult({
          ytm: NaN,
          xirr: NaN,
          approximateYtm: NaN,
          cashflow: [],
          status: false,
        });
      }
    };

    fetchYtm();

    return () => controller.abort();
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
