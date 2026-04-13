-- `pricingDate`: PostgreSQL DATE → TIMESTAMPTZ(6) for Excel-style date-only or full datetime (Prisma `@db.Timestamptz(6)`).

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'bond_priced_margin' AND column_name = 'pricingDate'
      AND data_type = 'date'
  ) THEN
    ALTER TABLE "bond_priced_margin"
      ALTER COLUMN "pricingDate" TYPE TIMESTAMPTZ(6)
      USING (
        CASE WHEN "pricingDate" IS NULL THEN NULL
        ELSE (("pricingDate"::text || 'T00:00:00Z')::timestamptz)
        END
      );
  END IF;
END $$;

ALTER TABLE "bond_priced_margin"
  ADD COLUMN IF NOT EXISTS "pricingDate" TIMESTAMPTZ(6);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'bond_priced_list_consolidated' AND column_name = 'pricingDate'
      AND data_type = 'date'
  ) THEN
    ALTER TABLE "bond_priced_list_consolidated"
      ALTER COLUMN "pricingDate" TYPE TIMESTAMPTZ(6)
      USING (
        CASE WHEN "pricingDate" IS NULL THEN NULL
        ELSE (("pricingDate"::text || 'T00:00:00Z')::timestamptz)
        END
      );
  END IF;
END $$;

ALTER TABLE "bond_priced_list_consolidated"
  ADD COLUMN IF NOT EXISTS "pricingDate" TIMESTAMPTZ(6);
