/**
 * Link an RFQ / trade order (NSE `settle_order`) + its accepted settlement
 * numbers onto an order row that ALREADY EXISTS in the `orders` table.
 *
 * Unlike `scripts/asign-order.ts` (which CREATES a brand-new order row from
 * an RFQ), this script UPDATES an existing order — identified by its
 * auto-increment primary key `id` — in place. The primary key stays stable
 * so foreign-key references in `customer_bonds`, `order_logs`, etc. are not
 * touched.
 *
 * What it copies from the RFQ (mirrors `createOrderFromRfq`):
 *   - bond snapshot (bondDetails / isin / bondName / faceValue)
 *   - quantity + unitPrice from the RFQ
 *   - stampDuty / subTotal / totalAmount from the accepted negotiation
 *   - paymentId / paymentOrderId / reqOrderNumber = RFQ trade number
 *   - metadata.dealId / metadata.rfqNumber / metadata.clientOrderSide
 *   - status = SETTLED, paymentStatus = PENDING, paymentProvider = CUSTOM
 *
 * The order's owning customer (`customerProfileId`) is NOT changed — the row
 * is assumed to already belong to the right customer. If it does, the linked
 * `customer_bonds` holding is upserted to match the settled quantity/price.
 *
 * Runs the write in a single Prisma `$transaction`.
 *
 * Run with: `bun run scripts/assign-existing-order.ts`
 * Or with CLI args:
 *   `bun run scripts/assign-existing-order.ts <orderId> <rfqOrderNumber> [--dry-run] [--keep-order-number] [--side=BUY|SELL]`
 *
 * You can also tweak the constants in `main()` below before running.
 */

import "@packages/config/env";

import { db } from "@core/database/database";
import type { Prisma } from "@databases/generated/prisma/postgres";
import { OrderStatus, PaymentStatus } from "@databases/generated/prisma/postgres";
import {
  generateDealId,
  generateOrderId,
} from "@resource/customer/order/order.utils";

type AssignOptions = {
  orderSide?: "BUY" | "SELL";
  /** When false, keep the existing `orderNumber`; only (re)stamp dealId + RFQ metadata. */
  regenerateOrderId: boolean;
  dryRun: boolean;
};

function readDealIdFromMetadata(meta: Prisma.JsonValue | null): string | null {
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) return null;
  const value = (meta as { dealId?: unknown }).dealId;
  return typeof value === "string" ? value : null;
}

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

