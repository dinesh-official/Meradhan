import { allowAccessMiddleware } from "@middlewares/auth_middleware";
import { withRateLimit } from "@middlewares/ratelimit_midddleare";
import { Router } from "express";
import { CustomerProfileController } from "./customer.profile.controller";

const customerProfileRoutes = Router();
const controller = new CustomerProfileController();

customerProfileRoutes.post(
  "/api/auth/customer/profile/mobile",
  allowAccessMiddleware("USER"),
  (req, res) => controller.requestMobileUpdate(req, res),
);
customerProfileRoutes.post(
  "/api/auth/customer/profile/mobile/send-otp",
  allowAccessMiddleware("USER"),
  (req, res) => controller.sendMobileOtpVerification(req, res),
);
customerProfileRoutes.post(
  "/api/auth/customer/profile/mobile/verify",
  allowAccessMiddleware("USER"),
  (req, res) => controller.verifyAndUpdateMobile(req, res),
);
customerProfileRoutes.post(
  "/api/auth/customer/profile/email/send-otp",
  allowAccessMiddleware("USER"),
  withRateLimit({ max: 5 }),
  (req, res) => controller.sendEmailChangeOtp(req, res),
);
customerProfileRoutes.post(
  "/api/auth/customer/profile/email/verify",
  allowAccessMiddleware("USER"),
  withRateLimit({ max: 5 }),
  (req, res) => controller.verifyEmailChange(req, res),
);
customerProfileRoutes.post(
  "/api/auth/customer/profile/whatsapp",
  allowAccessMiddleware("USER"),
  (req, res) => controller.toggleWhatsAppPreference(req, res),
);
customerProfileRoutes.post(
  "/api/auth/customer/profile/bank-account",
  allowAccessMiddleware("USER"),
  (req, res) => controller.addBankAccount(req, res),
);
customerProfileRoutes.delete(
  "/api/auth/customer/profile/bank-account/:bankAccountId",
  allowAccessMiddleware("USER"),
  (req, res) => controller.removeBankAccount(req, res),
);
customerProfileRoutes.post(
  "/api/auth/customer/profile/bank-account/primary/:bankAccountId",
  allowAccessMiddleware("USER"),
  (req, res) => controller.setPrimaryBankAccount(req, res),
);

customerProfileRoutes.post(
  "/api/auth/customer/profile/demat-account",
  allowAccessMiddleware("USER"),
  (req, res) => controller.addNewDematAccount(req, res),
);

customerProfileRoutes.delete(
  "/api/auth/customer/profile/demat-account/:dematAccountId",
  allowAccessMiddleware("USER"),
  (req, res) => controller.removeDematAccount(req, res),
);

customerProfileRoutes.post(
  "/api/auth/customer/profile/demat-account/primary/:dematAccountId",
  allowAccessMiddleware("USER"),
  (req, res) => controller.setPrimaryDematAccount(req, res),
);

customerProfileRoutes.post(
  "/api/auth/customer/profile/risk-profile",
  allowAccessMiddleware("USER"),
  (req, res) => controller.saveRiskProfileAnswers(req, res),
);

export default customerProfileRoutes;
