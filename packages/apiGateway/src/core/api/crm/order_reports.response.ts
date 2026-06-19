export interface OrderReportsKpis {
  orderCount: number;
  distinctCustomers: number;
  sumTotalAmount: string;
  sumSubTotal: string;
  sumStampDuty: string;
  sumQuantity: number;
}

export interface OrderReportsSummaryResponse {
  responseData: {
    kpis: OrderReportsKpis;
    byPaymentStatus: { paymentStatus: string; count: number }[];
    byOrderStatus: { status: string; count: number }[];
    timeBuckets: { bucket: string; orderCount: number; gmv: string }[];
    timeBucketsTruncated?: boolean;
  };
}

export interface OrderReportRegisterRow {
  id: number;
  orderNumber: string;
  createdAt: string;
  updatedAt: string;
  paymentStatus: string;
  status: string;
  paymentProvider: string | null;
  paymentOrderId: string | null;
  paymentId: string | null;
  subTotal: string;
  stampDuty: string;
  totalAmount: string;
  isin: string;
  bondName: string;
  quantity: number;
  unitPrice: string;
  bondDetails?: Record<string, unknown> | null;
  customerProfileId: number | null;
  /**
   * Null when this Order's counterparty is an external NSE RFQ participant
   * rather than a Meradhan customer. UI consumers should fall back to
   * `linkedRfqParticipantCode` in that case.
   */
  customerProfile: {
    id: number;
    firstName: string;
    middleName: string | null;
    lastName: string;
    emailAddress: string;
    userType: string;
    kycStatus: string;
  } | null;
  linkedRfqParticipantCode?: string | null;
}

export interface OrderReportsRegisterResponse {
  responseData: {
    data: OrderReportRegisterRow[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface OrderReportsByIsinRow {
  isin: string;
  bondName: string;
  orderCount: number;
  unitsSold: number;
  revenue: string;
  subTotal: string;
  distinctCustomers: number;
}

export interface OrderReportsByIsinResponse {
  responseData: { data: OrderReportsByIsinRow[] };
}

export interface OrderReportsFunnelResponse {
  responseData: {
    cells: { paymentStatus: string; status: string; count: number }[];
  };
}

export interface OrderReportsByCustomerRow {
  customerProfileId: number;
  customer: {
    id: number;
    firstName: string;
    middleName: string | null;
    lastName: string;
    emailAddress: string;
    userType: string;
    kycStatus: string;
  } | null;
  orderCount: number;
  lifetimeValue: string;
  units: number;
  firstOrderAt: string | null;
  lastOrderAt: string | null;
  favouriteIsin: string | null;
  favouriteIsinOrderCount: number;
}

export interface OrderReportsByCustomerResponse {
  responseData: {
    data: OrderReportsByCustomerRow[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  };
}

export interface OrderReportsHoldingsResponse {
  responseData: {
    data: {
      isin: string;
      bondName: string;
      positionCount: number;
      units: number;
    }[];
  };
}

export interface OrderReportsLogFailuresResponse {
  responseData: {
    data: {
      id: number;
      orderId: number;
      step: string;
      status: string;
      createdAt: string;
    }[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  };
}

export interface OrderReportsSettlementResponse {
  responseData: {
    byStep: { step: string; status: string; count: number }[];
    recent: {
      id: number;
      orderId: number | null;
      paymentId: string;
      batchId: string;
      step: string;
      status: string;
      message: string | null;
      startedAt: string | null;
      completedAt: string | null;
      createdAt: string;
    }[];
  };
}

export interface OrderReportsRevenueRow {
  isin: string;
  bondName: string;
  buyPrice: number | null;
  sellPrice: number | null;
  spreadBps: number | null;
  revenue: string;
  orderCount: number;
}

export interface OrderReportsRevenueResponse {
  responseData: {
    kpis: {
      totalRevenue: string;
      avgSpreadBps: number | null;
      fyRevenue: string;
      mtdRevenue: string;
      fyLabel: string;
      mtdLabel: string;
    };
    rows: OrderReportsRevenueRow[];
  };
}

export interface OrderReportsLifecycleResponse {
  responseData: {
    data: {
      orderId: number;
      orderNumber: string;
      createdAt: string;
      updatedAt: string;
      paymentStatus: string;
      status: string;
      firstSuccessLogAt: string | null;
      approxMsToFirstLog: number | null;
    }[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  };
}

export interface OrderReportsRmPerformanceRow {
  rmId: number | null;
  name: string;
  email: string | null;
  ordersHandled: number;
  conversionRate: number;
  revenueGenerated: string;
  customersAcquired: number;
  avgTicket: string;
  followUpEfficiency: number;
  monthlyTrend: {
    month: string;
    monthKey: string;
    orders: number;
    revenue: string;
  }[];
}

export interface OrderReportsRmPerformanceResponse {
  responseData: {
    data: OrderReportsRmPerformanceRow[];
    meta: { from: string; to: string; totalRms: number };
  };
}
