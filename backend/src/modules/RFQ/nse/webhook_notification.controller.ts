import { db } from "@core/database/database";
import { HttpStatus } from "@utils/error/AppError";
import logger from "@utils/logger/logger";
import { type Request, type Response } from "express";

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

    await db.dataBase.nseWebhookNotification.create({
      data: {
        payload: req.body,
        type: "CBRICS",
      },
    });
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
