import type { DataBaseSchema } from "@core/database/database";
import { db } from "@core/database/database";
import type { appSchema } from "@root/schema";
import { generateCorporateRatePdfBuffer } from "@packages/kyc-providers";
import { CustomerProfileManager } from "@services/customer/customer_manager.service";
import { AppError, HttpStatus } from "@utils/error/AppError";
import type z from "zod";
import { CorporateKycRepo } from "./corporatekyc.repo";
import { CorporateKycService } from "./corporatekyc.service";
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

    const searchTrimmed = payload.search?.trim();
    if (searchTrimmed) {
      const words = searchTrimmed.split(/\s+/);
      if (words.length > 1) {
        // Multi-word: each word must match at least one name/contact field (AND across words)
        filters.AND = words.map((word) => ({
          OR: [
            { firstName: { contains: word, mode: "insensitive" } },
            { middleName: { contains: word, mode: "insensitive" } },
            { lastName: { contains: word, mode: "insensitive" } },
            { emailAddress: { contains: word, mode: "insensitive" } },
            { userName: { contains: word, mode: "insensitive" } },
            { phoneNo: { contains: word, mode: "insensitive" } },
            { panCard: { panCardNo: { contains: word, mode: "insensitive" } } },
          ],
        }));
      } else {
        filters.OR = [
          { firstName: { contains: searchTrimmed, mode: "insensitive" } },
          { middleName: { contains: searchTrimmed, mode: "insensitive" } },
          { lastName: { contains: searchTrimmed, mode: "insensitive" } },
          { emailAddress: { contains: searchTrimmed, mode: "insensitive" } },
          { userName: { contains: searchTrimmed, mode: "insensitive" } },
          { phoneNo: { contains: searchTrimmed, mode: "insensitive" } },
          {
            panCard: {
              panCardNo: { contains: searchTrimmed, mode: "insensitive" },
            },
          },
        ];
      }
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
            isEmailVerified: true,
            isPhoneVerified: true,
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
        ? (KYC_STEP_NAMES[kyc.step - 1] || "Unknown")
        : "Not Started";
      return { ...row, currentKycStepName: currentKycStepName.trim() + ` - Step [${kyc?.step ?? 0}]` };
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

  async getCorporatePdf(customerId: number): Promise<{ buffer: Buffer; filename: string }> {
    const corporateKycService = new CorporateKycService(new CorporateKycRepo());
    const kyc = await corporateKycService.getByCustomerId(customerId);
    if (!kyc) {
      throw new AppError("Corporate KYC not found for this customer", {
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    const buffer = await generateCorporateRatePdfBuffer(kyc);
    const filename = corporateKycPdfFilename(customerId, kyc.entityName);
    return { buffer, filename };
  }
}

function corporateKycPdfFilename(customerId: number, entityName: string | undefined): string {
  const base = (entityName ?? "corporate")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
  return `corporate-kyc-${customerId}-${base || "entity"}.pdf`;
}
