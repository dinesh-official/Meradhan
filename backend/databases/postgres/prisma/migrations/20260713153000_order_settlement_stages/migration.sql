-- Order settlement stage tracking for resume-safe reconciliation

CREATE TYPE "OrderSettlementStage" AS ENUM (
    'started',
    'payment_done',
    'add_isin',
    'quote_accept',
    'deal_propose',
    'deal_accept',
    'pg_routing'
);

ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "settlementStage" "OrderSettlementStage";

CREATE INDEX IF NOT EXISTS "orders_settlementStage_updatedAt_idx"
ON "orders"("settlementStage", "updatedAt");

CREATE TABLE IF NOT EXISTS "order_stages" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "orderNo" TEXT NOT NULL,
    "stage" "OrderSettlementStage" NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 0,
    "payload" JSONB,
    "response" JSONB,
    "seq" INTEGER NOT NULL,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_stages_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "order_stages_orderId_stage_key"
ON "order_stages"("orderId", "stage");

CREATE INDEX IF NOT EXISTS "order_stages_orderNo_idx"
ON "order_stages"("orderNo");

CREATE INDEX IF NOT EXISTS "order_stages_status_updatedAt_idx"
ON "order_stages"("status", "updatedAt");

CREATE INDEX IF NOT EXISTS "order_stages_orderId_seq_idx"
ON "order_stages"("orderId", "seq");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'order_stages_orderId_fkey'
    ) THEN
        ALTER TABLE "order_stages"
        ADD CONSTRAINT "order_stages_orderId_fkey"
        FOREIGN KEY ("orderId") REFERENCES "orders"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
