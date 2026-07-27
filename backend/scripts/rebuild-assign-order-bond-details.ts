#!/usr/bin/env bun
/**
 * Rebuild `orders.bondDetails` for manual CRM assign orders so they match the
 * Razorpay checkout snapshot shape:
 *
 *   bondDetails = { ...bondsTableRow, pricing: { ...checkoutSnapshot } }
 *
 * Existing assign flows (`createOrderFromRfq`, `assign-existing-order.ts`) store
 * only the raw `bonds` row — no nested `pricing`. Downstream PDF / settlement
 * code expects `bondDetails.pricing` (dealDate, settlementDate, cleanPrice, etc.).
 *
 * This script derives `pricing` from saved NSE data:
 *   - `settle_order` (trade / settlement numbers)
 *   - `rfq_negotiable` (accepted price, AI, consideration, settlement date)
 *   - `rfq_master_isin` (saved RFQ response: date, quoteTime, settlementDate)
 *
 * The bond master snapshot is refreshed from the `bonds` table (fallback: existing
 * `bondDetails` top-level without `pricing`).
 *
 * Usage:
 *   cd backend
 *   bun run scripts/rebuild-assign-order-bond-details.ts --dry-run
 *   bun run scripts/rebuild-assign-order-bond-details.ts --order-id 88 --apply
 *   bun run scripts/rebuild-assign-order-bond-details.ts --order-number MD-ASSIST-12062026-BUY-088 --apply
 *   bun run scripts/rebuild-assign-order-bond-details.ts --all-missing --limit 20 --apply
 *   bun run scripts/rebuild-assign-order-bond-details.ts --all-missing --sync-order-columns --apply
 */
import "@root/config/env";

import { db } from "@core/database/database";
import type { Prisma } from "@databases/generated/prisma/postgres";
import {
  accruedInterest,
  resolveCouponDatesForSettlement,
  settlementDateFromYmd,
} from "@services/order/order-pricing-helper";
import {
  calculatePrincipalAmount,
  calculateTotalConsideration,
  truncateDecimals,
} from "@utils/truncateDecimals";

type CliOptions = {
  dryRun: boolean;
  apply: boolean;
  allMissing: boolean;
  force: boolean;
  syncOrderColumns: boolean;
  orderId: number | null;
  orderNumber: string | null;
  limit: number;
};

type OrderRow = {
  id: number;
  orderNumber: string;
  isin: string;
  bondName: string;
  quantity: number;
  unitPrice: Prisma.Decimal;
  subTotal: Prisma.Decimal;
  stampDuty: Prisma.Decimal;
  totalAmount: Prisma.Decimal;
  faceValue: Prisma.Decimal;
  paymentProvider: string | null;
  paymentId: string | null;
  reqOrderNumber: string | null;
  metadata: Prisma.JsonValue | null;
  bondDetails: Prisma.JsonValue | null;
};

type AssignDates = {
  dealDateYmd: string;
  settlementDateYmd: string;
  dealDateRaw: string | null;
  settlementDateRaw: string | null;
  settlementType: number | null;
};

type PricingSnapshot = Record<string, unknown>;

const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

function parseCliArgs(argv: string[]): CliOptions {
  const dryRun = argv.includes("--dry-run");
  const apply = argv.includes("--apply");
  const allMissing = argv.includes("--all-missing");
  const force = argv.includes("--force");
  const syncOrderColumns = argv.includes("--sync-order-columns");

  const orderIdFlag = argv.find((a) => a.startsWith("--order-id="));
  const orderNumberFlag = argv.find((a) => a.startsWith("--order-number="));
  const limitFlag = argv.find((a) => a.startsWith("--limit="));

  const positional = argv.filter((a) => !a.startsWith("--"));
  const orderIdFromPos = positional[0] != null && /^\d+$/.test(positional[0])
    ? Number(positional[0])
    : null;

  const orderId = orderIdFlag
    ? Number(orderIdFlag.split("=")[1])
    : orderIdFromPos;
  const orderNumber = orderNumberFlag?.split("=")[1]?.trim() || null;
  const limit = limitFlag ? Math.max(1, Number(limitFlag.split("=")[1])) : 50;

  if (orderId != null && !Number.isFinite(orderId)) {
    throw new Error("--order-id must be numeric");
  }

  return {
    dryRun: apply ? false : dryRun || !apply,
    apply,
    allMissing,
    force,
    syncOrderColumns,
    orderId: orderId ?? null,
    orderNumber,
    limit,
  };
}

function serializeJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function readMetadataString(
  meta: Prisma.JsonValue | null,
  key: string,
): string | null {
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) return null;
  const v = (meta as Record<string, unknown>)[key];
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function toYyyyMmDd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseLooseDate(input: string): Date | null {
  const s = String(input ?? "").trim();
  if (!s) return null;

  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (iso) {
    const dt = new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]), 12, 0, 0, 0);
    return Number.isNaN(dt.getTime()) ? null : dt;
  }

  const ddMmmYyyy = /^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/.exec(s);
  if (ddMmmYyyy) {
    const MONTH: Record<string, number> = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
    };
    const month = MONTH[(ddMmmYyyy[2] ?? "").slice(0, 3).toLowerCase()];
    if (month !== undefined) {
      const dt = new Date(Number(ddMmmYyyy[3]), month, Number(ddMmmYyyy[1]), 12, 0, 0, 0);
      return Number.isNaN(dt.getTime()) ? null : dt;
    }
  }

  const dt = new Date(s);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function toBusinessYmd(input: string | null | undefined): string | null {
  if (!input) return null;
  const parsed = parseLooseDate(input);
  return parsed ? toYyyyMmDd(parsed) : null;
}

function parseRfqMasterDateTime(
  datePart: string | null | undefined,
  quoteTimePart: string | null | undefined,
  fallback: Date,
): Date {
  const rawDate = datePart?.trim();
  if (!rawDate) return fallback;

  const timeRaw = quoteTimePart?.trim();
  let time = "12:00:00";
  if (timeRaw) {
    const parts = timeRaw.split(":");
    time = parts.length === 2 ? `${timeRaw}:00` : timeRaw;
  }

  const ddMmmYyyy = /^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/.exec(rawDate);
  if (ddMmmYyyy) {
    const MONTH: Record<string, number> = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
    };
    const month = MONTH[(ddMmmYyyy[2] ?? "").slice(0, 3).toLowerCase()];
    const tm = /^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/.exec(time);
    const hh = tm ? Number(tm[1]) : 12;
    const mm = tm ? Number(tm[2]) : 0;
    const ss = tm && tm[3] !== undefined ? Number(tm[3]) : 0;
    if (month !== undefined) {
      const out = new Date(Number(ddMmmYyyy[3]), month, Number(ddMmmYyyy[1]), hh, mm, ss);
      if (!Number.isNaN(out.getTime())) return out;
    }
  }

  const parsed = new Date(`${rawDate} ${time}`.trim());
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

function dayNameForYmd(ymd: string): string {
  const dt = parseLooseDate(ymd);
  return dt ? WEEKDAY_NAMES[dt.getDay()] : "";
}

function pricingYmd(value: string | Date | null | undefined): string {
  if (value == null) return "";
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return toYyyyMmDd(value);
  }
  const fromBiz = toBusinessYmd(String(value));
  if (fromBiz) return fromBiz;
  const isoPrefix = String(value).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(isoPrefix) ? isoPrefix : "";
}

function settlementOrderFromType(type: number | null | undefined): "T+0" | "T+1" {
  return type === 0 ? "T+0" : "T+1";
}

function hasCheckoutPricingSnapshot(bondDetails: unknown): boolean {
  if (!bondDetails || typeof bondDetails !== "object" || Array.isArray(bondDetails)) {
    return false;
  }
  const pricing = (bondDetails as Record<string, unknown>).pricing;
  if (!pricing || typeof pricing !== "object" || Array.isArray(pricing)) {
    return false;
  }
  const p = pricing as Record<string, unknown>;
  return Boolean(pricingYmd(String(p.dealDate ?? "")) && pricingYmd(String(p.settlementDate ?? "")));
}

function resolveTradeNumber(order: OrderRow): string | null {
  const candidates = [
    order.paymentId,
    order.reqOrderNumber,
  ]
    .map((v) => (typeof v === "string" ? v.trim() : ""))
    .filter(Boolean);

  for (const c of candidates) {
    if (/^\d{12,}$/.test(c)) return c;
  }
  return candidates[0] ?? null;
}

