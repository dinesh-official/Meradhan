import { z } from "zod";



export const AdditionalOptionsSchema = z.object({
  sector: z.string(),
  rating: z.string(),
  notes: z
    .string()
    .trim()
    .max(1000, "Notes must be under 1000 characters")
    .optional(),
});

