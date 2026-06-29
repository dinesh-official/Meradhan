import type { BaseResponseData } from "../../../../types/base";

export type GetPaymentGatewayModeResponse = BaseResponseData<{
  paymentGatewayMode: "PAYMENT" | "INQUIRY";
}>;

export interface Order {
  id: number;
  orderNumber: string;
  customerProfileId: number;
  paymentProvider?: string | null;
  paymentOrderId?: string | null;
  paymentId?: string | null;
  paymentMetadata?: Record<string, unknown>;
  paymentStatus: "PENDING" | "COMPLETED" | "CANCELLED" | "REFUNDED";
  /** Matches Prisma `OrderStatus` (orders.prisma). */
  status:
    | "PENDING"
    | "SETTLED"
    | "APPLIED"
    | "REJECTED"
    | "EXPIRED"
    | "CANCELLED"
    | "IN_PROGRESS";
  /**
   * NSE `settle_order.settleStatus` (0–9) when the order is linked via `metadata.rfqNumber`
   * to a row in `settle_order`. Null when no settlement row exists yet.
   */
  settleStatus?: number | null;
  /** NSE `settle_order.modSettleDate` when linked via `metadata.rfqNumber` (often DD-MM-YYYY). */
  settlementDate?: string | null;
  subTotal: string;
  stampDuty: string;
  totalAmount: string;
  /** Accrued interest (₹) from NSE settlement when settled, else checkout pricing snapshot. */
  accruedInterest?: number | null;
  /** Settlement amount (₹) from NSE when settled, else checkout pricing snapshot / totalAmount. */
  settlementAmount?: number | null;
  isin: string;
  bondName: string;
  faceValue: string;
  quantity: number;
  unitPrice: string;
  bondDetails: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  /** NSE trade number after deal proposal; joins to `settle_order.orderNumber` when set. */
  reqOrderNumber?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderHistoryMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface OrderHistoryResponse {
  data: Order[];
  meta: OrderHistoryMeta;
}

export type GetOrderHistoryResponse = BaseResponseData<OrderHistoryResponse>;
