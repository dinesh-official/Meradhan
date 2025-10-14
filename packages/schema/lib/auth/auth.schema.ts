import z from "zod";

export const loginWithOtpSchema = z.object({
    email: z.email({ error: "Enter a valid email id" }),
}, { error: "enter valid data" });


export const verifyOtpSchema = z.object({
    email: z.email({ error: "Enter a valid email id" }),
    token: z.string({ error: "token is missing" }).min(5, { error: "invalid token" }),
    otp: z.string({ error: "enter your otp" }).min(6, { error: "enter a valid otp 6 care." })
}, { error: "enter valid data" });

