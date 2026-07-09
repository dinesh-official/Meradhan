import {
  addWorkingDays,
  type ExchangeHolidaySet,
  nextWorkingDay,
} from "@/global/utils/datetime.utils";

export type SettlementType = "0" | "1";

export function getPlaceOrderBusinessDates(
  holidays: ExchangeHolidaySet,
  settlementType: SettlementType = "1",
  baseDate: Date = new Date()
): {
  dealDate: Date;
  settlementDate: Date;
} {
  const dealDate = nextWorkingDay(baseDate, holidays);
  const settlementDate =
    settlementType === "0" ? dealDate : addWorkingDays(dealDate, 1, holidays);
  return { dealDate, settlementDate };
}

