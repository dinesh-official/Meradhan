import z from "zod";

export const STATUS = [
  "New",
  "Contacted",
  "Qualified",
  "Unqualified",
  "Converted",
] as const;
export const LEAD_SOURCES = [
  "Website",
  "Referral",
  "Social",
  "Advertisement",
  "Event",
  "Cold Call",
  "Email",
  "Other",
] as const;
export const BOND_TYPES = [
  "Government",
  "Corporate",
  "Tax-Free",
  "Sovereign Gold Bond",
  "PSU",
  "Other",
] as const;

export const leadFormDataSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .max(120, "Full name is too long"),
  emailId: z.email("Invalid email address").min(1, "Email is required"),

  phoneNumber: z
    .string()
    .trim()
    .refine(
      (v) => !v || /^\+?\d{7,15}$/.test(v),
      "Invalid phone number format"
    ),
  company: z.string().trim().max(120, "Company name is too long").optional(),
  leadSource: z.enum(LEAD_SOURCES),
  status: z.enum(STATUS),
  assignTo: z.number("Please assign to member").optional(),
  bondTypeInterest: z.enum(BOND_TYPES).optional(),

  expectedInvestmentAmount: z
    .preprocess(
      (v) => (typeof v === "string" ? Number(v.replace(/,/g, "")) : v),
      z.number().min(0, { message: "Amount cannot be negative" })
    )
    .optional(),
  notes: z
    .string()
    .trim()
    .max(1000, "Notes must be under 1000 characters")
    .optional(),
});

