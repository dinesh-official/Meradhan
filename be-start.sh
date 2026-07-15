#!/bin/sh

echo "=> Running Prisma DB Push..."

cd /app/backend/databases/postgres || exit 1

OUTPUT=$(bunx prisma db push 2>&1)
STATUS=$?

echo "$OUTPUT"

if [ $STATUS -ne 0 ]; then
  echo "=> Prisma DB Push failed, continuing startup..."
else
  echo "=> Prisma DB Push completed successfully."
fi

echo "=> Starting application..."

cd ../.. || exit 1

exec bun start