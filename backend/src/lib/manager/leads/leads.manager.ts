import { db } from "@core/database/database";
import type { appSchema } from "@root/schema";
import { AppError } from "@utils/error/AppError";
import type z from "zod";
import type { ILeadsManagerInterface } from "./leads.interface";

export class LeadManager implements ILeadsManagerInterface {
    async createNewLead(
        createdBy: number,
        data: z.infer<typeof appSchema.crm.leads.createNewLeadSchema>,
    ): ReturnType<ILeadsManagerInterface["createNewLead"]> {
        const createdNewLead = db.dataBase.leadsModel.create({
            data: {
                companyName: data.companyName,
                bondType: data.bondType,
                fullName: data.fullName,
                phoneNo: data.phoneNo,
                leadSource: data.leadSource,
                emailAddress: data.emailAddress,
                status: data.status,
                createdBy: createdBy,
            },
        });
        return createdNewLead;
    }

    async updateLead(
        leadId: number,
        data: z.infer<typeof appSchema.crm.leads.updateLeadSchema>
    ): ReturnType<ILeadsManagerInterface["updateLead"]> {
        const existing = await db.dataBase.leadsModel.findUnique({
            where: { id: leadId },
        });
        if (!existing) {
            throw new AppError(`Lead with ID ${leadId} not found`, {
                statusCode: 404,
                code: "LEAD_NOT_FOUND",
            });
        }

        const updatedLead = await db.dataBase.leadsModel.update({
            where: { id: leadId },
            data: {
                companyName: data.companyName?.trim(),
                bondType: data.bondType,
                fullName: data.fullName?.trim(),
                phoneNo: data.phoneNo?.trim(),
                leadSource: data.leadSource,
                emailAddress: data.emailAddress?.trim().toLowerCase(),
                status: data.status,
            },
        });

        if (!updatedLead) {
            throw new AppError("Failed to update lead", {
                statusCode: 400,
                code: "LEAD_UPDATE_FAILED",
            });
        }

        return updatedLead;
    }

    async deleteLead(
        leadId: number
    ): ReturnType<ILeadsManagerInterface["deleteLead"]> {
        const existing = await db.dataBase.leadsModel.findUnique({
            where: { id: leadId },
        });
        if (!existing) {
            throw new AppError(`Lead with ID ${leadId} not found`, {
                statusCode: 404,
                code: "LEAD_NOT_FOUND",
            });
        }

        await db.dataBase.leadsModel.delete({
            where: { id: leadId },
        });

        return true;
    }
}