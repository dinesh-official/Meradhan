/**
 * Request Schema for POST /rest/v1/unreg
 * JSON → JSON
 */
export interface UnregisteredParticipantRequest {
  /** Unique unregistered participant code */
  loginId: string; // String(100), Mandatory

  /** Name of participant */
  firstName: string; // String(11), Mandatory

  /** PAN of participant, or "PAN_EXEMPT" if exempt */
  panNo: string; // String(30), Mandatory

  /** Custodian code if any */
  custodian: string | null; // String(30), Optional

  /** Name of contact person */
  contactPerson: string; // String(250), Mandatory

  /** Array of mobile numbers (1–3 items) */
  mobileList: string[]; // Array of String(15), Mandatory

  /** Array of email IDs (1–3 items) */
  emailList: string[]; // Array of String(50), Mandatory

  /** Telephone number */
  telephone?: string; // String(10), Optional

  /** Fax number */
  fax?: string; // String(250), Optional

  /** Address lines */
  address: string; // String(250), Mandatory
  address2?: string; // String(62), Optional
  address3?: string; // String(100), Optional

  /** Domicile / Registered State Code */
  stateCode: string; // String(2), Mandatory

  /** Registered Office / Domicile Address */
  regAddress: string; // String(100), Mandatory

  /** LEI Code (if applicable) */
  leiCode: string | null; // String(20), Optional
  dobDoi: string; // String(10), Optional

  /** LEI expiry date (if LEI is provided) */
  expiryDate: string | null; // Date (YYYY-MM-DD), Optional

  /** List of bank accounts */
  bankAccountList: BankAccount[]; // Mandatory

  /** List of DP accounts */
  dpAccountList: DPAccount[]; // Mandatory
}

/** Bank Account Structure */
interface BankAccount {
  /** Name of the bank */
  bankName: string; // String(100), Mandatory

  /** IFSC Code */
  bankIFSC: string; // String(11), Mandatory

  /** Bank Account Number */
  bankAccountNo: string; // String(30), Optional


  /**
   * Indicates if this bank account is default for payouts
   * Y = Yes, N = No
   */
  isDefault: "Y" | "N"; // String(1), Mandatory
  status: "A" | "S" | "D";
}

/** DP Account Structure */
interface DPAccount {
  /** Depository Type → NSDL or CDSL */
  dpType: "NSDL" | "CDSL"; // String(4), Mandatory

  /** DP ID → mandatory only for NSDL */
  dpId?: string; // String(8), Optional

  /** Beneficiary / Client ID */
  benId: string; // String(16 for CDSL, 8 for NSDL), Mandatory

  /**
   * Indicates if this DP account is default for payouts
   * Y = Yes, N = No
   */
  isDefault: "Y" | "N"; // String(1), Mandatory
  status: "A" | "S" | "D";
}

/**
 * Response schema for POST /rest/v1/unreg
 * Represents an Unregistered Participant response
 */
export interface UnregisteredParticipantResponse {
  /** Unique system-generated ID for the unregistered participant */
  id: number;

  /** Always 4 → indicates "unregistered participant" */
  type: number;

  /**
   * Approval status of request
   * 100 - Pending With Checker
   * 16  - Returned by Checker
   * 15  - Rejected by Checker
   * 0   - Pending with Exchange
   * 10  - Pending with Exchange
   * 1   - Approved
   * 5   - Rejected
   * 6   - Returned
   */
  actualStatus: number;

  /** Workflow status number (same as actualStatus in some cases) */
  workflowStatus: 0 | 1 | 5 | 6 | 10 | 15 | 16 | 100;

  // --- Fields echoed from request ---
  loginId: string;
  firstName: string;
  panNo: string;
  custodian?: string | null;
  contactPerson: string;
  mobileList: string[];
  emailList: string[];
  telephone: string;
  fax?: string | null;
  address: string;
  address2?: string | null;
  address3?: string | null;
  stateCode: string;
  regAddress: string;
  leiCode?: string | null;
  expiryDate?: string | null;

  /** Remarks from exchange/checker */
  remarks?: string | null;

  /** PAN verification status codes (same structure as actualStatus) */
  panVerStatus?: 0 | 1 | 5 | 6 | 10 | 15 | 16 | 100;

