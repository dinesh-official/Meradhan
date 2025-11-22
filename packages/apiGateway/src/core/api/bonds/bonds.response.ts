import type { BaseResponseData, PaginationMeta } from "../../../types/base";

export interface BondDetailsResponse {
  id: number;
  isin: string;
  bondName: string;
  instrumentName: string;
  description: string;
  issuePrice: number;
  faceValue: number;
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
}

export type ListedBondsResponse = BaseResponseData<{
  data: BondDetailsResponse[];
  meta: PaginationMeta;
}>;

export type BondDetailResponse = BaseResponseData<BondDetailsResponse>;
export type LatestBondsResponse = BaseResponseData<BondDetailsResponse[]>;
