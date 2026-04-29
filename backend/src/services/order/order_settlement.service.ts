import type {
  NseCbricsParticipantModel,
  Order,
  OrderLogs,
  Prisma,
} from "@databases/generated/prisma/postgres";
import { OrderStatus } from "@databases/generated/prisma/postgres";
import {
  NSE_CONSTANTS,
  SettlementStep,
  SettlementStatus,
} from "@packages/config/constants";
import { NseCBRICS } from "@modules/RFQ/nse/nse_CBRICS";
import { NseRfq } from "@modules/RFQ/nse/nse_RFQ";
import { RfqMasterDbSyncManager } from "@resource/crm/refq/nse/rfq_master/rfq_master.manager";
import { OrderService } from "@resource/customer/order/order.service";
import { AppError } from "@utils/error/AppError";
import logger from "@utils/logger/logger";
import { db } from "@core/database/database";
import type { BondDetailsResponse } from "@packages/apiGateway";
import { env } from "@packages/config/src/env";
import { makeRazorpayRouteTransition } from "@services/razorpay-route/RPay-route";
import crypto from "crypto";

// Type definitions for settlement service
interface OrderWithNSEData extends Omit<Order, "customerProfile"> {
  customerProfile: {
    nseDataSet?: {
      participant: NseCbricsParticipantModel;
    } | null;
  } | null;
  orderLogs?: OrderLogs[];
}

export class OrderSettlementService {
  nseRfq: NseRfq;
  nseCbrics: NseCBRICS;
  orderService: OrderService;
  rfqMasterDbSyncManager: RfqMasterDbSyncManager;
  constructor() {
    this.nseRfq = new NseRfq();
    this.nseCbrics = new NseCBRICS();
    this.orderService = new OrderService();
    this.rfqMasterDbSyncManager = new RfqMasterDbSyncManager();
  }

  private buildBatchId(paymentId: string, orderId: number) {
    return `${paymentId || `order-${orderId}`}-${crypto.randomUUID().slice(0, 8)}`;
  }