  /** PAN verification remarks */
  panVerRemarks?: string | null;

  /** List of associated bank accounts */
  bankAccountList: BankAccountResponse[];
  dobDoi?: string;

  /** List of associated DP accounts */
  dpAccountList: DPAccountResponse[];
}

/**
 * Bank Account structure in response
 */
interface BankAccountResponse {
  /** Name of the bank */
  bankName: string;

  /** IFSC code */
  bankIFSC: string;

  /** Account number */
  bankAccountNo?: string;

  /** Default payout indicator (Y/N) */
  isDefault: "Y" | "N";

  /**
   * Account Status
   * A = Active
   * S = Suspended
   * D = Deleted
   */
  status: "A" | "S" | "D";

  /**
   * Approval status of this bank account
   * 100 - Pending With Checker
   * 16  - Returned by Checker
   * 15  - Rejected by Checker
   * 0   - Pending with Exchange
   * 10  - Pending with Exchange
   * 1   - Approved
   * 5   - Rejected
   * 6   - Returned
   */
  workflowStatus: 0 | 1 | 5 | 6 | 10 | 15 | 16 | 100;

  /** Remarks for this account */
  remarks?: string | null;
}

/**
 * DP Account structure in response
 */
interface DPAccountResponse {
  /** Depository type → NSDL or CDSL */
  dpType: "NSDL" | "CDSL";

  /** DP ID (mandatory only for NSDL) */
  dpId?: string | null;

  /** Beneficiary / Client ID */
  benId: string;

  /** Default payout indicator (Y/N) */
  isDefault: "Y" | "N";

  /**
   * Account Status
   * A = Active
   * S = Suspended
   * D = Deleted
   */
  status: "A" | "S" | "D";

  /**
   * Approval status of this DP account
   * 100 - Pending With Checker
   * 16  - Returned by Checker
   * 15  - Rejected by Checker
   * 0   - Pending with Exchange
   * 10  - Pending with Exchange
   * 1   - Approved
   * 5   - Rejected
   * 6   - Returned
   */
  workflowStatus: 0 | 1 | 5 | 6 | 10 | 15 | 16 | 100;

  /** Remarks for this DP account */
  remarks?: string | null;
}

export interface UnregisteredParticipantParams {
  loginId?: string;
  firstName?: string;
  panNo?: string;
  workflowStatus: 0 | 1 | 5 | 6 | 10 | 15 | 16 | 100;
}

// POST /rest/v1/unreg/final/updatecontact

export interface UnregisteredParticipantFinalUpdateContactRequest {
  id: number;
  contactPerson: string;
  mobileList: string[]; // min 1, max 3
  emailList: string[]; // min 1, max 3
  telephone: string;
  fax?: string | null;
  address?: string | null;
  address2?: string | null;
  address3?: string | null;
}

// Same response as /rest/v1/unreg
export type UnregisteredParticipantFinalUpdateContactResponse =
  UnregisteredParticipantResponse;

// POST /rest/v1/unreg/final/delete

export interface UnregisteredParticipantFinalDeleteRequest {
  id: number;
}

export interface UnregisteredParticipantFinalDeleteResponse {
  id: number;
  message: string; // e.g. "Unregistered Participant deleted successfully."
}

// POST /rest/v1/unreg/bankacc

export interface UnregisteredParticipantBankAccountRequest {
  bankName: string;
  bankIFSC: string;
  bankAccountNo?: string; // Optional: treated as interbank if not provided
  isDefault: "Y" | "N";
  participantCode: string;
}

export interface UnregisteredParticipantBankAccountResponse {
  bankName: string;
  bankIFSC: string;
  bankAccountNo?: string;
  isDefault: "Y" | "N";
  participantCode: string;
  status: "A" | "S" | "D"; // Active, Suspended, Deleted
  workflowStatus: 0 | 1 | 5 | 6 | 10 | 15 | 16 | 100; // Approval status codes
  remarks?: string;
}

/**
 * Request for POST /rest/v1/unreg/bankacc/all
 * Fetches one or more unregistered participant bank account details.
 */
export interface UnregisteredBankAccountListRequest {
  /** Unique participant code (optional filter) */
  participantCode?: string;

