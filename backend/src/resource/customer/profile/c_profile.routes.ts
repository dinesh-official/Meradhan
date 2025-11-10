import { Router } from "express";
import { CustomerProfileController } from "./c_profile.controller";
import { customerAuthMiddleware } from "@middlewares/customer_middleware";

const customerProfileRoutes = Router();
const controller = new CustomerProfileController();

customerProfileRoutes.post("/api/auth/customer/profile/mobile", customerAuthMiddleware, (req, res) => controller.requestMobileUpdate(req, res));
customerProfileRoutes.post("/api/auth/customer/profile/mobile/send-otp", customerAuthMiddleware, (req, res) => controller.sendMobileOtpVerification(req, res));
customerProfileRoutes.post("/api/auth/customer/profile/mobile/verify", customerAuthMiddleware, (req, res) => controller.verifyAndUpdateMobile(req, res));

customerProfileRoutes.post("/api/auth/customer/profile/whatsapp", customerAuthMiddleware, (req, res) => controller.toggleWhatsAppPreference(req, res));

// Bank account routes
customerProfileRoutes.post("/api/auth/customer/profile/bank-account", customerAuthMiddleware, (req, res) => controller.addBankAccount(req, res));
customerProfileRoutes.delete("/api/auth/customer/profile/bank-account/:bankAccountId", customerAuthMiddleware, (req, res) => controller.removeBankAccount(req, res));
customerProfileRoutes.post("/api/auth/customer/profile/bank-account/primary/:bankAccountId", customerAuthMiddleware, (req, res) => controller.setPrimaryBankAccount(req, res));

// Demat account routes
customerProfileRoutes.post("/api/auth/customer/profile/demat-account", customerAuthMiddleware, (req, res) => controller.addNewDematAccount(req, res));
customerProfileRoutes.delete("/api/auth/customer/profile/demat-account/:dematAccountId", customerAuthMiddleware, (req, res) => controller.removeDematAccount(req, res));
customerProfileRoutes.post("/api/auth/customer/profile/demat-account/primary/:dematAccountId", customerAuthMiddleware, (req, res) => controller.setPrimaryDematAccount(req, res));
customerProfileRoutes.post("/api/auth/customer/profile/risk-profile", customerAuthMiddleware, (req, res) => controller.saveRiskProfileAnswers(req, res));
export default customerProfileRoutes;
