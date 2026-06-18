import type { BaseResponseData, PaginationMeta } from "../../../types/base";

export interface BondDetailsResponse {
  id: number
  isin: string
  bondName: string
  instrumentName: string
  description: string
  issuerDescription?: string | null
  issuePrice: number
  faceValue: number
  stampDutyPercentage: number
  allowForPurchase: boolean
  couponRate: number
  interestPaymentFrequency: string
  putCallOptionDetails: string
  certificateNumbers?: string
  totalIssueSize?: number
  registrarDetails: string
  physicalSecurityAddress?: string
  defaultedInRedemption?: string
  debentureTrustee?: string
  creditRatingInfo?: string
  remarks?: string
  taxStatus: string
  creditRating: string
  interestPaymentMode: string
  isListed: string
  ratingAgencyName: string
  ratingDate?: string
  categories: Array<string>
  sectorName: string
  yield: string | number | undefined | null
  lastTradePrice: string | number | undefined | null
  lastTradeYield: string | number | undefined | null
  nextCouponDate: string | number | undefined | null
  modeOfIssuance: string | number | undefined | null
  couponType: string | number | undefined | null
  buyYield: string | number | undefined | null
  providerName: string | number | undefined | null
  providerInterestDate: string | number | undefined | null
  providerQuantity: string | number | undefined | null
  isOngoingDeal: boolean
  providerPrice: string | number | undefined | null
  ignoreAutoUpdate: boolean
  dateOfAllotment: string
  redemptionDate: string
  maturityDate: string
  createdAt: string
  updatedAt: string
  sortedAt: number
  isConvertedDeal: string | number | undefined | null
  allCouponDates?: string[]
  dayConvention?: string | null
  recordDate?: string | null
  recordDays?: number | null
  imDocumentLink?: string | null
  exchangeListedOn?: string | null
  lastCouponDate?: string | null
  isPerpetual?: boolean | null
  bondType?: string | null
  seniority?: string | null
  natureOfInstrument?: string | null
  buyPrice?: number | null
  sellPrice?: number | null
  redemptionType?: string | null
  startDate?: string | null
  endDate?: string | null
  /** ISO timestamp — set when the bond was last saved via the CRM Auto-Update autofill flow. Null if never autofill-saved. */
  autofillSavedAt?: string | null
  /** Units available from the latest CRM inventory upload (0 if none / not in file). */
  crmAvailableQuantity?: number
}
export type ListedBondsResponse = BaseResponseData<{
  data: BondDetailsResponse[];
  meta: PaginationMeta;
}>;

export type BondDetailResponse = BaseResponseData<BondDetailsResponse>;
export type LatestBondsResponse = BaseResponseData<BondDetailsResponse[]>;

/** Server-side bond order pricing (settlement, principal, accrued, stamp duty). */
export interface BondOrderPricingData {
  couponRate: number;
  faceValue: number;
  quantity: number;
  cleanPrice: number;
  dealDate: string;
  dealOrder: "T+0" | "T+1";
  allowTrade: boolean;
  dealDay: string;
  settlementDate: string;
  lastCouponDate: string;
  settlementOrder: "T+0" | "T+1";
  settlementDay: string;
  principalAmount: number;
  accruedInterest: number;
  stampDuty: number;
  noOfAccrualDays: number;
  isUnderShutPeriod: boolean;
  recordDate: string;
  settlementAmount: number;
  /** Indicative yield at checkout (`buyYield` preferred, else listing `yield`). */
  yield?: number;
}

export type BondOrderPricingResponse = BaseResponseData<BondOrderPricingData>;

/** Snapshot from calc.meradhan.co (fields used by CRM bond autofill). */
export interface BondCalcServiceSnapshot {
  accrued_days: number;
  final_price: string;
  final_yield: string;
  final_yield_raw: number;
  total_ai: string;
  settlement_amount: string;
  principal_amount: string;
  total_consideration: string;
  settle_dt: string;
  [key: string]: unknown;
}

