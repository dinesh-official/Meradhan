import { type Request, type Response } from "express";
import { OrderService } from "@resource/customer/order/order.service";
import { PaymentProviders } from "@packages/config/constants";
import { AppError, HttpStatus } from "@utils/error/AppError";
import { db } from "@core/database/database";
import logger from "@utils/logger/logger";
import { PaymentService } from "./payment.service";

export class PaymentController {
  private paymentService = new PaymentService(PaymentProviders.RAZORPAY);
  private orderService = new OrderService();

  handleWebhook = async (req: Request, res: Response) => {
    const signature = req.headers["x-razorpay-signature"] as string;
    const body = req.body;

    if (!signature) {
      throw new AppError("Missing webhook signature", {
        statusCode: HttpStatus.BAD_REQUEST,
        code: "WEBHOOK_SIGNATURE_MISSING",
      });
    }

    const rawBody = JSON.stringify(body);
    const isValid = this.paymentService.verifyWebhookSignature(
      rawBody,
      signature
    );

    await db.dataBase.webhookLog.create({
      data: {
        provider: PaymentProviders.RAZORPAY,
        eventType: body.event,
        payload: body,
        processed: isValid,
        error: isValid ? null : "Invalid Signature",
      },
    });

    if (!isValid) {
      logger.logError("Invalid webhook signature received");
      throw new AppError("Invalid webhook signature", {
        statusCode: HttpStatus.BAD_REQUEST,
        code: "WEBHOOK_SIGNATURE_INVALID",
      });
    }

    if (body.event === "payment.captured") {
      const paymentEntity = body.payload.payment.entity;
      const paymentOrderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;

      try {
        await this.orderService.captureOrderPayment(paymentOrderId, paymentId);
        logger.logInfo(
          `Payment captured successfully for order: ${paymentOrderId}`
        );
      } catch (error) {
        logger.logError("Error capturing payment from webhook:", error);
      }
    }

    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: { status: "ok", event: body.event },
    });
  };
}
