export interface CrmOrder {
  id: number;
  orderNumber: string;
  isin: string;
  bondName: string;
  paymentOrderId?: string | null;
  paymentId?: string | null;
  reqOrderNumber?: string | null;
  quantity: number;
  faceValue: string;
  totalAmount: string;
  status: "PENDING" | "SETTLED" | "APPLIED" | "REJECTED";
  bondDetails: Record<string, unknown>;
  createdAt: string;
  customerProfile: {
    firstName: string;
    lastName: string;
    emailAddress: string;
    phoneNo?: string;
  };
}

export interface GetCrmOrdersResponse {
  responseData: {
    data: CrmOrder[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

/** `draft_orders.pricingData` — bond order pricing snapshot when draft was saved. */
export interface CrmDraftOrderRow {
  id: number;
  isin: string;
  quantity: number;
  sellPrice: number;
  userId: number;
  /** Display name from `CustomerProfileDataModel` (entity or personal name). */
  customerName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  pricingData: Record<string, unknown> | null;
}

export interface GetCrmDraftOrdersResponse {
  responseData: {
    data: CrmDraftOrderRow[];
  };
}

/** CRM proceed-from-draft: order create + NSE add-ISIN (RFQ) + `metadata.rfqNumber`. */
export interface CrmProceedDraftOrderData {
  orderId: number;
  orderNumber: string;
  paymentOrderId?: string;
  amount: number;
  currency: string;
  key: string;
  rfqNumber?: string;
}

export interface CrmProceedDraftOrderResponse {
  responseData: CrmProceedDraftOrderData;
}

export interface CancelCrmDraftOrderData {
  id: number;
  status: string;
}

export interface CancelCrmDraftOrderResponse {
  responseData: CancelCrmDraftOrderData;
}

export interface OrderLog {
  id: number;
  orderId: number;
  step: string;
  status: string;
  outputData: Record<string, unknown>;
  details: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface OrderSettlementAutomationLog {
  id: number;
  orderId: number | null;
  paymentId: string;
  batchId: string;
  step: string;
  status: string;
  message: string | null;
  inputData: Record<string, unknown> | null;
  outputData: Record<string, unknown> | null;
  errorData: Record<string, unknown> | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentProcessLogGroup {
  paymentId: string;
  totalLogs: number;
  latestStatus: string;
  latestCreatedAt: string | null;
  logs: OrderSettlementAutomationLog[];
}

export interface CrmOrderDetails {
  id: number;
  orderNumber: string;
  customerProfileId: number;
  paymentProvider: string | null;
  paymentOrderId: string | null;
  paymentId: string | null;
  paymentMetadata: Record<string, unknown>;
  paymentStatus: "PENDING" | "COMPLETED" | "REFUNDED" | "CANCELLED";
  status: "PENDING" | "SETTLED" | "APPLIED" | "REJECTED";
  subTotal: string;
  stampDuty: string;
  totalAmount: string;
  isin: string;
  bondName: string;
  faceValue: string;
  quantity: number;
  unitPrice: string;
  bondDetails: Record<string, unknown>;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  customerProfile: {
    id: number;
    firstName: string;
    lastName: string;
    emailAddress: string;
    phoneNo: string | null;
  };
  orderLogs: OrderLog[];
  settlementAutomationLogs: OrderSettlementAutomationLog[];
  customerBonds: {
    id: number;
    customerProfileId: number;
    orderId: number;
    isin: string;
    bondName: string;
    faceValue: string;
    quantity: number;
    purchasePrice: string;
    purchaseDate: string;
    metadata: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
  } | null;
}

export interface GetCrmOrderDetailsResponse {
  responseData: CrmOrderDetails;
}

export interface GetPaymentProcessLogsResponse {
  responseData: {
    groups: PaymentProcessLogGroup[];
  };
}

/** Settle order (RFQ) record returned by GET /crm/orders/rfq/:orderNumber */
export interface RfqByOrderNumberSettleOrder {
  id: number;
  orderNumber: string;
  symbol: string;
  buySell?: "B" | "S" | "X" | string;
  buyParticipantLoginId: string;
  sellParticipantLoginId: string;
  price: string | number;
  yieldType: string;
  yield: string | number;
  value: string | number;
  buyerRefNo: string | null;
  sellerRefNo: string | null;
  buyBackofficeLoginId: string | null;
  sellBackofficeLoginId: string | null;
  buyBrokerLoginId: string | null;
  sellBrokerLoginId: string | null;
  source: number;
  modSettleDate: string | null;
  modQuantity: string | number | null;
  modAccrInt: string | number | null;
  modConsideration: string | number | null;
  settlementNo: string | null;
  stampDutyAmount: string | number | null;
  stampDutyBearer: string | null;
  buyerFundPayinObligation: string | number | null;
  sellerFundPayoutObligation: string | number | null;
  fundPayinRefId: string | null;
  settleStatus: number;
  secPayinQuantity: string | number | null;
  secPayinRemarks: string | null;
  secPayinTime: string | null;
  fundsPayinAmount: string | number | null;
  fundsPayinRemarks: string | null;
  fundsPayinTime: string | null;
  payoutRemarks: string | null;
  payoutTime: string | null;
  ifscCode: string | null;
  accountNo: string | null;
  utrNumber: string | null;
  dpId: string | null;
  benId: string | null;
  /// Set when the settle order has been tagged with an external NSE RFQ
  /// participant code (via the CRM "Assign as NSE participant" flow or
  /// the `asign-order.ts` CLI). Null for orders owned by Meradhan
  /// customers.
  linkedRfqParticipantCode: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Response of `POST /api/crm/orders/assign-rfq-participant`. */
export interface AssignRfqParticipantResponseData {
  orderNumber: string;
  linkedRfqParticipantCode: string;
  participantName: string;
  matchesBuySide: boolean;
  matchesSellSide: boolean;
}

export interface AssignRfqParticipantResponse {
  responseData: AssignRfqParticipantResponseData | null;
  message?: string;
}

export interface GetRfqByOrderNumberResponse {
  responseData: RfqByOrderNumberSettleOrder | null;
}

/** Bank/demat items from customer profile */
export interface CustomerBankAccount {
  id: number;
  accountNo?: string;
  ifscCode?: string;
  isPrimary?: boolean;
  [key: string]: unknown;
}

export interface CustomerDematAccount {
  id: number;
  dpId?: string;
  benId?: string;
  [key: string]: unknown;
}

/** Order with full customer profile (GET /crm/orders/customer/:orderNumber) */
export interface CustomerFullOrder {
  id: number;
  orderNumber: string;
  customerProfileId: number;
  isin: string;
  bondName: string;
  quantity: number;
  unitPrice: string | number;
  totalAmount: string | number;
  status: string;
  createdAt: string;
  updatedAt: string;
  customerProfile: {
    id: number;
    firstName: string;
    lastName: string;
    middleName?: string | null;
    emailAddress: string;
    phoneNo: string | null;
    userName?: string;
    kycStatus?: string;
    gender?: string;
    bankAccounts?: CustomerBankAccount[];
    dematAccounts?: CustomerDematAccount[];
    panCard?: unknown;
    aadhaarCard?: unknown;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface GetCustomerFullOrderResponse {
  responseData: CustomerFullOrder | null;
}

/** Response from create-from-rfq (order may not include full customerProfile) */
export interface CreateOrderFromRfqResponse {
  responseData: Pick<CustomerFullOrder, "id" | "orderNumber" | "customerProfileId" | "status"> & { [key: string]: unknown };
}

export interface SendOrderPdfEmailResponse {
  message?: string;
  responseData?: {
    messageId?: string;
  };
}

/** Saved “Receipt PDF options” (GET/PUT /crm/orders/receipt-pdf-options/:orderNumber) */
export interface CrmOrderReceiptPdfOptionsRow {
  id: number;
  orderNumber: string;
  accruedInterestDays: number | null;
  settlementNumber: string | null;
  settlementDateTime: string | null;
  lastInterestPaymentDateRaw: string | null;
  lastInterestPaymentDate: string | null;
  interestPaymentDates: string | null;
  nonAmortizedBond: boolean;
  amortizedPrincipalPaymentDates: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetReceiptPdfOptionsResponse {
  responseData: CrmOrderReceiptPdfOptionsRow | null;
}

export interface UpsertReceiptPdfOptionsResponse {
  responseData: CrmOrderReceiptPdfOptionsRow;
}

export type PaymentGatewayMode = "PAYMENT" | "INQUIRY";

export interface GetPaymentGatewaySettingsResponse {
  responseData: {
    paymentGatewayMode: PaymentGatewayMode;
  };
}
