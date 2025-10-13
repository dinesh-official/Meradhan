import { z } from "zod";

export const SEGMENTS = ["dummy1", "dummy2"] as const;
export const BUY_SELL = ["Buy", "Sell"] as const;
export const QUOTE_TYPES = ["dummy1", "dummy2"] as const;
export const DEAL_TYPES = ["DIRECT", "BROKER"] as const;
export const SETTLEMENT_TYPES = ["dummy1", "dummy2"] as const;
export const YIELD_TYPES = ["dummy1", "dummy2"] as const;
export const CALC_METHODS = ["dummy1", "dummy2"] as const;

export const nseRFQFormDataSchema = z.object({
  isin: z
    .string()
    .min(1, "ISIN is required")
    .max(50, "ISIN must be under 50 characters"),

  segment: z.enum(SEGMENTS, { message: "Segment is required" }),
  buySell: z.enum(BUY_SELL, { message: "Buy/Sell selection is required" }),
  quoteType: z.enum(QUOTE_TYPES, { message: "Quote Type is required" }),
  clientCode: z
    .string()
    .max(50, "Client Code must be under 50 characters").optional(),
  dealType: z.enum(DEAL_TYPES, { message: "Deal Type is required" }),
  institutions: z.boolean().optional(),
  rfqSize: z
    .string()
    .min(1, "RFQ Size is required")
    .max(20, "Invalid RFQ Size"),
  settlementType: z.enum(SETTLEMENT_TYPES, { message: "Settlement Type is required" }),
  quantity: z
    .string()
    .min(1, "Quantity is required")
    .max(20, "Invalid Quantity"),

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
}).superRefine((data, ctx) => {
  if (data.dealType === "BROKER") {
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