  /**
   * Approval status of request:
   * 100 - Pending With Checker
   * 16 - Returned by checker
   * 15 - Rejected by checker
   * 0  - Pending with exchange
   * 10 - Pending with exchange
   * 1  - Approved
   * 5  - Rejected
   * 6  - Returned
   */
  workflowStatus: 0 | 1 | 5 | 6 | 10 | 15 | 16 | 100;
}

/**
 * Request for POST /rest/v1/unreg/bankacc/final/markdefault
 * Marks an approved unregistered participant bank account as default.
 */
export interface MarkDefaultUnregisteredBankAccountRequest {
  /** Unregistered participant code */
  participantCode: string;

  /** IFSC code of the bank */
  bankIFSC: string;

  /**
   * Bank Account Number (optional)
   * If not provided, the account is treated as interbank account.
   */
  bankAccountNo?: string;
}

/**
 * Request for POST /rest/v1/unreg/bankacc/final/updatestatus
 * Updates the status of an approved unregistered participant bank account.
 */
export interface UpdateUnregisteredBankAccountStatusRequest {
  /** Unregistered participant code */
  participantCode: string;

  /** IFSC code of the bank */
  bankIFSC: string;

  /**
   * Bank Account Number (optional)
   * If not provided, treated as interbank account.
   */
  bankAccountNo?: string;

  /**
   * New account status
   * - `A` = Active
   * - `S` = Suspended
   * - `D` = Deleted
   */
  status: "A" | "S" | "D";
}

/**
 * Request for POST /rest/v1/unreg/dpacc
 * Adds a DP Account for an unregistered participant (approval-based).
 */
export interface AddUnregisteredDpAccountRequest {
  /**
   * Depository type
   * - `NSDL`
   * - `CDSL`
   */
  dpType: "NSDL" | "CDSL";

  /**
   * DP ID — required only for NSDL
   * (8 characters)
   */
  dpId?: string;

  /**
   * Beneficiary / Client ID
   * - NSDL: 8 digits
   * - CDSL: 16 digits
   */
  benId: string;

  /**
   * Whether this DP account is default for payouts
   * - `Y` = Yes
   * - `N` = No
   */
  isDefault: "Y" | "N";

  /** Login ID of unregistered participant */
  participantCode: string;
}

/**
 * Response for POST /rest/v1/unreg/dpacc
 */
export interface UnregisteredDpAccountResponse {
  dpType: "NSDL" | "CDSL";
  dpId?: string;
  benId: string;
  isDefault: "Y" | "N";
  participantCode: string;

  /** Account Status: A = Active, S = Suspended, D = Deleted */
  status: "A" | "S" | "D";

  /**
   * Workflow status of approval
   * - 100: Pending With Checker
   * - 16: Returned by Checker
   * - 15: Rejected by Checker
   * - 0: Pending with Exchange
   * - 10: Pending with Exchange
   * - 1: Approved
   * - 5: Rejected
   * - 6: Returned
   */
  workflowStatus: number;

  /** Remarks, if any */
  remarks?: string;
}

/**
 * Request for POST /rest/v1/unreg/dpacc/all
 * Fetch DP accounts for unregistered participants based on filters.
 */
export interface GetUnregisteredDpAccountsRequest {
  /** Unique participant code (optional filter) */
  participantCode?: string;

  /**
   * Workflow status of approval
   * - 100: Pending With Checker
   * - 16: Returned by Checker
   * - 15: Rejected by Checker
   * - 0: Pending with Exchange
   * - 10: Pending with Exchange
   * - 1: Approved
   * - 5: Rejected
   * - 6: Returned
   */
  workflowStatus?: number;
}

/**
 * Response for POST /rest/v1/unreg/dpacc/all
 * Returns list of DP account records.
 */
export type GetUnregisteredDpAccountsResponse = UnregisteredDpAccountResponse[];

/**
 * Request for POST /rest/v1/unreg/dpacc/final/markdefault
 * Marks an approved DP account as default for payouts.
 */
export interface MarkDefaultUnregisteredDpAccountRequest {
  /** Unique participant code */
  participantCode: string;

  /** Depository type — NSDL or CDSL */
  dpType: "NSDL" | "CDSL";

  /**
   * DP ID — applicable and mandatory only for NSDL.
   * Should be 8 characters if provided.
   */
  dpId?: string | null;