async function resolveAssignDates(input: {
  settleCreatedAt: Date;
  modSettleDate?: string | null;
  negotiation: {
    rfqNumber: string;
    acceptedSettlementDate?: string | null;
    acceptedSettlementType?: number | null;
  } | null;
  metadata: Prisma.JsonValue | null;
}): Promise<AssignDates> {
  const fallbackDealDate = input.settleCreatedAt;

  const rfqMaster = input.negotiation
    ? await db.dataBase.rFQMasterISIN.findFirst({
        where: { number: input.negotiation.rfqNumber },
        select: {
          date: true,
          quoteTime: true,
          settlementDate: true,
          settlementType: true,
        },
      })
    : null;

  const dealDateRaw =
    rfqMaster?.date?.trim() ||
    readMetadataString(input.metadata, "dealDate") ||
    null;

  const settlementDateRaw =
    rfqMaster?.settlementDate?.trim() ||
    input.negotiation?.acceptedSettlementDate?.trim() ||
    input.modSettleDate?.trim() ||
    readMetadataString(input.metadata, "settlementDate") ||
    null;

  const settlementType =
    input.negotiation?.acceptedSettlementType ??
    rfqMaster?.settlementType ??
    null;

  const dealDate = parseRfqMasterDateTime(
    dealDateRaw,
    rfqMaster?.quoteTime,
    fallbackDealDate,
  );
  const settlementDate = settlementDateRaw
    ? parseRfqMasterDateTime(settlementDateRaw, undefined, fallbackDealDate)
    : fallbackDealDate;

  return {
    dealDateYmd: toYyyyMmDd(dealDate),
    settlementDateYmd: toYyyyMmDd(settlementDate),
    dealDateRaw,
    settlementDateRaw,
    settlementType,
  };
}

function numFromDecimal(value: unknown): number | null {
  if (value == null) return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "object" && value !== null && "toNumber" in value) {
    const n = (value as { toNumber: () => number }).toNumber();
    return Number.isFinite(n) ? n : null;
  }
  const n = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : null;
}

