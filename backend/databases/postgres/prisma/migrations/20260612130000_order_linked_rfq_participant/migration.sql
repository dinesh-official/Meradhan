-- Allow Orders whose counterparty is an external NSE RFQ participant (no
-- Meradhan customer profile). When that is the case `customerProfileId` is
-- NULL and `linkedRfqParticipantCode` carries the
-- `nse_rfq_participant_info.code` instead.

-- 1. Make `customerProfileId` nullable. Existing rows are unaffected.
ALTER TABLE "orders"
    ALTER COLUMN "customerProfileId" DROP NOT NULL;

-- 2. Add the participant link column.
ALTER TABLE "orders"
    ADD COLUMN IF NOT EXISTS "linkedRfqParticipantCode" VARCHAR(64);

-- 3. Lookup index for the new column (used by PDF resolver and CRM listings).
CREATE INDEX IF NOT EXISTS "orders_linkedRfqParticipantCode_idx"
    ON "orders" ("linkedRfqParticipantCode");
