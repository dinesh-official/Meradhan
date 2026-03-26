/** Request: Create a new participant group */
export interface ParticipantGroupAddRequest {
  /** Participant group name */
  name: string; // String(100), Mandatory

  /** List of constituent participant codes (min 1) */
  participantList: string[]; // List<String(30)>, Mandatory
}

/** Response: Created participant group */
export interface ParticipantGroupAddResponse
  extends ParticipantGroupAddRequest {
  /** Unique system-generated ID for the participant group */
  id: number; // Mandatory
}

/** Request: Update an existing participant group */
export interface ParticipantGroupUpdateRequest {
  /** Unique system-generated ID of the participant group */
  id: number; // Mandatory

  /** Updated participant group name */
  name: string; // String(100), Mandatory

  /** Updated list of constituent participant codes */
  participantList: string[]; // List<String(30)>, Mandatory
}

/** Response: Updated participant group */
export type ParticipantGroupUpdateResponse = ParticipantGroupAddResponse;

/** Request: Fetch participant groups (optionally filtered) */
export interface ParticipantGroupListRequest {
  /** Filter by group ID (optional) */
  id?: number;

  /** Filter by name substring (optional, case-insensitive) */
  name?: string;
}

/** Response: Each participant group in list */
export interface ParticipantGroupRecord {
  /** Unique group ID */
  id: number;

  /** Group name */
  name: string;

  /** List of participant codes in this group */
  participantList: string[];
}

/** Response: List of participant groups */
export type ParticipantGroupListResponse = ParticipantGroupRecord[];

/** Request: Create new turnover limit record */
export interface ParticipantLimitAddRequest {
  /** Limit type — determines scope of limit */
  limitType: "S" | "D" | "C" | "B" | "X"; // Self, Dealer, Counter Party, Broker, Client

  /** Whether this is a global default record (Y = Yes) */
  global?: "Y" | null;

  /** Counter party code (mandatory if limitType = 'C' and global = null) */
  counterPartyCode?: string | null;

  /** Dealer login ID (mandatory if limitType = 'D' and global = null) */
  loginId?: string | null;

  /** Broker code (mandatory if limitType = 'B' and global = null) */
  brokerCode?: string | null;

  /** Client code (mandatory if limitType = 'X' and global = null) */
  clientCode?: string | null;

  /** Settlement type (0 = T+0, 1 = T+1, null = both) */
  settlementType?: 0 | 1 | null;

  /** Flag to indicate buy limit is unlimited ("Y") */
  dayBuyLimitInfinity?: "Y" | null;

  /** Buy limit in crores (valid if not unlimited) */
  dayBuyLimit?: number | null;

  /** Flag to indicate sell limit is unlimited ("Y") */
  daySellLimitInfinity?: "Y" | null;

  /** Sell limit in crores (valid if not unlimited) */
  daySellLimit?: number | null;

  /** Flag to indicate gross limit is unlimited ("Y") */
  dayGrossLimitInfinity?: "Y" | null;

  /** Gross limit in crores (valid if not unlimited) */
  dayGrossLimit?: number | null;
}

/** Response: Limit record created successfully */
export interface ParticipantLimitAddResponse
  extends ParticipantLimitAddRequest {
  /** Unique system-generated ID */
  id: number;

  /** Day buy limit utilization (in crores) */
  buyUtilization?: number;

  /** Day sell limit utilization (in crores) */
  sellUtilization?: number;

  /** Day gross limit utilization (in crores) */
  grossUtilization?: number;
}

/** Request: Update existing turnover limit record */
export interface ParticipantLimitUpdateRequest {
  /** Unique system-generated ID for the limit record */
  id: number;

  /** Limit type */
  limitType: "S" | "D" | "C" | "B" | "X";

  /** Flag to indicate buy limit is unlimited ("Y") */
  dayBuyLimitInfinity?: "Y" | null;

  /** Buy limit in crores (valid if not unlimited) */
  dayBuyLimit?: number | null;

  /** Flag to indicate sell limit is unlimited ("Y") */
  daySellLimitInfinity?: "Y" | null;

  /** Sell limit in crores (valid if not unlimited) */
  daySellLimit?: number | null;

  /** Flag to indicate gross limit is unlimited ("Y") */
  dayGrossLimitInfinity?: "Y" | null;

  /** Gross limit in crores (valid if not unlimited) */
  dayGrossLimit?: number | null;
}

/** Response: Updated turnover limit record */
export type ParticipantLimitUpdateResponse = ParticipantLimitAddResponse;

/** Request: Fetch turnover limits with optional filters */
export interface ParticipantLimitListRequest {
  /** Filter by limit record ID */
  id?: number;

  /** Filter by limit type */
  limitType?: "S" | "D" | "C" | "B" | "X";

  /** Filter by counter party code */
  counterPartyCode?: string;

  /** Filter by dealer login ID */
  loginId?: string;

  /** Filter by broker code */
  brokerCode?: string;

  /** Filter by client code */
  clientCode?: string;
}

/** Response: Each record represents one turnover limit */
export type ParticipantLimitRecord = ParticipantLimitAddResponse;

/** Response: List of all matching turnover limit records */
export type ParticipantLimitListResponse = ParticipantLimitRecord[];

/** Request: Create new portfolio limit */
export interface PortfolioLimitAddRequest {
  /** Limit type */
  limitType: "S" | "I"; // S = ISIN, I = Issuer

  /** Global flag (Y = Global, null = Not Global) */
  global?: "Y" | null;

  /** ISIN (required if limitType = 'S' and global = null) */
  isin?: string;

  /** Issuer name (required if limitType = 'I' and global = null) */
  issuer?: string;

  /** Value type — Q = Quantity, V = Value */
  valueType?: "Q" | "V";

  /** Flag to indicate buy quantity limit is unlimited */
  dayBuyLimitInfinity?: "Y" | null;

