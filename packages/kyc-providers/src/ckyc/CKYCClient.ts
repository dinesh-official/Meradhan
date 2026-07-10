import axios from "axios";
import {
  aesEncrypt,
  aesDecrypt,
  encryptSessionKey,
  decryptSessionKey,
  generateSessionKey,
} from "./crypto";
import { signXML } from "./xml";
import type { CKYCConfig, CKYCResponse } from "./types";
import { CKYCError } from "./types";
import { parseStringPromise } from "xml2js";
import { randomBytes } from "crypto";

export class CKYCClient {
  private searchUrl: string;
  private downloadUrl: string;
  private validateOtpUrl: string;
  private requestCounter: number = 0;

  constructor(private config: CKYCConfig) {
    if (
      !config.fiCode ||
      !config.cersaiPublicKeyPem ||
      !config.fiPrivateKeyPem
    ) {
      throw new CKYCError(
        "Missing required configuration: fiCode, cersaiPublicKeyPem, and fiPrivateKeyPem are required"
      );
    }

    const base =
      config.env === "LIVE"
        ? "https://www.ckycindia.in"
        : "https://testbed.ckycindia.in";

    this.searchUrl = `${base}/Search/ckycverificationservice/verify`;
    this.downloadUrl = `${base}/Search/ckycverificationservice/download`;
    this.validateOtpUrl = `${base}/Search/ckycverificationservice/ValidateOTP`;
  }

  /* ---------------- SEARCH API ---------------- */

  async searchByPAN(pan: string): Promise<CKYCResponse> {
    if (!pan || pan.trim().length === 0) {
      throw new CKYCError("PAN is required");
    }

    const sanitizedPan = pan.trim().toUpperCase();
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(sanitizedPan)) {
      throw new CKYCError(
        "Invalid PAN format. PAN must be 10 characters: 5 letters, 4 digits, 1 letter"
      );
    }

    const pidXml = `<PID_DATA>
  <DATE_TIME>${this.now()}</DATE_TIME>
  <ID_TYPE>C</ID_TYPE>
  <ID_NO>${this.escapeXml(sanitizedPan)}</ID_NO>
</PID_DATA>`.trim();

