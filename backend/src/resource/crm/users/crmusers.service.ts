import { db, type CRMUserDataModel } from "@core/database/database"
import type { appSchema } from "@root/schema"
import type z from "zod"
import type { ICrmUserRepo } from "./crmusers.repo"

export interface ICrmUserService {
    findUser(id: number): Promise<CRMUserDataModel>
    findManyUser(payload: z.infer<typeof appSchema.crm.user.findManyUserSchema>): Promise<CRMUserDataModel[]>
    createNewUser(payload: z.infer<typeof appSchema.crm.user.createCRMUserSchema>, createdBy: number,): Promise<CRMUserDataModel>
    updateUser(id: number, payload: z.infer<typeof appSchema.crm.user.updateUserSchema>): Promise<CRMUserDataModel>
    deleteUser(id: number): Promise<boolean>
}

export class CrmUserService implements ICrmUserService {
    constructor(private crmUserRepo: ICrmUserRepo) { }

    async findUser(id: number): ReturnType<ICrmUserService['findUser']> {
        const response = await this.crmUserRepo.findUser({
            where: { id }
        });
        return response;
    }

  async  findManyUser(payload: z.infer<typeof appSchema.crm.user.findManyUserSchema>): ReturnType<ICrmUserService['findManyUser']> {
        return await db.dataBase.cRMUserDataModel.findMany();
    }

    async createNewUser(payload: z.infer<typeof appSchema.crm.user.createCRMUserSchema>, createdBy: number,): ReturnType<ICrmUserService['createNewUser']> {
        const response = await this.crmUserRepo.createNewUser({
            ...payload,
            createdBy
        });
        return response;
    }

    async updateUser(id: number, payload: z.infer<typeof appSchema.crm.user.updateUserSchema>): ReturnType<ICrmUserService['updateUser']> {
        const response = await this.crmUserRepo.updateUser({
            data: payload,
            where: { id }
        });
        return response;
    }

    async deleteUser(id: number): ReturnType<ICrmUserService['deleteUser']> {
        const response = await this.crmUserRepo.deleteUser({
            where: { id }
        });
        return response;
    }

}