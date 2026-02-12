import z from "zod";

export const PageViewSchema = z.object({
  pagePath: z.any(),
  pageTitle: z.any(),
  entryTime: z.any(),
  exitTime: z.any().optional(),
  duration: z.any().optional(),
  scrollDepth: z.any(),
  interactions: z.any(),
  sessionId: z.string(),
  referrer: z.any().optional(),
  userId: z.number().optional(),
});

/** Payload for ending a page view: only exit metrics (no sessionId/pagePath required) */
export const EndPageViewSchema = z.object({
  exitTime: z.union([z.date(), z.string()]).transform((v) => (v instanceof Date ? v : new Date(v))),
  duration: z.number(),
  scrollDepth: z.number(),
  interactions: z.number(),
});

export type PageView = z.infer<typeof PageViewSchema>;
export type EndPageView = z.infer<typeof EndPageViewSchema>;
