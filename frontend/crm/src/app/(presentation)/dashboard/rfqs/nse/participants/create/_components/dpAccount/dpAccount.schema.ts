import z from "zod";

export const DP_TYPE = ["NSDL", "CDSL", "Other"] as const;
export const BENEFICIARY = [
  "Self",
  "Joint Holder",
  "Nominee",
  "Guardian",
  "Other",
] as const;
export const DEFAULT_ACCOUNT = ["Yes", "No"] as const;

export const dpAccountSchema = z.object({
  id: z.string(),
  dptype: z.enum(DP_TYPE),
  dpid: z.string().min(1, "DP ID is required").max(16, "DP ID is too long"), // adjust to your format if needed
  beneficiaryid: z.enum(BENEFICIARY),
  isdefaultaccount: z.enum(DEFAULT_ACCOUNT),
});

export const dpAccountsSchema = z
  .array(dpAccountSchema)
  .min(1, "Add at least one DP account")
  .refine(
    (arr) => arr.filter((a) => a.isdefaultaccount === "Yes").length === 1,
    "Exactly one DP account must be marked as default"
  );
