import { z } from "zod";

export const TAX_TYPE = z.enum([
  "YES",
  "NO",
  "TAX_SAVING",
  "TAX_EXEMPTION",
  "UNKNOWN",
]);
export const IS_LISTED = z.enum(["YES", "NO", "UNKNOWN"]);
export const INTEREST_MODE = z.enum([
  "MONTHLY",
  "QUARTERLY",
  "HALF_YEARLY",
  "YEARLY",
  "ON_MATURITY",
  "UNKNOWN",
]);

export const bondSchema = z.object({
  isin: z.string().trim().min(1, "ISIN is required"),
  bondName: z.string().trim().min(1, "Bond name is required"),
  instrumentName: z.string().trim().min(1, "Instrument name is required"),
  description: z.string().trim().min(1, "Description is required"),

  issuePrice: z.number().nonnegative(),
  faceValue: z.number().nonnegative(),

  couponRate: z.number().nonnegative(),
  interestPaymentFrequency: z.string().trim().min(1, "Frequency is required"),

  putCallOptionDetails: z.string().trim().optional(),
  certificateNumbers: z.string().trim().optional(),
  totalIssueSize: z.number().nonnegative().default(0).optional(),
  registrarDetails: z.string().trim().optional(),

  physicalSecurityAddress: z.string().trim().optional(),
  defaultedInRedemption: z.string().trim().optional(),
  debentureTrustee: z.string().trim().optional(),
  creditRatingInfo: z.string().trim().optional(),
  remarks: z.string().trim().optional(),

  taxStatus: TAX_TYPE,
  creditRating: z.string().trim().default("UnRated"),
  interestPaymentMode: INTEREST_MODE.default("UNKNOWN"),
  isListed: IS_LISTED.default("UNKNOWN"),

  ratingAgencyName: z.string().trim().optional(),
  ratingDate: z.coerce.date().optional(),

  categories: z.array(z.string().trim()).default([]),
  sectorName: z.string().trim().optional(),

  dateOfAllotment: z.coerce.date().optional(),
  redemptionDate: z.coerce.date().optional(),
  maturityDate: z.coerce.date().optional(),
});

export type BondSchemaType = z.infer<typeof bondSchema>;
