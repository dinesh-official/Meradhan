import axios, { Axios, AxiosError } from "axios";

import { env } from "@packages/config/env";
import { cacheStorage } from "@store/redis_store";
import { AppError } from "@utils/error/AppError";
import type {
  ActiveIssuesRequest,
  ActiveIssuesResponse,
  AddUnregisteredDpAccountRequest,
  BuyInstructionsRequest,
  BuyInstructionsResponse,
  GetUnregisteredDpAccountsRequest,
  GetUnregisteredDpAccountsResponse,
  MarkDefaultUnregisteredBankAccountRequest,
  MarkDefaultUnregisteredDpAccountRequest,
  MarkDefaultUnregisteredDpAccountResponse,
  OrderRequest,
  OrderResponse,
  OrderStatusRequest,
  OrderStatusResponse,
  OrderUpdateRequest,
  OrderUpdateResponse,
  ParticipantFindRequest,
  ParticipantFindResponse,
  PaymentTransactionQueryRequest,
  PaymentTransactionRecord,
  PaymentTransactionResponse,
  SellReportingsFilterRequest,
  SellReportingsResponse,
  SettleOrderListRequest,
  SettleOrderListResponse,
  SettleOrderUpdateBankRequest,
  SettleOrderUpdateBankResponse,
  SettleOrderUpdateDpRequest,
  SettleOrderUpdateDpResponse,
  SettleOrderUpdateRequest,
  SettleOrderUpdateResponse,
  UnregisteredBankAccountListRequest,
  UnregisteredDpAccountResponse,
  UnregisteredParticipantBankAccountRequest,
  UnregisteredParticipantBankAccountResponse,
  UnregisteredParticipantFinalDeleteRequest,
  UnregisteredParticipantFinalDeleteResponse,
  UnregisteredParticipantFinalUpdateContactRequest,
  UnregisteredParticipantFinalUpdateContactResponse,
  UnregisteredParticipantParams,
  UnregisteredParticipantRequest,
  UnregisteredParticipantResponse,
  UpdateUnregisteredBankAccountStatusRequest,
  UpdateUnregisteredDpAccountStatusRequest,
  UpdateUnregisteredDpAccountStatusResponse,
  UpiPaymentInitiationRequest,
} from "./cbrics.types";

export class NseCBRICS {
  private loginStoreKey = "NSE_CBRICS_LOGIN_KEY";
  private client: Axios;

  private credentials = {
    domain: env.CBRICS_DOMAIN,
    login: env.CBRICS_LOGIN,
    password: env.CBRICS_PASSWORD,
  };

