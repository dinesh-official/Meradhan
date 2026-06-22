-- Add customer 2FA passcode settings
ALTER TABLE "customers_auth_data"
ADD COLUMN IF NOT EXISTS "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "customers_auth_data"
ADD COLUMN IF NOT EXISTS "twoFactorPasscodeHash" TEXT;
