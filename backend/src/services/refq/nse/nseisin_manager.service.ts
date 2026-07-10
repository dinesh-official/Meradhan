import { db } from "@core/database/database";
import { NseRfq } from "@modules/RFQ/nse/nse_RFQ";

export class NseRfqManager extends NseRfq {
    async syneIsinDB() {
        const isin = await this.getAllIsins();
        await db.dataBase.nseIsinSecurityReceipt.deleteMany().then(async () => {
            await db.dataBase.nseIsinSecurityReceipt.createMany({
                data: isin?.map((e) => {
                    return {
                        ...e,
                        maturityDate: new Date(e.maturityDate),
                    }
                })
            })
        }).catch((error) => {
            throw error;
        });
        return true;
    }
}