  /** Day Buy Quantity Limit (if limited) */
  dayBuyLimit?: number | null;

  /** Flag to indicate buy value limit is unlimited */
  dayBuyValueLimitInfinity?: "Y" | null;

  /** Day Buy Value Limit (if limited) */
  dayBuyValueLimit?: number | null;

  /** Flag to indicate sell quantity limit is unlimited */
  daySellLimitInfinity?: "Y" | null;

  /** Day Sell Quantity Limit (if limited) */
  daySellLimit?: number | null;

  /** Flag to indicate sell value limit is unlimited */
  daySellValueLimitInfinity?: "Y" | null;

  /** Day Sell Value Limit (if limited) */
  daySellValueLimit?: number | null;

  /** Base price for price band determination (limitType = ISIN only) */
  basePrice?: number | null;

  /** Base yield for price band determination (limitType = ISIN only) */
  baseYield?: number | null;
}

/** Response: Portfolio limit record */
export interface PortfolioLimitAddResponse extends PortfolioLimitAddRequest {
  /** Unique system-generated ID */
  id: number;

  /** Day buy quantity utilization */
  buyUtilization?: number;

  /** Day sell quantity utilization */
  sellUtilization?: number;

  /** Day buy value utilization (in crores) */
  buyValueUtilization?: number;

  /** Day sell value utilization (in crores) */
  sellValueUtilization?: number;
}

/** Request: Update existing portfolio limit */
export interface PortfolioLimitUpdateRequest {
  /** Unique system generated ID (required to identify record) */
  id: number;

  /** Limit type — S = ISIN, I = Issuer */
  limitType: "S" | "I";

  /** Global flag (Y = Global, null = Not Global) */
  global?: "Y" | null;

  /** Value type — Q = Quantity, V = Value */
  valueType?: "Q" | "V";

  /** Flag to indicate buy quantity limit is unlimited */
  dayBuyLimitInfinity?: "Y" | null;

  /** Day Buy Quantity Limit (if limited) */
  dayBuyLimit?: number | null;

  /** Flag to indicate buy value limit is unlimited */
  dayBuyValueLimitInfinity?: "Y" | null;

  /** Day Buy Value Limit (if limited) */
  dayBuyValueLimit?: number | null;

  /** Flag to indicate sell quantity limit is unlimited */
  daySellLimitInfinity?: "Y" | null;

  /** Day Sell Quantity Limit (if limited) */
  daySellLimit?: number | null;

  /** Flag to indicate sell value limit is unlimited */
  daySellValueLimitInfinity?: "Y" | null;

  /** Day Sell Value Limit (if limited) */
  daySellValueLimit?: number | null;

  /** Base price (only if limitType = ISIN) */
  basePrice?: number | null;

  /** Base yield (only if limitType = ISIN) */
  baseYield?: number | null;
}

/** Response: Same as /portfoliolimit/add */
export interface PortfolioLimitUpdateResponse {
  id: number;
  limitType: "S" | "I";
  global?: "Y" | null;
  isin?: string | null;
  issuer?: string | null;
  valueType?: "Q" | "V";
  dayBuyLimitInfinity?: "Y" | null;
  dayBuyLimit?: number | null;
  dayBuyValueLimitInfinity?: "Y" | null;
  dayBuyValueLimit?: number | null;
  daySellLimitInfinity?: "Y" | null;
  daySellLimit?: number | null;
  daySellValueLimitInfinity?: "Y" | null;
  daySellValueLimit?: number | null;
  basePrice?: number | null;
  baseYield?: number | null;
  buyUtilization?: number;
  sellUtilization?: number;
  buyValueUtilization?: number;
  sellValueUtilization?: number;
}

/** Request: Fetch all portfolio limits with optional filters */
export interface PortfolioLimitAllRequest {
  /** Filter to fetch record by ID */
  id?: number;

  /** Filter for limit type — S = ISIN, I = Issuer */
  limitType?: "S" | "I";

  /** Filter by ISIN (valid if limitType = "S") */
  isin?: string;

  /** Filter by Issuer (valid if limitType = "I") */
  issuer?: string;
}

/** Single portfolio limit record (same as /portfoliolimit/add response) */
export interface PortfolioLimitRecord {
  id: number;
  limitType: "S" | "I";
  global?: "Y" | null;
  isin?: string | null;
  issuer?: string | null;
  valueType?: "Q" | "V" | null;
  dayBuyLimitInfinity?: "Y" | null;
  dayBuyLimit?: number | null;
  dayBuyValueLimitInfinity?: "Y" | null;
  dayBuyValueLimit?: number | null;
  daySellLimitInfinity?: "Y" | null;
  daySellLimit?: number | null;
  daySellValueLimitInfinity?: "Y" | null;
  daySellValueLimit?: number | null;
  basePrice?: number | null;
  baseYield?: number | null;
  buyUtilization?: number;
  sellUtilization?: number;
  buyValueUtilization?: number;
  sellValueUtilization?: number;
}

/** Response: List of portfolio limit records */
export type PortfolioLimitAllResponse = PortfolioLimitRecord[];

/** Request body for POST /rest/v1/partisstyp/update */
export interface IssueTypeSettingsUpdateRequest {
  /** Issue Category — CP | CD | CB | SD | GS */
  issueCategory: "CP" | "CD" | "CB" | "SD" | "GS";

  /** Maximum Single Transaction Value Limit (in crores) */
  maxSingleTransactionValueLimit: number;

  /** Action on single transaction value limit violation — W = Warn, B = Block */
  maxStvViolationAction: "W" | "B";

  /** Yield Band Type — D = Delta Absolute, P = Delta Percentage */
  yieldBandType: "D" | "P";

  /** Yield Lower Band (optional) */
  yieldLowerBand?: number | null;

  /** Yield Upper Band (optional) */
  yieldUpperBand?: number | null;

  /** Action on yield band violation — W = Warn, B = Block */
  yieldViolationAction: "W" | "B";

