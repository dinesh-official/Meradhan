/**
 * Generates backend/src/seeds/rbac.seed.sql from rbac.seed-data.ts.
 * Run: bun run seed:rbac:generate
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  RBAC_BUILTIN_ROLES,
  RBAC_SEED_MODULES,
} from "./rbac.seed-data";

function esc(value: string): string {
  return value.replace(/'/g, "''");
}

function sqlNullable(value: string | undefined): string {
  return value ? `'${esc(value)}'` : "NULL";
}

const UPDATED_BY = `COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
)`;

function buildSql(): string {
  const lines: string[] = [
    "-- RBAC seed data — generated from rbac.seed-data.ts",
    "-- Safe to re-run: uses INSERT ... ON CONFLICT DO UPDATE",
    "-- Requires: rbac tables migrated + at least one crm_users row",
    "",
    "BEGIN;",
    "",
    "-- ─── Roles ───────────────────────────────────────────────────────────────",
  ];

  for (const role of RBAC_BUILTIN_ROLES) {
    const description =
      "description" in role ? role.description : undefined;
    lines.push(`INSERT INTO rbac_roles (key, label, description, "isSuperAdmin", "isSystem", "isActive", "createdAt", "updatedAt")
VALUES (
  '${esc(role.key)}',
  '${esc(role.label)}',
  ${sqlNullable(description)},
  ${role.isSuperAdmin},
  ${role.isSystem},
  true,
  NOW(),
  NOW()
)
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  description = EXCLUDED.description,
  "isSuperAdmin" = EXCLUDED."isSuperAdmin",
  "isSystem" = EXCLUDED."isSystem",
  "isActive" = true,
  "updatedAt" = NOW();`);
    lines.push("");
  }

  lines.push("-- ─── Modules ─────────────────────────────────────────────────────────────");
  for (const mod of RBAC_SEED_MODULES) {
    lines.push(`INSERT INTO rbac_modules (key, label, "isActive", "createdAt")
VALUES ('${esc(mod.key)}', '${esc(mod.label)}', true, NOW())
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isActive" = true;`);
    lines.push("");
  }

  lines.push("-- ─── Actions ─────────────────────────────────────────────────────────────");
  for (const mod of RBAC_SEED_MODULES) {
    for (const action of mod.actions) {
      lines.push(`INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  '${esc(action.key)}',
  '${esc(action.label)}',
  NULL,
  ${action.isGlobal ?? false},
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = '${esc(mod.key)}'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";`);
      lines.push("");
    }
  }

  lines.push("-- ─── Role policies ───────────────────────────────────────────────────────");
  for (const mod of RBAC_SEED_MODULES) {
    for (const action of mod.actions) {
      const grantedKeys = action.defaultRoles.map((k) => `'${esc(k)}'`).join(", ");
      lines.push(`INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN (${grantedKeys}),
  ${UPDATED_BY},
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = '${esc(action.key)}'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";`);
      lines.push("");
    }
  }

  lines.push("COMMIT;");
  return lines.join("\n");
}

const outPath = join(import.meta.dir, "rbac.seed.sql");
writeFileSync(outPath, buildSql(), "utf-8");
console.log(`Wrote ${outPath}`);
