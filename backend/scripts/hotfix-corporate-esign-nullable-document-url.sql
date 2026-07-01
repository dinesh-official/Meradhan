-- Unblock no-PDF corporate e-sign create when migrate deploy cannot run.
-- Schema: eSignDocumentUrl optional (generated after risk profile).

ALTER TABLE "corporate_e_sign_requests"
  ALTER COLUMN "eSignDocumentUrl" DROP NOT NULL;
