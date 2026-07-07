#!/usr/bin/env bun
/**
 * Rename an order's user-facing `orderNumber` (Order ID) and optionally
 * regenerate the paired `metadata.dealId` to match.
 *
 * Use case: correct MD-DIR-... → MD-ASSIST-... typo or channel/date fix
 * without changing the auto-increment primary key (`orders.id`).
 *
 * Also updates `crm_order_receipt_pdf_options.orderNumber` when a row
 * exists keyed by the old MD order number.
 *
 * Usage:
 *   bun run backend/scripts/rename-order-number.ts
 *   bun run backend/scripts/rename-order-number.ts --apply
 *   bun run backend/scripts/rename-order-number.ts \
 *     --from MD-DIR-08062026-BUY-131 --to MD-ASSIST-04062026-BUY-131 --apply
 *   bun run backend/scripts/rename-order-number.ts --apply --no-deal-id
 */
import "@packages/config/env";

import { db } from "@core/database/database";
import type { Prisma } from "@databases/generated/prisma/postgres";
import {
  generateDealId,
  type OrderAction,
  type OrderChannel,
} from "@resource/customer/order/order.utils";

type CliOptions = {
  fromOrderNumber?: string;
  toOrderNumber?: string;
  dryRun: boolean;
  updateDealId: boolean;
};

function readDealIdFromMetadata(meta: Prisma.JsonValue | null): string | null {
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) return null;
  const value = (meta as { dealId?: unknown }).dealId;
  return typeof value === "string" ? value : null;
}

function withDealId(
  meta: Prisma.JsonValue | null,
  dealId: string | null,
): Prisma.InputJsonValue {
  const base =
    meta && typeof meta === "object" && !Array.isArray(meta)
      ? { ...(meta as Record<string, unknown>) }
      : {};
  if (dealId == null) delete base.dealId;
  else base.dealId = dealId;
  return base as Prisma.InputJsonValue;
}

/** Parse MD-{CHANNEL}-{DDMMYYYY}-{BUY|SELL}-{SEQ} */
function parseMdOrderNumber(orderNumber: string): {
  channel: OrderChannel;
  action: OrderAction;
  date: Date;
} | null {
  const m = /^MD-(ASSIST|DIR)-(\d{2})(\d{2})(\d{4})-(BUY|SELL)-\d+$/i.exec(
    orderNumber.trim(),
  );
  if (!m) return null;
  const [, channelRaw, dd, mm, yyyy, actionRaw] = m;
  const day = Number(dd);
  const month = Number(mm) - 1;
  const year = Number(yyyy);
  const date = new Date(Date.UTC(year, month, day));
  if (Number.isNaN(date.getTime())) return null;
  return {
    channel: channelRaw.toUpperCase() as OrderChannel,
    action: actionRaw.toUpperCase() as OrderAction,
    date,
  };
}

function parseCliArgs(argv: string[]): Partial<CliOptions> {
  const opts: Partial<CliOptions> = { updateDealId: true };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--apply") opts.dryRun = false;
    else if (arg === "--dry-run") opts.dryRun = true;
    else if (arg === "--from") opts.fromOrderNumber = String(argv[++i] ?? "").trim();
    else if (arg === "--to") opts.toOrderNumber = String(argv[++i] ?? "").trim();
    else if (arg === "--no-deal-id") opts.updateDealId = false;
  }
  return opts;
}

