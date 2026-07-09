-- Digio tracking fields on corporate e-sign requests
--
-- The CRM operator now creates the request as before, but the meradhan
-- customer signs via Digio (see corporateESign.service.ts). These three
-- columns track the most recent Digio attempt for the row:
--   - digioDocumentId      the Digio doc id returned by /v2/client/document/upload
--   - digioAccessTokenId   the access_token.id (rotates on customer retries)
--   - digioRequestedAt     timestamp of the most recent /digio-request call
--
-- All three are nullable so existing PENDING rows (created before this
-- migration) continue to work — they simply have no Digio kick-off yet.

ALTER TABLE "corporate_e_sign_requests"
  ADD COLUMN IF NOT EXISTS "digioDocumentId"    TEXT,
  ADD COLUMN IF NOT EXISTS "digioAccessTokenId" TEXT,
  ADD COLUMN IF NOT EXISTS "digioRequestedAt"   TIMESTAMP(3);

-- Unique index on digioDocumentId so the /digio-verify endpoint can use
-- the doc id as a stable lookup key (and rotating tokens never collide).
CREATE UNIQUE INDEX IF NOT EXISTS "corporate_e_sign_requests_digioDocumentId_key"
  ON "corporate_e_sign_requests" ("digioDocumentId");
