-- Corporate KYC — existing-KYC reuse documents
--
-- Two new optional file-URL columns on `corporate_kyc`:
--   * existingKycFileUrl          → customer's prior KYC file held by another KRA
--   * useExistingKycDeclarationUrl → signed declaration form authorising the reuse

ALTER TABLE "corporate_kyc"
ADD COLUMN IF NOT EXISTS "existingKycFileUrl" TEXT;

ALTER TABLE "corporate_kyc"
ADD COLUMN IF NOT EXISTS "useExistingKycDeclarationUrl" TEXT;
