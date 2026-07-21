import { z } from "zod";

export const ServiceRequestTypeEnum = z.enum(["CLOSURE"]);
export const ServiceRequestStatusEnum = z.enum(["PENDING", "DONE", "REJECTED"]);

const MAX_EXPORT_PAGE_SIZE = 50_000;

export const createServiceRequestSchema = z.object({
  type: ServiceRequestTypeEnum,
  reasonId: z.number().int().positive(),
  reasonRemark: z
    .string()
    .max(500, { message: "Remark must be at most 500 characters" })
    .optional()
    .nullable(),
});

export const findManyServiceRequestsSchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/, { message: "Page must be a numeric string" })
    .default("1")
    .optional(),
  pageSize: z
    .string()
    .regex(/^\d+$/, { message: "Page size must be a numeric string" })
    .optional()
    .transform((v) => (v ? Math.min(Number(v), MAX_EXPORT_PAGE_SIZE) : 10)),
  search: z.string().optional(),
  type: ServiceRequestTypeEnum.optional(),
  status: ServiceRequestStatusEnum.optional(),
});

export const listServiceRequestReasonsQuerySchema = z.object({
  type: ServiceRequestTypeEnum,
});

export const listMyServiceRequestsQuerySchema = z.object({
  type: ServiceRequestTypeEnum.optional(),
});
