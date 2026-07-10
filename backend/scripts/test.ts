/**
 * Demo / scratch script for shut-period accrual helpers.
 *
 * Pure dates: `resolveShutPeriod` (@services/order/shut-period-accrual)
 * DeriData cashflows: `resolveAccrualDaysFromDailyCashflow`
 *   (@services/order/accrual-days-from-daily-cashflow)
 */
import { resolveShutPeriod } from "../src/services/order/shut-period-accrual";

console.log(
  resolveShutPeriod({
    RECORD_DATE: "2026-07-12",
    NEXT_COUPON_DATE: "2026-07-23",
    SETTLEMENT_DATE: "2026-07-18",
    LAST_COUPON_DATE: "2026-07-11",
  }),
);
