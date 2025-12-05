import Razorpay from "razorpay";
import { config } from "@config/config";
import { PaymentProviders } from "@packages/config/constants";
import { AppError, HttpStatus } from "@utils/error/AppError";
import logger from "@utils/logger/logger";
import crypto from "crypto";

// Type definitions for payment responses
export interface PaymentOrderResponse {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
  created_at: number;
}

export interface PaymentProviderConfig {
  keyId: string;
  keySecret: string;
  webhookSecret: string;
}

export type PaymentProviderType =
  (typeof PaymentProviders)[keyof typeof PaymentProviders];

// Provider-specific implementations
class RazorpayProvider {
  private instance: Razorpay;
  private config: PaymentProviderConfig;

  constructor(providerConfig: PaymentProviderConfig) {
    this.config = providerConfig;

    if (!providerConfig.keyId || !providerConfig.keySecret) {
      logger.logError("Razorpay credentials missing in configuration");
      throw new AppError("Payment gateway configuration incomplete", {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        code: "PAYMENT_CONFIG_ERROR",
      });
    }

    try {
      this.instance = new Razorpay({
        key_id: providerConfig.keyId,
        key_secret: providerConfig.keySecret,
      });
      // logger.logInfo("Razorpay provider initialized successfully");
    } catch (error) {
      logger.logError("Failed to initialize Razorpay provider:", error);
      throw new AppError("Failed to initialize payment gateway", {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        code: "PAYMENT_INIT_ERROR",
      });
    }
  }

  async createOrder(
    amount: number,
    currency: string = "INR",
    receipt: string
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

    const options = {
      amount: Math.round(amount * 100), // amount in paisa
      currency,
      receipt,
    };

    try {
      logger.logInfo(
        `Creating payment order: ${receipt}, Amount: ${amount} ${currency}`
      );
      const order = await this.instance.orders.create(options);

      logger.logInfo(`Payment order created successfully: ${order.id}`);
      return order as PaymentOrderResponse;
    } catch (error: unknown) {
      console.log(error);
      logger.logError("Razorpay Create Order Error:", {
        error: (error as Error).message,
        receipt,
        amount,
        currency,
        stack: (error as Error)?.stack,
      });

      // Handle error
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
        .createHmac("sha256", this.config.keySecret)
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
        "Missing required parameters for webhook signature verification"
      );
      return false;
    }

    try {
      const expectedSignature = crypto
        .createHmac("sha256", this.config.webhookSecret)
        .update(body)
        .digest("hex");

      const isValid = expectedSignature === signature;

      if (!isValid) {
        logger.logError("Webhook signature verification failed");
      }

      return isValid;
    } catch (error) {
      logger.logError("Error during webhook signature verification:", error);
      return false;
    }
  }
}

// Generic Payment Service Interface
export interface PaymentProvider {
  createOrder(
    amount: number,
    currency: string,
    receipt: string
  ): Promise<PaymentOrderResponse>;
  verifySignature(
    orderId: string,
    paymentId: string,
    signature: string
  ): boolean;
  verifyWebhookSignature(body: string, signature: string): boolean;
}

// Factory function for creating payment providers
function createPaymentProvider(
  provider: PaymentProviderType,
  providerConfig: PaymentProviderConfig
): PaymentProvider {
  switch (provider) {
    case PaymentProviders.RAZORPAY:
      return new RazorpayProvider(providerConfig);
    default:
      logger.logError(`Unsupported payment provider requested: ${provider}`);
      throw new AppError(`Unsupported payment provider: ${provider}`, {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        code: "UNSUPPORTED_PAYMENT_PROVIDER",
      });
  }
}

export class PaymentService {
  private provider: PaymentProvider;
  private providerType: PaymentProviderType;

  constructor(provider: PaymentProviderType = PaymentProviders.RAZORPAY) {
    this.providerType = provider;

    try {
      const providerConfig: PaymentProviderConfig = {
        keyId: config.razorpay.keyId,
        keySecret: config.razorpay.keySecret,
        webhookSecret: config.razorpay.webhookSecret,
      };

      this.provider = createPaymentProvider(provider, providerConfig);
      logger.logInfo(`PaymentService initialized with provider: ${provider}`);
    } catch (error) {
      logger.logError(
        `Failed to initialize PaymentService with provider ${provider}:`,
        error
      );
      throw error; // Re-throw AppError from factory
    }
  }

  async createOrder(
    amount: number,
    currency: string = "INR",
    receipt: string
  ): Promise<PaymentOrderResponse> {
    return this.provider.createOrder(amount, currency, receipt);
  }

  verifySignature(
    orderId: string,
    paymentId: string,
    signature: string
  ): boolean {
    return this.provider.verifySignature(orderId, paymentId, signature);
  }

  verifyWebhookSignature(body: string, signature: string): boolean {
    return this.provider.verifyWebhookSignature(body, signature);
  }

  getProviderType(): PaymentProviderType {
    return this.providerType;
  }
}
