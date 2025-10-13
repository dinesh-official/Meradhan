import z from "zod";
import { dealSplitFormSchema } from "./dealSplitFormData.schema";

export type DealSplitFormData = z.infer<typeof dealSplitFormSchema>;

export interface IDealSplitFormHook {
  state: DealSplitFormData;
  errors: Partial<Record<keyof DealSplitFormData, string[]>>;

  /** Update a specific field */
  setDealSplitData: <K extends keyof DealSplitFormData>(
    key: K,
    value: DealSplitFormData[K]
  ) => void;

  /** Reset all form fields and errors */
  resetDealSplitData: () => void;

  /** Validate a single field and update errors */
  validateField: <K extends keyof DealSplitFormData>(
    key: K,
    value: DealSplitFormData[K]
  ) => void;

  /** Validate entire form, returns true if valid */
  validateDealSplitData: () => boolean;
}
