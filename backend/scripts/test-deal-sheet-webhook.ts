#!/usr/bin/env bun
/**
 * Test / replay CBRICS settlement webhook deal-sheet automation.
 *
 * Usage:
 *   bun run backend/scripts/test-deal-sheet-webhook.ts --order-id 38
 *   bun run backend/scripts/test-deal-sheet-webhook.ts --req-order-number 26050600000072
 *   bun run backend/scripts/test-deal-sheet-webhook.ts --order-id 38 --dry-run
 *   bun run backend/scripts/test-deal-sheet-webhook.ts --order-id 38 --send
 *   bun run backend/scripts/test-deal-sheet-webhook.ts --order-id 38 --send --force
 *   bun run backend/scripts/test-deal-sheet-webhook.ts --order-id 38 --send --to you@example.com
 */
import { db } from "../src/core/database/database";
import {
  processCbricsSettlementWebhook,
  resolveOrderForNseSettleKey,
} from "../src/services/notifications/cbrics_settlement_webhook.service";

type CliOptions = {
  orderId?: number;
  reqOrderNumber?: string;
  dryRun: boolean;
  send: boolean;
  force: boolean;
  toEmail?: string;
};

function parseArgs(argv: string[]): CliOptions {
  const opts: CliOptions = { dryRun: true, send: false, force: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--order-id") opts.orderId = Number(argv[++i]);
    else if (arg === "--req-order-number")
      opts.reqOrderNumber = String(argv[++i] ?? "").trim();
    else if (arg === "--dry-run") opts.dryRun = true;
    else if (arg === "--send") {
      opts.send = true;
      opts.dryRun = false;
    } else if (arg === "--force") opts.force = true;
    else if (arg === "--to") opts.toEmail = String(argv[++i] ?? "").trim();
  }
  return opts;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (!opts.orderId && !opts.reqOrderNumber) {
    console.error(
      "Provide --order-id <db id> or --req-order-number <NSE trade number>",
    );
    process.exit(1);
  }

  let nseKey = opts.reqOrderNumber ?? null;
  let order =
    opts.orderId != null
      ? await db.dataBase.order.findUnique({
          where: { id: opts.orderId },
          select: {
            id: true,
            orderNumber: true,
            reqOrderNumber: true,
            status: true,
            metadata: true,
            customerProfileId: true,
          },
        })
      : null;

  if (order && !nseKey) {
    nseKey = order.reqOrderNumber?.trim() || null;
  }

  if (!order && nseKey) {
    order = await resolveOrderForNseSettleKey(nseKey);
  }

  if (!order) {
    console.error("Order not found.");
    process.exit(1);
  }

  if (!nseKey) {
    console.error(
      "Order has no reqOrderNumber — pass --req-order-number explicitly for webhook simulation.",
    );
    process.exit(1);
  }

  console.log("Order:", {
    id: order.id,
    orderNumber: order.orderNumber,
    reqOrderNumber: order.reqOrderNumber,
    status: order.status,
    customerProfileId: order.customerProfileId,
    dealSheetEmailSentAt: (order.metadata as Record<string, unknown> | null)
      ?.dealSheetEmailSentAt,
  });

  const payload = {
    settleOrderList: [
      {
        orderNumber: nseKey,
        settleStatus: 4,
        modSettleDate: new Date()
          .toLocaleDateString("en-GB")
          .replaceAll("/", "-"),
        settlementNo: "TEST-WEBHOOK",
        symbol: "TEST",
      },
    ],
  };

  console.log(
    "\nSimulated CBRICS webhook payload:",
    JSON.stringify(payload, null, 2),
  );
  console.log(
    `\nMode: ${opts.dryRun ? "DRY RUN (no DB/email)" : opts.send ? "SEND" : "RESOLVE ONLY"}`,
  );

  const result = await processCbricsSettlementWebhook(payload, {
    dryRun: opts.dryRun,
    forceDealSheet: opts.force,
    toEmail: opts.toEmail,
  });

  console.log("\nResult:", JSON.stringify(result, null, 2));

  if (result.dealSheetSent) {
    console.log("\nDeal sheet email sent successfully.");
  } else if (result.dealSheetSkippedReason) {
    console.log(`\nDeal sheet not sent: ${result.dealSheetSkippedReason}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await db.dataBase.$disconnect();
  });
