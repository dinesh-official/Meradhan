/** Truncates toward zero to 2 decimal places (e.g. 0.09999999 → 0.09, not 0.10). */

const MS_PER_DAY = 86_400_000;

/** Calendar days from `startYmd` to `endYmd` (`YYYY-MM-DD`). */
const daysBetween = (startYmd: string, endYmd: string): number => {
  const utc = (ymd: string) =>
    Date.UTC(
      Number(ymd.slice(0, 4)),
      Number(ymd.slice(5, 7)) - 1,
      Number(ymd.slice(8, 10)),
    );
  return Math.round((utc(endYmd) - utc(startYmd)) / MS_PER_DAY);
};

 const calculateStampDuty = (faceValue: number, quantity: number) => {
  const rawStampDuty = faceValue * quantity * 0.000001;
  const stampDuty =
    rawStampDuty < 0.5 ? 0 : rawStampDuty < 1.5 ? 1 : rawStampDuty;  
  const totalAmount = faceValue * quantity + stampDuty;
  return totalAmount;
 }


 const principalAmount = (faceValue: number, quantity: number, cleanPrice: number) => {
  const quantumPrice= faceValue * quantity;
  const quantumPriceInCrores = (quantumPrice * (cleanPrice / 100)).toString();  
  const quantumPriceInCroresString = quantumPriceInCrores.split(".")?.[0] + "." + (quantumPriceInCrores.split(".")?.[1]?.slice(0, 2) ?? "00");
  return Number(quantumPriceInCroresString);
 }

/**
 * Accrued coupon for the period from `lastCouponDate` to `settlementDate` (ACT/365).
 * `couponRate` is annual % of face (e.g. 7.5 for 7.5% p.a.).
 */
const accruedInterest = (
  faceValue: number,
  quantity: number,
  couponRate: number,
  lastCouponDate: string,
  settlementDate: string,
) => {
  const quantumPrice = faceValue * quantity;
  const annualCoupon = quantumPrice * (couponRate / 100);
  const daysAccrued = daysBetween(lastCouponDate, settlementDate);
  const raw = annualCoupon * (daysAccrued / 365);
  return (raw);
 };

 console.log(
  accruedInterest(100000, 1, 7.5, "2026-01-01", "2026-02-01"),
 );
 



 function isUnderShutPeriod(
  settlementDate: Date,
  nextCouponDate: Date,
  recordDays: number
): { isUnderShutPeriod: boolean; recordDate: Date; noOfAccrualDays: number } {
  
  // Calculate record date
  const recordDate = new Date(nextCouponDate);
  recordDate.setDate(recordDate.getDate() - recordDays);

  // Condition: recordDate <= settlementDate < nextCouponDate
  const isUnderShutPeriod =
    settlementDate >= recordDate && settlementDate < nextCouponDate;

  // Calculate accrual days
  const msPerDay = 1000 * 60 * 60 * 24;
  const noOfAccrualDays = Math.floor(
    (nextCouponDate.getTime() - settlementDate.getTime()) / msPerDay
  );

  return {
    isUnderShutPeriod,
    recordDate,
    noOfAccrualDays,
  };
}

console.log(isUnderShutPeriod(new Date("2026-03-18"), new Date("2026-04-06"), 19));