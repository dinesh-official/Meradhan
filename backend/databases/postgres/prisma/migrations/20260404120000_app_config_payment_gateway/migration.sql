-- CreateEnum
CREATE TYPE "PaymentGatewayMode" AS ENUM ('PAYMENT', 'INQUIRY');

-- CreateTable
CREATE TABLE "AppConfig" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "paymentGatewayMode" "PaymentGatewayMode" NOT NULL DEFAULT 'INQUIRY',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppConfig_pkey" PRIMARY KEY ("id")
);

INSERT INTO "AppConfig" ("id", "paymentGatewayMode", "updatedAt") VALUES (1, 'INQUIRY', CURRENT_TIMESTAMP);
