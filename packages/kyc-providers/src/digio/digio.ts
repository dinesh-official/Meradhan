import axios, { type AxiosInstance } from "axios";
import FormData from "form-data";
import fs from "fs";
import { v4 as uuid } from "uuid";
import { env } from "@packages/config/env";
import type {
  DigioSignatureResponse,
  TDigioWithTemplateResponse,
  TVerifyBankAccountResponse,
} from "./digio.response";
export class DigioSDK {
  private client: AxiosInstance;
  constructor() {
    this.client = axios.create({
      baseURL:
        env.NEXT_PUBLIC_DIGIO == "sandbox"
          ? "https://ext.digio.in:444"
          : "https://api.digio.in",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(env.DIGIO_USERNAME_PASS)}`, // Replace with real key
      },
    });
  }

  async verifyPanInfo(data: { id_no: string; name: string; dob: string }) {
    const response = await this.client.post<{
      aadhaar_seeding_status: string;
      name_as_per_pan_match: boolean;
      pan: string;
      category: string;
      status: string;
      date_of_birth_match: boolean;
    }>("/v3/client/kyc/fetch_id_data/PAN", data);
    return response.data;
  }

  async sendTemplateRequest({
    emailId,
    name,
    templateName,
    reference_id,
  }: {
    emailId: string;
    name: string;
    templateName: string;
    reference_id?: string;
  }) {
    const transaction_id = uuid();
    const response = await this.client.post<TDigioWithTemplateResponse>(
      "/client/kyc/v2/request/with_template",
      {
        customer_identifier: emailId,
        customer_name: name,
        template_name: templateName,
        notify_customer: false,
        expire_in_days: 10,
        generate_access_token: true,
        generate_deeplink_info: true,
        transaction_id,
        reference_id,
      },
    );
    return response.data;
  }

  async getKycgetResponse<T>(kid: string): Promise<T> {
    const response = await this.client.post<T>(
      `/client/kyc/v2/${kid}/response`,
    );
    return response.data;
  }

  async getMediaData(rid: string) {
    const response = await this.client.get(`/client/kyc/v2/media/${rid}`, {
      responseType: "arraybuffer",
    });
    return response.data;
  }

  async verifyBankAccount(data: {
    beneficiary_account_no: string;
    beneficiary_ifsc: string;
    beneficiary_name: string;
  }) {
    const transaction_id = uuid();
    const response = await this.client.post<TVerifyBankAccountResponse>(
      `/v4/client/verify/bank_account`,
      {
        beneficiary_account_no: data.beneficiary_account_no,
        beneficiary_ifsc: data.beneficiary_ifsc,
        beneficiary_name: data.beneficiary_name,
        // narration: "india",
        unique_request_id: transaction_id,
        validation_mode: "PENNY_DROP",
      },
    );
    return response.data;
  }

  // ifsc code
  async fetchIfscCode(payload: { ifsc: string }) {
    try {
      const { data } = await this.client.get(
        `https://ifsc.razorpay.com/${payload.ifsc}`,
        { headers: { "Content-Type": "application/json" } },
      );
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
        IFSC: "",
      };
    }
  }

  /** KRA path PDF has 2 fewer pages (no e-Aadhaar / e-PAN attachment pages) → fewer sign slots. */
  static readonly ESIGN_PAGE_COUNT_DEFAULT = 46;
  static readonly ESIGN_PAGE_COUNT_KRA = 44;

  async esignRequest(
    filePath: string,
    {
      email,
      name,
      useKraKyc,
    }: { email: string; name: string; useKraKyc?: boolean },
  ) {
    try {
      const form = new FormData();
      const time = new Date().getTime();
      const signPageCount = useKraKyc
        ? DigioSDK.ESIGN_PAGE_COUNT_KRA
        : DigioSDK.ESIGN_PAGE_COUNT_DEFAULT;

      // Attach the PDF as binary
      // Attach the PDF file as binary stream
      form.append("file", fs.readFileSync(filePath), {
        filename: "document" + time + ".pdf",
        contentType: "application/pdf",
      });
      form.append(
        "request",
        JSON.stringify({
          file_name: "document" + time + ".pdf",
          will_self_sign: false,
          notify_signers: false,
          send_sign_link: false,
          generate_access_token: true,
          display_on_page: "custom",
          sign_coordinates: {
            [email]: Object.fromEntries(
              Array.from({ length: signPageCount }, (_, i) => [
                (i + 1).toString(),
                [{ llx: 420, lly: 50, urx: 555, ury: 100 }],
              ]),
            ),
          },
          signers: [
            {
              identifier: email,
              name: name,
              sign_type: "aadhaar",
              reason: "For MeraDhan Kyc",
            },
          ],
        }),
      );

      const data = await this.client.post<DigioSignatureResponse>(
        "/v2/client/document/upload",
        form,
        {
          headers: {
            ...form.getHeaders(),
          },
        },
      );
      return data.data;
    } catch (error) {
      //@typescript-eslint/no-explicit-any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      console.log((error as any)?.response?.data);
      throw error;
    }
  }

  async getSignatureEsignPdf(document_id: string) {
    const response = await this.client.get<string>(
      `/v2/client/document/download`,
      {
        params: { document_id },
        responseType: "arraybuffer",
      },
    );
    return response.data;
  }
}
