import z from "zod";

export const calculationMethods = ["others", "dummy1"] as const;
export const settlementOptions = ["others", "dummy1"] as const;
export const goodTillDays = ["others", "dummy1"] as const;
export const dealTypes = ["others", "dummy1"] as const;

export const dealSplitFormSchema = z.object({
  value: z
    .string()
    .min(1, "Value is required")
    .regex(/^\d+(\.\d+)?$/, "Value must be a valid number"),

  yield: z
    .string()
    .min(1, "Yield is required")
    .regex(/^\d+(\.\d+)?$/, "Yield must be a valid number"),

  calculationMethod: z.enum(calculationMethods),

  priceTriggeredDate: z
    .string()
    .min(1, "Price Triggered Date is required")
    .refine(
      (v) => !isNaN(Date.parse(v)),
      "Invalid date format for Price Triggered Date"
    ),

  price: z
    .string()
    .min(1, "Price is required")
    .regex(/^\d+(\.\d+)?$/, "Price must be numeric"),

  totalAccruedInterest: z
    .string()
    .min(1, "Total Accrued Interest is required")
    .regex(/^\d+(\.\d+)?$/, "Interest must be numeric"),

  settlementDate: z.enum(settlementOptions),

  quantity: z
    .string()
    .min(1, "Quantity is required")
    .regex(/^\d+$/, "Quantity must be an integer"),

  goodTillDay: z.enum(goodTillDays),

  endTime: z
    .string()
    .min(1, "End Time is required")
    .refine(
      (v) => !isNaN(Date.parse(v)),
      "Invalid format for End Time (use yyyy-mm-dd)"
    ),

  stampDuty: z
    .string()
    .min(1, "Cons. w/o Stamp Duty is required")
    .regex(/^\d+(\.\d+)?$/, "Stamp Duty must be numeric"),

  dealType: z.enum(dealTypes),

  clientCode: z
    .string()
    .min(1, "Client Code is required")
    .max(20, "Client Code cannot exceed 20 characters"),

  institution: z.boolean().default(false),

  notes: z
    .string()
    .max(500, "Notes cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
});

