-- Persist CRM corporate KYC PDF editor form draft (JSON payload).

ALTER TABLE "CorporateKycModel"
ADD COLUMN IF NOT EXISTS "lastPdfPayload" JSONB;

ALTER TABLE "CorporateKycModel"
ADD COLUMN IF NOT EXISTS "lastPdfPayloadAt" TIMESTAMP(3);
