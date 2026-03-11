import z from "zod";
import { kycStatus, UserAccountType } from "../../../../../../../../../../packages/schema/lib/customers/customers.schema";
import {
  AccountStatusEnum,
  gender as GenderEnum, // assuming this is a readonly tuple of strings
} from "../../../../../../../../../../packages/schema/lib/enums";

// Make the union list readonly for z.enum
export const CustomerUserType = [
  "INDIVIDUAL",
  "INDIVIDUAL_NRI_NRO",
  "TRUST",
  "CORPORATE",
  "HUF",
  "LLP",
  "PARTNERSHIP_FIRM",
] as const;

export const customerFormDataSchema = z.object({
  firstName: z.string().min(1, "First name is required"),

  // allow string | null | undefined (optional)
  middleName: z.union([z.string(), z.null()]).optional(),

  lastName: z.string().min(1, "Last name is required"),

  // ✅ correct email usage
  emailId: z.email("Invalid email address"),

  phoneNo: z
    .string()
    .min(1, "Mobile number is required")
    .regex(/^\+?\d{7,15}$/, "Invalid mobile number format"),

  // null or "+<country><number>"
  whatsAppNo: z.string({
    message: "WhatsApp number must be a valid number",
  }),

  // use the same enum source everywhere
  userType: z.enum(UserAccountType),

  userName: z.string().optional(),

  legalEntityName: z.string().optional(),

  termsAccepted: z
    .boolean()
    .refine((v) => v === true, { message: "You must accept terms" }),

  whatsAppNotificationAllow: z.boolean(),
  isEmailVerified: z.boolean(),
  isPhoneVerified: z.boolean(),

  // if your imported kycStatus is a readonly tuple, this is fine.
  // If it's a Zod enum already, use it directly; if it's a runtime enum, use z.nativeEnum(...)
  kycStatus: z.enum(kycStatus),

  // assuming AccountStatusEnum is a Zod enum schema
  status: AccountStatusEnum,

  // required only for INDIVIDUAL / INDIVIDUAL_NRI_NRO; not shown for non-individual
  gender: z.enum(GenderEnum).optional(),

  relationshipManagerId: z.number().optional(),

  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter",
    })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter",
    })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
    .regex(/[^A-Za-z0-9]/, {
      message: "Password must contain at least one special character",
    })
    .optional(),
})
  .refine(
    (data) => {
      const nonIndividual = ["TRUST", "CORPORATE", "HUF", "LLP", "PARTNERSHIP_FIRM"] as const;
      if (nonIndividual.includes(data.userType)) {
        return typeof data.legalEntityName === "string" && data.legalEntityName.trim().length > 0;
      }
      return true;
    },
    { message: "Legal entity name is required for Trust, Corporate, HUF, LLP, or Partnership Firm", path: ["legalEntityName"] }
  )
  .refine(
    (data) => {
      const individualTypes = ["INDIVIDUAL", "INDIVIDUAL_NRI_NRO"] as const;
      if (individualTypes.includes(data.userType)) {
        return data.gender != null && data.gender !== "";
      }
      return true;
    },
    { message: "Gender is required for Individual / NRI-NRO", path: ["gender"] }
  );

// Handy TypeScript type
