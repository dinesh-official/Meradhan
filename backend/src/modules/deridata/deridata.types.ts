import { z } from "zod";

export function assertDeridataIsin(isin: string): string {
  const normalized = (isin ?? "").trim().toUpperCase();
  if (normalized.length < 8 || normalized.length > 14) {
    throw new Error(`Invalid Deridata ISIN: ${JSON.stringify(isin)}`);
  }
  return normalized;
}

// Lenient leaf helpers — Deridata uses null / "N/A" / "NA" / "-" / "" / [] conventions (Annexure B).
const str = z.string().nullish();
const num = z.union([z.number(), z.string()]).nullish();
const arr = <T extends z.ZodTypeAny>(t: T) => z.array(t).nullish();

export const DeridataErrorSchema = z.object({ error: z.string() });

// 1. Issue Detail — passthrough so unspecified fields survive into `raw`.
export const IssueDetailSchema = z
  .object({
    isin: str,
    did: str,
    coupon: str,
    coupon_fixed: num,
    coupon_type: str,
    coupon_frequency: str,
    maturity: str,
    issue_date: str,
    allotment_date: str,
    face_value: num,
    record_date: num,
    coupon_date: str,
    issuer_name: str,
    description: str,
    issuer_industry: str,
    seniority: str,
    security: str,
    listed: str,
    tax_free: str,
    current_rating: arr(z.string()),
    rating_agency: arr(z.string()),
    outlook: arr(z.unknown()),
    instrument_type: arr(z.string()),
    tags: arr(z.string()),
    redemption_type: str,
    redemption_premium: str,
    redemption: arr(z.unknown()),
    total_issue_size_cr: num,
    financial_covenants: z.record(z.string(), z.unknown()).nullish(),
  })
  .passthrough();

// Issue Detail envelope — the live API wraps the bond fields under `data[0]`
// (with sibling `multiple_*` arrays). Older/flat responses are handled as-is.
export const IssueDetailEnvelopeSchema = z
  .object({ data: z.array(z.record(z.string(), z.unknown())).nullish() })
  .passthrough();

// 2. Calculator
export const CalculatorResponseSchema = z
  .object({
    summary: z
      .object({
        clean_price: num,
        accrued_int_top: num,
        dirty_price: num,
        principal: str,
        accrued_int_bottom: str,
        total_consideration: str,
        xirr: num,
        cashflow_shut_flag: z.boolean().nullish(),
        shut_period_message: str,
        record_date: str,
      })
      .passthrough()
      .nullish(),
    cashflows: arr(
      z
        .object({
          cash_flow_dates: str,
          coupon_cash_flow: str,
          principal_cash_flow: str,
          total_cash_flow: str,
        })
        .passthrough(),
    ),
  })
  .passthrough();

// 3. EBP
export const EbpResponseSchema = z
  .object({ isin: str, ebp_items: arr(z.record(z.string(), z.unknown())) })
  .passthrough();

// 4. Secondary Trades
export const SecondaryTradesResponseSchema = z
  .object({
    isin: str,
    trades: arr(z.record(z.string(), z.unknown())),
    trade_history: arr(z.record(z.string(), z.unknown())),
  })
  .passthrough();

// 5. Security & Covenant
export const SecurityCovenantSchema = z
  .object({
    isin: str,
    step_up_condition: str,
    step_down_condition: str,
    security_cover: str,
    nature_of_security: str,
    credit_enhancement: str,
    guarantee: str,
    guarantor: str,
    percentage_of_guarantee: str,
    financial_covenants: z.record(z.string(), z.unknown()).nullish(),
  })
  .passthrough();

// 6. Documents
export const DocumentsResponseSchema = z
  .object({
    isin: str,
    im_link: str,
    press_release_links: arr(
      z.object({ agency: str, rating: str, outlook: str, url: str }).passthrough(),
    ),
  })
  .passthrough();

export type DeridataErrorCode =
  | "INVALID_CHECKSUM"
  | "INVALID_MERCHANT"
  | "LIMIT_EXPIRED"
  | "NOT_FOUND"
  | "BAD_REQUEST"
  | "SERVER_ERROR"
  | "UNKNOWN";

export type DeridataResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code: DeridataErrorCode };

export function classifyError(status: number, body: unknown): DeridataErrorCode {
  const msg =
    body && typeof body === "object" && "error" in body
      ? String((body as { error: unknown }).error).toLowerCase()
      : "";
  if (status === 403 || msg.includes("limit")) return "LIMIT_EXPIRED";
  if (status === 404 || msg.includes("no record")) return "NOT_FOUND";
  if (status === 401 && msg.includes("merchant")) return "INVALID_MERCHANT";
  if (status === 401 || msg.includes("checksum")) return "INVALID_CHECKSUM";
  if (status === 400) return "BAD_REQUEST";
  if (status >= 500) return "SERVER_ERROR";
  return "UNKNOWN";
}

/**
 * Parse an endpoint body. If it matches the error shape, return ok:false with a code
 * classified from the HTTP status + message; otherwise validate against `schema`.
 */
export function parseEndpointResponse<T>(
  schema: z.ZodType<T>,
  data: unknown,
  status = 200,
): DeridataResult<T> {
  const asError = DeridataErrorSchema.safeParse(data);
  if (asError.success) {
    return { ok: false, error: asError.data.error, code: classifyError(status, data) };
  }
  const parsed = schema.safeParse(data);
  if (parsed.success) return { ok: true, data: parsed.data };
  return { ok: false, error: parsed.error.message, code: "UNKNOWN" };
}