async function buildPricingSnapshot(input: {
  order: OrderRow;
  isin: string;
  bond: {
    faceValue: number;
    couponRate: number;
    yield: number | null;
    recordDays: number | null;
    recordDateIst?: Date | null;
    lastCouponDateIst?: Date | null;
    nextCouponDateIst?: Date | null;
  };
  settle: {
    price: Prisma.Decimal;
    yield: Prisma.Decimal;
    modQuantity: Prisma.Decimal | null;
    modAccrInt: Prisma.Decimal | null;
    modConsideration: Prisma.Decimal | null;
    modSettleDate: string | null;
    stampDutyAmount: Prisma.Decimal | null;
    createdAt: Date;
  } | null;
  negotiation: {
    rfqNumber: string;
    acceptedPrice: number | null;
    acceptedQuantity: number | null;
    acceptedYield: number | null;
    acceptedAccruedInterest: number | null;
    acceptedConsideration: number | null;
    acceptedSettlementDate: string | null;
    acceptedSettlementType: number | null;
  } | null;
  dates: AssignDates;
}): Promise<PricingSnapshot> {
  const quantity =
    numFromDecimal(input.settle?.modQuantity) ??
    input.negotiation?.acceptedQuantity ??
    input.order.quantity;

  const cleanPrice =
    numFromDecimal(input.settle?.price) ??
    input.negotiation?.acceptedPrice ??
    numFromDecimal(input.order.unitPrice) ??
    0;

  const faceValue = input.bond.faceValue;
  const couponRate = input.bond.couponRate;

  const accruedFromNse =
    input.negotiation?.acceptedAccruedInterest ??
    numFromDecimal(input.settle?.modAccrInt);

  const principalAmountRaw = calculatePrincipalAmount(cleanPrice, faceValue, quantity);
  const principalAmount = Number(truncateDecimals(principalAmountRaw, 2));

  let accruedInterestAmount =
    accruedFromNse != null && Number.isFinite(accruedFromNse)
      ? Number(truncateDecimals(accruedFromNse, 2))
      : null;

  const stampDuty =
    numFromDecimal(input.settle?.stampDutyAmount) ??
    numFromDecimal(input.order.stampDuty) ??
    0;

  const considerationFromNse =
    input.negotiation?.acceptedConsideration ??
    numFromDecimal(input.settle?.modConsideration) ??
    numFromDecimal(input.order.totalAmount);

  let totalConsideration =
    considerationFromNse != null
      ? Number(truncateDecimals(Math.max(0, considerationFromNse - stampDuty), 2))
      : calculateTotalConsideration(principalAmount, accruedInterestAmount ?? 0);

  if (accruedInterestAmount == null && considerationFromNse != null) {
    accruedInterestAmount = Number(
      truncateDecimals(Math.max(0, totalConsideration - principalAmount), 2),
    );
  }
  if (accruedInterestAmount == null) {
    accruedInterestAmount = 0;
  }

  if (considerationFromNse == null) {
    totalConsideration = calculateTotalConsideration(principalAmount, accruedInterestAmount);
  }

  const settlementAmount =
    considerationFromNse != null
      ? Number(truncateDecimals(considerationFromNse, 2))
      : Number(truncateDecimals(totalConsideration + stampDuty, 2));

  const settlementDt = settlementDateFromYmd(input.dates.settlementDateYmd);
  const couponDates = await resolveCouponDatesForSettlement(
    input.isin,
    settlementDt,
    input.bond,
  );

  const recordDays = couponDates.recordDays ?? input.bond.recordDays ?? 15;
  const lastCouponDate = pricingYmd(couponDates.lastCouponDate);
  const nextCouponDate = pricingYmd(couponDates.nextCouponDate);

  const recordDateFromBond =
    input.bond.recordDateIst instanceof Date && !Number.isNaN(input.bond.recordDateIst.getTime())
      ? pricingYmd(input.bond.recordDateIst)
      : "";

  const accruedMeta = accruedInterest({
    faceValue,
    quantity,
    couponRate,
    lastCouponDate: settlementDateFromYmd(lastCouponDate || input.dates.settlementDateYmd),
    nextCouponDate: settlementDateFromYmd(nextCouponDate || input.dates.settlementDateYmd),
    settlementDate: settlementDt,
    recordDays,
    recordDateOverride:
      input.bond.recordDateIst instanceof Date && !Number.isNaN(input.bond.recordDateIst.getTime())
        ? input.bond.recordDateIst
        : undefined,
  });

  const dealOrder = settlementOrderFromType(input.dates.settlementType);
  const settlementOrder =
    input.dates.dealDateYmd === input.dates.settlementDateYmd ? "T+0" : "T+1";

  const offeredYield =
    input.negotiation?.acceptedYield ??
    numFromDecimal(input.settle?.yield) ??
    input.bond.yield ??
    undefined;

  const accruedInterestPerUnit =
    faceValue > 0 && quantity > 0
      ? Number(truncateDecimals((accruedInterestAmount * 100) / (faceValue * quantity), 4))
      : 0;

  return {
    isin: input.isin,
    quantity,
    faceValue,
    cleanPrice,
    couponRate,
    yield: offeredYield,
    dealDate: input.dates.dealDateYmd,
    dealDay: dayNameForYmd(input.dates.dealDateYmd),
    dealOrder,
    allowTrade: false,
    settlementDate: input.dates.settlementDateYmd,
    settlementDay: dayNameForYmd(input.dates.settlementDateYmd),
    settlementOrder,
    allowSettlement: dealOrder === "T+0" ? ["T+0", "T+1"] : ["T+1"],
    lastCouponDate,
    nextCouponDate,
    recordDate: recordDateFromBond || pricingYmd(accruedMeta.recordDate),
    recordDays,
    noOfAccrualDays: accruedMeta.noOfAccrualDays,
    isUnderShutPeriod: accruedMeta.isUnderShutPeriod,
    accruedInterest: accruedInterestAmount,
    accruedInterestPerUnit,
    principalAmount,
    principalAmountRaw,
    totalConsideration,
    stampDuty,
    settlementAmount,
  };
}

function stripPricingFromBondDetails(bondDetails: unknown): Record<string, unknown> {
  if (!bondDetails || typeof bondDetails !== "object" || Array.isArray(bondDetails)) {
    return {};
  }
  const { pricing: _omit, ...rest } = bondDetails as Record<string, unknown>;
  return rest;
}

