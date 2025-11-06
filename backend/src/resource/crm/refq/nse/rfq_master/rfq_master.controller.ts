import type { Request, Response } from "express";
import { RfqMasterService } from "./rfq_master.service";
import { appSchema } from "@root/schema";
import { AxiosError } from "axios";

export class RfqMasterController {

    private rfqMasterService: RfqMasterService;

    constructor() {
        this.rfqMasterService = new RfqMasterService();
    }


    async addIsinToRfq(req: Request, res: Response) {
        try {
            const createdBy = req.session!.id;
            const data = appSchema.rfq.addIsinSchema.parse(req.body)
            const result = await this.rfqMasterService.createNewRfq(data, createdBy);
            res.sendResponse({
                statusCode: 200,
                responseData: result
            })
        } catch (error) {
            if (error instanceof AxiosError) {
                res.sendResponse({
                    statusCode: error.response?.status || 500,
                    responseData: error.response?.data?.messages || error.response?.data || "Internal Server Error"
                });
            }
            throw error;
        }
    }

    async negotiateRfqAccept(req: Request, res: Response) {
        const userId = req.session!.id;
        const data = appSchema.rfq.acceptNegotiationQuoteSchema.parse(req.body);
        const result = await this.rfqMasterService.negotiateRfqAccept(data, userId);
        res.sendResponse({
            statusCode: 200,
            responseData: result
        });
    }

    async negotiateRfqTerminate(req: Request, res: Response) {
        const userId = req.session!.id;
        const data = appSchema.rfq.terminateNegotiationQuoteSchema.parse(req.body);
        const result = await this.rfqMasterService.terminateNegotiation(data, userId);
        res.sendResponse({
            statusCode: 200,
            responseData: result
        });
    }

    async acceptRejectDeal(req: Request, res: Response) {
        const userId = req.session!.id;
        const data = appSchema.rfq.acceptRejectDealSchema.parse(req.body);
        const result = await this.rfqMasterService.acceptRejectDeal(data, userId);
        res.sendResponse({
            statusCode: 200,
            responseData: result
        });
    }

    async getAllRfq(req: Request, res: Response) {
        const filters = appSchema.rfq.rfqFilterSchema.parse(req.query);
        const result = await this.rfqMasterService.getAllRfqList(filters);
        res.sendResponse({
            statusCode: 200,
            responseData: result
        });
    }

}