  /** Price Band Type — D = Delta Absolute, P = Delta Percentage */
  priceBandType: "D" | "P";

  /** Price Lower Band (optional) */
  priceLowerBand?: number | null;

  /** Price Upper Band (optional) */
  priceUpperBand?: number | null;

  /** Action on price band violation — W = Warn, B = Block */
  priceViolationAction: "W" | "B";
}

/** Response: Structure same as request */
export type IssueTypeSettingsUpdateResponse = IssueTypeSettingsUpdateRequest;

/** Represents one issue type setting */
export interface IssueTypeSetting {
  /** Issue Category — CP | CD | CB | SD | GS */
  issueCategory: "CP" | "CD" | "CB" | "SD" | "GS";

  /** Maximum Single Transaction Value Limit (in crores) */
  maxSingleTransactionValueLimit: number;

  /** Action on single transaction value limit violation — W = Warn, B = Block */
  maxStvViolationAction: "W" | "B";

  /** Yield Band Type — D = Delta Absolute, P = Delta Percentage */
  yieldBandType: "D" | "P";

  /** Yield Lower Band */
  yieldLowerBand?: number | null;

  /** Yield Upper Band */
  yieldUpperBand?: number | null;

  /** Action on yield band violation — W = Warn, B = Block */
  yieldViolationAction: "W" | "B";

  /** Price Band Type — D = Delta Absolute, P = Delta Percentage */
  priceBandType: "D" | "P";

  /** Price Lower Band */
  priceLowerBand?: number | null;

  /** Price Upper Band */
  priceUpperBand?: number | null;

  /** Action on price band violation — W = Warn, B = Block */
  priceViolationAction: "W" | "B";
}

/** Response: list of issue type settings */
export type GetIssueTypeSettingsResponse = IssueTypeSetting[];

export interface CreateRfqRequest {
  /** Segment
   * R = Normal 0RFQ (default)
   * C = CDMDF RFQ
   */
  segment?: "R" | "C";

  /** ISIN code */
  isin: string;

  /** Logged-in user's participant code */
  participantCode: string;

  /** Deal type: D = Direct, B = Brokered */
  dealType: "D" | "B";

  /** Client code of RFQ initiator */
  clientCode: string;

  /** Buy/Sell indicator:
   * B = Buy, S = Sell, X = Both
   */
  buySell: "B" | "S" | "X";

  /** Quote Type:
   * Y = Only Yield, B = Both Price and Yield
   */
  quoteType: "Y" | "B";

  /** Settlement Type:
   * 0 = T+0, 1 = T+1
   */
  settlementType: number;

  /** RFQ value in crores */
  value: number;

  /** RFQ number of bonds */
  quantity?: number;

  /** Yield type (Buy leg): YTM / YTP / YTC */
  yieldType: "YTM" | "YTP" | "YTC";

  /** Yield value (Buy leg) */
  yield: number;

  /** Calculation method (Buy leg): M = Money Market, O = Other */
  calcMethod: "M" | "O";

  /** Price (Buy leg) — required if quoteType = "B" */
  price?: number | null;

  /** Sell RFQ fields (used only when buySell = "X") */
  valueSell?: number | null;
  quantitySell?: number | null;
  yieldTypeSell?: "YTM" | "YTP" | "YTC" | null;
  yieldSell?: number | null;
  calcMethodSell?: "M" | "O" | null;
  priceSell?: number | null;

  /** Good-till-day flag: Y = valid till day, null = use endTime */
  gtdFlag?: "Y" | null;

  /** RFQ expiry time (HH:mm), required if gtdFlag = null */
  endTime?: string;

  /** Quote negotiable flag: Y = negotiable, null = not negotiable */
  quoteNegotiable?: "Y" | null;

  /** Value negotiable flag: Y = negotiable, null = not negotiable */
  valueNegotiable?: "Y" | null;

  /** Minimum quote value (valid if valueNegotiable = "Y") */
  minFillValue?: number;

  /** Quote value step size (valid if valueNegotiable = "Y") */
  valueStepSize?: number;

  /** Anonymous flag: Y = anonymous, null = not anonymous */
  anonymous?: "Y" | null;

  /** Access type:
   * 1 = OTM (One to many)
   * 2 = OTO (One to one)
   * 3 = IST (Inter scheme transfer)
   */
  access: 1 | 2 | 3;

  /** List of participant groups (required if access = 2 and group-based) */
  groupList?: number[] | null;

  /** List of participants (required if access = 2 and participant-based) */
  participantList?: string[] | null;

  /** Sector/category */
  category?: string;

  /** Rating */
  rating?: string;

  /** Remarks or notes */
  remarks?: string;
}

export interface CreateRfqResponseItem {
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
}

/**
 * The API returns an array of RFQs.
 * - For buySell = Both → 2 elements (Buy & Sell RFQs)
 * - For Buy/Sell only → 1 element
 */
export type CreateRfqResponse = CreateRfqResponseItem[];

export interface UpdateRfqRequest {
  number: string;
  settlementType: number;
  value?: number;
  quantity?: number;
  yieldType: "YTM" | "YTP" | "YTC";
  yield: number;
  calcMethod: "M" | "O";
  price?: number | null;
  gtdFlag?: "Y" | null;
  endTime?: string | null;
  quoteNegotiable?: "Y" | null;
  valueNegotiable?: "Y" | null;
  minFillValue?: number;
  valueStepSize?: number;
  anonymous?: "Y" | null;
  access?: "1" | "2" | "3";
  groupList?: number[] | null;
  participantList?: string[] | null;
  categoryList?: string[] | null;
  category?: string | null;
  rating?: string | null;
  remarks?: string | null;
}

export type UpdateRfqResponse = CreateRfqResponse; // Same as add/isin response

