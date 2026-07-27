import { appSchema } from "@root/schema";
import type { AxiosRequestConfig } from "axios";
import type z from "zod";
import type {
  GetCrmOrdersResponse,
  GetCrmDraftOrdersResponse,
  CrmProceedDraftOrderResponse,
  CancelCrmDraftOrderResponse,
  GetCrmOrderDetailsResponse,
  GetRfqByOrderNumberResponse,
  GetCustomerFullOrderResponse,
  CreateOrderFromRfqResponse,
  AssignRfqParticipantResponse,
  SendOrderPdfEmailResponse,
  GetReceiptPdfOptionsResponse,
  UpsertReceiptPdfOptionsResponse,
  ProposeOrderPricingSnapshotResponse,
  AcceptOrderPricingSnapshotResponse,
  GetPaymentGatewaySettingsResponse,
  GetPaymentProcessLogsResponse,
  PaymentGatewayMode,
  CrmOrderStatus,
  VerifyOrderPaymentResponse,
  VerifyOrderSettlementResponse,
  ResumeOrderSettlementResponse,
} from "./orders.response";
import type { IApiCaller } from "../../connection/apiCaller.interface";

export class CrmOrdersApi {
  private schema = appSchema.crm.orders;

  constructor(private apiClient: IApiCaller) {}

  async getPaymentGatewaySettings(
    config?: AxiosRequestConfig
  ): Promise<GetPaymentGatewaySettingsResponse> {
    const { data } = await this.apiClient.get<GetPaymentGatewaySettingsResponse>(
      "/crm/orders/payment-gateway-settings",
      config
    );
    return data;
  }

  async updatePaymentGatewaySettings(
    payload: { paymentGatewayMode: PaymentGatewayMode },
    config?: AxiosRequestConfig
  ): Promise<GetPaymentGatewaySettingsResponse> {
    const { data } =
      await this.apiClient.patch<GetPaymentGatewaySettingsResponse>(
        "/crm/orders/payment-gateway-settings",
        payload,
        config
      );
    return data;
  }

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

  async getDraftOrders(
    config?: AxiosRequestConfig
  ): Promise<GetCrmDraftOrdersResponse> {
    const { data } = await this.apiClient.get<GetCrmDraftOrdersResponse>(
      "/crm/orders/draft-orders",
      config
    );
    return data;
  }

  async proceedDraftOrder(
    draftId: number,
    config?: AxiosRequestConfig
  ): Promise<CrmProceedDraftOrderResponse> {
    const { data } = await this.apiClient.post<CrmProceedDraftOrderResponse>(
      `/crm/orders/draft-orders/${encodeURIComponent(String(draftId))}/proceed`,
      {},
      config
    );
    return data;
  }

  async cancelDraftOrder(
    draftId: number,
    config?: AxiosRequestConfig
  ): Promise<CancelCrmDraftOrderResponse> {
    const { data } = await this.apiClient.patch<CancelCrmDraftOrderResponse>(
      `/crm/orders/draft-orders/${encodeURIComponent(String(draftId))}/cancel`,
      {},
      config
    );
    return data;
  }

