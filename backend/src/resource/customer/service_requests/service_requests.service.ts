import { db } from "@core/database/database";
import type { ServiceRequestRepo } from "./service_requests.repo";
import type { appSchema } from "@root/schema";
import { AppError, HttpStatus } from "@utils/error/AppError";
import type z from "zod";
import { EmailCommunication } from "@communication/email_communication";
import { getEmailSalutationFromSources } from "@root/schema";
import { meraDhanClosureRequestSubmittedEmailText } from "@emails/text/meraDhanClosureRequestSubmittedEmailText";
import { meraDhanClosureRequestAdminEmailText } from "@emails/text/meraDhanClosureRequestAdminEmailText";
import { env } from "@packages/config/env";

/** Ops inbox notified when a customer raises an account closure request. */
const ACCOUNT_CLOSURE_ADMIN_EMAIL = "support@meradhan.co";

export class CustomerServiceRequestService {
  constructor(private repo: ServiceRequestRepo) {}

  async listReasons(type: z.infer<typeof appSchema.customer.listServiceRequestReasonsQuerySchema>["type"]) {
    return this.repo.findActiveReasons(type);
  }

  async createRequest(
    userId: number,
    payload: z.infer<typeof appSchema.customer.createServiceRequestSchema>,
  ) {
    const profile = await db.dataBase.customerProfileDataModel.findUnique({
      where: { id: userId, isDeleted: false },
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        userName: true,
        emailAddress: true,
        phoneNo: true,
        gender: true,
        panCard: { select: { gender: true } },
        aadhaarCard: { select: { gender: true } },
        utility: { select: { accountStatus: true } },
      },
    });

    if (!profile) {
      throw new AppError("Customer not found", {
        statusCode: HttpStatus.NOT_FOUND,
        code: "CUSTOMER_NOT_FOUND",
      });
    }

    if (profile.utility.accountStatus === "CLOSED") {
      throw new AppError("Your account has been closed. Please contact us to open new account", {
        statusCode: HttpStatus.FORBIDDEN,
        code: "ACCOUNT_CLOSED",
      });
    }

    const existingPending = await this.repo.findPendingByUserAndType(userId, payload.type);
    if (existingPending) {
      throw new AppError("A closure request is already pending review", {
        statusCode: HttpStatus.CONFLICT,
        code: "REQUEST_ALREADY_PENDING",
      });
    }

    const reason = await this.repo.findReasonById(payload.reasonId);
    if (!reason || reason.status !== "ACTIVE" || reason.type !== payload.type) {
      throw new AppError("Invalid closure reason selected", {
        statusCode: HttpStatus.BAD_REQUEST,
        code: "INVALID_REASON",
      });
    }

    const created = await this.repo.createRequest({
      data: {
        type: payload.type,
        reasonId: payload.reasonId,
        reasonRemark: payload.reasonRemark?.trim() || null,
        status: "PENDING",
        userId,
      },
      include: { reason: { select: { id: true, text: true } } },
    });

    const salutation = getEmailSalutationFromSources(profile);
    const customerName = [profile.firstName, profile.middleName, profile.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();
    const reasonText = created.reason?.text ?? reason.text;
    const reasonRemark = created.reasonRemark;
    const uatPrefix = env.CBRICS_ENV === "UAT" ? "[UAT] " : "";

    // Non-blocking: request is persisted even if either email fails
    try {
      const emailSend = new EmailCommunication();
      await Promise.allSettled([
        emailSend.sendEmail({
          to: profile.emailAddress,
          subject: `${uatPrefix}Acknowledgement of Account Deletion Request`,
          html: meraDhanClosureRequestSubmittedEmailText({
            customerName,
            salutation,
            clientId: profile.userName,
          }),
        }),
        emailSend.sendEmail({
          to: ACCOUNT_CLOSURE_ADMIN_EMAIL,
          subject: `${uatPrefix}Account closure request #${created.id} — ${customerName || profile.emailAddress}`,
          html: meraDhanClosureRequestAdminEmailText({
            requestId: created.id,
            customerId: profile.id,
            customerName: customerName || profile.emailAddress,
            customerEmail: profile.emailAddress,
            customerPhone: profile.phoneNo,
            reasonText,
            reasonRemark,
            submittedAt: created.createdAt,
          }),
        }),
      ]);
    } catch {
      // swallow — emails must never block request creation
    }

    return created;
  }

  async listMyRequests(
    userId: number,
    type?: z.infer<typeof appSchema.customer.listMyServiceRequestsQuerySchema>["type"],
  ) {
    return this.repo.findByUserId(userId, type);
  }
}
