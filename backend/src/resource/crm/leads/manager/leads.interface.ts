import type { LeadFollowUpNotesModel, LeadsModel } from "@core/database/database";
import type { appSchema } from "@root/schema";
import type z from "zod";
import type { META_DATA_PAGINATION } from "../../../../../types/metadata";

export interface ILeadsManagerInterface {
    getLeadById(leadId: number): Promise<LeadsModel>;
    filterLead(data: z.infer<typeof appSchema.crm.leads.findManyLeadsSchema>): Promise<{
        data: LeadsModel[],
        meta: META_DATA_PAGINATION
    }>;
    createNewLead(createdBy: number, data: z.infer<typeof appSchema.crm.leads.createNewLeadSchema>): Promise<LeadsModel>
    updateLead(leadId: number, data: z.infer<typeof appSchema.crm.leads.updateLeadSchema>): Promise<LeadsModel>
    deleteLead(leadId: number): Promise<boolean>
}


export interface ILeadsFollowUpManagerInterface {
    getFollowUpNotesByLeadId(leadId: number): Promise<LeadFollowUpNotesModel[]>;
    createNewFollowUpNote(
        leadId: number,
        createdById: number,
        data: z.infer<typeof appSchema.crm.leads.createNewLeadFollowUpNoteSchema>
    ): Promise<LeadFollowUpNotesModel>;
    updateFollowUpNote(
        followUpNoteId: number,
        data: z.infer<typeof appSchema.crm.leads.updateLeadFollowUpNoteSchema>
    ): Promise<LeadFollowUpNotesModel>;
    deleteFollowUpNote(followUpNoteId: number): Promise<boolean>;
}