import { z } from "zod";

export const LEI_CODE_REGEX = /^[A-Z0-9]{20}$/;

export const DDMMYYYY_REGEX =
  /^(0?[1-9]|[12][0-9]|3[01])\/(0?[1-9]|1[0-2])\/\d{4}$/;

export const leiInformationSchema = z.object({
  leicode: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z
      .string()
      .trim()
      .toUpperCase()
      .regex(LEI_CODE_REGEX, "LEI Code must be 20 characters (A–Z, 0–9)")
      .optional()
  ),

  expirydate: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z
      .string()
      .trim()
      .regex(DDMMYYYY_REGEX, "Enter date in DD/MM/YYYY format")
      .optional()
  ),
});

