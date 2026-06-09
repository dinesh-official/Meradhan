-- Corporate KYC e-sign requests
--
-- An operator uploads a PDF to be signed by a chosen authorised signatory and
-- tracks the resulting signed file + status (PENDING / COMPLETED / REJECTED).
-- The `personName` column snapshots the signer's name at request time so later
-- edits/deletes in the signatory list do not lose history.

-- 1. ESignRequestStatus enum (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'ESignRequestStatus'
  ) THEN
    CREATE TYPE "ESignRequestStatus" AS ENUM ('PENDING', 'COMPLETED', 'REJECTED');
  END IF;
END $$;

-- 2. corporate_e_sign_requests table
CREATE TABLE IF NOT EXISTS "corporate_e_sign_requests" (
  "id"                    SERIAL PRIMARY KEY,
  "corporateKycModelId"   INTEGER NOT NULL,
  "eSignDocumentUrl"      TEXT NOT NULL,
  "personName"            TEXT NOT NULL,
  "authorisedSignatoryId" INTEGER,
  "signatoryEmail"        TEXT,
  "signatoryPan"          TEXT,
  "notes"                 TEXT,
  "submittedAt"           TIMESTAMP(3),
  "signFileUrl"           TEXT,
  "status"                "ESignRequestStatus" NOT NULL DEFAULT 'PENDING',
  "createdByCrmUserId"    INTEGER,
  "createdAt"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Indexes (idempotent)
CREATE INDEX IF NOT EXISTS "corporate_e_sign_requests_corporateKycModelId_idx"
  ON "corporate_e_sign_requests" ("corporateKycModelId");

CREATE INDEX IF NOT EXISTS "corporate_e_sign_requests_status_idx"
  ON "corporate_e_sign_requests" ("status");

CREATE INDEX IF NOT EXISTS "corporate_e_sign_requests_createdAt_idx"
  ON "corporate_e_sign_requests" ("createdAt");

-- 4. FK → corporate_kyc(id) ON DELETE CASCADE (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'corporate_e_sign_requests_corporateKycModelId_fkey'
  ) THEN
    ALTER TABLE "corporate_e_sign_requests"
      ADD CONSTRAINT "corporate_e_sign_requests_corporateKycModelId_fkey"
      FOREIGN KEY ("corporateKycModelId") REFERENCES "corporate_kyc"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
