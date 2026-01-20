import type { BaseResponseData, PaginationMeta } from "../../../types/base";

export interface BondDetailsResponse {
  id: number;
  isin: string;
  bondName: string;
  instrumentName: string;
  description: string;
  issuePrice: number;
  faceValue: number;
  stampDutyPercentage: number | null;
  allowForPurchase: boolean | null;
  couponRate: number;
  interestPaymentFrequency: string;
  putCallOptionDetails: string;
  certificateNumbers: string;
  totalIssueSize: number;
  registrarDetails: string;
  physicalSecurityAddress: string;
  defaultedInRedemption: string;
  debentureTrustee: string;
  creditRatingInfo: string;
  remarks: string;
  taxStatus: string;
  creditRating: string;
  interestPaymentMode: string;
  isListed: string;
  ratingAgencyName: string;
  ratingDate: string;
  categories: Array<string>;
  sectorName: string;
  dateOfAllotment: string;
  redemptionDate: string;
  maturityDate: string;
  createdAt: string;
  updatedAt: string;
  sortedAt: number;
  isConvertedDeal: boolean | null;
  yield: number | null;
  lastTradePrice: number | null;
  lastTradeYield: number | null;
  nextCouponDate: string | null;
  modeOfIssuance: string | null;
  couponType: string | null;
  buyYield: number | null;
  providerName: string | null;
  providerInterestDate: string | null;
  providerQuantity: number | null;
  isOngoingDeal: boolean | null;
  providerPrice: number | null;
  ignoreAutoUpdate: boolean | null;
}

export type ListedBondsResponse = BaseResponseData<{
  data: BondDetailsResponse[];
  meta: PaginationMeta;
}>;

export type BondDetailResponse = BaseResponseData<BondDetailsResponse>;
export type LatestBondsResponse = BaseResponseData<BondDetailsResponse[]>;
