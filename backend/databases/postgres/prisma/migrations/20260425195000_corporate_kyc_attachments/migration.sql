-- Corporate KYC attachments (label + file URL)
CREATE TABLE IF NOT EXISTS "corporate_kyc_attachments" (
  "id" SERIAL PRIMARY KEY,
  "corporateKycModelId" INTEGER NOT NULL,
  "label" TEXT NOT NULL,
  "fileUrl" TEXT NOT NULL,
  "createdByCrmUserId" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "corporate_kyc_attachments_corporateKycModelId_idx"
  ON "corporate_kyc_attachments" ("corporateKycModelId");

CREATE INDEX IF NOT EXISTS "corporate_kyc_attachments_createdAt_idx"
  ON "corporate_kyc_attachments" ("createdAt");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'corporate_kyc_attachments_corporateKycModelId_fkey'
  ) THEN
    ALTER TABLE "corporate_kyc_attachments"
      ADD CONSTRAINT "corporate_kyc_attachments_corporateKycModelId_fkey"
      FOREIGN KEY ("corporateKycModelId") REFERENCES "corporate_kyc"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