  /**
   * Beneficiary/Client ID
   * - 8 digits for NSDL
   * - 16 digits for CDSL
   */
  benId: string;
}

/**
 * Request for POST /rest/v1/unreg/dpacc/final/updatestatus
 * Updates status of an approved DP account of an unregistered participant.
 */
export interface UpdateUnregisteredDpAccountStatusRequest {
  /** Unique participant code */
  participantCode: string;

  /** Depository type — NSDL or CDSL */
  dpType: "NSDL" | "CDSL";

  /**
   * DP ID — applicable and mandatory only for NSDL.
   * Should be 8 characters if provided.
   */
  dpId?: string | null;

  /**
   * Beneficiary/Client ID
   * - 8 digits for NSDL
   * - 16 digits for CDSL
   */
  benId: string;

  /**
   * New account status:
   * - 'A' = Active
   * - 'S' = Suspended
   * - 'D' = Deleted
   */
  status: "A" | "S" | "D";
}

/**
 * Response for POST /rest/v1/unreg/dpacc/final/updatestatus
 * Same as response for /rest/v1/unreg/dpacc
 */
export type UpdateUnregisteredDpAccountStatusResponse =
  UnregisteredDpAccountResponse;

/**
 * Response for POST /rest/v1/unreg/dpacc/final/markdefault
 * Same as response for /rest/v1/unreg/dpacc
 */
export type MarkDefaultUnregisteredDpAccountResponse =
  UnregisteredDpAccountResponse;

/**
 * Represents a request to create an Order (Deal Reporting or Buyer Standing Instruction)
 * for the /rest/v1/order endpoint.
 */
export interface OrderRequest {
  /**
   * Indicates if deal is being reported by seller or it is a standing buyer instruction.
   * - 'Y' = Standing Buyer Instruction
   * - 'N' = Reporting by Seller
   * Default = 'N'
   */
  standingInstFlag: "Y" | "N";

  /**
   * Deal Type:
   * - 'D' = Direct
   * - 'B' = Brokered
   * - 'I' = Inter-scheme transfer (valid only for Reporting by Seller)
   */
  dealType: "D" | "B" | "I";

  /**
   * ISIN of the bond.
   */
  symbol: string;

  /**
   * Buy Participant Login ID.
   * - For “Reporting by Seller” → must be logged-in participant ID.
   */
  buyParticipantLoginId: string;

  /**
   * Sell Participant Login ID.
   * - For “Standing Buyer Instruction” → must be logged-in participant ID.
   */
  sellParticipantLoginId: string;

  /**
   * Price in Rupees (up to 4 decimal places).
   */
  price: number;

  /**
   * Value in Rupees (up to 2 decimal places).
   */
  value: number;

  /**
   * Accrued Interest in Rupees (up to 2 decimal places).
   */
  accrInt: number;

  /**
   * Settlement Type:
   * - 0 = Same Day
   * - 1 = T+1
   * - 2 = T+2
   */
  settle: 0 | 1 | 2;

  /**
   * Confirmation Method (valid only for “Reporting by Seller”):
   * - 'C' = Optional Buyer Confirmation (auto-confirmed after fixed time)
   * - 'M' = Mandatory Buyer Confirmation
   */
  sendFor?: "C" | "M";

  /**
   * Yield Type:
   * - 'P' = YTP
   * - 'C' = YTC
   * - 'M' = YTM
   */
  yieldType: "P" | "C" | "M";

  /**
   * Yield (up to 4 decimal places).
   */
  yield: number;

  /**
   * Trade Date (format: dd-MM-yyyy)
   */
  tradeDate: string;

  /**
   * Trade Time (format: HH:mm)
   */
  tradeTime: string;

  /**
   * Reference number for seller (optional).
   */
  sellerRefNo?: string | null;

  /**
   * Reference number for buyer (optional).
   */
  buyerRefNo?: string | null;

  /**
   * Put/Call Date (mandatory if Yield Type is YTP or YTC).
   * Format: dd-MM-yyyy
   */
  putCallDate?: string;

  /**
   * Seller Yield Violation Reason (if yield is outside band).
   * Valid values:
   * - '1' = Credit Related
   * - '2' = Liquidity Related
   */
  sellerYieldViolationReason?: "1" | "2";

