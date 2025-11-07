import { db, type DataBaseSchema } from "@core/database/database";
import type { CreateNegotiationResponse, CreateRfqResponseItem } from "@modules/RFQ/nse/rfq.types";
import type { appSchema } from "@root/schema";
import z from "zod";

export class RfqMasterDbSyncManager {


    // Sync RFQ Master Data to Our Database
    async syncRfqMasterData(rfqData: CreateRfqResponseItem, taskUser?: number, rowData?: z.infer<typeof appSchema.rfq.addIsinSchema>) {
        const data: DataBaseSchema.RFQMasterISINCreateInput = {
            number: rfqData.number,
            segment: rfqData.segment,
            isin: rfqData.isin,
            participantCode: rfqData.participantCode,
            dealType: rfqData.dealType,
            clientCode: rfqData.clientCode,
            clientRegType: rfqData.clientRegType,
            buySell: rfqData.buySell,
            quoteType: rfqData.quoteType,
            settlementType: rfqData.settlementType,
            value: rfqData.value,
            quantity: rfqData.quantity,
            yieldType: rfqData.yieldType,
            yield: rfqData.yield,
            calcMethod: rfqData.calcMethod,
            price: rfqData.price,
            gtdFlag: rfqData.gtdFlag,
            endTime: rfqData.endTime,
            quoteNegotiable: rfqData.quoteNegotiable,
            valueNegotiable: rfqData.valueNegotiable,
            minFillValue: rfqData.minFillValue,
            valueStepSize: rfqData.valueStepSize,
            anonymous: rfqData.anonymous,
            access: Number(rfqData.access),
            groupList: rfqData.groupList || [],
            participantList: rfqData.participantList || [],
            category: rfqData.category,
            rating: rfqData.rating,
            remarks: rfqData.remarks,
            date: rfqData.date,
            quoteTime: rfqData.quoteTime,
            status: rfqData.status,
            userLogin: rfqData.userLogin,
            tradedValue: rfqData.tradedValue,
            confirmedValue: rfqData.confirmedValue,
            settlementDate: rfqData.settlementDate,
            calcMethodSell: rowData?.calcMethodSell,
            priceSell: rowData?.priceSell,
            quantitySell: rowData?.quantitySell,
            valueSell: rowData?.valueSell,
            yieldTypeSell: rowData?.yieldTypeSell,
            yieldSell: rowData?.yieldSell,
        }


        const store = await db.dataBase.rFQMasterISIN.upsert({
            where: {
                number: rfqData.number,
            },
            create: {
                ...data,
                createdBy: taskUser,
            },
            update: {
                ...data,
                updatedBy: taskUser,
            }
        });
        return store;
    }

    // Negotiation Sync Method 
    async syncNegotiationData(negotiationData: CreateNegotiationResponse, taskUser?: number) {

        const data: DataBaseSchema.RFQNegotiationCreateInput = {
            rfqNumber: negotiationData.rfqNumber,
            id: negotiationData.id,
            date: negotiationData.date,
            isin: negotiationData.isin,
            buySell: negotiationData.buySell,
            initSettlementType: negotiationData.initSettlementType,
            initSettlementDate: negotiationData.initSettlementDate,
            initAeCode: negotiationData.initAeCode,
            initDealType: negotiationData.initDealType,
            initClientCode: negotiationData.initClientCode,
            initClientRegType: negotiationData.initClientRegType,
            initValue: negotiationData.initValue,
            initQuantity: negotiationData.initQuantity,
            initYieldType: negotiationData.initYieldType,
            initYield: negotiationData.initYield,
            initCalcMethod: negotiationData.initCalcMethod,
            initPrice: negotiationData.initPrice,
            initAccruedInterest: negotiationData.initAccruedInterest,
            initConsideration: negotiationData.initConsideration,
            initQuoteTime: negotiationData.initQuoteTime,
            initGtdFlag: negotiationData.initGtdFlag,
            initEndTime: negotiationData.initEndTime,
            initRemarks: negotiationData.initRemarks,
            initLoginId: negotiationData.initLoginId,
            respSettlementType: negotiationData.respSettlementType,
            respSettlementDate: negotiationData.respSettlementDate,
            respAeCode: negotiationData.respAeCode,
            respDealType: negotiationData.respDealType,
            respClientCode: negotiationData.respClientCode,
            respClientRegType: negotiationData.respClientRegType,
            respValue: negotiationData.respValue,
            respQuantity: negotiationData.respQuantity,
            respYieldType: negotiationData.respYieldType,
            respYield: negotiationData.respYield,
            respCalcMethod: negotiationData.respCalcMethod,
            respPrice: negotiationData.respPrice,
            respAccruedInterest: negotiationData.respAccruedInterest,
            respConsideration: negotiationData.respConsideration,
            respQuoteTime: negotiationData.respQuoteTime,
            respGtdFlag: negotiationData.respGtdFlag,
            respEndTime: negotiationData.respEndTime,
            respRemarks: negotiationData.respRemarks,
            respLoginId: negotiationData.respLoginId,
            status: negotiationData.status,
            tradeNumber: negotiationData.tradeNumber,
            acceptedSettlementType: negotiationData.acceptedSettlementType,
            acceptedSettlementDate: negotiationData.acceptedSettlementDate,
            acceptedValue: negotiationData.acceptedValue,
            acceptedQuantity: negotiationData.acceptedQuantity,
            acceptedYieldType: negotiationData.acceptedYieldType,
            acceptedYield: negotiationData.acceptedYield,
            acceptedCalcMethod: negotiationData.acceptedCalcMethod,
            acceptedPrice: negotiationData.acceptedPrice,
            acceptedPutCallDate: negotiationData.acceptedPutCallDate,
            acceptedAccruedInterest: negotiationData.acceptedAccruedInterest,
            acceptedConsideration: negotiationData.acceptedConsideration,
            acceptedQuoteTime: negotiationData.acceptedQuoteTime,
            acceptedBySide: negotiationData.acceptedBySide,
            acceptedByLoginId: negotiationData.acceptedByLoginId,
            confirmStatus: negotiationData.confirmStatus,
            proposedBySide: negotiationData.proposedBySide,
            proposedTime: negotiationData.proposedTime,
            confirmedPriceQuoteTime: negotiationData.confirmedPriceQuoteTime,
            lastActivityTimestamp: negotiationData.lastActivityTimestamp,
            tradeSplits: negotiationData.tradeSplits?.map((split) => JSON.parse(JSON.stringify(split))) || [],
        }

        const store = await db.dataBase.rFQNegotiation.upsert({
            where: {
                id: negotiationData.id,
            },
            create: {
                ...data,
                createdBy: taskUser,
            },
            update: {
                ...data,
                updatedBy: taskUser,
            }
        });
        return store;

    }



}
