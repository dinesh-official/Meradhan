// packages/config/src/env.ts
import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url); // get current file path
const __dirname = path.dirname(__filename); // get directory name

// Load .env file based on NODE_ENV
dotenv.config({ path: path.resolve(__dirname, '../../../', '.env.development'), debug: false });
const EnvSchema = z.object(
  {
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

    // Server
    PORT: z.coerce.number().default(4000),

    // Database
    MONGO_DATABASE_URL: z.url({ error: 'MONGO_DATABASE_URL must be a valid URL in .env' }),

    // JWT & Auth
    JWT_SECRET: z
      .string({ error: 'JWT_SECRET must be a string in .env' })
      .min(32, 'JWT_SECRET must be at least 32 characters .env'),

    // Redis / Queue
    REDIS_URL: z.url().optional(),

    // Optional API keys
    // STRIPE_KEY: z.string().optional(),
    // SENDGRID_API_KEY: z.string().optional(),
  },
  { error: 'Need to set all required env variables' }
);

// Validate at startup
export const env = EnvSchema.parse(process.env);
export type Env = z.infer<typeof EnvSchema>;
