import { NseRfq } from "@lib/provider/RFQ/nse/NseRFQ";
import type { appSchema } from "@root/schema";
import type z from "zod";

export class NSEIsinService {
    private nseRfq: NseRfq;
    constructor() {
        this.nseRfq = new NseRfq();
    }
    async searchIsin(payload: z.infer<typeof appSchema.crm.rfq.nse.isin.isinFilterSchema>) {
        return await this.nseRfq.getAllIsins(payload)
    }
}