async function renameOrderNumber(options: {
  fromOrderNumber: string;
  toOrderNumber: string;
  dryRun: boolean;
  updateDealId: boolean;
}): Promise<void> {
  const { fromOrderNumber, toOrderNumber, dryRun, updateDealId } = options;

  if (fromOrderNumber === toOrderNumber) {
    throw new Error("from and to order numbers are identical — nothing to do.");
  }

  const order = await db.dataBase.order.findUnique({
    where: { orderNumber: fromOrderNumber },
    select: {
      id: true,
      orderNumber: true,
      bondName: true,
      metadata: true,
      createdAt: true,
    },
  });
  if (!order) {
    throw new Error(`Order not found with orderNumber="${fromOrderNumber}".`);
  }

  const targetTaken = await db.dataBase.order.findUnique({
    where: { orderNumber: toOrderNumber },
    select: { id: true },
  });
  if (targetTaken && targetTaken.id !== order.id) {
    throw new Error(
      `Target orderNumber "${toOrderNumber}" is already used by order id=${targetTaken.id}.`,
    );
  }

  const oldDealId = readDealIdFromMetadata(order.metadata);
  let newDealId: string | null = oldDealId;

  if (updateDealId) {
    const parsed = parseMdOrderNumber(toOrderNumber);
    if (!parsed) {
      console.warn(
        "⚠️  Could not parse target order number — dealId left unchanged.",
      );
    } else {
      const issuerName = order.bondName?.trim() || "UNKNOWN";
      newDealId = generateDealId({
        issuerName,
        channel: parsed.channel,
        action: parsed.action,
        date: parsed.date,
        orderSequence: order.id,
      });
    }
  }

  const pdfOptions = await db.dataBase.crmOrderReceiptPdfOptions.findUnique({
    where: { orderNumber: fromOrderNumber },
    select: { id: true, orderNumber: true },
  });

  console.log("\n── BEFORE ────────────────────────────────────");
  console.table([
    {
      id: order.id,
      orderNumber: order.orderNumber,
      dealId: oldDealId ?? "(none)",
      pdfOptionsRow: pdfOptions ? "yes" : "no",
    },
  ]);

  console.log("── AFTER (proposed) ──────────────────────────");
  console.table([
    {
      id: order.id,
      orderNumber: toOrderNumber,
      dealId: updateDealId ? (newDealId ?? "(unchanged)") : "(unchanged)",
      pdfOptionsRow: pdfOptions ? toOrderNumber : "no",
    },
  ]);

  if (dryRun) {
    console.log("\n[DRY RUN] No changes written. Re-run with --apply.");
    return;
  }

  const tempOrderNumber = `__RENAME_TMP_${order.id}_${Date.now()}`;

  await db.dataBase.$transaction(async (tx) => {
    // Unique constraint on orderNumber — park current value first.
    await tx.order.update({
      where: { id: order.id },
      data: { orderNumber: tempOrderNumber },
    });

    await tx.order.update({
      where: { id: order.id },
      data: {
        orderNumber: toOrderNumber,
        ...(updateDealId && newDealId
          ? { metadata: withDealId(order.metadata, newDealId) }
          : {}),
      },
    });

    if (pdfOptions) {
      await tx.crmOrderReceiptPdfOptions.update({
        where: { id: pdfOptions.id },
        data: { orderNumber: toOrderNumber },
      });
    }
  });

  const saved = await db.dataBase.order.findUnique({
    where: { id: order.id },
    select: { id: true, orderNumber: true, metadata: true },
  });

  console.log("\n── PERSISTED ─────────────────────────────────");
  console.table([
    {
      id: saved?.id,
      orderNumber: saved?.orderNumber,
      dealId: readDealIdFromMetadata(saved?.metadata ?? null) ?? "(none)",
    },
  ]);
  console.log("\n✅ Order number renamed.");
}

async function main() {
  const FROM_ORDER_NUMBER = "MD-DIR-08062026-BUY-131";
  const TO_ORDER_NUMBER = "MD-ASSIST-04062026-BUY-131";
  const DRY_RUN = true;
  const UPDATE_DEAL_ID = true;

  const cli = parseCliArgs(process.argv.slice(2));
  const fromOrderNumber = cli.fromOrderNumber || FROM_ORDER_NUMBER;
  const toOrderNumber = cli.toOrderNumber || TO_ORDER_NUMBER;
  const dryRun = cli.dryRun ?? DRY_RUN;
  const updateDealId = cli.updateDealId ?? UPDATE_DEAL_ID;

  console.log("Rename order number", {
    from: fromOrderNumber,
    to: toOrderNumber,
    mode: dryRun ? "DRY RUN" : "APPLY",
    updateDealId,
  });

  await renameOrderNumber({
    fromOrderNumber,
    toOrderNumber,
    dryRun,
    updateDealId,
  });
}

main()
  .catch((err) => {
    console.error("❌ Script failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await db.dataBase.$disconnect();
  });
