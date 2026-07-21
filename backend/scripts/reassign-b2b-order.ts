#!/usr/bin/env bun
/**
 * Reassign one or more Meradhan B2B orders to a different NSE RFQ participant.
 *
 * Updates per order (single transaction when --apply):
 *   - orders.linkedRfqParticipantCode → target participant code
 *   - orders.metadata.participantName → participant display name
 *   - settle_order.linkedRfqParticipantCode (via reqOrderNumber)
 *   - clears customerProfileId + deletes customer_bonds (B2B counterparty, not retail)
 *
 * Urgent example (MD-ASSIST-20072026-BUY-244 → BONDBAZAAR):
 *   cd backend
 *   bun run scripts/reassign-b2b-order.ts --list-participants
 *   bun run scripts/reassign-b2b-order.ts --dry-run
 *   bun run scripts/reassign-b2b-order.ts --apply
 *
 * Custom:
 *   bun run scripts/reassign-b2b-order.ts --to BONDBAZAAR  --orders MD-ASSIST-20072026-BUY-244 --apply
 */
import "@packages/config/env";

import { db } from "@core/database/database";
import type { Prisma } from "@databases/generated/prisma/postgres";

/** Default urgent reassignment — edit or override via CLI. */
const DEFAULT_ORDER_NUMBERS = ["MD-ASSIST-20072026-BUY-244"];
const DEFAULT_TARGET_CODE = "BONDBAZAAR";
const DEFAULT_EXPECTED_FROM = "BBSPL";

type CliOptions = {
  targetCode: string;
  orderNumbers: string[];
  expectedFrom: string | null;
  dryRun: boolean;
  listParticipants: boolean;
};

type OrderSnapshot = {
  id: number;
  orderNumber: string;
  customerProfileId: number | null;
  linkedRfqParticipantCode: string | null;
  reqOrderNumber: string | null;
  isin: string;
  metadata: Prisma.JsonValue | null;
};

function mergeMetadata(
  meta: Prisma.JsonValue | null,
  patch: Record<string, unknown>,
): Prisma.InputJsonValue {
  const base =
    meta && typeof meta === "object" && !Array.isArray(meta)
      ? { ...(meta as Record<string, unknown>) }
      : {};
  return { ...base, ...patch } as Prisma.InputJsonValue;
}

function participantNameFromMetadata(meta: Prisma.JsonValue | null): string | null {
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) return null;
  const name = (meta as { participantName?: unknown }).participantName;
  return typeof name === "string" && name.trim() ? name.trim() : null;
}

function formatOrderRow(order: OrderSnapshot) {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerProfileId: order.customerProfileId ?? "(none)",
    linkedRfqParticipantCode: order.linkedRfqParticipantCode ?? "(none)",
    participantName: participantNameFromMetadata(order.metadata) ?? "(none)",
    reqOrderNumber: order.reqOrderNumber ?? "(none)",
    isin: order.isin,
  };
}