async function rebuildBondDetailsForOrder(
  order: OrderRow,
  options: { force: boolean },
): Promise<{
  ok: true;
  bondDetails: Prisma.InputJsonValue;
  pricing: PricingSnapshot;
  orderPatch?: {
    quantity: number;
    unitPrice: number;
    subTotal: number;
    stampDuty: number;
    totalAmount: number;
    faceValue: number;
    isin: string;
    bondName: string;
  };
} | { ok: false; reason: string }> {
  if (!options.force && hasCheckoutPricingSnapshot(order.bondDetails)) {
    return { ok: false, reason: "already has bondDetails.pricing" };
  }

  const tradeNumber = resolveTradeNumber(order);
  if (!tradeNumber) {
    return { ok: false, reason: "no trade number on order (paymentId / reqOrderNumber)" };
  }

  const settle = await db.dataBase.settleOrderModel.findFirst({
    where: { orderNumber: tradeNumber },
  });
  if (!settle) {
    return { ok: false, reason: `settle_order not found for trade ${tradeNumber}` };
  }

  const negotiation = await db.dataBase.rFQNegotiation.findFirst({
    where: { tradeNumber: settle.orderNumber },
  });
  if (!negotiation) {
    return { ok: false, reason: `rfq_negotiable not found for trade ${tradeNumber}` };
  }

  const isin = settle.symbol?.trim() || order.isin;
  const bond = await db.dataBase.bonds.findFirst({ where: { isin } });
  if (!bond) {
    return { ok: false, reason: `bonds row not found for ISIN ${isin}` };
  }

  const dates = await resolveAssignDates({
    settleCreatedAt: settle.createdAt,
    modSettleDate: settle.modSettleDate,
    negotiation: {
      rfqNumber: negotiation.rfqNumber,
      acceptedSettlementDate: negotiation.acceptedSettlementDate,
      acceptedSettlementType: negotiation.acceptedSettlementType,
    },
    metadata: order.metadata,
  });

  const pricing = await buildPricingSnapshot({
    order,
    isin,
    bond: {
      faceValue: Number(bond.faceValue),
      couponRate: Number(bond.couponRate),
      yield: bond.yield != null ? Number(bond.yield) : null,
      recordDays: bond.recordDays,
      recordDateIst: bond.recordDateIst,
      lastCouponDateIst: bond.lastCouponDateIst,
      nextCouponDateIst: bond.nextCouponDateIst,
    },
    settle: {
      price: settle.price,
      yield: settle.yield,
      modQuantity: settle.modQuantity,
      modAccrInt: settle.modAccrInt,
      modConsideration: settle.modConsideration,
      modSettleDate: settle.modSettleDate,
      stampDutyAmount: settle.stampDutyAmount,
      createdAt: settle.createdAt,
    },
    negotiation: {
      rfqNumber: negotiation.rfqNumber,
      acceptedPrice: negotiation.acceptedPrice,
      acceptedQuantity: negotiation.acceptedQuantity,
      acceptedYield: negotiation.acceptedYield,
      acceptedAccruedInterest: negotiation.acceptedAccruedInterest,
      acceptedConsideration: negotiation.acceptedConsideration,
      acceptedSettlementDate: negotiation.acceptedSettlementDate,
      acceptedSettlementType: negotiation.acceptedSettlementType,
    },
    dates,
  });

  const bondMaster = serializeJson(bond);
  const existingTop = stripPricingFromBondDetails(order.bondDetails);
  const bondDetails = {
    ...existingTop,
    ...bondMaster,
    pricing,
  } as Prisma.InputJsonValue;

  const quantity = Number(pricing.quantity);
  const unitPrice = Number(pricing.cleanPrice);
  const subTotal = Number(pricing.principalAmount);
  const stampDutyVal = Number(pricing.stampDuty);
  const totalAmount = Number(pricing.settlementAmount);

  return {
    ok: true,
    bondDetails,
    pricing,
    orderPatch: {
      quantity,
      unitPrice,
      subTotal,
      stampDuty: stampDutyVal,
      totalAmount,
      faceValue: Number(bond.faceValue),
      isin: bond.isin,
      bondName: bond.bondName,
    },
  };
}

