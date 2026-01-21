import axios, { type AxiosInstance } from "axios";
import * as crypto from "crypto";
import type { BoPanRequest, BoPanResponse } from "./CDSLApi.response";
import type { DemateVerifyResponse } from "../response.types";
import { env } from "@packages/config/env";

const StatusCodeMessages: Record<string, string> = {
  "01": "Valid BO-PAN",
  "02": "Invalid BOID",
  "04": "BOID is closed",
  "05": "PAN not matching with the First Holder",
  "06": "PAN not matching with the Second Holder",
  "07": "PAN not matching with the Third Holder",
  "08": "Frozen for Credit",
  "09": "Frozen for Debit",
  "10": "Frozen for Both Debit And Credit",
  "-1": "Failure",
  "00": "Failure",
};

export class CDSLApi {
  private readonly axiosInstance: AxiosInstance;
  private readonly AesKey: string;
  private readonly baseUrl: string;

  constructor(data: { AESKey: string; isProd: boolean }) {
    this.AesKey = data.AESKey;
    if (this.AesKey.length !== 32)
      throw new Error("AESKey must be exactly 32 bytes for AES-256.");

    this.baseUrl = data.isProd
      ? "https://apigt.cdsl.co.in/EasiEasiestApi/BOPAN"
      : "https://mockapigt.cdsl.co.in/EasiEasiestApi/BOPAN";

    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
        Version: "1.0",
      },
    });
  }

  private buildIstTimestamps(now = new Date()) {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    const parts = Object.fromEntries(
      fmt.formatToParts(now).map((p) => [p.type, p.value]),
    ) as Record<
      "day" | "month" | "year" | "hour" | "minute" | "second",
      string
    >;
    const body14 = `${parts.day}${parts.month}${parts.year}${parts.hour}${parts.minute}${parts.second}`;

    // convert IST -> UTC epoch
    const y = parseInt(parts.year, 10);
    const M = parseInt(parts.month, 10);
    const d = parseInt(parts.day, 10);
    const H = parseInt(parts.hour, 10);
    const m = parseInt(parts.minute, 10);
    const s = parseInt(parts.second, 10);

    const utcMs = Date.UTC(y, M - 1, d, H, m, s) - (5 * 60 + 30) * 60 * 1000;
    const headerEpochMs = String(utcMs);

    return { body14, headerEpochMs };
  }

  /** AES-256-CBC encryption with PKCS7 padding and zero IV (per CDSL spec) */
  private encryptRequestData(
    requestData: object,
    iv = Buffer.alloc(16, 0x00),
  ): string {
    const key = Buffer.from(this.AesKey, "utf8");
    if (key.length !== 32)
      throw new Error("Invalid AES-256 key length (must be 32 bytes).");

    const plaintext = JSON.stringify(requestData);
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    const c1 = cipher.update(Buffer.from(plaintext, "utf8"));
    const c2 = cipher.final();
    const ciphertext = Buffer.concat([c1, c2]);
    return ciphertext.toString("base64");
  }

  /** Optional decrypt utility — for internal testing */
  private decryptPayload(base64Cipher: string, iv = Buffer.alloc(16, 0x00)) {
    const key = Buffer.from(this.AesKey, "utf8");
    const data = Buffer.from(base64Cipher, "base64");
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    const decrypted = Buffer.concat([
      decipher.update(data),
      decipher.final(),
    ]).toString("utf8");
    try {
      return JSON.parse(decrypted);
    } catch {
      return decrypted;
    }
  }

  /** Main API method — PAN Verify Request */
  async panVerifyRequest(
    request: BoPanRequest,
  ): Promise<DemateVerifyResponse<BoPanResponse>> {
    if (!request.boid || !request.pan1)
      throw new Error("Missing required fields: boid and pan1.");

    const { body14 } = this.buildIstTimestamps();

    const body = {
      RequestData: {
        reqdatetime: body14,
        boid: request.boid,
        pan1: request.pan1,
        pan2: request.pan2 ?? null,
        pan3: request.pan3 ?? null,
      },
    };

    // Encrypt payload
    const encryptedBody = this.encryptRequestData(body);

    const headers = {
      "Content-Type": "application/json",
      Version: "1.0",
      EntityID: env.ENTITY_ID,
      Reqdatetime: body14,
    };

    const response = await this.axiosInstance.post<BoPanResponse>(
      "/PANVerifyRequest",
      JSON.stringify(encryptedBody),
      { headers },
    );

    const data = response.data;

    return {
      idNo: data.ReqSeqNo,
      fstHoldrPan: request.pan1,
      scndHoldrPan: request.pan2 ?? undefined,
      thrdHoldrPan: request.pan3 ?? undefined,
      isVerified: data.statuscode === "01",
      status: data.statuscode,
      message: StatusCodeMessages[data.statuscode] || "Unknown Status Code",
      data,
    };
  }
}
