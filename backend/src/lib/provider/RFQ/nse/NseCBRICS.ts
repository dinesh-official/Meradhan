import axios, { Axios, AxiosError } from "axios";
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
} from "./cbrics.types";

export class NseCBRICS {
    private loginStoreKey = "NSE_CBRICS_LOGIN_KEY";
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
                'Accept': 'application/json, text/javascript, */*; q=0.01',
                'Accept-Language': 'en-US,en;q=0.5',
                'X-Requested-With': 'XMLHttpRequest',
                'Origin': 'https://bricsonline.nseindia.com',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-origin',
            },
        });
    }

    // ────────────────────────────────────────────────────────────────
    // 🔐 LOGIN / LOGOUT HANDLING
    // ────────────────────────────────────────────────────────────────

    async login() {
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

    public async getLoginKey(forceRefresh = false): Promise<string> {
        if (!forceRefresh) {
            const cached = await cacheStorage.get<string>(this.loginStoreKey);
            if (cached) return cached;
        }

        const { loginKey } = await this.login();
        await cacheStorage.set(this.loginStoreKey, loginKey, 1000);
        return loginKey;
    }

    private isLoginExpired(error: AxiosError<{ message?: string }>): boolean {
        const msg = (error.response?.data)?.message ?? error.message;
        const status = error.response?.status;
        return (
            status === 401 ||
            msg.includes("Invalid loginKey") ||
            msg.includes("Session expired")
        );
    }

    private async withReLoginRetry<T>(
        apiCall: (loginKey: string) => Promise<T>
    ): Promise<T> {
        try {
            const key = await this.getLoginKey();
            return await apiCall(key);
        } catch (error) {
            if (axios.isAxiosError(error) && this.isLoginExpired(error)) {
                const newKey = await this.getLoginKey(true);
                return await apiCall(newKey);
            }
            throw error;
        }
    }

    public async logout() {
        return this.withReLoginRetry(async (loginKey) => {
            const { data } = await this.client.get<{ status: "C" }>("/logout", {
                headers: { loginKey },
            });
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

    public async unregisteredParticipant(payload: UnregisteredParticipantRequest) {
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

    public async getAllUnregisteredParticipants(payload?: UnregisteredParticipantParams) {
        return this.withReLoginRetry(async (loginKey) => {
            const { data } = await this.client.post<UnregisteredParticipantResponse>(
                "/unreg/all",
                payload,
                { headers: { loginKey } }
            );
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
            const { data } =
                await this.client.post<UnregisteredParticipantBankAccountResponse[]>(
                    "/unreg/bankacc/all",
                    payload,
                    { headers: { loginKey } }
                );
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

    public async addUnregisteredDpAccount(payload: AddUnregisteredDpAccountRequest) {
        return this.withReLoginRetry(async (loginKey) => {
            const { data } = await this.client.post<UnregisteredDpAccountResponse>(
                "/unreg/dpacc",
                payload,
                { headers: { loginKey } }
            );
            return data;
        });
    }

    public async getAllUnregisteredDpAccounts(payload?: GetUnregisteredDpAccountsRequest) {
        return this.withReLoginRetry(async (loginKey) => {
            const { data } = await this.client.post<GetUnregisteredDpAccountsResponse>(
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
            const { data } = await this.client.post<MarkDefaultUnregisteredDpAccountResponse>(
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
            const { data } = await this.client.post<OrderResponse>("/order", payload, {
                headers: { loginKey },
            });
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

    public async getFilteredSellReportings(payload?: SellReportingsFilterRequest) {
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

    public async updateSettlementOrderBank(payload: SettleOrderUpdateBankRequest) {
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

const cb = new NseCBRICS();

const data = await cb.login();
console.log(data);
const l = await cb.logout();
console.log(l);