async function loadTargetOrders(opts: CliOptions): Promise<OrderRow[]> {
  if (opts.orderId != null) {
    const row = await db.dataBase.order.findUnique({
      where: { id: opts.orderId },
      select: orderSelect,
    });
    return row ? [row] : [];
  }

  if (opts.orderNumber) {
    const row = await db.dataBase.order.findUnique({
      where: { orderNumber: opts.orderNumber },
      select: orderSelect,
    });
    return row ? [row] : [];
  }

  const rows = await db.dataBase.order.findMany({
    where: {
      OR: [
        { paymentProvider: "CUSTOM" },
        { orderNumber: { startsWith: "MD-ASSIST-" } },
      ],
    },
    orderBy: { id: "desc" },
    take: opts.limit * 3,
    select: orderSelect,
  });

  return rows
    .filter((r) => opts.force || !hasCheckoutPricingSnapshot(r.bondDetails))
    .slice(0, opts.limit);
}

const orderSelect = {
  id: true,
  orderNumber: true,
  isin: true,
  bondName: true,
  quantity: true,
  unitPrice: true,
  subTotal: true,
  stampDuty: true,
  totalAmount: true,
  faceValue: true,
  paymentProvider: true,
  paymentId: true,
  reqOrderNumber: true,
  metadata: true,
  bondDetails: true,
} satisfies Prisma.OrderSelect;

async function main() {
  const opts = parseCliArgs(process.argv.slice(2));
  console.log("Options:", opts);

  if (opts.orderId == null && !opts.orderNumber && !opts.allMissing) {
    throw new Error(
      "Provide --order-id=<id>, --order-number=<num>, or --all-missing. Use --dry-run first.",
    );
  }

  await db.dataBase.$connect();
  try {
    const orders = await loadTargetOrders(opts);
    if (orders.length === 0) {
      console.log("No matching orders found.");
      return;
    }

    console.log(`Processing ${orders.length} order(s)…\n`);

    let updated = 0;
    let skipped = 0;
    let failed = 0;

    for (const order of orders) {
      console.log(`── ${order.id} ${order.orderNumber} ──`);
      try {
        const result = await rebuildBondDetailsForOrder(order, { force: opts.force });
        if (!result.ok) {
          console.log(`  SKIP: ${result.reason}`);
          skipped += 1;
          continue;
        }

        console.log("  pricing snapshot:", {
          dealDate: result.pricing.dealDate,
          settlementDate: result.pricing.settlementDate,
          quantity: result.pricing.quantity,
          cleanPrice: result.pricing.cleanPrice,
          accruedInterest: result.pricing.accruedInterest,
          principalAmount: result.pricing.principalAmount,
          settlementAmount: result.pricing.settlementAmount,
          yield: result.pricing.yield,
        });

        if (opts.dryRun) {
          console.log("  [DRY RUN] Would update bondDetails.pricing");
          updated += 1;
          continue;
        }

        await db.dataBase.order.update({
          where: { id: order.id },
          data: {
            bondDetails: result.bondDetails,
            ...(opts.syncOrderColumns && result.orderPatch
              ? {
                  quantity: result.orderPatch.quantity,
                  unitPrice: result.orderPatch.unitPrice,
                  subTotal: result.orderPatch.subTotal,
                  stampDuty: result.orderPatch.stampDuty,
                  totalAmount: result.orderPatch.totalAmount,
                  faceValue: result.orderPatch.faceValue,
                  isin: result.orderPatch.isin,
                  bondName: result.orderPatch.bondName,
                }
              : {}),
          },
        });

        console.log("  ✅ Updated bondDetails" + (opts.syncOrderColumns ? " + order columns" : ""));
        updated += 1;
      } catch (err) {
        failed += 1;
        console.error("  ❌", err instanceof Error ? err.message : err);
      }
    }

    console.log(`\nDone. updated=${updated} skipped=${skipped} failed=${failed}`);
    if (opts.dryRun) {
      console.log("Re-run with --apply to persist changes.");
    }
  } finally {
    await db.dataBase.$disconnect();
  }
}

main().catch((err) => {
  console.error("❌ Script failed:", err);
  process.exit(1);
});