  /**
   * Buyer Yield Violation Reason (if yield is outside band).
   * Valid values:
   * - '1' = Credit Related
   * - '2' = Liquidity Related
   */
  buyerYieldViolationReason?: "1" | "2";
}

/**
 * Represents the response from the /rest/v1/order API
 * after creating a deal reporting or standing buyer instruction.
 */
export interface OrderResponse {
  /** Unique Order Id (for the day). Required for modification/cancellation. */
  id: number;

  /** Unique Transaction Number (String of length 15). */
  orderNumber: string;

  /**
   * Indicates if deal is being reported by seller or it is a standing buyer instruction.
   * - 'Y' = Standing Buyer Instruction
   * - 'N' = Reporting by Seller
   */
  standingInstFlag: "Y" | "N";

  /**
   * Deal Type:
   * - 'D' = Direct
   * - 'B' = Brokered
   * - 'I' = Inter-scheme transfer
   */
  dealType: "D" | "B" | "I";

  /**
   * Buyer Deal Type:
   * - 'D' = Direct
   * - 'B' = Brokered
   * - 'I' = Inter-scheme transfer
   */
  buyerDealType?: "D" | "B" | "I";

  /** ISIN of the bond. */
  symbol: string;

  /** Buyer participant login ID. */
  buyParticipantLoginId: string;

  /** Seller participant login ID. */
  sellParticipantLoginId: string;

  /** Price in Rupees (up to 4 decimal places). */
  price: number;

  /** Value in Rupees (up to 2 decimal places). */
  value: number;

  /** Accrued Interest in Rupees (up to 2 decimal places). */
  accrInt: number;

  /**
   * Settlement Type:
   * - 0 = Same Day
   * - 1 = T+1
   * - 2 = T+2
   */
  settle: 0 | 1 | 2;

  /**
   * Confirmation Method (valid only for “Reporting by Seller”):
   * - 'C' = Optional Buyer Confirmation
   * - 'M' = Mandatory Buyer Confirmation
   */
  sendFor?: "C" | "M";

  /**
   * Yield Type:
   * - 'P' = YTP
   * - 'C' = YTC
   * - 'M' = YTM
   */
  yieldType: "P" | "C" | "M";

  /** Yield (up to 4 decimal places). */
  yield: number;

  /** Trade Date (format: dd-MM-yyyy). */
  tradeDate: string;

  /** Trade Time (format: HH:mm). */
  tradeTime: string;

  /** Seller reference number (optional). */
  sellerRefNo?: string | null;

  /** Buyer reference number (optional). */
  buyerRefNo?: string | null;

  /** Put/Call date (format: dd-MM-yyyy, optional). */
  putCallDate?: string;

  /**
   * Seller yield violation reason:
   * - '1' = Credit Related
   * - '2' = Liquidity Related
   */
  sellerYieldViolationReason?: "1" | "2";

  /**
   * Buyer yield violation reason:
   * - '1' = Credit Related
   * - '2' = Liquidity Related
   */
  buyerYieldViolationReason?: "1" | "2";

  /** API response message. */
  message: string;

  /** Number of bonds. (Value / Face Value). */
  quantity: number;

  /**
   * Total consideration in INR.
   * Formula: value * price / 100 + accrInt
   */
  consideration: number;

  /** Buyer back-office login ID (if any). */
  buyBackofficeLoginId?: string | null;

  /** Seller back-office login ID (if any). */
  sellBackofficeLoginId?: string | null;

  /**
   * Order Status:
   * For Reporting by Seller:
   *  - 1 = Order Entered
   *  - 2 = Rejected by Buyer
   *  - 7 = Trade Confirmed (Accepted by Buyer)
   *  - 8 = Canceled due to non-acceptance by buyer
   *
   * For Standing Buyer Instruction:
   *  - 1 = Pending
   *  - 2 = Confirmed
   *  - 3 = Canceled
   */
  status: 1 | 2 | 3 | 7 | 8;
}

export interface OrderUpdateRequest extends OrderRequest {
  /**
   * Unique Order Id (for the day)
   * Required for updating an existing record.
   */
  id: number;
}

export type OrderUpdateResponse = OrderResponse;

export type SellReportingsResponse = OrderResponse[];

/**
 * Request body for POST /rest/v1/order/sellreportings
 * Used to filter sell reportings based on given criteria.
 */
