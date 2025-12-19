// src/middleware/errorHandler.ts
import { AppError } from "@utils/error/AppError";
import { AxiosError } from "axios";
import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export const errorHandler = (
  err: Error | AppError | ZodError,
  req: Request,
  res: Response,
  _next: NextFunction // eslint-disable-line @typescript-eslint/no-unused-vars
) => {
  console.error("ERROR: " + err.message);
  console.error(err.stack?.split("\n").slice(2).join("\n")); // Log the error stack trace (first two lines)
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
    return res.status(err.response?.status || 500).json({
      success: false,
      message: err.response?.data?.message || err.message,
      response: err.response?.data,
      status: false,
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

  res.status(500).json({
    status: false,
    code: "INTERNAL_ERROR",
    error: "Something went wrong!",
    message: err.message,
  });
  return;
};
