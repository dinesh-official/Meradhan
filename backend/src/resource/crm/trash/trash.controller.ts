import type { Request, Response } from "express";
import { TrashService } from "./trash.service";
import { HttpStatus } from "@utils/error/AppError";

export class TrashController {

    private trashService = new TrashService();
    async getAllTrashCustomers(req: Request, res: Response) {
        const trashedCustomers = await this.trashService.getAllTrashCustomers();
        res.sendResponse({
            statusCode: HttpStatus.OK,
            responseData: trashedCustomers,
        });
    }

    async restoreCustomer(req: Request, res: Response) {
        const customerId = Number(req.params.customerId);
        await this.trashService.restoreCustomer(customerId);
        res.sendResponse({
            statusCode: HttpStatus.OK,
            responseData: { success: true },
        });
    }

    async deleteCustomerPermanently(req: Request, res: Response) {
        const customerId = Number(req.params.customerId);
        await this.trashService.deleteCustomerPermanently(customerId);
        res.sendResponse({
            statusCode: HttpStatus.OK,
            responseData: { success: true },
        });
    }

}