export interface SellReportingsFilterRequest {
  /** Unique Transaction Number (optional) */
  orderNumber?: string;

  /** ISIN symbol (optional) */
  symbol?: string;

  /** Deal entry date (format: dd-MM-yyyy). Defaults to current date if not provided. */
  filtEntryDate?: string;

  /** Buyer participant login ID (optional) */
  buyParticipantLoginId?: string;

  /** Seller participant login ID (optional) */
  sellParticipantLoginId?: string;
}

/**
 * Request body for POST /rest/v1/order/buyinstructions
 * All fields are optional filters.
 */
export interface BuyInstructionsRequest {
  /** Unique Transaction Number (optional) */
  orderNumber?: string;

  /** ISIN / Symbol (optional) */
  symbol?: string;

  /** Deal entry date (format: dd-MM-yyyy). Defaults to current date if not provided. */
  filtEntryDate?: string;

  /** Buyer participant code (optional) */
  buyParticipantLoginId?: string;

  /** Seller participant code (optional) */
  sellParticipantLoginId?: string;
}

/** Response for POST /rest/v1/order/buyinstructions */
export type BuyInstructionsResponse = OrderResponse[];

/**
 * Request body for PUT /rest/v1/order/status
 * Used by Buyer to accept or reject a sell order reporting.
 */
export interface OrderStatusRequest {
  /** Unique Order ID (for the day) */
  id: number;

  /**
   * Status code:
   * 2 = Rejected by Buyer
   * 7 = Trade Confirmed (Accepted by Buyer)
   */
  status: 2 | 7;

  /**
   * Mandatory only if yield limit is violated.
   * 1 = Credit Related Reasons
   * 2 = Liquidity Related Reasons
   */
  buyerYieldViolationReason?: "1" | "2";
}

/**
 * Response for PUT /rest/v1/order/status
 */
export interface OrderStatusResponse {
  /** Same as input */
  id: number;

  /** Same as input */
  status: number;

  /** Success or failure message */
  message: string;
}

/**
 * Request body for POST /rest/v1/marketwatch/activeissues
 * Used to fetch market-wide summary for traded issues today.
 */
export interface ActiveIssuesRequest {
  /** ISIN of the bond (optional). If omitted, returns all traded issues for the day. */
  symbol?: string;
}

/**
 * Represents a single active issue in market watch summary.
 */
export interface ActiveIssue {
  /** ISIN of the bond */
  symbol: string;

  /** Description of the issue */
  description: string;

  /** Security type (e.g. CC) */
  type: string;

  /** Issuer name */
  issuer: string;

  /** Issue date (format: dd-MM-yyyy) */
  issueDate: string;

  /** Maturity date (format: dd-MM-yyyy) */
  maturityDate: string;

  /** Coupon rate */
  couponRate: number;

  /** Credit rating (e.g. CRISIL AAA, NA) */
  creditRating: string;

  /** Last trade price */
  lastTradePrice: number;

  /** Last trade value */
  lastTradeValue: number;

  /** Last trade time (format: dd-MM-yyyy HH:mm:ss) */
  lastTradeTime: string;

  /** Total traded value */
  totTradeValue: number;

  /** Total number of trades */
  totNoOfTrades: number;

  /** Average yield */
  avgYield: number;

  /** Average trade price */
  avgTradePrice: number;
}

/** Response for POST /rest/v1/marketwatch/activeissues */
export type ActiveIssuesResponse = ActiveIssue[];

/**
 * Request body for POST /rest/v1/participant/find
 * Used to filter registered participants or custodians.
 */
export interface ParticipantFindRequest {
  /** Participant or custodian login ID (optional partial match) */
  loginId?: string;

  /**
   * Entity type
   * 2 = Participant
   * 13 = Custodian
   */
  type?: 2 | 13;

  /** Participant’s custodian login ID (optional) */
  custodian?: string | null;

  /** PAN number of participant/custodian (optional) */
  panNo?: string | null;
}

/**
 * Represents a participant or custodian record in the system.
 */
export interface ParticipantRecord {
  /** Entity type: 2 = Participant, 13 = Custodian */
  type: 2 | 13;

  /** Name of the participant or custodian */
  firstName: string;

  /** Login ID of the participant/custodian */
  loginId: string;

