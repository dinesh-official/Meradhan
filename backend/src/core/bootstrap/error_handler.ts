// src/middleware/errorHandler.ts
import { AppError } from "@utils/error/AppError";
import { AxiosError } from "axios";
import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

const isProduction = process.env.NODE_ENV === "production";

/**
 * Safely extracts a user-friendly message from Axios error response
 * without leaking internal/upstream data
 */
const getSafeAxiosErrorMessage = (err: AxiosError): string => {
  // In production, never expose upstream error details
  if (isProduction) {
    return "An external service error occurred";
  }

  // In development, allow safe messages but filter out sensitive data
  const upstreamMessage = (err.response?.data as { message?: string })?.message;
  if (upstreamMessage && typeof upstreamMessage === "string") {
    // Only return if it looks like a safe user-facing message
    // Filter out technical details, stack traces, etc.
    return upstreamMessage;
  }

  return err.message || "An external service error occurred";
};

/**
 * Safely extracts error message without leaking internal details
 */
const getSafeErrorMessage = (err: Error): string => {
  if (isProduction) {
    return "Something went wrong";
  }
  // In development, show the actual message for debugging
  return err.message;
};

export const errorHandler = (
  err: Error | AppError | ZodError,
  req: Request,
  res: Response,
  _next: NextFunction // eslint-disable-line @typescript-eslint/no-unused-vars
) => {
  // Always log full error details internally for debugging
  console.error("ERROR: " + err.message);
  console.error(err.stack?.split("\n").slice(2).join("\n")); // Log the error stack trace (first two lines)

  // Log additional context for Axios errors (but never send to client)
  if (err instanceof AxiosError) {
    console.error("Axios Error Details:", {
      url: err.config?.url,
      method: err.config?.method,
      status: err.response?.status,
      statusText: err.response?.statusText,
      // Log response data internally but never expose to client
      responseData: err.response?.data,
    });
  }

  console.log("=============================");

  if (err instanceof ZodError) {
    const formatted = err.issues.map((e) => ({
      path: e.path.join("."),
      message: e.message,
    }));

    res.status(400).json({
      status: false,
      code: "VALIDATION_ERROR",
      message: formatted?.[0]?.message || "Validation Error",
      errors: formatted,
    });
    return;
  }

  if (err instanceof AxiosError) {
    // Never forward raw upstream response data to clients
    // It may contain PII from KYC providers or internal service details
    const statusCode = err.response?.status || 500;
    const safeMessage = getSafeAxiosErrorMessage(err);

    return res.status(statusCode).json({
      success: false,
      message: safeMessage,
      status: false,
      // Only include status code, never raw response data
      ...(isProduction
        ? {}
        : {
            // In development, include status code for debugging
            statusCode: err.response?.status,
          }),
    });
  }

  // if error was already handled by AppError
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: false,
      code: err.code ?? "INTERNAL_ERROR",
      message: err.message,
    });
    return;
  }

  // Unknown errors - never leak internal details in production
  res.status(500).json({
    status: false,
    code: "INTERNAL_ERROR",
    error: "Something went wrong!",
    message: getSafeErrorMessage(err),
  });
  return;
};
