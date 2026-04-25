-- CreateTable
CREATE TABLE "razorpay_route_stakeholders" (
    "id" SERIAL NOT NULL,
    "razorpayStakeholderId" TEXT NOT NULL,
    "razorpayAccountId" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "kycPan" TEXT,
    "relationship" JSONB,
    "phone" JSONB,
    "notes" JSONB,
    "kyc" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "razorpay_route_stakeholders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "razorpay_route_stakeholders_razorpayStakeholderId_key" ON "razorpay_route_stakeholders"("razorpayStakeholderId");

-- CreateIndex
CREATE INDEX "razorpay_route_stakeholders_razorpayAccountId_idx" ON "razorpay_route_stakeholders"("razorpayAccountId");

-- CreateIndex
CREATE INDEX "razorpay_route_stakeholders_razorpayStakeholderId_idx" ON "razorpay_route_stakeholders"("razorpayStakeholderId");

