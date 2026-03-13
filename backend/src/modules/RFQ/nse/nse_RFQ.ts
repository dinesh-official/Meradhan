import axios, { Axios, AxiosError } from "axios";

import type {
  AcceptNegotiationQuoteRequest,
  AcceptNegotiationQuoteResponse,
  CalcPriceRequest,
  CalcPriceResponse,
  CreateNegotiationRequest,
  CreateNegotiationResponse,
  CreateOpenRfqRequest,
  CreateOpenRfqResponse,
  CreateRfqRequest,
  CreateRfqResponse,
  DealAcceptRejectRequest,
  DealAcceptRejectResponse,
  DealAmendModifyCancelRequest,
  DealAmendModifyCancelResponse,
  DealChangeClientRequest,
  DealChangeClientResponse,
  DealProposeRequest,
  DealProposeResponse,
  DealTradeSplitRequest,
  DealTradeSplitResponse,
  DebarredClient,
  DebarredClientsRequest,
  GetAllDealAmendmentsRequest,
  GetAllDealAmendmentsResponse,
  GetAllIsinsRequest,
  GetAllIsinsResponse,
  GetAllParticipantsResponse,
  GetAllRfqRequest,
  GetAllRfqResponse,
  GetIssueTypeSettingsResponse,
  GetMarketWatchRfqRequest,
  GetMarketWatchRfqResponse,
  GetOpenRfqRequest,
  GetOpenRfqResponse,
  IssueTypeSettingsUpdateRequest,
  IssueTypeSettingsUpdateResponse,
  MarketTiming,
  NegotiationAllRequest,
  NegotiationAllResponse,
  ParticipantGroupAddRequest,
  ParticipantGroupAddResponse,
  ParticipantGroupListRequest,
  ParticipantGroupListResponse,
  ParticipantGroupUpdateRequest,
  ParticipantGroupUpdateResponse,
  ParticipantLimitAddRequest,
  ParticipantLimitAddResponse,
  ParticipantLimitListRequest,
  ParticipantLimitListResponse,
  ParticipantLimitUpdateRequest,
  ParticipantLimitUpdateResponse,
  PortfolioLimitAddRequest,
  PortfolioLimitAddResponse,
  PortfolioLimitAllRequest,
  PortfolioLimitAllResponse,
  PortfolioLimitUpdateRequest,
  PortfolioLimitUpdateResponse,
  TerminateNegotiationRequest,
  TerminateNegotiationResponse,
  UpdateDealAmendStatusRequest,
  UpdateDealAmendStatusResponse,
  UpdateNegotiationRequest,
  UpdateNegotiationResponse,
  UpdateOpenRfqRequest,
  UpdateOpenRfqResponse,
  UpdateRfqRequest,
  UpdateRfqResponse,
  WithdrawNegotiationQuoteRequest,
  WithdrawNegotiationQuoteResponse,
  WithdrawRfqRequest,
  WithdrawRfqResponse,
} from "./rfq.types";
import { AppError } from "@utils/error/AppError";
import { cacheStorage } from "@store/redis_store";
import { env } from "@packages/config/env";

// :: NOTE -
// All dates, times and datetimes are represented as strings and in Indian standard time.
// Dates are formatted using format “dd-MMM-yyyy” (E.g. 01-Jan-2018). Time are
// formatted as “hh24:mm:ss”. Date times are formatted as “dd-MMM-yyyy hh24:mm:ss”
// (E.g. 01-Jan-2016 15:30:00).

export class NseRfq {
  private loginStoreKey = "NSE_RFQ_LOGIN_KEY";
  private client: Axios;
  private credentials = {
    domain: env.RFQ_CBRICS_DOMAIN,
    login: env.RFQ_CBRICS_LOGIN,
    password: env.RFQ_CBRICS_PASSWORD,
  };

