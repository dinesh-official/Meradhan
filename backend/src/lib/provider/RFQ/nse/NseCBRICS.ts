import axios, { Axios } from "axios";
import { cacheStorage } from "../../../../queues/redis/queues";
import type { UnregisteredParticipantRequest, UnregisteredParticipantResponse } from "./types";
export class NseCBRICS {
    private loginStoreKey = "NSE_CBRICS_LOGIN__KEY"
    private client: Axios;
    private credentials = {
        "domain": "BCISPL",
        "login": "DEV",
        "password": "sour@V#404root"
    }

    constructor() {
        this.client = axios.create({
            baseURL: "https://bricsonlinereguat.nseindia.com/bondsnew/rest/v1",
            withCredentials: true,
            headers: {
                "User-Agent": "MeraDhan/0.0.1",
                "Content-Type": "application/json"
            }
        })
    }

    private async login() {
        const { data } = await this.client.post<{
            firstName: string
            lastLogin: number
            ownerCode: string
            loginKey: string
            serverTime: number
            login: string
            status: string
        }
        >("/login", this.credentials)
        return data;
    }

    public async getLoginKey(): Promise<string> {
        const checkOnCache = await cacheStorage.get<string>(this.loginStoreKey)
        if (!checkOnCache) {

            const { loginKey, serverTime } = await this.login();

            const CACHE_TTL_MS = 10 * 60 * 1000;
            const currentTime = Date.now();
            const drift = serverTime - currentTime;
            const ttl = CACHE_TTL_MS - Math.max(0, drift);

            await cacheStorage.set(this.loginStoreKey, loginKey, ttl)
            return loginKey;
        }
        return checkOnCache;
    }

    public async logout() {
        const { data } = await this.client.get<{ status: "C" }>("/logout");
        return data
    }



    //Unregistered Participants API 
    /// add POST /rest/v1/unreg
    async unregisteredParticipant(payload: UnregisteredParticipantRequest) {
        const { data } = await this.client.post<UnregisteredParticipantResponse>("/unreg", payload, {
            headers: {
                loginKey: await this.getLoginKey()
            }
        });
        return data
    }

}

const client = new NseCBRICS();

try {

    const data = await client.unregisteredParticipant({
        "loginId": "MD3123X",
        "firstName": "PART 131",
        "panNo": "PANNO0131A",
        "contactPerson": "Mr Test",
        "mobileList": ["1231231231"],
        "emailList": ["test@testcompany.com"],
        "telephone": "1231231231",
        "address": "Test line 1",
        "address2": "Test line 2",
        "address3": "Test line 3",
        "stateCode": "16",
        "regAddress": "Test registered address",
        "bankAccountList": [
            {
                "bankName": "HDFC",
                "bankIFSC": "HDFC1231221",
                "bankAccountNo": "123411112312",
                "isDefault": "Y"
            }
        ],
        "dpAccountList": [
            {
                "dpType": "NSDL",
                "dpId": "IN299334",
                "benId": "12345678",
                "isDefault": "Y"
            }
        ]
    }
    )
    console.log(data);
} catch (error) {
    console.log(error.response.data);

}

