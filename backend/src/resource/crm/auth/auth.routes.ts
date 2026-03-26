import { Router } from "express";
import { AuthController } from "./auth.controller";
import { allowAccessMiddleware } from "@middlewares/auth_middleware";
import { OtpVerifyLimiter, loginWithOtpLimiter } from "./auth.ratelimit";
const crmAuthRoutes = Router();
const controller = new AuthController();

crmAuthRoutes.post(
  "/api/auth/login-with-otp",
  loginWithOtpLimiter,
  (req, res) => controller.loginWithOtp(req, res)
);
crmAuthRoutes.post("/api/auth/verify-otp", OtpVerifyLimiter, (req, res) =>
  controller.verifyLoginOtp(req, res)
);
crmAuthRoutes.all("/api/auth/logout", (req, res) =>
  controller.logout(req, res)
);
crmAuthRoutes.all("/api/session", allowAccessMiddleware("CRM"), (req, res) =>
  controller.session(req, res)
);

export default crmAuthRoutes;
