import { db, type DataBaseSchema } from "@core/database/database";
import type { ServiceRequestRepo } from "@resource/customer/service_requests/service_requests.repo";
import { ServiceRequestRepo as Repo } from "@resource/customer/service_requests/service_requests.repo";
import type { appSchema } from "@root/schema";
import { AppError, HttpStatus } from "@utils/error/AppError";
import type z from "zod";
import { EmailCommunication } from "@communication/email_communication";
import { getEmailSalutationFromSources } from "@root/schema";
import { meraDhanAccountClosedEmailText } from "@emails/text/meraDhanAccountClosedEmailText";
import { meraDhanClosureRequestRejectedEmailText } from "@emails/text/meraDhanClosureRequestRejectedEmailText";

export class CrmServiceRequestService {
  private repo: ServiceRequestRepo;

  constructor(repo?: ServiceRequestRepo) {
    this.repo = repo ?? new Repo();
  }

  async filterRequests(
    payload: z.infer<typeof appSchema.customer.findManyServiceRequestsSchema>,
  ) {
    const page = Number(payload.page) || 1;
    const pageSize = payload.pageSize ?? 10;
    const skip = (page - 1) * pageSize;

    const filters: DataBaseSchema.UserServiceRequestModelWhereInput = {};

    if (payload.type) {
      filters.type = payload.type;
    }
    if (payload.status) {
      filters.status = payload.status;
    }

    const searchTrimmed = payload.search?.trim();
    if (searchTrimmed) {
      filters.customerProfileDataModel = {
        isDeleted: false,
        OR: [
          { firstName: { contains: searchTrimmed, mode: "insensitive" } },
          { middleName: { contains: searchTrimmed, mode: "insensitive" } },
          { lastName: { contains: searchTrimmed, mode: "insensitive" } },
          { emailAddress: { contains: searchTrimmed, mode: "insensitive" } },
          { phoneNo: { contains: searchTrimmed, mode: "insensitive" } },
        ],
      };
    } else {
      filters.customerProfileDataModel = { isDeleted: false };
    }

    const total = await this.repo.count({ where: filters });
    const rows = await this.repo.findMany({
      where: filters,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        reason: { select: { id: true, text: true } },
        customerProfileDataModel: {
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            emailAddress: true,
            phoneNo: true,
            gender: true,
            panCard: { select: { gender: true } },
            aadhaarCard: { select: { gender: true } },
          },
        },
      },
    });

    const processedByIds = [
      ...new Set(rows.map((r) => r.processedBy).filter((id): id is number => id != null)),
    ];
    const crmUsers =
      processedByIds.length > 0
        ? await db.dataBase.cRMUserDataModel.findMany({
            where: { id: { in: processedByIds } },
            select: { id: true, name: true },
          })
        : [];
    const crmUserMap = new Map(crmUsers.map((u) => [u.id, u.name]));

    const data = rows.map((row) => ({
      id: row.id,
      type: row.type,
      reasonId: row.reasonId,
      reasonRemark: row.reasonRemark,
      status: row.status,
      processedAt: row.processedAt,
      processedBy: row.processedBy,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      reason: row.reason,
      customer: row.customerProfileDataModel!,
      processedByName: row.processedBy ? crmUserMap.get(row.processedBy) ?? null : null,
    }));

    return {
      data,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    };
  }

  private assertPending(request: Awaited<ReturnType<ServiceRequestRepo["findById"]>>) {
    if (!request) {
      throw new AppError("Service request not found", {
        statusCode: HttpStatus.NOT_FOUND,
        code: "REQUEST_NOT_FOUND",
      });
    }
    if (request.status !== "PENDING") {
      throw new AppError("This request has already been processed", {
        statusCode: HttpStatus.CONFLICT,
        code: "REQUEST_ALREADY_PROCESSED",
      });
    }
    return request;
  }

  async closeAccount(requestId: number, adminId: number) {
    const request = this.assertPending(await this.repo.findById(requestId));
    const customer = request.customerProfileDataModel!;

    const profile = await db.dataBase.customerProfileDataModel.findUnique({
      where: { id: customer.id },
      select: { customersAuthDataModelId: true },
    });

    if (!profile) {
      throw new AppError("Customer not found", {
        statusCode: HttpStatus.NOT_FOUND,
        code: "CUSTOMER_NOT_FOUND",
      });
    }

    const result = await db.dataBase.$transaction(async (tx) => {
      const row = await tx.userServiceRequestModel.update({
        where: { id: requestId },
        data: {
          status: "DONE",
          processedAt: new Date(),
          processedBy: adminId,
        },
        include: { reason: { select: { id: true, text: true } } },
      });

      await tx.customersAuthDataModel.update({
        where: { id: profile.customersAuthDataModelId },
        data: {
          accountStatus: "CLOSED",
          tokenVersion: { increment: 1 },
        },
      });

      return row;
    });

    const fullProfile = await db.dataBase.customerProfileDataModel.findUnique({
      where: { id: customer.id },
      select: {
        firstName: true,
        middleName: true,
        lastName: true,
        emailAddress: true,
        gender: true,
        panCard: { select: { gender: true } },
        aadhaarCard: { select: { gender: true } },
      },
    });

    if (fullProfile) {
      const salutation = getEmailSalutationFromSources(fullProfile);
      const customerName = [fullProfile.firstName, fullProfile.middleName, fullProfile.lastName]
        .filter(Boolean)
        .join(" ")
        .trim();
      try {
        const emailSend = new EmailCommunication();
        await emailSend.sendEmail({
          to: fullProfile.emailAddress,
          subject: "MeraDhan — Your account has been closed",
          html: meraDhanAccountClosedEmailText({ customerName, salutation }),
        });
      } catch {
        // non-blocking
      }
    }

    return result;
  }

  async rejectRequest(requestId: number, adminId: number) {
    const request = this.assertPending(await this.repo.findById(requestId));
    const customer = request.customerProfileDataModel!;

    const result = await this.repo.update({
      where: { id: requestId },
      data: {
        status: "REJECTED",
        processedAt: new Date(),
        processedBy: adminId,
      },
      include: { reason: { select: { id: true, text: true } } },
    });

    const fullProfile = await db.dataBase.customerProfileDataModel.findUnique({
      where: { id: customer.id },
      select: {
        firstName: true,
        middleName: true,
        lastName: true,
        emailAddress: true,
        gender: true,
        panCard: { select: { gender: true } },
        aadhaarCard: { select: { gender: true } },
      },
    });

    if (fullProfile) {
      const salutation = getEmailSalutationFromSources(fullProfile);
      const customerName = [fullProfile.firstName, fullProfile.middleName, fullProfile.lastName]
        .filter(Boolean)
        .join(" ")
        .trim();
      try {
        const emailSend = new EmailCommunication();
        await emailSend.sendEmail({
          to: fullProfile.emailAddress,
          subject: "MeraDhan — Account closure request update",
          html: meraDhanClosureRequestRejectedEmailText({ customerName, salutation }),
        });
      } catch {
        // non-blocking
      }
    }

    return result;
  }
}
