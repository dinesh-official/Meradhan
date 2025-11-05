import type { appSchema } from "@root/schema";
import { NseRfqManager } from "@services/refq/nse/nseisin_manager.service";
import type z from "zod";

export class RfqMasterService {

    private rfqManager = new NseRfqManager();

    async createNewRfq(data: z.infer<typeof appSchema.rfq.addIsinSchema>, createdBy: number) {

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

        console.log(createdBy);
        return addIsinToRfq;
    }
}