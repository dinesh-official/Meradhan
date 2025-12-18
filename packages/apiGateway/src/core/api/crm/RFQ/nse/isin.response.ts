import type {
  BaseResponseData,
  PaginationMeta,
} from "../../../../../types/base";

export type NseISINResponseData = BaseResponseData<{
  data: NSE_ISIN_DATA[];
  meta: PaginationMeta;
}>;

export type NSE_ISIN_DATA = {
  symbol: string;
  description: string;
  issuer: string;
  maturityDate: string;
  couponRate: number;
  faceValue: number;
  issueCategory: string;
  listed: string;
};

export interface CreateRfqResponseItem {
  id?: number;
  /** Unique system-generated RFQ Number */
  number: string;

  /** Segment: R = Normal, C = CDMDF */
  segment: "R" | "C";

  /** ISIN code */
  isin: string;

  /** Participant code */
  participantCode: string;

  /** Deal Type: D = Direct, B = Brokered */
  dealType: "D" | "B";

  /** Client code */
  clientCode: string;

  /** Client registration type:
   * R = Retail – Unregistered
   * I = Institution – Regulated
   * U = Institution – Unregulated
   */
  clientRegType: "R" | "I" | "U";

  /** Buy/Sell flag: B = Buy, S = Sell */
  buySell: "B" | "S";

  /** Quote Type: Y = Only Yield, B = Both Price and Yield */
  quoteType: "Y" | "B";

  /** Settlement type: 0 = T+0, 1 = T+1 */
  settlementType: number;

  /** RFQ Value (in crores) */
  value: number;

  /** RFQ Quantity (number of bonds) */
  quantity: number;

  /** Yield type: YTM / YTP / YTC */
  yieldType: "YTM" | "YTP" | "YTC";

  /** Yield value */
  yield: number;

  /** Calculation Method: M = Money Market, O = Other */
  calcMethod: "M" | "O";

  /** Price value (nullable, only for quoteType = "B") */
  price: number | null;

  /** Good-till-day flag: Y = valid till day, null = use endTime */
  gtdFlag: "Y" | null;

  /** Expiry time (HH:mm) */
  endTime: string;

  /** Quote negotiable flag: Y = negotiable, null = not negotiable */
  quoteNegotiable: "Y" | null;

  /** Value negotiable flag: Y = negotiable, null = not negotiable */
  valueNegotiable: "Y" | null;

  /** Minimum fill value (in crores) */
  minFillValue?: number;

  /** Quote value step size (in crores) */
  valueStepSize?: number;

  /** Anonymous flag: Y = anonymous, null = not anonymous */
  anonymous?: "Y" | null;

  /** Access type:
   * 1 = OTM (One-to-many)
   * 2 = OTO (One-to-one)
   * 3 = IST (Inter-scheme transfer)
   */
  access: 1 | 2 | 3;

  /** List of participant group IDs (if applicable) */
  groupList?: number[] | null;

  /** List of participants (if applicable) */
  participantList?: string[] | null;

  /** Sector/category */
  category?: string;

  /** Rating */
  rating?: string;

  /** Remarks */
  remarks?: string;

  /** RFQ creation date (business date) */
  date: string;

  /** RFQ initiation timestamp (HH:mm:ss or ISO date) */
  quoteTime: string;

  /** Settlement date (business settlement date) */
  settlementDate: string;

  /** RFQ status:
   * P = Pending
   * W = Withdrawn
   * T = Fully Traded
   */
  status: "P" | "W" | "T";

  /** Login ID of the user who created the RFQ */
  userLogin: string;

  /** Total traded value (in crores) where yield is confirmed */
  tradedValue: number;

  /** Total confirmed value (in crores) where consideration is confirmed */
  confirmedValue: number;

  createdAt?: string;
  createdBy?: number;
  updatedBy?: number;
  updatedAt?: string;
}

export interface CreateNegotiationResponse {
  rfqNumber: string;
  id: string;
  date: string;
  isin: string;
  buySell: "B" | "S";

