import axios, { type AxiosInstance } from "axios";
import * as crypto from "crypto";
import type { DanRequest, DanResponse } from "./NSDLApi.response";
import type { DemateVerifyResponse } from "../response.types";

import https from "https";

export class NSDLApi {
  private readonly axiosInstance: AxiosInstance;
  private readonly requestorId: string;
  private readonly secretKey: string;
  private readonly baseUrl: string;

  constructor(requestorId: string, secretKey: string, isProd: boolean = false) {
    this.requestorId = requestorId;
    this.secretKey = secretKey;
    this.baseUrl = isProd
      ? "https://eservices.nsdl.com"
      : "https://eservices-test.nsdl.com";
    console.log(this.baseUrl);

    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
      headers: {
        "Content-Type": "application/json",
        "Transaction-Type": "MFS", // Predefined as per spec
        "Requestor-Id": this.requestorId,
      },
    });
  }

  private generateSignature(timestamp: string, body: DanRequest): string {
    // Convert body to minified JSON (no spaces)
    const requestBody = JSON.stringify(body);
    const stringToSign = this.secretKey + timestamp + requestBody;
    console.log(stringToSign);

    const hash = crypto.createHash("sha256").update(stringToSign).digest(); // hash is Buffer
    return hash.toString("base64"); // ✅ direct conversion
  }

  private getCurrentTimestamp(): string {
    const now = new Date();
    // Format: 2019-03-11T13:16:22+0530
    const iso = now.toISOString().replace(/\.\d{3}Z$/, "");
    const offsetMinutes = now.getTimezoneOffset();
    const offsetHours = Math.floor(Math.abs(offsetMinutes) / 60)
      .toString()
      .padStart(2, "0");
    const offsetMins = (Math.abs(offsetMinutes) % 60)
      .toString()
      .padStart(2, "0");
    const sign = offsetMinutes > 0 ? "-" : "+";
    return `${iso}${sign}${offsetHours}${offsetMins}`;
  }

  async checkDANstatus(
    body: DanRequest
  ): Promise<DemateVerifyResponse<DanResponse>> {
    const timestamp = this.getCurrentTimestamp();
    const signature = this.generateSignature(timestamp, {
      transactionId: body.transactionId,
      dpId: body.dpId,
      clientId: body.clientId,
      fstHoldrPan: body.fstHoldrPan,
      scndHoldrPan: body.scndHoldrPan,
      thrdHoldrPan: body.thrdHoldrPan,
    });

    const response = await this.axiosInstance.post<DanResponse>(
      "/customer-service/v2/dan/checkDANstatus",
      body,
      {
        headers: {
          Timestamp: timestamp,
          "X-Api-Signature": signature,
        },
      }
    );
    return {
      fstHoldrPan: body.fstHoldrPan,
      scndHoldrPan: body.scndHoldrPan,
      idNo: body.transactionId,
      isVerified: response.data.status === "00",
      status: response.data.status,
      message: response.data.message,
      thrdHoldrPan: body.thrdHoldrPan,
      data: response.data,
    };
  }
}