  private async addAutomationLog(params: {
    orderId?: number | null;
    paymentId: string;
    batchId: string;
    step: string;
    status: string;
    message?: string;
    inputData?: Record<string, unknown>;
    outputData?: Record<string, unknown>;
    errorData?: Record<string, unknown>;
    startedAt?: Date;
    completedAt?: Date;
  }) {
    const isTerminal = params.status === "SUCCESS" || params.status === "FAILED";
    const isBatchTerminal =
      params.step === "SETTLEMENT_BATCH" &&
      (params.status === "SUCCESS" || params.status === "FAILED");

    if (isTerminal || isBatchTerminal) {
      const existing = await db.dataBase.orderSettlementAutomationLog.findFirst({
        where: {
          paymentId: params.paymentId,
          batchId: params.batchId,
          step: params.step,
          status: { in: ["IN_PROGRESS", "STARTED"] },
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      });

      if (existing) {
        await db.dataBase.orderSettlementAutomationLog.update({
          where: { id: existing.id },
          data: {
            orderId: params.orderId ?? existing.orderId ?? null,
            status: params.status,
            message: params.message ?? existing.message,
            inputData:
              (params.inputData as Prisma.InputJsonValue | undefined) ??
              (existing.inputData as Prisma.InputJsonValue | undefined),
            outputData: params.outputData as Prisma.InputJsonValue | undefined,
            errorData: params.errorData as Prisma.InputJsonValue | undefined,
            startedAt: params.startedAt ?? existing.startedAt ?? undefined,
            completedAt: params.completedAt ?? new Date(),
          },
        });
        return;
      }
    }

    await db.dataBase.orderSettlementAutomationLog.create({
      data: {
        orderId: params.orderId ?? null,
        paymentId: params.paymentId,
        batchId: params.batchId,
        step: params.step,
        status: params.status,
        message: params.message,
        inputData: params.inputData as Prisma.InputJsonValue | undefined,
        outputData: params.outputData as Prisma.InputJsonValue | undefined,
        errorData: params.errorData as Prisma.InputJsonValue | undefined,
        startedAt: params.startedAt,
        completedAt: params.completedAt,
      },
    });
  }

  private async runWithAutomationLog<T>(params: {
    orderId: number;
    paymentId: string;
    batchId: string;
    step: string;
    message: string;
    inputData?: Record<string, unknown>;
    fn: () => Promise<T>;
  }): Promise<T> {
    const startedAt = new Date();
    await this.addAutomationLog({
      orderId: params.orderId,
      paymentId: params.paymentId,
      batchId: params.batchId,
      step: params.step,
      status: "IN_PROGRESS",
      message: params.message,
      inputData: params.inputData,
      startedAt,
    });

    try {
      const result = await params.fn();
      await this.addAutomationLog({
        orderId: params.orderId,
        paymentId: params.paymentId,
        batchId: params.batchId,
        step: params.step,
        status: "SUCCESS",
        message: `${params.message} completed`,
        inputData: params.inputData,
        outputData:
          result && typeof result === "object"
            ? (result as Record<string, unknown>)
            : { value: result as unknown as string | number | boolean | null },
        startedAt,
        completedAt: new Date(),
      });
      return result;
    } catch (error) {
      await this.addAutomationLog({
        orderId: params.orderId,
        paymentId: params.paymentId,
        batchId: params.batchId,
        step: params.step,
        status: "FAILED",
        message: `${params.message} failed`,
        inputData: params.inputData,
        errorData: {
          error: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
        },
        startedAt,
        completedAt: new Date(),
      });
      throw error;
    }
  }

  async initiateOrderSettlement(orderId: number, isNetBanking: boolean): Promise<void> {
    let paymentIdForBatch = `order-${orderId}`;
    let batchId: string | null = null;
    try {
      const getOrderData = async () => {
        return await this.orderService.getOrderWithNSEData(orderId);
      };

      const order = await getOrderData();

      if (!order) {
        throw new AppError("Order not found", { code: "ORDER_NOT_FOUND" });
      }

      if (!order?.customerProfile?.nseDataSet?.participant) {
        throw new AppError("NSE participant data not found for customer", {
          code: "NSE_PARTICIPANT_NOT_FOUND",
        });
      }

      const paymentId = order.paymentId ?? `order-${order.id}`;
      paymentIdForBatch = paymentId;
      batchId = this.buildBatchId(paymentId, order.id);

      await this.addAutomationLog({
        orderId: order.id,
        paymentId,
        batchId,
        step: "SETTLEMENT_BATCH",
        status: "STARTED",
        message: "Settlement batch initiated",
        inputData: {
          orderId: order.id,
          isNetBanking,
          paymentId: order.paymentId,
        },
        startedAt: new Date(),
      });

      console.log("add isin to settlement");
      const addIsinResponse = await this.runWithAutomationLog({
        orderId: order.id,
        paymentId,
        batchId,
        step: SettlementStep.ADD_ISIN,
        message: "Add ISIN to settlement",
        inputData: { isin: order.isin, quantity: order.quantity },
        fn: () => this.addIsinToSettlement(order, { paymentId }),
      });
      await new Promise((resolve) => setTimeout(resolve, 10000));

      console.log("accepted negotiation");
      // Step 2: Accept negotiation quote
      await this.runWithAutomationLog({
        orderId: order.id,
        paymentId,
        batchId,
        step: SettlementStep.ACCEPT_NEGOTIATION,
        message: "Accept negotiation",
        inputData: { inCrores: addIsinResponse.inCrores, rfqNumber: addIsinResponse.rfqNumber },
        fn: () => this.acceptNegotiation(order, addIsinResponse.inCrores),
      });
      await new Promise((resolve) => setTimeout(resolve, 10000));

      console.log("propose deal");
      // Step 3: Propose deal
      await this.runWithAutomationLog({
        orderId: order.id,
        paymentId,
        batchId,
        step: SettlementStep.PROPOSE_DEAL,
        message: "Propose deal",
        inputData: { orderId: order.id },
        fn: () => this.proposeDeal(order),
      });
      await new Promise((resolve) => setTimeout(resolve, 10000));

      console.log("accept or reject deal");
      // Step 4: Accept/Reject deal
      await this.runWithAutomationLog({
        orderId: order.id,
        paymentId,
        batchId,
        step: SettlementStep.ACCEPT_OR_REJECT_DEAL,
        message: "Accept or reject deal",
        inputData: { orderId: order.id },
        fn: () => this.acceptOrRejectDeal(order),
      });

      console.log("update order status");
      await this.runWithAutomationLog({
        orderId: order.id,
        paymentId,
        batchId,
        step: SettlementStep.UPDATE_ORDER_STATUS,
        message: "Update order status",
        inputData: { status: OrderStatus.SETTLED },
        fn: () => this.updateOrderStatus(orderId),
      });
      if (isNetBanking) {
        await this.runWithAutomationLog({
          orderId: order.id,
          paymentId,
          batchId,
          step: "RAZORPAY_ROUTE_TRANSFER",
          message: "Create Razorpay route transfer",
          inputData: {
            amount: Number(order.totalAmount),
            payId: order.paymentId || "",
            userId: order.customerProfileId,
            rfqNumber: addIsinResponse.rfqNumber,
          },
          fn: () =>
            makeRazorpayRouteTransition({
              amount: Number(order.totalAmount),
              payId: order.paymentId || "",
              userId: order.customerProfileId,
              notes: {
                rfqNumber: addIsinResponse.rfqNumber,
              }
            }),
        });
      }

      await this.addAutomationLog({
        orderId: order.id,
        paymentId,
        batchId,
        step: "SETTLEMENT_BATCH",
        status: "SUCCESS",
        message: "Settlement batch completed",
        outputData: {
          rfqNumber: addIsinResponse.rfqNumber,
          isNetBanking,
        },
        completedAt: new Date(),
      });

      // Ensure no stale IN_PROGRESS/STARTED entries remain after a successful batch.
      await db.dataBase.orderSettlementAutomationLog.updateMany({
        where: {
          paymentId,
          batchId,
          status: { in: ["IN_PROGRESS", "STARTED"] },
        },
        data: {
          status: "SUCCESS",
          message: "Auto-marked success after batch completion",
          completedAt: new Date(),
        },
      });
    } catch (error) {
      logger.logError(`Settlement process failed for order ${orderId}:`, error);

      const order = await this.orderService.getOrderWithNSEData(orderId).catch(() => null);
      const paymentId = order?.paymentId ?? paymentIdForBatch;
      const finalBatchId = batchId ?? this.buildBatchId(paymentId, orderId);

      // Update order status to failed settlement
      await this.orderService.updateOrderStatus(orderId, OrderStatus.REJECTED);

      // Log settlement failure
      await this.orderService.addOrderLog(
        orderId,
        SettlementStep.UPDATE_ORDER_STATUS,
        SettlementStatus.FAILED,
        { failedAt: new Date().toISOString() },
        {
          error: error instanceof Error ? error.message : "Unknown error",
          errorStack: error instanceof Error ? error.stack : undefined,
        }
      );

      await this.addAutomationLog({
        orderId,
        paymentId,
        batchId: finalBatchId,
        step: "SETTLEMENT_BATCH",
        status: "FAILED",
        message: "Settlement batch failed",
        errorData: {
          error: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
        },
        completedAt: new Date(),
      });

      // Mark any remaining IN_PROGRESS/STARTED entries as FAILED for easier tracking.
      await db.dataBase.orderSettlementAutomationLog.updateMany({
        where: {
          paymentId,
          batchId: finalBatchId,
          status: { in: ["IN_PROGRESS", "STARTED"] },
        },
        data: {
          status: "FAILED",
          message: "Auto-marked failed after batch failure",
          completedAt: new Date(),
        },
      });

      throw error;
    }
  }

  /**
   * Step 1: Add ISIN to RFQ (addisin)
   */
  async addIsinToSettlement(order: OrderWithNSEData, { paymentId }: { paymentId: string }) {
    try {
      logger.logInfo(
        `Creating RFQ for ISIN ${order.isin} for order ${order.id}`
      );
      console.log("order", order);

      // Using fixed values from the working payload

      const value = Number(order.faceValue) * Number(order.quantity);
      const inCrores = value / 10000000;

      const bond = (order.bondDetails as unknown as BondDetailsResponse);


      // Create RFQ for the ISIN using the working payload structure
      const rfqResponse = await this.nseRfq.createRfq({
        segment: "R",
        isin: order.isin,
        participantCode: env.CBRICS_DOMAIN,
        dealType: "D",
        clientCode: env.CBRICS_DOMAIN,
        buySell: "B",
        quoteType: "Y",
        settlementType: 1,
        value: inCrores,
        quantity: order.quantity,
        yieldType: "YTM",
        yield: Number(bond.yield),
        calcMethod: "O",
        gtdFlag: "Y",
        quoteNegotiable: "Y",
        access: 2,
        participantList: [env.CBRICS_DOMAIN],
        valueNegotiable: "Y",
        remarks: `PG Reference Number : ${paymentId}`
      });

      console.log("rfqResponse", rfqResponse);

      // Store RFQ details in order logs (rfqResponse is an array)
      const rfqDetails = rfqResponse[0];
      if (!rfqDetails) {
        throw new AppError("RFQ response is empty", {
          code: "RFQ_RESPONSE_EMPTY",
        });
      }

      await this.orderService.addOrderLog(
        order.id,
        SettlementStep.ADD_ISIN,
        SettlementStatus.SUCCESS,
        { rfqNumber: rfqDetails.number },
        { rfqResponse: rfqDetails }
      );

      logger.logInfo(
        `RFQ created successfully for ISIN ${order.isin} with RFQ number: ${rfqDetails.number}`
      );
      return {
        inCrores,
        rfqNumber: rfqDetails.number,
        participant: order.customerProfile?.nseDataSet?.participant,
        isin: order.isin,
        quantity: order.quantity,
        unitPrice: order.unitPrice,
        value: value,
      };
    } catch (error) {
      console.log(error);
      logger.logError(
        `Failed to create RFQ for ISIN ${order.isin} for order ${order.id}:`,
        error
      );
      throw new AppError("Failed to add ISIN to settlement", {
        code: "ADD_ISIN_FAILED",
      });
    }
  }

  /**
   * Step 2: Accept negotiation (real API call)
   */
  private async acceptNegotiation(
    order: OrderWithNSEData,
    inCrores: number
    // participant: NseCbricsParticipantModel
  ): Promise<void> {
    let rfqNumber: string | undefined;
    try {
      logger.logInfo(`Accepting negotiation for order ${order.id}`);

      // Get RFQ number from logs
      rfqNumber = await this.getRfqNumber(order);
      if (!rfqNumber) {
        throw new AppError("RFQ number not found in order logs", {
          code: "RFQ_NUMBER_MISSING",
        });
      }


      // Accept the negotiation with hardcoded values (matching RFQ creation)
      // Using direct acceptance (id: null) since no negotiations exist in test environment
      const negotiationResponse = await this.nseRfq.acceptNegotiationQuote({
        rfqNumber: rfqNumber,
        acceptedValue: inCrores,
        role: NSE_CONSTANTS.ROLE.INITIATOR,
        respDealType: "B",
        respClientCode: order.customerProfile?.nseDataSet?.participant?.loginId,
      });

      // Store negotiation ID in logs
      await this.orderService.addOrderLog(
        order.id,
        SettlementStep.ACCEPT_NEGOTIATION,
        SettlementStatus.SUCCESS,
        { negotiationId: negotiationResponse.id },
        { negotiation: negotiationResponse }
      );

      logger.logInfo(`Negotiation accepted successfully for order ${order.id}`);
    } catch (error) {
      logger.logError(
        `Failed to accept negotiation for order ${order.id}, RFQ: ${rfqNumber || "unknown"}:`,
        error
      );

      throw new AppError("Failed to accept negotiation", {
        code: "NEGOTIATION_ACCEPT_FAILED",
      });
    }
  }

  /**
   * Step 3: Propose deal (POST /rest/v1/deal/propose)
   */
  private async proposeDeal(
    order: OrderWithNSEData
    // participant: NseCbricsParticipantModel
  ): Promise<void> {
    try {
      logger.logInfo(`Proposing deal for order ${order.id}`);

      // Use stored RFQ and negotiation IDs from logs - 
      const rfqNumber = await this.getRfqNumber(order);
      const negotiationId = await this.getNegotiationId(order);

      if (!rfqNumber || !negotiationId) {
        throw new AppError(
          "RFQ number or negotiation ID not found in order logs",
          { code: "MISSING_METADATA" }
        );
      }


      // Calculate consideration: quantity * price / 100 + accrued interest
      const accruedInterest = (order.bondDetails as any)?.pricing?.accruedInterest ?? 0;
      const cleanPrice = (order.bondDetails as any)?.pricing?.cleanPrice ?? 0;
      const principalAmount = (order.bondDetails as any)?.pricing?.principalAmount ?? 0;

      const consideration = principalAmount + accruedInterest;


      await this.nseRfq.proposeDeal({
        ngRfqNumber: rfqNumber,
        ngId: negotiationId,
        participantCode: "BCISPL",
        dealType: "D",
        clientCode: "BCISPL",
        price: cleanPrice,
        accruedInterest: Number(accruedInterest.toFixed(2)),
        consideration: Number(consideration.toFixed(2)),
        calcMethod: "O",
        role: "I",
        remarks: `Auto-proposed deal for order ${order.id}`,
      });

      // Log deal proposal
      await this.orderService.addOrderLog(
        order.id,
        SettlementStep.PROPOSE_DEAL,
        SettlementStatus.SUCCESS,
        { rfqNumber, negotiationId, consideration, accruedInterest },
        { dealDetails: { price: order.unitPrice, calcMethod: "M" } }
      );


      logger.logInfo(`Deal proposed successfully for order ${order.id}`);
    } catch (error) {
      logger.logError(`Failed to propose deal for order ${order.id}:`, error);
      throw new AppError("Failed to propose deal", {
        code: "DEAL_PROPOSE_FAILED",
      });
    }
  }

  /**
   * Step 4: Accept or reject deal (POST /rest/v1/deal/acceptreject)
   */
  private async acceptOrRejectDeal(order: OrderWithNSEData): Promise<void> {
    try {
      logger.logInfo(`Accepting deal for order ${order.id}`);

      if (!order?.customerProfile?.nseDataSet?.participant) {
        throw new AppError("NSE participant data not found for customer", {
          code: "NSE_PARTICIPANT_NOT_FOUND",
        });
      }

      // Use stored RFQ and negotiation IDs from logs
      const rfqNumber = await this.getRfqNumber(order);
      const negotiationId = await this.getNegotiationId(order);

      if (!rfqNumber || !negotiationId) {
        throw new AppError(
          "RFQ number or negotiation ID not found in order logs",
          { code: "MISSING_METADATA" }
        );
      }

      // Calculate accepted values (should match proposed values)
      const acceptedAccruedInterest = await this.getAccruedInterest(order);
      const principalAmount = (order.bondDetails as any)?.pricing?.principalAmount ?? 0;
      const acceptedConsideration = principalAmount + acceptedAccruedInterest;
      const cleanPrice = (order.bondDetails as any)?.pricing?.cleanPrice ?? 0;

      await this.nseRfq.acceptOrRejectDeal({
        rfqNumber: rfqNumber,
        id: negotiationId,
        acceptedPrice: cleanPrice,
        acceptedAccruedInterest: Number(acceptedAccruedInterest.toFixed(2)),
        acceptedConsideration: Number(acceptedConsideration.toFixed(2)),
        confirmStatus: "PC",
      });

      // Log deal acceptance
      await this.orderService.addOrderLog(
        order.id,
        SettlementStep.ACCEPT_OR_REJECT_DEAL,
        SettlementStatus.SUCCESS,
        {
          rfqNumber,
          negotiationId,
          acceptedConsideration,
          acceptedAccruedInterest,
        },
        { dealAcceptance: { acceptedPrice: order.unitPrice } }
      );

      logger.logInfo(`Deal accepted successfully for order ${order.id}`);
    } catch (error) {
      logger.logError(`Failed to accept deal for order ${order.id}:`, error);
      throw new AppError("Failed to accept deal", {
        code: "DEAL_ACCEPT_FAILED",
      });
    }
  }

  /**
   * Update order status to settled
   */
  private async updateOrderStatus(orderId: number): Promise<void> {
    try {
      await this.orderService.updateOrderStatus(orderId, OrderStatus.SETTLED);

      // Log final settlement completion
      await this.orderService.addOrderLog(
        orderId,
        SettlementStep.UPDATE_ORDER_STATUS,
        SettlementStatus.SUCCESS,
        { settledAt: new Date().toISOString() },
        { settlementStatus: "COMPLETED" }
      );

      logger.logInfo(`Order ${orderId} status updated to SETTLED`);
    } catch (error) {
      logger.logError(`Failed to update order status:`, error);
      throw new AppError("Failed to update order status", {
        code: "ORDER_UPDATE_FAILED",
      });
    }
  }

  private async getRfqNumber(
    order: OrderWithNSEData
  ): Promise<string | undefined> {
    const logs = await this.orderService.getOrderLogs(order.id);
    const rfqStep = logs.find(
      (t) =>
        t.step === SettlementStep.ADD_ISIN &&
        t.status === SettlementStatus.SUCCESS
    );
    return (rfqStep?.outputData as { rfqNumber: string })?.rfqNumber;
  }

  async getNegotiationId(order: OrderWithNSEData): Promise<string | undefined> {
    const logs = await this.orderService.getOrderLogs(order.id);
    const step = logs.find(
      (t) =>
        t.step === SettlementStep.ACCEPT_NEGOTIATION &&
        t.status === SettlementStatus.SUCCESS
    );
    return (step?.outputData as { negotiationId: string })?.negotiationId;
  }

  async getAccruedInterest(order: OrderWithNSEData): Promise<number> {
    const logs = await this.orderService.getOrderLogs(order.id);
    const dealStep = logs.find(
      (t) =>
        t.step === SettlementStep.PROPOSE_DEAL &&
        t.status === SettlementStatus.SUCCESS
    );
    return (
      (dealStep?.outputData as { accruedInterest?: number })?.accruedInterest ||
      0
    );
  }
}
