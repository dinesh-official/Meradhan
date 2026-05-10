import { db } from "@core/database/database";
import { HttpStatus } from "@utils/error/AppError";
import logger from "@utils/logger/logger";
import { type Request, type Response } from "express";
import { sendKycApprovedEmail } from "@jobs/helper/send_emails";
import { sendDealSheetPdfByOrderId } from "@services/notifications/send_deal_sheet_nyOrderId";

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
    await db.dataBase.nseCbricsNotification.create({
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
          const actualStatus = item.actualStatus;
          const approved = actualStatus === 4 || String(actualStatus ?? "") === "4";

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
            },
          });
          if (!customer) continue;
          if (customer.kycStatus === "VERIFIED") continue;

          await db.dataBase.customerProfileDataModel.update({
            where: { id: customer.id },
            data: {
              kycStatus: "VERIFIED",
              kraStatus: "VERIFIED",
              verifyDate: new Date(),
            },
          });

          if (customer.emailAddress) {
            const fullName =
              `${customer.firstName ?? ""} ${customer.lastName ?? ""}`.trim() ||
              "Customer";
            const title =
              customer.gender === "MALE"
                ? ("Mr." as const)
                : customer.gender === "FEMALE"
                  ? ("Ms." as const)
                  : undefined;
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
    console.log(payload?.settleOrderList?.[0]?.orderNumber);

    try {
      if (payload?.settleOrderList?.[0]?.orderNumber) {
        if (payload?.settleOrderList?.[0]?.settleStatus == 4) {
          const orderNumber = Number(payload?.settleOrderList?.[0].orderNumber);
          const order = await db.dataBase.order.findFirst({
            where: {
              reqOrderNumber: orderNumber.toString()
            }
          })
          if (!order) {
            console.warn("No Order from our system " + orderNumber);
            return;
          }
          await db.dataBase.order.updateMany({
            where: {
              reqOrderNumber: orderNumber.toString()
            },
            data: {
              status: "SETTLED"
            }
          })

          await sendDealSheetPdfByOrderId({ orderId: orderNumber })

          console.log("Deal Sheet Send Successfully");
        }
      }
    } catch (error) {
      console.error((error as Error)?.message);
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
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: {
        status: "ok",
        message: "RFQS notification received and processed",
      },
    });
  };
}
