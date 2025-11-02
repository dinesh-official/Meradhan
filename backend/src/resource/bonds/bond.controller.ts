import type { Request, Response } from "express";
import { BondService } from "./bond.service";
import { HttpStatus } from "@utils/error/AppError";
import { appSchema } from "@root/schema";

export class BondController {
    private bondService = new BondService();

    async getBondDetails(req: Request, res: Response) {
        const isin = req.params.isin!;
        const data = await this.bondService.getBondDetails(isin);
        return res.sendResponse({
            statusCode: HttpStatus.OK,
            responseData: data
        });
    }

    async filterListedBonds(
        req: Request,
        res: Response
    ) {
        const filters = appSchema.bonds.bondsFilterSchema.parse(req.body);
        const data = await this.bondService.filterBonds(filters, req.query);
        return res.sendResponse({
            statusCode: HttpStatus.OK,
            responseData: data
        });
    }

    async getLatestListedBonds(
        req: Request,
        res: Response
    ) {
        const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 3;
        const data = await this.bondService.getLatestBonds(limit);
        return res.sendResponse({
            statusCode: HttpStatus.OK,
            responseData: data
        });
    }

}