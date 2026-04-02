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

echo " => Starting application..."

cd ../.. || exit 1
bun start
