import { type Request, type Response } from "express";
import { OrderService } from "@resource/customer/order/order.service";
import { AppError, HttpStatus } from "@utils/error/AppError";
import { db } from "@core/database/database";
import logger from "@utils/logger/logger";
import { PaymentService } from "./payment.service";
import { orderSettlementQueue } from "@jobs/queue/worker_queues";

export class PaymentController {
  private paymentService = new PaymentService();
  private orderService = new OrderService();

  handleWebhook = async (req: Request, res: Response) => {
    const signature = req.headers["x-razorpay-signature"] as string;
    console.log("Signature", signature);
    console.log("Body", req.body);

    const body = req.body;
    const rawBody = (req as Request & { rawBody?: string }).rawBody;

    // Validate signature header
    if (!signature) {
      logger.logError("Webhook received without signature header");
      throw new AppError("Missing webhook signature", {
        statusCode: HttpStatus.BAD_REQUEST,
        code: "WEBHOOK_SIGNATURE_MISSING",
      });
    }

    // Validate body structure
    if (!body || typeof body !== "object") {
      logger.logError("Invalid webhook body structure");
      throw new AppError("Invalid webhook body", {
        statusCode: HttpStatus.BAD_REQUEST,
        code: "WEBHOOK_INVALID_BODY",
      });
    }

    // Use raw body for signature verification if available, otherwise fallback to stringified
    const bodyForVerification = rawBody || JSON.stringify(body);
    const isValid = this.paymentService.verifyWebhookSignature(
      bodyForVerification,
      signature
    );

    // Log webhook attempt
    try {
      await db.dataBase.webhookLog.create({
        data: {
          provider: "RAZORPAY",
          eventType: body.event || "unknown",
          payload: body,
          processed: isValid,
          error: isValid ? null : "Invalid Signature",
        },
      });
    } catch (dbError) {
      logger.logError("Failed to log webhook to database:", dbError);
      // Continue processing even if logging fails
    }

    if (!isValid) {
      logger.logError("Invalid webhook signature received", {
        event: body.event,
        hasRawBody: !!rawBody,
      });
      throw new AppError("Invalid webhook signature", {
        statusCode: HttpStatus.BAD_REQUEST,
        code: "WEBHOOK_SIGNATURE_INVALID",
      });
    }

    // Process payment.captured event
    if (body.event === "payment.captured") {
      try {
        const paymentEntity = body.payload?.payment?.entity;

        if (!paymentEntity) {
          logger.logError("Payment entity missing in webhook payload");
          return res.sendResponse({
            statusCode: HttpStatus.OK,
            responseData: {
              status: "ok",
              event: body.event,
              message: "Payment entity missing, webhook logged",
            },
          });
        }

        const paymentOrderId = paymentEntity.order_id;
        const paymentId = paymentEntity.id;

        if (!paymentOrderId || !paymentId) {
          logger.logError("Missing payment order ID or payment ID in webhook");
          return res.sendResponse({
            statusCode: HttpStatus.OK,
            responseData: {
              status: "ok",
              event: body.event,
              message: "Missing payment identifiers, webhook logged",
            },
          });
        }

        const orderResult = await this.orderService.captureOrderPayment(
          paymentOrderId,
          paymentId
        );

        console.log("Order Result", orderResult);

        // Trigger settlement process as background job
        if (orderResult.status === "success") {
          const order =
            await this.orderService.getOrderByPaymentOrderId(paymentOrderId);
          if (!order) {
            logger.logError("Order not found for payment order ID", {
              paymentOrderId,
            });
            return res.sendResponse({
              statusCode: HttpStatus.OK,
              responseData: { status: "ok", event: body.event },
            });
          }

          await this.orderService.updateOrderStatus(order.id, "APPLIED");
          await this.orderService.updateOrderMetadata(order.id, paymentEntity);
          const job = await orderSettlementQueue.add(
            `settle-order:${order.id}`,
            {
              id: order.id,
              paymentOrderId,
              paymentId,
              paymentEntity,
            }
          );
          logger.logInfo(
            `Payment captured and settlement job queued for order: ${paymentOrderId}`,
            {
              jobId: job.id,
            }
          );
        }
      } catch (error) {
        console.log(error);

        logger.logError("Error processing payment.captured webhook:", error);
        // Return success to Razorpay even if processing fails
        // This prevents Razorpay from retrying, and we can handle the error internally
        return res.sendResponse({
          statusCode: HttpStatus.OK,
          responseData: {
            status: "ok",
            event: body.event,
            message: "Webhook received but processing failed",
          },
        });
      }
    }

    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: { status: "ok", event: body.event },
    });
  };
}
