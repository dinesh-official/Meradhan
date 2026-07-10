import { z } from "zod";

const paymentStatusEnum = z.enum([
  "PENDING",
  "COMPLETED",
  "REFUNDED",
  "CANCELLED",
]);
const orderStatusEnum = z.enum([
  "PENDING",
  "IN_PROGRESS",
  "APPLIED",
  "SETTLED",
  "REJECTED",
  "EXPIRED",
  "CANCELLED",
]);
const groupByEnum = z.enum(["day", "week", "month"]);

export const OrderReportsQuerySchema = z.object({
  from: z.string().min(1, "from is required (YYYY-MM-DD)"),
  to: z.string().min(1, "to is required (YYYY-MM-DD)"),
  paymentStatus: paymentStatusEnum.optional(),
  status: orderStatusEnum.optional(),
  isin: z.string().optional(),
  customerId: z.coerce.number().int().positive().optional(),
  email: z.string().optional(),
  userType: z.string().optional(),
  kycStatus: z.string().optional(),
  groupBy: groupByEnum.optional().default("day"),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
});

export const OrderReportsRegisterQuerySchema = OrderReportsQuerySchema.extend({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
});

export const OrderReportsByIsinQuerySchema = OrderReportsQuerySchema.omit({
  groupBy: true,
  page: true,
  limit: true,
});

export const OrderReportsRevenueQuerySchema = OrderReportsByIsinQuerySchema;

export const OrderReportsRmPerformanceQuerySchema = OrderReportsByIsinQuerySchema;

export const OrderReportsByCustomerQuerySchema = OrderReportsQuerySchema.extend({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
});

export const OrderReportsLogFailuresQuerySchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
});

export const OrderReportsSettlementQuerySchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
  paymentId: z.string().optional(),
  batchId: z.string().optional(),
});

export const OrderReportsLifecycleQuerySchema = OrderReportsQuerySchema.extend({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(25),
});
