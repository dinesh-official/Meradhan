import { appSchema } from "@root/schema";
import type { AxiosRequestConfig } from "axios";
import type z from "zod";
import type {
  GetCrmOrdersResponse,
  GetCrmOrderDetailsResponse,
  GetRfqByOrderNumberResponse,
  GetCustomerFullOrderResponse,
  CreateOrderFromRfqResponse,
  SendOrderPdfEmailResponse,
} from "./orders.response";
import type { IApiCaller } from "../../connection/apiCaller.interface";

export class CrmOrdersApi {
  private schema = appSchema.crm.orders;

  constructor(private apiClient: IApiCaller) {}

  async getAllOrders(
    query?: z.infer<typeof this.schema.CrmOrdersQuerySchema>,
    config?: AxiosRequestConfig
  ): Promise<GetCrmOrdersResponse> {
    const mergedConfig: AxiosRequestConfig = {
      ...config,
      params: { ...(config?.params ?? {}), ...(query ?? {}) },
    };
    const { data } = await this.apiClient.get<GetCrmOrdersResponse>(
      "/crm/orders/all",
      mergedConfig
    );
    return data;
  }

  async getOrderById(
    orderId: number,
    config?: AxiosRequestConfig
  ): Promise<GetCrmOrderDetailsResponse> {
    const { data } = await this.apiClient.get<GetCrmOrderDetailsResponse>(
      `/crm/orders/${orderId}`,
      config
    );
    return data;
  }

  async updateOrderStatus(
    orderId: number,
    status: "PENDING" | "SETTLED" | "APPLIED" | "REJECTED",
    config?: AxiosRequestConfig
  ): Promise<GetCrmOrderDetailsResponse> {
    const { data } = await this.apiClient.patch<GetCrmOrderDetailsResponse>(
      `/crm/orders/${orderId}/status`,
      { status },
      config
    );
    return data;
  }

  async getRfqByOrderNumber(
    orderNumber: string,
    config?: AxiosRequestConfig
  ): Promise<GetRfqByOrderNumberResponse> {
    const { data } = await this.apiClient.get<GetRfqByOrderNumberResponse>(
      `/crm/orders/rfq/${encodeURIComponent(orderNumber)}`,
      config
    );
    return data;
  }

  async getCustomerFullOrder(
    orderNumber: string,
    config?: AxiosRequestConfig
  ): Promise<GetCustomerFullOrderResponse> {
    const { data } = await this.apiClient.get<GetCustomerFullOrderResponse>(
      `/crm/orders/customer/${encodeURIComponent(orderNumber)}`,
      config
    );
    return data;
  }

  async createOrderFromRfq(
    payload: { orderNumber: string; customerId: number },
    config?: AxiosRequestConfig
  ): Promise<CreateOrderFromRfqResponse> {
    const { data } = await this.apiClient.post<CreateOrderFromRfqResponse>(
      "/crm/orders/create-from-rfq",
      payload,
      config
    );
    return data;
  }

  /** Optional params for PDF: No. of Days, Settlement No., Last Interest Payment Date, Interest Payment Dates, Non-Amortized Bond, Amortized Principal Payment Dates. */
  async getOrderReceiptPdf(
    orderNumber: string,
    pdfParams?: {
      accruedInterestDays?: number;
      settlementNumber?: string;
      settlementDateTime?: string;
      lastInterestPaymentDate?: string;
      interestPaymentDates?: string;
      nonAmortizedBond?: boolean;
      amortizedPrincipalPaymentDates?: string;
    },
    config?: AxiosRequestConfig
  ): Promise<Blob> {
    const params: Record<string, string | number | undefined> = {};
    if (pdfParams?.accruedInterestDays != null) params.accruedInterestDays = pdfParams.accruedInterestDays;
    if (pdfParams?.settlementNumber != null) params.settlementNumber = pdfParams.settlementNumber;
    if (pdfParams?.settlementDateTime != null) params.settlementDateTime = pdfParams.settlementDateTime;
    if (pdfParams?.lastInterestPaymentDate != null) params.lastInterestPaymentDate = pdfParams.lastInterestPaymentDate;
    if (pdfParams?.interestPaymentDates != null) params.interestPaymentDates = pdfParams.interestPaymentDates;
    if (pdfParams?.nonAmortizedBond !== undefined) params.nonAmortizedBond = String(pdfParams.nonAmortizedBond);
    if (pdfParams?.amortizedPrincipalPaymentDates != null) params.amortizedPrincipalPaymentDates = pdfParams.amortizedPrincipalPaymentDates;
    const response = await this.apiClient.get<Blob>(
      `/crm/orders/receipt-pdf/${encodeURIComponent(orderNumber)}`,
      { ...config, params: { ...config?.params, ...params }, responseType: "blob" }
    );
    if (response.status !== 200) {
      let message = "Failed to generate order receipt PDF";
      const data = response.data;
      if (data instanceof Blob && data.type?.includes("json")) {
        try {
          const j = JSON.parse(await data.text());
          message = j.message ?? message;
        } catch {
          // ignore
        }
      }
      throw new Error(message);
    }
    return response.data;
  }

