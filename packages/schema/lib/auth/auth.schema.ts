import z from "zod";
import { isCrmLoginEmailDomainAllowed } from "./crm_login_email";

const crmLoginEmailSchema = z
  .email({ error: "Enter a valid email id" })
  .refine(isCrmLoginEmailDomainAllowed, {
    message: "Invalid Email id",
  });

export const loginWithOtpSchema = z.object({
  email: crmLoginEmailSchema,
}, { error: "enter valid data" });


export const verifyOtpSchema = z.object({
  email: crmLoginEmailSchema,
  token: z.string({ error: "token is missing" }).min(5, { error: "invalid token" }),
  otp: z.string({ error: "enter your otp" }).min(6, { error: "enter a valid otp 6 care." })
}, { error: "enter valid data" });

export const impersonateUserSchema = z.object({
  targetUserId: z.number().int().positive(),
});