  constructor() {
    this.client = axios.create({
      baseURL: env.RFQ_CBRICS_ENV == "PROD" ? "https://bricsonline.nseindia.com/rfq" : "https://bricsonlinereguat.nseindia.com/rfq/rest/v1",
      withCredentials: true,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
        "Content-Type": "application/json",
        Accept: "application/json, text/javascript, */*; q=0.01",
        "Accept-Language": "en-US,en;q=0.5",
        "X-Requested-With": "XMLHttpRequest",
        Origin: env.RFQ_CBRICS_ENV == "PROD" ? "https://bricsonline.nseindia.com" : "https://bricsonlinereguat.nseindia.com",
        DNT: "1",
        Connection: "keep-alive",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
      },
    });
  }

  // 🔐 Login API
  private async login() {
    const { data, headers } = await this.client.post<{
      lastLogin: number;
      brokerEnablementType: string;
      loginKey: string;
      domain: string;
      serverTime: number;
      login: string;
      broker: boolean;
      status: string;
    }>("/login", this.credentials);
    const loginKey = headers?.["set-cookie"]
      ?.find((c) => c.includes("LoginKey"))
      ?.split("=")[1]
      ?.split(";")[0];
    if (data.status == "F") {
      console.log(data);
      throw new AppError("Nse Rqf Login Failed");
    }
    return {
      ...data,
      loginKey: data.loginKey || loginKey?.toString(),
    };
  }

  // 🧠 Get or Refresh Login Key
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
  // 🔁 Universal Auto-Retry Wrapper
  private async withReLoginRetry<T>(
    apiCall: (loginKey: string) => Promise<T>,
    attempt: number = 2
  ): Promise<T> {
    try {
      const key = await this.getLoginKey(attempt < 1);
      return await apiCall(key);
    } catch (error) {

      if (
        axios.isAxiosError(error) &&
        this.isLoginExpired(error) &&
        attempt < 2 // allow only one retry
      ) {

        console.warn(`Login expired. Retrying... (Attempt ${attempt + 1}/2)`);
        return this.withReLoginRetry(apiCall, attempt + 1);
      }

      // Log final error for debugging
      console.log((error as AxiosError<{ message?: string }>)?.response?.data);
      if (!((error as AxiosError<{ message?: string }>)?.response?.data)) {
        console.log("error", error);
      }

      console.error("API call failed after max retries:");
      throw error;
    }
  }

  private isLoginExpired(error: AxiosError<{ message?: string }>): boolean {
    const msg = error.response?.data?.message ?? error.message;
    const status = error.response?.status;
    return (
      status === 401 ||
      msg.includes("Invalid loginKey") ||
      msg.includes("Session expired")
    );
  }

  // 🚪 Logout
  public async logout() {
    return this.withReLoginRetry(async (loginKey) => {
      const { data } = await this.client.get<{ status: "C" }>("/logout", {
        headers: { loginKey },
      });
      return data;
    });
  }

  /** Create a new participant group */
  async addParticipantGroup(payload: ParticipantGroupAddRequest) {
    const { data } = await this.client.post<ParticipantGroupAddResponse>(
      "/partgrp/add",
      payload,
      { headers: { loginKey: await this.getLoginKey() } }
    );
    return data;
  }

  /** Update an existing participant group */
  async updateParticipantGroup(payload: ParticipantGroupUpdateRequest) {
    const { data } = await this.client.post<ParticipantGroupUpdateResponse>(
      "/partgrp/update",
      payload,
      { headers: { loginKey: await this.getLoginKey() } }
    );
    return data;
  }

  /** Fetch all participant groups (optionally filtered by id or name) */
  async getAllParticipantGroups(payload?: ParticipantGroupListRequest) {
    const { data } = await this.client.post<ParticipantGroupListResponse>(
      "/partgrp/all",
      payload ?? {},
      { headers: { loginKey: await this.getLoginKey() } }
    );
    return data;
  }

  /** Create new turnover limit record */
  async addParticipantLimit(payload: ParticipantLimitAddRequest) {
    const { data } = await this.client.post<ParticipantLimitAddResponse>(
      "/partlimit/add",
      payload,
      { headers: { loginKey: await this.getLoginKey() } }
    );
    return data;
  }

  /** Update an existing turnover limit record */
  async updateParticipantLimit(payload: ParticipantLimitUpdateRequest) {
    const { data } = await this.client.post<ParticipantLimitUpdateResponse>(
      "/partlimit/update",
      payload,
      { headers: { loginKey: await this.getLoginKey() } }
    );
    return data;
  }

  /** Fetch all turnover limit records (optionally filtered) */
  async getParticipantLimits(payload?: ParticipantLimitListRequest) {
    const { data } = await this.client.post<ParticipantLimitListResponse>(
      "/partlimit/all",
      payload ?? {},
      { headers: { loginKey: await this.getLoginKey() } }
    );
    return data;
  }

  /** Create a new portfolio limit record */
  async addPortfolioLimit(payload: PortfolioLimitAddRequest) {
    const { data } = await this.client.post<PortfolioLimitAddResponse>(
      "/portfoliolimit/add",
      payload,
      { headers: { loginKey: await this.getLoginKey() } }
    );
    return data;
  }

  /** Update an existing portfolio limit record */
  async updatePortfolioLimit(payload: PortfolioLimitUpdateRequest) {
    const { data } = await this.client.post<PortfolioLimitUpdateResponse>(
      "/portfoliolimit/update",
      payload,
      { headers: { loginKey: await this.getLoginKey() } }
    );
    return data;
  }

  /** Fetch all portfolio limits created by the logged-in participant */
  async getAllPortfolioLimits(payload?: PortfolioLimitAllRequest) {
    const { data } = await this.client.post<PortfolioLimitAllResponse>(
      "/portfoliolimit/all",
      payload ?? {},
      { headers: { loginKey: await this.getLoginKey() } }
    );
    return data;
  }

  /** Update issue type wise settings */
  async updateIssueTypeSettings(payload: IssueTypeSettingsUpdateRequest) {
    const { data } = await this.client.post<IssueTypeSettingsUpdateResponse>(
      "/partisstyp/update",
      payload,
      { headers: { loginKey: await this.getLoginKey() } }
    );
    return data;
  }

  /** Fetch all issue type settings for logged-in participant */
  async getIssueTypeSettings() {
    const { data } = await this.client.get<GetIssueTypeSettingsResponse>(
      "/partisstyp/all",
      { headers: { loginKey: await this.getLoginKey() } }
    );
    return data;
  }

  // ─── RFQ Master ──────────────────────────────────────────────────────────

  public async createRfq(
    payload: CreateRfqRequest
  ): Promise<CreateRfqResponse> {
    return this.withReLoginRetry(async (loginKey) => {
      const { data } = await this.client.post<CreateRfqResponse>(
        "/rfqmaster/add/isin",
        payload,
        { headers: { loginKey } }
      );
      return data;
    });
  }

  public async updateRfq(
    payload: UpdateRfqRequest
  ): Promise<UpdateRfqResponse> {
    return this.withReLoginRetry(async (loginKey) => {
      const { data } = await this.client.post<UpdateRfqResponse>(
        "/rfqmaster/update/isin",
        payload,
        { headers: { loginKey } }
      );
      return data;
    });
  }

  public async getAllRfq(
    payload?: GetAllRfqRequest
  ): Promise<GetAllRfqResponse> {
    return this.withReLoginRetry(async (loginKey) => {
      const { data } = await this.client.post<GetAllRfqResponse>(
        "/rfqmaster/all/isin",
        payload,
        { headers: { loginKey } }
      );
      return data;
    });
  }

  public async getMarketWatchRfq(
    payload: GetMarketWatchRfqRequest
  ): Promise<GetMarketWatchRfqResponse[]> {
    return this.withReLoginRetry(async (loginKey) => {
      const { data } = await this.client.post<GetMarketWatchRfqResponse[]>(
        "/rfqmaster/marketwatch/isin",
        payload,
        { headers: { loginKey } }
      );
      return data;
    });
  }

  public async createOpenRfq(
    payload: CreateOpenRfqRequest
  ): Promise<CreateOpenRfqResponse> {
    return this.withReLoginRetry(async (loginKey) => {
      const { data } = await this.client.post<CreateOpenRfqResponse>(
        "/rfqmaster/add/open",
        payload,
        { headers: { loginKey } }
      );
      return data;
    });
  }

  public async updateOpenRfq(
    payload: UpdateOpenRfqRequest
  ): Promise<UpdateOpenRfqResponse> {
    return this.withReLoginRetry(async (loginKey) => {
      const { data } = await this.client.post<UpdateOpenRfqResponse>(
        "/rfqmaster/update/open",
        payload,
        { headers: { loginKey } }
      );
      return data;
    });
  }

  /** Fetch all open RFQs (with optional filters) */
  async getOpenRfqList(payload?: GetOpenRfqRequest) {
    const { data } = await this.client.post<GetOpenRfqResponse>(
      "/rfqmaster/all/open",
      payload ?? {},
      { headers: { loginKey: await this.getLoginKey() } }
    );
    return data;
  }

  public async withdrawRfq(
    payload: WithdrawRfqRequest[]
  ): Promise<WithdrawRfqResponse[]> {
    return this.withReLoginRetry(async (loginKey) => {
      const { data } = await this.client.post<WithdrawRfqResponse[]>(
        "/rfqmaster/withdraw",
        payload,
        { headers: { loginKey } }
      );
      return data;
    });
  }

  // ─── Negotiation ─────────────────────────────────────────────────────────

  public async createNegotiation(
    payload: CreateNegotiationRequest
  ): Promise<CreateNegotiationResponse> {
    return this.withReLoginRetry(async (loginKey) => {
      const { data } = await this.client.post<CreateNegotiationResponse>(
        "/negotiation/add",
        payload,
        { headers: { loginKey } }
      );
      return data;
    });
  }

  public async updateNegotiation(
    payload: UpdateNegotiationRequest
  ): Promise<UpdateNegotiationResponse> {
    return this.withReLoginRetry(async (loginKey) => {
      const { data } = await this.client.post<UpdateNegotiationResponse>(
        "/negotiation/update",
        payload,
        { headers: { loginKey } }
      );
      return data;
    });
  }

  public async withdrawNegotiationQuote(
    payload: WithdrawNegotiationQuoteRequest
  ): Promise<WithdrawNegotiationQuoteResponse> {
    return this.withReLoginRetry(async (loginKey) => {
      const { data } = await this.client.post<WithdrawNegotiationQuoteResponse>(
        "/negotiation/withdrawquote",
        payload,
        { headers: { loginKey } }
      );
      return data;
    });
  }

  public async terminateNegotiationThread(
    payload: TerminateNegotiationRequest
  ): Promise<TerminateNegotiationResponse> {
    return this.withReLoginRetry(async (loginKey) => {
      const { data } = await this.client.post<TerminateNegotiationResponse>(
        "/negotiation/terminate",
        payload,
        { headers: { loginKey } }
      );
      return data;
    });
  }

  public async acceptNegotiationQuote(
    payload: AcceptNegotiationQuoteRequest
  ): Promise<AcceptNegotiationQuoteResponse> {
    return this.withReLoginRetry(async (loginKey) => {
      const { data } = await this.client.post<AcceptNegotiationQuoteResponse>(
        "/negotiation/accept",
        payload,
        { headers: { loginKey } }
      );
      return data;
    });
  }

  public async getAllNegotiations(
    payload: NegotiationAllRequest
  ): Promise<NegotiationAllResponse> {
    return this.withReLoginRetry(async (loginKey) => {
      const { data } = await this.client.post<NegotiationAllResponse>(
        "/negotiation/all",
        payload,
        { headers: { loginKey } }
      );
      return data;
    });
  }

  // ─── Deal ────────────────────────────────────────────────────────────────

  public async proposeDeal(
    payload: DealProposeRequest
  ): Promise<DealProposeResponse> {
    return this.withReLoginRetry(async (loginKey) => {
      const { data } = await this.client.post<DealProposeResponse>(
        "/deal/propose",
        payload,
        { headers: { loginKey } }
      );
      return data;
    });
  }

  public async acceptOrRejectDeal(
    payload: DealAcceptRejectRequest
  ): Promise<DealAcceptRejectResponse> {
    return this.withReLoginRetry(async (loginKey) => {
      const { data } = await this.client.post<DealAcceptRejectResponse>(
        "/deal/acceptreject",
        payload,
        { headers: { loginKey } }
      );
      return data;
    });
  }

  public async addDealTradeSplit(
    payload: DealTradeSplitRequest
  ): Promise<DealTradeSplitResponse> {
    return this.withReLoginRetry(async (loginKey) => {
      const { data } = await this.client.post<DealTradeSplitResponse>(
        "/deal/tradesplit",
        payload,
        { headers: { loginKey } }
      );
      return data;
    });
  }

  public async changeDealClient(
    payload: DealChangeClientRequest
  ): Promise<DealChangeClientResponse> {
    return this.withReLoginRetry(async (loginKey) => {
      const { data } = await this.client.post<DealChangeClientResponse>(
        "/deal/changeclient",
        payload,
        { headers: { loginKey } }
      );
      return data;
    });
  }

  // ─── Deal Amendment ──────────────────────────────────────────────────────

  public async modifyOrCancelDealAmendment(
    payload: DealAmendModifyCancelRequest
  ): Promise<DealAmendModifyCancelResponse> {
    return this.withReLoginRetry(async (loginKey) => {
      const { data } = await this.client.post<DealAmendModifyCancelResponse>(
        "/dealamend/modifycancel",
        payload,
        { headers: { loginKey } }
      );
      return data;
    });
  }

  public async getAllDealAmendments(
    payload: GetAllDealAmendmentsRequest
  ): Promise<GetAllDealAmendmentsResponse> {
    return this.withReLoginRetry(async (loginKey) => {
      if (process.env.NODE_ENV != "production") {
        console.log(loginKey);
      }

      const { data } = await this.client.post<GetAllDealAmendmentsResponse>(
        "/dealamend/all",
        payload,
        { headers: { loginKey } }
      );
      return data;
    });
  }

  public async updateDealAmendStatus(
    payload: UpdateDealAmendStatusRequest
  ): Promise<UpdateDealAmendStatusResponse> {
    return this.withReLoginRetry(async (loginKey) => {
      const { data } = await this.client.post<UpdateDealAmendStatusResponse>(
        "/dealamend/updatestatus",
        payload,
        { headers: { loginKey } }
      );
      return data;
    });
  }

  // ─── Common Reference Data ───────────────────────────────────────────────

  public async getAllParticipants(): Promise<GetAllParticipantsResponse> {
    return this.withReLoginRetry(async (loginKey) => {
      const { data } = await this.client.get<GetAllParticipantsResponse>(
        "/participants/all",
        { headers: { loginKey } }
      );
      return data;
    });
  }

  public async getAllIsins(
    payload?: GetAllIsinsRequest
  ): Promise<GetAllIsinsResponse> {
    return await this.withReLoginRetry(async (loginKey) => {
      const { data } = await this.client.post<GetAllIsinsResponse>(
        "/isins/all",
        payload,
        { headers: { loginKey } }
      );
      return data;
    });
  }

  public async calcPrice(
    payload: CalcPriceRequest
  ): Promise<CalcPriceResponse> {
    return this.withReLoginRetry(async (loginKey) => {
      const { data } = await this.client.post<CalcPriceResponse>(
        "/rfqmaster/calcprice",
        payload,
        { headers: { loginKey } }
      );
      return data;
    });
  }

  public async getMarketTimings(): Promise<MarketTiming[]> {
    return this.withReLoginRetry(async (loginKey) => {
      const { data } = await this.client.get<MarketTiming[]>(
        "/market/timings",
        { headers: { loginKey } }
      );
      return data;
    });
  }

  public async getDebarredClients(
    payload: DebarredClientsRequest
  ): Promise<DebarredClient[]> {
    return this.withReLoginRetry(async (loginKey) => {
      const { data } = await this.client.post<DebarredClient[]>(
        "/debar/all",
        payload,
        { headers: { loginKey } }
      );
      return data;
    });
  }
}
