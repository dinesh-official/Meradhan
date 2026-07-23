import { db, disconnectFromDatabases } from "@core/database/database";

/**
 * Replace all CLOSURE reasons in `user_service_request_reason`.
 *
 * - Nulls `reasonId` on existing CLOSURE requests that reference old reasons
 * - Deletes every CLOSURE reason row
 * - Inserts the list below as ACTIVE (order preserved)
 *
 * Usage:
 *   bun run scripts/seed-closure-reasons.ts
 *   bun run scripts/seed-closure-reasons.ts --dry-run
 */

const CLOSURE_REASONS = [
  "I no longer want to invest in bonds",
  "Website is slow or not working properly",
  "I didn't find enough bond options",
  "I expected more features or tools",
  "I found a better platform",
  "Customer support was unhelpful",
  "I don't trust this platform",
  "Website is not user friendly",
  "I faced issues during KYC or transactions",
  "I created this account by mistake",
  "Other",
] as const;

const dryRun = process.argv.includes("--dry-run");

async function main() {
  console.log(
    dryRun
      ? "Dry run — no rows will be written.\n"
      : "Replacing all CLOSURE reasons…\n",
  );

  const existing = await db.dataBase.userServiceRequestReasonModel.findMany({
    where: { type: "CLOSURE" },
    select: { id: true, text: true, status: true },
    orderBy: { id: "asc" },
  });

  console.log(`Existing CLOSURE reasons (${existing.length}):`);
  for (const row of existing) {
    console.log(`  [#${row.id}] ${row.text} (${row.status})`);
  }

  if (dryRun) {
    console.log(`\nWould delete ${existing.length} reason(s) and create:`);
    for (const text of CLOSURE_REASONS) {
      console.log(`  ${text}`);
    }
    return;
  }

  const existingIds = existing.map((r) => r.id);

  if (existingIds.length > 0) {
    const cleared = await db.dataBase.userServiceRequestModel.updateMany({
      where: { type: "CLOSURE", reasonId: { in: existingIds } },
      data: { reasonId: null },
    });
    console.log(
      `\nCleared reasonId on ${cleared.count} existing CLOSURE request(s).`,
    );

    const deleted = await db.dataBase.userServiceRequestReasonModel.deleteMany({
      where: { type: "CLOSURE", id: { in: existingIds } },
    });
    console.log(`Deleted ${deleted.count} old CLOSURE reason(s).`);
  }

  console.log("\nCreating new reasons:");
  for (const text of CLOSURE_REASONS) {
    const row = await db.dataBase.userServiceRequestReasonModel.create({
      data: {
        type: "CLOSURE",
        text,
        status: "ACTIVE",
      },
      select: { id: true },
    });
    console.log(`  create [#${row.id}] ${text}`);
  }

  console.log(`\nDone. created=${CLOSURE_REASONS.length}`);
}

main()
  .catch((error) => {
    console.error("Failed to seed closure reasons:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectFromDatabases();
  });
