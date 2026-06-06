import { readFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "@core/database/database";
import logger from "@utils/logger/logger";

/** Split SQL file into executable statements (Prisma runs one at a time). */
function parseSqlStatements(sql: string): string[] {
  const withoutComments = sql.replace(/^--.*$/gm, "");
  return withoutComments
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export async function seedRbac(): Promise<void> {
  const sqlPath = join(import.meta.dir, "rbac.seed.sql");
  const sql = readFileSync(sqlPath, "utf-8");
  const statements = parseSqlStatements(sql);

  const userCount = await db.dataBase.cRMUserDataModel.count();
  if (userCount === 0) {
    throw new Error(
      "No CRM users found — create at least one user before running RBAC seed"
    );
  }

  logger.logInfo(`RBAC seed: executing ${statements.length} SQL statements`);
  await db.dataBase.$transaction(async (tx) => {
    for (const statement of statements) {
      await tx.$executeRawUnsafe(`${statement};`);
    }
  });
  logger.logInfo("RBAC seed completed");
}

if (import.meta.main) {
  seedRbac()
    .then(async () => {
      await db.dataBase.$disconnect();
      process.exit(0);
    })
    .catch(async (err) => {
      logger.logError("RBAC seed failed", err);
      await db.dataBase.$disconnect();
      process.exit(1);
    });
}
