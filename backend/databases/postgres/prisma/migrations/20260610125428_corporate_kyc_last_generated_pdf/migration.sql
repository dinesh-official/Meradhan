-- Corporate KYC — last generated PDF snapshot
--
-- Two new optional columns on `corporate_kyc`:
--   * lastGeneratedPdfUrl → S3 URL of the most recently generated 19-page
--                           corporate KYC PDF snapshot.
--   * lastGeneratedPdfAt  → wall-clock timestamp the snapshot was produced,
--                           surfaced in the CRM so operators know how stale
--                           the artifact is before sending it out.

ALTER TABLE "corporate_kyc"
ADD COLUMN IF NOT EXISTS "lastGeneratedPdfUrl" TEXT;

ALTER TABLE "corporate_kyc"
ADD COLUMN IF NOT EXISTS "lastGeneratedPdfAt" TIMESTAMP(3);
