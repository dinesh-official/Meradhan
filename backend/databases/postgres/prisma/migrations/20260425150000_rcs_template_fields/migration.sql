ALTER TABLE "notification_templates"
    ADD COLUMN IF NOT EXISTS "rcsProjectId"  TEXT,
    ADD COLUMN IF NOT EXISTS "rcsNamespace"  TEXT,
    ADD COLUMN IF NOT EXISTS "rcsVariables"  JSONB;
