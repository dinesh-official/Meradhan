import { db } from "@core/database/database";
import { HttpStatus } from "@utils/error/AppError";
import { type Request, type Response } from "express";

export class NseWebhookController {
  /**
   * Handle CBRICS notification webhook
   * POST /api/webhook/nse/cbrics/notification
   */
  handleCbricsNotification = async (req: Request, res: Response) => {
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
   */
  handleRfqsNotification = async (req: Request, res: Response) => {
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
