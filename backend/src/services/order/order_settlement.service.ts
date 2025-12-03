import { AppError } from "@utils/error/AppError";
import { NseRfq } from "@modules/RFQ/nse/nse_RFQ";
import { NseCBRICS } from "@modules/RFQ/nse/nse_CBRICS";
import { OrderService } from "@resource/customer/order/order.service";
import logger from "@utils/logger/logger";
import type {
  Order,
  NseCbricsParticipantModel,
  OrderTracking,
} from "@databases/generated/prisma/postgres";
import type { CreateNegotiationResponse } from "@modules/RFQ/nse/rfq.types";

// Type definitions for settlement service
interface OrderWithNSEData extends Omit<Order, "customerProfile"> {
  customerProfile: {
    nseDataSet?: {
      participant: NseCbricsParticipantModel;
    } | null;
  } | null;
  orderTracking?: OrderTracking[];
}

interface NegotiationData extends CreateNegotiationResponse {
  lastUpdated?: string;
  status?: string;
}

interface OrderMetadata {
  rfqNumber?: string;
  negotiationId?: string;
  settlementStep?: string;
  settlementError?: string;
  settlementFailedAt?: string;
  settledAt?: string;
  settlementStatus?: string;
  accruedInterest?: number;
}

export class OrderSettlementService {
  private nseRfq: NseRfq;
  private nseCbrics: NseCBRICS;
  private orderService: OrderService;

