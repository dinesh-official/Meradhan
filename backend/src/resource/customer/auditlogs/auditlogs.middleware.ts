import type { Request, Response, NextFunction } from "express";
import { HttpStatus } from "@utils/error/AppError";

/**
 * Payload size limit middleware for audit log endpoints
 * Prevents log injection and spam by limiting request body size
 */
export const auditLogPayloadLimit = (
  maxSizeBytes: number = 10 * 1024 // 10KB default
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = req.headers["content-length"];

    if (contentLength) {
      const size = parseInt(contentLength, 10);
      if (!isNaN(size) && size > maxSizeBytes) {
        return res.status(413).json({
          success: false,
          statusCode: 413,
          message: `Request payload too large. Maximum size is ${maxSizeBytes} bytes.`,
          responseData: {
            code: "PAYLOAD_TOO_LARGE",
            message: `Request payload too large. Maximum size is ${maxSizeBytes} bytes.`,
            maxSize: maxSizeBytes,
            receivedSize: size,
          },
        });
      }
    }

    // Also check actual body size if already parsed
    if (req.body && typeof req.body === "object") {
      const bodyString = JSON.stringify(req.body);
      if (bodyString.length > maxSizeBytes) {
        return res.status(413).json({
          success: false,
          statusCode: 413,
          message: `Request payload too large. Maximum size is ${maxSizeBytes} bytes.`,
          responseData: {
            code: "PAYLOAD_TOO_LARGE",
            message: `Request payload too large. Maximum size is ${maxSizeBytes} bytes.`,
            maxSize: maxSizeBytes,
            receivedSize: bodyString.length,
          },
        });
      }
    }

    next();
  };
};

/**
 * IDOR protection middleware for Meradhan GET endpoints
 * Ensures USER role can only query their own data
 */
export const enforceUserDataAccess = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // ADMIN can query any userId
  if (req.session?.id) {
    return next();
  }

  // USER can only query their own userId
  if (req.customer?.id) {
    const userIdParam = req.query.userId;
    let requestedUserId: number | undefined;

    // Parse userId from query parameter
    if (userIdParam !== undefined && userIdParam !== null) {
      const parsed =
        typeof userIdParam === "string"
          ? Number(userIdParam)
          : Number(userIdParam);
      requestedUserId = isNaN(parsed) ? undefined : parsed;
    }

    // If userId is specified in query, enforce it matches the authenticated user
    if (requestedUserId !== undefined && requestedUserId !== req.customer.id) {
      return res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        statusCode: HttpStatus.FORBIDDEN,
        message: "You can only access your own audit logs.",
        responseData: {
          code: "FORBIDDEN",
          message: "You can only access your own audit logs.",
        },
      });
    }

    // Force userId to authenticated user's ID if not specified or invalid
    if (requestedUserId === undefined) {
      req.query.userId = String(req.customer.id);
    }
  }

  next();
};
