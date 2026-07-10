-- Allow corporate e-sign requests without an upfront PDF.
-- When null, the meradhan customer completes risk profile and the backend
-- generates the source PDF before Digio signing.

ALTER TABLE "corporate_e_sign_requests"
  ALTER COLUMN "eSignDocumentUrl" DROP NOT NULL;
