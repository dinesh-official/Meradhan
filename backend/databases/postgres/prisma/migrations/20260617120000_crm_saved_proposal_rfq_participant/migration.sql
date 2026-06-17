-- Allow saved proposals for external NSE RFQ participants (no Meradhan customer).

ALTER TABLE "crm_saved_proposals"
    ALTER COLUMN "customerProfileId" DROP NOT NULL;

ALTER TABLE "crm_saved_proposals"
    ADD COLUMN IF NOT EXISTS "linkedRfqParticipantCode" VARCHAR(64);

CREATE INDEX IF NOT EXISTS "crm_saved_proposals_linkedRfqParticipantCode_idx"
    ON "crm_saved_proposals" ("linkedRfqParticipantCode");
