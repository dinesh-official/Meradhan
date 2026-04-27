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

export const NOTIFICATION_MEDIUMS = ["SMS", "WHATSAPP", "RCS"] as const;
export type NotificationMediumType = (typeof NOTIFICATION_MEDIUMS)[number];

export const sendNotificationSchema = z.object({
  savedListId: z.number().int().positive(),
  medium: z.enum(NOTIFICATION_MEDIUMS),
  dltTemplateId: z.string().min(1),
  templateVariables: z.record(z.string(), z.string()),
});

export const createTemplateSchema = z
  .object({
    name: z.string().min(1).max(200),
    templateId: z.string().min(1).max(200),
    medium: z.enum(NOTIFICATION_MEDIUMS),
    /// Required for SMS/WhatsApp; optional for RCS (content managed on MSG91 side)
    message: z.string().max(5000).optional().nullable(),
    rcsProjectId: z.string().max(200).optional(),
    rcsNamespace: z.string().max(200).optional(),
    rcsVariables: z.array(z.string().max(100)).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.medium !== "RCS" && !data.message?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Message is required for SMS and WhatsApp templates.",
        path: ["message"],
      });
    }
  });

export const updateTemplateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  templateId: z.string().min(1).max(200).optional(),
  medium: z.enum(NOTIFICATION_MEDIUMS).optional(),
  message: z.string().max(5000).optional().nullable(),
  rcsProjectId: z.string().max(200).optional().nullable(),
  rcsNamespace: z.string().max(200).optional().nullable(),
  rcsVariables: z.array(z.string().max(100)).optional().nullable(),
});

export const listTemplatesQuerySchema = z.object({
  medium: z.enum(NOTIFICATION_MEDIUMS).optional(),
});

export const listNotificationLogsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
  medium: z.enum(NOTIFICATION_MEDIUMS).optional(),
  deliveryStatus: z
    .enum(["PENDING", "PROCESSING", "COMPLETED", "PARTIAL_FAILURE", "FAILED"])
    .optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});
