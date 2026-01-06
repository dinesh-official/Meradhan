import {
  calculateCompoundReturn,
  calculateDate,
  calculateFraction,
  calculateRate,
  calculateValueNPER,
  calculateYearFraction,
  validateInputs,
} from "./formula";

const couponFrequency = {
  Annual: 1,
  "Semi-Annual": 2,
  Quarterly: 4,
  Monthly: 12,
} as const;

const dayCount = {
  "Actual/Actual": 1,
  "30/360 (US)": 0,
  "Actual/360": 2,
  "Actual/365": 3,
  "30E/360 (EU)": 4,
} as const;

export type YtmInput = {
  faceValue: number;
  cleanPrice: number;
  annualCouponRate: number;
  couponFrequency: keyof typeof couponFrequency;
  dayCount: keyof typeof dayCount;
  issueDate: Date;
  settlementDate: Date;
  maturityDate: Date;
  lastCouponDate: Date;
};

export type YtmResult = {
  result: number | "ERROR";
  check: "OK" | "CHECK INPUTS";
  drived: {
    Periodic_R_RATE: number;
    paymentsPerYear: number;
    YEARFRAC_Basis: number;
    monthsPerPeriod: number;
    nextCouponDate: Date;
    yearsToMaturity: number;
    NPER: number;
    PMT: number;
    annualCouponAmount: number;
    accruedFraction: number;
    accruedInterest: number;
    dirtyPrice: number;
  };
};

export function calculateYtm(params: YtmInput): YtmResult {
  const {
    faceValue,
    cleanPrice,
    annualCouponRate,
    couponFrequency: couponFreq,
    dayCount: dayCountKey,
    issueDate,
    settlementDate,
    maturityDate,
    lastCouponDate,
  } = params;

  const paymentsPerYear = couponFrequency[couponFreq];
  const YEARFRAC_Basis = dayCount[dayCountKey];

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
    result: typeof data === "number" ? data * 100 : "ERROR",
    check,
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
}
