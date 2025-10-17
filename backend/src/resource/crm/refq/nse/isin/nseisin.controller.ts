import type { Request, Response } from "express";
import { NSEIsinService } from "./nseisin.service";
import { appSchema } from "@root/schema";
import { HttpStatus } from "@utils/error/AppError";

export class NSEIsinController {

    private nseIsinService: NSEIsinService;

    constructor() {
        this.nseIsinService = new NSEIsinService()
    }

    async searchIsin(req: Request, res: Response) {
        const payload = appSchema.crm.rfq.nse.isin.isinFilterSchema.parse(req.query);
        const data = await this.nseIsinService.searchIsin(payload);
        console.log(data);
        
        res.sendResponse({
            statusCode: HttpStatus.OK,
            responseData: data
        })
    }

}