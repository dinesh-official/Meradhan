import type { BaseResponseData } from "../../../../types/base";

export interface PortfolioAverageMaturity {
  years: number;
  months: number;
  formatted: string;
}

export interface PortfolioAverageYield {
  value: number;
  formatted: string;
}

export interface PortfolioSummaryResponse {
  investedAmount: number;
  currency: string;
  averageMaturity: PortfolioAverageMaturity;
  numberOfBonds: number;
  averageYield: PortfolioAverageYield;
}

export type GetPortfolioSummaryResponse =
  BaseResponseData<PortfolioSummaryResponse>;

export interface IssuerAllocationItem {
  issuerType: string;
  bondCount: number;
  investedAmount: number;
}

export interface InvestmentByIssuerTypeResponse {
  totalInvestment: number;
  issuerAllocation: IssuerAllocationItem[];
}

export type GetInvestmentByIssuerTypeResponse =
  BaseResponseData<InvestmentByIssuerTypeResponse>;

export interface InvestmentByRatingItem {
  rating: string;
  bondCount: number;
  totalInvestment: number;
}

export type GetInvestmentByRatingResponse =
  BaseResponseData<InvestmentByRatingItem[]>;

export interface InvestmentAllocationItem {
  isin: string;
  bondName: string | null;
  investedAmount: number;
  allocationPercentage: number;
}

export type GetInvestmentAllocationResponse =
  BaseResponseData<InvestmentAllocationItem[]>;

export interface InvestmentByMaturityItem {
  bucket: string;
  investedAmount: number;
  percentage: number;
}

export type GetInvestmentByMaturityResponse =
  BaseResponseData<InvestmentByMaturityItem[]>;

export interface PortfolioDetailsBond {
  id: number;
  securityName: string;
  isin: string;
  bondType: string | null;
  coupon: number;
  investmentAmount: number;
  quantity: number;
  interestFrequency: string | null;
  maturityDate: string | null;
  faceValue: number;
  createdAt: string;
  instrumentName: string | null;
  description: string | null;
  creditRating: string | null;
  sectorName: string | null;
  taxStatus: string | null;
  yieldToMaturity: number | null;
  yield: number | null;
  lastTradeYield: number | null;
  lastTradePrice: number | null;
  modeOfIssuance: string | null;
  couponType: string | null;
  dateOfAllotment: string | null;
  redemptionDate: string | null;
  ratingAgencyName: string | null;
}

export interface PortfolioDetailsMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PortfolioDetailsResponse {
  data: PortfolioDetailsBond[];
  meta: PortfolioDetailsMeta;
}

export type GetPortfolioDetailsResponse =
  BaseResponseData<PortfolioDetailsResponse>;


export interface CashflowTimelineEvent {
  type: "INTEREST" | "MATURITY";
  bondName: string;
  maturityDate: string;
  amount: number;
}

export interface CashflowTimelineDate {
  date: string;
  totalPayout: number;
  side: string;
  events: CashflowTimelineEvent[];
}

export interface CashflowTimelineYear {
  year: number;
  totalPayout: number;
  dates: CashflowTimelineDate[];
}

export interface CashflowTimelineResponse {
  years: CashflowTimelineYear[];
}

export type GetCashflowTimelineResponse =
  BaseResponseData<CashflowTimelineResponse>;


export interface CashflowToMaturityMonthData {
  month: string;
  Principal: number;
  Interest: number;
}

export interface CashflowToMaturityResponse {
  "1yr": CashflowToMaturityMonthData[];
  "2yrs": CashflowToMaturityMonthData[];
  "5yrs": CashflowToMaturityMonthData[];
}

export type GetCashflowToMaturityResponse =
  BaseResponseData<CashflowToMaturityResponse>;
  
export interface PortfolioFilterOptions {
  bondTypes: string[];
  bondRatings: string[];
  couponRanges: string[];
  paymentFrequencies: string[];
}