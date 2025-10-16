import z from "zod";
import { kycStatus, UserAccountType } from "../../../../../../../../../packages/schema/lib/customers/customers.schema";
import { AccountStatusEnum, gender } from "../../../../../../../../../packages/schema/lib/enums";

export const customerFormDataSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional().or(z.literal("")),
  lastName: z.string().min(1, "Last name is required"),
  emailId: z.email("Invalid email address").min(1, "Email is required"),
  phoneNo: z
    .string()
    .min(1, "Mobile number is required")
    .regex(/^\+?\d{7,15}$/, "Invalid mobile number format"),
  whatsAppNo: z
    .string()
    .optional()
    .refine((v) => v === undefined || /^\+\d{7,15}$/.test(v), {
      message: "WhatsApp number must include country code (e.g., +1234567890)",
    }),
  userType: z.enum(UserAccountType,{
        error: "User account type is required",

  }),
  // userName: z.string().min(3, "Username must be at least 3 characters"),
  termsAccepted: z
    .boolean()
    .refine((v) => v === true, { message: "You must accept terms" }),
  whatsAppNotificationAllow: z.boolean(),
  isEmailVerified: z.boolean(),
  isPhoneVerified: z.boolean(),
  kycStatus: z.enum(kycStatus),
  status:AccountStatusEnum,
  gender: z.enum(gender,{ error: "Invalid select valid gender type" }),

  relationshipManagerId: z.union([z.string(), z.number()]).optional(),
  // totalInvestment: z.number({ error: "Total investment is required" }).nonnegative("Total investment cannot be negative"),
  password: z
     .string({
       error: "Password is required",
     })
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
     }),
});
