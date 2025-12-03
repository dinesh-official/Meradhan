import { z } from "zod";

export const CrmOrdersQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.string().optional(),
  bondType: z.string().optional(),
  search: z.string().optional(),
  date: z.string().optional(),
});
