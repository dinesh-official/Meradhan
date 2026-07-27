/**
 * Build / persist checkout-shaped `orders.bondDetails.pricing` from NSE data
 * already saved in our DB (settle_order + rfq_negotiable + rfq_master_isin).
 *
 * Used by:
 *  - CRM propose/accept flow when PDF download fails for missing pricing
 *  - scripts/rebuild-assign-order-bond-details.ts
 */
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
import { AppError, HttpStatus } from "@utils/error/AppError";

export type OrderPricingSnapshot = Record<string, unknown>;

export type ProposeOrderPricingResult = {
  orderId: number;
  orderNumber: string;
  isin: string;
  bondName: string;
  tradeNumber: string;
  alreadyHasPricing: boolean;
  sources: {
    settleOrderNumber: string;
    rfqNumber: string;
    rfqMasterNumber: string | null;
  };
  pricing: OrderPricingSnapshot;
  /** Full bondDetails that would be written on accept. */
  bondDetails: Prisma.InputJsonValue;
};

type AssignDates = {
  dealDateYmd: string;
  settlementDateYmd: string;
  dealDateRaw: string | null;
  settlementDateRaw: string | null;
  settlementType: number | null;
};

const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

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
  return dt ? WEEKDAY_NAMES[dt.getDay()] ?? "" : "";
}

function pricingYmd(value: string | Date | null | undefined): string {
  if (value == null) return "";
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return toYyyyMmDd(value);
  }
  const parsed = parseLooseDate(String(value));
  if (parsed) return toYyyyMmDd(parsed);
  const isoPrefix = String(value).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(isoPrefix) ? isoPrefix : "";
}

function settlementOrderFromType(type: number | null | undefined): "T+0" | "T+1" {
  return type === 0 ? "T+0" : "T+1";
}

export function hasCheckoutPricingSnapshot(bondDetails: unknown): boolean {
  if (!bondDetails || typeof bondDetails !== "object" || Array.isArray(bondDetails)) {
    return false;
  }
  const pricing = (bondDetails as Record<string, unknown>).pricing;
  if (!pricing || typeof pricing !== "object" || Array.isArray(pricing)) {
    return false;
  }
  const p = pricing as Record<string, unknown>;
  return Boolean(
    pricingYmd(String(p.dealDate ?? "")) && pricingYmd(String(p.settlementDate ?? "")),
  );
}