  constructor() {
    this.client = axios.create({
      baseURL: env.CBRICS_ENV == "PROD" ? "https://bricsonline.nseindia.com/bondsnew/rest/v1" : "https://bricsonlinereguat.nseindia.com/bondsnew/rest/v1",
      withCredentials: true,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
        "Content-Type": "application/json",
        Accept: "application/json, text/javascript, */*; q=0.01",
        "Accept-Language": "en-US,en;q=0.5",
        "X-Requested-With": "XMLHttpRequest",
        Origin: env.CBRICS_ENV == "PROD" ? "https://bricsonline.nseindia.com" : "https://bricsonlinereguat.nseindia.com",
        DNT: "1",
        Connection: "keep-alive",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
      },
    });
  }

  // ────────────────────────────────────────────────────────────────
  // 🔐 LOGIN / LOGOUT HANDLING
  // ────────────────────────────────────────────────────────────────

  async login() {
    const { data, headers } = await this.client.post<{
      firstName: string;
      lastLogin: number;
      ownerCode: string;
      loginKey: string;
      serverTime: number;
      login: string;
      status: string;
    }>("/login", this.credentials);

    const loginKey = headers?.["set-cookie"]
      ?.find((c) => c.includes("LoginKey"))
      ?.split("=")[1]
      ?.split(";")[0];

    if (process.env.NODE_ENV != "production") {
      console.log(loginKey, data);
    }

    if (data.status == "F") {
      console.log(data);
      throw new AppError("Nse Cbrics Login Failed");
    }

    return {
      ...data,
      loginKey: data.loginKey || loginKey?.toString(),
    };
  }

  public async getLoginKey(forceRefresh = false): Promise<string> {
    if (!forceRefresh) {
      const data = await cacheStorage.get<{ loginKey: string }>(
        this.loginStoreKey
      );
      if (data) return data.loginKey;
    }

    const { loginKey } = await this.login();
    await cacheStorage.set(this.loginStoreKey, { loginKey }, 600);

    return loginKey || "";
  }

  private isLoginExpired(error: AxiosError<{ messages?: string[] }>): boolean {
    const msg = error.response?.data?.messages ?? error.message;
    const status = error.response?.status;
    return (
      status === 401 ||
      msg.includes("Login Required") ||
      msg.includes("Session expired")
    );
  }

  private async withReLoginRetry<T>(
    apiCall: (loginKey: string) => Promise<T>,
    attempt: number = 1
  ): Promise<T> {
    try {
      const key = await this.getLoginKey(attempt < 1); // force relogin only if retry
      return await apiCall(key);
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        this.isLoginExpired(error) &&
        attempt < 1 // allow only one retry
      ) {
        console.warn(`Login expired. Retrying... (Attempt ${attempt + 1}/1)`);
        return this.withReLoginRetry(apiCall, attempt + 1);
      }

      if (error instanceof AxiosError) {
        if (error.response?.data.message) {
          throw new Error(
            error.response?.data.message?.toString() ||
            "CBRICS Request Failed - " + error.toString()
          );
        } else if (error.response?.data.error) {
          throw new Error(
            error.response?.data.error?.toString() ||
            "CBRICS Request Failed - " + error.toString()
          );
        } else if (error.response?.data.messages) {
          throw new Error(
            error.response?.data.messages?.[0].toString() ||
            "CBRICS Request Failed - " + error.toString()
          );
        }
      }

      // Log final error for debugging
      console.error("API call failed after max retries:");
      throw error;
    }
  }

  public async logout() {
    return this.withReLoginRetry(async (loginKey) => {
      const { data } = await this.client.get<{ status: "C" }>("/logout", {
        headers: { loginKey },
      });
      await cacheStorage.delete(this.loginStoreKey);
      return data;
    });
  }

  // ────────────────────────────────────────────────────────────────
  // 🧩 PARTICIPANTS
  // ────────────────────────────────────────────────────────────────

  public async findParticipants(payload?: ParticipantFindRequest) {
    return this.withReLoginRetry(async (loginKey) => {
      const { data } = await this.client.post<ParticipantFindResponse>(
        "/participant/find",
        payload,
        { headers: { loginKey } }
      );
      return data;
    });
  }

  // ────────────────────────────────────────────────────────────────
  // 🧾 UNREGISTERED PARTICIPANTS
  // ────────────────────────────────────────────────────────────────

  public async unregisteredParticipant(
    payload: UnregisteredParticipantRequest
  ) {
    return this.withReLoginRetry(async (loginKey) => {
      const { data } = await this.client.post<UnregisteredParticipantResponse>(
        "/unreg",
        payload,
        { headers: { loginKey } }
      );
      return data;
    });
  }

  public async updateUnregisteredParticipant(
    payload: Omit<UnregisteredParticipantRequest, "loginId"> & { id: number }
  ) {
    return this.withReLoginRetry(async (loginKey) => {
      const { data } = await this.client.post<UnregisteredParticipantResponse>(
        "/unreg/update",
        { ...payload, actualStatus: 4 },
        { headers: { loginKey } }
      );
      return data;
    });
  }

  public async getAllUnregisteredParticipants(
    payload: UnregisteredParticipantParams
  ) {
    return this.withReLoginRetry(async (loginKey) => {
      const { data } = await this.client.post<
        UnregisteredParticipantResponse[]
      >("/unreg/all", payload, { headers: { loginKey } });
      return data;
    });
  }

  public async getUnregisteredParticipantById(id: number) {
    return this.withReLoginRetry(async (loginKey) => {
      const { data } = await this.client.get<UnregisteredParticipantResponse>(
        `/unreg/${id}`,
        { headers: { loginKey } }
      );
      return data;
    });
  }

  public async updateFinalUnregisteredParticipantContact(
    payload: UnregisteredParticipantFinalUpdateContactRequest
  ) {
    return this.withReLoginRetry(async (loginKey) => {
      const { data } =
        await this.client.post<UnregisteredParticipantFinalUpdateContactResponse>(
          "/unreg/final/updatecontact",
          payload,
          { headers: { loginKey } }
        );
      return data;
    });
  }

  public async deleteFinalUnregisteredParticipant(
    payload: UnregisteredParticipantFinalDeleteRequest
  ) {
    return this.withReLoginRetry(async (loginKey) => {
      const { data } =
        await this.client.post<UnregisteredParticipantFinalDeleteResponse>(
          "/unreg/final/delete",
          payload,
          { headers: { loginKey } }
        );
      return data;
    });
  }

  // ────────────────────────────────────────────────────────────────
  // 🏦 UNREGISTERED BANK ACCOUNTS
  // ────────────────────────────────────────────────────────────────

  public async addUnregisteredBankAccount(
    payload: UnregisteredParticipantBankAccountRequest
  ) {
    return this.withReLoginRetry(async (loginKey) => {
      const { data } =
        await this.client.post<UnregisteredParticipantBankAccountResponse>(
          "/unreg/bankacc",
          payload,
          { headers: { loginKey } }
        );
      return data;
    });
  }

  public async getAllUnregisteredBankAccounts(
    payload: UnregisteredBankAccountListRequest
  ) {
    return this.withReLoginRetry(async (loginKey) => {
      const { data } = await this.client.post<
        UnregisteredParticipantBankAccountResponse[]
      >("/unreg/bankacc/all", payload, { headers: { loginKey } });
      return data;
    });
  }

  public async markDefaultUnregisteredBankAccount(
    payload: MarkDefaultUnregisteredBankAccountRequest
  ) {
    return this.withReLoginRetry(async (loginKey) => {
      const { data } =
        await this.client.post<UnregisteredParticipantBankAccountResponse>(
          "/unreg/bankacc/final/markdefault",
          payload,
          { headers: { loginKey } }
        );
      return data;
    });
  }

  public async updateUnregisteredBankAccountStatus(
    payload: UpdateUnregisteredBankAccountStatusRequest
  ) {
    return this.withReLoginRetry(async (loginKey) => {
      const { data } =
        await this.client.post<UnregisteredParticipantBankAccountResponse>(
          "/unreg/bankacc/final/updatestatus",
          payload,
          { headers: { loginKey } }
        );
      return data;
    });
  }

  // ────────────────────────────────────────────────────────────────
  // 📑 UNREGISTERED DP ACCOUNTS
  // ────────────────────────────────────────────────────────────────

  public async addUnregisteredDpAccount(
    payload: AddUnregisteredDpAccountRequest
  ) {
    return this.withReLoginRetry(async (loginKey) => {
      const { data } = await this.client.post<UnregisteredDpAccountResponse>(
        "/unreg/dpacc",
        payload,
        { headers: { loginKey } }
      );
      return data;
    });
  }

  public async getAllUnregisteredDpAccounts(
    payload?: GetUnregisteredDpAccountsRequest
  ) {
    return this.withReLoginRetry(async (loginKey) => {
      const { data } =
        await this.client.post<GetUnregisteredDpAccountsResponse>(
          "/unreg/dpacc/all",
          payload,
          { headers: { loginKey } }
        );
      return data;
    });
  }

  public async markDefaultUnregisteredDpAccount(
    payload: MarkDefaultUnregisteredDpAccountRequest
  ) {
    return this.withReLoginRetry(async (loginKey) => {
      const { data } =
        await this.client.post<MarkDefaultUnregisteredDpAccountResponse>(
          "/unreg/dpacc/final/markdefault",
          payload,
          { headers: { loginKey } }
        );
      return data;
    });
  }

  public async updateUnregisteredDpAccountStatus(
    payload: UpdateUnregisteredDpAccountStatusRequest
  ) {
    return this.withReLoginRetry(async (loginKey) => {
      const { data } =
        await this.client.post<UpdateUnregisteredDpAccountStatusResponse>(
          "/unreg/dpacc/final/updatestatus",
          payload,
          { headers: { loginKey } }
        );
      return data;
    });
  }

  // ────────────────────────────────────────────────────────────────
  // 📦 ORDERS & INSTRUCTIONS
  // ────────────────────────────────────────────────────────────────

  public async createOrder(payload: OrderRequest) {
    return this.withReLoginRetry(async (loginKey) => {
      const { data } = await this.client.post<OrderResponse>(
        "/order",
        payload,
        {
          headers: { loginKey },
        }
      );
      return data;
    });
  }

  public async updateOrder(payload: OrderUpdateRequest) {
    return this.withReLoginRetry(async (loginKey) => {
      const { data } = await this.client.post<OrderUpdateResponse>(
        "/order/update",
        payload,
        { headers: { loginKey } }
      );
      return data;
    });
  }

  public async updateOrderStatus(payload: OrderStatusRequest) {
    return this.withReLoginRetry(async (loginKey) => {
      const { data } = await this.client.put<OrderStatusResponse>(
        "/order/status",
        payload,
        { headers: { loginKey } }
      );
      return data;
    });
  }

  public async getActiveIssues(payload?: ActiveIssuesRequest) {
    return this.withReLoginRetry(async (loginKey) => {
      const { data } = await this.client.post<ActiveIssuesResponse>(
        "/marketwatch/activeissues",
        payload,
        { headers: { loginKey } }
      );
      return data;
    });
  }

  public async getSellReportings() {
    return this.withReLoginRetry(async (loginKey) => {
      const { data } = await this.client.get<SellReportingsResponse>(
        "/order/sellreportings",
        { headers: { loginKey } }
      );
      return data;
    });
  }

  public async getFilteredSellReportings(
    payload?: SellReportingsFilterRequest
  ) {
    return this.withReLoginRetry(async (loginKey) => {
      const { data } = await this.client.post<SellReportingsResponse>(
        "/order/sellreportings",
        payload,
        { headers: { loginKey } }
      );
      return data;
    });
  }

  public async getBuyerInstructions(payload?: BuyInstructionsRequest) {
    return this.withReLoginRetry(async (loginKey) => {
      const { data } = await this.client.post<BuyInstructionsResponse>(
        "/order/buyinstructions",
        payload,
        { headers: { loginKey } }
      );
      return data;
    });
  }

  // ────────────────────────────────────────────────────────────────
  // ⚖️ SETTLEMENT
  // ────────────────────────────────────────────────────────────────

  public async getSettlementOrders(payload: SettleOrderListRequest) {
    return this.withReLoginRetry(async (loginKey) => {
      const { data } = await this.client.post<SettleOrderListResponse>(
        "/settle/order/all",
        payload,
        { headers: { loginKey } }
      );
      return data;
    });
  }

  public async updateSettlementOrder(payload: SettleOrderUpdateRequest) {
    return this.withReLoginRetry(async (loginKey) => {
      const { data } = await this.client.post<SettleOrderUpdateResponse>(
        "/settle/order/update",
        payload,
        { headers: { loginKey } }
      );
      return data;
    });
  }

  public async updateSettlementOrderBank(
    payload: SettleOrderUpdateBankRequest
  ) {
    return this.withReLoginRetry(async (loginKey) => {
      const { data } = await this.client.post<SettleOrderUpdateBankResponse>(
        "/settle/order/updatebank",
        payload,
        { headers: { loginKey } }
      );
      return data;
    });
  }

  public async updateSettlementOrderDp(payload: SettleOrderUpdateDpRequest) {
    return this.withReLoginRetry(async (loginKey) => {
      const { data } = await this.client.post<SettleOrderUpdateDpResponse>(
        "/settle/order/updatedp",
        payload,
        { headers: { loginKey } }
      );
      return data;
    });
  }

  // ────────────────────────────────────────────────────────────────
  // 💸 PAYMENTS
  // ────────────────────────────────────────────────────────────────

  public async getPaymentTransactions(payload: PaymentTransactionQueryRequest) {
    return this.withReLoginRetry(async (loginKey) => {
      const { data } = await this.client.post<PaymentTransactionRecord[]>(
        "/paytxn",
        payload,
        { headers: { loginKey } }
      );
      return data;
    });
  }

  public async initiateUpiPayment(payload: UpiPaymentInitiationRequest) {
    return this.withReLoginRetry(async (loginKey) => {
      const { data } = await this.client.post<PaymentTransactionResponse>(
        "/paytxn/upi",
        payload,
        { headers: { loginKey } }
      );
      return data;
    });
  }
}
