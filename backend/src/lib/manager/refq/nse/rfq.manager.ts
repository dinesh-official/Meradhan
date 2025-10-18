import { db } from "@core/database/database";
import { NseRfq } from "@lib/provider/RFQ/nse/NseRFQ";

export class RefqManager extends NseRfq {

    async syncIsinData() {
        const isins = await this.getAllIsins();
        await db.dataBase.nseIsinSecurityReceipt.deleteMany();
        await db.dataBase.nseIsinSecurityReceipt.createMany({
            data: isins,
        });
        return isins;
    }
}