export interface GetAllRfqRequest {
  number?: string; // Optional RFQ number
  date?: string; // Format: dd-MMM-yyyy (default current date)
  isin?: string;
  participantCode?: string;
  clientRegType?: "R" | "I" | "U";
  status?: "P" | "W" | "T";
}

export type GetAllRfqResponse = CreateRfqResponse;

export interface GetMarketWatchRfqRequest {
  number?: string; // Optional RFQ number
  isin?: string; // Filter by ISIN
  participantCode?: string; // Filter by participant code
  status?: "P" | "W" | "T"; // Pending / Withdrawn / Traded
  buySell?: "B" | "S"; // Buy or Sell
}

export interface GetMarketWatchRfqResponse {
  segment: string;
  number: string;
  date: string;
  quoteTime: string;
  isin: string;
  buySell: "B" | "S";
  quoteType: "Y" | "B";
  settlementType: number;
  settlementDate: string;
  value: number;
  quantity: number;
  yieldType: "YTM" | "YTP" | "YTC";
  yield: number;
  calcMethod: "M" | "O";
  price: number | null;
  gtdFlag: string | null;
  endTime: string;
  quoteNegotiable: "Y" | null;
  valueNegotiable: "Y" | null;
  minFillValue: number | null;
  valueStepSize: number | null;
  dealType: "D" | "B";
  anonymous: "Y" | null;
  access: number;
  category: string | null;
  rating: string | null;
  remarks: string | null;
  status: "P" | "W" | "T";
  clientCode: string;
  participantCode: string;
  tradedValue: number;
  confirmedValue: number;
}

export interface CreateOpenRfqRequest {
  scriptDesc: string;
  openIsinList?: string[]; // Max 50 ISINs
  participantCode: string;
  dealType: "D" | "B";
  clientCode: string;
  buySell: "B" | "S" | "X"; // Buy / Sell / Both
  quoteType: "Y" | "B"; // Only Yield / Both Price and Yield
  value: number;
  valueSell?: number;
  gtdFlag?: "Y" | null;
  endTime?: string | null; // HH:MM if gtdFlag not 'Y'
  minFillValue?: number | null;
  valueStepSize?: number | null;
  anonymous?: "Y" | null;
  access: 1 | 2 | 3; // OTM, OTO, or IST
  groupList?: number[] | null;
  participantList?: string[] | null;
  category?: string | null;
  rating?: string | null;
  remarks?: string | null;
}

export interface CreateOpenRfqResponse {
  number: string;
  date: string;
  quoteTime: string;
  scriptDesc: string;
  openIsinList?: string[];
  buySell: "B" | "S" | "X";
  quoteType: "Y" | "B";
  value: number;
  gtdFlag?: string | null;
  endTime?: string | null;
  minFillValue?: number | null;
  valueStepSize?: number | null;
  dealType: "D" | "B";
  anonymous?: "Y" | null;
  access: number;
  groupList?: number[] | null;
  participantList?: string[] | null;
  category?: string | null;
  rating?: string | null;
  remarks?: string | null;
  status: "P" | "W" | "T";
  clientCode: string;
  participantCode: string;
  userLogin: string;
  tradedValue: number;
  confirmedValue: number;
}

export interface UpdateOpenRfqRequest {
  /** Unique system generated RFQ Number */
  number: string;

  /** Open RFQ description */
  scriptDesc: string;

  /** List of ISINs eligible for open RFQ (max 50) */
  openIsinList?: string[];

  /** RFQ Value in crores */
  value: number;

  /** Flag to indicate RFQ is valid till end of trading hours */
  gtdFlag?: "Y" | null;

  /** RFQ Expiry time (Format: HH24:MM). Mandatory if gtdFlag = null */
  endTime?: string | null;

  /** Minimum quote value in crores (valid only if valueNegotiable = "Y") */
  minFillValue?: number | null;

  /** Quote value step size in crores (valid only if valueNegotiable = "Y") */
  valueStepSize?: number | null;

  /** Flag to indicate that RFQ is anonymous */
  anonymous?: "Y" | null;

  /** RFQ Access Type: 1 = OTM, 2 = OTO, 3 = IST */
  access?: 1 | 2 | 3;

  /** List of participant groups (valid only if access = OTO) */
  groupList?: number[];

  /** List of participant codes (valid only if access = OTO) */
  participantList?: string[];

  /** Sector / category (e.g., NBFC) */
  category?: string;

  /** Rating (e.g., AA, AAA, etc.) */
  rating?: string;

  /** Remarks (optional) */
  remarks?: string;
}

export interface UpdateOpenRfqResponse {
  number: string;
  date: string;
  quoteTime: string;
  scriptDesc: string;
  openIsinList?: string[];
  buySell: string;
  quoteType: "Y" | "B";
  value: number;
  gtdFlag?: string;
  endTime?: string | null;
  minFillValue?: number | null;
  valueStepSize?: number | null;
  dealType: string;
  anonymous?: string;
  access: number;
  groupList?: number[];
  participantList?: string[];
  category?: string;
  rating?: string;
  remarks?: string;
  status: string;
  clientCode: string;
  participantCode: string;
  userLogin: string;
  tradedValue: number;
  confirmedValue: number;
}

// ✅ Request type
export interface WithdrawRfqRequest {
  /** RFQ Number to be withdrawn */
  number: string; // String(15), Mandatory
}

// ✅ Response type (same structure as add/isin or add/open response)
export interface WithdrawRfqResponse {
  segment?: string; // "R" for Retail etc.
  number: string;
  date?: string;
  quoteTime?: string;
  isin?: string;
  scriptDesc?: string;
  openIsinList?: string[];

  buySell: string; // "B" | "S"
  quoteType: "Y" | "B";
  settlementType?: number;
  settlementDate?: string;

  value?: number;
  valueSell?: number | null;
  quantity?: number;
  quantitySell?: number | null;
  yieldType?: string;
  yield?: number;
  calcMethod?: string;
  price?: number;
  yieldTypeSell?: string | null;
  yieldSell?: number | null;
  calcMethodSell?: string | null;
  priceSell?: number | null;

