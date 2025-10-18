import z from "zod";
import { followUpNoteSchema } from "./leadFollowUpFormData.schema";

export type FollowUpNoteFormData = z.infer<typeof followUpNoteSchema>;

export interface IFollowUpNoteFormHook {
  state: FollowUpNoteFormData;

  errors: Partial<Record<keyof FollowUpNoteFormData, string[]>>;

  setFollowUpNoteData: <K extends keyof FollowUpNoteFormData>(
    key: K,
    value: FollowUpNoteFormData[K]
  ) => void;

  resetFollowUpNoteData: () => void;

  validateField: <K extends keyof FollowUpNoteFormData>(
    key: K,
    value: FollowUpNoteFormData[K]
  ) => void;

  validateFollowUpNoteData: () => boolean;
  createFollowUpMutation: UseMutationResult
}
