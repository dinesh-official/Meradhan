-- CreateTable
CREATE TABLE "razorpay_route_accounts" (
    "id" SERIAL NOT NULL,
    "razorpayAccountId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "razorpay_route_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "razorpay_route_accounts_razorpayAccountId_key" ON "razorpay_route_accounts"("razorpayAccountId");

-- CreateIndex
CREATE INDEX "razorpay_route_accounts_razorpayAccountId_idx" ON "razorpay_route_accounts"("razorpayAccountId");

