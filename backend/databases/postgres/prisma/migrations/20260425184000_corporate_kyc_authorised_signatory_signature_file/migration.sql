-- Add signature upload for corporate KYC authorised signatories
ALTER TABLE "corporate_kyc_authorised_signatories"
ADD COLUMN IF NOT EXISTS "signatureFileUrl" TEXT;

