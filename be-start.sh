#!/bin/sh

echo " => Running Prisma DB Push..."

cd /app/backend/databases/postgres || exit 1

# Capture output
OUTPUT=$(bunx prisma db push 2>&1)

# Print output
echo "$OUTPUT"

# Optional: fail if command failed
if [ $? -ne 0 ]; then
  echo " => Prisma DB Push failed"
  exit 1
fi

cd ../.. || exit 1

# Auto-populate Deridata data for the autofill ISINs (idempotent + non-blocking).
# Skips ISINs already populated, so re-deploys make ~0 API calls. No-op unless
# DERIDATA_ENABLED. Backgrounded so a slow/unavailable Deridata never delays boot.
echo " => Deridata auto-populate (background)..."
bun run deridata:populate &

echo " => Starting application..."
bun start
