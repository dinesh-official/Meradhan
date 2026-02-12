import z from "zod";

// Page view tracking schema
export const PageViewSchema = z.object({
  userId: z.string().optional(),
  pagePath: z.string(),
  entryTime: z.date(),
  sessionId: z.string(),
  interactions: z.number(),
  scrollDepth: z.number(),
  pageTitle: z.string(),
  duration: z.number(),
  referrer: z.string(),
});

// Partial payload for ending a page view (only exit metrics)
export const EndPageViewSchema = z.object({
  exitTime: z.union([z.date(), z.string()]).transform((v) => (v instanceof Date ? v : new Date(v))),
  duration: z.number(),
  scrollDepth: z.number(),
  interactions: z.number(),
});

// Define Zod schema for query parameters
export const trackingListQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => parseInt(val || "1", 10))
    .refine((val) => val > 0, { message: "Page must be greater than 0" }),
  limit: z.string().optional(),
  search: z.string().optional(),
  userId: z.string().optional(),
  type: z.string().optional(),
  fromDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Invalid fromDate",
    }),
  toDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Invalid toDate",
    }),
});

export default {
  PageViewSchema,
  EndPageViewSchema,
  trackingListQuerySchema,
};
