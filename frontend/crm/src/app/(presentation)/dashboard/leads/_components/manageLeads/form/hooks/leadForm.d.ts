import { z } from "zod";
import { useLeadFormDataHook } from './useLeadFormDataHook';
import { leadFormDataSchema } from "./leadFormData.schema";


export type LeadFormData = z.infer<typeof leadFormDataSchema>;

export type ILeadDataFormHook = ReturnType<typeof useLeadFormDataHook>