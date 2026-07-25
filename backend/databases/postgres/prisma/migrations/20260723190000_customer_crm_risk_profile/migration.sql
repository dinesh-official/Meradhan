-- CreateEnum
CREATE TYPE "CrmRiskProfile" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- AlterTable
ALTER TABLE "customers_profile_data" ADD COLUMN "crmRiskProfile" "CrmRiskProfile";