  gtdFlag?: string | null;
  endTime?: string | null;
  quoteNegotiable?: string;
  valueNegotiable?: string;
  minFillValue?: number | null;
  valueStepSize?: number | null;
  dealType?: string; // "D" | "B"
  anonymous?: string; // "Y" | null
  access?: number; // 1 = OTM, 2 = OTO, 3 = IST
  groupList?: string[];
  participantList?: string[];
  category?: string;
  rating?: string;
  remarks?: string;
  status: string; // "W" for withdrawn

  clientCode: string;
  participantCode: string;
  userLogin?: string;

  tradedValue: number;
  confirmedValue: number;
}

export interface CreateNegotiationRequest {
  /** RFQ Number */
  ngRfqNumber: string; // String(15), Mandatory

  /** ISIN — Mandatory if RFQ is of type Open */
  isin?: string; // String(12)

  /** Always logged in user's participant code */
  aeCode: string; // String(30), Mandatory

  /** Deal Type — D = Direct, B = Brokered */
  dealType: "D" | "B"; // String(1), Mandatory

  /** Responder client code */
  clientCode: string; // String(30), Mandatory

  /** Buy/Sell with respect to responder (Opposite of RFQ Buy/Sell) */
  buySell?: "B" | "S"; // Optional

  /** Settlement type — 0 = T+0, 1 = T+1 */
  settlementType: 0 | 1; // Mandatory

  /** Quote Value in crores */
  value: number; // Decimal(10,10)

  /** Quote Quantity — optional, system can compute */
  quantity?: number; // Number

  /** Yield Type — YTM / YTP / YTC */
  yieldType: string; // String(3)

  /** Yield value */
  yield: number; // Decimal(3,4)

  /** Calculation Method — M = Money Market, O = Other */
  calcMethod: "M" | "O"; // String(1)

  /** Price (mandatory only if quoteType = Both Price and Yield) */
  price?: number; // Decimal(3,4)

  /** Valid till end of day? (Y = Yes) */
  gtdFlag?: "Y" | null; // String(1)

  /** Expiry time (HH:mm) if gtdFlag = null */
  endTime?: string | null;

  /** Remarks */
  remarks?: string | null; // String(100)
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

export interface UpdateNegotiationRequest {
  /** Negotiation Thread ID */
  ngId: string; // String(15), Mandatory

  /** Side of negotiation being updated — I = Initiator, R = Responder */
  role: "I" | "R"; // String(1), Mandatory

  /** RFQ Number */
  ngRfqNumber: string; // String(15), Mandatory

  /** Always logged-in user's participant code */
  aeCode: string; // String(30), Mandatory

  /** Deal Type — D = Direct, B = Brokered */
  dealType: "D" | "B"; // String(1), Mandatory

  /** Participant code of the client */
  clientCode: string; // String(30), Mandatory

  /** Settlement type — 0 = T+0, 1 = T+1 */
  settlementType: 0 | 1; // Mandatory

  /** Quote Value (in crores) */
  value: number; // Decimal(10,10), Mandatory

  /** Quote Quantity — optional, system can compute */
  quantity?: number; // Number, Optional

  /** Yield Type — YTM / YTP / YTC */
  yieldType: string; // String(3), Mandatory

  /** Yield value */
  yield: number; // Decimal(3,4), Mandatory

  /** Calculation method — M = Money Market, O = Other */
  calcMethod: "M" | "O"; // String(1), Mandatory

  /** Price — valid only if RFQ quoteType = “Both Price and Yield” */
  price?: number; // Decimal(3,4), Conditional

  /** Valid till day flag */
  gtdFlag?: "Y" | null; // String(1), Optional

  /** Expiry time (mandatory if gtdFlag = null), format HH:mm */
  endTime?: string | null;

  /** Remarks */
  remarks?: string | null; // String(100), Optional
}

export type UpdateNegotiationResponse = CreateNegotiationResponse;

export interface TradeSplit {
  tradeId: string;
  value?: number;
  quantity?: number;
  yield?: number;
  price?: number;
  participantCode?: string;
}

// ----------------------
// Request Types
// ----------------------

export interface WithdrawNegotiationQuoteRequestItem {
  /** RFQ Number */
  rfqNumber: string; // String(15), Mandatory

  /** Negotiation Thread ID */
  id: string; // String(15), Mandatory

  /** Side of negotiation whose quote is being withdrawn
   *  I = Initiator, R = Responder
   */
  role: "I" | "R"; // String(1), Mandatory
}

/** Array of negotiation threads to withdraw */
export type WithdrawNegotiationQuoteRequest =
  WithdrawNegotiationQuoteRequestItem[];

// ----------------------
// Response Types
// ----------------------

export interface WithdrawNegotiationQuoteResponseItem {
  date: string | null;
  acceptedCalcMethod: string | null;
  tradeNumber: string | null;
  initQuoteTime: string | null;
  initSettlementType: number | null;
  respAeCode: string | null;
  tradeSplits: TradeSplit[] | null;
  initSettlementDate: string | null;
  initAccruedInterest: number | null;
  acceptedValue: number | null;
  confirmedPriceQuoteTime: string | null;
  initGtdFlag: string | null;
  initYield: number | null;
  respAccruedInterest: number | null;
  confirmStatus: string | null;
  id: string;
  initYieldType: string | null;
  respPrice: number | null;
  initLoginId: string | null;
  respQuoteTime: string | null;
  respEndTime: string | null;
  acceptedBySide: string | null;
  respCalcMethod: string | null;
  initAeCode: string | null;
  acceptedSettlementDate: string | null;
  acceptedPrice: number | null;
  respGtdFlag: string | null;
  acceptedQuantity: number | null;
  acceptedByLoginId: string | null;
  acceptedAccruedInterest: number | null;
  respConsideration: number | null;
  initQuantity: number | null;
  status: string | null;
  respSettlementDate: string | null;
  respValue: number | null;
  respLoginId: string | null;
  initPrice: number | null;
  respYieldType: string | null;
  acceptedYieldType: string | null;
  acceptedSettlementType: number | null;
  acceptedConsideration: number | null;
  respSettlementType: number | null;
  respRemarks: string | null;
  initValue: number | null;
  initCalcMethod: string | null;
  buySell: "B" | "S" | null;
  acceptedQuoteTime: string | null;
  initAuId: string | null;
  rfqNumber: string;
  acceptedPutCallDate: string | null;
  acceptedYield: number | null;
  respYield: number | null;
  initConsideration: number | null;
  initEndTime: string | null;
  respQuantity: number | null;
  isin: string | null;
  initRemarks: string | null;
  lastActivityTimestamp: string | null;
}

/** Response: List of withdrawn negotiation threads */
export type WithdrawNegotiationQuoteResponse = CreateNegotiationResponse[];

/**
 * Request schema for POST /rest/v1/negotiation/terminate
 */
export interface TerminateNegotiationRequest {
  /** RFQ Number (String(15)) */
  rfqNumber: string;