function resolveTradeNumber(order: {
  paymentId: string | null;
  reqOrderNumber: string | null;
  metadata: Prisma.JsonValue | null;
}): string | null {
  const metaRfq = readMetadataString(order.metadata, "rfqNumber");
  const candidates = [order.paymentId, order.reqOrderNumber, metaRfq]
    .map((v) => (typeof v === "string" ? v.trim() : ""))
    .filter(Boolean);

  for (const c of candidates) {
    if (/^\d{12,}$/.test(c)) return c;
  }
  return candidates[0] ?? null;
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

function stripPricingFromBondDetails(bondDetails: unknown): Record<string, unknown> {
  if (!bondDetails || typeof bondDetails !== "object" || Array.isArray(bondDetails)) {
    return {};
  }
  const { pricing: _omit, ...rest } = bondDetails as Record<string, unknown>;
  return rest;
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
}): Promise<AssignDates & { rfqMasterNumber: string | null }> {
  const fallbackDealDate = input.settleCreatedAt;

  const rfqMaster = input.negotiation
    ? await db.dataBase.rFQMasterISIN.findFirst({
        where: { number: input.negotiation.rfqNumber },
        select: {
          number: true,
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
    rfqMasterNumber: rfqMaster?.number ?? null,
  };
}

async function buildPricingSnapshot(input: {
  orderQuantity: number;
  orderUnitPrice: unknown;
  orderStampDuty: unknown;
  orderTotalAmount: unknown;
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
    stampDutyAmount: Prisma.Decimal | null;
  };
  negotiation: {
    acceptedPrice: number | null;
    acceptedQuantity: number | null;
    acceptedYield: number | null;
    acceptedAccruedInterest: number | null;
    acceptedConsideration: number | null;
  };
  dates: AssignDates;
}): Promise<OrderPricingSnapshot> {
  const quantity =
    numFromDecimal(input.settle.modQuantity) ??
    input.negotiation.acceptedQuantity ??
    input.orderQuantity;

  const cleanPrice =
    numFromDecimal(input.settle.price) ??
    input.negotiation.acceptedPrice ??
    numFromDecimal(input.orderUnitPrice) ??
    0;

  const faceValue = input.bond.faceValue;
  const couponRate = input.bond.couponRate;

  const accruedFromNse =
    input.negotiation.acceptedAccruedInterest ??
    numFromDecimal(input.settle.modAccrInt);

  const principalAmountRaw = calculatePrincipalAmount(cleanPrice, faceValue, quantity);
  const principalAmount = Number(truncateDecimals(principalAmountRaw, 2));

  let accruedInterestAmount =
    accruedFromNse != null && Number.isFinite(accruedFromNse)
      ? Number(truncateDecimals(accruedFromNse, 2))
      : null;

  const stampDuty =
    numFromDecimal(input.settle.stampDutyAmount) ??
    numFromDecimal(input.orderStampDuty) ??
    0;

  const considerationFromNse =
    input.negotiation.acceptedConsideration ??
    numFromDecimal(input.settle.modConsideration) ??
    numFromDecimal(input.orderTotalAmount);

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
    input.negotiation.acceptedYield ??
    numFromDecimal(input.settle.yield) ??
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

/**
 * Propose checkout pricing for an order from saved NSE rows (no DB write).
 */
export async function proposeOrderPricingFromNseSavedData(
  orderNumber: string,
): Promise<ProposeOrderPricingResult> {
  const order = await db.dataBase.order.findFirst({
    where: {
      OR: [
        { orderNumber },
        { reqOrderNumber: orderNumber },
        { paymentId: orderNumber },
      ],
    },
    select: {
      id: true,
      orderNumber: true,
      isin: true,
      bondName: true,
      quantity: true,
      unitPrice: true,
      stampDuty: true,
      totalAmount: true,
      paymentId: true,
      reqOrderNumber: true,
      metadata: true,
      bondDetails: true,
    },
  });
  if (!order) {
    throw new AppError(`Order not found: ${orderNumber}`, {
      statusCode: HttpStatus.NOT_FOUND,
      code: "ORDER_NOT_FOUND",
    });
  }

  const tradeNumber = resolveTradeNumber(order);
  if (!tradeNumber) {
    throw new AppError(
      "No NSE trade number on this order (paymentId / reqOrderNumber / metadata.rfqNumber).",
      {
        statusCode: HttpStatus.BAD_REQUEST,
        code: "NSE_TRADE_NUMBER_MISSING",
      },
    );
  }

  const settle = await db.dataBase.settleOrderModel.findFirst({
    where: { orderNumber: tradeNumber },
  });
  if (!settle) {
    throw new AppError(`settle_order not found for trade ${tradeNumber}`, {
      statusCode: HttpStatus.NOT_FOUND,
      code: "SETTLE_ORDER_NOT_FOUND",
    });
  }

  const negotiation = await db.dataBase.rFQNegotiation.findFirst({
    where: { tradeNumber: settle.orderNumber },
  });
  if (!negotiation) {
    throw new AppError(`rfq_negotiable not found for trade ${tradeNumber}`, {
      statusCode: HttpStatus.NOT_FOUND,
      code: "RFQ_NEGOTIATION_NOT_FOUND",
    });
  }

  const isin = settle.symbol?.trim() || order.isin;
  const bond = await db.dataBase.bonds.findFirst({ where: { isin } });
  if (!bond) {
    throw new AppError(`Bond not found for ISIN ${isin}`, {
      statusCode: HttpStatus.NOT_FOUND,
      code: "BOND_NOT_FOUND",
    });
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
    orderQuantity: order.quantity,
    orderUnitPrice: order.unitPrice,
    orderStampDuty: order.stampDuty,
    orderTotalAmount: order.totalAmount,
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
      stampDutyAmount: settle.stampDutyAmount,
    },
    negotiation: {
      acceptedPrice: negotiation.acceptedPrice,
      acceptedQuantity: negotiation.acceptedQuantity,
      acceptedYield: negotiation.acceptedYield,
      acceptedAccruedInterest: negotiation.acceptedAccruedInterest,
      acceptedConsideration: negotiation.acceptedConsideration,
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

  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    isin: bond.isin,
    bondName: bond.bondName,
    tradeNumber,
    alreadyHasPricing: hasCheckoutPricingSnapshot(order.bondDetails),
    sources: {
      settleOrderNumber: settle.orderNumber,
      rfqNumber: negotiation.rfqNumber,
      rfqMasterNumber: dates.rfqMasterNumber,
    },
    pricing,
    bondDetails,
  };
}

/**
 * Accept proposed NSE pricing and persist onto `orders.bondDetails`.
 */
export async function acceptOrderPricingFromNseSavedData(
  orderNumber: string,
): Promise<{
  orderId: number;
  orderNumber: string;
  pricing: OrderPricingSnapshot;
}> {
  const proposed = await proposeOrderPricingFromNseSavedData(orderNumber);

  await db.dataBase.order.update({
    where: { id: proposed.orderId },
    data: {
      bondDetails: proposed.bondDetails,
    },
  });

  return {
    orderId: proposed.orderId,
    orderNumber: proposed.orderNumber,
    pricing: proposed.pricing,
  };
}
