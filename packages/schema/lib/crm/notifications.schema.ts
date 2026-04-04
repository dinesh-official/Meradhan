import { z } from "zod";

export const queryCustomersPromptSchema = z.object({
  prompt: z.string().min(1).max(4000),
});

export const createSavedListSchema = z.object({
  name: z.string().min(1).max(200),
  customerProfileIds: z.array(z.number().int().positive()),
  sourcePrompt: z.string().max(8000).optional(),
});

export const patchSavedListSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  isActive: z.boolean().optional(),
});

export const sendNotificationSchema = z.object({
  savedListId: z.number().int().positive(),
  medium: z.enum(["SMS", "WHATSAPP"]),
  dltTemplateId: z.string().min(1),
  templateVariables: z.record(z.string(), z.string()),
});

export const createTemplateSchema = z.object({
  name: z.string().min(1).max(200),
  templateId: z.string().min(1).max(200),
  message: z.string().min(1).max(5000),
});

export const updateTemplateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  templateId: z.string().min(1).max(200).optional(),
  message: z.string().min(1).max(5000).optional(),
});

export const listNotificationLogsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
  medium: z.enum(["SMS", "WHATSAPP"]).optional(),
  deliveryStatus: z
    .enum(["PENDING", "PROCESSING", "COMPLETED", "PARTIAL_FAILURE", "FAILED"])
    .optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});
