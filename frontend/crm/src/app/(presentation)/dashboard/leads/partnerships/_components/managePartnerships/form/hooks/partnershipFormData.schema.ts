import { appSchema } from "@root/schema";
import { z } from "zod";

export const partnershipFormDataSchema = z.object({
  organizationName: z
    .string({ message: "Organization name is required" })
    .min(1, { message: "Organization name is required" })
    .max(200, { message: "Organization name is too long" }),
  organizationType: z
    .string({ message: "Organization type is required" })
    .min(1, { message: "Organization type is required" }),
  city: z
    .string({ message: "City is required" })
    .min(1, { message: "City is required" }),
  state: z
    .string({ message: "State is required" })
    .min(1, { message: "State is required" }),
  website: z
    .string()
    .url({ message: "Invalid URL" })
    .optional()
    .or(z.literal("")),
  fullName: z
    .string({ message: "Full name is required" })
    .min(2, { message: "Full name must be at least 2 characters" })
    .max(100, { message: "Full name is too long" }),
  designation: z
    .string({ message: "Designation is required" })
    .min(1, { message: "Designation is required" }),
  emailAddress: z
    .string({ message: "Email is required" })
    .email({ message: "Enter a valid email address" }),
  mobileNumber: z
    .string({ message: "Mobile number is required" })
    .min(10, { message: "Mobile number must have at least 10 digits" })
    .regex(/^[0-9()+-\s]*$/, {
      message: "Mobile number must contain only numbers and + - ( ) spaces",
    }),
  partnershipModel: z.enum(appSchema.crm.partnership.partnershipModels, {
    message: "Partnership model is required",
  }),
  clientBase: z.string().optional(),
  message: z.string().optional(),
  status: z.enum(appSchema.crm.partnership.partnershipStatus, {
    message: "Status is required",
  }),
  assignTo: z.number().int().optional(),
});

export type PartnershipFormData = z.infer<typeof partnershipFormDataSchema>;
