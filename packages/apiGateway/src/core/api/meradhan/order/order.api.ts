import type { AxiosRequestConfig, AxiosResponse } from "axios";
import type { IApiCaller } from "../../../connection/apiCaller.interface";
import type {
  GetOrderHistoryResponse,
  GetPaymentGatewayModeResponse,
} from "./order.response";
import { appSchema } from "@root/schema";
import type z from "zod";

/** Optional query params for order receipt / deal sheet PDFs (bond settlement fields). */
export type CustomerOrderPdfQueryParams = {
  accruedInterestDays?: number;
  settlementNumber?: string;
  settlementDateTime?: string;
  lastInterestPaymentDate?: string;
  interestPaymentDates?: string;
  nonAmortizedBond?: boolean;
  amortizedPrincipalPaymentDates?: string;
};

function buildPdfQueryParams(
  pdfParams?: CustomerOrderPdfQueryParams
): Record<string, string | number | undefined> {
  const params: Record<string, string | number | undefined> = {};
  if (pdfParams?.accruedInterestDays != null) {
    params.accruedInterestDays = pdfParams.accruedInterestDays;
  }
  if (pdfParams?.settlementNumber != null) {
    params.settlementNumber = pdfParams.settlementNumber;
  }
  if (pdfParams?.settlementDateTime != null) {
    params.settlementDateTime = pdfParams.settlementDateTime;
  }
  if (pdfParams?.lastInterestPaymentDate != null) {
    params.lastInterestPaymentDate = pdfParams.lastInterestPaymentDate;
  }
  if (pdfParams?.interestPaymentDates != null) {
    params.interestPaymentDates = pdfParams.interestPaymentDates;
  }
  if (pdfParams?.nonAmortizedBond !== undefined) {
    params.nonAmortizedBond = String(pdfParams.nonAmortizedBond);
  }
  if (pdfParams?.amortizedPrincipalPaymentDates != null) {
    params.amortizedPrincipalPaymentDates =
      pdfParams.amortizedPrincipalPaymentDates;
  }
  return params;
}

async function readPdfOrThrow(
  response: AxiosResponse<Blob>,
  defaultMessage: string
): Promise<Blob> {
  if (response.status >= 200 && response.status < 300) {
    return response.data;
  }
  let message = defaultMessage;
  const data = response.data;
  if (data instanceof Blob) {
    const type = data.type ?? "";
    if (type.includes("json") || data.size < 4096) {
      try {
        const j = JSON.parse(await data.text()) as { message?: string };
        message = j.message ?? message;
      } catch {
        // ignore
      }
    }
  }
  throw new Error(message);
}

export class CustomerOrderApi {
  private schema = appSchema.order;

  constructor(private apiClient: IApiCaller) {}

  async getPaymentGatewayMode(
    config?: AxiosRequestConfig
  ): Promise<GetPaymentGatewayModeResponse> {
    const { data } = await this.apiClient.get<GetPaymentGatewayModeResponse>(
      "/customer/order/payment-gateway-mode",
      config
    );
    return data;
  }

  async getOrderHistory(
    query?: z.infer<typeof this.schema.OrderQuerySchema>,
    config?: AxiosRequestConfig
  ): Promise<GetOrderHistoryResponse> {
    const mergedConfig: AxiosRequestConfig = {
      ...config,
      params: { ...(config?.params ?? {}), ...(query ?? {}) },
    };
    const { data } = await this.apiClient.get<GetOrderHistoryResponse>(
      "/customer/order/history",
      mergedConfig
    );
    return data;
  }

  async getOrderReceiptPdf(
    orderNumber: string,
    pdfParams?: CustomerOrderPdfQueryParams,
    config?: AxiosRequestConfig
  ): Promise<Blob> {
    const params = buildPdfQueryParams(pdfParams);
    const response = await this.apiClient.get<Blob>(
      `/customer/order/${encodeURIComponent(orderNumber)}/receipt-pdf`,
      {
        ...config,
        params: { ...config?.params, ...params },
        responseType: "blob",
        validateStatus: () => true,
      }
    );
    return readPdfOrThrow(response, "Failed to generate order receipt PDF");
  }

  async getDealSheetPdf(
    orderNumber: string,
    pdfParams?: CustomerOrderPdfQueryParams,
    config?: AxiosRequestConfig
  ): Promise<Blob> {
    const params = buildPdfQueryParams(pdfParams);
    const response = await this.apiClient.get<Blob>(
      `/customer/order/${encodeURIComponent(orderNumber)}/deal-pdf`,
      {
        ...config,
        params: { ...config?.params, ...params },
        responseType: "blob",
        validateStatus: () => true,
      }
    );
    return readPdfOrThrow(response, "Failed to generate deal sheet PDF");
  }

  async addOrderLog(
    orderId: string,
    step: string,
    status: "SUCCESS" | "FAILED" | "PENDING",
    outputData?: Record<string, unknown>,
    details?: Record<string, unknown>,
    config?: AxiosRequestConfig
  ): Promise<{ responseData: { success: boolean } }> {
    const { data } = await this.apiClient.post<
      { responseData: { success: boolean } }
    >(
      "/customer/order/log",
      {
        orderId,
        step,
        status,
        outputData,
        details,
      },
      config
    );
    return data;
  }
}

