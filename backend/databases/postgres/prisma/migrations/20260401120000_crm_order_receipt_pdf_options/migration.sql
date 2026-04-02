-- CreateTable
CREATE TABLE "crm_order_receipt_pdf_options" (
    "id" SERIAL NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "accruedInterestDays" INTEGER,
    "settlementNumber" TEXT,
    "settlementDateTime" TEXT,
    "lastInterestPaymentDateRaw" TEXT,
    "lastInterestPaymentDate" TEXT,
    "interestPaymentDates" TEXT,
    "nonAmortizedBond" BOOLEAN NOT NULL DEFAULT true,
    "amortizedPrincipalPaymentDates" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crm_order_receipt_pdf_options_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "crm_order_receipt_pdf_options_orderNumber_key" ON "crm_order_receipt_pdf_options"("orderNumber");
