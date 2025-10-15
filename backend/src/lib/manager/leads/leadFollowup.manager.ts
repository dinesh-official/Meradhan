import type { LeadFollowUpNotesModel } from "@core/database/database";
import type { appSchema } from "@root/schema";
import type z from "zod";

interface ILeadsFollowUpManagerInterface {
    getFollowUpNotesByLeadId(leadId: number): Promise<LeadFollowUpNotesModel[]>
    createNewFollowUpNote(data: z.infer<typeof appSchema.crm.leads.createNewLeadFollowUpNoteSchema>): Promise<LeadFollowUpNotesModel>
    updateFollowUpNote(followUpNoteId: number, data: z.infer<typeof appSchema.crm.leads.updateLeadFollowUpNoteSchema>): Promise<LeadFollowUpNotesModel>
    deleteFollowUpNote(followUpNoteId: number): Promise<boolean>
}