  /** PAN number */
  panNo?: string;

  /** Custodian login ID (if applicable) */
  custodian?: string | null;

  /**
   * Status:
   * 1 = Active
   * 2 = Inactive
   * 3 = Suspended
   * 4 = Unregistered
   */
  actualStatus: 1 | 2 | 3 | 4;
}

/** Response type for POST /rest/v1/participant/find */
export type ParticipantFindResponse = ParticipantRecord[];

/**
 * Request for POST /rest/v1/settle/order/all
 * Returns settlement orders within the specified date range.
 */
export interface SettleOrderListRequest {
  /** Unique Settle Order Id (optional) */
  id?: number;

  /** Unique Transaction Number (optional, max length 15) */
  orderNumber?: string;

  /** From date (DD-MM-YYYY) — required */
  filtFromModSettleDate: string;

  /** To date (DD-MM-YYYY) — required */
  filtToModSettleDate: string;

  /** Optional — filter by counterparty participant code */
  filtCounterParty?: string;
}

/**
 * Settlement order record returned in response.
 */
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

/**
 * Response for POST /rest/v1/settle/order/all
 */
export type SettleOrderListResponse = SettleOrderData[];

/**
 * Request for POST /rest/v1/settle/order/update
 * Updates settlement order details before settlement initiation.
 */
export interface SettleOrderUpdateRequest {
  /** Unique Settle Order Id */
  id: number;

  /** Buyer Custodian (optional; unchanged if seller is calling) */
  buyBackofficeLoginId?: string;

  /** Seller Custodian (optional; unchanged if buyer is calling) */
  sellBackofficeLoginId?: string;

  /** Settlement Date (DD-MM-YYYY) */
  modSettleDate?: string;

  /** Number of Bonds (Value / Facevalue) */
  modQuantity?: number;

  /** Interest in Rupees (Up to 2 decimal places) */
  modAccrInt?: number;

  /** Total Consideration in INR — value * price / 100 + accrInt */
  modConsideration?: number;
}

/**
 * Response for POST /rest/v1/settle/order/update
 * Same as POST /rest/v1/settle/order/all
 */
export type SettleOrderUpdateResponse = SettleOrderData;

/**
 * Request for POST /rest/v1/settle/order/updatebank
 * Updates the seller's payout bank account before settlement begins.
 * Can be called by the seller or by the buyer on behalf of an unregistered seller.
 */
export interface SettleOrderUpdateBankRequest {
  /** Unique Settle Order Id */
  id: number;

  /** IFSC Code of the new bank account for payout */
  ifscCode: string;

  /** Account number of the new bank account for payout (optional) */
  accountNo?: string;
}

/**
 * Response for POST /rest/v1/settle/order/updatebank
 * Same structure as /rest/v1/settle/order/all
 */
export interface SettleOrderUpdateBankResponse {
  id: number;
  orderNumber: string;
  symbol: string;
  buyParticipantLoginId: string;
  sellParticipantLoginId: string;
  price: number;
  yieldType: "P" | "C" | "M";
  yield: number;
  value: number;
  modAccrInt: number;
  modQuantity: number;
  modSettleDate: string;
  modConsideration: number;
  settlementNo: string;
  stampDutyAmount: number;
  stampDutyBearer: string;
  buyerFundPayinObligation: number;
  sellerFundPayoutObligation: number;
  ifscCode: string;
  accountNo?: string;
  dpId?: string;
  benId?: string;
  buyBackofficeLoginId?: string;
  sellBackofficeLoginId?: string;
  settleStatus: number;
  source: number;
}

/**
 * Request for POST /rest/v1/settle/order/updatedp
 * Updates the buyer’s DP (Depository Participant) details before settlement begins.
 * Can be invoked by buyer or by seller on behalf of an unregistered buyer.
 */
export interface SettleOrderUpdateDpRequest {
  /** Unique Settle Order Id */
  id: number;

  /** NSDL DP ID of the new DP account for payout */
  dpId?: string;

  /** Client / Beneficiary ID of the new DP account for payout */
  benId: string;
}

/**
 * Response for POST /rest/v1/settle/order/updatedp
 * Same as response for /rest/v1/settle/order/all
 */
