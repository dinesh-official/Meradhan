import { Router } from "express";
import express from "express";
import { PaymentController } from "./payment.controller";

const paymentRoutes = Router();
const paymentController = new PaymentController();

// Webhook route needs raw body for signature verification
// Use express.text() to get raw body, then manually parse JSON
paymentRoutes.post(
  "/api/customer/payment/webhook",
  express.text({ type: "application/json" }),
  (req, res, next) => {
    // Store raw body before parsing
    (req as typeof req & { rawBody?: string }).rawBody = req.body as string;

    // Parse JSON for body usage
    try {
      req.body = JSON.parse(req.body as string);
    } catch {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        message: "Invalid JSON in webhook body",
      });
    }

    next();
  },
  paymentController.handleWebhook
);

export default paymentRoutes;
