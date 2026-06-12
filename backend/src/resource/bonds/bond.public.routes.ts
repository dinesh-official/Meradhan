import { Router, type Request, type Response } from "express";
import { db } from "@core/database/database";
import { internalApiKeyMiddleware } from "@middlewares/apikey_middleware";
import { withRateLimit } from "@middlewares/ratelimit_midddleare";

const bondPublicRouter = Router();

// 30 requests per minute per API key
const publicBondsLimiter = withRateLimit({ max: 30, min: 1 });


/**
 * POST /api/public/bonds
 *
 * Returns all bonds displayed on the MeraDhan "All Bonds" public page.
 * Supports optional pagination via query params: ?page=1&limit=100
 *
 * Headers required:
 *   x-api-key: <INTERNAL_API_KEY>
 *
 * Request body (optional filters, all fields optional):
 * {
 *   "search": "ISIN or name",
 *   "rating": ["AAA", "AA+"],
 *   "taxation": ["TAXABLE"],
 *   "coupon": ["8-10"],
 *   "maturity": ["2-5"],
 *   "interest": ["MONTHLY"]
 * }
 */
bondPublicRouter.post(
    "/api/public/bonds",
    internalApiKeyMiddleware,
    publicBondsLimiter,
    async (req: Request, res: Response) => {
        try {
            const page = Math.max(1, parseInt(String(req.query["page"] ?? "1"), 10) || 1);
            const limit = Math.min(200, Math.max(1, parseInt(String(req.query["limit"] ?? "100"), 10) || 100));
            const skip = (page - 1) * limit;

            const where = {
                isListed: { equals: "YES" as const },
                allowForPurchase: { equals: true },
                redemptionDate: { gte: new Date() },
                creditRating: { notIn: ["D", "C"] },
            };

            const [total, bonds] = await Promise.all([
                db.dataBase.bonds.count({ where }),
                db.dataBase.bonds.findMany({
                    where,
                    orderBy: [{ sortedAt: "desc" }, { createdAt: "desc" }],
                    skip,
                    take: limit,
                }),
            ]);

            const data = bonds;

            res.json({
                success: true,
                statusCode: 200,
                message: "OK",
                responseData: {
                    data,
                    meta: {
                        total,
                        page,
                        pageSize: limit,
                        totalPages: Math.ceil(total / limit),
                    },
                },
            });
        } catch (err) {
            console.error("[bond.public] POST /api/public/bonds error:", err);
            res.status(500).json({ success: false, statusCode: 500, message: "Internal server error." });
        }
    },
);

/**
 * GET /api/public/bonds/:isin
 *
 * Returns a single bond by ISIN (public field shape, sensitive fields stripped).
 *
 * Headers required:
 *   x-api-key: <INTERNAL_API_KEY>
 */
bondPublicRouter.get(
    "/api/public/bonds/:isin",
    internalApiKeyMiddleware,
    publicBondsLimiter,
    async (req: Request, res: Response) => {
        try {
            const isinParam = req.params["isin"];
            const isinStr = Array.isArray(isinParam) ? isinParam[0] : isinParam;
            const isin = typeof isinStr === "string" ? isinStr.trim().toUpperCase() : undefined;

            if (!isin) {
                res.status(400).json({ success: false, statusCode: 400, message: "ISIN is required." });
                return;
            }

            const bond = await db.dataBase.bonds.findUnique({ where: { isin } });

            if (!bond) {
                res.status(404).json({ success: false, statusCode: 404, message: `Bond not found for ISIN: ${isin}` });
                return;
            }

            res.json({
                success: true,
                statusCode: 200,
                message: "OK",
                responseData: bond,
            });
        } catch (err) {
            console.error("[bond.public] GET /api/public/bonds/:isin error:", err);
            res.status(500).json({ success: false, statusCode: 500, message: "Internal server error." });
        }
    },
);

export default bondPublicRouter;