  constructor() {
    this.nseRfq = new NseRfq();
    this.nseCbrics = new NseCBRICS();
    this.orderService = new OrderService();
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

      // Step 2: Accept negotiation quote
      await this.acceptNegotiation(order, participant);
      order = await getOrderData(); // Refresh order data

      // Step 3: Propose deal
      await this.proposeDeal(order, participant);
      order = await getOrderData(); // Refresh order data

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
      await this.orderService.updateOrderStatus(orderId, "REJECTED");
      await this.orderService.updateOrderSettlementMetadata(orderId, {
        settlementError:
          error instanceof Error ? error.message : "Unknown error",
        settlementFailedAt: new Date().toISOString(),
      });

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
      const valueInCrores = (order.faceValue * order.quantity) / 1000000000; // Convert to crores

      // Create RFQ for the ISIN
      const rfqResponse = await this.nseRfq.createRfq({
        isin: order.isin,
        participantCode: participant.loginId,
        dealType: "D", // Direct deal
        clientCode: participant.loginId,
        buySell: "B", // Buy
        quoteType: "B", // Both price and yield
        settlementType: 1, // T+1
        value: valueInCrores,
        quantity: order.quantity,
        yieldType: "YTM",
        yield: 0, // Will be calculated by NSE
        calcMethod: "M", // Money market
        price: order.unitPrice,
        gtdFlag: "Y", // Valid till day end
        quoteNegotiable: "Y", // Negotiable
        anonymous: "N", // Not anonymous
      });

      // Store RFQ details in order metadata (rfqResponse is an array)
      const rfqDetails = rfqResponse[0];
      await this.orderService.updateOrderSettlementMetadata(order.id, {
        rfqNumber: rfqDetails.number,
        settlementStep: "RFQ_CREATED",
      });

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

      // Use stored RFQ number from metadata
      const metadata = order.metadata as OrderMetadata;
      const rfqNumber = metadata?.rfqNumber;
      if (!rfqNumber) {
        throw new AppError("RFQ number not found in order metadata", {
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
        .filter((neg: NegotiationData) => neg.status === "A") // 'A' for Active
        .sort(
          (a: NegotiationData, b: NegotiationData) =>
            new Date(b.lastUpdated || 0).getTime() -
            new Date(a.lastUpdated || 0).getTime()
        )[0];

      if (!activeNegotiation) {
        throw new AppError("No active negotiations found", {
          code: "NO_ACTIVE_NEGOTIATIONS",
        });
      }

      // Accept the best quote from the negotiation
      await this.nseRfq.acceptNegotiationQuote({
        rfqNumber: rfqNumber,
        acceptedValue:
          (activeNegotiation.quantity * activeNegotiation.price) / 1000000000, // Convert to crores
        id: activeNegotiation.id,
        acceptedSettlementDate: this.getNextSettlementDate(),
        acceptedYieldType: "YTM",
        acceptedYield: activeNegotiation.yield,
        acceptedPrice: activeNegotiation.price,
        respDealType: "D", // Direct deal
        respClientCode: participant.loginId,
        role: "I", // Initiator
      });

      // Store negotiation ID in metadata
      await this.orderService.updateOrderSettlementMetadata(order.id, {
        negotiationId: activeNegotiation.id,
        settlementStep: "NEGOTIATION_ACCEPTED",
      });

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

      // Use stored RFQ and negotiation IDs from metadata
      const rfqNumber = await this.getRfqNumber(order);
      const negotiationId = await this.getNegotiationId(order);

      if (!rfqNumber || !negotiationId) {
        throw new AppError(
          "RFQ number or negotiation ID not found in order metadata",
          { code: "MISSING_METADATA" }
        );
      }

      // Calculate consideration: quantity * price / 100 + accrued interest
      const metadata = order.metadata as OrderMetadata;
      const accruedInterest = metadata?.accruedInterest || 0;
      const consideration =
        (order.quantity * Number(order.unitPrice)) / 100 + accruedInterest;

      await this.nseRfq.proposeDeal({
        ngRfqNumber: rfqNumber,
        ngId: negotiationId,
        participantCode: participant.loginId,
        dealType: "D", // Direct deal
        clientCode: participant.loginId,
        price: order.unitPrice,
        accruedInterest: accruedInterest,
        consideration: consideration,
        calcMethod: "M", // Money market
        remarks: `Auto-proposed deal for order ${order.id}`,
      });

      // Update metadata
      await this.orderService.updateOrderSettlementMetadata(order.id, {
        settlementStep: "DEAL_PROPOSED",
      });

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

      const participant = order.customerProfile.nseDataSet.participant;

      // Use stored RFQ and negotiation IDs from metadata
      const rfqNumber = await this.getRfqNumber(order);
      const negotiationId = await this.getNegotiationId(order);

      if (!rfqNumber || !negotiationId) {
        throw new AppError(
          "RFQ number or negotiation ID not found in order metadata",
          { code: "MISSING_METADATA" }
        );
      }

      // Calculate accepted values (should match proposed values)
      const metadata = order.metadata as OrderMetadata;
      const acceptedAccruedInterest = metadata?.accruedInterest || 0;
      const acceptedConsideration =
        (order.quantity * Number(order.unitPrice)) / 100 +
        acceptedAccruedInterest;

      await this.nseRfq.acceptOrRejectDeal({
        rfqNumber: rfqNumber,
        id: negotiationId,
        acceptedPrice: order.unitPrice,
        acceptedAccruedInterest: acceptedAccruedInterest,
        acceptedConsideration: acceptedConsideration,
        confirmStatus: "PC", // PC = Accept
        respClientCode: participant.loginId,
        respRole: "I", // Initiator
      });

      // Update metadata
      await this.orderService.updateOrderSettlementMetadata(order.id, {
        settlementStep: "DEAL_ACCEPTED",
      });

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
      await this.orderService.updateOrderStatus(orderId, "SETTLED");
      await this.orderService.updateOrderSettlementMetadata(orderId, {
        settledAt: new Date().toISOString(),
        settlementStatus: "COMPLETED",
      });

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
    return dateStr;
  }

  /**
   * Helper to get RFQ Number from metadata or tracking history
   */
  private async getRfqNumber(
    order: OrderWithNSEData
  ): Promise<string | undefined> {
    // Try metadata first (legacy/fast access)
    const metadata = order.metadata as OrderMetadata;
    if (metadata?.rfqNumber) return metadata.rfqNumber;

    // Fallback to tracking table
    const tracking = await this.orderService.getOrderTracking(order.id);
    const rfqStep = tracking.find(
      (t) => t.step === "RFQ_CREATED" && t.status === "SUCCESS"
    );
    return (rfqStep?.outputData as { rfqNumber: string })?.rfqNumber;
  }

  private async getNegotiationId(
    order: OrderWithNSEData
  ): Promise<string | undefined> {
    const metadata = order.metadata as OrderMetadata;
    if (metadata?.negotiationId) return metadata.negotiationId;

    const tracking = await this.orderService.getOrderTracking(order.id);
    const step = tracking.find(
      (t) => t.step === "NEGOTIATION_ACCEPTED" && t.status === "SUCCESS"
    );
    return (step?.outputData as { negotiationId: string })?.negotiationId;
  }
}
