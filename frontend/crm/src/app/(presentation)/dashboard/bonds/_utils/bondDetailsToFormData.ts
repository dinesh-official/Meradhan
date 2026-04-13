import type { BondDetailsResponse } from "@root/apiGateway";
import { appSchema } from "@root/schema";
import type { z } from "zod";
import { parseApiDateStringToLocalDate } from "./bondCalendarDates";

export type BondFormData = z.infer<typeof appSchema.bonds.bondCreateUpdateSchema>;

function num(v: unknown, fallback = 0): number {
  if (v == null || v === "") return fallback;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

/** Maps API bond detail to full create/update payload (same shape as BondForm defaultValues). */
export function bondDetailsResponseToFormData(
  initialData: BondDetailsResponse,
): BondFormData {
  return {
    isin: initialData.isin,
    bondName: initialData.bondName,
    instrumentName: initialData.instrumentName,
    description: initialData.description,
    issuePrice: num(initialData.issuePrice),
    faceValue: num(initialData.faceValue),
    stampDutyPercentage: num(initialData.stampDutyPercentage, 0),
    allowForPurchase: initialData.allowForPurchase ?? false,
    couponRate: num(initialData.couponRate),
    interestPaymentFrequency: initialData.interestPaymentFrequency,
    putCallOptionDetails: initialData.putCallOptionDetails || undefined,
    certificateNumbers: initialData.certificateNumbers || undefined,
    totalIssueSize: initialData.totalIssueSize ?? undefined,
    registrarDetails: initialData.registrarDetails || undefined,
    physicalSecurityAddress: initialData.physicalSecurityAddress || undefined,
    defaultedInRedemption: initialData.defaultedInRedemption || undefined,
    debentureTrustee: initialData.debentureTrustee || undefined,
    creditRatingInfo: initialData.creditRatingInfo || undefined,
    remarks: initialData.remarks || undefined,
    taxStatus: initialData.taxStatus as BondFormData["taxStatus"],
    creditRating: initialData.creditRating,
    interestPaymentMode: initialData.interestPaymentMode as BondFormData["interestPaymentMode"],
    isListed: initialData.isListed as BondFormData["isListed"],
    ratingAgencyName: initialData.ratingAgencyName || undefined,
    ratingDate: initialData.ratingDate
      ? parseApiDateStringToLocalDate(String(initialData.ratingDate))
      : undefined,
    categories: initialData.categories || [],
    sectorName: initialData.sectorName || undefined,
    dateOfAllotment: initialData.dateOfAllotment
      ? parseApiDateStringToLocalDate(String(initialData.dateOfAllotment))
      : undefined,
    redemptionDate: initialData.redemptionDate
      ? parseApiDateStringToLocalDate(String(initialData.redemptionDate))
      : undefined,
    maturityDate: initialData.maturityDate
      ? parseApiDateStringToLocalDate(String(initialData.maturityDate))
      : undefined,
    sortedAt: initialData.sortedAt || 0,
    isConvertedDeal: initialData.isConvertedDeal ?? undefined,
    yield: initialData.yield != null ? num(initialData.yield) : undefined,
    lastTradePrice:
      initialData.lastTradePrice != null ? num(initialData.lastTradePrice) : undefined,
    lastTradeYield:
      initialData.lastTradeYield != null ? num(initialData.lastTradeYield) : undefined,
    nextCouponDate: initialData.nextCouponDate
      ? parseApiDateStringToLocalDate(String(initialData.nextCouponDate))
      : undefined,
    modeOfIssuance: initialData.modeOfIssuance != null
      ? String(initialData.modeOfIssuance)
      : undefined,
    couponType:
      initialData.couponType != null ? String(initialData.couponType) : undefined,
    buyYield: initialData.buyYield != null ? num(initialData.buyYield) : undefined,
    providerName:
      initialData.providerName != null ? String(initialData.providerName) : undefined,
    providerInterestDate: initialData.providerInterestDate
      ? parseApiDateStringToLocalDate(String(initialData.providerInterestDate))
      : undefined,
    providerQuantity:
      initialData.providerQuantity != null ? num(initialData.providerQuantity) : undefined,
    isOngoingDeal: initialData.isOngoingDeal ?? false,
    providerPrice:
      initialData.providerPrice != null ? num(initialData.providerPrice) : undefined,
    ignoreAutoUpdate: initialData.ignoreAutoUpdate ?? false,
    allCouponDates: (initialData.allCouponDates ?? []).map((d) =>
      typeof d === "string"
        ? parseApiDateStringToLocalDate(d)
        : d instanceof Date
          ? d
          : parseApiDateStringToLocalDate(String(d)),
    ),
    dayConvention: initialData.dayConvention || undefined,
    recordDate: initialData.recordDate
      ? parseApiDateStringToLocalDate(String(initialData.recordDate))
      : undefined,
    recordDays: initialData.recordDays ?? undefined,
    imDocumentLink: initialData.imDocumentLink || undefined,
    exchangeListedOn:
      (initialData.exchangeListedOn as BondFormData["exchangeListedOn"]) || undefined,
    lastCouponDate: initialData.lastCouponDate
      ? parseApiDateStringToLocalDate(String(initialData.lastCouponDate))
      : undefined,
    isPerpetual: initialData.isPerpetual ?? undefined,
    bondType: (initialData.bondType as BondFormData["bondType"]) || undefined,
    seniority: (initialData.seniority as BondFormData["seniority"]) || undefined,
    natureOfInstrument:
      (initialData.natureOfInstrument as BondFormData["natureOfInstrument"]) ||
      undefined,
    buyPrice: initialData.buyPrice ?? undefined,
    sellPrice: initialData.sellPrice ?? undefined,
    redemptionType: initialData.redemptionType || undefined,
    startDate: initialData.startDate
      ? parseApiDateStringToLocalDate(String(initialData.startDate))
      : undefined,
    endDate: initialData.endDate
      ? parseApiDateStringToLocalDate(String(initialData.endDate))
      : undefined,
  };
}