    try {
      return await this.sendSearch(pidXml);
    } catch (error) {
      console.log(error);

      if (error instanceof CKYCError) {
        throw error;
      }
      throw new CKYCError(
        `Failed to search by PAN: ${
          error instanceof Error ? error.message : String(error)
        }`,
        undefined,
        error
      );
    }
  }

  private async sendSearch(pidXml: string): Promise<CKYCResponse> {
    const sessionKey = generateSessionKey();

    const encryptedPID = aesEncrypt(pidXml, sessionKey);
    const encryptedKey = encryptSessionKey(
      sessionKey,
      this.config.cersaiPublicKeyPem
    );

    const requestXml = `
<REQ_ROOT>
  <HEADER>
    <FI_CODE>${this.escapeXml(this.config.fiCode)}</FI_CODE>
    <REQUEST_ID>${this.generateRequestId()}</REQUEST_ID>
    <VERSION>1.3</VERSION>
  </HEADER>
  <CKYC_INQ>
    <PID>${encryptedPID}</PID>
    <SESSION_KEY>${encryptedKey}</SESSION_KEY>
  </CKYC_INQ>
</REQ_ROOT>`.trim();

    const signedXml = signXML(requestXml, this.config.fiPrivateKeyPem);

    try {
      const response = await axios.post(this.searchUrl, signedXml, {
        headers: { "Content-Type": "application/xml" },
        timeout: 30000, // 30 seconds timeout
      });

      return await this.decryptResponse(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data
          ? `API Error: ${JSON.stringify(error.response.data)}`
          : error.message;
        throw new CKYCError(
          `CKYC Search API failed: ${message}`,
          error.response?.status?.toString(),
          error.response?.data
        );
      }
      throw new CKYCError(
        `Failed to send search request: ${
          error instanceof Error ? error.message : String(error)
        }`,
        undefined,
        error
      );
    }
  }

  /* ---------------- DOWNLOAD API ---------------- */

  async triggerDownload(ckycNo: string, mobile: string): Promise<CKYCResponse> {
    if (!ckycNo || ckycNo.trim().length === 0) {
      throw new CKYCError("CKYC number is required");
    }

    if (!mobile || mobile.trim().length === 0) {
      throw new CKYCError("Mobile number is required");
    }

    const sanitizedMobile = mobile.trim().replace(/\D/g, "");
    if (sanitizedMobile.length !== 10) {
      throw new CKYCError("Invalid mobile number. Must be 10 digits");
    }

    const pidXml = `
<PID_DATA>
  <DATE_TIME>${this.now()}</DATE_TIME>
  <CKYC_NO>${this.escapeXml(ckycNo.trim())}</CKYC_NO>
  <AUTH_FACTOR_TYPE>03</AUTH_FACTOR_TYPE>
  <AUTH_FACTOR>${this.escapeXml(sanitizedMobile)}</AUTH_FACTOR>
</PID_DATA>`.trim();

    try {
      return await this.sendDownload(pidXml);
    } catch (error) {
      if (error instanceof CKYCError) {
        throw error;
      }
      throw new CKYCError(
        `Failed to trigger download: ${
          error instanceof Error ? error.message : String(error)
        }`,
        undefined,
        error
      );
    }
  }

  async validateOTP(otp: string): Promise<CKYCResponse> {
    if (!otp || otp.trim().length === 0) {
      throw new CKYCError("OTP is required");
    }

    const pidXml = `
<PID_DATA>
  <DATE_TIME>${this.now()}</DATE_TIME>
  <OTP>${this.escapeXml(otp.trim())}</OTP>
  <VALIDATE>Y</VALIDATE>
</PID_DATA>`.trim();

    try {
      return await this.sendValidateOTP(pidXml);
    } catch (error) {
      if (error instanceof CKYCError) {
        throw error;
      }
      throw new CKYCError(
        `Failed to validate OTP: ${
          error instanceof Error ? error.message : String(error)
        }`,
        undefined,
        error
      );
    }
  }

  private async sendDownload(pidXml: string): Promise<CKYCResponse> {
    return this.sendDownloadInternal(this.downloadUrl, pidXml);
  }

  private async sendValidateOTP(pidXml: string): Promise<CKYCResponse> {
    return this.sendDownloadInternal(this.validateOtpUrl, pidXml);
  }

  private async sendDownloadInternal(
    url: string,
    pidXml: string
  ): Promise<CKYCResponse> {
    const sessionKey = generateSessionKey();

    const encryptedPID = aesEncrypt(pidXml, sessionKey);
    const encryptedKey = encryptSessionKey(
      sessionKey,
      this.config.cersaiPublicKeyPem
    );

    const xml = `
<CKYC_DOWNLOAD_REQUEST>
  <HEADER>
    <FI_CODE>${this.escapeXml(this.config.fiCode)}</FI_CODE>
    <REQUEST_ID>${this.generateRequestId()}</REQUEST_ID>
    <VERSION>1.3</VERSION>
  </HEADER>
  <CKYC_INQ>
    <SESSION_KEY>${encryptedKey}</SESSION_KEY>
    <PID>${encryptedPID}</PID>
  </CKYC_INQ>
</CKYC_DOWNLOAD_REQUEST>`.trim();

    const signed = signXML(xml, this.config.fiPrivateKeyPem);

    try {
      const response = await axios.post(url, signed, {
        headers: { "Content-Type": "application/xml" },
        timeout: 30000, // 30 seconds timeout
      });

      return await this.decryptResponse(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data
          ? `API Error: ${JSON.stringify(error.response.data)}`
          : error.message;
        throw new CKYCError(
          `CKYC Download API failed: ${message}`,
          error.response?.status?.toString(),
          error.response?.data
        );
      }
      throw new CKYCError(
        `Failed to send download request: ${
          error instanceof Error ? error.message : String(error)
        }`,
        undefined,
        error
      );
    }
  }

  /* ---------------- RESPONSE DECRYPT ---------------- */

  private async decryptResponse(xml: string): Promise<CKYCResponse> {
    try {
      const parsed = await parseStringPromise(xml, { explicitArray: false });

      const encKey =
        parsed?.REQ_ROOT?.CKYC_INQ?.SESSION_KEY ||
        parsed?.CKYC_DOWNLOAD_RESPONSE?.CKYC_INQ?.SESSION_KEY;

      if (!encKey) {
        return {
          raw: parsed,
          decryptedPID: null,
        };
      }

      const sessionKey = decryptSessionKey(encKey, this.config.fiPrivateKeyPem);

      const encryptedPID =
        parsed?.REQ_ROOT?.CKYC_INQ?.PID ||
        parsed?.CKYC_DOWNLOAD_RESPONSE?.CKYC_INQ?.PID;

      if (!encryptedPID) {
        return {
          raw: parsed,
          decryptedPID: null,
        };
      }

      const decryptedPID = aesDecrypt(encryptedPID, sessionKey);

      return {
        raw: parsed,
        decryptedPID: await parseStringPromise(decryptedPID, {
          explicitArray: false,
        }),
      };
    } catch (error) {
      throw new CKYCError(
        `Failed to decrypt response: ${
          error instanceof Error ? error.message : String(error)
        }`,
        undefined,
        error
      );
    }
  }

  /* ---------------- UTILITY METHODS ---------------- */

  private now(): string {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    // Format: DD/MM/YYYY HH:MM:SS
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }

  private generateRequestId(): string {
    this.requestCounter = (this.requestCounter + 1) % 10000;
    const timestamp = Date.now();
    const random = randomBytes(4).toString("hex");
    return `${timestamp}-${this.requestCounter}-${random}`;
  }

  private escapeXml(str: string): string {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }
}
