-- CreateTable
CREATE TABLE "crm_inventory_stock_batch" (
    "id" SERIAL NOT NULL,
    "dayKey" VARCHAR(10) NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sourceFileName" TEXT,
    "lineCount" INTEGER NOT NULL DEFAULT 0,
    "uploadedByUserId" INTEGER,
    "uploadedByEmail" TEXT,

    CONSTRAINT "crm_inventory_stock_batch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_inventory_stock_line" (
    "id" SERIAL NOT NULL,
    "batchId" INTEGER NOT NULL,
    "isin" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "crm_inventory_stock_line_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "crm_inventory_stock_batch_dayKey_idx" ON "crm_inventory_stock_batch"("dayKey");

-- CreateIndex
CREATE INDEX "crm_inventory_stock_batch_uploadedAt_idx" ON "crm_inventory_stock_batch"("uploadedAt");

-- CreateIndex
CREATE INDEX "crm_inventory_stock_line_batchId_idx" ON "crm_inventory_stock_line"("batchId");

-- CreateIndex
CREATE INDEX "crm_inventory_stock_line_isin_idx" ON "crm_inventory_stock_line"("isin");

-- AddForeignKey
ALTER TABLE "crm_inventory_stock_line" ADD CONSTRAINT "crm_inventory_stock_line_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "crm_inventory_stock_batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
