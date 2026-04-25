-- Add optional CRM userId to Razorpay Route stakeholders.
ALTER TABLE "razorpay_route_stakeholders"
ADD COLUMN "userId" INTEGER;

CREATE INDEX "razorpay_route_stakeholders_userId_idx"
ON "razorpay_route_stakeholders" ("userId");

