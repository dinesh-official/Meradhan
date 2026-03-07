export interface CrmOrder {
  id: number;
  orderNumber: string;
  bondName: string;
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
  createdAt: string;
  updatedAt: string;
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
