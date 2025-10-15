import type { LeadsModel } from "@core/database/database";
import type { appSchema } from "@root/schema";
import type z from "zod";

interface ILeadsManagerInterface {
    getLeadById(leadId: number): Promise<boolean>
    createNewLead(data: z.infer<typeof appSchema.crm.leads.createNewLeadSchema>): Promise<LeadsModel>
    updateLead(leadId: number, data: z.infer<typeof appSchema.crm.leads.updateLeadSchema>): Promise<LeadsModel>
    deleteLead(leadId: number): Promise<boolean>
}