  /** Negotiation Thread Id (String(15)) */
  id: string;

  /** Side of negotiation */
  role: "I" | "R"; // I = Initiator, R = Responder
}

/**
 * Response schema for POST /rest/v1/negotiation/terminate
 * Structure same as /rest/v1/negotiation/add response
 */
export type TerminateNegotiationResponse = CreateNegotiationResponse;

export interface AcceptNegotiationQuoteRequest {
  /** RFQ Number */
  rfqNumber: string; // String(15), Mandatory

  /** Accepted Quote Value in crores */
  acceptedValue: number; // Decimal(10,10), Mandatory

  /** Negotiation Thread Id (optional for direct acceptance) */
  id?: string | null; // String(15), Optional

  /** Accepted Quote Settlement Date (Format: DD-MMM-YYYY) */
  acceptedSettlementDate?: string;

  /** Accepted Quote Yield Type (YTM / YTP / YTC) */
  acceptedYieldType?: "YTM" | "YTP" | "YTC"; // String(3), Optional

  /** Accepted Quote Yield */
  acceptedYield?: number; // Decimal(3,4), Optional

  /** Accepted Quote Price */
  acceptedPrice?: number; // Decimal(3,4), Optional

  /** Deal Type: D = Direct (default), B = Brokered */
  respDealType?: "D" | "B"; // Conditional — required if id is null

  /** Client Code (required for direct acceptance) */
  respClientCode?: string; // String(30), Conditional

  /** Side whose quote is being accepted (I = initiator, R = responder) */
  role?: "I" | "R"; // Conditional
}

export type AcceptNegotiationQuoteResponse = CreateNegotiationResponse;

// Request
export interface NegotiationAllRequest {
  /** RFQ Number */
  rfqNumber?: string | null; // String(15)

  /** Negotiation Thread Id */
  id?: string | null; // String(15)

  /** Filter by Date (defaults to current date) */
  date?: string | null; // Date (DD-MMM-YYYY)

  /** ISIN */
  isin?: string | null; // String(12)

  /** Buy/Sell with respect to responder (B = Buy, S = Sell) */
  buySell?: "B" | "S" | null;

  /** Negotiation thread status: N/R/A/C/E */
  status?: "N" | "R" | "A" | "C" | "E" | null;

  /** Trade Number */
  tradeNumber?: string | null; // String(15)

  /** Consideration confirmation status */
  confirmStatus?: "PP" | "PC" | "PR" | "CA" | "CC" | "CR" | null;

  /** From timestamp filter */
  fromTimestamp?: string | null; // DateTime

  /** To timestamp filter */
  toTimestamp?: string | null; // DateTime
}

// Response

export type NegotiationAllResponse = CreateNegotiationResponse[];

export interface DealProposeRequest {
  /** RFQ Number */
  ngRfqNumber: string; // String(15), Mandatory

  /** Negotiation Thread Id */
  ngId: string; // String(15), Mandatory

  /** Always logged-in user’s participant code */
  participantCode: string; // String(30), Mandatory

  /** Final Deal Type: D = Direct, B = Brokered */
  dealType: "D" | "B"; // String(1), Mandatory

  /** Final Client Code */
  clientCode: string; // String(30), Mandatory

  /** Proposed Price (mandatory if quote type is Only Yield) */
  price: number; // Decimal(3,4), Mandatory

  /** Accrued Interest */
  accruedInterest: number; // Decimal(15,2), Mandatory

  /** Total Consideration */
  consideration: number; // Decimal(15,2), Mandatory

  /** Yield / Price Calculation Method: M = Money Market, O = Other */
  calcMethod: "M" | "O"; // String(1), Mandatory

  /** Put/Call date (mandatory if yield type = YTP or YTC) */
  putCallDate?: string | null; // Date (DD-MMM-YYYY), Optional

  /** Remarks */
  remarks?: string | null; // String(100), Optional

  /** List of trade splits */
  tradeSplits?: TradeSplit[] | null; // Optional

  /** Side whose consideration is being proposed: I = Initiator, R = Responder */
  role?: "I" | "R" | null; // Optional
}

export type DealProposeResponse = CreateNegotiationResponse;

export interface DealAcceptRejectRequest {
  /** RFQ Number */
  rfqNumber: string; // e.g. "R22120900000020"

  /** Negotiation Thread Id */
  id: string; // e.g. "N22120900000048"

  /** Accepted Price (must match proposed if provided) */
  acceptedPrice?: number; // Decimal(3,4)

  /** Accepted Put/Call Date (must match proposed if provided) */
  acceptedPutCallDate?: string | null; // Date

  /** Accepted Accrued Interest (must match proposed if provided) */
  acceptedAccruedInterest?: number; // Decimal(15,2)

