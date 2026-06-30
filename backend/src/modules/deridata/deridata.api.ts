import axios, { type AxiosInstance, isAxiosError } from "axios";
import { z } from "zod";
import { env } from "@packages/config/src/env";
import { buildAuthFields } from "./deridata.checksum";
import {
  assertDeridataIsin,
  classifyError,
  parseEndpointResponse,
  IssueDetailSchema,
  CalculatorResponseSchema,
  EbpResponseSchema,
  SecondaryTradesResponseSchema,
  SecurityCovenantSchema,
  DocumentsResponseSchema,
  type DeridataResult,
} from "./deridata.types";

export type DeridataApiConfig = {
  merchantId: number | string;
  secretKey: string;
  merchantName: string;
  merchantEmail: string;
  publicIp: string;
  /** Base URL without trailing slash, e.g. `https://www.deridata.com`. */
  baseUrl?: string;
  timeoutMs?: number;
};

export type CalculatorInput = {
  isin: string;
  value_date: string;
  amount: number;
  yield_to_price: boolean;
  selected_yield: "ytm" | "ytc" | "ytp";
  ytm?: number | null;
  ytc?: number | null;
  ytp?: number | null;
  clean_price?: number | null;
  cashflow_shut_flag: boolean;
  type_field?: "cashflow";
};

export type IssueDetail = z.infer<typeof IssueDetailSchema>;
export type CalculatorResponse = z.infer<typeof CalculatorResponseSchema>;
export type EbpResponse = z.infer<typeof EbpResponseSchema>;
export type SecondaryTradesResponse = z.infer<typeof SecondaryTradesResponseSchema>;
export type SecurityCovenant = z.infer<typeof SecurityCovenantSchema>;
export type DocumentsResponse = z.infer<typeof DocumentsResponseSchema>;

const DEFAULT_BASE_URL = "https://www.deridata.com";

const PATHS = {
  issueDetail: "/api/public/merchant/v1/issue-detail/",
  calculator: "/api/public/merchant/v1/calculator/",
  ebp: "/api/public/merchant/v1/ebp/",
  secondaryTrades: "/api/public/merchant/v1/secondary-trades/",
  securityCovenant: "/api/public/merchant/v1/security-covenant/",
  documents: "/api/public/merchant/v1/documents/",
} as const;

/**
 * HTTP client for the Deridata merchant API. Every request is signed with an
 * HMAC-SHA256 checksum (server-side only) and resolves 4xx bodies instead of throwing.
 *
 * @see docs/superpowers/specs/2026-06-29-deridata-integration-design.md
 */
export class DeridataApi {
  private client: AxiosInstance;
  private readonly cfg: DeridataApiConfig;

  constructor(config: DeridataApiConfig) {
    this.cfg = config;
    const baseURL = (config.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
    this.client = axios.create({
      baseURL,
      timeout: config.timeoutMs ?? 30_000,
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      validateStatus: (status) => status >= 200 && status < 500,
    });
  }

  private auth() {
    return buildAuthFields({
      merchantId: this.cfg.merchantId,
      merchantName: this.cfg.merchantName,
      merchantEmail: this.cfg.merchantEmail,
      publicIp: this.cfg.publicIp,
      secretKey: this.cfg.secretKey,
    });
  }

  private async post<T>(
    path: string,
    schema: z.ZodType<T>,
    payload: Record<string, unknown>,
  ): Promise<DeridataResult<T>> {
    const body = { ...this.auth(), ...payload };
    try {
      const res = await this.client.post<unknown>(path, body);
      return parseEndpointResponse(schema, res.data, res.status);
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        return {
          ok: false,
          error:
            (err.response.data as { error?: string } | undefined)?.error ??
            `HTTP ${err.response.status}`,
          code: classifyError(err.response.status, err.response.data),
        };
      }
      throw err;
    }
  }

  getIssueDetail(isin: string) {
    return this.post(PATHS.issueDetail, IssueDetailSchema, { isin: assertDeridataIsin(isin) });
  }

  calculate(input: CalculatorInput) {
    return this.post(PATHS.calculator, CalculatorResponseSchema, {
      ...input,
      isin: assertDeridataIsin(input.isin),
      type_field: input.type_field ?? "cashflow",
    });
  }

  getEbp(isin: string) {
    return this.post(PATHS.ebp, EbpResponseSchema, { isin: assertDeridataIsin(isin) });
  }

  getSecondaryTrades(isin: string) {
    return this.post(PATHS.secondaryTrades, SecondaryTradesResponseSchema, {
      isin: assertDeridataIsin(isin),
    });
  }

  getSecurityCovenant(isin: string) {
    return this.post(PATHS.securityCovenant, SecurityCovenantSchema, {
      isin: assertDeridataIsin(isin),
    });
  }

  getDocuments(isin: string) {
    return this.post(PATHS.documents, DocumentsResponseSchema, { isin: assertDeridataIsin(isin) });
  }
}

/** Build a client from env. Throws if required Deridata merchant config is missing. */
export function deridataApiFromEnv(): DeridataApi {
  const {
    DERIDATA_MERCHANT_ID,
    DERIDATA_SECRET_KEY,
    DERIDATA_MERCHANT_NAME,
    DERIDATA_MERCHANT_EMAIL,
    DERIDATA_PUBLIC_IP,
    DERIDATA_BASE_URL,
  } = env;
  if (
    !DERIDATA_MERCHANT_ID ||
    !DERIDATA_SECRET_KEY ||
    !DERIDATA_MERCHANT_NAME ||
    !DERIDATA_MERCHANT_EMAIL ||
    !DERIDATA_PUBLIC_IP
  ) {
    throw new Error(
      "Deridata is not configured; set DERIDATA_MERCHANT_ID/SECRET_KEY/MERCHANT_NAME/MERCHANT_EMAIL/PUBLIC_IP",
    );
  }
  return new DeridataApi({
    merchantId: DERIDATA_MERCHANT_ID,
    secretKey: DERIDATA_SECRET_KEY,
    merchantName: DERIDATA_MERCHANT_NAME,
    merchantEmail: DERIDATA_MERCHANT_EMAIL,
    publicIp: DERIDATA_PUBLIC_IP,
    baseUrl: DERIDATA_BASE_URL,
  });
}
