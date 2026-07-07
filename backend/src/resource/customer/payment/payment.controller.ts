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
    console.log(req.body, req.headers);
    const signature = req.headers["x-razorpay-signature"] as string;

    // Validate signature header
    if (!signature) {
      logger.logError("Webhook received without signature header");
      throw new AppError("Missing webhook signature", {
        statusCode: HttpStatus.BAD_REQUEST,
        code: "WEBHOOK_SIGNATURE_MISSING",
      });
    }

    // With express.text(), req.body is the raw string - use it directly for verification
    const rawBody =
      typeof req.body === "string" ? req.body : JSON.stringify(req.body);

    // Verify signature using raw body string
    const isValid = this.paymentService.verifyWebhookSignature(
      rawBody,
      signature
    );

    // Parse JSON separately for processing
    let body;
    try {
      body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    } catch (parseError) {
      logger.logError("Failed to parse webhook body as JSON", parseError);
      throw new AppError("Invalid webhook body format", {
        statusCode: HttpStatus.BAD_REQUEST,
        code: "WEBHOOK_INVALID_BODY",
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

    console.log(body);


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
      });
      throw new AppError("Invalid webhook signature", {
        statusCode: HttpStatus.BAD_REQUEST,
        code: "WEBHOOK_SIGNATURE_INVALID",
      });
    }

    // Process payment.captured event
    if (body.event === "payment.captured") {
      const paymentEntity = body.payload?.payment?.entity;
      const paymentOrderId = paymentEntity?.order_id as string | undefined;
      const paymentId = paymentEntity?.id as string | undefined;

      try {
        const isNetBanking = paymentEntity?.method == "netbanking";

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

        const shouldQueueSettlement =
          orderResult.status === "success" ||
          orderResult.status === "already_captured";

        // Trigger settlement process as background job
        if (shouldQueueSettlement) {
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

          await this.orderService.updateOrderStatus(order.id, "IN_PROGRESS");
          await this.orderService.updateOrderMetadata(order.id, paymentEntity);

          const settlementJobId = `order-settlement-${order.id}`;
          const existingJob = await orderSettlementQueue.getJob(settlementJobId);
          if (!existingJob) {
            const job = await orderSettlementQueue.add(
              {
                type: "orderSettlement",
                id: order.id,
                paymentOrderId,
                paymentId,
                paymentEntity,
                isNetBanking,
              },
              { jobId: settlementJobId },
            );
            logger.logInfo(
              `Payment captured and settlement job queued for order: ${paymentOrderId}`,
              {
                jobId: job.id,
                captureStatus: orderResult.status,
              },
            );
          } else {
            logger.logInfo(
              `Settlement job already queued for order: ${paymentOrderId}`,
              {
                jobId: existingJob.id,
                captureStatus: orderResult.status,
              },
            );
          }
        }
      } catch (error) {
        const reason =
          error instanceof AppError
            ? `${error.message} (code: ${error.code ?? "none"}, status: ${error.statusCode})`
            : error instanceof Error
              ? error.message
              : String(error);
        logger.logError(`Error processing payment.captured webhook: ${reason}`, {
          paymentOrderId,
          paymentId,
          razorpayEventId: req.headers["x-razorpay-event-id"],
          error,
        });
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
