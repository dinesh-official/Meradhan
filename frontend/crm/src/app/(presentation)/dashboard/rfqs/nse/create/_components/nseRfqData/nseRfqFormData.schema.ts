import { z } from "zod";

export const SEGMENTS = ["R", "C"] as const;
export const BUY_SELL = ["B", "S", "X"] as const;
export const QUOTE_TYPES = ["Y", "B"] as const;
export const DEAL_TYPES = ["D", "B"] as const;
export const SETTLEMENT_TYPES = [0, 1] as const;
export const YIELD_TYPES = ["YTM", "YTP", "YTC"] as const;
export const CALC_METHODS = ["M", "O"] as const;

export const nseRFQFormDataSchema = z.object({
  segment: z.enum(SEGMENTS, { message: "Segment is required" }).optional().default("R"),
  
  isin: z
    .string()
    .min(1, "ISIN is required")
    .max(50, "ISIN must be under 50 characters"),
  
  participantCode: z
    .string()
    .min(1, "Participant is required"),

  dealType: z.enum(DEAL_TYPES, { message: "Deal Type is required" }),

  clientCode: z
    .string()
    .max(30, "Client Code must be under 30 characters").optional(),

  buySell: z.enum(BUY_SELL, { message: "Buy/Sell selection is required" }),

  quoteType: z.enum(QUOTE_TYPES, { message: "Quote Type is required" }),

  settlementType: z.float32().min(0).max(10),

  quantity: z
    .number()
    .min(1, "Quantity is required")
    .max(20, "Invalid Quantity").optional(),

  value: z
    .string()
    .min(1, "RFQ Value is required")
    .max(20, "Invalid RFQ Value"),

  yieldType: z.enum(YIELD_TYPES, { message: "Yield Type is required" }),

  yield: z
    .string()
    .min(1, "Yield is required")
    .max(10, "Invalid Yield value"),

  calcMethod: z.enum(CALC_METHODS, { message: "Calculation Method is required" }),

  price: z
    .string()
    .min(1, "Price is required")
    .max(20, "Invalid Price value"),

  particempt: z.enum(SEGMENTS, { message: "particempt is required" }).optional(),
  institutions: z.boolean().optional(),





}).superRefine((data, ctx) => {
  if (data.dealType === "B") {
    if (!data.institutions) {
      ctx.addIssue({
        code: "custom",
        message: "Institutions is required.",
        path: ["institutions"],
      });
    }
    if (!data.clientCode) {
      ctx.addIssue({
        code: "custom",
        message: "clientCode is required.",
        path: ["clientCode"],
      });
    }
  }
});

export type NseRFQFormData = z.infer<typeof nseRFQFormDataSchema>;
