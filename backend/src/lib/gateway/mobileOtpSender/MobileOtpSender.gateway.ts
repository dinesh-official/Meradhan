import axios from 'axios'
export class MobileOtpSenderGateway {
    private sanitizeMobile(mobile: string): string {
        // Remove everything except numbers
        let clean = mobile.replace(/\D/g, "");
        // Keep only last 10 digits (most local mobile numbers globally use <= 10 digits)
        if (clean.length > 10) {
            clean = clean.slice(clean.length - 10);
        }
        // Validate
        if (clean.length !== 10) {
            throw new Error(`Invalid mobile number format: ${mobile}`);
        }
        return clean;
    }


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
            mobiles: "91" + this.sanitizeMobile(mobile),
            authkey: "441386Agy1HjWXw267ae06b8P1",
            otp: otp,
        });
        return response.data;
    }

}