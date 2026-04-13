-- Removed `pricingDate` from `BondPricedListConsolidated` (use `timestamp` / `dateRaw` instead).
ALTER TABLE "bond_priced_list_consolidated" DROP COLUMN IF EXISTS "pricingDate";
