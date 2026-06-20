-- CreateTable
CREATE TABLE "bond_documents" (
    "id" SERIAL NOT NULL,
    "isin" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT,
    "createdByCrmUserId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bond_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bond_documents_isin_idx" ON "bond_documents"("isin");

-- CreateIndex
CREATE INDEX "bond_documents_createdAt_idx" ON "bond_documents"("createdAt");

-- AddForeignKey
ALTER TABLE "bond_documents" ADD CONSTRAINT "bond_documents_isin_fkey" FOREIGN KEY ("isin") REFERENCES "bonds"("isin") ON DELETE CASCADE ON UPDATE CASCADE;
