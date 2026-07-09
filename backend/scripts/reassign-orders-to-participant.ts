#!/usr/bin/env bun
/**
 * Reassign existing Meradhan orders from a retail customer to an external
 * NSE RFQ participant (B2B counterparty).
 *
 * Per order (single transaction when --apply):
 *   - orders.customerProfileId → NULL
 *   - orders.linkedRfqParticipantCode → participant code (default EMFL)
 *   - orders.metadata.participantName patched
 *   - settle_order.linkedRfqParticipantCode updated via reqOrderNumber
 *   - customer_bonds row deleted (participant orders are not portfolio holdings)
 *
 * Usage:
 *   bun run backend/scripts/reassign-orders-to-participant.ts
 *   bun run backend/scripts/reassign-orders-to-participant.ts --apply
 *   bun run backend/scripts/reassign-orders-to-participant.ts --code EMFL \
 *     --orders MD-ASSIST-29052026-BUY-130,MD-ASSIST-11062026-BUY-141
 */
import "@packages/config/env";

import { db } from "@core/database/database";
import type { Prisma } from "@databases/generated/prisma/postgres";

type CliOptions = {
  participantCode: string;
  orderNumbers: string[];
  dryRun: boolean;
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

function formatOrderRow(order: OrderSnapshot) {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerProfileId: order.customerProfileId ?? "(none)",
    linkedRfqParticipantCode: order.linkedRfqParticipantCode ?? "(none)",
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
    else if (arg === "--code") opts.participantCode = String(argv[++i] ?? "").trim();
    else if (arg === "--orders") {
      opts.orderNumbers = String(argv[++i] ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }
  return opts;
}

async function validateParticipant(code: string) {
  const participant = await db.dataBase.nseRfqParticipantInfoModel.findUnique({
    where: { code },
    select: { code: true, nameOverride: true },
  });
  if (!participant) {
    throw new Error(
      `RFQ participant "${code}" not found in nse_rfq_participant_info. ` +
        `Add it via CRM → RFQ → NSE → RFQ Participants first.`,
    );
  }
  return participant;
}

async function reassignOrderToParticipant(
  orderNumber: string,
  participantCode: string,
  participantName: string,
  dryRun: boolean,
): Promise<"updated" | "skipped" | "not_found"> {
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

  const alreadyAssigned =
    order.customerProfileId == null &&
    order.linkedRfqParticipantCode === participantCode;

  console.log(`\n── ${orderNumber} ─────────────────────────────────────`);
  console.log("BEFORE:", formatOrderRow(order));

  if (alreadyAssigned) {
    console.log("SKIP: already assigned to this participant.");
    return "skipped";
  }

  if (
    order.linkedRfqParticipantCode &&
    order.linkedRfqParticipantCode !== participantCode
  ) {
    console.warn(
      `⚠️  Overwriting linkedRfqParticipantCode ${order.linkedRfqParticipantCode} → ${participantCode}`,
    );
  }

  if (order.customerProfileId != null) {
    console.log(
      `Will clear customerProfileId=${order.customerProfileId} and delete any customer_bonds row.`,
    );
  }

  const reqKey = order.reqOrderNumber?.trim() || null;
  if (reqKey) {
    console.log(`Will stamp settle_order ${reqKey} with ${participantCode}.`);
  } else {
    console.warn("⚠️  No reqOrderNumber on order — settle_order will not be updated.");
  }

  console.log("AFTER (proposed):", {
    ...formatOrderRow(order),
    customerProfileId: "(none)",
    linkedRfqParticipantCode: participantCode,
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
        linkedRfqParticipantCode: participantCode,
        metadata: mergeMetadata(order.metadata, {
          participantName: participantName,
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
          data: { linkedRfqParticipantCode: participantCode },
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
  console.log("✅ Reassigned.");
  return "updated";
}

async function main() {
  const PARTICIPANT_CODE = "EMFL";
  const ORDER_NUMBERS = [
    "MD-ASSIST-29052026-BUY-130",
    "MD-DIR-08062026-BUY-131",
    "MD-ASSIST-04062026-BUY-131",
    "MD-ASSIST-11062026-BUY-141",
    "MD-ASSIST-16062026-BUY-152",
  ];
  const DRY_RUN = true;

  const cli = parseCliArgs(process.argv.slice(2));
  const participantCode = cli.participantCode || PARTICIPANT_CODE;
  const orderNumbers =
    cli.orderNumbers && cli.orderNumbers.length > 0
      ? cli.orderNumbers
      : ORDER_NUMBERS;
  const dryRun = cli.dryRun ?? DRY_RUN;

  if (!participantCode) {
    throw new Error("Participant code is required (--code EMFL).");
  }
  if (orderNumbers.length === 0) {
    throw new Error("No order numbers provided (--orders or edit ORDER_NUMBERS).");
  }

  console.log("Reassign orders to NSE RFQ participant");
  console.log({
    participantCode,
    orderCount: orderNumbers.length,
    mode: dryRun ? "DRY RUN" : "APPLY",
  });

  const participant = await validateParticipant(participantCode);
  const participantName = participant.nameOverride ?? participant.code;

  const summary = { updated: 0, skipped: 0, notFound: 0 };

  for (const orderNumber of orderNumbers) {
    const result = await reassignOrderToParticipant(
      orderNumber,
      participantCode,
      participantName,
      dryRun,
    );
    if (result === "updated") summary.updated++;
    else if (result === "skipped") summary.skipped++;
    else summary.notFound++;
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
