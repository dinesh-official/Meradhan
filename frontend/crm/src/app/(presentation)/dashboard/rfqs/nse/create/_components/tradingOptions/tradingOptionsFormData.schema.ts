import { z } from "zod";

export const ACCESS_TYPES = ["dummy1", "dummy2"] as const;

export const TradingOptionsSchema = z.object({
  rfqValidTillMarketClose: z.boolean().default(false),
  rfqExpiryTime: z
    .string()
    .min(1, "RFQ Expiry Time is required")
    .max(10, "Invalid time format"),

  quoteNegotiable: z.boolean().default(false),
  valueNegotiable: z.boolean().default(false),

  minimumValue: z
    .string()
    .min(1, "Minimum Value is required")
    .max(20, "Invalid Minimum Value"),

  valueStepSize: z
    .string()
    .min(1, "Value Step Size is required")
    .max(20, "Invalid Value Step Size"),

  accessType: z.enum(ACCESS_TYPES, { message: "Access Type is required" }),
  anonymous: z.boolean().default(false),
});

