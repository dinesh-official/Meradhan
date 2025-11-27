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
    all: z.any().optional(),
  })
  .optional();
