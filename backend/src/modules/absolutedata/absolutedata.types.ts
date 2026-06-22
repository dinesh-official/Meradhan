import { z } from "zod";

/** API error payload (`NOT_FOUND`, validation, etc.) */
export const absoluteDataApiErrorSchema = z.object({
  type: z.string(),
  code: z.string(),
  message: z.string(),
  request_id: z.string().optional(),
});

export type AbsoluteDataApiError = z.infer<typeof absoluteDataApiErrorSchema>;

export const absoluteDataErrorEnvelopeSchema = z.object({
  error: absoluteDataApiErrorSchema,
});

export type AbsoluteDataErrorEnvelope = z.infer<
  typeof absoluteDataErrorEnvelopeSchema
>;

export const absoluteDataPaginationSchema = z.object({
  page: z.number(),
  page_size: z.number(),
  total_records: z.number(),
  total_pages: z.number(),
  has_next: z.boolean(),
  next_cursor: z.string().nullable(),
});

export type AbsoluteDataPagination = z.infer<
  typeof absoluteDataPaginationSchema
>;

const nullableString = z.string().nullable();
const nullableNumber = z.number().nullable();

export const absoluteDataCouponPaymentRowSchema = z.object({
  sequence: z.number(),
  payment_date: nullableString,
  record_date: nullableString,
  record_days: nullableNumber,
});

export type AbsoluteDataCouponPaymentRow = z.infer<typeof absoluteDataCouponPaymentRowSchema>;

export const absoluteDataRedemptionScheduleRowSchema = z.object({
  sequence: z.number(),
  type: nullableString,
  start_date: nullableString,
  end_date: nullableString,
  price: nullableNumber,
  amount: nullableNumber,
  option_type: nullableString,
  option_frequency: nullableString,
});

export type AbsoluteDataRedemptionScheduleRow = z.infer<typeof absoluteDataRedemptionScheduleRowSchema>;

export const absoluteDataInstrumentIdentifiersSchema = z.object({
  isin: z.string(),
  figi: nullableString,
  ad_instrument_id: z.number(),
  cusip: nullableString,
  isin_regs: z.unknown().nullable(),
  isin_144a: nullableString,
  cusip_regs: nullableString,
  cusip_144a: nullableString,
});

export const absoluteDataIssuerDomicileSchema = z.object({
  country_of_incorporation: z.string(),
  issuer_region: z.string(),
});

export const absoluteDataIssuerClassificationSchema = z.object({
  sector: z.string(),
  bank_issuer_flag: z.boolean(),
  non_profit_indicator: z.boolean(),
  exchange_name: nullableString,
});

export const absoluteDataCorporateHierarchySchema = z.object({
  parent_name: nullableString,
});

export const absoluteDataIssuerSchema = z.object({
  issuer_name: z.string(),
  issuer_short_name: z.string(),
  bond_category: z.string(),
  organization_status: z.string(),
  issuer_incorporation_year: z.number(),
  domicile: absoluteDataIssuerDomicileSchema,
  classification: absoluteDataIssuerClassificationSchema,
  corporate_hierarchy: absoluteDataCorporateHierarchySchema,
});

export const absoluteDataTermsAndConditionsSchema = z.object({
  announcement_date: nullableString,
  issue_date: nullableString,
  maturity_date: nullableString,
  is_perpetual: z.boolean(),
  issue_currency: z.string(),
  amount_issued: z.number(),
  issue_price: z.number(),
  seniority: nullableString,
  bond_type: nullableString,
  instrument_nature: nullableString,
  bond_description: nullableString,
  class: nullableString,
  business_day_convention: nullableString,
  day_count: nullableString,
  mode_of_issuance: nullableString,
  tax_status: nullableString,
});

export const absoluteDataListingAndTradingSchema = z.object({
  is_listed: z.boolean(),
});

export const absoluteDataCouponSchema = z.object({
  coupon_type: nullableString,
  issuance_coupon: nullableNumber,
  interest_payment_frequency: nullableString,
  interest_accrual_date: nullableString,
  first_coupon_date: nullableString,
  penultimate_date: nullableString,
  previous_coupon_date: nullableString,
  next_coupon_date: nullableString,
  last_coupon_date: nullableString,
  payment_schedule: z.array(absoluteDataCouponPaymentRowSchema).optional().default([]),
});

export const absoluteDataRedemptionFeaturesSchema = z.object({
  call: z.object({ call_indicator: z.boolean() }),
  put: z.object({ put_indicator: z.boolean() }),
  schedule: z.array(absoluteDataRedemptionScheduleRowSchema).optional().default([]),
});

export const absoluteDataFigiBlockSchema = z.object({
  bloomberg_composite_global_id: nullableString,
  bloomberg_exchange_code: nullableString,
  bloomberg_security_type: nullableString,
  bloomberg_security_type_2: nullableString,
  market_sector: nullableString,
  security_description: nullableString,
  bloomberg_ticker: nullableString,
  unique_bloomberg_id: nullableString,
  bloomberg_name: nullableString,
});

export const absoluteDataThirdPartyIdentifiersSchema = z.object({
  figi: absoluteDataFigiBlockSchema,
});

/**
 * One bond record from `GET /v1/bonds/isin/{isin}`.
 * `.passthrough()` so new API fields do not break parsing.
 */
export const absoluteDataBondItemSchema = z
  .object({
    instrument_identifiers: absoluteDataInstrumentIdentifiersSchema,
    issuer: absoluteDataIssuerSchema,
    terms_and_conditions: absoluteDataTermsAndConditionsSchema,
    listing_and_trading: absoluteDataListingAndTradingSchema,
    coupon: absoluteDataCouponSchema,
    redemption_features: absoluteDataRedemptionFeaturesSchema,
    third_party_identifiers: absoluteDataThirdPartyIdentifiersSchema,
    updated_date: z.string(),
  })
  .passthrough();

export type AbsoluteDataBondItem = z.infer<typeof absoluteDataBondItemSchema>;

export const absoluteDataBondsByIsinSuccessSchema = z.object({
  pagination: absoluteDataPaginationSchema,
  items: z.array(absoluteDataBondItemSchema),
});

export type AbsoluteDataBondsByIsinSuccess = z.infer<
  typeof absoluteDataBondsByIsinSuccessSchema
>;

export type AbsoluteDataGetBondByIsinResult =
  | { ok: true; data: AbsoluteDataBondsByIsinSuccess }
  | { ok: false; error: AbsoluteDataApiError };

/**
 * Parse JSON body from `GET /v1/bonds/isin/{isin}` (2xx) or documented error JSON (e.g. 404).
 */
export function parseAbsoluteDataGetBondByIsinResponse(
  json: unknown,
): AbsoluteDataGetBondByIsinResult {
  const asError = absoluteDataErrorEnvelopeSchema.safeParse(json);
  if (asError.success) {
    return { ok: false, error: asError.data.error };
  }

  const asSuccess = absoluteDataBondsByIsinSuccessSchema.safeParse(json);
  if (asSuccess.success) {
    return { ok: true, data: asSuccess.data };
  }

  return {
    ok: false,
    error: {
      type: "InvalidResponse",
      code: "INVALID_RESPONSE",
      message: asSuccess.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; "),
    },
  };
}

const isinLike = /^[A-Z]{2}[A-Z0-9]{9}[0-9]$/i;

export function assertAbsoluteDataIsin(isin: string): string {
  const trimmed = isin.trim().toUpperCase();
  if (!isinLike.test(trimmed)) {
    throw new Error(
      `Invalid ISIN format: expected 12-character ISIN, got "${isin}"`,
    );
  }
  return trimmed;
}
