-- Drop stored calculator snapshot columns from bonds.
-- Live pricing comes from DeriData; these per-bond amount fields are unused.

ALTER TABLE "bonds" DROP COLUMN IF EXISTS "accruedInterestDays";
ALTER TABLE "bonds" DROP COLUMN IF EXISTS "accruedInterest";
ALTER TABLE "bonds" DROP COLUMN IF EXISTS "settlementAmount";
ALTER TABLE "bonds" DROP COLUMN IF EXISTS "principalAmount";
ALTER TABLE "bonds" DROP COLUMN IF EXISTS "totalConsideration";
