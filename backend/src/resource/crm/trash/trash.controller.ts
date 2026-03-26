import type { Request, Response } from "express";
import { TrashService } from "./trash.service";
import { HttpStatus } from "@utils/error/AppError";
import { createCrmActivityLog } from "@resource/crm/auditlogs/auditlog.repo";

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
        await createCrmActivityLog(req, {
            userId: Number(req.session?.id),
            action: "CUSTOMER_RESTORE",
            details: { Reason: "Customer restored from trash", CustomerId: customerId },
            entityType: "customer",
            entityId: String(customerId),
        });
        res.sendResponse({
            statusCode: HttpStatus.OK,
            responseData: { success: true },
        });
    }

    async deleteCustomerPermanently(req: Request, res: Response) {
        const customerId = Number(req.params.customerId);
        await this.trashService.deleteCustomerPermanently(customerId);
        await createCrmActivityLog(req, {
            userId: Number(req.session?.id),
            action: "CUSTOMER_DELETE_PERMANENT",
            details: { Reason: "Customer permanently deleted from trash", CustomerId: customerId },
            entityType: "customer",
            entityId: String(customerId),
        });
        res.sendResponse({
            statusCode: HttpStatus.OK,
            responseData: { success: true },
        });
    }

}