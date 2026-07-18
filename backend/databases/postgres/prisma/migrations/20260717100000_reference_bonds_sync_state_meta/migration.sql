-- CreateTable
CREATE TABLE "reference_bonds_sync_state" (
    "isin" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 1,
    "first_seen_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_attempt_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reference_bonds_sync_state_pkey" PRIMARY KEY ("isin")
);

-- CreateTable
CREATE TABLE "reference_bonds_sync_meta" (
    "key" TEXT NOT NULL,
    "value" TEXT,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reference_bonds_sync_meta_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "idx_reference_bonds_sync_state_status" ON "reference_bonds_sync_state"("status");
