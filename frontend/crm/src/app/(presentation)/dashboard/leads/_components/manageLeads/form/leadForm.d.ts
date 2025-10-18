import { CrmUsersProfile } from '@root/apiGateway';
import { leadFormDataSchema } from './leadFormData.schema';
import { z } from "zod";
import { useLeadFormDataHook } from './useLeadFormDataHook';


export type LeadFormData = z.infer<typeof leadFormDataSchema>;

export type ILeadDataFormHook = ReturnType<typeof useLeadFormDataHook>