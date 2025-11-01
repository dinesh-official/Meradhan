import { db, type DataBaseSchema } from "@core/database/database";
import { HttpStatus } from "@utils/error/AppError";
import { Router } from "express";

const auditLogsRouter = Router()

auditLogsRouter.all("/api/crm/tracking", async (req, res) => {
    const payload = req.body?.[0]
    if (payload?.type) {
        const token = payload?.props?.token;
        delete payload?.props?.token;
        await db.dataBase.crmAuditLogs.create({
            data: {
                type: payload?.type,
                data: payload?.props,
                url: payload?.type == "page_duration" ? (payload?.props?.from || payload.props?.url) : payload.props?.url,
                createdAt: payload.time && new Date(payload.ts),
                userId: payload?.props?.userId,
                token: token,

            },

        })
    }
    return res.send("OK")
})



auditLogsRouter.get("/api/crm/tracking/list", async (req, res) => {
    try {
        const {
            page = "1",
            limit = "10",
            search,
            userId,
            type,
            fromDate,
            toDate,
        } = req.query;

        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const skip = (pageNum - 1) * limitNum;

        // Build filter dynamically
        const where: DataBaseSchema.CrmAuditLogsWhereInput = {};

        if (userId) where.userId = Number(userId);
        if (type) where.type = String(type);

        if (fromDate || toDate) {
            where.createdAt = {};
            if (fromDate) where.createdAt.gte = new Date(fromDate as string);
            if (toDate) where.createdAt.lte = new Date(toDate as string);
        }

        if (search) {
            where.OR = [
                { type: { contains: String(search), mode: "insensitive" } },
                { token: { contains: String(search), mode: "insensitive" } },
                { url: { contains: String(search), mode: "insensitive" } },
            ];
        }

        // Fetch records
        const [records, total] = await Promise.all([
            db.dataBase.crmAuditLogs.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip,
                take: limitNum,
                omit: {
                    token: true
                },

            }),
            db.dataBase.crmAuditLogs.count({ where }),

        ]);

        const totalPages = Math.ceil(total / limitNum);

        return res.sendResponse({
            statusCode: HttpStatus.OK,
            responseData: {
                meta: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages,
                },
                data: records,
            }
        });
    } catch (error) {
        console.error("CRM Tracking List Error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});


export default auditLogsRouter