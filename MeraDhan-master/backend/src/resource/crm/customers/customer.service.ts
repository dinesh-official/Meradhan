import type { DataBaseSchema } from "@core/database/database";
import { db } from "@core/database/database";
import type { appSchema } from "@root/schema";
import { CustomerProfileManager } from "@services/customer/customer_manager.service";
import type z from "zod";
import type { CustomerProfileRepo } from "./customer.repo";

const KYC_STEP_NAMES = [
  "Identity Validation",
  "Personal Details",
  "Bank Account",
  "Demat Account",
  "Risk Profiling",
  "e-Signature",
  "100%",
] as const;

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
    const pageSize = payload.pageSize ?? 10;
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
    const rawData = await this.customerRepo.findManyCustomer({
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
        kraStatus: true,
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

    const customerIds = rawData.map((c) => c.id);
    const kycFlows =
      customerIds.length > 0
        ? await db.dataBase.kYC_FLOW.findMany({
            where: { userID: { in: customerIds } },
            select: { userID: true, step: true, currentStepName: true, complete: true },
            orderBy: { updatedAt: "desc" },
          })
        : [];

    const kycByUser = new Map<number, { step: number; currentStepName: string | null; complete: boolean }>();
    for (const k of kycFlows) {
      if (k.userID != null && !kycByUser.has(k.userID)) {
        kycByUser.set(k.userID, {
          step: k.step,
          currentStepName: k.currentStepName,
          complete: k.complete,
        });
      }
    }

    const data = rawData.map((row) => {
      const kyc = kycByUser.get(row.id);
      const currentKycStepName = kyc
        ? (kyc.currentStepName?.trim() || KYC_STEP_NAMES[kyc.step - 1] || "Unknown")
        : "Not Started";
      return { ...row, currentKycStepName };
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
