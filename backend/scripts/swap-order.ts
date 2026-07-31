/**
 * Swap the user-facing `orderNumber` ("Order ID") and the
 * `metadata.dealId` ("Deal ID") between two orders.
 *
 * Use case: two orders were created with each other's MD-... identifiers
 * (e.g. operator typo or a race during sequencing) and you want to
 * correct the visible IDs without rewriting the auto-increment primary
 * key — primary keys stay stable so foreign-key references in
 * `customer_bonds`, `order_logs`, etc. are not touched.
 *
 * Runs in a single Prisma `$transaction` so a failure mid-swap can't
 * leave the DB with both orders sharing the same `orderNumber` (the
 * column is `@unique`).
 *
 * Run with: `bun run scripts/swap-order.ts`
 * Or with CLI args: `bun run scripts/swap-order.ts <orderIdA> <orderIdB> [--dry-run]`
 *
 * You can also tweak the constants in `main()` below before running.
 */

import "@root/config/env";

import { db } from "@core/database/database";
import type { Prisma } from "@databases/generated/prisma/postgres";

type SwapTarget = {
  /** Auto-increment primary key on `orders`. */
  id: number;
};

type SwappableOrder = {
  id: number;
  orderNumber: string;
  metadata: Prisma.JsonValue | null;
};

function readDealIdFromMetadata(meta: Prisma.JsonValue | null): string | null {
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) return null;
  const value = (meta as { dealId?: unknown }).dealId;
  return typeof value === "string" ? value : null;
}

function withDealId(
  meta: Prisma.JsonValue | null,
  newDealId: string | null,
): Prisma.InputJsonValue {
  const base =
    meta && typeof meta === "object" && !Array.isArray(meta)
      ? { ...(meta as Record<string, unknown>) }
      : {};
  if (newDealId === null) {
    delete base.dealId;
  } else {
    base.dealId = newDealId;
  }
  return base as Prisma.InputJsonValue;
}

async function loadOrder(id: number): Promise<SwappableOrder> {
  const order = await db.dataBase.order.findUnique({
    where: { id },
    select: { id: true, orderNumber: true, metadata: true },
  });
  if (!order) {
    throw new Error(`Order ${id} not found.`);
  }
  return order;
}

async function swapOrders(
  a: SwapTarget,
  b: SwapTarget,
  options: { dryRun: boolean },
): Promise<void> {
  if (a.id === b.id) {
    throw new Error("Cannot swap an order with itself — provide two distinct order ids.");
  }

  const [orderA, orderB] = await Promise.all([
    loadOrder(a.id),
    loadOrder(b.id),
  ]);

  const dealIdA = readDealIdFromMetadata(orderA.metadata);
  const dealIdB = readDealIdFromMetadata(orderB.metadata);

  console.log("\n── BEFORE ────────────────────────────────────");
  console.table([
    { id: orderA.id, orderNumber: orderA.orderNumber, dealId: dealIdA ?? "(none)" },
    { id: orderB.id, orderNumber: orderB.orderNumber, dealId: dealIdB ?? "(none)" },
  ]);

  if (orderA.orderNumber === orderB.orderNumber && dealIdA === dealIdB) {
    console.log("\nOrders already have matching identifiers — nothing to do.");
    return;
  }

  if (options.dryRun) {
    console.log("\n[DRY RUN] Would swap →");
    console.table([
      { id: orderA.id, orderNumber: orderB.orderNumber, dealId: dealIdB ?? "(none)" },
      { id: orderB.id, orderNumber: orderA.orderNumber, dealId: dealIdA ?? "(none)" },
    ]);
    return;
  }

  // `Order.orderNumber` is `@unique` so we cannot directly assign A's
  // number to B while A still holds it — Prisma will P2002. Park A's
  // orderNumber under a temp value first, then write the final values.
  // The whole sequence runs in one transaction so a failure can never
  // leave the DB with two orders sharing the same orderNumber.
  const tempOrderNumber = `__SWAP_TMP_${orderA.id}_${Date.now()}`;

  await db.dataBase.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderA.id },
      data: { orderNumber: tempOrderNumber },
    });
    await tx.order.update({
      where: { id: orderB.id },
      data: {
        orderNumber: orderA.orderNumber,
        metadata: withDealId(orderB.metadata, dealIdA),
      },
    });
    await tx.order.update({
      where: { id: orderA.id },
      data: {
        orderNumber: orderB.orderNumber,
        metadata: withDealId(orderA.metadata, dealIdB),
      },
    });
  });

  const [afterA, afterB] = await Promise.all([
    loadOrder(orderA.id),
    loadOrder(orderB.id),
  ]);

  console.log("\n── AFTER ─────────────────────────────────────");
  console.table([
    {
      id: afterA.id,
      orderNumber: afterA.orderNumber,
      dealId: readDealIdFromMetadata(afterA.metadata) ?? "(none)",
    },
    {
      id: afterB.id,
      orderNumber: afterB.orderNumber,
      dealId: readDealIdFromMetadata(afterB.metadata) ?? "(none)",
    },
  ]);
  console.log("\n✅ Swap complete.");
}

function parseCliArgs(argv: string[]): {
  ids: [number, number] | null;
  dryRun: boolean;
} {
  const dryRun = argv.includes("--dry-run");
  const positionals = argv.filter((a) => !a.startsWith("--"));
  if (positionals.length < 2) {
    return { ids: null, dryRun };
  }
  const a = Number(positionals[0]);
  const b = Number(positionals[1]);
  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    throw new Error(
      "Order ids must be numeric. Usage: bun run scripts/swap-order.ts <orderIdA> <orderIdB> [--dry-run]",
    );
  }
  return { ids: [a, b], dryRun };
}

async function main() {
  // ────────────────────────────────────────────────────────────────────
  // EDIT THESE IF YOU PREFER HARD-CODED IDs OVER CLI ARGS.
  // (CLI args, when provided, override these.)
  // ────────────────────────────────────────────────────────────────────
  const ORDER_ID_A = 87; // e.g. 123
  const ORDER_ID_B = 86; // e.g. 456
  const DRY_RUN = false;
  // ────────────────────────────────────────────────────────────────────

  const cli = parseCliArgs(process.argv.slice(2));
  const ids = cli.ids ?? ([ORDER_ID_A, ORDER_ID_B] as const);
  const dryRun = cli.ids ? cli.dryRun : DRY_RUN;

  if (!ids[0] || !ids[1]) {
    throw new Error(
      "Provide two order ids — either as CLI args or by editing ORDER_ID_A / ORDER_ID_B at the top of main().",
    );
  }

  await db.dataBase.$connect();
  try {
    await swapOrders({ id: ids[0] }, { id: ids[1] }, { dryRun });
  } finally {
    await db.dataBase.$disconnect();
  }
}

main().catch((err) => {
  console.error("❌ Script failed:", err);
  process.exit(1);
});
