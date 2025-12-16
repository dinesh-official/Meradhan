import { Router } from "express";

import { allowAccessMiddleware } from "../../../middlewares/auth_middleware";
import { CustomerAuthController } from "./customer.auth.controller";
import { ForgetPasswordController } from "./password/forget_password.controller";

const customerAuthRoutes = Router();
const controller = new CustomerAuthController();

customerAuthRoutes.all(
  "/api/customer/session",
  allowAccessMiddleware("USER"),
  (req, res) => controller.session(req, res)
);

// signup
customerAuthRoutes.post(
  "/api/auth/customer/send-signup-mobile-verify",
  (req, res) => controller.sendAuthMobileOtp(req, res)
);
customerAuthRoutes.post(
  "/api/auth/customer/send-signup-email-verify",
  (req, res) => controller.sendAuthEmailOtp(req, res)
);
customerAuthRoutes.post(
  "/api/auth/customer/signup-with-credentials",
  (req, res) => controller.signUpWithCredentials(req, res)
);

// signin
customerAuthRoutes.post("/api/auth/customer/signin/request", (req, res) =>
  controller.signInRequest(req, res)
);
customerAuthRoutes.post("/api/auth/customer/signin/with-password", (req, res) =>
  controller.signInWithPassword(req, res)
);
customerAuthRoutes.post("/api/auth/customer/signin/send-otp", (req, res) =>
  controller.signInWithOtpSend(req, res)
);
customerAuthRoutes.post("/api/auth/customer/signin/with-otp", (req, res) =>
  controller.signInWithOtpVerify(req, res)
);

// logout
customerAuthRoutes.all("/api/auth/customer/logout", (req, res) =>
  controller.logout(req, res)
);

// forget password
const forgetPasswordController = new ForgetPasswordController();
customerAuthRoutes.post("/api/auth/customer/send-forget-password", (req, res) =>
  forgetPasswordController.sendForgetPassword(req, res)
);
customerAuthRoutes.post("/api/auth/customer/reset-password", (req, res) =>
  forgetPasswordController.resetPassword(req, res)
);

customerAuthRoutes.get(
  "/api/auth/customer/send-verify-email",
  allowAccessMiddleware("USER"),
  (req, res) => controller.sendVerifyEmail(req, res)
);
customerAuthRoutes.get("/api/auth/customer/verify-email", (req, res) =>
  controller.verifyEmail(req, res)
);

export default customerAuthRoutes;
