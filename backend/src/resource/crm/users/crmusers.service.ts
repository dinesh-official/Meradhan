import { type DataBaseSchema } from "@core/database/database";
import type { appSchema } from "@root/schema";
import type z from "zod";
import { CrmUserRepo } from "./crmusers.repo";

export class CrmUserService {
  private crmUserRepo: CrmUserRepo;
  constructor() {
    this.crmUserRepo = new CrmUserRepo();
  }

  async findUser(id: number) {
    const response = await this.crmUserRepo.findUser({
      where: { id },
    });
    return response;
  }

  async findManyUser(
    payload: z.infer<typeof appSchema.crm.user.findManyUserSchema>
  ) {
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

  async createNewUser(
    payload: z.infer<typeof appSchema.crm.user.createCRMUserSchema>,
    createdBy: number
  ) {
    const response = await this.crmUserRepo.createNewUser({
      ...payload,
      createdBy,
    });
    return response;
  }

  async updateUser(
    id: number,
    payload: z.infer<typeof appSchema.crm.user.updateUserSchema>
  ) {
    const response = await this.crmUserRepo.updateUser({
      data: payload,
      where: { id },
    });
    return response;
  }

  async deleteUser(id: number) {
    const response = await this.crmUserRepo.deleteUser({
      where: { id },
    });
    return response;
  }

  async getSummary() {
    const [totalUsers, activeUsers, adminUsers, salesUsers] = await Promise.all(
      [
        this.crmUserRepo.countUsers({ where: {} }),
        this.crmUserRepo.countUsers({ where: { accountStatus: "ACTIVE" } }),
        this.crmUserRepo.countUsers({ where: { role: "ADMIN" } }),
        this.crmUserRepo.countUsers({ where: { role: "SALES" } }),
      ]
    );

    return { totalUsers, activeUsers, adminUsers, salesUsers };
  }
}
