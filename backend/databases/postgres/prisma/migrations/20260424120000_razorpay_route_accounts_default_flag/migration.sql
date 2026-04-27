-- Add "isDefault" flag to Razorpay Route linked accounts.
ALTER TABLE "razorpay_route_accounts"
ADD COLUMN "isDefault" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "razorpay_route_accounts_isDefault_idx"
ON "razorpay_route_accounts" ("isDefault");

