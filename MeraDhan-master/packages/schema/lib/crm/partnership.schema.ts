import { z } from "zod";

// Partnership Status enum
export const partnershipStatus = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "UNQUALIFIED",
  "CONVERTED",
  "REJECTED",
] as const;

export const PartnershipStatus = z.enum(partnershipStatus);

// Partnership Model enum
export const partnershipModels = [
  "distribution",
  "api",
  "white-label",
  "institutional",
] as const;

export const PartnershipModel = z.enum(partnershipModels);

// Find many partnerships schema (for filtering)
export const findManyPartnershipsSchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/, { message: "Page must be a numeric string" })
    .default("1")
    .optional(),
  search: z.string().optional(),
  status: PartnershipStatus.optional(),
  partnershipModel: PartnershipModel.optional(),
  organizationType: z.string().optional(),
});

// Create partnership submission schema
export const createPartnershipSchema = z.object({
  organizationName: z.string().min(1, "Organization name is required"),
  organizationType: z.string().min(1, "Organization type is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  website: z.string().url().optional().or(z.literal("")),
  fullName: z.string().min(1, "Full name is required"),
  designation: z.string().min(1, "Designation is required"),
  emailAddress: z.string().email("Invalid email address"),
  mobileNumber: z
    .string()
    .min(10, "Mobile number must have at least 10 digits")
    .regex(/^[0-9()+-\s]*$/, {
      message: "Mobile number must contain only numbers and + - ( ) spaces",
    }),
  partnershipModel: PartnershipModel,
  clientBase: z.string().optional(),
  message: z.string().optional(),
  status: PartnershipStatus.optional(),
  assignTo: z.number().int().optional(),
});

// Update partnership schema
export const updatePartnershipSchema = createPartnershipSchema.partial();

// Follow-up note schemas
export const createPartnershipFollowUpNoteSchema = z.object({
  text: z.string().min(1, "Note text is required"),
  nextDate: z.coerce.date().optional(),
});

export const updatePartnershipFollowUpNoteSchema =
  createPartnershipFollowUpNoteSchema.partial();

