import { z } from "zod";

export const PaymentGatewayModeSchema = z.enum(["PAYMENT", "INQUIRY"]);

export const UpdatePaymentGatewayModeSchema = z.object({
  paymentGatewayMode: PaymentGatewayModeSchema,
});

export const CrmOrdersQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.string().optional(),
  bondType: z.string().optional(),
  search: z.string().optional(),
  date: z.string().optional(),
});
