import axios, { Axios } from "axios";
import { cacheStorage } from "../../../../queues/redis/queues";
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
} from "./types";

/**
 * @class NseCBRICS
 * @description
 * Handles authenticated communication with the NSE CBRICS REST v1 API.
 * Includes methods for managing participants, unregistered accounts,
 * orders, settlements, and payments.
 *
 * This class automatically caches login keys and appends them
 * as headers to every request.
 */
export class NseCBRICS {
    private loginStoreKey = "NSE_CBRICS_LOGIN__KEY";
    private client: Axios;

    private credentials = {
        domain: "BCISPL",
        login: "DEV",
        password: "sour@V#404root",
    };

    constructor() {
        this.client = axios.create({
            baseURL: "https://bricsonlinereguat.nseindia.com/bondsnew/rest/v1",
            withCredentials: true,
            headers: {
                "User-Agent": "MeraDhan/0.0.1",
                "Content-Type": "application/json",
            },
        });
    }

    /**
     * @private
     * @description Logs in and retrieves a session `loginKey`.
     * @returns Promise resolving to the login payload including `loginKey`.
     */
    private async login() {
        const { data } = await this.client.post<{
            firstName: string;
            lastLogin: number;
            ownerCode: string;
            loginKey: string;
            serverTime: number;
            login: string;
            status: string;
        }>("/login", this.credentials);
        return data;
    }

    /**
     * @description
     * Retrieves a cached NSE CBRICS login key or logs in if not cached.
     * The login key is stored in Redis for quick reuse.
     * @returns Promise<string> - A valid NSE session login key.
     */
    public async getLoginKey(): Promise<string> {
        const cached = await cacheStorage.get<string>(this.loginStoreKey);
        if (!cached) {
            const { loginKey } = await this.login();
            const CACHE_TTL_SEC = 1000;
            await cacheStorage.set(this.loginStoreKey, loginKey, CACHE_TTL_SEC);
            return loginKey;
        }
        return cached;
    }

    /**
     * @description Logs out the current NSE CBRICS session.
     * @returns Promise<{ status: "C" }> - Confirmation of logout.
     */
    public async logout() {
        const { data } = await this.client.get<{ status: "C" }>("/logout");
        return data;
    }

    // =====================================================
    // Participant APIs
    // =====================================================

    /**
     * @description Searches for registered participants.
     * @param payload - Participant search parameters.
     * @returns Promise<ParticipantFindResponse>
     */
    async findParticipants(payload?: ParticipantFindRequest) {
        const { data } = await this.client.post<ParticipantFindResponse>(
            "/participant/find",
            payload,
            { headers: { loginKey: await this.getLoginKey() } }
        );
        return data;
    }

    // =====================================================
    // Unregistered Participants APIs
    // =====================================================

    /** Create new unregistered participant */
    async unregisteredParticipant(payload: UnregisteredParticipantRequest) {
        const { data } = await this.client.post<UnregisteredParticipantResponse>(
            "/unreg",
            payload,
            { headers: { loginKey: await this.getLoginKey() } }
        );
        return data;
    }

    /** Update existing unregistered participant */
    async updateUnregisteredParticipant(
        payload: Omit<UnregisteredParticipantRequest, "loginId"> & { id: number }
    ) {
        const { data } = await this.client.post<UnregisteredParticipantResponse>(
            "/unreg/update",
            { ...payload, actualStatus: 4 },
            { headers: { loginKey: await this.getLoginKey() } }
        );
        return data;
    }

    /** Fetch list of all unregistered participants */
    async getAllUnregisteredParticipants(payload?: UnregisteredParticipantParams) {
        const { data } = await this.client.post<UnregisteredParticipantResponse>(
            "/unreg/all",
            payload,
            { headers: { loginKey: await this.getLoginKey() } }
        );
        return data;
    }

    /** Get unregistered participant details by ID */
    async getUnregisteredParticipantById(id: number) {
        const { data } = await this.client.get<UnregisteredParticipantResponse>(
            `/unreg/${id}`,
            { headers: { loginKey: await this.getLoginKey() } }
        );
        return data;
    }

