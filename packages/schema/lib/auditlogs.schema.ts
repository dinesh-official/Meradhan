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

export type PageView = z.infer<typeof PageViewSchema>;
