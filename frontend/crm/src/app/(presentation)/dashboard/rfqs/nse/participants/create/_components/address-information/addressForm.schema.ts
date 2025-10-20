import { z } from "zod";

export const STATE_CODE_REGEX = /^[A-Z]{2,3}$/; // e.g., "DL", "MH", "UP"

export const addressInformationSchema = z.object({
  addressLine1: z
    .string()
    .trim()
    .min(3, "Address Line 1 must be at least 3 characters")
    .max(120, "Address Line 1 must be at most 120 characters"),

  addressLine2: z
    .string()
    .trim()
    .max(120, "Address Line 2 must be at most 120 characters")
    .optional(),

  addressLine3: z
    .string()
    .trim()
    .max(120, "Address Line 3 must be at most 120 characters")
    .optional(),

  stateCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(
      STATE_CODE_REGEX,
      "State Code must be 2–3 uppercase letters (e.g., DL, MH)"
    ),

  registeredAddress: z
    .string()
    .trim()
    .max(500, "Registered Address must be at most 500 characters")
    .optional(),
});