  /** Accepted Consideration (must match proposed if provided) */
  acceptedConsideration?: number; // Decimal(15,2)

  /** Confirmation Status */
  confirmStatus: "PC" | "PR"; // PC = Accept, PR = Reject
}

export type DealAcceptRejectResponse = CreateNegotiationResponse;

export interface DealTradeSplitRequest {
  /** RFQ Number */
  rfqNumber: string; // String(15), Mandatory

  /** Negotiation Thread Id */
  id: string; // String(15), Mandatory

  /** List of trade splits (optional) */
  tradeSplits?: TradeSplit[];
}

export type DealTradeSplitResponse = CreateNegotiationResponse;

export interface DealChangeClientRequest {
  /** RFQ Number */
  ngRfqNumber: string; // String(15), Mandatory

  /** Negotiation Thread Id */
  ngId: string; // String(15), Mandatory

  /** Deal Type — D = Direct, B = Brokered */
  dealType: "D" | "B"; // String(1), Mandatory

  /** Client code (Broker, Institutional, or Retail participant) */
  clientCode: string; // String(30), Mandatory

  /** B = Change Buy Client, S = Change Sell Client */
  buySell: "B" | "S"; // String(1), Mandatory
}

export type DealChangeClientResponse = CreateNegotiationResponse;

export interface DealAmendModifyCancelRequest {
  /** RFQ Number corresponding to the deal */
  rfqNumber: string; // String(15), Mandatory

  /** Negotiation Thread Id corresponding to the deal */
  ngId: string; // String(15), Mandatory

  /** Request Type — M = Modification, C = Cancellation */
  requestType: "M" | "C"; // String(1), Mandatory

  /** New Yield Type — Required only if requestType=M */
  modYieldType?: "YTM" | "YTP" | "YTC"; // String(1), Conditional

  /** New Accrued Interest — Required only if requestType=M */
  modAccruedInterest?: number; // Decimal(15,2), Conditional

  /** New Settlement Type — 0 = T+0, 1 = T+1 (Required if M) */
  modSettlementType?: number; // Number, Conditional

  /** Modification Reason (Appendix A) — Required if requestType=M */
  modReason?: string; // String(10), Conditional

  /** Cancellation Reason (Appendix A) — Required if requestType=C */
  cancReason?: string; // String(10), Conditional

  /** Optional remarks for counter party (only if requestType=M) */
  proposerRemarks?: string | null; // String(200), Optional

  /** Optional list of trade splits (only if original trade had splits) */
  tradeSplits?: TradeSplitModRequest[]; // Optional
}

/** Trade Split Modification structure */
export interface TradeSplitModRequest {
  /** Trade/Deal number of the split trade */
  trdNo: string; // String(15)

  /** Modified Accrued Interest */
  modAccInt: number; // Decimal(15,2)

  /** Modified Consideration */
  modCons: number; // Decimal(15,2)
}

export interface DealAmendModifyCancelResponse {
  id: number;
  rfqNumber: string;
  ngId: string;
  requestType: "M" | "C";
  date: string; // DD-MMM-YYYY
  tradeNumber: string;
  isin: string;
  description: string;
  buyerAeCode: string;
  buyerClientCode: string;
  sellerAeCode: string;
  sellerClientCode: string;
  value: number;
  quantity: number;
  yieldType: string;
  yield: number;
  price: number;
  accruedInterest: number;
  consideration: number;
  settlementType: number;
  settlementDate: string; // DD-MMM-YYYY

  // Modification fields (conditional)
  modYieldType?: string;
  modAccruedInterest?: number;
  modConsideration?: number;
  modSettlementType?: number;
  modSettlementDate?: string; // DD-MMM-YYYY
  modReason?: string;

  // Cancellation fields (conditional)
  cancReason?: string;

  // Common metadata
  proposerAeCode: string;
  proposerTime: string; // HH:MM:SS
  proposerRemarks?: string | null;
  counterAeCode: string;
  counterTime?: string | null; // HH:MM:SS
  counterRemarks?: string | null;
  approvalStatus: "PP" | "CR" | "EA";

  // Optional list of trade splits
  tradeSplits?: TradeSplitModResponse[];
}

/** Trade Split Modification Response */
export interface TradeSplitModResponse {
  trdNo: string;
  accInt: number;
  cons: number;
  modAccInt: number;
  modCons: number;
}

export interface GetAllDealAmendmentsRequest {
  /** Unique ID assigned to amendment request */
  id?: number; // Optional

  /** RFQ Number */
  rfqNumber?: string; // String(15), Optional

  /** Negotiation Id */
  ngId?: string; // String(15), Optional

  /** Request Type — M = Modification, C = Cancellation */
  requestType?: "M" | "C"; // String(1), Optional

  /** From RFQ Date */
  filtFromDate?: string; // Date (DD-MMM-YYYY), Mandatory

  /** To RFQ Date */
  filtToDate?: string; // Date (DD-MMM-YYYY), Mandatory
}

export type GetAllDealAmendmentsResponse = DealAmendModifyCancelResponse[];

export interface UpdateDealAmendStatusRequest {
  /** Unique ID assigned to amendment request */
  id: number; // Mandatory

  /** Approval status: CR = Reject, EA = Approve */
  approvalStatus: "CR" | "EA"; // Mandatory

  /** Optional counterparty remarks */
  counterRemarks?: string | null; // Optional, String(200)
}

export type UpdateDealAmendStatusResponse = DealAmendModifyCancelResponse;

export interface Participant {
  /** Participant code */
  code: string; // String(30), Mandatory

  /** Participant name */
  name: string; // String(250), Mandatory
}

export type GetAllParticipantsResponse = Participant[];

// Request
export interface GetAllIsinsRequest {
  /** ISIN symbol */
  symbol?: string; // String(12), Optional

