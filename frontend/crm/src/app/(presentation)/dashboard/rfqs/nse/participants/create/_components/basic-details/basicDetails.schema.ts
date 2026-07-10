import { z } from "zod";

/** Reusable regex */
export const PERSON_NAME_REGEX = /^[A-Za-z .'-]{2,60}$/; // names
export const TELEPHONE_REGEX = /^\+?[0-9 ()-]{7,15}$/; // intl/landline/mobile
export const LOGIN_ID_REGEX = /^[A-Za-z0-9._-]{3,40}$/; // simple login id
export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/; // Indian PAN (uppercase)

export const basicDetailsSchema = z.object({
  loginId: z
    .string()
    .trim()
    .regex(
      LOGIN_ID_REGEX,
      "Login Id must be 3–40 characters (letters, numbers, ., _, -)"
    ),

  firstName: z
    .string()
    .trim()
    .regex(PERSON_NAME_REGEX, "Enter a valid first name")
    .min(2, "First Name must be at least 2 characters")
    .max(60, "First Name must be at most 60 characters"),

  panNumber: z
    .string()
    .trim()
    .toUpperCase()
    .refine(
      (v) => v === "PAN_EXEMPT" || PAN_REGEX.test(v),
      "Enter a valid PAN (e.g., ABCDE1234F) or 'PAN_EXEMPT'"
    ),

  custodian: z
    .string()
    .trim()
    .max(80, "Custodian must be at most 80 characters")
    .optional(),
    
  contactPerson: z
    .string()
    .trim()
    .regex(PERSON_NAME_REGEX, "Enter a valid name")
    .min(2, "Contact Person must be at least 2 characters")
    .max(60, "Contact Person must be at most 60 characters"),

  telephone: z
    .string()
    .trim()
    .regex(
      TELEPHONE_REGEX,
      "Enter a valid phone number (7–15 digits, may include +, spaces, (), -)"
    ),

  fax: z
    .string()
    .trim()
    .regex(
      TELEPHONE_REGEX,
      "Enter a valid fax number (7–15 digits, may include +, spaces, (), -)"
    )
    .optional(),
});