export interface SettleOrderUpdateDpResponse {
  id: number;
  orderNumber: string;
  symbol: string;
  buyParticipantLoginId: string;
  sellParticipantLoginId: string;
  price: number;
  yieldType: "P" | "C" | "M";
  yield: number;
  value: number;
  modAccrInt: number;
  modQuantity: number;
  modSettleDate: string;
  modConsideration: number;
  settlementNo: string;
  stampDutyAmount: number;
  stampDutyBearer: string;
  buyerFundPayinObligation: number;
  sellerFundPayoutObligation: number;
  ifscCode: string;
  accountNo?: string;
  dpId?: string;
  benId?: string;
  buyBackofficeLoginId?: string;
  sellBackofficeLoginId?: string;
  settleStatus: number;
  source: number;
}

export interface PaymentTransactionQueryRequest {
  /** Unique payment transaction ID */
  id?: string;

  /** Fund Payin Reference ID linked to settlement order */
  fundPayinRefId?: string;

  /** Settlement Order number */
  orderNumber?: string;

  /** From date filter (DD-MM-YYYY) */
  filtFromDate?: string;

  /** To date filter (DD-MM-YYYY) */
  filtToDate?: string;
}
export interface PaymentTransactionRecord {
  /** Unique id for the payment transaction */
  id: string;

  /** Fund payin reference id for the settlement order */
  fundPayinRefId: string;

  /** Settlement order number */
  orderNumber: string;

  /** Participant code of client */
  partCode: string;

  /** Method of payment: "netbanking" | "upi" */
  method: "netbanking" | "upi";

  /** Fund payin obligation amount */
  amount: number;

  /** UPI ID (if applicable) */
  upiId?: string;

  /** IFSC of selected bank account */
  bankIFSC: string;

  /** Account number of selected bank account */
  bankAcccountNo: string;

  /** Status: P | XS | XF | S | F */
  status: "P" | "XS" | "XF" | "S" | "F";

  /** Remarks or reason if failed */
  statusRemarks?: string | null;

  /** Actual amount received (for provisional/success) */
  debitAmount?: number;

  /** IFSC of bank account from which amount was received */
  debitBankIFSC?: string;

  /** Account number from which amount was received */
  debitBankAcccountNo?: string;

  /** Bank reference number */
  bankRefNo?: string;

  /** Customer reference number */
  customerReferenceNo?: string;

  /** Payment initiation timestamp (DD-MM-YYYY HH:mm:ss) */
  initiateTime: string;

  /** Last update timestamp (DD-MM-YYYY HH:mm:ss) */
  lastResponseTime: string;
}

export interface UpiPaymentInitiationRequest {
  /** Fund payin reference ID linked to the settlement order */
  fundPayinRefId: string;

  /** Fund payin obligation amount */
  amount: number;

  /** UPI ID (optional, used if method = UPI) */
  upiId?: string;

  /** IFSC of the bank account used for payment */
  bankIFSC: string;

  /** Account number of the bank account used for payment */
  bankAcccountNo: string;

  /** Optional customer reference number (from bank) */
  customerReferenceNo?: string;
}
export interface PaymentTransactionResponse {
  /** Unique id for the payment transaction */
  id: string;

  /** Fund payin reference id */
  fundPayinRefId: string;

  /** Settlement order number */
  orderNumber: string;

  /** Participant code of the client that initiated payment */
  partCode: string;

  /** Payment method — "UPI" (for this endpoint) */
  method: "UPI";

  /** Fund payin obligation amount */
  amount: number;

  /** UPI ID used for payment */
  upiId?: string;

  /** IFSC of the selected bank */
  bankIFSC: string;

  /** Account number used for payment */
  bankAcccountNo: string;

  /** Transaction status */
  status: "P" | "XS" | "XF" | "S" | "F";

  /** Optional remarks for transaction status */
  statusRemarks?: string | null;

  /** Actual amount received (for success cases) */
  debitAmount?: number | null;

  /** IFSC of the debit bank (actual payer account) */
  debitBankIFSC?: string | null;

  /** Account number of the debit account */
  debitBankAcccountNo?: string | null;

  /** Bank reference number */
  bankRefNo?: string | null;

  /** Customer reference number */
  customerReferenceNo?: string | null;

  /** Time of payment initiation */
  initiateTime: string;

  /** Time of last response from gateway/bank */
  lastResponseTime: string;
}
