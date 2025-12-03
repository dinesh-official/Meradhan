import { AppError } from "@utils/error/AppError";
import { NseRfq } from "@modules/RFQ/nse/nse_RFQ";
import { NseCBRICS } from "@modules/RFQ/nse/nse_CBRICS";
import { OrderService } from "@resource/customer/order/order.service";
import logger from "@utils/logger/logger";
import type {
  Order,
  NseCbricsParticipantModel,
  OrderLogs,
} from "@databases/generated/prisma/postgres";
import { OrderStatus } from "@databases/generated/prisma/postgres";
import type { CreateNegotiationResponse } from "@modules/RFQ/nse/rfq.types";
import { RfqMasterDbSyncManager } from "@resource/crm/refq/nse/rfq_master/rfq_master.manager";

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
  private nseRfq: NseRfq;
  private nseCbrics: NseCBRICS;
  private orderService: OrderService;
  private rfqMasterDbSyncManager: RfqMasterDbSyncManager;
  constructor() {
    this.nseRfq = new NseRfq();
    this.nseCbrics = new NseCBRICS();
    this.orderService = new OrderService();
    this.rfqMasterDbSyncManager = new RfqMasterDbSyncManager();
  }

  /**
   * Initiates order settlement by calling the 4 NSE APIs in sequence
   */
  async initiateOrderSettlement(orderId: number): Promise<void> {
    try {
      logger.logInfo(`Starting settlement process for order: ${orderId}`);

      // Get order details with fresh data for each step
      const getOrderData = async () => {
        return await this.orderService.getOrderWithNSEData(orderId);
      };

      let order = await getOrderData();

      if (!order) {
        throw new AppError("Order not found", { code: "ORDER_NOT_FOUND" });
      }

      if (!order?.customerProfile?.nseDataSet?.participant) {
        throw new AppError("NSE participant data not found for customer", {
          code: "NSE_PARTICIPANT_NOT_FOUND",
        });
      }

      const participant = order.customerProfile.nseDataSet.participant;

      // Step 1: Add ISIN to settlement (addisin)
      await this.addIsinToSettlement(order, participant);
      order = await getOrderData(); // Refresh order data
      if (!order) {
        throw new AppError("Order not found after refresh", {
          code: "ORDER_NOT_FOUND",
        });
      }

      // Step 2: Accept negotiation quote
      await this.acceptNegotiation(order, participant);
      order = await getOrderData(); // Refresh order data
      if (!order) {
        throw new AppError("Order not found after refresh", {
          code: "ORDER_NOT_FOUND",
        });
      }

      // Step 3: Propose deal
      await this.proposeDeal(order, participant);
      order = await getOrderData(); // Refresh order data
      if (!order) {
        throw new AppError("Order not found after refresh", {
          code: "ORDER_NOT_FOUND",
        });
      }

      // Step 4: Accept/Reject deal
      await this.acceptOrRejectDeal(order);

      // Step 5: Update order status to settled
      await this.updateOrderStatus(orderId);

      logger.logInfo(
        `Settlement process completed successfully for order: ${orderId}`
      );
    } catch (error) {
      logger.logError(`Settlement process failed for order ${orderId}:`, error);

      // Update order status to failed settlement
      await this.orderService.updateOrderStatus(orderId, OrderStatus.REJECTED);

      // Log settlement failure
      await this.orderService.addOrderLog(
        orderId,
        "SETTLEMENT_FAILED",
        "FAILED",
        { failedAt: new Date().toISOString() },
        {
          error: error instanceof Error ? error.message : "Unknown error",
          errorStack: error instanceof Error ? error.stack : undefined,
        }
      );

      throw error;
    }
  }

  /**
   * Step 1: Add ISIN to RFQ (addisin)
   */
  private async addIsinToSettlement(
    order: OrderWithNSEData,
    participant: NseCbricsParticipantModel
  ): Promise<void> {
    try {
      logger.logInfo(
        `Creating RFQ for ISIN ${order.isin} for order ${order.id}`
      );

      // Calculate value in crores (face value * quantity / 100)
      const faceValueNum = Number(order.faceValue);
      const valueInCrores = (faceValueNum * order.quantity) / 1000000000; // Convert to crores

      // Create RFQ for the ISIN
      const rfqResponse = await this.nseRfq.createRfq({
        isin: order.isin,
        participantCode: 'MD123456',
        dealType: "B", // Brokered deal
        clientCode: 'BCISAPL',
        buySell: "B", // Buy
        quoteType: "Y", // Only yield
        settlementType: 1, // T+1
        value: valueInCrores,
        quantity: order.quantity,
        yieldType: "YTM",
        yield: 10.0000, // Will be calculated by NSE
        calcMethod: "O", // Other
        price: null,
        gtdFlag: "Y", // Valid till day end
        quoteNegotiable: "Y", // Negotiable
        access: 2, // OTO (One to one)
      });

      // Store RFQ details in order logs (rfqResponse is an array)
      const rfqDetails = rfqResponse[0];
      if (!rfqDetails) {
        throw new AppError("RFQ response is empty", {
          code: "RFQ_RESPONSE_EMPTY",
        });
      }

      // await this.rfqMasterDbSyncManager.syncRfqMasterData(rfqDetails, order.id);

      await this.orderService.addOrderLog(
        order.id,
        "RFQ_CREATED",
        "SUCCESS",
        { rfqNumber: rfqDetails.number },
        { rfqResponse: rfqDetails }
      );

      logger.logInfo(
        `RFQ created successfully for ISIN ${order.isin} with RFQ number: ${rfqDetails.number}`
      );
    } catch (error) {
      logger.logError(`Failed to create RFQ for ISIN:`, error);
      throw new AppError("Failed to create RFQ for ISIN", {
        code: "SETTLEMENT_ISIN_FAILED",
      });
    }
  }

  /**
   * Step 2: Accept negotiation quote
   */
  private async acceptNegotiation(
    order: OrderWithNSEData,
    participant: NseCbricsParticipantModel
  ): Promise<void> {
    try {
      logger.logInfo(`Accepting negotiation for order ${order.id}`);

      // Get RFQ number from logs
      const rfqNumber = await this.getRfqNumber(order);
      if (!rfqNumber) {
        throw new AppError("RFQ number not found in order logs", {
          code: "RFQ_NUMBER_MISSING",
        });
      }

      // Get all negotiations for this RFQ
      const negotiations = await this.nseRfq.getAllNegotiations({
        rfqNumber: rfqNumber,
      });

      if (!negotiations || negotiations.length === 0) {
        throw new AppError("No negotiations found for this RFQ", {
          code: "NO_NEGOTIATIONS_FOUND",
        });
      }

      // Find the most recent active negotiation
      const activeNegotiation = negotiations
        .filter((neg: CreateNegotiationResponse) => neg.status === "A") // 'A' for Active
        .sort(
          (a: CreateNegotiationResponse, b: CreateNegotiationResponse) =>
            new Date(b.lastActivityTimestamp || 0).getTime() -
            new Date(a.lastActivityTimestamp || 0).getTime()
        )[0];

      if (!activeNegotiation) {
        throw new AppError("No active negotiations found", {
          code: "NO_ACTIVE_NEGOTIATIONS",
        });
      }

      // Use initQuantity/initPrice/initYield or respQuantity/respPrice/respYield based on role
      // Since we're the initiator, prefer init values, fallback to resp values
      const quantity =
        activeNegotiation.initQuantity ?? activeNegotiation.respQuantity ?? 0;
      const price =
        activeNegotiation.initPrice ?? activeNegotiation.respPrice ?? 0;
      const yieldValue =
        activeNegotiation.initYield ?? activeNegotiation.respYield ?? 0;

      if (!quantity || !price) {
        throw new AppError(
          "Invalid negotiation data: missing quantity or price",
          {
            code: "INVALID_NEGOTIATION_DATA",
          }
        );
      }

      // Accept the best quote from the negotiation
      await this.nseRfq.acceptNegotiationQuote({
        rfqNumber: rfqNumber,
        acceptedValue: (quantity * price) / 1000000000, // Convert to crores
        id: activeNegotiation.id,
        acceptedSettlementDate: this.getNextSettlementDate(),
        acceptedYieldType: "YTM",
        acceptedYield: yieldValue,
        acceptedPrice: price,
        respDealType: "D", // Direct deal
        respClientCode: participant.loginId,
        role: "I", // Initiator
      });

      // Store negotiation ID in logs
      await this.orderService.addOrderLog(
        order.id,
        "NEGOTIATION_ACCEPTED",
        "SUCCESS",
        { negotiationId: activeNegotiation.id },
        { negotiation: activeNegotiation }
      );

      logger.logInfo(`Negotiation accepted successfully for order ${order.id}`);
    } catch (error) {
      logger.logError(`Failed to accept negotiation:`, error);
      throw new AppError("Failed to accept negotiation", {
        code: "NEGOTIATION_ACCEPT_FAILED",
      });
    }
  }

  /**
   * Step 3: Propose deal (POST /rest/v1/deal/propose)
   */
  private async proposeDeal(
    order: OrderWithNSEData,
    participant: NseCbricsParticipantModel
  ): Promise<void> {
    try {
      logger.logInfo(`Proposing deal for order ${order.id}`);

      // Use stored RFQ and negotiation IDs from logs
      const rfqNumber = await this.getRfqNumber(order);
      const negotiationId = await this.getNegotiationId(order);

      if (!rfqNumber || !negotiationId) {
        throw new AppError(
          "RFQ number or negotiation ID not found in order logs",
          { code: "MISSING_METADATA" }
        );
      }

      // Calculate consideration: quantity * price / 100 + accrued interest
      const accruedInterest = await this.getAccruedInterest(order);
      const unitPriceNum = Number(order.unitPrice);
      const consideration =
        (order.quantity * unitPriceNum) / 100 + accruedInterest;

      await this.nseRfq.proposeDeal({
        ngRfqNumber: rfqNumber,
        ngId: negotiationId,
        participantCode: participant.loginId,
        dealType: "D", // Direct deal
        clientCode: participant.loginId,
        price: unitPriceNum,
        accruedInterest: accruedInterest,
        consideration: consideration,
        calcMethod: "M", // Money market
        remarks: `Auto-proposed deal for order ${order.id}`,
      });

      // Log deal proposal
      await this.orderService.addOrderLog(
        order.id,
        "DEAL_PROPOSED",
        "SUCCESS",
        { rfqNumber, negotiationId, consideration, accruedInterest },
        { dealDetails: { price: order.unitPrice, calcMethod: "M" } }
      );

      logger.logInfo(`Deal proposed successfully for order ${order.id}`);
    } catch (error) {
      logger.logError(`Failed to propose deal:`, error);
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
      const unitPriceNum = Number(order.unitPrice);
      const acceptedConsideration =
        (order.quantity * unitPriceNum) / 100 + acceptedAccruedInterest;

      await this.nseRfq.acceptOrRejectDeal({
        rfqNumber: rfqNumber,
        id: negotiationId,
        acceptedPrice: unitPriceNum,
        acceptedAccruedInterest: acceptedAccruedInterest,
        acceptedConsideration: acceptedConsideration,
        confirmStatus: "PC", // PC = Accept
      });

      // Log deal acceptance
      await this.orderService.addOrderLog(
        order.id,
        "DEAL_ACCEPTED",
        "SUCCESS",
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
      logger.logError(`Failed to accept deal:`, error);
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
        "SETTLEMENT_COMPLETED",
        "SUCCESS",
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

  /**
   * Get next settlement date (T+1 business day)
   */
  private getNextSettlementDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Skip weekends
    if (tomorrow.getDay() === 0) {
      // Sunday
      tomorrow.setDate(tomorrow.getDate() + 1);
    } else if (tomorrow.getDay() === 6) {
      // Saturday
      tomorrow.setDate(tomorrow.getDate() + 2);
    }

    const dateStr = tomorrow.toISOString().split("T")[0];
    if (!dateStr) {
      throw new AppError("Failed to generate settlement date", {
        code: "SETTLEMENT_DATE_GENERATION_FAILED",
      });
    }
    return dateStr;
  }

  /**
   * Helper to get RFQ Number from order logs
   */
  private async getRfqNumber(
    order: OrderWithNSEData
  ): Promise<string | undefined> {
    const logs = await this.orderService.getOrderLogs(order.id);
    const rfqStep = logs.find(
      (t) => t.step === "RFQ_CREATED" && t.status === "SUCCESS"
    );
    return (rfqStep?.outputData as { rfqNumber: string })?.rfqNumber;
  }

  /**
   * Helper to get Negotiation ID from order logs
   */
  private async getNegotiationId(
    order: OrderWithNSEData
  ): Promise<string | undefined> {
    const logs = await this.orderService.getOrderLogs(order.id);
    const step = logs.find(
      (t) => t.step === "NEGOTIATION_ACCEPTED" && t.status === "SUCCESS"
    );
    return (step?.outputData as { negotiationId: string })?.negotiationId;
  }

  /**
   * Helper to get Accrued Interest from order logs
   */
  private async getAccruedInterest(order: OrderWithNSEData): Promise<number> {
    const logs = await this.orderService.getOrderLogs(order.id);
    const dealStep = logs.find(
      (t) => t.step === "DEAL_PROPOSED" && t.status === "SUCCESS"
    );
    return (
      (dealStep?.outputData as { accruedInterest?: number })?.accruedInterest ||
      0
    );
  }
}
