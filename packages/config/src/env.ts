// packages/config/src/env.ts
import { z } from "zod";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url); // get current file path
const __dirname = path.dirname(__filename); // get directory name

// Load .env file based on NODE_ENV
dotenv.config({
  path: path.resolve(__dirname, "../../../", ".env"),
  debug: false,
});
const EnvSchema = z.object(
  {
    // BASE
    HOST_URL: z.string().url({ message: "HOST_URL must be a valid URL" }),
    PORT: z.string().regex(/^\d+$/, { message: "PORT must be a number" }),
    JWT_SECRET: z.string().min(1, { message: "JWT_SECRET is required" }),

    // DATABASE
    DATABASE_URL: z.string().min(1, { message: "DATABASE_URL is required" }),

    // REDIS
    REDIS_USERNAME: z
      .string()
      .min(1, { message: "REDIS_USERNAME is required" }),
    REDIS_PASSWORD: z
      .string()
      .min(1, { message: "REDIS_PASSWORD is required" }),
    REDIS_HOST: z.string().min(1, { message: "REDIS_HOST is required" }),
    REDIS_PORT: z
      .string()
      .regex(/^\d+$/, { message: "REDIS_PORT must be a number" }),

    // HRA
    KRA_USERNAME: z.string().min(1, { message: "KRA_USERNAME is required" }),
    KRA_PASSWORD: z.string().min(1, { message: "KRA_PASSWORD is required" }),
    KRA_PASS_KEY: z.string().min(1, { message: "KRA_PASS_KEY is required" }),
    KRA_OKRA_CD_MI_ID: z
      .string()
      .min(1, { message: "KRA_OKRA_CD_MI_ID is required" }),
    KRA_ENV: z.string().min(1, { message: "KRA_ENV is required" }),

    // MSG91
    MSG91_AUTH_KEY: z
      .string()
      .min(1, { message: "MSG91_AUTH_KEY is required" }),
    MSG91_SIGNUP_TEMPLATE: z
      .string()
      .min(1, { message: "MSG91_SIGNUP_TEMPLATE is required" }),
    MSG91_LOGIN_TEMPLATE: z
      .string()
      .min(1, { message: "MSG91_LOGIN_TEMPLATE is required" }),
    MSG91_VERIFY_TEMPLATE: z
      .string()
      .min(1, { message: "MSG91_VERIFY_TEMPLATE is required" }),

    // SMTP
    SMTP_SENDER: z.string().min(1, { message: "SMTP_SENDER is required" }),
    SMTP_HOST: z.string().min(1, { message: "SMTP_HOST is required" }),
    SMTP_PORT: z
      .string()
      .regex(/^\d+$/, { message: "SMTP_PORT must be a number" }),
    SMTP_USER: z.string().min(1, { message: "SMTP_USER is required" }),
    SMTP_PASS: z.string().min(1, { message: "SMTP_PASS is required" }),

    // CBRICS
    CBRICS_DOMAIN: z.string().min(1, { message: "CBRICS_DOMAIN is required" }),
    CBRICS_LOGIN: z.string().min(1, { message: "CBRICS_LOGIN is required" }),
    CBRICS_PASSWORD: z
      .string()
      .min(1, { message: "CBRICS_PASSWORD is required" }),

    // RFQ
    // (Assuming they are distinct but same keys given)
    RFQ_CBRICS_DOMAIN: z.string().optional(),
    RFQ_CBRICS_LOGIN: z.string().optional(),
    RFQ_CBRICS_PASSWORD: z.string().optional(),

    // DIGIO
    DIGIO_USERNAME_PASS: z
      .string()
      .min(1, { message: "DIGIO_USERNAME_PASS is required" }),

    // NDSL / NSDL
    NDSL_REQUESTOR_ID: z
      .string()
      .min(1, { message: "NDSL_REQUESTOR_ID is required" }),
    NSDL_SECRET_KEY: z
      .string()
      .min(1, { message: "NSDL_SECRET_KEY is required" }),

    // CDSL
    CDSL_AES_KEY: z.string().min(1, { message: "CDSL_AES_KEY is required" }),
    ENTITY_ID: z.string().min(1, { message: "ENTITY_ID is required" }),
  },
  { error: "Need to set all required env variables" }
);

// Validate at startup
export const env = EnvSchema.parse(process.env);
export type Env = z.infer<typeof EnvSchema>;
