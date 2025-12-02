import { Router } from "express";
import { PaymentController } from "./payment.controller";

const paymentRoutes = Router();
const paymentController = new PaymentController();

paymentRoutes.post(
  "/api/customer/payment/webhook",
  paymentController.handleWebhook
);

export default paymentRoutes;
