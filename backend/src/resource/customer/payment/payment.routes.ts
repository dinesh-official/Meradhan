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
  paymentController.handleWebhook
);

export default paymentRoutes;
