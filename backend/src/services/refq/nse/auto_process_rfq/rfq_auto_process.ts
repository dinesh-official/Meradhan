import { nseKeys, NseRfqMasterService } from "./nse.api";
import { RfqMasterDbSyncManager } from "@resource/crm/refq/nse/rfq_master/rfq_master.manager";
import type { CreateNegotiationResponse, CreateRfqResponseItem } from "@modules/RFQ/nse/rfq.types";

export type RfqAutoDataPayLoad = {
    isin: string,
    buySell: "B",
    settlementType: 0 | 1,
    valueInCr: number
    quantity: number,
    yield: number,
    remarks?: string,
    clientUCCCode: string,
    cleanPrice: number,
    accruedInterestAmount: number,
    considerationAmount: number
}

export class AutoRfqBuyFlow {
    private order: RfqAutoDataPayLoad;
    private nse = new NseRfqMasterService();
    private dbSync = new RfqMasterDbSyncManager();

    constructor(order: RfqAutoDataPayLoad) {
        this.order = order;
    }

    async createAIsinRequest() {
        const res = await this.nse.addIsinRfq({
            segment: "R",
            isin: this.order.isin,
            participantCode: nseKeys.login!,
            dealType: "D",
            clientCode: nseKeys.login!,
            buySell: "S",// S/B
            quoteType: "Y",
            settlementType: this.order.settlementType,
            value: this.order.valueInCr,
            quantity: this.order.quantity,
            yieldType: "YTM",
            yield: this.order.yield,
            calcMethod: "O",
            gtdFlag: "Y",
            quoteNegotiable: "Y",
            access: 2,
            participantList: [nseKeys.login!],
            valueNegotiable: "Y",
            remarks: this.order.remarks,
        });
        if (res) {
            await this.dbSync.syncRfqMasterData(res as unknown as CreateRfqResponseItem).catch(console.error);
        }
        return res;
    }

    async acceptNegotiationRequest(rfqNo: string) {
        const res = await this.nse.acceptNegotiation({
            acceptedValue: this.order.valueInCr,
            rfqNumber: rfqNo,
            role: "I",
            respDealType: "B",
            respClientCode: this.order.clientUCCCode
        });
        await this.dbSync.syncNegotiationData(res as unknown as CreateNegotiationResponse).catch(console.error);
        return res;
    }

    async proposeDealRequest({ ngId, ngRfqNumber }: { ngRfqNumber: string, ngId: string }) {
        const res = await this.nse.proposeDeal({
            ngRfqNumber: ngRfqNumber,
            ngId: ngId,
            participantCode: nseKeys.login!,
            dealType: "D",
            clientCode: nseKeys.login!,
            price: this.order.cleanPrice,
            accruedInterest: this.order.accruedInterestAmount,
            consideration: this.order.considerationAmount,
            calcMethod: "O",
            role: "I",
            remarks: this.order.remarks,
        });
        await this.dbSync.syncNegotiationData(res as unknown as CreateNegotiationResponse).catch(console.error);
        return res;
    }

    async acceptDealRequest({ ngId, rfqNumber }: { rfqNumber: string, ngId: string }) {
        const res = await this.nse.acceptRejectDeal({
            rfqNumber: rfqNumber,
            id: ngId,
            acceptedPrice: this.order.cleanPrice,
            acceptedAccruedInterest: this.order.accruedInterestAmount,
            acceptedConsideration: this.order.considerationAmount,
            confirmStatus: "PC",
        });
        await this.dbSync.syncNegotiationData(res as unknown as CreateNegotiationResponse).catch(console.error);
        return res;
    }

}

// const data: RfqAutoDataPayLoad = {
//     isin: "INE01HV07619",
//     yield: Number(5.4),
//     accruedInterestAmount: 12,
//     buySell: "B",
//     cleanPrice: 99.4,
//     clientUCCCode: "MDVZ0U0ON",
//     considerationAmount: 12,
//     quantity: 1,
//     settlementType: 1,
//     valueInCr: 0.001,
// }
// const nse = new AutoRfqBuyFlow(data);



// nse.createAIsinRequest().then((rfq) => {
//     nse.acceptNegotiationRequest(rfq!.number).then((ng) => {
//         nse.proposeDealRequest({ ngId: ng.id, ngRfqNumber: ng.rfqNumber }).then((deal) => {
//             nse.acceptDealRequest({ ngId: ng.id, rfqNumber: deal.rfqNumber }).then((_done) => {
//                 console.log("RFQ COMPLETED");
//             }).catch((err) => {
//                 console.log("Error On STEP 4");
//             });
//         }).catch((err) => {
//             console.log("Error On STEP 3");
//         });
//     }).catch((err) => {
//         console.log("Error On STEP 2");
//     });
// }).catch(() => {
//     console.log("Error On STEP 1");
// });
