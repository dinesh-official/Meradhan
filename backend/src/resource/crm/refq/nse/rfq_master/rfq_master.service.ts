import { NseCBRICS } from "@modules/RFQ/nse/nse_CBRICS";
import type { appSchema } from "@root/schema";
import { NseRfqManager } from "@services/refq/nse/nseisin_manager.service";
import type z from "zod";
import { RfqMasterDbSyncManager } from "./rfq_master.manager";

export class RfqMasterService {
  private rfqManager = new NseRfqManager();
  private cbricsManager = new NseCBRICS();

  private rfqDbSyncManager = new RfqMasterDbSyncManager();

  async createNewRfq(
    data: z.infer<typeof appSchema.rfq.addIsinSchema>,
    createdBy: number
  ) {
    // Create RFQ for ISIN NSE - Call Service
    const addIsinToRfq = await this.rfqManager.createRfq({
      segment: data.segment,
      isin: data.isin,
      participantCode: data.participantCode,
      dealType: data.dealType,
      clientCode: data.clientCode,
      buySell: data.buySell,
      quoteType: data.quoteType,
      settlementType: Number(data.settlementType),
      value: data.value,
      quantity: data.quantity,
      yieldType: data.yieldType,
      yield: data.yield,
      calcMethod: data.calcMethod,
      price: data.price,
      valueSell: data.valueSell,
      quantitySell: data.quantitySell,
      yieldTypeSell: data.yieldTypeSell,
      yieldSell: data.yieldSell,
      calcMethodSell: data.calcMethodSell,
      priceSell: data.priceSell,
      access: Number(data.access) as 1 | 2 | 3,
      participantList: data.participantList,
      gtdFlag: data.gtdFlag,
      endTime: data.endTime,
      anonymous: data.anonymous,
      category: data.category,
      groupList: data.groupList || null,
      valueNegotiable: data.valueNegotiable,
      valueStepSize: data.valueStepSize,
      minFillValue: data.minFillValue,
      quoteNegotiable: data.quoteNegotiable,
      rating: data.rating,
      remarks: data.remarks,
    });

    // Sync RFQ Master Data to Our Database
    //  its return 1 or array for safety add in map function : Its Optional Change in Future
    const result = addIsinToRfq.map(async (addIsinToRfq) => {
      return await this.rfqDbSyncManager.syncRfqMasterData(
        addIsinToRfq,
        createdBy,
        data
      );
    });

    await Promise.all(result);

    return addIsinToRfq;
  }

  async negotiateRfqAccept(
    data: z.infer<typeof appSchema.rfq.acceptNegotiationQuoteSchema>,
    createdBy: number
  ) {
    // Negotiate RFQ Quote - Call Service

    const negotiateRfqQuote = await this.rfqManager.acceptNegotiationQuote({
      rfqNumber: data.rfqNumber,
      acceptedValue: data.acceptedValue,
      id: data.id,
      acceptedSettlementDate: data.acceptedSettlementDate,
      acceptedYieldType: data.acceptedYieldType,
      acceptedYield: data.acceptedYield,
      acceptedPrice: data.acceptedPrice,
      respDealType: data.respDealType,
      respClientCode: data.respClientCode,
      role: data.role,
    });

    // Sync Negotiation Data to Our Database
    return await this.rfqDbSyncManager.syncNegotiationData(
      negotiateRfqQuote,
      createdBy
    );
  }

  async terminateNegotiation(
    data: z.infer<typeof appSchema.rfq.terminateNegotiationQuoteSchema>,
    createdBy: number
  ) {
    // Negotiate RFQ Quote - Call Service
    const negotiateRfqQuote = await this.rfqManager.terminateNegotiationThread({
      rfqNumber: data.rfqNumber,
      id: data.id,
      role: data.role,
    });

    // Sync Negotiation Data to Our Database
    return await this.rfqDbSyncManager.syncNegotiationData(
      negotiateRfqQuote,
      createdBy
    );
  }

  async getAllRfqList(filters: z.infer<typeof appSchema.rfq.rfqFilterSchema>) {
    const data = await this.rfqManager.getAllRfq(filters);
    console.log(data);

    const result = data.map(async (rfq) => {
      return await this.rfqDbSyncManager.syncRfqMasterData(rfq);
    });
    const rfqs = await Promise.all(result);
    return rfqs;
  }

  async getAllNegotiations(
    filters: z.infer<typeof appSchema.rfq.rfqNegotiationFilterSchema>,
    activeUserId?: number
  ) {
    console.log(filters);
    const formatDate = (dateStr?: string) => {
      if (!dateStr) return "";
      const date = new Date(dateStr);

      const day = String(date.getDate()).padStart(2, "0");

      const monthShort = date.toLocaleString("en-US", { month: "short" });

      const year = date.getFullYear();
      console.log(year);

      return `${day}-${monthShort}-${year}`;
    };

    const data = await this.rfqManager.getAllNegotiations({
      buySell: filters.buySell,
      rfqNumber: filters.rfqNumber,
      status: filters.status,
      date: formatDate(filters.date),
      fromTimestamp: filters.fromTimestamp,
      toTimestamp: filters.toTimestamp,
      confirmStatus: filters.confirmStatus,
      id: filters.id,
      isin: filters.isin,
      tradeNumber: filters.tradeNumber,
    });

    const result = data.map(async (negotiation) => {
      return await this.rfqDbSyncManager.syncNegotiationData(
        negotiation,
        activeUserId
      );
    });
    const negotiations = await Promise.all(result);
    return negotiations;
  }

  async proposeDeal(
    data: z.infer<typeof appSchema.rfq.proposeDealSchema>,
    createdBy: number
  ) {
    // Propose Deal - Call Service
    const proposeDeal = await this.rfqManager.proposeDeal({
      ngRfqNumber: data.ngRfqNumber,
      ngId: data.ngId,
      participantCode: data.participantCode,
      dealType: data.dealType,
      clientCode: data.clientCode,
      price: data.price,
      accruedInterest: data.accruedInterest,
      consideration: data.consideration,
      calcMethod: data.calcMethod,
      role: data.role,
      putCallDate: data.putCallDate,
      remarks: data.remarks,
    });

    // Sync Deal Data to Our Database
    return await this.rfqDbSyncManager.syncNegotiationData(
      proposeDeal,
      createdBy
    );
  }

  async acceptRejectDeal(
    data: z.infer<typeof appSchema.rfq.acceptRejectDealSchema>,
    createdBy: number
  ) {
    // Accept/Reject RFQ Deal - Call Service
    const acceptRejectDeal = await this.rfqManager.acceptOrRejectDeal({
      rfqNumber: data.rfqNumber,
      id: data.id,
      acceptedPrice: data.acceptedPrice,
      acceptedPutCallDate: data.acceptedPutCallDate,
      acceptedAccruedInterest: data.acceptedAccruedInterest,
      acceptedConsideration: data.acceptedConsideration,
      confirmStatus: data.confirmStatus,
    });

    // Sync Deal Data to Our Database
    return await this.rfqDbSyncManager.syncNegotiationData(
      acceptRejectDeal,
      createdBy
    );
  }

  async getAllSettledOrders(
    filters: z.infer<typeof appSchema.rfq.settleOrderFilterSchema>
  ) {
    const data = await this.cbricsManager.getSettlementOrders(filters);
    const settledOrders = data.map(async (order) => {
      return await this.rfqDbSyncManager.syncSettlementOrderData(order);
    });
    return await Promise.all(settledOrders);
  }
}
