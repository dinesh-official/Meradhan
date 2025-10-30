import axios, { type AxiosInstance } from 'axios'
import { v4 as uuid } from 'uuid'
import type { TDigioWithTemplateResponse, TVerifyBankAccountResponse } from './digio.response';
export class DigioSDK {
    private client: AxiosInstance;
    constructor() {
        this.client = axios.create({
            baseURL: "https://ext.digio.in:444",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Basic ${btoa("ACK250805175803472WR3YWRCHU32425:6TZL379SV9DLOWHYF5QCF3ONQZ1UI7G7")}`, // Replace with real key
            },
        })
    }

    async sendTemplateRequest({ emailId, name, templateName, reference_id }: {
        emailId: string;
        name: string;
        templateName: string;
        reference_id?: string;
    }) {

        const transaction_id = uuid();
        const response = await this.client.post<TDigioWithTemplateResponse>('/client/kyc/v2/request/with_template', {
            customer_identifier: emailId,
            customer_name: name,
            template_name: templateName,
            notify_customer: false,
            expire_in_days: 10,
            generate_access_token: true,
            generate_deeplink_info: true,
            transaction_id,
            reference_id,
        });
        return response.data;
    }


    async getKycgetResponse<T>(kid: string): Promise<T> {
        const response = await this.client.post<T>(`/client/kyc/v2/${kid}/response`);
        return response.data;
    };

    async getMediaData(rid: string) {
        const response = await this.client.get(`/client/kyc/v2/media/${rid}`, {
            responseType: "arraybuffer",
        });
        return response.data;
    }


    async verifyBankAccount(data: {
        beneficiary_account_no: string
        beneficiary_ifsc: string
        beneficiary_name: string
    }) {
        const transaction_id = uuid();
        const response = await this.client.post<TVerifyBankAccountResponse>(`/v4/client/verify/bank_account`, {
            amount: 1,
            beneficiary_account_no: data.beneficiary_account_no,
            beneficiary_ifsc: data.beneficiary_ifsc,
            beneficiary_name: data.beneficiary_name,
            // narration: "india",
            unique_request_id: transaction_id,
            validation_mode: "PENNY_DROP"
        });
        return response.data;
    }




    // ifsc code 
    async fetchIfscCode(payload: { ifsc: string }) {
        try {
            const { data } = await this.client.get(`https://ifsc.razorpay.com/${payload.ifsc}`, { headers: { 'Content-Type': 'application/json' } });
            return data;
        } catch {
            return {
                BRANCH: "",
                CENTRE: "",
                DISTRICT: "",
                STATE: "",
                ADDRESS: "",
                CONTACT: "",
                IMPS: false,
                CITY: "",
                UPI: false,
                MICR: "",
                RTGS: false,
                NEFT: false,
                SWIFT: null,
                ISO3166: "",
                BANK: "",
                BANKCODE: "",
                IFSC: ""
            }
        }
    }

}