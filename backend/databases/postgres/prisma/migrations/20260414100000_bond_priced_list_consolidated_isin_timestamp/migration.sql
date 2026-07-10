-- Drop quote-date uniqueness; consolidate on (isin, timestamp).
DROP INDEX IF EXISTS "bond_priced_list_consolidated_isin_quoteDate_key";

-- Backfill `timestamp` from legacy `quoteDate` or `createdAt` before enforcing NOT NULL + unique.
UPDATE "bond_priced_list_consolidated"
SET "timestamp" = ("quoteDate"::timestamp)
WHERE "timestamp" IS NULL AND "quoteDate" IS NOT NULL;

UPDATE "bond_priced_list_consolidated"
SET "timestamp" = "createdAt"
WHERE "timestamp" IS NULL;

-- Dedupe (isin, timestamp): keep lowest id.
DELETE FROM "bond_priced_list_consolidated" a
USING "bond_priced_list_consolidated" b
WHERE a."id" > b."id"
  AND a."isin" = b."isin"
  AND a."timestamp" = b."timestamp";

ALTER TABLE "bond_priced_list_consolidated" ALTER COLUMN "timestamp" SET NOT NULL;

DROP INDEX IF EXISTS "bond_priced_list_consolidated_quoteDate_idx";

ALTER TABLE "bond_priced_list_consolidated" DROP COLUMN IF EXISTS "quoteDate";

CREATE UNIQUE INDEX IF NOT EXISTS "bond_priced_list_consolidated_isin_timestamp_key"
  ON "bond_priced_list_consolidated" ("isin", "timestamp");
