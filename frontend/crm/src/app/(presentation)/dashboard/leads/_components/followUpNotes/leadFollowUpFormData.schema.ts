import { z } from "zod";

export const followUpNoteSchema = z.object({
  notes: z
    .string()
    .min(1, "Please enter follow-up notes")
    .max(500, "Notes should not exceed 500 characters"),

  nextFollowUpDate: z
    .string()
    .optional()
    
});

export type FollowUpNoteFormData = z.infer<typeof followUpNoteSchema>;
