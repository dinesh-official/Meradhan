-- One row per (ISIN, quote calendar day); bulk upload updates when both match.

DROP INDEX IF EXISTS "bond_priced_list_consolidated_isin_key";

ALTER TABLE "bond_priced_list_consolidated" ADD COLUMN IF NOT EXISTS "quoteDate" DATE;

UPDATE "bond_priced_list_consolidated"
SET "quoteDate" = CAST("timestamp" AS date)
WHERE "quoteDate" IS NULL AND "timestamp" IS NOT NULL;

UPDATE "bond_priced_list_consolidated"
SET "quoteDate" = to_date(trim("dateRaw"), 'YYYY-MM-DD')
WHERE "quoteDate" IS NULL
  AND "dateRaw" IS NOT NULL
  AND trim("dateRaw") ~ '^\d{4}-\d{2}-\d{2}$';

UPDATE "bond_priced_list_consolidated"
SET "quoteDate" = to_date(trim("dateRaw"), 'DD-MM-YYYY')
WHERE "quoteDate" IS NULL
  AND "dateRaw" IS NOT NULL
  AND trim("dateRaw") ~ '^\d{2}-\d{2}-\d{4}$';

UPDATE "bond_priced_list_consolidated"
SET "quoteDate" = CAST("createdAt" AS date)
WHERE "quoteDate" IS NULL;

ALTER TABLE "bond_priced_list_consolidated" ALTER COLUMN "quoteDate" SET NOT NULL;

-- Resolve duplicate (isin, quoteDate): keep lowest id per group (repeat-safe)
DELETE FROM "bond_priced_list_consolidated" a
WHERE EXISTS (
  SELECT 1
  FROM "bond_priced_list_consolidated" b
  WHERE b."isin" = a."isin"
    AND b."quoteDate" = a."quoteDate"
    AND b.id < a.id
);

CREATE UNIQUE INDEX IF NOT EXISTS "bond_priced_list_consolidated_isin_quoteDate_key"
  ON "bond_priced_list_consolidated" ("isin", "quoteDate");
