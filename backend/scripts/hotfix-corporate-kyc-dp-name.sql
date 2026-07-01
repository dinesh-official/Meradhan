-- Unblock corporate KYC queries when migrate deploy cannot run (failed migration P3009).
ALTER TABLE "corporate_kyc_demat_accounts" ADD COLUMN IF NOT EXISTS "dpName" TEXT;
