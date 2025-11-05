import type { Request, Response } from "express";
import { RfqMasterService } from "./rfq_master.service";
import { appSchema } from "@root/schema";

export class RfqMasterController {

    private rfqMasterService: RfqMasterService;

    constructor() {
        this.rfqMasterService = new RfqMasterService();
    }


    async addIsinToRfq(req: Request, res: Response) {
        const data = appSchema.rfq.addIsinSchema.parse(req.body)
        const createdBy = req.session!.id;
        const result = await this.rfqMasterService.createNewRfq(data, createdBy);
        res.sendResponse({
            statusCode: 200,
            responseData: result
        })
    }


}