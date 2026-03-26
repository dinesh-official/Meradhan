import type {
  NseCbricsParticipantModel,
  Order,
  OrderLogs,
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

  async initiateOrderSettlement(orderId: number): Promise<void> {
    console.log("initiateOrderSettlement", orderId);

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

      console.log("add isin to settlement");
      // Step 1: Add ISIN to settlement (addisin)
      const addIsinResponse = await this.addIsinToSettlement(order);
      await new Promise((resolve) => setTimeout(resolve, 10000));

      console.log("accepted negotiation");
      // Step 2: Accept negotiation quote
      await this.acceptNegotiation(order, addIsinResponse.inCrores);
      await new Promise((resolve) => setTimeout(resolve, 10000));

      console.log("propose deal");
      // Step 3: Propose deal
      await this.proposeDeal(order);
      await new Promise((resolve) => setTimeout(resolve, 10000));

      console.log("accept or reject deal");
      // Step 4: Accept/Reject deal
      await this.acceptOrRejectDeal(order);

      console.log("update order status");
      await this.updateOrderStatus(orderId);
    } catch (error) {
      logger.logError(`Settlement process failed for order ${orderId}:`, error);

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

      throw error;
    }
  }

  /**
   * Step 1: Add ISIN to RFQ (addisin)
   */
  async addIsinToSettlement(order: OrderWithNSEData) {
    try {
      logger.logInfo(
        `Creating RFQ for ISIN ${order.isin} for order ${order.id}`
      );

      // Using fixed values from the working payload
      console.log(NSE_CONSTANTS);
      const bondData = await db.dataBase.nseIsinSecurityReceipt.findFirst({
        where: {
          symbol: order.isin,
        },
      });
      if (!bondData) {
        throw new AppError("Bond data not found for ISIN", {
          code: "BOND_DATA_NOT_FOUND",
        });
      }

      const fv = bondData?.faceValue ?? 0;
      const quantity = order.quantity;
      const value = fv * quantity;
      const inCrores = value / 10000000;

      console.log("inCrores", inCrores);



      // Create RFQ for the ISIN using the working payload structure
      const rfqResponse = await this.nseRfq.createRfq({

        segment: NSE_CONSTANTS.SEGMENT.RFQ,
        isin: order.isin,
        participantCode: NSE_CONSTANTS.PARTICIPANT.CODE,
        dealType: NSE_CONSTANTS.DEAL_TYPE.DIRECT,
        clientCode: NSE_CONSTANTS.PARTICIPANT.CODE,
        buySell: NSE_CONSTANTS.DEAL_TYPE.BUY,
        quoteType: NSE_CONSTANTS.QUOTE_TYPE.PRICE,
        settlementType: NSE_CONSTANTS.DEFAULT.SETTLEMENT_TYPE,
        value: inCrores,
        quantity: order.quantity,
        yieldType: NSE_CONSTANTS.QUOTE_TYPE.YIELD,
        yield: NSE_CONSTANTS.DEFAULT.YIELD,
        calcMethod: NSE_CONSTANTS.CALC_METHOD.ORIGINAL,
        gtdFlag: NSE_CONSTANTS.GTD_FLAG.YES,
        quoteNegotiable: null,
        access: NSE_CONSTANTS.DEFAULT.ACCESS_LEVEL,
        participantList: [NSE_CONSTANTS.PARTICIPANT.CODE],
        valueNegotiable: NSE_CONSTANTS.VALUE_NEGOTIABLE.YES,
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
        respDealType: NSE_CONSTANTS.DEAL_TYPE.BUY,
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
      const accruedInterest = await this.getAccruedInterest(order);
      // inncr
      const unitPriceNum = Number(order.unitPrice);
      console.log("unitPriceNum", unitPriceNum);
      console.log("accruedInterest", accruedInterest);
      console.log("order.quantity", order.quantity);
      console.log("consideration", (order.quantity * unitPriceNum) / 100 + accruedInterest);
      const consideration = (
        (order.quantity * unitPriceNum) / 100 + accruedInterest) / 100;

      await this.nseRfq.proposeDeal({
        ngRfqNumber: rfqNumber,
        ngId: negotiationId,
        participantCode: NSE_CONSTANTS.PARTICIPANT.CODE,
        dealType: NSE_CONSTANTS.DEAL_TYPE.DIRECT,
        clientCode: order.customerProfile?.nseDataSet?.participant?.loginId ?? "",
        price: 100,
        accruedInterest: accruedInterest,
        consideration: consideration,
        calcMethod: NSE_CONSTANTS.CALC_METHOD.ORIGINAL,
        role: NSE_CONSTANTS.ROLE.RESPONDER,
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
      const unitPriceNum = Number(order.unitPrice);
      const acceptedConsideration =
        (order.quantity * unitPriceNum) / 100 + acceptedAccruedInterest;

      await this.nseRfq.acceptOrRejectDeal({
        rfqNumber: rfqNumber,
        id: negotiationId,
        acceptedPrice: unitPriceNum,
        acceptedAccruedInterest: acceptedAccruedInterest,
        acceptedConsideration: acceptedConsideration,
        confirmStatus: NSE_CONSTANTS.CONFIRM_STATUS.ACCEPT,
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
