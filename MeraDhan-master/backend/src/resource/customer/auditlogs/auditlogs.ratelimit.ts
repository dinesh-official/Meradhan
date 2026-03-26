import { HttpStatus } from "@utils/error/AppError";
import type { Request, Response } from "express";
import { rateLimit, type RateLimitRequestHandler } from "express-rate-limit";

/**
 * Rate limiter for public Meradhan tracking endpoints (website analytics)
 * Stricter limits to prevent spam and log injection
 */
export const meradhanTrackingLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute per IP
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

/**
 * Rate limiter for authenticated audit log creation endpoints
 * Prevents spam from authenticated users
 */
export const auditLogCreationLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute per IP/user
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

/**
 * Rate limiter for GET audit log endpoints
 * Prevents excessive querying and potential data scraping
 */
export const auditLogReadLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute per IP/user
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
