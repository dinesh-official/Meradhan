-- Create table to store settlement/bank account details for Razorpay Route payouts.
CREATE TABLE "razorpay_route_settlement_accounts" (
  "id" SERIAL NOT NULL,
  "razorpayAccountId" TEXT NOT NULL,
  "accountNumber" TEXT NOT NULL,
  "ifscCode" TEXT NOT NULL,
  "beneficiaryName" TEXT NOT NULL,
  "isDefault" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "razorpay_route_settlement_accounts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "razorpay_route_settlement_accounts_razorpayAccountId_idx"
ON "razorpay_route_settlement_accounts" ("razorpayAccountId");

CREATE INDEX "razorpay_route_settlement_accounts_isDefault_idx"
ON "razorpay_route_settlement_accounts" ("isDefault");

ALTER TABLE "razorpay_route_settlement_accounts"
ADD CONSTRAINT "razorpay_route_settlement_accounts_razorpayAccountId_fkey"
FOREIGN KEY ("razorpayAccountId") REFERENCES "razorpay_route_accounts"("razorpayAccountId")
ON DELETE CASCADE ON UPDATE CASCADE;

