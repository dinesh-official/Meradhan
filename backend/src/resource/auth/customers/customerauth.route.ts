import { Router } from 'express';
import { loginWithOtpLimiter, OtpVerifyLimiter } from '../auth.limit';
import { CustomerAuthController } from './customerauth.controller';

const customerAuthRoutes = Router();
const controller = new CustomerAuthController()

customerAuthRoutes.post("/api/auth/customer/send-signup-mobile-verify", loginWithOtpLimiter, (req, res) => controller.sendAuthMobileOtp(req, res))
customerAuthRoutes.post("/api/auth/customer/send-signup-email-verify", loginWithOtpLimiter, (req, res) => controller.sendAuthEmailOtp(req, res))
customerAuthRoutes.post("/api/auth/customer/signup-with-credentials", OtpVerifyLimiter, (req, res) => controller.signUpWithCredentials(req, res))
// customerAuthRoutes.all("/api/auth/customer/logout", (req, res) => controller.logout(req, res))
// customerAuthRoutes.all("/api/customer/session", withAuthMiddleware, (req, res) => controller.session(req, res))

export default customerAuthRoutes;