import type { Request, Response } from "express";
import { NSEIsinService } from "./nseisin.service";
import { appSchema } from "@root/schema";
import { HttpStatus } from "@utils/error/AppError";
import { cacheStorage } from "@store/redis_store";

export class NSEIsinController {

    private nseIsinService: NSEIsinService;

    constructor() {
        this.nseIsinService = new NSEIsinService()
    }

    async searchIsin(req: Request, res: Response) {
        const payload = appSchema.crm.rfq.nse.isin.isinFilterSchema.parse(req.query);
        const allowCache = !payload.filtCoupon && !payload.filtIssueCategory && !payload.filtMaturity && !payload.issuer && !payload.symbol;
        if (allowCache) {
            const cashedIsin = await cacheStorage.get("ISIN_NSE_ALL")
            if (cashedIsin) {
                res.sendResponse({
                    statusCode: HttpStatus.OK,
                    responseData: cashedIsin
                })
                return;
            }
        }
        const data = await this.nseIsinService.searchIsin(payload);
        if (allowCache) {
            await cacheStorage.set("ISIN_NSE_ALL", data, 20000)
        }
        res.sendResponse({
            statusCode: HttpStatus.OK,
            responseData: data
        })
    }

}