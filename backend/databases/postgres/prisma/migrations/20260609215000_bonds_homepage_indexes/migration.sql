-- Speeds up the home-page bonds endpoints (`getLatestBonds`,
-- `getHighYieldBonds`, `getZeroCouponBonds`) which all share the predicate
-- `isListed = 'YES' AND allowForPurchase = TRUE` and then ORDER BY a
-- combination of dateOfAllotment / yield / creditRating.
--
-- Without these indexes Postgres scans the entire `bonds` table and sorts in
-- memory on every homepage request — combined with the inventory-enrich hop,
-- that's the primary cause of the 15s axios timeouts seen on stage-fe.
--
-- All `CREATE INDEX IF NOT EXISTS` statements are idempotent so re-running
-- the migration is safe.

CREATE INDEX IF NOT EXISTS "bonds_isListed_allowForPurchase_dateOfAllotment_idx"
  ON "bonds" ("isListed", "allowForPurchase", "dateOfAllotment" DESC);

CREATE INDEX IF NOT EXISTS "bonds_isListed_allowForPurchase_yield_idx"
  ON "bonds" ("isListed", "allowForPurchase", "yield" DESC);

CREATE INDEX IF NOT EXISTS "bonds_creditRating_idx"
  ON "bonds" ("creditRating");

-- GIN index for the `categories` array (e.g. `categories @> ARRAY['zero-coupon']`).
-- Prisma's schema language can't express GIN indexes today, so this one stays
-- in raw SQL.
CREATE INDEX IF NOT EXISTS "bonds_categories_gin_idx"
  ON "bonds" USING GIN ("categories");