  async getPaymentProcessLogs(
    search?: string,
    config?: AxiosRequestConfig
  ): Promise<GetPaymentProcessLogsResponse> {
    const { data } = await this.apiClient.get<GetPaymentProcessLogsResponse>(
      "/crm/orders/payment-process-logs",
      {
        ...config,
        params: { ...(config?.params ?? {}), ...(search ? { search } : {}) },
      }
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
    status: CrmOrderStatus,
    config?: AxiosRequestConfig
  ): Promise<GetCrmOrderDetailsResponse> {
    const { data } = await this.apiClient.patch<GetCrmOrderDetailsResponse>(
      `/crm/orders/${orderId}/status`,
      { status },
      config
    );
    return data;
  }

  /**
   * Verify this order's Razorpay payment against the live Razorpay status.
   * Backend reads the payment reference stored on the order (paymentId /
   * paymentOrderId). By default this is a *preview* — pass `apply: true`
   * to commit the resolved status to the database.
   */
  async verifyOrderPayment(
    orderId: number,
    options?: { apply?: boolean },
    config?: AxiosRequestConfig
  ): Promise<VerifyOrderPaymentResponse> {
    const { data } = await this.apiClient.post<VerifyOrderPaymentResponse>(
      `/crm/orders/${orderId}/verify-payment`,
      { apply: options?.apply === true },
      config
    );
    return data;
  }

  /**
   * Verify this order's NSE settlement against the live settlement API
   * (`/settle/order/all`). By default this is a *preview* — pass
   * `apply: true` to commit the mapped status to the order.
   */
  async verifyOrderSettlement(
    orderId: number,
    options?: { apply?: boolean },
    config?: AxiosRequestConfig
  ): Promise<VerifyOrderSettlementResponse> {
    const { data } = await this.apiClient.post<VerifyOrderSettlementResponse>(
      `/crm/orders/${orderId}/verify-settlement`,
      { apply: options?.apply === true },
      config
    );
    return data;
  }

  /**
   * Resume settlement from the first incomplete/failed stage (same Redis job path).
   */
  async resumeOrderSettlement(
    orderId: number,
    config?: AxiosRequestConfig
  ): Promise<ResumeOrderSettlementResponse> {
    const { data } = await this.apiClient.post<ResumeOrderSettlementResponse>(
      `/crm/orders/${orderId}/resume-settlement`,
      {},
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
    payload: { orderNumber: string; customerId: number; orderSide?: "BUY" | "SELL" },
    config?: AxiosRequestConfig
  ): Promise<CreateOrderFromRfqResponse> {
    const { data } = await this.apiClient.post<CreateOrderFromRfqResponse>(
      "/crm/orders/create-from-rfq",
      payload,
      config
    );
    return data;
  }

  /**
   * Stamp a settle_order with an external NSE RFQ participant code so the
   * generated PDFs render the participant as the counterparty. The
   * participant must already have a saved info row in
   * `nse_rfq_participant_info` (add via /dashboard/rfqs/nse/rfq-participants).
   */
  async assignRfqParticipantToSettleOrder(
    payload: { orderNumber: string; code: string },
    config?: AxiosRequestConfig
  ): Promise<AssignRfqParticipantResponse> {
    const { data } = await this.apiClient.post<AssignRfqParticipantResponse>(
      "/crm/orders/assign-rfq-participant",
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
      settlementDate?: string;
      dealDate?: string;
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
    if (pdfParams?.settlementDate != null) params.settlementDate = pdfParams.settlementDate;
    if (pdfParams?.dealDate != null) params.dealDate = pdfParams.dealDate;
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
      settlementDate?: string;
      dealDate?: string;
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
    if (pdfParams?.settlementDate != null) params.settlementDate = pdfParams.settlementDate;
    if (pdfParams?.dealDate != null) params.dealDate = pdfParams.dealDate;
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
      pdfType: "order" | "deal" | "both";
      subject: string;
      messageBody: string;
      fromEmail?: string;
      toEmail?: string;
      accruedInterestDays: number;
      settlementDate?: string;
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

  async sendProposalEmail(
    payload: {
      toEmail: string;
      customerName: string;
      side: "BUY" | "SELL";
      bondName: string;
      isin: string;
      dealDate?: string;
      settlementDate?: string;
      quantum?: number;
      quantity: number;
      rate?: number;
      ytmAnn?: number | null;
      lastIpDate?: string | null;
      noOfDays?: number | null;
      principalAmount?: number | null;
      accruedInterest?: number | null;
      totalConsideration?: number | null;
      stampDuty?: number | null;
      settlementAmount?: number | null;
      maturityDate?: string | null;
      faceValue?: number | null;
      cleanPrice?: number | null;
      couponRate?: number | null;
      gender?: string | null;
      customerProfileId?: number | null;
    },
    config?: AxiosRequestConfig
  ): Promise<SendOrderPdfEmailResponse> {
    const { data } = await this.apiClient.post<SendOrderPdfEmailResponse>(
      "/crm/orders/send-proposal-email",
      payload,
      config
    );
    return data;
  }

  async getReceiptPdfOptions(
    orderNumber: string,
    config?: AxiosRequestConfig
  ): Promise<GetReceiptPdfOptionsResponse> {
    const { data } = await this.apiClient.get<GetReceiptPdfOptionsResponse>(
      `/crm/orders/receipt-pdf-options/${encodeURIComponent(orderNumber)}`,
      config
    );
    return data;
  }

  async upsertReceiptPdfOptions(
    orderNumber: string,
    payload: {
      accruedInterestDays?: number;
      settlementNumber?: string | null;
      settlementDateTime?: string | null;
      lastInterestPaymentDateRaw?: string | null;
      lastInterestPaymentDate?: string | null;
      interestPaymentDates?: string | null;
      nonAmortizedBond?: boolean;
      amortizedPrincipalPaymentDates?: string | null;
    },
    config?: AxiosRequestConfig
  ): Promise<UpsertReceiptPdfOptionsResponse> {
    const { data } = await this.apiClient.put<UpsertReceiptPdfOptionsResponse>(
      `/crm/orders/receipt-pdf-options/${encodeURIComponent(orderNumber)}`,
      payload,
      config
    );
    return data;
  }

  /** Propose checkout pricing from NSE rows already saved in DB (no write). */
  async proposeOrderPricingSnapshot(
    orderNumber: string,
    config?: AxiosRequestConfig
  ): Promise<ProposeOrderPricingSnapshotResponse> {
    const { data } = await this.apiClient.get<ProposeOrderPricingSnapshotResponse>(
      `/crm/orders/${encodeURIComponent(orderNumber)}/pricing-snapshot/propose`,
      config
    );
    return data;
  }

  /** Persist proposed NSE pricing onto `orders.bondDetails.pricing`. */
  async acceptOrderPricingSnapshot(
    orderNumber: string,
    config?: AxiosRequestConfig
  ): Promise<AcceptOrderPricingSnapshotResponse> {
    const { data } = await this.apiClient.post<AcceptOrderPricingSnapshotResponse>(
      `/crm/orders/${encodeURIComponent(orderNumber)}/pricing-snapshot/accept`,
      {},
      config
    );
    return data;
  }
}
