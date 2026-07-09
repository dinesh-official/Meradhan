import z from "zod";
import { followUpNoteSchema } from "./hooks/leadFollowUpFormData.schema";
import { useFollowUpNoteFormHook } from "./useFollowUpFormDataHook";

export type FollowUpNoteFormData = z.infer<typeof followUpNoteSchema>;

export type IFollowUpNoteFormHook= ReturnType<typeof useFollowUpNoteFormHook>
