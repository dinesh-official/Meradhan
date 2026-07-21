-- AlterEnum: add CLOSED to AccountStatus
ALTER TYPE "AccountStatus" ADD VALUE 'CLOSED';

-- CreateEnum
CREATE TYPE "ServiceRequestType" AS ENUM ('CLOSURE');
CREATE TYPE "ServiceRequestStatus" AS ENUM ('PENDING', 'DONE', 'REJECTED');
CREATE TYPE "ServiceRequestReasonStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterTable: token version for JWT invalidation on closure
ALTER TABLE "customers_auth_data" ADD COLUMN "tokenVersion" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "user_service_request_reason" (
    "id" SERIAL NOT NULL,
    "type" "ServiceRequestType" NOT NULL,
    "text" TEXT NOT NULL,
    "status" "ServiceRequestReasonStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_service_request_reason_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "user_service_request" (
    "id" SERIAL NOT NULL,
    "type" "ServiceRequestType" NOT NULL,
    "reasonRemark" VARCHAR(500),
    "status" "ServiceRequestStatus" NOT NULL DEFAULT 'PENDING',
    "processedAt" TIMESTAMP(3),
    "processedBy" INTEGER,
    "userId" INTEGER NOT NULL,
    "reasonId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_service_request_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "user_service_request_userId_type_status_idx" ON "user_service_request"("userId", "type", "status");

ALTER TABLE "user_service_request" ADD CONSTRAINT "user_service_request_userId_fkey" FOREIGN KEY ("userId") REFERENCES "customers_profile_data"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_service_request" ADD CONSTRAINT "user_service_request_reasonId_fkey" FOREIGN KEY ("reasonId") REFERENCES "user_service_request_reason"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed v1 CLOSURE reasons
INSERT INTO "user_service_request_reason" ("type", "text", "status", "updatedAt") VALUES
  ('CLOSURE', 'No longer interested in investing', 'ACTIVE', CURRENT_TIMESTAMP),
  ('CLOSURE', 'Found a better platform', 'ACTIVE', CURRENT_TIMESTAMP),
  ('CLOSURE', 'Too many/unwanted communications', 'ACTIVE', CURRENT_TIMESTAMP),
  ('CLOSURE', 'Difficulty using the platform', 'ACTIVE', CURRENT_TIMESTAMP),
  ('CLOSURE', 'Other', 'ACTIVE', CURRENT_TIMESTAMP);
