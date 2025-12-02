import { z } from "zod";

export const OrderPreviewItemSchema = z.object({
  isin: z.string(),
  quantity: z.number().int().positive(),
});

export const OrderPreviewResponseSchema = z.object({
  subTotal: z.number(),
  stampDuty: z.number(),
  totalAmount: z.number(),
  isin: z.string(),
  bondName: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  faceValue: z.number(),
  bondDetails: z.any(),
});

export const OrderPayItemSchema = z.object({
  paymentOrderId: z.string(),
  paymentId: z.string(),
  signature: z.string(), // We still accept signature from client for verification
});

export const OrderPayResponseSchema = z.object({
  orderId: z.number(),
  status: z.string(),
  message: z.string(),
});

export const OrderQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.string().optional(),
  bondType: z.string().optional(),
});

export const OrderAuditLogQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  orderId: z.string().optional(),
});
