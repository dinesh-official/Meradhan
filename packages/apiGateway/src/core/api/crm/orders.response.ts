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
