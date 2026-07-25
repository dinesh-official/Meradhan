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
  OrderPipelineStage,
  OrderStageStatus,
  ORDER_STAGE_SEQUENCE,
  ORDER_STAGE_MAX_ATTEMPTS,
  ORDER_STAGE_LOCK_TTL_SECONDS,
} from "@root/config/constants";
import { NseCBRICS } from "@modules/RFQ/nse/nse_CBRICS";
import { NseRfq } from "@modules/RFQ/nse/nse_RFQ";
import { RfqMasterDbSyncManager } from "@resource/crm/refq/nse/rfq_master/rfq_master.manager";
import { OrderService } from "@resource/customer/order/order.service";
import { AppError } from "@utils/error/AppError";
import logger from "@utils/logger/logger";
import { db } from "@core/database/database";
import type { BondDetailsResponse } from "@packages/apiGateway";
import { env } from "@root/config/env";
import { makeRazorpayRouteTransition, resolveRazorpayRouteEligibility } from "@services/razorpay-route/RPay-route";
import { CrmOrdersService } from "@resource/crm/orders/orders.service";
import { CustomerProfileRepo } from "@resource/crm/customers/customer.repo";
import crypto from "crypto";
import { RfqMasterService } from "@resource/crm/refq/nse/rfq_master/rfq_master.service";
import { getEmailSalutationFromSources } from "@root/schema";
import { formatDateDdMmYyyy, formatDateIstDdMmmYyyy } from "@resource/customer/order/order.utils";
import { getLastCouponDate, getLastNextCouponDateBasedOnSettlementDate } from "./order-pricing-helper";
import { sendSettlementAutomationFailureEmail } from "./settlement_automation_alert";
import { AxiosError } from "axios";
import { cacheStorage } from "@store/redis_store";
import type { OrderSettlementStage, OrderStage } from "@databases/generated/prisma/postgres";

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
  crmOrdersService: CrmOrdersService;
  constructor() {
    this.nseRfq = new NseRfq();
    this.nseCbrics = new NseCBRICS();
    this.orderService = new OrderService();
    this.rfqMasterDbSyncManager = new RfqMasterDbSyncManager();
    this.crmOrdersService = new CrmOrdersService();
  }

  private buildBatchId(paymentId: string, orderId: number) {
    return `${paymentId || `order-${orderId}`}-${crypto.randomUUID().slice(0, 8)}`;
  }

  /**
   * NSE negotiation/deal APIs return a wide payload (sometimes with extra keys).
   * Prisma `RFQNegotiation` only accepts a known set of fields; whitelist + normalize here.
   */
  private mapNegotiationToDbData(raw: unknown) {
    const r = (raw ?? {}) as Record<string, unknown>;
    const rawTradeSplits = r.tradeSplits;

    // Required fields in Prisma model.
    const id = String(r.id ?? "");
    const rfqNumber = String(r.rfqNumber ?? "");
    const date = String(r.date ?? "");

    if (!id || !rfqNumber || !date) {
      throw new AppError("Negotiation response missing required fields", {
        code: "NEGOTIATION_SYNC_INVALID",
      });
    }

    return {
      rfqNumber,
      id,
      date,
      isin: (r.isin as string | null | undefined) ?? null,
      buySell: (r.buySell as any) ?? undefined,

      initSettlementType: (r.initSettlementType as number | null | undefined) ?? null,
      initSettlementDate: (r.initSettlementDate as string | null | undefined) ?? null,
      initAeCode: (r.initAeCode as string | null | undefined) ?? null,
      initDealType: (r.initDealType as any) ?? undefined,
      initClientCode: (r.initClientCode as string | null | undefined) ?? null,
      initClientRegType: (r.initClientRegType as any) ?? undefined,
      initValue: (r.initValue as number | null | undefined) ?? null,
      initQuantity: (r.initQuantity as number | null | undefined) ?? null,
      initYieldType: (r.initYieldType as any) ?? undefined,
      initYield: (r.initYield as number | null | undefined) ?? null,
      initCalcMethod: (r.initCalcMethod as any) ?? undefined,
      initPrice: (r.initPrice as number | null | undefined) ?? null,
      initAccruedInterest: (r.initAccruedInterest as number | null | undefined) ?? null,
      initConsideration: (r.initConsideration as number | null | undefined) ?? null,
      initQuoteTime: (r.initQuoteTime as string | null | undefined) ?? null,
      initGtdFlag: (r.initGtdFlag as any) ?? undefined,
      initEndTime: (r.initEndTime as string | null | undefined) ?? null,
      initRemarks: (r.initRemarks as string | null | undefined) ?? null,
      initLoginId: (r.initLoginId as string | null | undefined) ?? null,

      respSettlementType: (r.respSettlementType as number | null | undefined) ?? null,
      respSettlementDate: (r.respSettlementDate as string | null | undefined) ?? null,
      respAeCode: (r.respAeCode as string | null | undefined) ?? null,
      respDealType: (r.respDealType as any) ?? undefined,
      respClientCode: (r.respClientCode as string | null | undefined) ?? null,
      respClientRegType: (r.respClientRegType as any) ?? undefined,
      respValue: (r.respValue as number | null | undefined) ?? null,
      respQuantity: (r.respQuantity as number | null | undefined) ?? null,
      respYieldType: (r.respYieldType as any) ?? undefined,
      respYield: (r.respYield as number | null | undefined) ?? null,
      respCalcMethod: (r.respCalcMethod as any) ?? undefined,
      respPrice: (r.respPrice as number | null | undefined) ?? null,
      respAccruedInterest: (r.respAccruedInterest as number | null | undefined) ?? null,
      respConsideration: (r.respConsideration as number | null | undefined) ?? null,
      respQuoteTime: (r.respQuoteTime as string | null | undefined) ?? null,
      respGtdFlag: (r.respGtdFlag as any) ?? undefined,
      respEndTime: (r.respEndTime as string | null | undefined) ?? null,
      respRemarks: (r.respRemarks as string | null | undefined) ?? null,
      respLoginId: (r.respLoginId as string | null | undefined) ?? null,

      status: (r.status as any) ?? undefined,
      tradeNumber: (r.tradeNumber as string | null | undefined) ?? null,

      acceptedSettlementType: (r.acceptedSettlementType as number | null | undefined) ?? null,
      acceptedSettlementDate: (r.acceptedSettlementDate as string | null | undefined) ?? null,
      acceptedValue: (r.acceptedValue as number | null | undefined) ?? null,
      acceptedQuantity: (r.acceptedQuantity as number | null | undefined) ?? null,
      acceptedYieldType: (r.acceptedYieldType as any) ?? undefined,
      acceptedYield: (r.acceptedYield as number | null | undefined) ?? null,
      acceptedCalcMethod: (r.acceptedCalcMethod as any) ?? undefined,
      acceptedPrice: (r.acceptedPrice as number | null | undefined) ?? null,
      acceptedPutCallDate: (r.acceptedPutCallDate as string | null | undefined) ?? null,
      acceptedAccruedInterest: (r.acceptedAccruedInterest as number | null | undefined) ?? null,
      acceptedConsideration: (r.acceptedConsideration as number | null | undefined) ?? null,
      acceptedQuoteTime: (r.acceptedQuoteTime as string | null | undefined) ?? null,
      acceptedBySide: (r.acceptedBySide as any) ?? undefined,
      acceptedByLoginId: (r.acceptedByLoginId as string | null | undefined) ?? null,

      confirmStatus: (r.confirmStatus as any) ?? undefined,
      proposedBySide: (r.proposedBySide as any) ?? undefined,
      proposedTime: (r.proposedTime as string | null | undefined) ?? null,
      confirmedPriceQuoteTime: (r.confirmedPriceQuoteTime as string | null | undefined) ?? null,
      lastActivityTimestamp: (r.lastActivityTimestamp as string | null | undefined) ?? null,

      tradeSplits: (Array.isArray(rawTradeSplits) ? rawTradeSplits : []) as Prisma.InputJsonValue[],
    };
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
          nseResponse:
            error instanceof AxiosError ? error.response?.data : undefined,
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
        message: "Settlement processing batch initiated",
        inputData: {
          timestamp: new Date().toLocaleString(),
          orderId: order.id,
          isNetBanking,
          paymentId: order.paymentId,
          ucc: order.customerProfile.nseDataSet.participant.loginId,
          name: order.customerProfile.nseDataSet.participant.firstName,
          perAccStatus: order.customerProfile.nseDataSet.participant.actualStatus,
          perWorkflowStatus: order.customerProfile.nseDataSet.participant.workflowStatus,
          totalAmount: order.totalAmount,
          isin: order.isin,
          quantity: order.quantity,
          userStartPaymentProcessAt: order.createdAt,
        },
        startedAt: new Date(),
      });

      console.log("add isin to settlement");
      const addIsinResponse = await this.runWithAutomationLog({
        orderId: order.id,
        paymentId,
        batchId,
        step: SettlementStep.ADD_ISIN,
        message: "Trigger RFQ Add ISIN to settlement",
        inputData: {
          isin: order.isin,
          quantity: order.quantity,
          totalAmount: order.totalAmount,
        },
        fn: () => this.addIsinToSettlement(order, { paymentId }),
      });
      await new Promise((resolve) => setTimeout(resolve, 10000));

      console.log("accepted negotiation");
      // Step 2: Accept negotiation quote
      const acceptNegotiationResponse = await this.runWithAutomationLog({
        orderId: order.id,
        paymentId,
        batchId,
        step: SettlementStep.ACCEPT_NEGOTIATION,
        message: "Rfq Accept negotiation",
        inputData: {
          ucc: order.customerProfile.nseDataSet.participant.loginId,
          name: order.customerProfile.nseDataSet.participant.firstName,
          isin: order.isin,
          quantity: order.quantity,
          totalAmount: order.totalAmount,
          inCrores: addIsinResponse.inCrores,
          rfqNumber: addIsinResponse.rfqNumber
        },
        fn: () => this.acceptNegotiation(order, addIsinResponse.inCrores),
      });
      await new Promise((resolve) => setTimeout(resolve, 10000));

      console.log("propose deal");
      // Step 3: Propose deal
      const proposeDealResponse = await this.runWithAutomationLog({
        orderId: order.id,
        paymentId,
        batchId,
        step: SettlementStep.PROPOSE_DEAL,
        message: "Rfq Propose deal",
        inputData: {

          orderId: order.id
        },
        fn: () => this.proposeDeal(order),
      });
      await new Promise((resolve) => setTimeout(resolve, 10000));

      console.log("accept or reject deal");
      // Step 4: Accept/Reject deal
      const acceptOrRejectDealResponse = await this.runWithAutomationLog({
        orderId: order.id,
        paymentId,
        batchId,
        step: SettlementStep.ACCEPT_OR_REJECT_DEAL,
        message: "RFQ Accept deal",
        inputData: {
          ucc: order.customerProfile.nseDataSet.participant.loginId,
          name: order.customerProfile.nseDataSet.participant.firstName,
          isin: order.isin,
          quantity: order.quantity,
          orderId: order.id,
          unitPrice: order.unitPrice,
        },
        fn: () => this.acceptOrRejectDeal(order),
      });

      console.log("--------- update order status --------");
      const updateStatusResponse = await this.runWithAutomationLog({
        orderId: order.id,
        paymentId,
        batchId,
        step: SettlementStep.UPDATE_ORDER_STATUS,
        message: "Update order status",
        inputData: {
          name: order.customerProfile.nseDataSet.participant.firstName,
          isin: order.isin,
          quantity: order.quantity,
          orderId: order.id,
          unitPrice: order.unitPrice,
          paymentId,
          status: OrderStatus.IN_PROGRESS
        },
        fn: () => this.updateOrderStatus(orderId),
      });
      if (order.paymentId?.trim()) {
        // Live pre-check before routing: actual status + netbanking method.
        const routePayId = order.paymentId.trim();
        const eligibility =
          await resolveRazorpayRouteEligibility(routePayId);

        if (eligibility.skipReason === "not_netbanking") {
          await this.addAutomationLog({
            orderId: order.id,
            paymentId,
            batchId,
            step: "RAZORPAY_ROUTE_TRANSFER",
            status: "SUCCESS",
            message: "Skipped Razorpay route transfer (not netbanking)",
            inputData: {
              payId: routePayId,
              razorpayStatus: eligibility.payment.status,
              razorpayMethod: eligibility.payment.method ?? null,
            },
            outputData: {
              skipped: true,
              reason: "not_netbanking",
            },
            completedAt: new Date(),
          });
        } else if (!eligibility.canRoute) {
          throw new Error(
            eligibility.blockReason ??
              "Payment not ready for Razorpay route transfer",
          );
        } else {
          // Settlement Razorpay-route-transfer requires a Meradhan customer
          // (we route payouts to the customer's linked virtual account).
          // Participant-counterparty orders never trigger this branch
          // because they're created without a payment / Razorpay path.
          if (order.customerProfileId == null) {
            throw new Error(
              "Razorpay route transfer requested for a participant-counterparty order; this is not supported.",
            );
          }
          const customerProfileId = order.customerProfileId;
          await this.runWithAutomationLog({
            orderId: order.id,
            paymentId,
            batchId,
            step: "RAZORPAY_ROUTE_TRANSFER",
            message: "Create Razorpay route transfer",
            inputData: {
              amount: Number(order.totalAmount),
              payId: routePayId,
              userId: customerProfileId,
              rfqNumber: addIsinResponse.rfqNumber,
              isin: addIsinResponse.isin,
              razorpayStatus: eligibility.payment.status,
              razorpayMethod: eligibility.payment.method ?? null,
            },
            fn: () =>
              makeRazorpayRouteTransition({
                amount: Number(order.totalAmount.toFixed(4)),
                payId: routePayId,
                userId: customerProfileId,
                notes: {
                  RFQ_NUMBER: addIsinResponse.rfqNumber,
                  UCC: order?.customerProfile?.nseDataSet?.participant?.loginId
                }
              }),
          });
        }
      } else if (isNetBanking) {
        throw new Error(
          "No Razorpay paymentId on order — cannot verify payment or create route transfer",
        );
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

      // wait 30 sec
      const rfqMasterService = new RfqMasterService();
      await new Promise((resolve) => setTimeout(resolve, 30000));
      const todayDate = new Date().toISOString().split("T")[0]?.split("-").reverse().join("-");
      const d = new Date();
      const istYmd = d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }); // yyyy-mm-dd
      const [y, m, day] = istYmd.split("-").map(Number);
      const tomorrowIst = new Date(Date.UTC(y!, (m ?? 1) - 1, (day ?? 1) + 1, 12));
      const nextDate = tomorrowIst
        .toLocaleDateString("en-GB", { timeZone: "Asia/Kolkata" })
        .replaceAll("/", "-");

      await rfqMasterService.getAllSettledOrders({ filtFromModSettleDate: todayDate || "", filtToModSettleDate: nextDate })


      const updatedOrder = await getOrderData();

      if (updatedOrder) {
        await this.trySendOrderReceiptPdfEmail({
          order: updatedOrder,
          paymentId,
          batchId,
          settlementDate: addIsinResponse.rfqDbData.settlementDate,
          inputData: {
            rfqNumber: addIsinResponse.rfqNumber,
            addIsinResponse,
            acceptNegotiationResponse,
            proposeDealResponse,
            acceptOrRejectDealResponse,
            updateStatusResponse,
            isNetBanking,
          },
        });
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log("OrderId:", orderId);
        console.log(error?.response?.data);
      } else {
        logger.logError(`Settlement process failed for order ${orderId}:`, error);
      }
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
          data: JSON.stringify((error as AxiosError)?.response?.data),
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

      const failedStepLog =
        await db.dataBase.orderSettlementAutomationLog.findFirst({
          where: {
            paymentId,
            batchId: finalBatchId,
            status: "FAILED",
            step: { not: "SETTLEMENT_BATCH" },
          },
          orderBy: [{ completedAt: "desc" }, { id: "desc" }],
        });

      await sendSettlementAutomationFailureEmail({
        context: "ORDER",
        failedStep: failedStepLog?.step ?? "SETTLEMENT_BATCH",
        error,
        orderId,
        orderNumber: order?.orderNumber ?? null,
        isin: order?.isin ?? null,
        quantity: order?.quantity ?? null,
        paymentId,
        batchId: finalBatchId,
        customerName:
          order?.customerProfile?.nseDataSet?.participant?.firstName ?? null,
        ucc: order?.customerProfile?.nseDataSet?.participant?.loginId ?? null,
        rfqNumber:
          typeof (order?.metadata as Record<string, unknown> | null)?.rfqNumber ===
          "string"
            ? String(
                (order?.metadata as Record<string, unknown>).rfqNumber,
              ).trim()
            : null,
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
        buySell: "S",// S/B
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
        remarks: `${paymentId}`,
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

      // Save on DB (sync). RFQ number is unique; upsert avoids duplicate crashes on retries.
      // NSE API payload doesn't perfectly match Prisma types (e.g. `access` can be string),
      // and may include extra fields not present in the model (e.g. `partRefId`).
      // Map + coerce to the Prisma model shape.
      const rfqDbData = {
        number: rfqDetails.number,
        segment: rfqDetails.segment,
        isin: rfqDetails.isin,
        participantCode: rfqDetails.participantCode,
        dealType: rfqDetails.dealType,
        clientCode: rfqDetails.clientCode,
        clientRegType: rfqDetails.clientRegType,
        buySell: rfqDetails.buySell,
        quoteType: rfqDetails.quoteType,
        settlementType: Number(rfqDetails.settlementType),
        value: Number(rfqDetails.value),
        quantity: rfqDetails.quantity != null ? Number(rfqDetails.quantity) : null,
        yieldType: rfqDetails.yieldType,
        yield: rfqDetails.yield != null ? Number(rfqDetails.yield) : null,
        calcMethod: rfqDetails.calcMethod,
        price: rfqDetails.price != null ? Number(rfqDetails.price) : null,
        valueSell: (rfqDetails as { valueSell?: unknown }).valueSell != null ? Number((rfqDetails as { valueSell?: unknown }).valueSell) : null,
        quantitySell: (rfqDetails as { quantitySell?: unknown }).quantitySell != null ? Number((rfqDetails as { quantitySell?: unknown }).quantitySell) : null,
        yieldTypeSell: (rfqDetails as { yieldTypeSell?: unknown }).yieldTypeSell as any,
        yieldSell: (rfqDetails as { yieldSell?: unknown }).yieldSell != null ? Number((rfqDetails as { yieldSell?: unknown }).yieldSell) : null,
        calcMethodSell: (rfqDetails as { calcMethodSell?: unknown }).calcMethodSell as any,
        priceSell: (rfqDetails as { priceSell?: unknown }).priceSell != null ? Number((rfqDetails as { priceSell?: unknown }).priceSell) : null,
        gtdFlag: rfqDetails.gtdFlag,
        endTime: (rfqDetails as { endTime?: string | null | undefined }).endTime ?? null,
        quoteNegotiable: rfqDetails.quoteNegotiable,
        valueNegotiable: rfqDetails.valueNegotiable,
        minFillValue: rfqDetails.minFillValue != null ? Number(rfqDetails.minFillValue) : null,
        valueStepSize: rfqDetails.valueStepSize != null ? Number(rfqDetails.valueStepSize) : null,
        anonymous: rfqDetails.anonymous,
        access: Number(rfqDetails.access),
        groupList: rfqDetails.groupList ?? [],
        participantList: rfqDetails.participantList ?? [],
        category: rfqDetails.category ?? null,
        rating: rfqDetails.rating ?? null,
        remarks: rfqDetails.remarks ?? null,
        date: rfqDetails.date ?? null,
        quoteTime: rfqDetails.quoteTime ?? null,
        settlementDate: rfqDetails.settlementDate ?? null,
        status: rfqDetails.status ?? undefined,
        userLogin: rfqDetails.userLogin ?? null,
        tradedValue: rfqDetails.tradedValue != null ? Number(rfqDetails.tradedValue) : null,
        confirmedValue: rfqDetails.confirmedValue != null ? Number(rfqDetails.confirmedValue) : null,
      };
      await db.dataBase.rFQMasterISIN.upsert({
        where: { number: rfqDbData.number },
        create: rfqDbData,
        update: rfqDbData,
      });

      logger.logInfo(
        `RFQ created successfully for ISIN ${order.isin} with RFQ number: ${rfqDetails.number}`
      );
      return {
        inCrores,
        rfqNumber: rfqDetails.number,
        // participant: order.customerProfile?.nseDataSet?.participant,
        isin: order.isin,
        quantity: order.quantity,
        unitPrice: order.unitPrice,
        value: value,
        rfqDbData
      };
    } catch (error) {
      console.log(error);
      logger.logError(
        `Failed to create RFQ for ISIN ${order.isin} for order ${order.id}:`,
        error
      );
      throw new AppError(`Failed to create RFQ for ISIN ${order.isin} for order ${order.id}: ${JSON.stringify((error as AxiosError).response?.data || {})}`, {
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
  ): Promise<{ rfqNumber: string; negotiationId: string | number | null }> {
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

      // Sync negotiation on DB. `id` is unique; upsert avoids duplicate crashes on retries.
      const negotiationDbData = this.mapNegotiationToDbData(negotiationResponse);
      await db.dataBase.rFQNegotiation.upsert({
        where: { id: negotiationDbData.id },
        create: negotiationDbData,
        update: negotiationDbData,
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
      return {
        rfqNumber,
        negotiationId: (negotiationResponse as { id?: string | number | null }).id ?? null,
      };
    } catch (error) {
      console.log(error);

      logger.logError(
        `Failed to accept negotiation for order ${order.id}, RFQ: ${rfqNumber || "unknown"}:`,
        error
      );

      throw new AppError(`Failed to accept negotiation for order ${order.id}, RFQ: ${rfqNumber || "unknown"}: ${JSON.stringify((error as AxiosError)?.response?.data)}`, {
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
  ): Promise<{
    rfqNumber: string;
    negotiationId: string;
    consideration: number;
    accruedInterest: number;
    cleanPrice: number;
    principalAmount: number;
  }> {
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


      const proposeResponse = await this.nseRfq.proposeDeal({
        ngRfqNumber: rfqNumber,
        ngId: negotiationId,
        participantCode: env.CBRICS_DOMAIN,
        // participantCode: order.customerProfile?.nseDataSet?.participant?.loginId ?? "",
        dealType: "D",
        clientCode: env.CBRICS_DOMAIN,
        price: cleanPrice,
        accruedInterest: Number(accruedInterest.toFixed(2)),
        consideration: Number(consideration.toFixed(2)),
        calcMethod: "O",
        role: "I",
        remarks: `${order.paymentId}`,
      });

      // Sync proposed deal response into negotiation table (same response shape).
      const proposeDbData = this.mapNegotiationToDbData(proposeResponse);
      await db.dataBase.rFQNegotiation.upsert({
        where: { id: proposeDbData.id },
        create: proposeDbData,
        update: proposeDbData,
      });


      await db.dataBase.order.update({
        where: {
          id: order.id,
        },
        data: {
          reqOrderNumber: proposeResponse.tradeNumber,
        }
      })

      // Log deal proposal
      await this.orderService.addOrderLog(
        order.id,
        SettlementStep.PROPOSE_DEAL,
        SettlementStatus.SUCCESS,
        { rfqNumber, negotiationId, consideration, accruedInterest },
        { dealDetails: { price: order.unitPrice, calcMethod: "M" } }
      );


      logger.logInfo(`Deal proposed successfully for order ${order.id}`);
      return {
        rfqNumber,
        negotiationId,
        consideration,
        accruedInterest,
        cleanPrice,
        principalAmount,
      };
    } catch (error) {
      logger.logError(`Failed to propose deal for order ${order.id}:`, error);
      throw new AppError(`Failed to propose deal for order ${order.id}: ${JSON.stringify((error as AxiosError)?.response?.data)}`, {
        code: "DEAL_PROPOSE_FAILED",
      });
    }
  }

  /**
   * Step 4: Accept or reject deal (POST /rest/v1/deal/acceptreject)
   */
  private async acceptOrRejectDeal(order: OrderWithNSEData): Promise<{
    rfqNumber: string;
    negotiationId: string;
    acceptedConsideration: number;
    acceptedAccruedInterest: number;
    cleanPrice: number;
  }> {
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

      const acceptResponse = await this.nseRfq.acceptOrRejectDeal({
        rfqNumber: rfqNumber,
        id: negotiationId,
        acceptedPrice: cleanPrice,
        acceptedAccruedInterest: Number(acceptedAccruedInterest.toFixed(2)),
        acceptedConsideration: Number(acceptedConsideration.toFixed(2)),
        confirmStatus: "PC",
      });

      // Sync accepted deal response into negotiation table.
      const acceptDbData = this.mapNegotiationToDbData(acceptResponse);
      await db.dataBase.rFQNegotiation.upsert({
        where: { id: acceptDbData.id },
        create: acceptDbData,
        update: acceptDbData,
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
      return {
        rfqNumber,
        negotiationId,
        acceptedConsideration,
        acceptedAccruedInterest,
        cleanPrice,
      };
    } catch (error) {
      const detail =
        error instanceof AxiosError
          ? JSON.stringify(error.response?.data ?? {})
          : error instanceof Error
            ? error.message
            : String(error);
      logger.logError(`Failed to accept deal for order ${order.id}:`, error);
      throw new AppError(
        `Failed to accept deal for order ${order.id}: ${detail}`,
        {
          code: "DEAL_ACCEPT_FAILED",
        },
      );
    }
  }

  /**
   * Update order status to settled
   */
  private async updateOrderStatus(
    orderId: number,
  ): Promise<{ status: OrderStatus; settledAt: string }> {
    try {
      await this.orderService.updateOrderStatus(orderId, OrderStatus.IN_PROGRESS);
      const settledAt = new Date().toISOString();

      // Log final settlement completion
      await this.orderService.addOrderLog(
        orderId,
        SettlementStep.UPDATE_ORDER_STATUS,
        SettlementStatus.SUCCESS,
        { settledAt },
        { settlementStatus: "COMPLETED" }
      );

      logger.logInfo(`Order ${orderId} status updated to IN_PROGRESS`);
      return { status: OrderStatus.IN_PROGRESS, settledAt };
    } catch (error) {
      logger.logError(`Failed to update order status:`, error);
      throw new AppError("Failed to update order status", {
        code: "ORDER_UPDATE_FAILED",
      });
    }
  }

  /**
   * Normalize settle_order.modSettleDate (often DD-MM-YYYY) to YYYY-MM-DD for autofill.
   */
  private normalizeSettlementDateForReceiptAutofill(raw: string): string {
    const t = raw.trim();
    const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t);
    if (iso) return t;
    const dmy = /^(\d{2})-(\d{2})-(\d{4})$/.exec(t);
    if (dmy) {
      const dd = dmy[1];
      const mm = dmy[2];
      const yyyy = dmy[3];
      return `${yyyy}-${mm}-${dd}`;
    }
    return t;
  }

  /** e.g. 02-Feb-2026 12:17:26 (IST), matches CRM send-pdf-email payload style */
  private formatNowIstDdMmmYyyyHms(): string {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ] as const;
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const parts = fmt.formatToParts(new Date());
    const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "";
    const day = get("day").padStart(2, "0");
    const monthNum = Number(get("month"));
    const monthName = months[monthNum - 1] ?? "Jan";
    const year = get("year");
    const hour = get("hour").padStart(2, "0");
    const minute = get("minute").padStart(2, "0");
    const second = get("second").padStart(2, "0");
    return `${day}-${monthName}-${year} ${hour}:${minute}:${second}`;
  }

  async trySendOrderReceiptPdfEmail(params: {
    order: OrderWithNSEData;
    paymentId: string;
    batchId: string;
    settlementDate: string,
    inputData?: Record<string, unknown>;
  }): Promise<void> {
    const { order, paymentId, batchId, inputData } = params;
    const step = "SEND_ORDER_RECEIPT_PDF_EMAIL";
    console.log(JSON.stringify(params));

    await this.addAutomationLog({
      orderId: order.id,
      paymentId,
      batchId,
      step,
      status: "STARTED",
      message: "Sending order receipt PDF to customer",
      inputData,
      startedAt: new Date(),
    });

    try {
      const recipientEmail = (order as unknown as { customerProfile?: { emailAddress?: string | null } | null })
        ?.customerProfile?.emailAddress;
      if (!recipientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
        throw new AppError("Customer email is missing or invalid", {
          code: "CUSTOMER_EMAIL_MISSING",
        });
      }

      const orderNumber = (order as unknown as { orderNumber?: string | null }).orderNumber ?? null;
      if (!orderNumber) {
        throw new AppError("Order number is missing; cannot generate order receipt PDF", {
          code: "ORDER_NUMBER_MISSING",
        });
      }
      if (order.customerProfileId == null) {
        throw new AppError(
          "Order receipt PDF email requires a Meradhan customer; this is a participant-counterparty order.",
          { code: "PARTICIPANT_ORDER" },
        );
      }

      const user = await new CustomerProfileRepo().getFullCustomerProfile(order.customerProfileId);
      const customerName =
        [user.firstName, user.middleName, user.lastName].filter(Boolean).join(" ").trim() ||
        "CUSTOMER";
      const salutation = getEmailSalutationFromSources({
        gender: user.gender,
        panCard: user.panCard,
        aadhaarCard: user.aadhaarCard,
      });

      const metadata = (order as unknown as { metadata?: Record<string, unknown> | null }).metadata ?? null;
      const dealId = metadata && typeof metadata === "object" ? (metadata.dealId as string | undefined) : undefined;
      const clientOrderSide =
        metadata && typeof metadata === "object"
          ? (metadata.clientOrderSide as "BUY" | "SELL" | undefined)
          : undefined;
      const side = clientOrderSide === "BUY" || clientOrderSide === "SELL" ? clientOrderSide : undefined;
      const buySellLower = side === "SELL" ? "sell" : "buy";
      const buySellYour = side === "SELL" ? "Sell" : "Buy";

      const subject = `Order Confirmation & Receipt – Order ID ${orderNumber}`;
      const messageBody = `Dear ${salutation} ${customerName},

Your ${buySellLower} order has been successfully placed through MeraDhan and has been executed on the exchange.

Bond Name: ${(order as unknown as { bondName?: string | null }).bondName ?? "—"}

ISIN: ${order.isin}

Deal ID: ${dealId ?? "—"}

Order Type:  ${buySellYour}

Please find the Order Receipt attached for your reference. The order receipt is password protected. You may open it using your date of birth as the password. For example, if your date of birth is 3 April 1996, the password will be 03041996.

To proceed with settlement, please transfer the required amount from your bank account verified on MeraDhan to the designated NCL account, maintained with HDFC Bank or RBI as applicable, via NEFT / RTGS, in accordance with the instructions provided at the time of placing your order.

Kindly ensure that the payment is completed within the stipulated time to avoid cancellation of the order.

Important Notes:

This Order Receipt indicates the intention to transact and is not a Deal Confirmation.

A Deal Sheet will be shared with you once the transaction is settled.

Please ensure that the Demat Account listed in the receipt is active and ready to receive the bonds/securities.

If you require any assistance, please contact us at backoffice@meradhan.co.

Warm regards,

MeraDhan Team

Disclaimer: Fixed returns do not constitute guaranteed or assured returns. Investments in corporate debt securities, municipal debt securities/securitised debt instruments are subject to credit risks, market risks and default risks including delay and/or default in payment. Read all the offer related documents carefully.

BondNest Capital India Securities Private Limited operates the MeraDhan platform as an Online Bond Platform Provider (OBPP).

SEBI Registration No.: INZ000330234

NSE Member ID: 90480

BSE Member ID: 6963`;

      const settleRow = await this.crmOrdersService.getRfqByOrderNumber(orderNumber);
      let settlementDateInput =
        typeof settleRow?.modSettleDate === "string" && settleRow.modSettleDate.trim() !== ""
          ? this.normalizeSettlementDateForReceiptAutofill(settleRow.modSettleDate.trim())
          : new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });




      let accruedInterestDays = (order.bondDetails as any).pricing.noOfAccrualDays;
      let settlementNumber: string | undefined;
      let lastInterestPaymentDate: string | undefined;
      let interestPaymentDates: string | undefined;
      try {
        const autofill = await this.crmOrdersService.autofillReceiptPdfOptions(orderNumber, {
          settlementDate: settlementDateInput,
        });
        // accruedInterestDays = autofill.accruedInterestDays;
        if (autofill.settlementNumber) settlementNumber = autofill.settlementNumber;
        // Last IP must use settlement date (same as cash flows) — not `new Date()`.
        if (autofill.lastInterestPaymentDate) {
          lastInterestPaymentDate = autofill.lastInterestPaymentDate;
        } else {
          const settlementDt = new Date(`${settlementDateInput}T00:00:00.000Z`);
          const setData = await getLastCouponDate(
            order.isin,
            Number.isNaN(settlementDt.getTime()) ? new Date() : settlementDt,
          );
          if (setData) lastInterestPaymentDate = setData;
        }
        if (autofill.interestPaymentDates?.length) {
          interestPaymentDates = autofill.interestPaymentDates.join(", ");
        }
      } catch (autoErr) {
        logger.logError(
          `Receipt PDF autofill failed for ${orderNumber}; sending with accrued days from deal log only`,
          autoErr,
        );
      }

      const settlementDateTime = this.formatNowIstDdMmmYyyyHms();
      console.log({
        pdfType: "order",
        subject,
        messageBody,
        toEmail: recipientEmail,
        accruedInterestDays,
        settlementNumber: settleRow?.settlementNo || undefined,
        settlementDateTime: params.settlementDate,
        lastInterestPaymentDate,
        interestPaymentDates,
        nonAmortizedBond: true,

      });

      console.log(orderNumber);



      const { messageId } = await this.crmOrdersService.sendPdfEmailToClient(order.reqOrderNumber ?? "", {
        pdfType: "order",
        subject,
        messageBody,
        toEmail: recipientEmail,
        accruedInterestDays,
        settlementNumber: settlementNumber,
        settlementDateTime: new Date((order.bondDetails as any).pricing.settlementDate).toISOString(),
        lastInterestPaymentDate,
        interestPaymentDates,
        nonAmortizedBond: true,
        // dealDate: (new Date((order.bondDetails as any).pricing.dealDate)),
        // settlementDate: (new Date((order.bondDetails as any).pricing.settlementDate))
      });

      await this.addAutomationLog({
        orderId: order.id,
        paymentId,
        batchId,
        step,
        status: "SUCCESS",
        message: "Order receipt PDF email sent (CRM send-pdf-email pipeline)",
        outputData: {
          to: recipientEmail,
          orderNumber,
          messageId,
          subject,
          settlementDateTime,
          settlementNumber,
        },
        completedAt: new Date(),
      });
    } catch (err) {
      await this.addAutomationLog({
        orderId: order.id,
        paymentId,
        batchId,
        step,
        status: "FAILED",
        message: "Failed to send order receipt PDF email",
        errorData: {
          error: err instanceof Error ? err.message : "Unknown error",
          stack: err instanceof Error ? err.stack : undefined,
        },
        completedAt: new Date(),
      });
    }
  }

  private async getRfqNumber(
    order: OrderWithNSEData
  ): Promise<string | undefined> {
    const stage = await db.dataBase.orderStage.findUnique({
      where: {
        orderId_stage: {
          orderId: order.id,
          stage: OrderPipelineStage.ADD_ISIN as OrderSettlementStage,
        },
      },
      select: { response: true, status: true },
    });
    if (stage?.status === OrderStageStatus.SUCCESS && stage.response) {
      const rfqNumber = (stage.response as { rfqNumber?: string }).rfqNumber;
      if (rfqNumber) return rfqNumber;
    }

    const logs = await this.orderService.getOrderLogs(order.id);
    const rfqStep = logs.find(
      (t) =>
        t.step === SettlementStep.ADD_ISIN &&
        t.status === SettlementStatus.SUCCESS
    );
    return (rfqStep?.outputData as { rfqNumber: string })?.rfqNumber;
  }

  async getNegotiationId(order: OrderWithNSEData): Promise<string | undefined> {
    const stage = await db.dataBase.orderStage.findUnique({
      where: {
        orderId_stage: {
          orderId: order.id,
          stage: OrderPipelineStage.QUOTE_ACCEPT as OrderSettlementStage,
        },
      },
      select: { response: true, status: true },
    });
    if (stage?.status === OrderStageStatus.SUCCESS && stage.response) {
      const negotiationId = (stage.response as { negotiationId?: string | number })
        .negotiationId;
      if (negotiationId != null) return String(negotiationId);
    }

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

  // ---------------------------------------------------------------------------
  // Resume-safe stage reconciliation (additive; does not replace initiateOrderSettlement)
  // ---------------------------------------------------------------------------

  private stageLockKey(orderId: number) {
    return `order-stage-lock:${orderId}`;
  }

  private async acquireStageLock(orderId: number): Promise<boolean> {
    const key = this.stageLockKey(orderId);
    const existing = await cacheStorage.get<string>(key);
    if (existing) return false;
    await cacheStorage.set(key, { lockedAt: new Date().toISOString() }, ORDER_STAGE_LOCK_TTL_SECONDS);
    return true;
  }

  private async releaseStageLock(orderId: number): Promise<void> {
    await cacheStorage.delete(this.stageLockKey(orderId));
  }

  /**
   * Idempotent seed of order_stages rows + set settlementStage = payment_done.
   * Does NOT pre-mark pg_routing success — that happens only when the runner
   * reaches pg_routing after all prior stages succeed (API still skipped for
   * non-netbanking).
   */
  async seedOrderStages(
    orderId: number,
    opts?: { isNetBanking?: boolean },
  ): Promise<void> {
    const order = await db.dataBase.order.findUnique({
      where: { id: orderId },
      select: { id: true, orderNumber: true, settlementStage: true },
    });
    if (!order) {
      throw new AppError("Order not found", { code: "ORDER_NOT_FOUND" });
    }

    for (const { stage, seq } of ORDER_STAGE_SEQUENCE) {
      await db.dataBase.orderStage.upsert({
        where: {
          orderId_stage: {
            orderId: order.id,
            stage: stage as OrderSettlementStage,
          },
        },
        create: {
          orderId: order.id,
          orderNo: order.orderNumber,
          stage: stage as OrderSettlementStage,
          status: OrderStageStatus.NOT_STARTED,
          seq,
          payload: {},
          response: {},
        },
        update: {
          orderNo: order.orderNumber,
        },
      });
    }

    // Repair legacy seed: pg_routing marked SUCCESS while an earlier stage failed.
    await this.repairPrematurePgRoutingSuccess(order.id, opts?.isNetBanking);

    if (
      !order.settlementStage ||
      order.settlementStage === OrderPipelineStage.STARTED
    ) {
      await db.dataBase.order.update({
        where: { id: order.id },
        data: {
          settlementStage: OrderPipelineStage.PAYMENT_DONE as OrderSettlementStage,
        },
      });
    }
  }

  /**
   * If pg_routing was pre-marked SUCCESS (e.g. not_netbanking seed) while an
   * earlier stage is still incomplete/failed, reset it so the UI and resume
   * cursor stay honest.
   */
  async repairPrematurePgRoutingSuccess(
    orderId: number,
    isNetBanking?: boolean,
  ): Promise<boolean> {
    const stages = await this.getStagesOrdered(orderId);
    const pgRow = stages.find((s) => s.stage === OrderPipelineStage.PG_ROUTING);
    if (!pgRow || pgRow.status !== OrderStageStatus.SUCCESS) return false;

    const priorIncomplete = stages.some(
      (s) => s.seq < pgRow.seq && s.status !== OrderStageStatus.SUCCESS,
    );
    if (!priorIncomplete) return false;

    const resp = this.stageResponseRecord(pgRow);
    const wasSkippedNotNetbanking =
      resp.skipped === true && resp.reason === "not_netbanking";
    const looksLikePrematureSkip =
      wasSkippedNotNetbanking || isNetBanking === false;

    if (!looksLikePrematureSkip) return false;

    await db.dataBase.orderStage.update({
      where: { id: pgRow.id },
      data: {
        status: OrderStageStatus.NOT_STARTED,
        payload: {},
        response: {},
        lastError: null,
        attemptCount: 0,
      },
    });
    return true;
  }

  private async getStagesOrdered(orderId: number): Promise<OrderStage[]> {
    return db.dataBase.orderStage.findMany({
      where: { orderId },
      orderBy: { seq: "asc" },
    });
  }

  private async markStageWaiting(stageRow: OrderStage): Promise<OrderStage> {
    return db.dataBase.orderStage.update({
      where: { id: stageRow.id },
      data: {
        status: OrderStageStatus.WAITING,
        attemptCount: { increment: 1 },
        lastError: null,
      },
    });
  }

  private async markStageSuccess(
    stageRow: OrderStage,
    data: {
      payload?: Record<string, unknown>;
      response?: Record<string, unknown>;
    },
  ): Promise<void> {
    await db.dataBase.orderStage.update({
      where: { id: stageRow.id },
      data: {
        status: OrderStageStatus.SUCCESS,
        payload: (data.payload ?? stageRow.payload ?? {}) as Prisma.InputJsonValue,
        response: (data.response ?? {}) as Prisma.InputJsonValue,
        lastError: null,
      },
    });
    await db.dataBase.order.update({
      where: { id: stageRow.orderId },
      data: {
        settlementStage: stageRow.stage,
      },
    });
  }

  private async markStageFail(
    stageRow: OrderStage,
    data: {
      payload?: Record<string, unknown>;
      response?: Record<string, unknown>;
      lastError: string;
    },
  ): Promise<void> {
    await db.dataBase.orderStage.update({
      where: { id: stageRow.id },
      data: {
        status: OrderStageStatus.FAIL,
        payload: (data.payload ?? stageRow.payload ?? {}) as Prisma.InputJsonValue,
        response: (data.response ?? {}) as Prisma.InputJsonValue,
        lastError: data.lastError.slice(0, 2000),
      },
    });
  }

  private stageResponseRecord(
    stageRow: OrderStage | undefined,
  ): Record<string, unknown> {
    if (!stageRow?.response || typeof stageRow.response !== "object") return {};
    return stageRow.response as Record<string, unknown>;
  }

  private async resolveInCrores(
    order: OrderWithNSEData,
    stages: OrderStage[],
  ): Promise<number> {
    const addIsin = stages.find((s) => s.stage === OrderPipelineStage.ADD_ISIN);
    const fromResponse = this.stageResponseRecord(addIsin).inCrores;
    if (typeof fromResponse === "number" && Number.isFinite(fromResponse)) {
      return fromResponse;
    }
    return (Number(order.faceValue) * Number(order.quantity)) / 10000000;
  }

  private async hasSuccessfulOrderLog(
    orderId: number,
    step: string,
  ): Promise<boolean> {
    const log = await db.dataBase.orderLogs.findFirst({
      where: { orderId, step, status: SettlementStatus.SUCCESS },
      select: { id: true },
    });
    return !!log;
  }

  /**
   * Resume-safe settlement runner (worker / cron / CRM resume-settlement).
   *
   * Behaviour:
   * 1. Skip every stage already marked SUCCESS.
   * 2. Start at the first failed / incomplete stage.
   * 3. If that stage succeeds, continue to the next stages in sequence.
   * 4. If it fails again, stop — do not run any later stage.
   *
   * Keeps initiateOrderSettlement untouched for rollback.
   *
   * @param opts.forceResume — CRM manual Continue: retry even if attemptCount
   *   already hit ORDER_STAGE_MAX_ATTEMPTS (cron stays capped).
   */
  async reconcileOrderSettlementByStages(
    orderId: number,
    isNetBanking: boolean,
    opts?: { forceResume?: boolean },
  ): Promise<{ status: "completed" | "failed" | "skipped_locked" | "max_attempts" }> {
    const forceResume = opts?.forceResume === true;
    const locked = await this.acquireStageLock(orderId);
    if (!locked) {
      logger.logInfo(`Order ${orderId} stage reconcile skipped — lock held`);
      return { status: "skipped_locked" };
    }

    let paymentIdForBatch = `order-${orderId}`;
    let batchId: string | null = null;
    let addIsinSnapshot: {
      rfqNumber?: string;
      isin?: string;
      inCrores?: number;
      rfqDbData?: { settlementDate?: string | null };
    } = {};

    try {
      await this.seedOrderStages(orderId, { isNetBanking });

      const getOrderData = async () =>
        this.orderService.getOrderWithNSEData(orderId);

      let order = await getOrderData();
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
        message: "Stage-based settlement processing batch initiated",
        inputData: {
          timestamp: new Date().toLocaleString(),
          orderId: order.id,
          isNetBanking,
          paymentId: order.paymentId,
          mode: "reconcileOrderSettlementByStages",
        },
        startedAt: new Date(),
      });

      let stages = await this.getStagesOrdered(order.id);
      let acceptNegotiationResponse: unknown;
      let proposeDealResponse: unknown;
      let acceptOrRejectDealResponse: unknown;
      let updateStatusResponse: unknown;
      let pipelineFailed = false;
      let maxAttemptsHit = false;

      // Resume rule: skip every SUCCESS stage; start at the first failed/incomplete
      // stage; only advance to later stages after that stage succeeds in this run.
      const completedStages = new Set(
        stages
          .filter((s) => s.status === OrderStageStatus.SUCCESS)
          .map((s) => s.stage),
      );

      const hydrateAddIsinSnapshot = (stageRow: OrderStage) => {
        if (stageRow.stage !== OrderPipelineStage.ADD_ISIN) return;
        const resp = this.stageResponseRecord(stageRow);
        addIsinSnapshot = {
          rfqNumber:
            typeof resp.rfqNumber === "string" ? resp.rfqNumber : undefined,
          isin: typeof resp.isin === "string" ? resp.isin : order.isin,
          inCrores:
            typeof resp.inCrores === "number" ? resp.inCrores : undefined,
          rfqDbData:
            (resp.rfqDbData as { settlementDate?: string | null }) ?? undefined,
        };
      };

      for (const stageRow of stages) {
        if (stageRow.status === OrderStageStatus.SUCCESS) {
          hydrateAddIsinSnapshot(stageRow);
        }
      }

      const resumeFromIndex = stages.findIndex(
        (s) => s.status !== OrderStageStatus.SUCCESS,
      );

      if (resumeFromIndex === -1) {
        logger.logInfo(
          `Order ${order.id}: settlement stages already complete — nothing to resume`,
        );
      } else {
        const resumeFrom = stages[resumeFromIndex]!;
        logger.logInfo(
          `Order ${order.id}: resuming settlement from stage ${resumeFrom.stage} (seq ${resumeFrom.seq}, status ${resumeFrom.status})`,
        );
        await this.addAutomationLog({
          orderId: order.id,
          paymentId,
          batchId,
          step: "SETTLEMENT_RESUME",
          status: "STARTED",
          message: `Resuming settlement from ${resumeFrom.stage}`,
          inputData: {
            resumeFromStage: resumeFrom.stage,
            resumeFromSeq: resumeFrom.seq,
            resumeFromStatus: resumeFrom.status,
            completedStages: [...completedStages],
          },
          startedAt: new Date(),
        });
      }

      // Only iterate from the first incomplete stage forward.
      for (
        let i = resumeFromIndex === -1 ? stages.length : resumeFromIndex;
        i < stages.length;
        i++
      ) {
        const stageRow = stages[i]!;

        if (
          stageRow.status === OrderStageStatus.SUCCESS ||
          completedStages.has(stageRow.stage)
        ) {
          completedStages.add(stageRow.stage);
          hydrateAddIsinSnapshot(stageRow);
          continue;
        }

        // Hard dependency: never start a stage unless every earlier stage succeeded.
        const priorIncomplete = ORDER_STAGE_SEQUENCE.filter(
          (s) => s.seq < stageRow.seq && !completedStages.has(s.stage),
        );
        if (priorIncomplete.length > 0) {
          pipelineFailed = true;
          const blockedBy = priorIncomplete.map((s) => s.stage).join(", ");
          logger.logError(
            `Order ${order.id}: blocked stage ${stageRow.stage} — prior incomplete: ${blockedBy}`,
          );
          await this.addAutomationLog({
            orderId: order.id,
            paymentId,
            batchId,
            step: `STAGE_${stageRow.stage}`,
            status: "FAILED",
            message: `Stage ${stageRow.stage} blocked until prior stages succeed`,
            inputData: {
              stage: stageRow.stage,
              blockedBy: priorIncomplete.map((s) => s.stage),
            },
            errorData: {
              error: `Previous stage(s) not successful: ${blockedBy}`,
            },
            completedAt: new Date(),
          });
          break;
        }

        if (stageRow.attemptCount >= ORDER_STAGE_MAX_ATTEMPTS) {
          if (forceResume) {
            logger.logInfo(
              `Order ${order.id}: stage ${stageRow.stage} at max attempts (${stageRow.attemptCount}/${ORDER_STAGE_MAX_ATTEMPTS}) — forceResume allows another try`,
            );
            await db.dataBase.orderStage.update({
              where: { id: stageRow.id },
              data: { attemptCount: 0 },
            });
            stageRow.attemptCount = 0;
          } else {
            maxAttemptsHit = true;
            logger.logError(
              `Order ${order.id}: stage ${stageRow.stage} exceeded max attempts (${ORDER_STAGE_MAX_ATTEMPTS}) — not executing. Use CRM Continue to force retry.`,
            );
            await this.addAutomationLog({
              orderId: order.id,
              paymentId,
              batchId,
              step: `STAGE_${stageRow.stage}`,
              status: "FAILED",
              message: `Stage ${stageRow.stage} blocked: max attempts (${ORDER_STAGE_MAX_ATTEMPTS}) reached`,
              inputData: {
                stage: stageRow.stage,
                attemptCount: stageRow.attemptCount,
              },
              completedAt: new Date(),
            });
            await sendSettlementAutomationFailureEmail({
              context: "ORDER",
              failedStep: `STAGE_MAX_ATTEMPTS_${stageRow.stage}`,
              error: new Error(
                `Stage ${stageRow.stage} exceeded max attempts (${ORDER_STAGE_MAX_ATTEMPTS})`,
              ),
              orderId: order.id,
              orderNumber: order.orderNumber,
              isin: order.isin,
              quantity: order.quantity,
              paymentId,
              batchId,
              customerName:
                order.customerProfile?.nseDataSet?.participant?.firstName ??
                null,
              ucc:
                order.customerProfile?.nseDataSet?.participant?.loginId ?? null,
              rfqNumber:
                addIsinSnapshot.rfqNumber ??
                (typeof (order.metadata as Record<string, unknown> | null)
                  ?.rfqNumber === "string"
                  ? String(
                      (order.metadata as Record<string, unknown>).rfqNumber,
                    )
                  : null),
            });
            break;
          }
        }

        // Skip PG API for non-netbanking only after live Razorpay method check.
        // Do not trust the job/cron isNetBanking flag alone.
        if (stageRow.stage === OrderPipelineStage.PG_ROUTING) {
          const routePayId = order.paymentId?.trim() || "";
          if (routePayId) {
            const eligibility =
              await resolveRazorpayRouteEligibility(routePayId);
            if (eligibility.skipReason === "not_netbanking") {
              await this.markStageSuccess(stageRow, {
                payload: {
                  skipped: true,
                  reason: "not_netbanking",
                  razorpayStatus: eligibility.payment.status,
                  razorpayMethod: eligibility.payment.method ?? null,
                },
                response: {
                  skipped: true,
                  reason: "not_netbanking",
                  razorpayStatus: eligibility.payment.status,
                  razorpayMethod: eligibility.payment.method ?? null,
                },
              });
              completedStages.add(stageRow.stage);
              continue;
            }
          }
        }

        const waitingRow = await this.markStageWaiting(stageRow);
        const payload: Record<string, unknown> = {
          orderId: order.id,
          stage: stageRow.stage,
          isNetBanking,
          paymentId,
        };

        logger.logInfo(
          `Order ${order.id}: executing stage ${stageRow.stage} (attempt ${waitingRow.attemptCount}/${ORDER_STAGE_MAX_ATTEMPTS})`,
        );

        // Failed stages must be re-attempted. Idempotent skip must not mark FAIL→SUCCESS
        // and then continue to later stages on a manual resume.
        const allowIdempotentSkip =
          stageRow.status !== OrderStageStatus.FAIL;

        try {
          // Idempotency: if prior SUCCESS log / IDs exist, mark success without re-calling NSE
          if (
            allowIdempotentSkip &&
            stageRow.stage === OrderPipelineStage.ADD_ISIN
          ) {
            const existingRfq = await this.getRfqNumber(order);
            if (existingRfq) {
              const inCrores = await this.resolveInCrores(order, stages);
              addIsinSnapshot = {
                rfqNumber: existingRfq,
                isin: order.isin,
                inCrores,
              };
              await this.markStageSuccess(waitingRow, {
                payload,
                response: {
                  skipped: true,
                  reason: "already_succeeded",
                  rfqNumber: existingRfq,
                  inCrores,
                  isin: order.isin,
                },
              });
              completedStages.add(stageRow.stage);
              continue;
            }
          }

          if (
            allowIdempotentSkip &&
            stageRow.stage === OrderPipelineStage.QUOTE_ACCEPT
          ) {
            const negotiationId = await this.getNegotiationId(order);
            if (negotiationId) {
              await this.markStageSuccess(waitingRow, {
                payload,
                response: {
                  skipped: true,
                  reason: "already_succeeded",
                  negotiationId,
                },
              });
              completedStages.add(stageRow.stage);
              continue;
            }
          }

          if (
            allowIdempotentSkip &&
            (stageRow.stage === OrderPipelineStage.DEAL_PROPOSE ||
              stageRow.stage === OrderPipelineStage.DEAL_ACCEPT)
          ) {
            const step =
              stageRow.stage === OrderPipelineStage.DEAL_PROPOSE
                ? SettlementStep.PROPOSE_DEAL
                : SettlementStep.ACCEPT_OR_REJECT_DEAL;
            if (await this.hasSuccessfulOrderLog(order.id, step)) {
              await this.markStageSuccess(waitingRow, {
                payload,
                response: { skipped: true, reason: "already_succeeded" },
              });
              completedStages.add(stageRow.stage);
              continue;
            }
          }

          if (
            allowIdempotentSkip &&
            stageRow.stage === OrderPipelineStage.PG_ROUTING
          ) {
            if (order.transferId) {
              await this.markStageSuccess(waitingRow, {
                payload,
                response: {
                  skipped: true,
                  reason: "transfer_already_exists",
                  transferId: order.transferId,
                },
              });
              completedStages.add(stageRow.stage);
              continue;
            }
          }

          let response: Record<string, unknown> = {};

          if (stageRow.stage === OrderPipelineStage.ADD_ISIN) {
            const result = await this.addIsinToSettlement(order, { paymentId });
            addIsinSnapshot = {
              rfqNumber: result.rfqNumber,
              isin: result.isin,
              inCrores: result.inCrores,
              rfqDbData: result.rfqDbData,
            };
            response = {
              rfqNumber: result.rfqNumber,
              isin: result.isin,
              inCrores: result.inCrores,
              quantity: result.quantity,
              rfqDbData: result.rfqDbData,
            };
            await new Promise((resolve) => setTimeout(resolve, 10000));
          } else if (stageRow.stage === OrderPipelineStage.QUOTE_ACCEPT) {
            const inCrores = await this.resolveInCrores(order, stages);
            payload.inCrores = inCrores;
            payload.rfqNumber =
              addIsinSnapshot.rfqNumber ?? (await this.getRfqNumber(order));
            const result = await this.acceptNegotiation(order, inCrores);
            acceptNegotiationResponse = result;
            response = {
              rfqNumber: result.rfqNumber,
              negotiationId: result.negotiationId,
            };
            await new Promise((resolve) => setTimeout(resolve, 10000));
          } else if (stageRow.stage === OrderPipelineStage.DEAL_PROPOSE) {
            const result = await this.proposeDeal(order);
            proposeDealResponse = result;
            response = { ...result };
            await new Promise((resolve) => setTimeout(resolve, 10000));
          } else if (stageRow.stage === OrderPipelineStage.DEAL_ACCEPT) {
            const result = await this.acceptOrRejectDeal(order);
            acceptOrRejectDealResponse = result;
            response = { ...result };
            // Post-step (not a stage row): update order status like current flow
            updateStatusResponse = await this.updateOrderStatus(order.id);
          } else if (stageRow.stage === OrderPipelineStage.PG_ROUTING) {
            if (order.customerProfileId == null) {
              throw new Error(
                "Razorpay route transfer requested for a participant-counterparty order; this is not supported.",
              );
            }
            const customerProfileId = order.customerProfileId;
            const rfqNumber =
              addIsinSnapshot.rfqNumber ??
              (await this.getRfqNumber(order)) ??
              "";
            const routeAmount = Number(order.totalAmount.toFixed(4));
            const routePayId = order.paymentId?.trim() || "";
            if (!routePayId) {
              throw new Error(
                "No Razorpay paymentId on order — cannot verify payment or create route transfer",
              );
            }

            // Live pre-check: payment status + netbanking method before routing funds.
            const eligibility =
              await resolveRazorpayRouteEligibility(routePayId);
            payload.razorpayPaymentStatus = eligibility.payment.status;
            payload.razorpayPaymentMethod =
              eligibility.payment.method ?? null;
            payload.isNetBanking = eligibility.isNetBanking;

            if (eligibility.skipReason === "not_netbanking") {
              response = {
                skipped: true,
                reason: "not_netbanking",
                razorpayStatus: eligibility.payment.status,
                razorpayMethod: eligibility.payment.method ?? null,
              };
              await this.markStageSuccess(waitingRow, { payload, response });
              completedStages.add(stageRow.stage);
              continue;
            }

            if (!eligibility.canRoute) {
              throw new Error(
                eligibility.blockReason ??
                  "Payment not ready for Razorpay route transfer",
              );
            }

            const routeUcc =
              order.customerProfile?.nseDataSet?.participant?.loginId;
            payload.rfqNumber = rfqNumber;
            payload.amount = Number(order.totalAmount);
            const transferResult = await this.runWithAutomationLog({
              orderId: order.id,
              paymentId,
              batchId,
              step: "RAZORPAY_ROUTE_TRANSFER",
              message: "Create Razorpay route transfer",
              inputData: {
                amount: Number(order.totalAmount),
                payId: routePayId,
                userId: customerProfileId,
                rfqNumber,
                isin: addIsinSnapshot.isin ?? order.isin,
                razorpayStatus: eligibility.payment.status,
                razorpayMethod: eligibility.payment.method ?? null,
              },
              fn: () =>
                makeRazorpayRouteTransition({
                  amount: routeAmount,
                  payId: routePayId,
                  userId: customerProfileId,
                  notes: {
                    RFQ_NUMBER: rfqNumber,
                    UCC: routeUcc,
                  },
                }),
            });
            response = {
              transfer: transferResult as unknown as Record<string, unknown>,
              razorpayStatus: eligibility.payment.status,
              razorpayMethod: eligibility.payment.method ?? null,
            };
            order = (await getOrderData()) ?? order;
          } else {
            throw new AppError(`Unknown settlement stage: ${stageRow.stage}`, {
              code: "UNKNOWN_STAGE",
            });
          }

          await this.markStageSuccess(waitingRow, { payload, response });
          completedStages.add(stageRow.stage);
          // Success → loop advances to the next stage in sequence.
        } catch (error) {
          pipelineFailed = true;
          const lastError =
            error instanceof Error ? error.message : "Unknown error";
          const errorResponse: Record<string, unknown> = {
            error: lastError,
            stack: error instanceof Error ? error.stack : undefined,
            nseResponse:
              error instanceof AxiosError ? error.response?.data : undefined,
          };
          await this.markStageFail(waitingRow, {
            payload,
            response: errorResponse,
            lastError,
          });

          await this.addAutomationLog({
            orderId: order.id,
            paymentId,
            batchId,
            step: `STAGE_${stageRow.stage}`,
            status: "FAILED",
            message: `Stage ${stageRow.stage} failed — pipeline stopped; later stages not run`,
            inputData: payload,
            errorData: errorResponse,
            completedAt: new Date(),
          });

          await sendSettlementAutomationFailureEmail({
            context: "ORDER",
            failedStep: stageRow.stage,
            error,
            orderId: order.id,
            orderNumber: order.orderNumber,
            isin: order.isin,
            quantity: order.quantity,
            paymentId,
            batchId,
            customerName:
              order.customerProfile?.nseDataSet?.participant?.firstName ?? null,
            ucc: order.customerProfile?.nseDataSet?.participant?.loginId ?? null,
            rfqNumber: addIsinSnapshot.rfqNumber ?? null,
          });

          // Failed stage stays failed. Do not advance. Next resume retries here again.
          break;
        }
      }

      if (pipelineFailed) {
        await this.addAutomationLog({
          orderId: order.id,
          paymentId,
          batchId,
          step: "SETTLEMENT_BATCH",
          status: "FAILED",
          message: "Stage-based settlement batch stopped on failure",
          completedAt: new Date(),
        });
        return { status: "failed" };
      }

      if (maxAttemptsHit) {
        await this.addAutomationLog({
          orderId: order.id,
          paymentId,
          batchId,
          step: "SETTLEMENT_BATCH",
          status: "FAILED",
          message: "Stage-based settlement batch stopped: max attempts reached",
          completedAt: new Date(),
        });
        return { status: "max_attempts" };
      }

      stages = await this.getStagesOrdered(order.id);
      const allSuccess = stages.every((s) => s.status === OrderStageStatus.SUCCESS);
      if (!allSuccess) {
        return { status: "failed" };
      }

      await this.addAutomationLog({
        orderId: order.id,
        paymentId,
        batchId,
        step: "SETTLEMENT_BATCH",
        status: "SUCCESS",
        message: "Stage-based settlement batch completed",
        outputData: {
          rfqNumber: addIsinSnapshot.rfqNumber,
          isNetBanking,
        },
        completedAt: new Date(),
      });

      await db.dataBase.orderSettlementAutomationLog.updateMany({
        where: {
          paymentId,
          batchId,
          status: { in: ["IN_PROGRESS", "STARTED"] },
        },
        data: {
          status: "SUCCESS",
          message: "Auto-marked success after stage batch completion",
          completedAt: new Date(),
        },
      });

      // Post-pipeline: settled orders sync + receipt email (same as initiateOrderSettlement)
      const rfqMasterService = new RfqMasterService();
      await new Promise((resolve) => setTimeout(resolve, 30000));
      const todayDate = new Date().toISOString().split("T")[0]?.split("-").reverse().join("-");
      const d = new Date();
      const istYmd = d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
      const [y, m, day] = istYmd.split("-").map(Number);
      const tomorrowIst = new Date(Date.UTC(y!, (m ?? 1) - 1, (day ?? 1) + 1, 12));
      const nextDate = tomorrowIst
        .toLocaleDateString("en-GB", { timeZone: "Asia/Kolkata" })
        .replaceAll("/", "-");

      await rfqMasterService.getAllSettledOrders({
        filtFromModSettleDate: todayDate || "",
        filtToModSettleDate: nextDate,
      });

      const updatedOrder = await getOrderData();
      if (updatedOrder) {
        await this.trySendOrderReceiptPdfEmail({
          order: updatedOrder,
          paymentId,
          batchId,
          settlementDate: addIsinSnapshot.rfqDbData?.settlementDate ?? "",
          inputData: {
            rfqNumber: addIsinSnapshot.rfqNumber,
            addIsinResponse: addIsinSnapshot,
            acceptNegotiationResponse,
            proposeDealResponse,
            acceptOrRejectDealResponse,
            updateStatusResponse,
            isNetBanking,
            mode: "reconcileOrderSettlementByStages",
          },
        });
      }

      return { status: "completed" };
    } catch (error) {
      logger.logError(
        `Stage-based settlement failed for order ${orderId}:`,
        error,
      );
      if (batchId) {
        await this.addAutomationLog({
          orderId,
          paymentId: paymentIdForBatch,
          batchId,
          step: "SETTLEMENT_BATCH",
          status: "FAILED",
          message: "Stage-based settlement batch failed",
          errorData: {
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
          },
          completedAt: new Date(),
        });
      }
      throw error;
    } finally {
      await this.releaseStageLock(orderId);
    }
  }
}
