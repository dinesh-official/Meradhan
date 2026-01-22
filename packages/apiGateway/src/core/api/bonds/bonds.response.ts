import type { BaseResponseData, PaginationMeta } from "../../../types/base";

export interface BondDetailsResponse {
  id: number
  isin: string
  bondName: string
  instrumentName: string
  description: string
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
}
export type ListedBondsResponse = BaseResponseData<{
  data: BondDetailsResponse[];
  meta: PaginationMeta;
}>;

export type BondDetailResponse = BaseResponseData<BondDetailsResponse>;
export type LatestBondsResponse = BaseResponseData<BondDetailsResponse[]>;
