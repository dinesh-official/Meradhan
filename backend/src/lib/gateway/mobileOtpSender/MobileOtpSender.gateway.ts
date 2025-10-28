import { removeCountryCode } from '@utils/filters/convert';
import axios from 'axios'
export class MobileOtpSenderGateway {

    async sendMsg91(mobile: string, otp: string | number, template: "signup" | "login" | "verify") {
        const templateID = {
            "signup": "686257ffd6fc0570d97177b3",
            "login": "6862803fd6fc05044526e1b2",
            "verify": "68627f8bd6fc0528ed5dd322"
        }
        const response = await axios.post<{
            type: string
            request_id: string
        }
        >("https://control.msg91.com/api/v5/flow/", {
            template_id: templateID[template],
            mobiles: "91" + removeCountryCode(mobile),
            authkey: "441386Agy1HjWXw267ae06b8P1",
            otp: otp,
        });
        return response.data;
    }

}