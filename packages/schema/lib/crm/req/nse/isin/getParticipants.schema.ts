// schemas/getParticipants.schema.ts
import { z } from "zod";

/**
 * Schema for getParticipants params.
 * - `page` and `pageSize` have sane defaults and are validated as positive integers.
 * - `search` is trimmed; empty string becomes `undefined`.
 * - `workflowStatus` accepts a string/number (common from HTTP query) and coerces to a non-negative integer.
 * - `statusCode` accepts string or number and coerces to a trimmed string (or undefined).
 */
export const GetParticipantsZ = z.object({
  page: z.string().optional(),
  pageSize: z.string().optional(),
  search: z.string().optional(),
  workflowStatus: z.string().optional(),
  statusCode: z.string().optional()
});

export type GetParticipantsParams = z.infer<typeof GetParticipantsZ>;
