-- One margin row per sector + rating (including synthetic "without rating" key)
CREATE UNIQUE INDEX IF NOT EXISTS "bond_priced_margin_sector_rating_key"
  ON "bond_priced_margin" ("sectorName", "rating");
