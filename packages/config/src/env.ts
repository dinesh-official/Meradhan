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
    NEXT_PUBLIC_HOST_URL: z.url({ message: "NEXT_PUBLIC_HOST_URL must be a valid URL", }),
    NEXT_PUBLIC_BACKEND_HOST_URL: z.url().optional(),
    PORT: z.string().regex(/^\d+$/, { message: "PORT must be a number" }),
    JWT_SECRET: z.string().min(1, { message: "JWT_SECRET is required" }),

    // DATABASE
    DATABASE_URL: z.string().min(1, { message: "DATABASE_URL is required" }),

    // REDIS
    REDIS_USERNAME: z.string().min(1, { message: "REDIS_USERNAME is required" }).optional(),
    REDIS_PASSWORD: z.string().min(1, { message: "REDIS_PASSWORD is required" }).optional(),
    REDIS_HOST: z.string().min(1, { message: "REDIS_HOST is required" }),
    REDIS_PORT: z.string().regex(/^\d+$/, { message: "REDIS_PORT must be a number" }),

    // HRA
    KRA_USERNAME: z.string().min(1, { message: "KRA_USERNAME is required" }),
    KRA_PASSWORD: z.string().min(1, { message: "KRA_PASSWORD is required" }),
    KRA_PASS_KEY: z.string().min(1, { message: "KRA_PASS_KEY is required" }),
    KRA_OKRA_CD_MI_ID: z.string().min(1, { message: "KRA_OKRA_CD_MI_ID is required" }),
    KRA_ENV: z.enum(["UAT", "PROD"]),
    KRA_MOB_NO: z.string(),

    // MSG91
    MSG91_AUTH_KEY: z.string().min(1, { message: "MSG91_AUTH_KEY is required" }),
    MSG91_SIGNUP_TEMPLATE: z.string().min(1, { message: "MSG91_SIGNUP_TEMPLATE is required" }),
    MSG91_LOGIN_TEMPLATE: z.string().min(1, { message: "MSG91_LOGIN_TEMPLATE is required" }),
    MSG91_VERIFY_TEMPLATE: z.string().min(1, { message: "MSG91_VERIFY_TEMPLATE is required" }),

    // SMTP
    SMTP_SENDER: z.string().min(1, { message: "SMTP_SENDER is required" }),
    SMTP_HOST: z.string().min(1, { message: "SMTP_HOST is required" }),
    SMTP_PORT: z.string().regex(/^\d+$/, { message: "SMTP_PORT must be a number" }),
    SMTP_USER: z.string().min(1, { message: "SMTP_USER is required" }),
    SMTP_PASS: z.string().min(1, { message: "SMTP_PASS is required" }),

    // CBRICS
    CBRICS_DOMAIN: z.string().min(1, { message: "CBRICS_DOMAIN is required" }),
    CBRICS_LOGIN: z.string().min(1, { message: "CBRICS_LOGIN is required" }),
    CBRICS_ENV: z.enum(["UAT", "PROD"]),
    CBRICS_PASSWORD: z.string().min(1, { message: "CBRICS_PASSWORD is required" }),

    // RFQ
    // (Assuming they are distinct but same keys given) - RFQ is for RFQ only and CBRICS is for CBRICS only
    RFQ_CBRICS_DOMAIN: z.string().optional(),
    RFQ_CBRICS_LOGIN: z.string().optional(),
    RFQ_CBRICS_PASSWORD: z.string().optional(),
    RFQ_CBRICS_ENV: z.enum(["UAT", "PROD"]),

    // RAZORPAY
    RAZORPAY_KEY_ID: z.string().min(1, { message: "RAZORPAY_KEY_ID is required" }),
    RAZORPAY_KEY_SECRET: z.string().min(1, { message: "RAZORPAY_KEY_SECRET is required" }),
    RAZORPAY_WEBHOOK_SECRET: z.string().min(1, { message: "RAZORPAY_WEBHOOK_SECRET is required" }),

    // CHECKOUT CONFIG
    STAMP_DUTY_RATE: z.string().regex(/^\d+(\.\d{1,2})?$/, { message: "STAMP_DUTY_RATE must be a decimal number", }).default("0.1"),

    // DIGIO
    NEXT_PUBLIC_DIGIO: z.string().optional(),
    DIGIO_USERNAME_PASS: z.string().min(1, { message: "DIGIO_USERNAME_PASS is required" }),

    // NDSL / NSDL
    NDSL_REQUESTOR_ID: z.string().min(1, { message: "NDSL_REQUESTOR_ID is required" }),
    NSDL_SECRET_KEY: z.string().min(1, { message: "NSDL_SECRET_KEY is required" }),
    NSDL_MODE: z.string().min(1, { message: "NSDL_MODE  SECRET_KEY is required" }),

    // CDSL
    CDSL_AES_KEY: z.string().min(1, { message: "CDSL_AES_KEY is required" }),
    ENTITY_ID: z.string().min(1, { message: "ENTITY_ID is required" }),
    CDSL_MODE: z.string().min(1, { message: "CDSL_MODE is required" }),

    // ✅ Add S3/Supabase credentials
    S3_ACCESS_KEY_ID: z.string().min(1, { message: "S3_ACCESS_KEY_ID is required", }),
    S3_SECRET_ACCESS_KEY: z.string().min(1, { message: "S3_SECRET_ACCESS_KEY is required", }),
    S3_REGION: z.string().default("ap-south-1"),
    S3_ENDPOINT: z.string().url({ message: "S3_ENDPOINT must be a valid URL", }),
    S3_BUCKET_NAME: z.string().default("documents"),

    // ✅ Add Strapi token
    STRAPI_API_TOKEN: z.string().min(1, { message: "STRAPI_API_TOKEN is required", }),
    STRAPI_API_URL: z.url({ message: "STRAPI_API_URL must be a valid URL", }).default("https://spyder.meradhan.co/api"),

    // ✅ Password hashing pepper - (optional, but recommended for production)
    PASSWORD_PEPPER: z.string().min(16, { message: "PASSWORD_PEPPER must be at least 16 characters", }).optional(),
  },
  { error: "Need to set all required env variables" }
);

// Validate at startup
export const env = EnvSchema.parse(process.env);
export type Env = z.infer<typeof EnvSchema>;
