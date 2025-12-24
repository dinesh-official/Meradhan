import { HttpStatus } from "@utils/error/AppError";
import { type Request, type Response } from "express";

export class NseWebhookController {
  /**
   * Handle CBRICS notification webhook
   * POST /api/webhook/nse/cbrics/notification
   */
  handleCbricsNotification = async (req: Request, res: Response) => {
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
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: {
        status: "ok",
        message: "RFQS notification received and processed",
      },
    });
  };
}
