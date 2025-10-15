import { Router } from 'express';
import { AuthController } from './auth.controller';
import { AuthRepo } from './auth.repo';
import { EmailAuthService } from './EmailAuth.service';
import { withAuthMiddleware } from '@lib/middlewares/auth.middleware';
import { loginWithOtpLimiter } from './auth.limit';
const authRoutes = Router();

const authRepo = new AuthRepo();
const authService = new EmailAuthService(authRepo);
const controller = new AuthController(authService)

authRoutes.post("/api/auth/login-with-otp", loginWithOtpLimiter, (req, res) => controller.loginWithOtp(req, res))
authRoutes.post("/api/auth/verify-otp", loginWithOtpLimiter, (req, res) => controller.verifyLoginOtp(req, res))
authRoutes.all("/api/auth/logout", (req, res) => controller.logout(req, res))
authRoutes.all("/api/session", withAuthMiddleware, (req, res) => controller.session(req, res))



export default authRoutes;