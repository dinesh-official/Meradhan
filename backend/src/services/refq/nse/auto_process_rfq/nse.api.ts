import type { Axios } from "axios"
import axios, { isAxiosError } from "axios";
import type { Accept_DEAL_PROPOSE_API, Accept_Negotiation_API, DEAL_PROPOSE_API, ISIN_ADD_API, LoginAPI } from "./nse.types";
import { env } from "@packages/config/src/env";

export const nseKeys = {
    domain: env.RFQ_CBRICS_DOMAIN,
    login: env.RFQ_CBRICS_LOGIN,
    password: env.RFQ_CBRICS_PASSWORD,
    apiPath: env.RFQ_CBRICS_ENV == "PROD" ? "https://bricsonline.nseindia.com/rfq/rest/v1" : "https://bricsonlinereguat.nseindia.com/rfq/rest/v1"
}

class NseClientService {
    protected token?: string;
    private createAt?: Date;
    protected client: Axios;

    constructor() {
        this.client = axios.create({
            baseURL: nseKeys.apiPath,
            withCredentials: true,
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
                "Content-Type": "application/json",
                Accept: "application/json, text/javascript, */*; q=0.01",
                "Accept-Language": "en-US,en;q=0.5",
                "X-Requested-With": "XMLHttpRequest",
                Origin: nseKeys.apiPath.split("/rfq/")[0],
                DNT: "1",
                Connection: "keep-alive",
                "Sec-Fetch-Dest": "empty",
                "Sec-Fetch-Mode": "cors",
                "Sec-Fetch-Site": "same-origin",
            },
        })
        this.client.interceptors.request.use((config) => {
            console.log(
                `📡 [NSE] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`
            );
            return config;
        });

        this.client.interceptors.response.use(
            (response) => {
                console.log(
                    `✅ [NSE] ${response.config.method?.toUpperCase()} ${response.config.baseURL}${response.config.url} -> ${response.status}`
                );
                return response;
            },
            (error) => {
                console.error(
                    `❌ [NSE ERROR] ${error.config?.method?.toUpperCase()} ${error.config?.baseURL
                    }${error.config?.url} -> ${error.response?.status}`
                );
                return Promise.reject(error);
            }
        );

    }

    protected async genToken() {
        try {
            const existingToken = this.useExistingToken();
            if (existingToken) {
                return existingToken;
            }
            const { data, status } = await this.client.post<LoginAPI['RESPONSE']>("/login", {
                domain: nseKeys.domain,
                login: nseKeys.login,
                password: nseKeys.password
            } as LoginAPI['REQUEST']);
            if (status != 200) {
                throw new Error("Login Failed Please unknown status code")
            }
            if (data.status == "F") {
                console.error(JSON.stringify(data || {}, null, 2));
                throw new Error(data.status + " : Login Failed Status Code is F");
            }
            // reuse same token
            this.token = data.loginKey;
            this.createAt = new Date();

            return data.loginKey;
        } catch (error) {
            if (isAxiosError(error)) {
                console.log({
                    token: this.token,
                    createAt: this.createAt,
                    apiPath: nseKeys.apiPath
                });
                console.error(JSON.stringify(error.response?.data?.messages || error.response?.data || {}, null, 2));
            }
            this.token = undefined;
            this.createAt = undefined;
            throw error;
        }
    }

    private useExistingToken() {
        if (this.createAt) {
            const createdAt = new Date(this.createAt);
            const oneMinuteAgo = Date.now() - 60 * 1000;
            if (createdAt.getTime() <= oneMinuteAgo) {
                return null;
            } else {
                if (this.token) {
                    return this.token as string;
                }
            }
        }
        return null;
    }

}

export class NseRfqMasterService extends NseClientService {
    async addIsinRfq(payload: ISIN_ADD_API['REQUEST']) {
        try {
            const loginKey = await this.genToken();
            const { data, status } = await this.client.post<ISIN_ADD_API['RESPONSE'][]>("/rfqmaster/add/isin",
                payload,
                {
                    headers: {
                        loginKey
                    }
                });
            if (status != 200) {
                console.error(JSON.stringify(data || {}, null, 2));
                throw new Error("STEP 1: Add ISIN Request failed please try again StatusCode : " + status)
            }
            return data[0];
        } catch (error) {
            if (isAxiosError(error)) {
                console.error(JSON.stringify(error.response?.data?.messages || error.response?.data || {}, null, 2));
            }
            throw error;
        }
    }

    async acceptNegotiation(payload: Accept_Negotiation_API['REQUEST']) {
        try {
            const loginKey = await this.genToken();
            const { data, status } = await this.client.post<Accept_Negotiation_API['RESPONSE']>(
                "/negotiation/accept",
                payload,
                { headers: { loginKey } }
            );
            if (status != 200) {
                console.error(JSON.stringify(data || {}, null, 2));
                throw new Error("STEP 2: Negotiation Accept Request failed please try again StatusCode : " + status)
            }
            return data;
        } catch (error) {
            if (isAxiosError(error)) {
                console.error(JSON.stringify(error.response?.data?.messages || error.response?.data || {}, null, 2));
            }
            throw error;
        }
    }

    async proposeDeal(payload: DEAL_PROPOSE_API['REQUEST']) {
        try {
            const loginKey = await this.genToken();
            const { data, status } = await this.client.post<DEAL_PROPOSE_API['RESPONSE']>(
                "/deal/propose",
                payload,
                { headers: { loginKey } }
            );
            if (status != 200) {
                console.error(JSON.stringify(data || {}, null, 2));
                throw new Error("STEP 3: Deal Propose Request failed please try again StatusCode : " + status)
            }
            return data;
        } catch (error) {
            if (isAxiosError(error)) {
                console.error(JSON.stringify(error.response?.data?.messages || error.response?.data || {}, null, 2));
            }
            throw error;
        }
    }

    async acceptRejectDeal(payload: Accept_DEAL_PROPOSE_API['REQUEST']) {
        try {
            const loginKey = await this.genToken();
            const { data, status } = await this.client.post<Accept_DEAL_PROPOSE_API['RESPONSE']>(
                "/deal/acceptreject",
                payload,
                { headers: { loginKey } }
            );
            if (status != 200) {
                console.error(JSON.stringify(data || {}, null, 2),);
                throw new Error("STEP 4: Deal Accept/Reject Request failed please try again StatusCode : " + status)
            }
            return data;
        } catch (error) {
            if (isAxiosError(error)) {
                console.error(JSON.stringify(error.response?.data?.messages || error.response?.data || {}, null, 2));
            }
            throw error;
        }
    }
}