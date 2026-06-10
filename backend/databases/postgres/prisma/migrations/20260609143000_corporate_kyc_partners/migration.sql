-- Corporate KYC partners (LLP / Partnership firm partners).
-- Mirrors corporate_kyc_directors / corporate_kyc_promoters so partners join
-- the same NDML APP_ADDL_DATA pipeline with relationship code "06".

CREATE TABLE IF NOT EXISTS "corporate_kyc_partners" (
  "id"                   SERIAL PRIMARY KEY,
  "corporateKycModelId"  INTEGER NOT NULL,
  "fullName"             TEXT NOT NULL,
  "pan"                  TEXT,
  "panCopyFileUrl"       TEXT,
  "aadharCopyFileUrl"    TEXT,
  "passportPhotoFileUrl" TEXT,
  "pepDeclaration"       TEXT,
  "designation"          TEXT,
  "din"                  TEXT,
  "email"                TEXT,
  "mobile"               TEXT,
  "createdAt"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "corporate_kyc_partners_corporateKycModelId_idx"
  ON "corporate_kyc_partners" ("corporateKycModelId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'corporate_kyc_partners_corporateKycModelId_fkey'
  ) THEN
    ALTER TABLE "corporate_kyc_partners"
      ADD CONSTRAINT "corporate_kyc_partners_corporateKycModelId_fkey"
      FOREIGN KEY ("corporateKycModelId") REFERENCES "corporate_kyc"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
