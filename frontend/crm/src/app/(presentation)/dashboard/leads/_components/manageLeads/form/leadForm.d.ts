import { z } from "zod";
import { leadFormDataSchema } from './leadFormData.schema';
import { useLeadFormDataHook } from './useLeadFormDataHook';


export type LeadFormData = z.infer<typeof leadFormDataSchema>;

export type ILeadDataFormHook = ReturnType<typeof useLeadFormDataHook>