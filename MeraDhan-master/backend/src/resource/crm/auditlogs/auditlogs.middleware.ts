import type { Request, Response, NextFunction } from "express";

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