async function assignExistingOrder(
  orderId: number,
  rfqOrderNumber: string,
  options: AssignOptions,
): Promise<void> {
  // 1. Existing order row (must already exist).
  const order = await db.dataBase.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      orderNumber: true,
      customerProfileId: true,
      isin: true,
      bondName: true,
      quantity: true,
      unitPrice: true,
      totalAmount: true,
      status: true,
      paymentStatus: true,
      paymentId: true,
      paymentOrderId: true,
      reqOrderNumber: true,
      metadata: true,
      createdAt: true,
    },
  });
  if (!order) {
    throw new Error(`Order id=${orderId} not found in the orders table.`);
  }

  // 2. RFQ / trade order (NSE settle_order) to link onto the existing order.
  const rfq = await db.dataBase.settleOrderModel.findFirst({
    where: { orderNumber: { equals: rfqOrderNumber } },
  });
  if (!rfq) {
    throw new Error(`RFQ (settle_order) not found for order number ${rfqOrderNumber}`);
  }

  // 3. Bond snapshot for the RFQ symbol.
  const bondDetails = await db.dataBase.bonds.findFirst({
    where: { isin: rfq.symbol },
  });
  if (!bondDetails) {
    throw new Error(`Bond details not found for symbol ${rfq.symbol}`);
  }

  // 4. Accepted negotiation drives the settlement financials.
  const negotiation = await db.dataBase.rFQNegotiation.findFirst({
    where: { tradeNumber: rfq.orderNumber },
  });
  if (!negotiation) {
    throw new Error(`Negotiation not found for order number ${rfq.orderNumber}`);
  }

  const dealDate =
    rfq.createdAt instanceof Date ? rfq.createdAt : new Date(rfq.createdAt);

  const resolveAction = (): "BUY" | "SELL" | "BOTH" => {
    if (options.orderSide === "BUY" || options.orderSide === "SELL") {
      return options.orderSide;
    }
    if (negotiation.buySell === "B") return "BUY";
    if (negotiation.buySell === "S") return "SELL";
    return "BOTH";
  };
  const action = resolveAction();
  const idAction = action === "BOTH" ? "BUY" : action;

  const issuerName = bondDetails.bondName || bondDetails.instrumentName || "";
  const quantity = Number(rfq.modQuantity) || 0;
  const unitPrice = rfq.price.toNumber();

  // IDs use the EXISTING order id as the sequence so they stay stable.
  const finalOrderNumber = generateOrderId({
    channel: "ASSIST",
    action: idAction,
    date: dealDate,
    orderSequence: order.id,
  });
  const dealId = generateDealId({
    issuerName,
    channel: "ASSIST",
    action: idAction,
    date: dealDate,
    orderSequence: order.id,
  });

  const nextOrderNumber = options.regenerateOrderId
    ? finalOrderNumber
    : order.orderNumber;

  console.log("\n── BEFORE (existing order) ───────────────────");
  console.table([
    {
      id: order.id,
      orderNumber: order.orderNumber,
      customerProfileId: order.customerProfileId ?? "(none)",
      isin: order.isin,
      quantity: order.quantity,
      unitPrice: order.unitPrice?.toString?.() ?? String(order.unitPrice),
      totalAmount: order.totalAmount?.toString?.() ?? String(order.totalAmount),
      status: order.status,
      paymentStatus: order.paymentStatus,
      dealId: readDealIdFromMetadata(order.metadata) ?? "(none)",
    },
  ]);

  console.log("── RFQ / settlement being linked ─────────────");
  console.table([
    {
      rfqOrderNumber: rfq.orderNumber,
      symbol: rfq.symbol,
      bondName: bondDetails.bondName,
      side: action,
      quantity,
      unitPrice,
      accruedInterest: negotiation.acceptedAccruedInterest ?? 0,
      consideration: negotiation.acceptedConsideration ?? 0,
    },
  ]);

  console.log("── AFTER (proposed) ──────────────────────────");
  console.table([
    {
      id: order.id,
      orderNumber: nextOrderNumber,
      customerProfileId: order.customerProfileId ?? "(unchanged/none)",
      isin: bondDetails.isin,
      quantity,
      unitPrice,
      totalAmount: negotiation.acceptedConsideration ?? 0,
      status: OrderStatus.SETTLED,
      paymentStatus: PaymentStatus.COMPLETED,
      dealId,
    },
  ]);

  if (options.dryRun) {
    console.log("\n[DRY RUN] No changes written.");
    return;
  }

  await db.dataBase.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: {
        orderNumber: nextOrderNumber,
        bondDetails: bondDetails as unknown as Prisma.InputJsonValue,
        faceValue: bondDetails.faceValue,
        quantity,
        unitPrice,
        isin: bondDetails.isin,
        bondName: bondDetails.bondName,
        stampDuty: negotiation.acceptedAccruedInterest || 0,
        subTotal: negotiation.acceptedConsideration || 0,
        totalAmount: negotiation.acceptedConsideration || 0,
        paymentId: rfq.orderNumber,
        paymentOrderId: rfq.orderNumber,
        reqOrderNumber: rfq.orderNumber,
        paymentStatus: PaymentStatus.PENDING,
        paymentProvider: "CUSTOM",
        status: OrderStatus.SETTLED,
        metadata: mergeMetadata(order.metadata, {
          dealId,
          rfqNumber: rfq.orderNumber,
          clientOrderSide: idAction,
        }),
      },
    });

    // Keep the customer's bond holding in sync with the settled order.
    // Only when the order actually belongs to one of our customers.
    if (order.customerProfileId != null) {
      await tx.customerBonds.upsert({
        where: { orderId: order.id },
        create: {
          orderId: order.id,
          customerProfileId: order.customerProfileId,
          isin: bondDetails.isin,
          bondName: bondDetails.bondName,
          faceValue: bondDetails.faceValue,
          quantity,
          purchasePrice: unitPrice,
        },
        update: {
          customerProfileId: order.customerProfileId,
          isin: bondDetails.isin,
          bondName: bondDetails.bondName,
          faceValue: bondDetails.faceValue,
          quantity,
          purchasePrice: unitPrice,
        },
      });
    }
  });

  const saved = await db.dataBase.order.findUnique({
    where: { id: order.id },
    select: {
      id: true,
      orderNumber: true,
      customerProfileId: true,
      isin: true,
      bondName: true,
      quantity: true,
      unitPrice: true,
      totalAmount: true,
      status: true,
      paymentStatus: true,
      paymentId: true,
      reqOrderNumber: true,
      metadata: true,
    },
  });

  console.log("\n── Persisted row ─────────────────────────────");
  console.log(saved);
  console.log("\n✅ Order updated (RFQ + settlement linked).");
}

