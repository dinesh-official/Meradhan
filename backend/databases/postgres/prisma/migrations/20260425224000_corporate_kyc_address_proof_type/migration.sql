-- Corporate KYC address proof type (NDML codes)
ALTER TABLE "corporate_kyc"
ADD COLUMN IF NOT EXISTS "correspondenceAddressProofType" TEXT;

ALTER TABLE "corporate_kyc"
ADD COLUMN IF NOT EXISTS "registeredAddressProofType" TEXT;

