-- `pricingDate` maps to PostgreSQL DATE (Prisma `DateTime @db.Date`).
ALTER TABLE "bond_priced_margin" ADD COLUMN IF NOT EXISTS "pricingDate" DATE;

-- If the column already existed as TIMESTAMP (e.g. prior `DateTime` without `@db.Date`), coerce to DATE.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
      AND c.table_name = 'bond_priced_margin'
      AND c.column_name = 'pricingDate'
      AND c.data_type = 'timestamp without time zone'
  ) THEN
    ALTER TABLE "bond_priced_margin"
      ALTER COLUMN "pricingDate" TYPE DATE
      USING ("pricingDate"::date);
  END IF;
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
      AND c.table_name = 'bond_priced_margin'
      AND c.column_name = 'pricingDate'
      AND c.data_type = 'timestamp with time zone'
  ) THEN
    ALTER TABLE "bond_priced_margin"
      ALTER COLUMN "pricingDate" TYPE DATE
      USING (("pricingDate" AT TIME ZONE 'UTC')::date);
  END IF;
END $$;
