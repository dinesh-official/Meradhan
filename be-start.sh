#!/bin/sh

echo "=> Running Prisma DB Push..."

cd /app/backend/databases/postgres || exit 1

# Run Prisma DB Push and automatically accept prompts
OUTPUT=$(bunx prisma db push 2>&1)
STATUS=$?

# Print output
echo "$OUTPUT"

# Exit if Prisma failed
if [ $STATUS -ne 0 ]; then
  echo "=> Prisma DB Push failed"
  exit 1
fi

echo "=> Starting application..."

cd ../.. || exit 1

bun start