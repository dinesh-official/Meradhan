import z from "zod";

export const Default_Account = ["Yes", "No"] as const;

export const bankAccountSchema = z.object({
  id: z.string(),
  bankname: z.string().min(1, "Bank name is required"),
  ifsccode: z.string().min(1, "IFSC is required"),
  accountnumber: z.string().min(1, "Account number is required"),
  isdefaultaccount: z.enum(Default_Account),
});

export const bankAccountsSchema = z.array(bankAccountSchema)
  .min(1, "Add at least one bank account")
  .refine(
    (arr) => arr.filter((a) => a.isdefaultaccount === "Yes").length === 1,
    "Exactly one account must be marked as default"
  );

