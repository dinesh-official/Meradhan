-- CreateTable
CREATE TABLE "bond_priced_list_consolidated" (
    "id" SERIAL NOT NULL,
    "provider" TEXT,
    "dateRaw" TEXT,
    "timeRaw" TEXT,
    "timestamp" TIMESTAMP(3),
    "isin" TEXT NOT NULL,
    "issuerName" TEXT,
    "couponRate" DOUBLE PRECISION,
    "maturityDate" TIMESTAMP(3),
    "yield" DOUBLE PRECISION,
    "currency" TEXT,
    "faceValue" DOUBLE PRECISION,
    "quantity" TEXT,
    "rating" TEXT,
    "ratingAgency" TEXT,
    "price" DOUBLE PRECISION,
    "dirtyPrice" DOUBLE PRECISION,
    "cleanPrice" DOUBLE PRECISION,
    "accruedInterest" DOUBLE PRECISION,
    "taxFree" BOOLEAN,
    "isListed" TEXT,
    "raw" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bond_priced_list_consolidated_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bond_reference_metadata" (
    "id" SERIAL NOT NULL,
    "isin" TEXT NOT NULL,
    "issuerName" TEXT,
    "issueDate" TIMESTAMP(3),
    "maturityDate" TIMESTAMP(3),
    "isPerpetual" BOOLEAN,
    "issueCurrency" TEXT,
    "originalAmountIssued" TEXT,
    "couponType" TEXT,
    "bondType" TEXT,
    "couponRate" DOUBLE PRECISION,
    "interestPaymentFrequency" TEXT,
    "seniority" TEXT,
    "natureOfInstrument" TEXT,
    "callableFlag" TEXT,
    "puttableFlag" TEXT,
    "dayConvention" TEXT,
    "previousCouponDate" TIMESTAMP(3),
    "lastCouponDate" TIMESTAMP(3),
    "nextCouponDate" TIMESTAMP(3),
    "isListed" BOOLEAN,
    "exchangeName" TEXT,
    "exchangeCode" TEXT,
    "bloombergFigi" TEXT,
    "bloombergTicker" TEXT,
    "bloombergSecurityType" TEXT,
    "marketSector" TEXT,
    "faceValue" DOUBLE PRECISION,
    "issuePrice" DOUBLE PRECISION,
    "bondCategory" TEXT,
    "taxable" TEXT,
    "modeOfIssuance" TEXT,
    "yield" DOUBLE PRECISION,
    "lastTradedYield" DOUBLE PRECISION,
    "lastTradedPrice" DOUBLE PRECISION,
    "couponPaymentDates" JSONB,
    "redemptionSchedule" JSONB,
    "raw" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bond_reference_metadata_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bond_priced_list_consolidated_isin_key" ON "bond_priced_list_consolidated"("isin");
CREATE INDEX "bond_priced_list_consolidated_issuerName_idx" ON "bond_priced_list_consolidated"("issuerName");
CREATE INDEX "bond_priced_list_consolidated_timestamp_idx" ON "bond_priced_list_consolidated"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "bond_reference_metadata_isin_key" ON "bond_reference_metadata"("isin");
CREATE INDEX "bond_reference_metadata_issuerName_idx" ON "bond_reference_metadata"("issuerName");
