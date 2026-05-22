export type LoginAPI = {
    "REQUEST": {
        domain: string;
        login: string;
        password: string;
    },
    "RESPONSE": {
        lastLogin: number;
        brokerEnablementType: string;
        loginKey: string;
        domain: string;
        serverTime: number;
        login: string;
        broker: boolean;
        status: string;
    }
}

export type ISIN_ADD_API = {
    "REQUEST": CreateRfqRequest,
    "RESPONSE": CreateRfqResponseItem
}

export type Accept_Negotiation_API = {
    "REQUEST": AcceptNegotiationQuoteRequest,
    "RESPONSE": CreateNegotiationResponse
}


export type DEAL_PROPOSE_API = {
    "REQUEST": DealProposeRequest,
    "RESPONSE": CreateNegotiationResponse
}

export type Accept_DEAL_PROPOSE_API = {
    "REQUEST": DealAcceptRejectRequest,
    "RESPONSE": CreateNegotiationResponse
}


interface CreateRfqRequest {
    /** Segment
     * R = Normal 0RFQ (default)
     * C = CDMDF RFQ
     */
    segment: "R" | "C";

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
    quantity: number;

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

interface CreateRfqResponseItem {
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

interface AcceptNegotiationQuoteRequest {
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

interface DealProposeRequest {
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

interface TradeSplit {
    tradeId: string;
    value?: number;
    quantity?: number;
    yield?: number;
    price?: number;
    participantCode?: string;
}


