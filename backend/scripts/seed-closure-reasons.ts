import { db, disconnectFromDatabases } from "@core/database/database";

/**
 * Seed (or top-up) account-closure reasons in `user_service_request_reason`.
 *
 * Idempotent: skips any reason whose `type` + `text` already exists.
 *
 * Usage:
 *   bun run scripts/seed-closure-reasons.ts
 *   bun run scripts/seed-closure-reasons.ts --dry-run
 *
 * Edit `CLOSURE_REASONS` below to add more options.
 */

const CLOSURE_REASONS = [
  "No longer interested in investing",
  "Found a better platform",
  "Too many/unwanted communications",
  "Difficulty using the platform",
  "Other",
  // Add custom reasons below:
  // "Account opened by mistake",
  // "Regulatory / compliance reasons",
] as const;

const dryRun = process.argv.includes("--dry-run");

async function main() {
  console.log(
    dryRun
      ? "Dry run — no rows will be written.\n"
      : "Seeding CLOSURE reasons…\n",
  );

  let created = 0;
  let skipped = 0;

  for (const text of CLOSURE_REASONS) {
    const existing = await db.dataBase.userServiceRequestReasonModel.findFirst({
      where: { type: "CLOSURE", text },
      select: { id: true, status: true },
    });

    if (existing) {
      skipped += 1;
      console.log(`  skip  [#${existing.id}] ${text} (${existing.status})`);
      continue;
    }

    if (dryRun) {
      created += 1;
      console.log(`  would create  ${text}`);
      continue;
    }

    const row = await db.dataBase.userServiceRequestReasonModel.create({
      data: {
        type: "CLOSURE",
        text,
        status: "ACTIVE",
      },
      select: { id: true },
    });

    created += 1;
    console.log(`  create [#${row.id}] ${text}`);
  }

  console.log(`\nDone. created=${created} skipped=${skipped}`);
}

main()
  .catch((error) => {
    console.error("Failed to seed closure reasons:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectFromDatabases();
  });
