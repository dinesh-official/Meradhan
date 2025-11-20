import { env } from "@packages/config/env";
import { removeCountryCode } from "@utils/filters/convert";
import axios from "axios";

export class SMSCommunication {
  async sendMsg91(
    mobile: string,
    otp: string | number,
    template: "signup" | "login" | "verify"
  ) {
    const templateID = {
      signup: env.MSG91_SIGNUP_TEMPLATE,
      login: env.MSG91_LOGIN_TEMPLATE,
      verify: env.MSG91_VERIFY_TEMPLATE,
    };
    const response = await axios.post<{
      type: string;
      request_id: string;
    }>("https://control.msg91.com/api/v5/flow/", {
      template_id: templateID[template],
      mobiles: "91" + removeCountryCode(mobile),
      authkey: env.MSG91_AUTH_KEY,
      otp: otp,
    });
    return response.data;
  }
}
