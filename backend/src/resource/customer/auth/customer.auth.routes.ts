import { Router } from "express";

import { allowAccessMiddleware } from "@middlewares/auth_middleware";
import { withRateLimit } from "@middlewares/ratelimit_midddleare";
import { CustomerAuthController } from "./customer.auth.controller";
import { ForgetPasswordController } from "./password/forget_password.controller";

const customerAuthRoutes = Router();
const controller = new CustomerAuthController();

customerAuthRoutes.all(
  "/api/customer/session",
  allowAccessMiddleware("USER"),
  (req, res) => controller.session(req, res)
);

// signup email and mobile verification
customerAuthRoutes.post(
  "/api/auth/customer/send-signup-mobile-verify",
  withRateLimit({ max: 5 }),
  (req, res) => controller.sendAuthMobileOtp(req, res)
);
// signup email verification
customerAuthRoutes.post(
  "/api/auth/customer/send-signup-email-verify",
  withRateLimit({ max: 5 }),
  (req, res) => controller.sendAuthEmailOtp(req, res)
);

customerAuthRoutes.post(
  "/api/auth/customer/verify-signup-otp",
  withRateLimit({ max: 5 }),
  (req, res) => controller.verifyOtpForSignup(req, res)
);

customerAuthRoutes.post(
  "/api/auth/customer/signup-with-credentials",
  withRateLimit({ max: 10 }),
  (req, res) => controller.signUpWithCredentials(req, res)
);

// signin
customerAuthRoutes.post(
  "/api/auth/customer/signin/request",
  withRateLimit({ max: 5 }),
  (req, res) => controller.signInRequest(req, res)
);
customerAuthRoutes.post(
  "/api/auth/customer/signin/with-password",
  withRateLimit({ max: 10 }),
  (req, res) => controller.signInWithPassword(req, res)
);
customerAuthRoutes.post(
  "/api/auth/customer/signin/send-otp",
  withRateLimit({ max: 5 }),
  (req, res) => controller.signInWithOtpSend(req, res)
);
customerAuthRoutes.post(
  "/api/auth/customer/signin/with-otp",
  withRateLimit({ max: 5 }),
  (req, res) => controller.signInWithOtpVerify(req, res)
);

// logout
customerAuthRoutes.all("/api/auth/customer/logout", (req, res) =>
  controller.logout(req, res)
);

// forget password
const forgetPasswordController = new ForgetPasswordController();
customerAuthRoutes.post(
  "/api/auth/customer/send-forget-password",
  withRateLimit({ max: 5 }),
  (req, res) => forgetPasswordController.sendForgetPassword(req, res)
);
customerAuthRoutes.post(
  "/api/auth/customer/reset-password",
  withRateLimit({ max: 5 }),
  (req, res) => forgetPasswordController.resetPassword(req, res)
);

customerAuthRoutes.get(
  "/api/auth/customer/send-verify-email",
  allowAccessMiddleware("USER"),
  withRateLimit({ max: 5 }),
  (req, res) => controller.sendVerifyEmail(req, res)
);
customerAuthRoutes.get("/api/auth/customer/verify-email", (req, res) =>
  controller.verifyEmail(req, res)
);

customerAuthRoutes.post(
  "/api/auth/customer/resend-email-verification",
  withRateLimit({ max: 5 }),
  (req, res) => controller.resendEmailVerificationForUnverifiedUser(req, res)
);

export default customerAuthRoutes;