  /** Issue Description (supports wildcard search) */
  description?: string; // String(200), Optional

  /** Issuer name (supports wildcard search) */
  issuer?: string; // String(100), Optional

  /** Filter for issue category */
  filtIssueCategory?: "CB" | "CP" | "CD" | "SD" | "GS"; // Optional

  /** Filter for issue maturity in years */
  filtMaturity?: "0^1" | "1^3" | "3^5" | "5^7" | "7^10" | "10^"; // Optional

  /** Filter for coupon rate range */
  filtCoupon?: "0^3" | "3^5" | "5^6" | "6^7" | "7^8" | "8^9" | "9^10" | "10^"; // Optional
}

// Response
export interface IsinRecord {
  symbol: string; // String(12)
  description: string; // String(200)
  issuer: string; // String(100)
  maturityDate: string; // Date (e.g., "31-Dec-2025")
  couponRate: number; // Decimal(3,4)
  faceValue: number; // Decimal(15,2)
  type: string; // String(2)
  issueCategory: "CB" | "CP" | "CD" | "SD" | "GS";
  listed: "Y" | "N";
}

export type GetAllIsinsResponse = IsinRecord[];

// Request
export interface CalcPriceRequest {
  /** ISIN */
  isin: string; // String(12)

  /** Settlement Date (e.g., "10-Dec-2022") */
  settlementDate: string; // Date

  /** Yield Type — YTM / YTP / YTC */
  yieldType: "YTM" | "YTP" | "YTC";

  /** Yield value */
  yield: number; // Decimal(3,4)

  /** Accrued Interest Day Count Convention */
  aiDcc: 1 | 2 | 3 | 4;
  /**
   * 1 = Actual/Actual
   * 2 = 30/360 - European
   * 3 = 30/360 - American
   * 4 = Actual/365
   */
}

// Response
export interface CalcPriceResponse {
  /** Yield / Price calculation method */
  calcMethod: "M" | "O"; // M = Money Market, O = Other

  /** Price calculated */
  price: number; // Decimal(15,2)

  /** Accrued Interest */
  accruedInterest: number; // Decimal(3,4)

  /** Put/Call Date — only for YTP / YTC */
  putCallDate?: string; // Date, optional
}

// Response type for GET /rest/v1/market/timings
export interface MarketTiming {
  /** Issue Type — e.g. "CD", "CP", "DEFAULT" */
  type: string; // String(2)

  /** T0 Start time of day (milliseconds from midnight) */
  starttimeT0: number;

  /** T1 Start time of day (milliseconds from midnight) */
  starttimeT1: number;

  /** RFQ initiation & negotiation cutoff time for T0 */
  yieldcutoffT0: number;

  /** RFQ initiation & negotiation cutoff time for T1 */
  yieldcutoffT1: number;

  /** Consideration confirmation cutoff time for T0 */
  pricecutoffT0: number;

  /** Consideration confirmation cutoff time for T1 */
  pricecutoffT1: number;
}

// Request type for POST /rest/v1/debar/all
export interface DebarredClientsRequest {
  /** PAN of the client (optional) */
  pan?: string | null; // String(10), optional

  /** Debarment period start date (dd-MMM-yyyy) */
  filtFromDate: string; // Date, mandatory

  /** Debarment period end date (dd-MMM-yyyy) */
  filtToDate: string; // Date, mandatory
}

// Response type for each record
export interface DebarredClient {
  /** PAN of the client */
  pan?: string; // String(10), optional

  /** Name of the participant */
  name?: string; // String(30), optional

  /** Debarment end date (format: dd-MMM-yyyy) */
  endDate: string; // Date, mandatory
}

/** Request type for fetching open RFQs */
export interface GetOpenRfqRequest {
  /** Filter to fetch RFQ by number */
  number?: string;

  /** RFQ Date (default: current date). Format: dd-MMM-yyyy */
  date?: string;

  /** Filter by initiator participant code */
  participantCode?: string;
}

/** Represents one open RFQ record */
export interface RfqOpenRecord {
  /** Unique RFQ number */
  number: string;

  /** Description of the script/bond */
  scriptDesc: string;

  /** List of ISINs for which the RFQ is open */
  openIsinList: string[];

  /** Buy or Sell indicator: B = Buy, S = Sell */
  buySell: "B" | "S";

  /** Quote Type — e.g., B = Best, etc. */
  quoteType: "Y" | "B";

  /** RFQ total buy value */
  value: number | null;

  /** RFQ total sell value (if applicable) */
  valueSell: number | null;

  /** GTD flag — Y = Good till date, N = otherwise */
  gtdFlag: "Y" | "N" | null;

  /** End time for RFQ (if applicable) */
  endTime: string | null;

  /** Minimum fill value (if applicable) */
  minFillValue: number | null;

  /** Step size for value increments */
  valueStepSize: number | null;

  /** Deal Type — D = Direct, etc. */
  dealType: string;

  /** Anonymous flag — Y/N */
  anonymous: "Y" | "N";

  /** Access level (e.g., 1 = Public, 2 = Restricted) */
  access: number;

  /** Group IDs associated with the RFQ */
  groupList: string[];

  /** Participant codes allowed in this RFQ */
  participantList: string[];

  /** Category of issuer (e.g., NBFC, Bank, etc.) */
  category: string | null;

  /** Credit rating (e.g., AA, AAA, etc.) */
  rating: string | null;

  /** Remarks entered by initiator */
  remarks: string | null;

  /** RFQ status — e.g., P = Pending/Open */
  status: string;

  /** Client code associated with RFQ */
  clientCode: string | null;

  /** Participant code of initiator */
  participantCode: string;

  /** User login who initiated RFQ */
  userLogin: string;

  /** Traded value till now */
  tradedValue: number;

  /** Confirmed value till now */
  confirmedValue: number;
}

/** Response type — list of open RFQs */
export type GetOpenRfqResponse = RfqOpenRecord[];
