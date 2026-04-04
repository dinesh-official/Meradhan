import { config as loadEnv } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "prisma/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// prisma.config.ts disables default .env loading; load repo or backend .env
loadEnv({ path: path.resolve(__dirname, ".env") });
loadEnv({ path: path.resolve(__dirname, "../.env") });

/**
 * Prisma CLI resolves schema + migrations relative to this file (backend/).
 * Without this, `migrate deploy` looks for ./prisma/migrations and finds nothing.
 */
export default defineConfig({
  schema: "databases/postgres/prisma/schema",
  migrations: {
    path: "databases/postgres/prisma/migrations",
  },
});
