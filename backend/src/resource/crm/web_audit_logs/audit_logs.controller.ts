import { HttpStatus } from "@utils/error/AppError";
import type { Request, Response } from "express";
import {
    AuditLogsService,
    type TrackingPayload,
    type RevalidatePayload,
    type AuditLogsListQuery,
    type GroupQuery
} from "./audit_logs.service";

export class AuditLogsController {
    private auditLogsService: AuditLogsService;

    constructor() {
        this.auditLogsService = new AuditLogsService();
    }

    async createTracking(req: Request, res: Response): Promise<void> {
        const payload = req.body?.[0] as TrackingPayload;

        await this.auditLogsService.createTracking(payload);

        res.send("OK");
    }

    async revalidateTracking(req: Request, res: Response): Promise<void> {
        const payload = req.body as RevalidatePayload;

        await this.auditLogsService.revalidateTracking(payload);

        res.send("OK");
    }

    async getAuditLogsList(req: Request, res: Response): Promise<void> {
        try {
            const query = req.query as AuditLogsListQuery;
            const result = await this.auditLogsService.getAuditLogsList(query);

            res.sendResponse({
                statusCode: HttpStatus.OK,
                responseData: result
            });
        } catch (error) {
            console.error("Web Tracking List Error:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    async getGroupedAuditLogs(req: Request, res: Response): Promise<void> {
        try {
            const query: GroupQuery = {
                page: Number(req.query.page) || 1,
                limit: Number(req.query.limit) || 10,
                userId: req.query.userId as string,
                search: req.query.search as string,
            };

            const result = await this.auditLogsService.getGroupedAuditLogs(query);

            res.sendResponse({
                statusCode: HttpStatus.OK,
                responseData: result,
            });
        } catch (error) {
            console.error("Web Tracking Group Error:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }


    async getAuthAuditLogs(req: Request, res: Response): Promise<void> {
        try {
            const query: GroupQuery = {
                page: Number(req.query.page) || 1,
                limit: Number(req.query.limit) || 10,
                userId: req.query.userId as string,
                search: req.query.search as string,
            };

            const result = await this.auditLogsService.getAuthGroupedAuditLogs(query);

            res.sendResponse({
                statusCode: HttpStatus.OK,
                responseData: result,
            });
        } catch (error) {
            console.error("Web Tracking Group Error:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    async getUnknownGroupedAuditLogs(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.auditLogsService.getUnknownGroupedAuditLogs();

            res.sendResponse({
                statusCode: HttpStatus.OK,
                responseData: result,
            });
        } catch (error) {
            console.error("Web Tracking Unknown Group Error:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }


}