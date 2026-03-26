import { HttpStatus } from "@utils/error/AppError";
import type { Request, Response } from "express";
import { rateLimit, type RateLimitRequestHandler } from "express-rate-limit";

/**
 * Rate limiter for CRM audit log endpoints (ADMIN only)
 * More lenient for admin users but still protected
 */
export const crmAuditLogLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 200, // 200 requests per minute per IP/user
  standardHeaders: "draft-8",
  legacyHeaders: false,
  ipv6Subnet: 56,
  handler: (req: Request, res: Response) => {
    res.status(HttpStatus.TOO_MANY_REQUESTS).json({
      success: false,
      statusCode: HttpStatus.TOO_MANY_REQUESTS,
      message: "You have exceeded the request limit. Please try again later.",
      responseData: {
        code: "TOO_MANY_REQUESTS",
        message: "You have exceeded the request limit. Please try again later.",
        timestamp: new Date().toISOString(),
      },
    });
  },
});
