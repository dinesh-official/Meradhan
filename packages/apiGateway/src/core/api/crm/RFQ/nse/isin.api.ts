import type { appSchema } from "@root/schema";
import type { AxiosRequestConfig } from "axios";
import type z from "zod";
import type { IApiCaller } from "../../../../connection/apiCaller.interface";
import type {
  CreateNegotiationResponse,
  CreateRfqResponseItem,
  NseISINResponseData,
  SettleOrderData,
} from "./isin.response";
import type { BaseResponseData } from "../../../../../types/base";

export class RfqIsinApi {
  constructor(private apiClient: IApiCaller) {}

  async getAllIsin(
    payload: z.infer<typeof appSchema.crm.rfq.nse.isin.isinFilterSchema>,
    config?: AxiosRequestConfig
  ) {
    const data = await this.apiClient.get<NseISINResponseData>(
      "/crm/rfq/nse/isin",
      {
        ...config,
        params: payload,
      }
    );
    return data;
  }

  async addIsinToRfq(
    payload: z.infer<typeof appSchema.rfq.addIsinSchema>,
    config?: AxiosRequestConfig
  ) {
    const data = await this.apiClient.post<
      BaseResponseData<CreateRfqResponseItem>
    >("/crm/rfq/nse/add-isin", payload, config);
    return data;
  }

  async getRfqFind(
    payload?: z.infer<typeof appSchema.rfq.rfqFilterSchema>,
    config?: AxiosRequestConfig
  ) {
    const data = await this.apiClient.get<
      BaseResponseData<CreateRfqResponseItem[]>
    >("/crm/rfq/nse/find", {
      ...config,
      params: payload,
    });
    return data.data;
  }

  async getRfqByNumber(
    payload?: z.infer<typeof appSchema.rfq.rfqFilterSchema>,
    config?: AxiosRequestConfig
  ) {
    const data = await this.apiClient.get<
      BaseResponseData<CreateRfqResponseItem[]>
    >("/crm/rfq/nse/find", {
      ...config,
      params: payload,
    });
    return data.data;
  }

  async acceptQuoteNegotiation(
    payload: z.infer<typeof appSchema.rfq.acceptNegotiationQuoteSchema>,
    config?: AxiosRequestConfig
  ) {
    const data = await this.apiClient.post<
      BaseResponseData<CreateRfqResponseItem | null>
    >("/crm/rfq/nse/negotiate/accept", payload, {
      ...config,
    });
    return data.data;
  }

  async quoteTermination(
    payload: z.infer<typeof appSchema.rfq.terminateNegotiationQuoteSchema>,
    config?: AxiosRequestConfig
  ) {
    const data = await this.apiClient.post<
      BaseResponseData<CreateRfqResponseItem | null>
    >("/crm/rfq/nse/negotiation/terminate", payload, {
      ...config,
    });
    return data.data;
  }

  async getAllNegotiations(
    payload?: z.infer<typeof appSchema.rfq.rfqNegotiationFilterSchema>,
    config?: AxiosRequestConfig
  ) {
    const data = await this.apiClient.post<
      BaseResponseData<CreateNegotiationResponse[]>
    >("/crm/rfq/nse/negotiations", payload, {
      ...config,
    });
    return data.data;
  }

  async proposeDeal(
    payload: z.infer<typeof appSchema.rfq.proposeDealSchema>,
    config?: AxiosRequestConfig
  ) {
    const data = await this.apiClient.post<
      BaseResponseData<CreateRfqResponseItem | null>
    >("/crm/rfq/nse/deal/propose", payload, {
      ...config,
    });
    return data.data;
  }

  async acceptRejectDeal(
    payload: z.infer<typeof appSchema.rfq.acceptRejectDealSchema>,
    config?: AxiosRequestConfig
  ) {
    const data = await this.apiClient.post<
      BaseResponseData<CreateRfqResponseItem | null>
    >("/crm/rfq/nse/deal/accept-reject", payload, {
      ...config,
    });
    return data.data;
  }

  async getAllSettledOrders(
    payload?: z.infer<typeof appSchema.rfq.settleOrderFilterSchema>,
    config?: AxiosRequestConfig
  ) {
    const data = await this.apiClient.post<BaseResponseData<SettleOrderData[]>>(
      "/crm/rfq/nse/settle/orders",
      payload,
      {
        ...config,
      }
    );
    return data.data;
  }

  async getAllLocalIsin(
    payload: {
      from?: string;
      to?: string;
      search?: string;
      status?: string;
      page?: number;
    },
    config?: AxiosRequestConfig
  ) {
    const data = await this.apiClient.get<
      BaseResponseData<{
        data: CreateRfqResponseItem[];
        meta: {
          total: number;
          page: number;
          pageSize: number;
          pages: number;
        };
      }>
    >("/crm/rfq/nse/localdata", {
      ...config,
      params: payload,
    });
    return data;
  }

  async getAllDealamend(
    filter: z.infer<typeof appSchema.rfq.dealAmendFilterSchema>
  ) {
    const response = await this.apiClient.post(
      "crm/rfq/nse/dealamend/all",
      filter
    );
    return response.data;
  }
}
