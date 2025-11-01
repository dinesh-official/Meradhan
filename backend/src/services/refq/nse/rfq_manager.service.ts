import { db } from "@core/database/database";
import { NseRfq } from "@modules/RFQ/nse/nse_RFQ";
import type { CreateRfqRequest, GetAllRfqRequest, UpdateRfqRequest } from "@modules/RFQ/nse/rfq.types";

export class RefqManager extends NseRfq
{

    async syncIsinData() {
        const isins = await this.getAllIsins();
        await db.dataBase.nseIsinSecurityReceipt.deleteMany();
        await db.dataBase.nseIsinSecurityReceipt.createMany({
            data: isins,
        });
        return isins;
    }

    async createNewRfq(data: CreateRfqRequest) {

        const rfqData = await this.createRfq(data);

        const rfq = rfqData.map(async (rfq) => await db.dataBase.nSERfqModel.create({
            data: {
                access: rfq.access,
                buySell: rfq.buySell,
                calcMethod: rfq.calcMethod,
                category: rfq.category,
                clientCode: rfq.clientCode,
                dealType: rfq.dealType,
                clientRegType: rfq.clientRegType,
                confirmedValue: rfq.confirmedValue,
                date: rfq.date,
                isin: rfq.isin,
                number: rfq.number,
                participantCode: rfq.participantCode,
                quoteTime: rfq.quoteTime,
                quoteType: rfq.quoteType,
                segment: rfq.segment,
                settlementType: rfq.settlementType,
                status: rfq.status,
                tradedValue: rfq.tradedValue,
                userLogin: rfq.userLogin,
                value: rfq.value,
                yield: rfq.yield,
                yieldType: rfq.yieldType,
                anonymous: rfq.anonymous,
                calcMethodSell: data.calcMethodSell,
                endTime: rfq.endTime,
                groupList: rfq.groupList || undefined,
                gtdFlag: rfq.gtdFlag,
                minFillValue: rfq.minFillValue,
                participantList: rfq.participantList || undefined,
                price: rfq.price,
                priceSell: data.priceSell,
                quantity: rfq.quantity,
                quantitySell: data.quantitySell,
                rating: rfq.rating,
                remarks: rfq.remarks,
                valueNegotiable: rfq.valueNegotiable,
                valueSell: data.valueSell,
                valueStepSize: rfq.valueStepSize,
                yieldSell: data.yieldSell,
                yieldTypeSell: data.yieldTypeSell,
                quoteNegotiable: rfq.quoteNegotiable,
            }
        }))




        return await Promise.all(rfq);
    }


    async updateRfqData(data: UpdateRfqRequest) {
        const rfqData = await this.updateRfq(data);
        const rfq = rfqData.map(async (rfq) => await db.dataBase.nSERfqModel.update({
            where: {
                number: data.number
            },
            data: {
                access: rfq.access,
                buySell: rfq.buySell,
                calcMethod: rfq.calcMethod,
                category: rfq.category,
                clientCode: rfq.clientCode,
                dealType: rfq.dealType,
                clientRegType: rfq.clientRegType,
                confirmedValue: rfq.confirmedValue,
                date: rfq.date,
                isin: rfq.isin,
                number: rfq.number,
                participantCode: rfq.participantCode,
                quoteTime: rfq.quoteTime,
                quoteType: rfq.quoteType,
                segment: rfq.segment,
                settlementType: rfq.settlementType,
                status: rfq.status,
                tradedValue: rfq.tradedValue,
                userLogin: rfq.userLogin,
                value: rfq.value,
                yield: rfq.yield,
                yieldType: rfq.yieldType,
                anonymous: rfq.anonymous,
                endTime: rfq.endTime,
                groupList: rfq.groupList || undefined,
                gtdFlag: rfq.gtdFlag,
                minFillValue: rfq.minFillValue,
                participantList: rfq.participantList || undefined,
                price: rfq.price,
                quantity: rfq.quantity,
                rating: rfq.rating,
                remarks: rfq.remarks,
                valueNegotiable: rfq.valueNegotiable,
                valueStepSize: rfq.valueStepSize,
                quoteNegotiable: rfq.quoteNegotiable,
            }
        }))

        return await Promise.all(rfq);
    }


    async resyncRfqData(data: GetAllRfqRequest) {
        const rfqData = await this.getAllRfq(data);
        const rfqs = rfqData;

        const rfqTasks = rfqs.map(async (rfq) => await db.dataBase.nSERfqModel.update({
            where: {
                number: data.number
            },
            data: {
                access: rfq.access,
                buySell: rfq.buySell,
                calcMethod: rfq.calcMethod,
                category: rfq.category,
                clientCode: rfq.clientCode,
                dealType: rfq.dealType,
                clientRegType: rfq.clientRegType,
                confirmedValue: rfq.confirmedValue,
                date: rfq.date,
                isin: rfq.isin,
                number: rfq.number,
                participantCode: rfq.participantCode,
                quoteTime: rfq.quoteTime,
                quoteType: rfq.quoteType,
                segment: rfq.segment,
                settlementType: rfq.settlementType,
                status: rfq.status,
                tradedValue: rfq.tradedValue,
                userLogin: rfq.userLogin,
                value: rfq.value,
                yield: rfq.yield,
                yieldType: rfq.yieldType,
                anonymous: rfq.anonymous,
                endTime: rfq.endTime,
                groupList: rfq.groupList || undefined,
                gtdFlag: rfq.gtdFlag,
                minFillValue: rfq.minFillValue,
                participantList: rfq.participantList || undefined,
                price: rfq.price,
                quantity: rfq.quantity,
                rating: rfq.rating,
                remarks: rfq.remarks,
                valueNegotiable: rfq.valueNegotiable,
                valueStepSize: rfq.valueStepSize,
                quoteNegotiable: rfq.quoteNegotiable,
            }
        })
        )

        return await Promise.all(rfqTasks);
    }

}