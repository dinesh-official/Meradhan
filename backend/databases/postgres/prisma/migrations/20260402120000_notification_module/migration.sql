-- CreateEnum
CREATE TYPE "NotificationMedium" AS ENUM ('SMS', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "NotificationBatchDeliveryStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'PARTIAL_FAILURE', 'FAILED');

-- CreateEnum
CREATE TYPE "NotificationRecipientDeliveryStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'FAILED', 'INVALID_NUMBER');

-- CreateTable
CREATE TABLE "crm_notification_saved_lists" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdById" INTEGER NOT NULL,
    "sourcePrompt" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crm_notification_saved_lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_notification_saved_list_members" (
    "id" SERIAL NOT NULL,
    "savedListId" INTEGER NOT NULL,
    "customerProfileId" INTEGER NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crm_notification_saved_list_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_logs" (
    "id" SERIAL NOT NULL,
    "savedListId" INTEGER,
    "medium" "NotificationMedium" NOT NULL,
    "dltTemplateId" TEXT NOT NULL,
    "templateVariables" JSONB NOT NULL,
    "messagePreview" TEXT,
    "sentById" INTEGER NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveryStatus" "NotificationBatchDeliveryStatus" NOT NULL,
    "providerBatchId" TEXT,
    "meta" JSONB,

    CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_recipient_logs" (
    "id" SERIAL NOT NULL,
    "notificationLogId" INTEGER NOT NULL,
    "customerProfileId" INTEGER NOT NULL,
    "phone" TEXT NOT NULL,
    "deliveryStatus" "NotificationRecipientDeliveryStatus" NOT NULL,
    "providerMessageId" TEXT,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_recipient_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "crm_notification_saved_lists_createdById_name_key" ON "crm_notification_saved_lists"("createdById", "name");

-- CreateIndex
CREATE UNIQUE INDEX "crm_notification_saved_list_members_savedListId_customerProfileI_key" ON "crm_notification_saved_list_members"("savedListId", "customerProfileId");

-- CreateIndex
CREATE INDEX "crm_notification_saved_list_members_customerProfileId_idx" ON "crm_notification_saved_list_members"("customerProfileId");

-- CreateIndex
CREATE INDEX "notification_logs_sentAt_idx" ON "notification_logs"("sentAt");

-- CreateIndex
CREATE INDEX "notification_recipient_logs_customerProfileId_idx" ON "notification_recipient_logs"("customerProfileId");

-- CreateIndex
CREATE INDEX "notification_recipient_logs_notificationLogId_idx" ON "notification_recipient_logs"("notificationLogId");

-- AddForeignKey
ALTER TABLE "crm_notification_saved_lists" ADD CONSTRAINT "crm_notification_saved_lists_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "crm_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_notification_saved_list_members" ADD CONSTRAINT "crm_notification_saved_list_members_savedListId_fkey" FOREIGN KEY ("savedListId") REFERENCES "crm_notification_saved_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_notification_saved_list_members" ADD CONSTRAINT "crm_notification_saved_list_members_customerProfileId_fkey" FOREIGN KEY ("customerProfileId") REFERENCES "customers_profile_data"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_savedListId_fkey" FOREIGN KEY ("savedListId") REFERENCES "crm_notification_saved_lists"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_sentById_fkey" FOREIGN KEY ("sentById") REFERENCES "crm_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_recipient_logs" ADD CONSTRAINT "notification_recipient_logs_notificationLogId_fkey" FOREIGN KEY ("notificationLogId") REFERENCES "notification_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_recipient_logs" ADD CONSTRAINT "notification_recipient_logs_customerProfileId_fkey" FOREIGN KEY ("customerProfileId") REFERENCES "customers_profile_data"("id") ON DELETE CASCADE ON UPDATE CASCADE;
