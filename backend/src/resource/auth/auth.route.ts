import { withAuthMiddleware } from '@lib/middlewares/auth.middleware';
import { Router } from 'express';
import { AuthController } from './auth.controller';
import { loginWithOtpLimiter, OtpVerifyLimiter } from './auth.limit';
const authRoutes = Router();
const controller = new AuthController()

authRoutes.post("/api/auth/login-with-otp", loginWithOtpLimiter, (req, res) => controller.loginWithOtp(req, res))
authRoutes.post("/api/auth/verify-otp", OtpVerifyLimiter, (req, res) => controller.verifyLoginOtp(req, res))
authRoutes.all("/api/auth/logout", (req, res) => controller.logout(req, res))
authRoutes.all("/api/session", withAuthMiddleware, (req, res) => controller.session(req, res))

export default authRoutes;