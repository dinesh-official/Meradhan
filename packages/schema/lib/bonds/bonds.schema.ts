import z from "zod";

export const maturityYearEnums = [
  "0-2",
  "2-5",
  "5-10",
  "10-20",
  "20+",
] as const;
export const couponPercentEnums = ["4-7", "8-10", "10+"] as const;
export const taxationEnums = [
  "TAX_FREE",
  "TAXABLE",
  "TAX_SAVING",
  "TAX_EXEMPTION",
  "UNKNOWN",
] as const;
export const INTEREST_MODE_VALUES = [
  "MONTHLY",
  "QUARTERLY",
  "HALF_YEARLY",
  "YEARLY",
  "ON_MATURITY",
  "UNKNOWN",
] as const;

export const bondsFilterSchema = z
  .object({
    search: z.string().optional(),
    q: z.string().optional(),
    maturity: z.array(z.enum(maturityYearEnums)).optional(),
    rating: z.array(z.string()).optional(),
    coupon: z.array(z.enum(couponPercentEnums)).optional(),
    taxation: z.array(z.enum(taxationEnums)).optional(),
    interest: z.array(z.enum(INTEREST_MODE_VALUES)).optional(),
    allowForPurchase: z.boolean().optional(),
  })
  .optional();

// Bond Create/Update Schema
export const TAX_TYPE_ENUM = z.enum([
  "TAX_FREE",
  "TAXABLE",
  "TAX_SAVING",
  "TAX_EXEMPTION",
  "UNKNOWN",
]);

export const IS_LISTED_ENUM = z.enum(["YES", "NO", "UNKNOWN"]);

export const INTEREST_MODE_ENUM = z.enum([
  "MONTHLY",
  "QUARTERLY",
  "HALF_YEARLY",
  "YEARLY",
  "ON_MATURITY",
  "UNKNOWN",
]);

export const bondCreateUpdateSchema = z.object({
  isin: z.string().trim().min(1, "ISIN is required"),
  bondName: z.string().trim().min(1, "Bond name is required"),
  instrumentName: z.string().trim().min(1, "Instrument name is required"),
  description: z.string().trim().min(1, "Description is required"),
  issuePrice: z.number().nonnegative("Issue price must be non-negative"),
  faceValue: z.number().positive("Face value must be positive"),
  stampDutyPercentage: z
    .number()
    .nonnegative("Stamp duty percentage must be non-negative")
    .default(0)
    .optional()
    .nullable(),
  allowForPurchase: z.boolean().default(false).optional().nullable(),
  couponRate: z.number().nonnegative("Coupon rate must be non-negative"),
  interestPaymentFrequency: z
    .string()
    .trim()
    .min(1, "Interest payment frequency is required"),
  putCallOptionDetails: z.string().trim().optional().nullable(),
  certificateNumbers: z.string().trim().optional().nullable(),
  totalIssueSize: z.number().nonnegative().optional().nullable(),
  registrarDetails: z.string().trim().optional().nullable(),
  physicalSecurityAddress: z.string().trim().optional().nullable(),
  defaultedInRedemption: z.string().trim().optional().nullable(),
  debentureTrustee: z.string().trim().optional().nullable(),
  creditRatingInfo: z.string().trim().optional().nullable(),
  remarks: z.string().trim().optional().nullable(),
  taxStatus: TAX_TYPE_ENUM,
  creditRating: z.string().trim().default("UnRated"),
  interestPaymentMode: INTEREST_MODE_ENUM.default("UNKNOWN"),
  isListed: IS_LISTED_ENUM.default("UNKNOWN"),
  ratingAgencyName: z.string().trim().optional().nullable(),
  ratingDate: z.coerce.date().optional().nullable(),
  categories: z.array(z.string().trim()).default([]),
  sectorName: z.string().trim().optional().nullable(),
  dateOfAllotment: z.coerce.date().optional().nullable(),
  redemptionDate: z.coerce.date().optional().nullable(),
  maturityDate: z.coerce.date().optional().nullable(),
  sortedAt: z.number().int().default(0).optional(),
  isConvertedDeal: z.boolean().optional().nullable(),
  // Additional fields for bond details
  yield: z.number().nonnegative().optional().nullable(),
  lastTradePrice: z.number().nonnegative().optional().nullable(),
  lastTradeYield: z.number().nonnegative().optional().nullable(),
  nextCouponDate: z.coerce.date().optional().nullable(),
  modeOfIssuance: z.string().trim().optional().nullable(),
  couponType: z.string().trim().optional().nullable(),
  buyYield: z.number().nonnegative().optional().nullable(),
  providerName: z.string().trim().optional().nullable(),
  providerInterestDate: z.coerce.date().optional().nullable(),
  providerQuantity: z.number().int().nonnegative().optional().nullable(),
  isOngoingDeal: z.boolean().default(false).optional().nullable(),
  providerPrice: z.number().nonnegative().optional().nullable(),
  ignoreAutoUpdate: z.boolean().default(false).optional().nullable(),
});
