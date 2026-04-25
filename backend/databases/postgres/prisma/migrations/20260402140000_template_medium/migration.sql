-- Add RCS to NotificationMedium enum
ALTER TYPE "NotificationMedium" ADD VALUE IF NOT EXISTS 'RCS';

-- Drop old unique constraint on templateId alone
ALTER TABLE "notification_templates" DROP CONSTRAINT IF EXISTS "notification_templates_templateId_key";

-- Add medium column (default SMS so existing rows are migrated)
ALTER TABLE "notification_templates"
    ADD COLUMN IF NOT EXISTS "medium" "NotificationMedium" NOT NULL DEFAULT 'SMS';

-- Add new composite unique constraint (templateId + medium)
ALTER TABLE "notification_templates"
    ADD CONSTRAINT "notification_templates_templateId_medium_key"
    UNIQUE ("templateId", "medium");