function parseCliArgs(argv: string[]): Partial<CliOptions> {
  const opts: Partial<CliOptions> = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--apply") opts.dryRun = false;
    else if (arg === "--dry-run") opts.dryRun = true;
    else if (arg === "--list-participants") opts.listParticipants = true;
    else if (arg === "--to" || arg === "--code") {
      opts.targetCode = String(argv[++i] ?? "").trim();
    } else if (arg === "--from" || arg === "--expected-from") {
      opts.expectedFrom = String(argv[++i] ?? "").trim() || null;
    } else if (arg === "--orders") {
      opts.orderNumbers = String(argv[++i] ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }
  return opts;
}

async function listParticipants(filter?: string) {
  const rows = await db.dataBase.nseRfqParticipantInfoModel.findMany({
    select: { code: true, nameOverride: true },
    orderBy: { code: "asc" },
  });
  const filtered = filter
    ? rows.filter(
      (r) =>
        r.code.toUpperCase().includes(filter.toUpperCase()) ||
        (r.nameOverride ?? "").toUpperCase().includes(filter.toUpperCase()),
    )
    : rows;

  console.log(`RFQ participants (${filtered.length}${filter ? ` matching "${filter}"` : ""}):`);
  for (const row of filtered) {
    console.log(`  ${row.code.padEnd(20)} ${row.nameOverride ?? ""}`);
  }
  if (filtered.length === 0) {
    console.log("  (none — add via CRM → RFQ → NSE → RFQ Participants)");
  }
}

async function validateParticipant(code: string) {
  const participant = await db.dataBase.nseRfqParticipantInfoModel.findUnique({
    where: { code },
    select: { code: true, nameOverride: true },
  });
  if (!participant) {
    const hint = code.replace(/[^a-z0-9]/gi, " ").trim();
    const similar = await db.dataBase.nseRfqParticipantInfoModel.findMany({
      where: hint
        ? {
          OR: [
            { code: { contains: hint.split(/\s+/)[0], mode: "insensitive" } },
            { nameOverride: { contains: hint.split(/\s+/)[0], mode: "insensitive" } },
          ],
        }
        : undefined,
      select: { code: true, nameOverride: true },
      take: 10,
    });
    const suggestions =
      similar.length > 0
        ? `\nSimilar participants:\n${similar.map((r) => `  ${r.code} — ${r.nameOverride ?? ""}`).join("\n")}`
        : "";
    throw new Error(
      `RFQ participant "${code}" not found in nse_rfq_participant_info.${suggestions}\n` +
      `Run: bun run scripts/reassign-b2b-order.ts --list-participants`,
    );
  }
  return participant;
}

async function reassignOrder(
  orderNumber: string,
  targetCode: string,
  participantName: string,
  expectedFrom: string | null,
  dryRun: boolean,
): Promise<"updated" | "skipped" | "not_found" | "blocked"> {
  const order = await db.dataBase.order.findUnique({
    where: { orderNumber },
    select: {
      id: true,
      orderNumber: true,
      customerProfileId: true,
      linkedRfqParticipantCode: true,
      reqOrderNumber: true,
      isin: true,
      metadata: true,
    },
  });

  if (!order) {
    console.warn(`⚠️  Order not found: ${orderNumber}`);
    return "not_found";
  }

  console.log(`\n── ${orderNumber} ─────────────────────────────────────`);
  console.log("BEFORE:", formatOrderRow(order));

  if (
    expectedFrom &&
    order.linkedRfqParticipantCode &&
    order.linkedRfqParticipantCode !== expectedFrom
  ) {
    console.warn(
      `⚠️  Expected current participant "${expectedFrom}" but order has "${order.linkedRfqParticipantCode}".`,
    );
    console.warn("    Continuing anyway — use --from only as a sanity check.");
  }

  if (
    order.customerProfileId == null &&
    order.linkedRfqParticipantCode === targetCode
  ) {
    console.log("SKIP: already assigned to target participant.");
    return "skipped";
  }

  if (
    order.linkedRfqParticipantCode &&
    order.linkedRfqParticipantCode !== targetCode
  ) {
    console.log(
      `Will reassign: ${order.linkedRfqParticipantCode} → ${targetCode}`,
    );
  }

  const reqKey = order.reqOrderNumber?.trim() || null;
  if (reqKey) {
    console.log(`Will update settle_order ${reqKey} → ${targetCode}.`);
  } else {
    console.warn("⚠️  No reqOrderNumber — settle_order will not be updated.");
  }

  console.log("AFTER (proposed):", {
    ...formatOrderRow(order),
    customerProfileId: "(none)",
    linkedRfqParticipantCode: targetCode,
    participantName,
  });

  if (dryRun) {
    console.log("[DRY RUN] No changes written.");
    return "skipped";
  }

  await db.dataBase.$transaction(async (tx) => {
    const deletedBonds = await tx.customerBonds.deleteMany({
      where: { orderId: order.id },
    });
    if (deletedBonds.count > 0) {
      console.log(`Deleted ${deletedBonds.count} customer_bonds row(s).`);
    }

    await tx.order.update({
      where: { id: order.id },
      data: {
        customerProfileId: null,
        linkedRfqParticipantCode: targetCode,
        metadata: mergeMetadata(order.metadata, {
          participantName,
        }),
      },
    });

    if (reqKey) {
      const settle = await tx.settleOrderModel.findFirst({
        where: { orderNumber: reqKey },
        select: { id: true, linkedRfqParticipantCode: true },
      });
      if (settle) {
        await tx.settleOrderModel.update({
          where: { id: settle.id },
          data: { linkedRfqParticipantCode: targetCode },
        });
      } else {
        console.warn(`⚠️  settle_order not found for reqOrderNumber=${reqKey}`);
      }
    }
  });

  const saved = await db.dataBase.order.findUnique({
    where: { id: order.id },
    select: {
      id: true,
      orderNumber: true,
      customerProfileId: true,
      linkedRfqParticipantCode: true,
      reqOrderNumber: true,
      isin: true,
      metadata: true,
    },
  });

  console.log("PERSISTED:", formatOrderRow(saved as OrderSnapshot));
  console.log("✅ Reassigned — order receipt can use updated participant.");
  return "updated";
}

async function main() {
  const cli = parseCliArgs(process.argv.slice(2));

  if (cli.listParticipants) {
    await listParticipants();
    return;
  }

  const targetCode = cli.targetCode || DEFAULT_TARGET_CODE;
  const orderNumbers =
    cli.orderNumbers && cli.orderNumbers.length > 0
      ? cli.orderNumbers
      : DEFAULT_ORDER_NUMBERS;
  const expectedFrom = cli.expectedFrom ?? DEFAULT_EXPECTED_FROM;
  const dryRun = cli.dryRun ?? true;

  console.log("Reassign B2B order to NSE RFQ participant");
  console.log({
    targetCode,
    expectedFrom,
    orders: orderNumbers,
    mode: dryRun ? "DRY RUN" : "APPLY",
  });

  const participant = await validateParticipant(targetCode);
  const participantName = participant.nameOverride ?? participant.code;

  const summary = { updated: 0, skipped: 0, notFound: 0, blocked: 0 };

  for (const orderNumber of orderNumbers) {
    const result = await reassignOrder(
      orderNumber,
      targetCode,
      participantName,
      expectedFrom,
      dryRun,
    );
    if (result === "updated") summary.updated++;
    else if (result === "skipped") summary.skipped++;
    else if (result === "not_found") summary.notFound++;
    else summary.blocked++;
  }

  console.log("\n── Summary ───────────────────────────────────");
  console.log(summary);
  if (dryRun) {
    console.log("\nRe-run with --apply to write changes.");
  }
}

main()
  .catch((err) => {
    console.error("❌ Script failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await db.dataBase.$disconnect();
  });
