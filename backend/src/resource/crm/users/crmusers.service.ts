import { type CRMUserDataModel, type DataBaseSchema } from "@core/database/database"
import type { appSchema } from "@root/schema"
import type z from "zod"
import type { META_DATA_PAGINATION } from "../../../../types/metadata"
import type { ICrmUserRepo } from "./crmusers.repo"

export interface ICrmUserService {
    findUser(id: number): Promise<CRMUserDataModel>
    findManyUser(payload: z.infer<typeof appSchema.crm.user.findManyUserSchema>): Promise<{ data: CRMUserDataModel[], meta: META_DATA_PAGINATION }>
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

    async findManyUser(payload: z.infer<typeof appSchema.crm.user.findManyUserSchema>): ReturnType<ICrmUserService['findManyUser']> {
        const page = Number(payload.page) || 1;
        const pageSize = 10; // You can make this configurable if needed
        const skip = (page - 1) * pageSize;

        // Build query filters
        const filters: DataBaseSchema.CRMUserDataModelWhereInput = {};

        if (payload.status) {
            filters.accountStatus = payload.status;
        }

        if (payload.role) {
            filters.role = payload.role;
        }

        if (payload.search) {
            filters.OR = [
                { name: { contains: payload.search, mode: "insensitive" } },
                { email: { contains: payload.search, mode: "insensitive" } },
            ];
        }

        // Count total items matching filters
        const total = await this.crmUserRepo.countUsers({ where: filters });

        // Fetch paginated users
        const data = await this.crmUserRepo.findManyUser({
            where: filters,
            skip,
            take: pageSize,
        });

        return {
            data,
            meta: {
                total,
                page,
                pageSize,
                totalPages: Math.ceil(total / pageSize),
            },
        };
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