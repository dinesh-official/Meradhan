import type { BaseResponseData } from "../../../../types/base";

export interface Order {
  id: number;
  orderNumber: string;
  customerProfileId: number;
  paymentProvider?: string | null;
  paymentOrderId?: string | null;
  paymentId?: string | null;
  paymentMetadata?: Record<string, unknown>;
  paymentStatus: "PENDING" | "COMPLETED";
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
  metadata?: Record<string, unknown>;
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
