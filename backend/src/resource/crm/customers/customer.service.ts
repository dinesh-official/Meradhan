import type { DataBaseSchema } from "@core/database/database";
import type { appSchema } from "@root/schema";
import { CustomerProfileManager } from "@services/customer/customer_manager.service";
import type z from "zod";
import type { CustomerProfileRepo } from "./customer.repo";

export class CustomerProfileService extends CustomerProfileManager {
  constructor(private customerRepo: CustomerProfileRepo) {
    super();
  }

  getProfile(value: string | number) {
    if (typeof value === "number" || /^\d+$/.test(value.toString())) {
      // Numeric → likely an ID
      return this.getCustomerProfile(Number(value));
    }

    if (value.includes("@")) {
      // Contains @ → email
      return this.getCustomerProfileByEmail(value);
    }

    // Default fallback → username
    return this.getCustomerProfileByUsername(value);
  }

  async filterCustomers(
    payload: z.infer<typeof appSchema.customer.findManyCustomerSchema>
  ) {
    const page = Number(payload.page) || 1;
    const pageSize = 10; // You can make this configurable if needed
    const skip = (page - 1) * pageSize;
    const filters: DataBaseSchema.CustomerProfileDataModelWhereInput = {
      isDeleted: false,
    };

    if (payload.accountStatus) {
      filters.utility = {
        accountStatus: {
          equals: payload.accountStatus,
        },
      };
    }

    if (payload.kycStatus) {
      filters.kycStatus = {
        equals: payload.kycStatus,
      };
    }

    if (payload.search) {
      filters.OR = [
        { firstName: { contains: payload.search, mode: "insensitive" } },
        { middleName: { contains: payload.search, mode: "insensitive" } },
        { lastName: { contains: payload.search, mode: "insensitive" } },
        { emailAddress: { contains: payload.search, mode: "insensitive" } },
        { userName: { contains: payload.search, mode: "insensitive" } },
        { phoneNo: { contains: payload.search, mode: "insensitive" } },
        {
          panCard: {
            panCardNo: { contains: payload.search, mode: "insensitive" },
          },
        },
      ];
    }

    const total = await this.customerRepo.countCustomers({ where: filters });

    // Fetch paginated users
    const data = await this.customerRepo.findManyCustomer({
      where: filters,
      skip,
      take: pageSize,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        userName: true,
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        emailAddress: true,
        phoneNo: true,
        VerifiedBy: true,
        verifyDate: true,
        userType: true,

        panCard: {
          select: {
            panCardNo: true,
          },
        },
        kycStatus: true,
        utility: {
          select: {
            accountStatus: true,
            lastLogin: true,
          },
        },
        createdAt: true,
        updatedAt: true,
        createdBy: true,
      },
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

  async getFullCustomerProfile(customerId: number) {
    return await this.customerRepo.getFullCustomerProfile(customerId);
  }

  async getCustomerByParticipantCode(participantCode: string) {
    return await this.customerRepo.getCustomerByParticipantCode(participantCode);
  }
}
