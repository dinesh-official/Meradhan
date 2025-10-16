import z from "zod";
import {
  bonds,
  source,
  status,
} from "../../../../../../../../../packages/schema/lib/crm/leads.schema";

export const leadFormDataSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .max(120, "Full name is too long"),
  emailAddress: z.email("Invalid email address").min(1, "Email is required"),

  phoneNo: z
    .string()
    .trim()
    .refine(
      (v) => !v || /^\+?\d{7,15}$/.test(v),
      "Invalid phone number format"
    ),
  companyName: z
    .string()
    .trim()
    .max(120, "Company name is too long")
    .optional(),
  leadSource: z.enum(source),
  status: z.enum(status),
  assignTo: z.number("Please assign to member").optional(),
  bondType: z.enum(bonds).optional(),

  exInvestmentAmount: z
    .preprocess(
      (v) => (typeof v === "string" ? Number(v.replace(/,/g, "")) : v),
      z.number().min(0, { message: "Amount cannot be negative" })
    )
    .optional(),
  note: z
    .string()
    .trim()
    .max(1000, "Notes must be under 1000 characters")
    .optional(),
});
