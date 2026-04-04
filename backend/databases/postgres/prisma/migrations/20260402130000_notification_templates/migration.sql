-- CreateTable
CREATE TABLE "notification_templates" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "notification_templates_templateId_key" ON "notification_templates"("templateId");

-- AddForeignKey
ALTER TABLE "notification_templates" ADD CONSTRAINT "notification_templates_createdById_fkey"
    FOREIGN KEY ("createdById") REFERENCES "crm_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
