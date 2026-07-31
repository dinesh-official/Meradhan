import type { Request, Response, NextFunction } from "express";
import { env } from "@root/config/env";

/**
 * Validates the `x-api-key` header against INTERNAL_API_KEY in .env.
 * Used to protect the public bonds API shared with internal teammates.
 */
export const internalApiKeyMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction,
): void => {
    const key = req.headers["x-api-key"];

    if (!key || key !== env.INTERNAL_API_KEY) {
        res.status(401).json({
            success: false,
            statusCode: 401,
            message: "Unauthorized: invalid or missing x-api-key header.",
        });
        return;
    }

    next();
};
