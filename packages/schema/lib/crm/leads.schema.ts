import { z } from "zod";

// Lead enums
export const source = [
  "WEBSITE",
  "REFERRAL",
  "SOCIAL",
  "ADVERTISEMENT",
  "EVENT",
  "COLD_CALL",
  "EMAIL",
  "OTHER",
] as const;
export const LeadSource = z.enum(source);
export const status = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "UNQUALIFIED",
  "CONVERTED",
] as const;
export const bonds = [
  "GOVERNMENT",
  "CORPORATE",
  "TAX_FREE",
  "SOVEREIGN_GOLD_BOND",
  "PSU",
  "OTHER",
] as const;

export const findManyLeadsSchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/, { message: "Page must be a numeric string" })
    .default("1")
    .optional(),
  search: z.string().optional(),
  status: z.enum(status).optional(),
  source: LeadSource.optional(),
});

// Main Lead schema
export const createNewLeadSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  emailAddress: z.string("Invalid email address").optional(),
  phoneNo: z.string().min(10, "Phone number must have at least 10 digits"),
  companyName: z.string().optional(),
  leadSource: LeadSource,
  bondType: z.enum(bonds),
  status: z.enum(status),
  exInvestmentAmount: z.number().optional(),
  assignTo: z.number().int().optional(),
  note: z.string().optional(),
});

export const updateLeadSchema = createNewLeadSchema.partial();

export const createNewLeadFollowUpNoteSchema = z.object({
  text: z.string().min(1, "Note text is required"),
  nextDate: z.coerce.date().optional(), // accepts string or Date
});

export const updateLeadFollowUpNoteSchema =
  createNewLeadFollowUpNoteSchema.partial();
