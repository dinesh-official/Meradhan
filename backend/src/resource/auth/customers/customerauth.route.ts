import { Router } from 'express';
import { OtpVerifyLimiter, signupWithEmailOtpLimiter, signupWithMobileOtpLimiter } from '../auth.limit';
import { CustomerAuthController } from './customerauth.controller';
import { customerAuthMiddleware } from '@lib/middlewares/customer.middleware';

const customerAuthRoutes = Router();
const controller = new CustomerAuthController()

customerAuthRoutes.all("/api/customer/session", customerAuthMiddleware, (req, res) => controller.session(req, res))

// signup
customerAuthRoutes.post("/api/auth/customer/send-signup-mobile-verify", signupWithEmailOtpLimiter, (req, res) => controller.sendAuthMobileOtp(req, res))
customerAuthRoutes.post("/api/auth/customer/send-signup-email-verify", signupWithMobileOtpLimiter, (req, res) => controller.sendAuthEmailOtp(req, res))
customerAuthRoutes.post("/api/auth/customer/signup-with-credentials", OtpVerifyLimiter, (req, res) => controller.signUpWithCredentials(req, res))

// signin
customerAuthRoutes.post("/api/auth/customer/signin/request", (req, res) => controller.signInRequest(req, res))
customerAuthRoutes.post("/api/auth/customer/signin/with-password", (req, res) => controller.signInWithPassword(req, res))
customerAuthRoutes.post("/api/auth/customer/signin/send-otp", (req, res) => controller.signInWithOtpSend(req, res))
customerAuthRoutes.post("/api/auth/customer/signin/with-otp", (req, res) => controller.signInWithOtpVerify(req, res))

// logout
customerAuthRoutes.all("/api/auth/customer/logout", (req, res) => controller.logout(req, res))


export default customerAuthRoutes;