import { z } from "zod";

export const ResyncKraFromCbricsParticipantsBodyZ = z.object({
  items: z
    .array(
      z.object({
        loginId: z.string().trim().min(1),
        workflowStatus: z.coerce.number().int(),
      }),
    )
    .min(1)
    .max(200),
});

export type ResyncKraFromCbricsParticipantsBody = z.infer<
  typeof ResyncKraFromCbricsParticipantsBodyZ
>;