    /** Update contact info of final unregistered participant */
    async updateFinalUnregisteredParticipantContact(
        payload: UnregisteredParticipantFinalUpdateContactRequest
    ) {
        const { data } =
            await this.client.post<UnregisteredParticipantFinalUpdateContactResponse>(
                "/unreg/final/updatecontact",
                payload,
                { headers: { loginKey: await this.getLoginKey() } }
            );
        return data;
    }

    /** Permanently delete unregistered participant */
    async deleteFinalUnregisteredParticipant(
        payload: UnregisteredParticipantFinalDeleteRequest
    ) {
        const { data } =
            await this.client.post<UnregisteredParticipantFinalDeleteResponse>(
                "/unreg/final/delete",
                payload,
                { headers: { loginKey: await this.getLoginKey() } }
            );
        return data;
    }

    // =====================================================
    // Unregistered Bank Accounts
    // =====================================================

    /** Add a new unregistered participant bank account */
    async addUnregisteredBankAccount(
        payload: UnregisteredParticipantBankAccountRequest
    ) {
        const { data } = await this.client.post<UnregisteredParticipantBankAccountResponse>(
            "/unreg/bankacc",
            payload,
            { headers: { loginKey: await this.getLoginKey() } }
        );
        return data;
    }

    /** Fetch all unregistered participant bank accounts */
    async getAllUnregisteredBankAccounts(
        payload: UnregisteredBankAccountListRequest
    ) {
        const { data } = await this.client.post<UnregisteredParticipantBankAccountResponse[]>(
            "/unreg/bankacc/all",
            payload,
            { headers: { loginKey: await this.getLoginKey() } }
        );
        return data;
    }

    /** Mark a bank account as default */
    async markDefaultUnregisteredBankAccount(
        payload: MarkDefaultUnregisteredBankAccountRequest
    ) {
        const { data } = await this.client.post<UnregisteredParticipantBankAccountResponse>(
            "/unreg/bankacc/final/markdefault",
            payload,
            { headers: { loginKey: await this.getLoginKey() } }
        );
        return data;
    }

    /** Update status of a bank account (e.g., active/inactive) */
    async updateUnregisteredBankAccountStatus(
        payload: UpdateUnregisteredBankAccountStatusRequest
    ) {
        const { data } = await this.client.post<UnregisteredParticipantBankAccountResponse>(
            "/unreg/bankacc/final/updatestatus",
            payload,
            { headers: { loginKey: await this.getLoginKey() } }
        );
        return data;
    }

    // =====================================================
    // Unregistered DP Accounts
    // =====================================================

    /** Add a new unregistered participant DP account */
    async addUnregisteredDpAccount(payload: AddUnregisteredDpAccountRequest) {
        const { data } = await this.client.post<UnregisteredDpAccountResponse>(
            "/unreg/dpacc",
            payload,
            { headers: { loginKey: await this.getLoginKey() } }
        );
        return data;
    }

    /** Fetch all unregistered participant DP accounts */
    async getAllUnregisteredDpAccounts(payload?: GetUnregisteredDpAccountsRequest) {
        const { data } = await this.client.post<GetUnregisteredDpAccountsResponse>(
            "/unreg/dpacc/all",
            payload,
            { headers: { loginKey: await this.getLoginKey() } }
        );
        return data;
    }

    /** Mark DP account as default */
    async markDefaultUnregisteredDpAccount(
        payload: MarkDefaultUnregisteredDpAccountRequest
    ) {
        const { data } = await this.client.post<MarkDefaultUnregisteredDpAccountResponse>(
            "/unreg/dpacc/final/markdefault",
            payload,
            { headers: { loginKey: await this.getLoginKey() } }
        );
        return data;
    }

    /** Update DP account status */
    async updateUnregisteredDpAccountStatus(
        payload: UpdateUnregisteredDpAccountStatusRequest
    ) {
        const { data } = await this.client.post<UpdateUnregisteredDpAccountStatusResponse>(
            "/unreg/dpacc/final/updatestart",
            payload,
            { headers: { loginKey: await this.getLoginKey() } }
        );
        return data;
    }

