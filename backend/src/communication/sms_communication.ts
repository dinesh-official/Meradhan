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

  /**
   * DLT-approved template send (MSG91 flow API shape; variables merged into recipient payload).
   */
  async sendBulkSmsDlt(
    mobile: string,
    templateId: string,
    templateVariables: Record<string, string>
  ) {
    
    const url = env.MSG91_DLT_FLOW_URL ?? "https://control.msg91.com/api/v5/flow/";
    const response = await axios.post<{
      type?: string;
      message?: string;
      request_id?: string;
    }>(url, {
      template_id: templateId,
      short_url: "0",
      recipients: [
        {
          mobiles: "91" + removeCountryCode(mobile),
          ...templateVariables,
        },
      ],
      authkey: env.MSG91_AUTH_KEY,
    });
    return response.data;
  }
}