  initSettlementType?: number;
  initSettlementDate?: string;
  initAeCode?: string;
  initDealType?: "D" | "B";
  initClientCode?: string;
  initClientRegType?: "R" | "I" | "U";
  initValue?: number;
  initQuantity?: number;
  initYieldType?: "YTM" | "YTP" | "YTC";
  initYield?: number;
  initCalcMethod?: "M" | "O";
  initPrice?: number;
  initAccruedInterest?: number;
  initConsideration?: number;
  initQuoteTime?: string;
  initGtdFlag?: "Y" | null;
  initEndTime?: string;
  initRemarks?: string;
  initLoginId?: string;

  respSettlementType?: number;
  respSettlementDate?: string;
  respAeCode?: string;
  respDealType?: "D" | "B";
  respClientCode?: string;
  respClientRegType?: "R" | "I" | "U";
  respValue?: number;
  respQuantity?: number;
  respYieldType?: "YTM" | "YTP" | "YTC";
  respYield?: number;
  respCalcMethod?: "M" | "O";
  respPrice?: number;
  respAccruedInterest?: number;
  respConsideration?: number;
  respQuoteTime?: string;
  respGtdFlag?: "Y" | null;
  respEndTime?: string;
  respRemarks?: string;
  respLoginId?: string;

  status: "N" | "R" | "A" | "C" | "E"; // Negotiation status
  tradeNumber?: string;

  acceptedSettlementType?: number;
  acceptedSettlementDate?: string;
  acceptedValue?: number;
  acceptedQuantity?: number;
  acceptedYieldType?: "YTM" | "YTP" | "YTC";
  acceptedYield?: number;
  acceptedCalcMethod?: "M" | "O";
  acceptedPrice?: number;
  acceptedPutCallDate?: string;
  acceptedAccruedInterest?: number;
  acceptedConsideration?: number;
  acceptedQuoteTime?: string;
  acceptedBySide?: "I" | "R";
  acceptedByLoginId?: string;

  confirmStatus?: "PP" | "PC" | "PR" | "CA" | "CC" | "CR";
  proposedBySide?: "I" | "R";
  proposedTime?: string;
  confirmedPriceQuoteTime?: string;
  lastActivityTimestamp: string;

  tradeSplits?: TradeSplit[];

  createdAt?: string;
  createdBy?: number;
  updatedBy?: number;
  updatedAt?: string;
}

// Optional nested type (if trade splits are included)
export interface TradeSplit {
  tradeId: string;
  value?: number;
  quantity?: number;
  yield?: number;
  price?: number;
  participantCode?: string;
}

export interface SettleOrderData {
  id: number;
  orderNumber: string;
  symbol: string;
  buyParticipantLoginId: string;
  sellParticipantLoginId: string;
  price: number;
  yieldType: "P" | "C" | "M";
  yield: number;
  value: number;
  buyerRefNo?: string;
  sellerRefNo?: string;
  buyBackofficeLoginId?: string;
  sellBackofficeLoginId?: string;
  buyBrokerLoginId?: string;
  sellBrokerLoginId?: string;
  source: 1 | 4 | 5; // 1=NSE CBRICS, 4=FTRAC, 5=NSE RFQ
  modSettleDate: string;
  modQuantity: number;
  modAccrInt: number;
  modConsideration?: number;
  settlementNo?: string;
  stampDutyAmount?: number;
  stampDutyBearer?: string;
  buyerFundPayinObligation?: number;
  sellerFundPayoutObligation?: number;
  fundPayinRefId?: string;
  settleStatus: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  secPayinQuantity?: number;
  secPayinRemarks?: string;
  secPayinTime?: string;
  fundsPayinAmount?: number;
  fundsPayinRemarks?: string;
  fundsPayinTime?: string;
  payoutRemarks?: string;
  payoutTime?: string;
  ifscCode?: string;
  accountNo?: string;
  utrNumber?: string;
  dpId?: string;
  benId?: string;
}
