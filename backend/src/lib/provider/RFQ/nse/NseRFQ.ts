import axios, { Axios } from "axios";
export class NseRfq {

    private client: Axios;
    private credentials = {
        "domain": "BCISPL",
        "login": "DEV",
        "password": "sour@V#404root"
    }

    constructor() {
        this.client = axios.create({
            baseURL: "https://bricsonlinereguat.nseindia.com/rfq/rest/v1",
        })
    }

    private async login() {
        const { data } = await this.client.post<{
            lastLogin: number
            brokerEnablementType: string
            loginKey: string
            domain: string
            serverTime: number
            login: string
            broker: boolean
            status: string
        }
        >("/login", this.credentials);
        return data;
    }

    public async getLoginKey(): Promise<string> {
        const { loginKey } = await this.login();
        return loginKey;
    }

    public async logout() {
        const { data } = await this.client.get<{ status: "C" }>("/logout");
        return data

    }

}