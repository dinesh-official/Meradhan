-- Bond reminder emails (maturity + coupon): dedupe log keyed by
-- (customer, ISIN, reminderType, anchorDateIst) so cron re-runs and
-- queue retries cannot produce duplicate customer emails.

-- CreateEnum
CREATE TYPE "BondReminderType" AS ENUM (
    'MATURITY_M_30',
    'MATURITY_M_15',
    'MATURITY_M_3',
    'MATURITY_DAY',
    'COUPON_D_MINUS_4',
    'COUPON_DAY'
);

-- CreateEnum
CREATE TYPE "BondReminderStatus" AS ENUM (
    'QUEUED',
    'SENT',
    'FAILED',
    'SKIPPED'
);

-- CreateTable
CREATE TABLE "bond_reminder_logs" (
    "id" SERIAL NOT NULL,
    "customerProfileId" INTEGER NOT NULL,
    "isin" TEXT NOT NULL,
    "reminderType" "BondReminderType" NOT NULL,
    "anchorDateIst" DATE NOT NULL,
    "scheduledForIst" DATE NOT NULL,
    "status" "BondReminderStatus" NOT NULL DEFAULT 'QUEUED',
    "errorMessage" TEXT,
    "emailMessageId" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bond_reminder_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bond_reminder_logs_customerProfileId_isin_reminderType_anch_key"
    ON "bond_reminder_logs"("customerProfileId", "isin", "reminderType", "anchorDateIst");

-- CreateIndex
CREATE INDEX "bond_reminder_logs_scheduledForIst_idx" ON "bond_reminder_logs"("scheduledForIst");
CREATE INDEX "bond_reminder_logs_customerProfileId_idx" ON "bond_reminder_logs"("customerProfileId");
CREATE INDEX "bond_reminder_logs_isin_idx" ON "bond_reminder_logs"("isin");
CREATE INDEX "bond_reminder_logs_status_idx" ON "bond_reminder_logs"("status");

-- Note: intentionally no FOREIGN KEY to "customers_profile_data" so this
-- feature does not touch / depend on the customer table in any way. Orphaned
-- rows (if a customer is hard-deleted) are acceptable here because this table
-- only stores email send logs, not authoritative customer data.
