import axios, { type AxiosInstance } from "axios";
import * as crypto from "crypto";
import type { DemateVerifyResponse } from "../dmeat.types";
import type { BoPanRequest, BoPanResponse } from "./CDSLApi.response";



// CDSL API class to interact with CDSL's BO-PAN verification service
export class CDSLApi {
  private readonly axiosInstance: AxiosInstance;
  private readonly AesKey: string;
  private readonly baseUrl: string;

  constructor(data: { AESKey: string, isProd: boolean }) {


    this.AesKey = data.AESKey;

    this.baseUrl = data.isProd
      ? "https://app.cdslindia.com/EasiEasiestApi/BOPAN"
      : "https://testapp.cdslindia.com/EasiEasiestApi/BOPAN";

    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers: {
        "Content-Type": "text/plain", // Encrypted blob is sent as plain text
        Accept: "application/json",
        version: "1.0",
      },
    });
  }

  /* ============ Utilities ============ */


  generateEntityId(prefix = "ENT") {
    // Generate 6 random bytes (48 bits) and convert to base36 for compactness
    const randomPart = crypto.randomBytes(6).toString("base64").toUpperCase();

    // Add last 5 digits of current timestamp to ensure no repetition
    const timePart = Date.now().toString().slice(-5);

    // Combine prefix + time + random part, trimmed to 16 chars
    const entityId = (prefix + timePart + randomPart).substring(0, 16);

    return entityId;
  }

  /** Header reqdatetime (milliseconds as string) */
  private getHeaderTimestamp(): string {
    return Date.now().toString();
  }

  /** Body reqdatetime (format ddMMyyyyHHmmss) */
  private getBodyTimestamp(): string {
    const d = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    return (
      pad(d.getDate()) +
      pad(d.getMonth() + 1) +
      d.getFullYear() +
      pad(d.getHours()) +
      pad(d.getMinutes()) +
      pad(d.getSeconds())
    );
  }

  /** AES-256-CBC encrypt JSON -> Base64(iv+ciphertext) */
  private encryptRequestData(requestData: object): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", this.AesKey, iv);
    const plaintext = JSON.stringify(requestData);
    const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
    return Buffer.concat([iv, encrypted]).toString("base64");
  }

  /** (Optional) Decrypt payload — for testing only */
  private decryptPayload(base64Data: string) {
    const buffer = Buffer.from(base64Data, "base64");
    const iv = buffer.subarray(0, 16);
    const data = buffer.subarray(16);
    const decipher = crypto.createDecipheriv("aes-256-cbc", this.AesKey, iv);
    const decrypted = Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
    return JSON.parse(decrypted);
  }

  /* ============ Main API Method ============ */

  /**
   * Validate BO–PAN Combination
   * Endpoint: /PANVerifyRequest/
   */
  async panVerifyRequest(request: BoPanRequest): Promise<DemateVerifyResponse<BoPanResponse>> {
    if (!request.boid || !request.pan1) {
      throw new Error("boid and pan1 are required.");
    }

    const headerTimestamp = this.getHeaderTimestamp();
    const bodyTimestamp = this.getBodyTimestamp();

    // Prepare the plaintext RequestData structure
    const body = {
      RequestData: {
        reqdatetime: bodyTimestamp,
        boid: request.boid,
        pan1: request.pan1,
        pan2: request.pan2 ?? null,
        pan3: request.pan3 ?? null,
      },
    };

    // Encrypt it
    const encryptedBody = this.encryptRequestData(body);

    // Send request
    const response = await this.axiosInstance.post<BoPanResponse>(
      "/PANVerifyRequest/",
      encryptedBody,
      {
        headers: {
          entityid: this.generateEntityId(),
          reqdatetime: headerTimestamp,
        },
      }
    );

    return {
      fstHoldrPan: request.pan1,
      scndHoldrPan: request.pan2 || undefined,
      thrdHoldrPan: request.pan3 || undefined,
      idNo: response.data.ReqSeqNo,
      isVerified: response.data.StatusCode === "01", // "01" means verified,,
      status: response.data.StatusCode,
      message: response.data.ErrorDescription,
      data: response.data,
    };
  }
}