function parseCliArgs(argv: string[]): {
  orderId: number | null;
  rfqOrderNumber: string | null;
  dryRun: boolean;
  keepOrderNumber: boolean;
  side?: "BUY" | "SELL";
} {
  const dryRun = argv.includes("--dry-run");
  const keepOrderNumber = argv.includes("--keep-order-number");
  const sideFlag = argv.find((a) => a.startsWith("--side="));
  const sideRaw = sideFlag?.split("=")[1]?.toUpperCase();
  const side = sideRaw === "BUY" || sideRaw === "SELL" ? sideRaw : undefined;

  const positionals = argv.filter((a) => !a.startsWith("--"));
  const orderId = positionals[0] != null ? Number(positionals[0]) : null;
  const rfqOrderNumber = positionals[1] ?? null;

  if (orderId != null && !Number.isFinite(orderId)) {
    throw new Error(
      "Order id must be numeric. Usage: bun run scripts/assign-existing-order.ts <orderId> <rfqOrderNumber> [--dry-run] [--keep-order-number] [--side=BUY|SELL]",
    );
  }

  return { orderId, rfqOrderNumber, dryRun, keepOrderNumber, side };
}

async function main() {
  // ────────────────────────────────────────────────────────────────────
  // EDIT THESE IF YOU PREFER HARD-CODED VALUES OVER CLI ARGS.
  // (CLI args, when provided, override these.)
  // ────────────────────────────────────────────────────────────────────
  const ORDER_ID = 0; // existing orders.id to update
  const RFQ_ORDER_NUMBER = ""; // NSE settle_order.orderNumber (trade number) to link
  const ORDER_SIDE: "BUY" | "SELL" | undefined = "BUY";
  const REGENERATE_ORDER_ID = true; // false → keep existing orderNumber, only stamp dealId + RFQ metadata
  const DRY_RUN = true; // set to false to actually write
  // ────────────────────────────────────────────────────────────────────

  const cli = parseCliArgs(process.argv.slice(2));
  const hasCliArgs = cli.orderId != null && cli.rfqOrderNumber != null;

  const orderId = hasCliArgs ? (cli.orderId as number) : ORDER_ID;
  const rfqOrderNumber = hasCliArgs
    ? (cli.rfqOrderNumber as string)
    : RFQ_ORDER_NUMBER;
  const orderSide = hasCliArgs ? cli.side : ORDER_SIDE;
  const regenerateOrderId = hasCliArgs
    ? !cli.keepOrderNumber
    : REGENERATE_ORDER_ID;
  const dryRun = hasCliArgs ? cli.dryRun : DRY_RUN;

  if (!orderId || !rfqOrderNumber) {
    throw new Error(
      "Provide an order id and an RFQ order number — either as CLI args or by editing ORDER_ID / RFQ_ORDER_NUMBER at the top of main().",
    );
  }

  await db.dataBase.$connect();
  try {
    await assignExistingOrder(orderId, rfqOrderNumber, {
      orderSide,
      regenerateOrderId,
      dryRun,
    });
  } finally {
    await db.dataBase.$disconnect();
  }
}

main().catch((err) => {
  console.error("❌ Script failed:", err);
  process.exit(1);
});
