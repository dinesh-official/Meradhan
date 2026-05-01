// schemas/getParticipants.schema.ts
import { z } from "zod";

/**
 * CBRICS unregistered-participant `/unreg/all` workflow codes (NSE CBrics).
 *
 * @see POST /bondsnew/rest/v1/unreg/all  body.workflowStatus
 */
export const CbricsUnregisteredWorkflowStatusZ = z.union([
  z.literal(100),
  z.literal(16),
  z.literal(15),
  z.literal(0),
  z.literal(10),
  z.literal(1),
  z.literal(5),
  z.literal(6),
]);

export type CbricsUnregisteredWorkflowStatus = z.infer<typeof CbricsUnregisteredWorkflowStatusZ>;

/** Catalog for dropdowns — same codes as `/unreg/all`. */
export const CBRICS_UNREG_WORKFLOW_STATUS_OPTIONS: ReadonlyArray<{
  code: CbricsUnregisteredWorkflowStatus;
  label: string;
}> = [
  { code: 100, label: "Pending with checker" },
  { code: 16, label: "Returned by checker" },
  { code: 15, label: "Rejected by checker" },
  { code: 0, label: "Pending with exchange" },
  { code: 10, label: "Pending with exchange" },
  { code: 1, label: "Approved" },
  { code: 5, label: "Rejected" },
  { code: 6, label: "Returned" },
];

/**
 * Route `GET .../workflow/:workflowStatus` — validates path segment after coercion.
 */
export const CbricsWorkflowStatusPathParamsZ = z.object({
  workflowStatus: z
    .string()
    .trim()
    .transform((s) => Number(s))
    .pipe(CbricsUnregisteredWorkflowStatusZ),
});

/**
 * Optional filters forwarded to `UnregisteredParticipantParams` alongside `workflowStatus`.
 */
export const CbricsUnregAllQueryZ = z.object({
  search: z.string().optional(),
  loginId: z.string().optional(),
  panNo: z.string().optional(),
});

export type CbricsUnregAllQuery = z.infer<typeof CbricsUnregAllQueryZ>;

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