    // =====================================================
    // Orders and Instructions
    // =====================================================

    /** Create a new order */
    async createOrder(payload: OrderRequest) {
        const { data } = await this.client.post<OrderResponse>("/order", payload, {
            headers: { loginKey: await this.getLoginKey() },
        });
        return data;
    }

    /** Update an existing order */
    async updateOrder(payload: OrderUpdateRequest) {
        const { data } = await this.client.post<OrderUpdateResponse>(
            "/order/update",
            payload,
            { headers: { loginKey: await this.getLoginKey() } }
        );
        return data;
    }

    /** Update order status (PUT request) */
    async updateOrderStatus(payload: OrderStatusRequest) {
        const { data } = await this.client.put<OrderStatusResponse>(
            "/order/status",
            payload,
            { headers: { loginKey: await this.getLoginKey() } }
        );
        return data;
    }

    /** Get all active issues in market watch */
    async getActiveIssues(payload?: ActiveIssuesRequest) {
        const { data } = await this.client.post<ActiveIssuesResponse>(
            "/marketwatch/activeissues",
            payload,
            { headers: { loginKey: await this.getLoginKey() } }
        );
        return data;
    }

    /** Fetch sell reporting data (unfiltered) */
    async getSellReportings() {
        const { data } = await this.client.get<SellReportingsResponse>(
            "/order/sellreportings",
            { headers: { loginKey: await this.getLoginKey() } }
        );
        return data;
    }

    /** Fetch filtered sell reporting data */
    async getFilteredSellReportings(payload?: SellReportingsFilterRequest) {
        const { data } = await this.client.post<SellReportingsResponse>(
            "/order/sellreportings",
            payload,
            { headers: { loginKey: await this.getLoginKey() } }
        );
        return data;
    }

    /** Retrieve buyer instructions for settlement */
    async getBuyerInstructions(payload?: BuyInstructionsRequest) {
        const { data } = await this.client.post<BuyInstructionsResponse>(
            "/order/buyinstructions",
            payload,
            { headers: { loginKey: await this.getLoginKey() } }
        );
        return data;
    }

    // =====================================================
    // Settlement APIs
    // =====================================================

    /** Fetch settlement order list */
    async getSettlementOrders(payload: SettleOrderListRequest) {
        const { data } = await this.client.post<SettleOrderListResponse>(
            "/settle/order/all",
            payload,
            { headers: { loginKey: await this.getLoginKey() } }
        );
        return data;
    }

    /** Update settlement order */
    async updateSettlementOrder(payload: SettleOrderUpdateRequest) {
        const { data } = await this.client.post<SettleOrderUpdateResponse>(
            "/settle/order/update",
            payload,
            { headers: { loginKey: await this.getLoginKey() } }
        );
        return data;
    }

    /** Update settlement bank details */
    async updateSettlementOrderBank(payload: SettleOrderUpdateBankRequest) {
        const { data } = await this.client.post<SettleOrderUpdateBankResponse>(
            "/settle/order/updatebank",
            payload,
            { headers: { loginKey: await this.getLoginKey() } }
        );
        return data;
    }

    /** Update settlement DP details */
    async updateSettlementOrderDp(payload: SettleOrderUpdateDpRequest) {
        const { data } = await this.client.post<SettleOrderUpdateDpResponse>(
            "/settle/order/updatedp",
            payload,
            { headers: { loginKey: await this.getLoginKey() } }
        );
        return data;
    }

    // =====================================================
    // Payment APIs
    // =====================================================

    /** Fetch list of payment transactions */
    async getPaymentTransactions(payload: PaymentTransactionQueryRequest) {
        const { data } = await this.client.post<PaymentTransactionRecord[]>(
            "/paytxn",
            payload,
            { headers: { loginKey: await this.getLoginKey() } }
        );
        return data;
    }

    /** Initiate a UPI payment transaction */
    async initiateUpiPayment(payload: UpiPaymentInitiationRequest) {
        const { data } = await this.client.post<PaymentTransactionResponse>(
            "/paytxn/upi",
            payload,
            { headers: { loginKey: await this.getLoginKey() } }
        );
        return data;
    }
}
