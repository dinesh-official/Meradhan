import { db } from "@core/database/database";
import { HttpStatus } from "@utils/error/AppError";
import logger from "@utils/logger/logger";
import { type Request, type Response } from "express";
import { sendKycApprovedEmail } from "@jobs/helper/send_emails";
import { processCbricsSettlementWebhook } from "@services/notifications/cbrics_settlement_webhook.service";
import { getOptionalEmailTitleFromSources } from "@root/schema";
import { kraStatusFromCbricsWorkflowStatus } from "./cbrics_workflow_kra_map";

const kraStatusFromWorkflowStatus = kraStatusFromCbricsWorkflowStatus;

export class NseWebhookController {
  /**
   * Handle CBRICS notification webhook
   * POST /api/webhook/nse/cbrics/notification
   *
   * SECURITY: ⚠️ TODO - Add signature verification before processing webhook payload
   * Currently accepts webhooks without signature verification, which is a security risk.
   * Should verify webhook signature using NSE-provided secret before parsing/acting on payload.
   * Consider implementing:
   * - Signature verification using HMAC or similar method
   * - IP whitelisting for NSE webhook sources
   * - Rate limiting specific to webhook endpoints
   */
  handleCbricsNotification = async (req: Request, res: Response) => {
    // TODO: Verify webhook signature before processing
    // const signature = req.headers["x-nse-signature"] as string;
    // if (!this.verifyWebhookSignature(req.body, signature)) {
    //   logger.logError("NSE CBRICS webhook signature verification failed");
    //   throw new AppError("Invalid webhook signature", {
    //     statusCode: HttpStatus.BAD_REQUEST,
    //     code: "WEBHOOK_SIGNATURE_INVALID",
    //   });
    // }

    logger.logInfo("NSE CBRICS webhook received", {
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    const payload = req.body;
    await db.dataBase.nseWebhookNotification.create({
      data: {
        payload,
        type: "CBRICS",
      },
    });

    // KYC approved hook: CBRICS can notify unregistered participant approval via `unregList`.
    // Only treat actualStatus == 4 as approved and transition customer KYC to VERIFIED (once).
    try {
      const unregList = (payload as { unregList?: Array<Record<string, unknown>> })?.unregList;
      if (Array.isArray(unregList) && unregList.length) {
        for (const item of unregList) {
          const loginId = typeof item.loginId === "string" ? item.loginId : undefined;
          const actualStatus = item.workflowStatus;
          const approved = actualStatus == 1;

          if (!approved || !loginId) continue;

          const customer = await db.dataBase.customerProfileDataModel.findFirst({
            where: { userName: loginId },
            select: {
              id: true,
              kycStatus: true,
              emailAddress: true,
              firstName: true,
              lastName: true,
              gender: true,
              kraStatus: true,
              panCard: { select: { gender: true } },
              aadhaarCard: { select: { gender: true } },
            },
          });
          if (!customer) continue;
          if (customer.kraStatus === "VERIFIED") continue;

          await db.dataBase.customerProfileDataModel.update({
            where: { id: customer.id },
            data: {
              kraStatus: kraStatusFromWorkflowStatus(actualStatus),
              verifyDate: new Date(),
            },
          });

          if (customer.emailAddress) {
            const fullName =
              `${customer.firstName ?? ""} ${customer.lastName ?? ""}`.trim() ||
              "Customer";
            const title = getOptionalEmailTitleFromSources(customer);
            await sendKycApprovedEmail({
              customerId: customer.id,
              email: customer.emailAddress,
              customerFullName: fullName,
              title,
              loginLink: "https://www.meradhan.co/login",
            });
          }
        }
      }



    } catch (e) {
      logger.logError("CBRICS webhook: KYC approved hook failed", { error: e });
    }
    try {
      const settlementResult = await processCbricsSettlementWebhook(payload);
      if (settlementResult.processed) {
        logger.logInfo("CBRICS settlement webhook processed", settlementResult);
      }
    } catch (error) {
      logger.logError("CBRICS settlement webhook failed", {
        error: error instanceof Error ? error.message : error,
      });
    }

    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: {
        status: "ok",
        message: "CBRICS notification received and processed",
      },
    });
  };

  /**
   * Handle RFQS notification webhook
   * POST /api/webhook/nse/rfqs/notification
   *
   * SECURITY: ⚠️ TODO - Add signature verification before processing webhook payload
   * Currently accepts webhooks without signature verification, which is a security risk.
   * Should verify webhook signature using NSE-provided secret before parsing/acting on payload.
   * Consider implementing:
   * - Signature verification using HMAC or similar method
   * - IP whitelisting for NSE webhook sources
   * - Rate limiting specific to webhook endpoints
   */
  handleRfqsNotification = async (req: Request, res: Response) => {
    // TODO: Verify webhook signature before processing
    // const signature = req.headers["x-nse-signature"] as string;
    // if (!this.verifyWebhookSignature(req.body, signature)) {
    //   logger.logError("NSE RFQS webhook signature verification failed");
    //   throw new AppError("Invalid webhook signature", {
    //     statusCode: HttpStatus.BAD_REQUEST,
    //     code: "WEBHOOK_SIGNATURE_INVALID",
    //   });
    // }

    logger.logInfo("NSE RFQS webhook received", {
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    await db.dataBase.nseWebhookNotification.create({
      data: {
        payload: req.body,
        type: "RFQ",
      },
    });

    // Some NSE environments post settlement rows on the RFQS callback URL.
    const payload = req.body;
    if (
      payload &&
      typeof payload === "object" &&
      Array.isArray((payload as { settleOrderList?: unknown }).settleOrderList) &&
      (payload as { settleOrderList: unknown[] }).settleOrderList.length > 0
    ) {
      try {
        const settlementResult = await processCbricsSettlementWebhook(payload);
        if (settlementResult.processed) {
          logger.logInfo("RFQS webhook settlement processed", settlementResult);
        }
      } catch (error) {
        logger.logError("RFQS webhook settlement failed", {
          error: error instanceof Error ? error.message : error,
        });
      }
    }

    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: {
        status: "ok",
        message: "RFQS notification received and processed",
      },
    });
  };
}