export interface BondDealAutofillSuggestions {
  bondName?: string | null;
  creditRating?: string | null;
  /** Coupon schedule as `YYYY-MM-DD` (IST calendar days). */
  allCouponDates?: string[];
  allCouponDatesIst?: string[];
  natureOfInstrument?: "SECURED" | "UNSECURED" | "UNKNOWN" | null;
  maturityDate: string | null;
  dateOfAllotment: string | null;
  lastCouponDate: string;
  nextCouponDate: string;
  recordDate: string | null;
  recordDays: number | null;
  /** Reference coupon-payment `dueDate` (YYYY-MM-DD) */
  dueDate: string | null;
  dayConvention: string | null;
  interestPaymentFrequency: string;
  interestPaymentMode: string;
  faceValue: number;
  couponRate: number;
  buyYield: number | null;
  yield: number;
  sellPrice: number | null;
  /** Set by deal-autofill-calc (`getBondInfoCalcData`); omitted by legacy deal-autofill. */
  isUnderShutPeriod?: boolean;
  /** Bond classification — sourced from the bonds table via deal-autofill-calc. */
  bondType?: string | null;
  /** Debt seniority level — sourced from the bonds table via deal-autofill-calc. */
  seniority?: string | null;
  /** Redemption type string — sourced from the bonds table via deal-autofill-calc. */
  redemptionType?: string | null;
  /** Tax status enum value (e.g. TAXABLE, TAX_FREE) — sourced from the bonds table. */
  taxStatus?: string | null;
  /** Whether the bond is exchange-listed (YES / NO / UNKNOWN) — sourced from the bonds table. */
  isListed?: string | null;
  /** Coupon type string (e.g. Fixed, Floating) — sourced from the bonds table. */
  couponType?: string | null;
  /** Listing category slugs (e.g. ["tax-free", "banks"]) — controls MeraDhan bond listing filters. */
  categories?: string[];
}

export interface BondDealAutofillResponse {
  isin: string;
  quantity: number;
  sources: {
    usedReferenceMetadata: boolean;
    usedCouponSchedule: boolean;
    yieldSource: "override" | "consolidated" | "bonds";
  };
  suggested: BondDealAutofillSuggestions;
  pricing: {
    finalPrice: number | null;
    finalYieldRaw: number;
    settlementAmount: number | null;
    totalAccruedInterest: number | null;
    principalAmount: number | null;
    totalConsideration: number | null;
    calc: BondCalcServiceSnapshot;
  };
  margin: Record<string, unknown>;
}

export type BondDealAutofillApiResponse = BaseResponseData<BondDealAutofillResponse>;

// [Ticket: Maturity and Credit Rating dropdown filters should display only bonds we hold]
// Shape returned by GET /api/bonds/filter-options
export interface BondFilterOptionsData {
  /** Maturity year-buckets that have ≥1 active bond (e.g. ["0-2", "2-5"]) */
  maturity: string[];
  /** Distinct credit-rating values present in active bonds */
  rating: string[];
  /** Distinct tax-status values present in active bonds */
  taxation: string[];
  /** Coupon-rate buckets that have ≥1 active bond (e.g. ["4-7", "8-10"]) */
  coupon: string[];
  /** Distinct interestPaymentMode values (UNKNOWN excluded) */
  interest: string[];
}

export type BondFilterOptionsResponse = BaseResponseData<BondFilterOptionsData>;

export type BondDocumentItem = {
  id: number;
  isin: string;
  name: string;
  fileUrl: string;
  fileName: string | null;
  createdByCrmUserId: number | null;
  createdAt: string;
  updatedAt: string;
};

export type BondDocumentsListResponse = BaseResponseData<{
  documents: BondDocumentItem[];
}>;

export type BondDocumentMutationResponse = BaseResponseData<{
  document: BondDocumentItem;
}>;
