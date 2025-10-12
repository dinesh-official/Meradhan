import {leadFormDataSchema} from './leadfFormData.schema';
import { z } from "zod";


export type LeadFormData = z.infer<typeof leadFormDataSchema>;

export interface ILeadDataFormHook {
  state: LeadFormData;
  errors: Partial<Record<keyof LeadFormData, string[]>>;

  setLeadData: <K extends keyof LeadFormData>(
    key: K,
    value: LeadFormData[K]
  ) => void;
  resetLeadData: () => void;

  validateField: <K extends keyof LeadFormData>(
    key: K,
    value: LeadFormData[K]
  ) => void;
  validateLeadData: () => boolean;
}
