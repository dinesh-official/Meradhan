import { env } from "@packages/config/src/env";
import { AppError, HttpStatus } from "@utils/error/AppError";
import logger from "@utils/logger/logger";
import crypto from "crypto";
import Razorpay from "razorpay";
import type { Orders } from "razorpay/dist/types/orders";

// Type definitions for payment responses
export interface PaymentOrderResponse {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
  created_at: number;
}

export class PaymentService {
  private razorpay: Razorpay;
  private keySecret: string;
  private webhookSecret: string;

  constructor() {
    if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
      logger.logError("Razorpay credentials missing in configuration");
      throw new AppError("Payment gateway configuration incomplete", {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        code: "PAYMENT_CONFIG_ERROR",
      });
    }

    if (!env.RAZORPAY_WEBHOOK_SECRET) {
      logger.logError("Razorpay webhook secret missing in configuration");
      throw new AppError("Payment gateway webhook configuration incomplete", {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        code: "PAYMENT_WEBHOOK_CONFIG_ERROR",
      });
    }

    try {
      this.razorpay = new Razorpay({
        key_id: env.RAZORPAY_KEY_ID,
        key_secret: env.RAZORPAY_KEY_SECRET,
      });
      this.keySecret = env.RAZORPAY_KEY_SECRET;
      this.webhookSecret = env.RAZORPAY_WEBHOOK_SECRET;
    } catch (error) {
      logger.logError("Failed to initialize Razorpay:", error);
      throw new AppError("Failed to initialize payment gateway", {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        code: "PAYMENT_INIT_ERROR",
      });
    }
  }

  async createOrder(
    amount: number,
    currency: string = "INR",
    receipt: string,
    bank?: Orders.RazorpayOrderCreateRequestBody["bank_account"]
  ): Promise<PaymentOrderResponse> {
    if (amount <= 0) {
      throw new AppError("Invalid payment amount", {
        statusCode: HttpStatus.BAD_REQUEST,
        code: "INVALID_AMOUNT",
      });
    }

    if (!receipt || receipt.trim().length === 0) {
      throw new AppError("Receipt identifier is required", {
        statusCode: HttpStatus.BAD_REQUEST,
        code: "INVALID_RECEIPT",
      });
    }

    const options: Orders.RazorpayOrderCreateRequestBody = {
      amount: Math.round(amount * 100), // amount in paisa
      currency,
      receipt,
      // method: "netbanking",
      bank_account: bank,
    };
    console.log(options);

    try {
      logger.logInfo(
        `Creating payment order: ${receipt}, Amount: ${amount} ${currency}`
      );
      const order = await this.razorpay.orders.create(options);

      logger.logInfo(`Payment order created successfully: ${order.id}`);
      return order as PaymentOrderResponse;
    } catch (error: unknown) {
      logger.logError("Razorpay Create Order Error:", {
        error: (error as Error).message,
        receipt,
        amount,
        currency,
        stack: (error as Error)?.stack,
      });

      throw error;
    }
  }

  verifySignature(
    orderId: string,
    paymentId: string,
    signature: string
  ): boolean {
    if (!orderId || !paymentId || !signature) {
      logger.logError(
        "Missing required parameters for signature verification",
        {
          hasOrderId: !!orderId,
          hasPaymentId: !!paymentId,
          hasSignature: !!signature,
        }
      );
      return false;
    }

    try {
      const body = `${orderId}|${paymentId}`;
      const expectedSignature = crypto
        .createHmac("sha256", this.keySecret)
        .update(body)
        .digest("hex");

      const isValid = expectedSignature === signature;

      if (!isValid) {
        logger.logError("Payment signature verification failed", {
          orderId,
          paymentId,
        });
      }

      return isValid;
    } catch (error) {
      logger.logError("Error during signature verification:", error);
      return false;
    }
  }

  verifyWebhookSignature(body: string, signature: string): boolean {
    if (!body || !signature) {
      logger.logError(
        "Missing required parameters for webhook signature verification",
        {
          hasBody: !!body,
          hasSignature: !!signature,
        }
      );
      return false;
    }

    if (!this.webhookSecret) {
      logger.logError("Webhook secret not configured");
      return false;
    }

    try {
      const expectedSignature = crypto
        .createHmac("sha256", this.webhookSecret)
        .update(body)
        .digest("hex");

      const isValid = expectedSignature === signature;

      if (!isValid) {
        logger.logError("Webhook signature verification failed", {
          expectedLength: expectedSignature.length,
          receivedLength: signature.length,
        });
      }

      return isValid;
    } catch (error) {
      logger.logError("Error during webhook signature verification:", error);
      return false;
    }
  }
}
