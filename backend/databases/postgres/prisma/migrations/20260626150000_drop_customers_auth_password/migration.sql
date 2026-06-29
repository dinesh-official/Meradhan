-- Clear any stored password hashes before dropping the column.
UPDATE "customers_auth_data" SET "password" = NULL WHERE "password" IS NOT NULL;

ALTER TABLE "customers_auth_data" DROP COLUMN IF EXISTS "password";