  /** Optional params for Deal PDF: No. of Days, Settlement No., Last Interest Payment Date, Interest Payment Dates, Non-Amortized Bond, Amortized Principal Payment Dates. */
  async getDealSheetPdf(
    orderNumber: string,
    pdfParams?: {
      accruedInterestDays?: number;
      settlementNumber?: string;
      settlementDateTime?: string;
      lastInterestPaymentDate?: string;
      interestPaymentDates?: string;
      nonAmortizedBond?: boolean;
      amortizedPrincipalPaymentDates?: string;
    },
    config?: AxiosRequestConfig
  ): Promise<Blob> {
    const params: Record<string, string | number | undefined> = {};
    if (pdfParams?.accruedInterestDays != null) params.accruedInterestDays = pdfParams.accruedInterestDays;
    if (pdfParams?.settlementNumber != null) params.settlementNumber = pdfParams.settlementNumber;
    if (pdfParams?.settlementDateTime != null) params.settlementDateTime = pdfParams.settlementDateTime;
    if (pdfParams?.lastInterestPaymentDate != null) params.lastInterestPaymentDate = pdfParams.lastInterestPaymentDate;
    if (pdfParams?.interestPaymentDates != null) params.interestPaymentDates = pdfParams.interestPaymentDates;
    if (pdfParams?.nonAmortizedBond !== undefined) params.nonAmortizedBond = String(pdfParams.nonAmortizedBond);
    if (pdfParams?.amortizedPrincipalPaymentDates != null) params.amortizedPrincipalPaymentDates = pdfParams.amortizedPrincipalPaymentDates;
    const response = await this.apiClient.get<Blob>(
      `/crm/orders/deal-pdf/${encodeURIComponent(orderNumber)}`,
      { ...config, params: { ...config?.params, ...params }, responseType: "blob" }
    );
    if (response.status !== 200) {
      let message = "Failed to generate deal sheet PDF";
      const data = response.data;
      if (data instanceof Blob && data.type?.includes("json")) {
        try {
          const j = JSON.parse(await data.text());
          message = j.message ?? message;
        } catch {
          // ignore
        }
      }
      throw new Error(message);
    }
    return response.data;
  }

  async sendPdfEmailToClient(
    orderNumber: string,
    payload: {
      pdfType: "order" | "deal";
      subject: string;
      messageBody: string;
      fromEmail?: string;
      toEmail?: string;
      accruedInterestDays: number;
      settlementNumber?: string;
      settlementDateTime?: string;
      lastInterestPaymentDate?: string;
      interestPaymentDates?: string;
      nonAmortizedBond?: boolean;
      amortizedPrincipalPaymentDates?: string;
    },
    config?: AxiosRequestConfig
  ): Promise<SendOrderPdfEmailResponse> {
    const { data } = await this.apiClient.post<SendOrderPdfEmailResponse>(
      `/crm/orders/send-pdf-email/${encodeURIComponent(orderNumber)}`,
      payload,
      config
    );
    return data;
  }
}
