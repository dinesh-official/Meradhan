-- Align reference XLSX storage with 3-sheet structure:
-- 1) AD                 -> bond_reference_metadata (already exists)
-- 2) Coupon Payment Dates-> bond_reference_coupon_payment_dates
-- 3) Redemption Schedule -> bond_reference_redemption_schedule

-- Remove legacy JSON aggregates if they exist (moved to dedicated tables)
ALTER TABLE "bond_reference_metadata" DROP COLUMN IF EXISTS "couponPaymentDates";
ALTER TABLE "bond_reference_metadata" DROP COLUMN IF EXISTS "redemptionSchedule";

-- CreateTable
CREATE TABLE IF NOT EXISTS "bond_reference_coupon_payment_dates" (
  "id" SERIAL NOT NULL,
  "isin" TEXT NOT NULL,
  "interestPaymentDates" TEXT,
  "recordDays" DOUBLE PRECISION,
  "recordDate" TIMESTAMP(3),
  "dueDate" TIMESTAMP(3),
  "raw" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "bond_reference_coupon_payment_dates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "bond_reference_coupon_payment_dates_isin_idx"
  ON "bond_reference_coupon_payment_dates"("isin");
CREATE INDEX IF NOT EXISTS "bond_reference_coupon_payment_dates_recordDate_idx"
  ON "bond_reference_coupon_payment_dates"("recordDate");
CREATE INDEX IF NOT EXISTS "bond_reference_coupon_payment_dates_dueDate_idx"
  ON "bond_reference_coupon_payment_dates"("dueDate");

-- CreateTable
CREATE TABLE IF NOT EXISTS "bond_reference_redemption_schedule" (
  "id" SERIAL NOT NULL,
  "isin" TEXT NOT NULL,
  "redemptionType" TEXT,
  "startDate" TIMESTAMP(3),
  "endDate" TIMESTAMP(3),
  "price" DOUBLE PRECISION,
  "amount" DOUBLE PRECISION,
  "optionType" TEXT,
  "optionFrequency" TEXT,
  "raw" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "bond_reference_redemption_schedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "bond_reference_redemption_schedule_isin_idx"
  ON "bond_reference_redemption_schedule"("isin");
CREATE INDEX IF NOT EXISTS "bond_reference_redemption_schedule_startDate_idx"
  ON "bond_reference_redemption_schedule"("startDate");
CREATE INDEX IF NOT EXISTS "bond_reference_redemption_schedule_endDate_idx"
  ON "bond_reference_redemption_schedule"("endDate");

