import { z } from "zod";

export const SECTORS = ["dummy1", "dummy2"] as const;
export const RATINGS = ["dummy1", "dummy2"] as const;

export const AdditionalOptionsSchema = z.object({
  sector: z.enum(SECTORS),
  rating: z.enum(RATINGS),
  notes: z
    .string()
    .trim()
    .max(1000, "Notes must be under 1000 characters")
    .optional(),
});

