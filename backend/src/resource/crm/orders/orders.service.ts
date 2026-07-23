import { db } from "@core/database/database";
import type { Prisma } from "@databases/generated/prisma/postgres";
import { OrderStatus, PaymentStatus } from "@databases/generated/prisma/postgres";
import {
  generateDealId,
  generateOrderId,
} from "@resource/customer/order/order.utils";
import { CustomerProfileRepo } from "@resource/crm/customers/customer.repo";
import { BondService } from "@resource/bonds/bond.service";
import {
  generateDealPdfBuffer,
  generateOrderPdfBuffer,
} from "kyc-providers/pdf";
import { getInterestPaymentSchedule } from "kyc-providers";

import { fetchBankNameFromIfsc } from "@utils/razorpayIfsc";
import { getDpName } from "dp-id-lookup";
import { AppError, HttpStatus } from "@utils/error/AppError";
import crypto from "crypto";
import { env } from "@packages/config/src/env";
import {
  formatLastInterestPaymentDateDisplay,
  loadInvestorCouponScheduleForPdf,
} from "@services/order/investor-coupon-entitlement";
import { SettlementNoService } from "@services/refq/nse/settlement-no.service";
import {
  getLastNextCouponDateBasedOnSettlementDate,
  settlementDateFromYmd,
} from "@services/order/order-pricing-helper";
import { resolveShutPeriod } from "@services/order/shut-period-accrual";
import { sendBackOfficeEmail } from "@communication/email_communication";
import { buildOrderEmailHtmlBody } from "@communication/order_email_disclaimer";
import {
  dateOfBirthToPdfPassword,
  getCustomerDobRawForPdf,
} from "@utils/dobPdfPassword";
import { encryptPdfBufferWithPassword } from "@utils/encryptPdfBuffer";
import { getBondInfoCalcData } from "@resource/bonds/fill-bonds-auto";
import { OrderService } from "@resource/customer/order/order.service";
import { orderSettlementQueue } from "@jobs/queue/worker_queues";
import { OrderSettlementService } from "@services/order/order_settlement.service";
import { calculateTotalConsideration } from "@utils/truncateDecimals";
import { getOrderInfo, getOrderInfoByRfqNumber, getOrdersInfo, mapOrderInfoToReceiptPdfAutofill } from "@modules/order/getOrderInfo";

function formatDraftOrderCustomerName(profile: {
  firstName: string;
  middleName: string;
  lastName: string;
  legalEntityName: string | null;
}): string {
  const entity = profile.legalEntityName?.trim();
  if (entity) return entity;
  const parts = [profile.firstName, profile.middleName, profile.lastName]
    .map((s) => s?.trim())
    .filter((s) => s.length > 0);
  return parts.length > 0 ? parts.join(" ") : "—";
}

function toYyyyMmDd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

type SettleOrderPdfRow = {
  modQuantity?: number | string | Prisma.Decimal | null;
  modAccrInt?: number | string | Prisma.Decimal | null;
  modConsideration?: number | string | Prisma.Decimal | null;
  stampDutyAmount?: number | string | Prisma.Decimal | null;
};

function numFromSnap(v: unknown): number | undefined {
  if (v == null || v === "") return undefined;
  const n = typeof v === "number" ? v : Number(String(v).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : undefined;
}

/** Checkout pricing snapshot on `order.bondDetails.pricing` — never bonds-table calc columns. */
function orderPricingSnapshot(bondDetails: unknown): {
  cleanPrice?: number;
  principalAmount?: number;
  accruedInterest?: number;
  totalConsideration?: number;
  settlementAmount?: number;
  stampDuty?: number;
  noOfAccrualDays?: number;
  yield?: number;
} | null {
  if (!bondDetails || typeof bondDetails !== "object" || Array.isArray(bondDetails)) {
    return null;
  }
  const p = (bondDetails as Record<string, unknown>).pricing;
  if (!p || typeof p !== "object" || Array.isArray(p)) return null;
  const snap = p as Record<string, unknown>;
  return {
    ...(numFromSnap(snap.cleanPrice) != null ? { cleanPrice: numFromSnap(snap.cleanPrice) } : {}),
    ...(numFromSnap(snap.principalAmount) != null
      ? { principalAmount: numFromSnap(snap.principalAmount) }
      : {}),
    ...(numFromSnap(snap.accruedInterest) != null
      ? { accruedInterest: numFromSnap(snap.accruedInterest) }
      : {}),
    ...(numFromSnap(snap.totalConsideration) != null
      ? { totalConsideration: numFromSnap(snap.totalConsideration) }
      : {}),
    ...(numFromSnap(snap.settlementAmount) != null
      ? { settlementAmount: numFromSnap(snap.settlementAmount) }
      : {}),
    ...(numFromSnap(snap.stampDuty) != null ? { stampDuty: numFromSnap(snap.stampDuty) } : {}),
    ...(numFromSnap(snap.noOfAccrualDays) != null
      ? { noOfAccrualDays: numFromSnap(snap.noOfAccrualDays) }
      : {}),
    ...(numFromSnap(snap.yield) != null ? { yield: numFromSnap(snap.yield) } : {}),
  };
}

/**
 * Build the receipt's amortized principal schedule string
 * (e.g. "20-Nov-2026 50.0000%, 20-May-2027 50.0000%") from the DeriData calc
 * cashflow rows. Each row's `principal` ("-" for coupon-only rows, a formatted
 * decimal on principal-repayment rows) is expressed as a percentage of the
 * order's total face value (faceValue × quantity). Returns null when the bond
 * has no principal repayments (bullet) or face value is unknown.
 */
function buildAmortizedPrincipalPaymentDates(
  cfRows: Array<{ date: string; principal: string }>,
  quantity: number,
  faceValue: number,
): string | null {
  const totalFaceValue = faceValue * quantity;
  if (!Number.isFinite(totalFaceValue) || totalFaceValue <= 0) return null;
  const parts: string[] = [];
  for (const row of cfRows) {
    const principalNum = Number(String(row.principal ?? "").replace(/,/g, ""));
    if (!Number.isFinite(principalNum) || principalNum <= 0) continue;
    const pct = (principalNum / totalFaceValue) * 100;
    const date = String(row.date ?? "").trim();
    if (!date) continue;
    parts.push(`${date} ${pct.toFixed(4)}%`);
  }
  return parts.length > 0 ? parts.join(", ") : null;
}

function buildPdfFinancialFields(
  order: {
    subTotal?: unknown;
    stampDuty: unknown;
    totalAmount?: unknown;
    unitPrice?: unknown;
    quantity: number;
    bondDetails?: unknown;
  },
  settleOrder: SettleOrderPdfRow | null | undefined,
  pdfAccruedInterestDays?: number,
): {
  quantity: number;
  subTotal: number;
  stampDuty: number;
  totalConsideration: number;
  settlementAmount: number;
  price: number;
  accruedInterest?: number;
  accruedInterestDays?: number;
} {
  const quantity =
    settleOrder?.modQuantity != null
      ? Number(settleOrder.modQuantity)
      : order.quantity;
  const snap = orderPricingSnapshot(order.bondDetails);

  const accruedInterest =
    settleOrder?.modAccrInt != null
      ? Number(settleOrder.modAccrInt)
      : snap?.accruedInterest;
  const accruedInterestDays =
    pdfAccruedInterestDays ?? snap?.noOfAccrualDays;

  const principal =
    snap?.principalAmount ??
    (Number.isFinite(Number(order.subTotal)) ? Number(order.subTotal) : 0);

  const stampDuty =
    settleOrder?.stampDutyAmount != null
      ? Number(settleOrder.stampDutyAmount)
      : snap?.stampDuty ??
      (Number.isFinite(Number(order.stampDuty)) ? Number(order.stampDuty) : 0);

  const totalConsideration =
    settleOrder?.modConsideration != null
      ? Number(settleOrder.modConsideration)
      : snap?.totalConsideration ??
      (Number.isFinite(Number(order.totalAmount))
        ? Number(order.totalAmount)
        : calculateTotalConsideration(Number(principal), Number(accruedInterest ?? 0)));

  const settlementAmount =
    snap?.settlementAmount ??
    (settleOrder?.modConsideration != null
      ? Number(settleOrder.modConsideration) + stampDuty
      : totalConsideration + stampDuty);

  const settlePrice = numFromSnap(
    (settleOrder as { price?: unknown } | null | undefined)?.price,
  );
  const price =
    settlePrice ??
    snap?.cleanPrice ??
    (Number.isFinite(Number(order.unitPrice)) ? Number(order.unitPrice) : 0);

  return {
    quantity,
    subTotal: principal,
    stampDuty,
    totalConsideration,
    settlementAmount,
    price,
    ...(accruedInterest != null && Number.isFinite(accruedInterest)
      ? { accruedInterest }
      : {}),
    ...(accruedInterestDays != null && Number.isFinite(accruedInterestDays)
      ? { accruedInterestDays }
      : {}),
  };
}

function formatDateWithDayNameForPdfOption(d: Date): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return `${String(d.getDate()).padStart(2, "0")}-${months[d.getMonth()]}-${d.getFullYear()} (${dayNames[d.getDay()]})`;
}

function parseLooseDate(input: string): Date | null {
  const s = String(input ?? "").trim();
  if (!s) return null;

  // YYYY-MM-DD
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (iso) {
    const y = Number(iso[1]);
    const m = Number(iso[2]);
    const d = Number(iso[3]);
    const dt = new Date(y, m - 1, d, 12, 0, 0, 0);
    return Number.isNaN(dt.getTime()) ? null : dt;
  }

  // DD-MMM-YYYY (03-Apr-2026)
  const ddMmmYyyy = /^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/.exec(s);
  if (ddMmmYyyy) {
    const day = Number(ddMmmYyyy[1]);
    const monKey = (ddMmmYyyy[2] ?? "").slice(0, 3).toLowerCase();
    const year = Number(ddMmmYyyy[3] ?? NaN);
    const MONTH: Record<string, number> = {
      jan: 0,
      feb: 1,
      mar: 2,
      apr: 3,
      may: 4,
      jun: 5,
      jul: 6,
      aug: 7,
      sep: 8,
      oct: 9,
      nov: 10,
      dec: 11,
    };
    const month = MONTH[monKey];
    if (month !== undefined) {
      const dt = new Date(year, month, day, 12, 0, 0, 0);
      return Number.isNaN(dt.getTime()) ? null : dt;
    }
  }

  // DD-MM-YYYY (common NSE settle_order.modSettleDate format)
  const ddMmYyyy = /^(\d{1,2})-(\d{1,2})-(\d{4})$/.exec(s);
  if (ddMmYyyy) {
    const day = Number(ddMmYyyy[1]);
    const month = Number(ddMmYyyy[2]) - 1;
    const year = Number(ddMmYyyy[3]);
    const dt = new Date(year, month, day, 12, 0, 0, 0);
    return Number.isNaN(dt.getTime()) ? null : dt;
  }

  // Fallback (e.g. ISO timestamps)
  const dt = new Date(s);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function toBusinessYmd(input: string | null | undefined): string | null {
  if (!input) return null;
  const parsed = parseLooseDate(input);
  return parsed ? toYyyyMmDd(parsed) : null;
}

/** NSE settle/trade numbers are long digit strings — never CRM order INT4 PKs. */
function looksLikeNseRfqTradeNumber(value: string): boolean {
  return /^\d{12,}$/.test(value.trim());
}

function snapStr(v: unknown): string | null {
  if (v == null) return null;
  const s = String(v).trim();
  return s !== "" ? s : null;
}

/**
 * Deal / settlement dates from checkout snapshot on `order.bondDetails.pricing`.
 * Reuses values stored at order placement — does not re-run settlement calculation.
 */
function resolveDatesFromOrderPricingSnapshot(
  bondDetails: unknown,
  overrides?: {
    requestedDealDate?: string | null;
    requestedSettlementDate?: string | null;
  },
): {
  dealDateYmd: string;
  settlementDateYmd: string;
  dealDate: Date;
  settlementType: number | null;
} {
  if (!bondDetails || typeof bondDetails !== "object" || Array.isArray(bondDetails)) {
    throw new AppError(
      "Order pricing snapshot is missing. bondDetails.pricing must include dealDate and settlementDate.",
      { statusCode: HttpStatus.BAD_REQUEST, code: "PRICING_SNAPSHOT_MISSING" },
    );
  }
  const pricing = (bondDetails as Record<string, unknown>).pricing;
  if (!pricing || typeof pricing !== "object" || Array.isArray(pricing)) {
    throw new AppError(
      "Order pricing snapshot is missing. bondDetails.pricing must include dealDate and settlementDate.",
      { statusCode: HttpStatus.BAD_REQUEST, code: "PRICING_SNAPSHOT_MISSING" },
    );
  }
  const snap = pricing as Record<string, unknown>;

  const dealFromSnap = toBusinessYmd(snapStr(snap.dealDate));
  const settleFromSnap = toBusinessYmd(snapStr(snap.settlementDate));
  if (!dealFromSnap && !settleFromSnap) {
    throw new AppError(
      "Order pricing snapshot is missing dealDate and settlementDate.",
      { statusCode: HttpStatus.BAD_REQUEST, code: "PRICING_SNAPSHOT_MISSING" },
    );
  }

  let dealDateYmd = dealFromSnap ?? settleFromSnap!;
  let settlementDateYmd = settleFromSnap ?? dealFromSnap!;

  const overrideDeal = toBusinessYmd(overrides?.requestedDealDate);
  if (overrideDeal) {
    dealDateYmd = overrideDeal;
  }

  const overrideSettle = toBusinessYmd(overrides?.requestedSettlementDate);
  if (overrideSettle) {
    settlementDateYmd = overrideSettle;
  }

  const dealDate = parseLooseDate(dealDateYmd);
  if (!dealDate) {
    throw new AppError("Invalid dealDate in order pricing snapshot.", {
      statusCode: HttpStatus.BAD_REQUEST,
      code: "PRICING_SNAPSHOT_INVALID",
    });
  }

  let settlementType: number | null = null;
  const settlementOrder = snapStr(snap.settlementOrder);
  if (settlementOrder === "T+0" || dealDateYmd === settlementDateYmd) {
    settlementType = 0;
  } else if (settlementOrder === "T+1") {
    settlementType = 1;
  }

  return { dealDateYmd, settlementDateYmd, dealDate, settlementType };
}

/** Last coupon date from checkout snapshot on `order.bondDetails.pricing`. */
function lastCouponDatesFromOrderPricingSnapshot(bondDetails: unknown): {
  lastInterestPaymentDateRaw: string | null;
  lastInterestPaymentDate: string | null;
} {
  if (!bondDetails || typeof bondDetails !== "object" || Array.isArray(bondDetails)) {
    return { lastInterestPaymentDateRaw: null, lastInterestPaymentDate: null };
  }
  const pricing = (bondDetails as Record<string, unknown>).pricing;
  if (!pricing || typeof pricing !== "object" || Array.isArray(pricing)) {
    return { lastInterestPaymentDateRaw: null, lastInterestPaymentDate: null };
  }

  const ymd = toBusinessYmd(snapStr((pricing as Record<string, unknown>).lastCouponDate));
  if (!ymd) {
    return { lastInterestPaymentDateRaw: null, lastInterestPaymentDate: null };
  }

  return {
    lastInterestPaymentDateRaw: ymd,
    lastInterestPaymentDate: formatLastInterestPaymentDateDisplay(
      settlementDateFromYmd(ymd),
    ),
  };
}

/**
 * Settlement number for PDFs: look up `nse_settlement_no` by settlement date first.
 * Form override / settle_order / metadata are used only when no row exists for that date.
 */
async function resolveSettlementNumberForPdf(input: {
  settlementDateYmd: string;
  requestedSettlementNumber?: string | null;
  settleOrderSettlementNo?: string | null;
  metadataSettlementNumber?: string | null;
}): Promise<string | null> {
  const byDate = await new SettlementNoService()
    .getSettlementNo(input.settlementDateYmd)
    .catch(() => null);
  const fromDate = byDate?.settlementNo?.trim();
  if (fromDate) return fromDate;

  return (
    input.requestedSettlementNumber?.trim() ||
    input.settleOrderSettlementNo?.trim() ||
    input.metadataSettlementNumber?.trim() ||
    null
  );
}

function diffDays(start: Date, end: Date): number {
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 0, 0, 0, 0);
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 0, 0, 0, 0);
  const ms = e.getTime() - s.getTime();
  return Math.round(ms / 86_400_000);
}

/**
 * RFQ master stores `date` as DD-MMM-YYYY (e.g. 03-Apr-2026) and `quoteTime` as HH:MM or HH:MM:SS.
 * Parsing with `new Date("03-Apr-2026 12:00:00")` is unreliable; missing RFQ rows yield Invalid Date.
 */
function parseRfqMasterDateTime(
  datePart: string | null | undefined,
  quoteTimePart: string | null | undefined,
  fallback: Date,
): Date {
  const rawDate = datePart?.trim();
  if (!rawDate) {
    return fallback;
  }

  const timeRaw = quoteTimePart?.trim();
  let time = "12:00:00";
  if (timeRaw) {
    const parts = timeRaw.split(":");
    if (parts.length === 2) {
      time = `${timeRaw}:00`;
    } else {
      time = timeRaw;
    }
  }

  const ddMmmYyyy = /^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/.exec(rawDate);
  if (ddMmmYyyy) {
    const day = Number(ddMmmYyyy[1]);
    const monKey = (ddMmmYyyy[2] ?? "").slice(0, 3).toLowerCase();
    const year = Number(ddMmmYyyy[3] ?? NaN);
    const MONTH: Record<string, number> = {
      jan: 0,
      feb: 1,
      mar: 2,
      apr: 3,
      may: 4,
      jun: 5,
      jul: 6,
      aug: 7,
      sep: 8,
      oct: 9,
      nov: 10,
      dec: 11,
    };
    const month = MONTH[monKey];
    const tm = /^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/.exec(time);
    const hh = tm ? Number(tm[1]) : 12;
    const mm = tm ? Number(tm[2]) : 0;
    const ss = tm && tm[3] !== undefined ? Number(tm[3]) : 0;

    if (month !== undefined) {
      const out = new Date(year, month, day, hh, mm, ss);
      if (!Number.isNaN(out.getTime())) {
        return out;
      }
    }
  }

  const parsed = new Date(`${rawDate} ${time}`.trim());
  if (!Number.isNaN(parsed.getTime())) {
    return parsed;
  }
  return fallback;
}

type AssignOrderDates = {
  dealDate: Date;
  settlementDate: Date;
  purchaseDate: Date;
  dealDateRaw: string | null;
  settlementDateRaw: string | null;
};

function buildAssignOrderDateMetadata(
  base: Record<string, unknown>,
  dates: AssignOrderDates,
): Record<string, unknown> {
  const next = { ...base };
  if (dates.dealDateRaw) {
    next.dealDate = dates.dealDateRaw;
  }
  if (dates.settlementDateRaw) {
    next.settlementDate = dates.settlementDateRaw;
  }
  return next;
}

/**
 * Resolve business deal / settlement / purchase dates for CRM assign-order flows.
 * Prefers `rfq_master_isin` (same source as `/crm/rfq/nse/find`), then negotiation
 * accepted settlement, then settle_order.modSettleDate. Falls back to settle sync time.
 */
async function resolveAssignOrderDates(
  settleOrder: { createdAt: Date | string; modSettleDate?: string | null },
  negotiation: { rfqNumber: string; acceptedSettlementDate?: string | null },
): Promise<AssignOrderDates> {
  const fallbackDealDate =
    settleOrder.createdAt instanceof Date
      ? settleOrder.createdAt
      : new Date(settleOrder.createdAt);

  const rfqMaster = await db.dataBase.rFQMasterISIN.findFirst({
    where: { number: negotiation.rfqNumber },
    select: { date: true, quoteTime: true, settlementDate: true },
  });

  const dealDateRaw = rfqMaster?.date?.trim() || null;
  const settlementDateRaw =
    rfqMaster?.settlementDate?.trim() ||
    negotiation.acceptedSettlementDate?.trim() ||
    settleOrder.modSettleDate?.trim() ||
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
    dealDate,
    settlementDate,
    purchaseDate: settlementDate,
    dealDateRaw,
    settlementDateRaw,
  };
}

async function resolveRfqMasterSavedResponse(input: {
  negotiationRfqNumber?: string | null;
  metadataRfqNumber?: string | null;
  settleTradeNumber?: string | null;
}): Promise<{
  number: string;
  date: string | null;
  quoteTime: string | null;
  settlementDate: string | null;
  settlementType: number | null;
  access: number | null;
} | null> {
  const candidates = [
    ...new Set(
      [
        input.negotiationRfqNumber,
        input.metadataRfqNumber,
        input.settleTradeNumber,
      ]
        .map((v) => (typeof v === "string" ? v.trim() : ""))
        .filter((v) => v.length > 0),
    ),
  ];
  for (const number of candidates) {
    const row = await db.dataBase.rFQMasterISIN.findFirst({
      where: { number },
      select: {
        number: true,
        date: true,
        quoteTime: true,
        settlementDate: true,
        settlementType: true,
        access: true,
      },
    });
    if (row) return row;
  }
  return null;
}

/**
 * Order Date & Time on PDFs: RFQ master `date` + `quoteTime` from the saved
 * NSE RFQ response (not pricing-snapshot midnight / 12:00:00).
 */
function resolveOrderDateTimeFromRfqMaster(
  rfqMaster: { date?: string | null; quoteTime?: string | null } | null | undefined,
  fallback: Date,
): Date {
  return parseRfqMasterDateTime(
    rfqMaster?.date,
    rfqMaster?.quoteTime,
    fallback,
  );
}

export class CrmOrdersService {
  private readonly customerOrderService = new OrderService();

  /**
   * NSE `settle_order.orderNumber` is the trade id; customer-facing `order.orderNumber` is usually MD-*.
   */
  private resolveSettleOrderTradeKey(order: {
    orderNumber: string;
    reqOrderNumber: string | null;
    metadata: unknown;
  }): string {
    const meta = (order.metadata as Record<string, unknown> | null) ?? {};
    const rfq = typeof meta.rfqNumber === "string" ? meta.rfqNumber.trim() : "";
    const req =
      order.reqOrderNumber != null && String(order.reqOrderNumber).trim() !== ""
        ? String(order.reqOrderNumber).trim()
        : "";
    return req || rfq || order.orderNumber;
  }

  async getSettlementAutomationLogGroups(search?: string) {
    const where = search?.trim()
      ? {
        OR: [
          { paymentId: { contains: search, mode: "insensitive" as const } },
          { batchId: { contains: search, mode: "insensitive" as const } },
          { step: { contains: search, mode: "insensitive" as const } },
          { message: { contains: search, mode: "insensitive" as const } },
        ],
      }
      : {};

    const rows = await db.dataBase.orderSettlementAutomationLog.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });

    const grouped = rows.reduce<Record<string, typeof rows>>((acc, row) => {
      if (!acc[row.paymentId]) acc[row.paymentId] = [];
      acc[row.paymentId]!.push(row);
      return acc;
    }, {});

    return Object.entries(grouped).map(([paymentId, logs]) => ({
      paymentId,
      totalLogs: logs.length,
      latestStatus: logs[0]?.status ?? "UNKNOWN",
      latestCreatedAt: logs[0]?.createdAt ?? null,
      logs,
    }));
  }

  async getSettlementAutomationLogs(paymentId?: string | null) {
    if (!paymentId) return [];
    return db.dataBase.orderSettlementAutomationLog.findMany({
      where: { paymentId },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });
  }

  async getAllOrders(
    page: number = 1,
    limit: number = 10,
    status?: string,
    bondType?: string,
    search?: string,
    date?: string
  ) {
    const skip = (page - 1) * limit;

    const whereClause: Prisma.OrderWhereInput = {};

    const countWhereClause: Prisma.OrderWhereInput = {};

    if (status) {
      const validOrderStatuses = Object.values(OrderStatus);
      if (validOrderStatuses.includes(status as OrderStatus)) {
        whereClause.status = status as OrderStatus;
        countWhereClause.status = status as OrderStatus;
      }
    }

    if (bondType) {
      const validBondTypes = ["PRIMARY", "SECONDARY"];
      if (validBondTypes.includes(bondType.toUpperCase())) {
        const isPrimary = bondType.toUpperCase() === "PRIMARY";
        whereClause.bondDetails = {
          path: ["isPrimary"],
          equals: isPrimary,
        };
        countWhereClause.bondDetails = {
          path: ["isPrimary"],
          equals: isPrimary,
        };
      }
    }

    const searchTrimmed = search?.trim();
    if (searchTrimmed) {
      const q = searchTrimmed;
      const numericId = /^\d+$/.test(q) ? Number(q) : null;
      /** e.g. "sourav bapari" → each token must match some name field (first / middle / last). */
      const nameTokens = q.split(/\s+/).filter((t) => t.length > 0);

      const customerMatchesToken = (token: string) =>
        ({
          OR: [
            { firstName: { contains: token, mode: "insensitive" as const } },
            { middleName: { contains: token, mode: "insensitive" as const } },
            { lastName: { contains: token, mode: "insensitive" as const } },
          ],
        }) satisfies Prisma.CustomerProfileDataModelWhereInput;

      const customerSearchConditions: Prisma.OrderWhereInput[] =
        nameTokens.length >= 2
          ? [
            {
              customerProfile: {
                AND: nameTokens.map((token) => customerMatchesToken(token)),
              },
            },
            {
              customerProfile: {
                emailAddress: { contains: q, mode: "insensitive" },
              },
            },
          ]
          : [
            {
              customerProfile: {
                OR: [
                  { firstName: { contains: q, mode: "insensitive" } },
                  { middleName: { contains: q, mode: "insensitive" } },
                  { lastName: { contains: q, mode: "insensitive" } },
                  { emailAddress: { contains: q, mode: "insensitive" } },
                ],
              },
            },
          ];

      whereClause.OR = [
        ...customerSearchConditions,
        { bondName: { contains: q, mode: "insensitive" } },
        { orderNumber: { contains: q, mode: "insensitive" } },
        { isin: { contains: q, mode: "insensitive" } },
        { paymentId: { contains: q, mode: "insensitive" } },
        { paymentOrderId: { contains: q, mode: "insensitive" } },
        { reqOrderNumber: { contains: q, mode: "insensitive" } },
        {
          metadata: {
            path: ["rfqNumber"],
            string_contains: q,
          },
        },
        ...(numericId != null ? [{ id: numericId }] : []),
        {
          bondDetails: {
            path: ["issuerCode"],
            string_contains: q,
          },
        },
        {
          bondDetails: {
            path: ["rating"],
            string_contains: q,
          },
        },
        {
          bondDetails: {
            path: ["creditRating"],
            string_contains: q,
          },
        },
        {
          bondDetails: {
            path: ["bondRating"],
            string_contains: q,
          },
        },
      ];
      countWhereClause.OR = whereClause.OR;
    }

    if (date) {
      const selectedDate = new Date(date);
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      whereClause.createdAt = {
        gte: startOfDay,
        lte: endOfDay,
      };
      countWhereClause.createdAt = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const [orders, total] = await Promise.all([
      db.dataBase.order.findMany({
        where: whereClause,
        include: {
          customerProfile: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              emailAddress: true,
              userName: true,
            },
          },
          orderStages: {
            select: {
              stage: true,
              status: true,
              seq: true,
            },
            orderBy: { seq: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.dataBase.order.count({
        where: countWhereClause,
      }),
    ]);

    // Hydrate participant info for any participant-counterparty orders in
    // this page so the CRM list can show the external counterparty name
    // alongside Meradhan customers.
    const participantCodes = Array.from(
      new Set(
        orders
          .filter((o) => o.customerProfileId == null && !!o.linkedRfqParticipantCode)
          .map((o) => o.linkedRfqParticipantCode as string),
      ),
    );
    const participantInfoByCode = participantCodes.length
      ? new Map(
        (
          await db.dataBase.nseRfqParticipantInfoModel.findMany({
            where: { code: { in: participantCodes } },
            select: {
              code: true,
              nameOverride: true,
              contactPerson: true,
              emailList: true,
              panNo: true,
            },
          })
        ).map((p) => [p.code, p] as const),
      )
      : new Map();

    const data = orders.map((o) => ({
      ...o,
      rfqParticipantInfo:
        o.customerProfileId == null && o.linkedRfqParticipantCode
          ? (participantInfoByCode.get(o.linkedRfqParticipantCode) ?? null)
          : null,
    }));

    const orderInfoById = await getOrdersInfo(data.map((o) => o.id));
    const dataWithInfo = data.map((o) => ({
      ...o,
      orderInfo: orderInfoById[o.id] ?? null,
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      data: dataWithInfo,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async getOrderById(orderId: number) {
    // Fix misleading timeline: pg_routing Done while an earlier stage is Failed.
    try {
      const settlementService = new OrderSettlementService();
      await settlementService.repairPrematurePgRoutingSuccess(orderId);
    } catch {
      // Non-fatal — still return order details
    }

    const order = await db.dataBase.order.findUnique({
      where: { id: orderId },
      include: {
        customerProfile: {
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            emailAddress: true,
            phoneNo: true,
            userName: true,
          },
        },
        orderLogs: {
          orderBy: { createdAt: "desc" },
        },
        orderStages: {
          orderBy: { seq: "asc" },
        },
        customerBonds: true,
      },
    });

    if (!order) {
      throw new Error(`Order with ID ${orderId} not found`);
    }

    const settlementAutomationLogs = await this.getSettlementAutomationLogs(order.paymentId);

    // Hydrate participant info for participant-counterparty orders so the
    // order details view can show the external counterparty's name/contact
    // instead of an empty customer card.
    let rfqParticipantInfo: {
      code: string;
      nameOverride: string | null;
      contactPerson: string | null;
      emailList: string[];
      mobileList: string[];
      panNo: string | null;
    } | null = null;
    if (order.customerProfileId == null && order.linkedRfqParticipantCode) {
      rfqParticipantInfo = await db.dataBase.nseRfqParticipantInfoModel.findUnique({
        where: { code: order.linkedRfqParticipantCode },
        select: {
          code: true,
          nameOverride: true,
          contactPerson: true,
          emailList: true,
          mobileList: true,
          panNo: true,
        },
      });
    }

    return {
      ...order,
      rfqParticipantInfo,
      settlementAutomationLogs,
      orderInfo: await getOrderInfo(order.id).catch(() => null),
    };
  }

  async updateOrderStatus(orderId: number, status: OrderStatus) {
    // Check if order exists
    const existingOrder = await db.dataBase.order.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      throw new Error(`Order with ID ${orderId} not found`);
    }

    // Update order status
    const updatedOrder = await db.dataBase.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        customerProfile: {
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            emailAddress: true,
            phoneNo: true,
          },
        },
        orderLogs: {
          orderBy: { createdAt: "desc" },
        },
        customerBonds: true,
      },
    });

    return updatedOrder;
  }


  async getRfqByOrderNumber(orderNumber: string) {
    const rfq = await db.dataBase.settleOrderModel.findFirst({
      where: {
        orderNumber: {
          equals: orderNumber,
        },
      },
    });
    return rfq;
  }

  /**
   * Stamp an NSE settle_order with `linkedRfqParticipantCode` so downstream
   * PDFs and reports can render the external counterparty when the order
   * isn't owned by a Meradhan customer.
   *
   * Mirrors the behaviour of the `asign-order.ts` CLI helper but exposed
   * to the CRM UI so operators can assign a participant straight from the
   * settle-order generate page.
   *
   * Pre-conditions:
   * - The settle order must exist.
   * - An `NseRfqParticipantInfoModel` row must already exist for `code`
   *   (operator has to enrich the participant first — same constraint as
   *   the CLI and the PDF actor resolver). This guarantees the PDF can
   *   pick up contact / PAN / bank / demat details for the participant.
   *
   * If the participant code doesn't match either side of the trade
   * (`buyParticipantLoginId` / `sellParticipantLoginId`) the call still
   * succeeds — the operator may be tagging a backoffice/broker/clearer.
   */
  async assignRfqParticipantToSettleOrder(input: {
    orderNumber: string;
    code: string;
  }): Promise<{
    settleOrderNumber: string;
    linkedRfqParticipantCode: string;
    participantName: string;
    matchesBuySide: boolean;
    matchesSellSide: boolean;
    /**
     * The Meradhan `Order` row that was created (or reused) to anchor this
     * participant-counterparty assignment. Mirrors the customer-flow output
     * of `createOrderFromRfq` so the CRM UI can show a real "Order assigned"
     * card with a generated Order ID + Deal ID for participant orders too.
     */
    order: {
      id: number;
      orderNumber: string;
      dealId: string | null;
      reqOrderNumber: string | null;
      isin: string;
      bondName: string;
      quantity: number;
      unitPrice: number;
      subTotal: number;
      stampDuty: number;
      totalAmount: number;
      action: "BUY" | "SELL" | "BOTH";
      created: boolean;
    };
  }> {
    const orderNumber = input.orderNumber?.trim();
    const code = input.code?.trim();
    if (!orderNumber || !code) {
      throw new AppError("orderNumber and participant code are required.", {
        statusCode: HttpStatus.BAD_REQUEST,
        code: "BAD_REQUEST",
      });
    }

    const settleOrder = await db.dataBase.settleOrderModel.findFirst({
      where: { orderNumber },
      select: {
        id: true,
        orderNumber: true,
        buyParticipantLoginId: true,
        sellParticipantLoginId: true,
        linkedRfqParticipantCode: true,
      },
    });
    if (!settleOrder) {
      throw new AppError(`Settle order ${orderNumber} not found.`, {
        statusCode: HttpStatus.NOT_FOUND,
        code: "SETTLE_ORDER_NOT_FOUND",
      });
    }

    const participant =
      await db.dataBase.nseRfqParticipantInfoModel.findUnique({
        where: { code },
        select: { code: true, nameOverride: true },
      });
    if (!participant) {
      throw new AppError(
        `RFQ participant info not found for code "${code}". Add an entry via /dashboard/rfqs/nse/rfq-participants first.`,
        {
          statusCode: HttpStatus.NOT_FOUND,
          code: "PARTICIPANT_INFO_MISSING",
        },
      );
    }

    const matchesBuySide =
      String(settleOrder.buyParticipantLoginId ?? "").trim() === code;
    const matchesSellSide =
      String(settleOrder.sellParticipantLoginId ?? "").trim() === code;

    // -----------------------------------------------------------------
    // Resolve RFQ + bond + negotiation context so we can create a real
    // Meradhan `Order` row anchored to this participant counterparty.
    // -----------------------------------------------------------------
    const rfq = await this.getRfqByOrderNumber(orderNumber);
    if (!rfq) {
      throw new AppError(
        `RFQ not found for settle order ${orderNumber}.`,
        { statusCode: HttpStatus.NOT_FOUND, code: "RFQ_NOT_FOUND" },
      );
    }

    const bondDetails = await db.dataBase.bonds.findFirst({
      where: { isin: rfq.symbol },
    });
    if (!bondDetails) {
      throw new AppError(
        `Bond details not found for ISIN ${rfq.symbol}.`,
        { statusCode: HttpStatus.NOT_FOUND, code: "BOND_NOT_FOUND" },
      );
    }

    const negotation = await db.dataBase.rFQNegotiation.findFirst({
      where: { tradeNumber: rfq.orderNumber },
    });
    if (!negotation) {
      throw new AppError(
        `Negotiation not found for settle order ${rfq.orderNumber}.`,
        {
          statusCode: HttpStatus.NOT_FOUND,
          code: "NEGOTIATION_NOT_FOUND",
        },
      );
    }

    // Refuse to overwrite a customer-assigned Order. Operators should
    // use the customer flow for those; never silently re-point one.
    const existingCustomerOrder = await db.dataBase.order.findFirst({
      where: {
        OR: [
          { reqOrderNumber: rfq.orderNumber },
          { orderNumber: rfq.orderNumber },
        ],
        customerProfileId: { not: null },
      },
      select: { id: true, orderNumber: true },
    });
    if (existingCustomerOrder) {
      throw new AppError(
        `Order ${existingCustomerOrder.orderNumber} is already assigned to a Meradhan customer. Unassign that customer first to assign an NSE participant.`,
        {
          statusCode: HttpStatus.CONFLICT,
          code: "ORDER_ALREADY_ASSIGNED_TO_CUSTOMER",
        },
      );
    }

    // Reuse any participant-flow Order row already pointing at this RFQ.
    const existingParticipantOrder = await db.dataBase.order.findFirst({
      where: {
        OR: [
          { reqOrderNumber: rfq.orderNumber },
          { orderNumber: rfq.orderNumber },
        ],
        customerProfileId: null,
      },
      select: { id: true, orderNumber: true, metadata: true },
    });

    const resolveAction = (): "BUY" | "SELL" | "BOTH" => {
      if (negotation.buySell === "B") return "BUY";
      if (negotation.buySell === "S") return "SELL";
      return "BOTH";
    };
    const action = resolveAction();
    const idAction = action === "BOTH" ? "BUY" : action;
    const assignDates = await resolveAssignOrderDates(rfq, negotation);
    const dealDate = assignDates.dealDate;
    const issuerName = bondDetails.bondName || bondDetails.instrumentName || "";

    const unitPrice = rfq.price.toNumber();
    const quantity = Number(rfq.modQuantity) || 0;
    const stampDutyVal = Number(negotation.acceptedAccruedInterest ?? 0);
    const considerationVal = Number(negotation.acceptedConsideration ?? 0);

    const result = await db.dataBase.$transaction(async (tx) => {
      // 1. Stamp settle_order with linkedRfqParticipantCode (source of
      //    truth for the counterparty even outside the Order row).
      await tx.settleOrderModel.update({
        where: { id: settleOrder.id },
        data: { linkedRfqParticipantCode: code },
      });

      // 2. Upsert the anchor Order row (participant flow — no customer).
      let orderRow: {
        id: number;
        orderNumber: string;
        metadata: Prisma.JsonValue;
        reqOrderNumber: string | null;
        isin: string;
        bondName: string;
        quantity: number;
        unitPrice: Prisma.Decimal;
        subTotal: Prisma.Decimal;
        stampDuty: Prisma.Decimal;
        totalAmount: Prisma.Decimal;
      };
      let created = false;

      if (existingParticipantOrder) {
        const baseMeta =
          (existingParticipantOrder.metadata as Record<
            string,
            unknown
          > | null) ?? {};
        orderRow = await tx.order.update({
          where: { id: existingParticipantOrder.id },
          data: {
            linkedRfqParticipantCode: code,
            metadata: buildAssignOrderDateMetadata(
              {
                ...baseMeta,
                rfqNumber: rfq.orderNumber,
                clientOrderSide: idAction,
                participantName: participant.nameOverride ?? code,
              },
              assignDates,
            ) as Prisma.InputJsonValue,
          },
          select: {
            id: true,
            orderNumber: true,
            metadata: true,
            reqOrderNumber: true,
            isin: true,
            bondName: true,
            quantity: true,
            unitPrice: true,
            subTotal: true,
            stampDuty: true,
            totalAmount: true,
          },
        });
      } else {
        const tempOrderNumber = `MD-PARTNER-TEMP-${crypto
          .randomUUID()
          .replace(/-/g, "")
          .slice(0, 32)}`;

        const inserted = await tx.order.create({
          data: {
            bondDetails: bondDetails as unknown as Prisma.InputJsonValue,
            faceValue: bondDetails.faceValue,
            quantity,
            unitPrice,
            isin: bondDetails.isin,
            bondName: bondDetails.bondName,
            orderNumber: tempOrderNumber,
            stampDuty: stampDutyVal,
            subTotal: considerationVal,
            totalAmount: considerationVal,
            customerProfileId: null,
            linkedRfqParticipantCode: code,
            paymentId: rfq.orderNumber,
            paymentOrderId: rfq.orderNumber,
            reqOrderNumber: rfq.orderNumber,
            metadata: buildAssignOrderDateMetadata(
              {
                rfqNumber: rfq.orderNumber,
                participantName: participant.nameOverride ?? code,
              },
              assignDates,
            ) as Prisma.InputJsonValue,
            paymentStatus: PaymentStatus.PENDING,
            paymentProvider: "CUSTOM",
            status: OrderStatus.SETTLED,
            // Intentionally no `customerBonds` create — this Order isn't
            // owned by a Meradhan customer, so there's no portfolio entry
            // to track.
          },
          select: {
            id: true,
            orderNumber: true,
            metadata: true,
            reqOrderNumber: true,
            isin: true,
            bondName: true,
            quantity: true,
            unitPrice: true,
            subTotal: true,
            stampDuty: true,
            totalAmount: true,
          },
        });
        created = true;

        const finalOrderNumber = generateOrderId({
          channel: "ASSIST",
          action: idAction,
          date: dealDate,
          orderSequence: inserted.id,
        });
        const dealId = generateDealId({
          issuerName,
          channel: "ASSIST",
          action: idAction,
          date: dealDate,
          orderSequence: inserted.id,
        });

        orderRow = await tx.order.update({
          where: { id: inserted.id },
          data: {
            orderNumber: finalOrderNumber,
            metadata: buildAssignOrderDateMetadata(
              {
                ...((inserted.metadata as Record<string, unknown>) ?? {}),
                dealId,
                clientOrderSide: idAction,
              },
              assignDates,
            ) as Prisma.InputJsonValue,
          },
          select: {
            id: true,
            orderNumber: true,
            metadata: true,
            reqOrderNumber: true,
            isin: true,
            bondName: true,
            quantity: true,
            unitPrice: true,
            subTotal: true,
            stampDuty: true,
            totalAmount: true,
          },
        });
      }

      return { orderRow, created };
    });

    const meta =
      (result.orderRow.metadata as Record<string, unknown> | null) ?? {};
    const dealId =
      typeof meta.dealId === "string" && meta.dealId.length > 0
        ? meta.dealId
        : null;

    return {
      settleOrderNumber: settleOrder.orderNumber,
      linkedRfqParticipantCode: code,
      participantName: participant.nameOverride ?? code,
      matchesBuySide,
      matchesSellSide,
      order: {
        id: result.orderRow.id,
        orderNumber: result.orderRow.orderNumber,
        dealId,
        reqOrderNumber: result.orderRow.reqOrderNumber,
        isin: result.orderRow.isin,
        bondName: result.orderRow.bondName,
        quantity: Number(result.orderRow.quantity),
        unitPrice: Number(result.orderRow.unitPrice),
        subTotal: Number(result.orderRow.subTotal),
        stampDuty: Number(result.orderRow.stampDuty),
        totalAmount: Number(result.orderRow.totalAmount),
        action,
        created: result.created,
      },
    };
  }

  async getReceiptPdfOptions(orderNumber: string) {
    return db.dataBase.crmOrderReceiptPdfOptions.findUnique({
      where: { orderNumber },
    });
  }

  async autofillReceiptPdfOptions(
    orderNumber: string,
    input: { settlementDate?: string | null },
  ): Promise<{
    accruedInterestDays: number;
    settlementNumber: string | null;
    lastInterestPaymentDateRaw: string | null;
    lastInterestPaymentDate: string | null;
    interestPaymentDates: string[] | null;
    settlementDateTime: string | null;
    nonAmortizedBond: boolean;
    amortizedPrincipalPaymentDates: string | null;
    settlementDate: string;
    dealDate: string | null;
    settlementType: number | null;
  }> {
    const requestedSettlementDate =
      typeof input.settlementDate === "string" && input.settlementDate.trim() !== ""
        ? input.settlementDate.trim()
        : null;

    // Settle-order generate page (`/settle-orders/generate/<NSE trade no>`):
    // use only saved DB + RFQ records — never DeriData / daily-data APIs.
    if (looksLikeNseRfqTradeNumber(orderNumber)) {
      return this.autofillReceiptPdfOptionsFromSavedRfqData(orderNumber, {
        settlementDate: requestedSettlementDate,
      });
    }

    // CRM order numbers (e.g. MD-DIR-…): shared orderInfo path (may use DeriData
    // only when settlement is overridden or the bond amortises).
    try {
      const orderInfo = await getOrderInfoByRfqNumber(orderNumber);
      return await this.autofillReceiptPdfOptionsFromOrderInfo(
        orderInfo,
        requestedSettlementDate,
      );
    } catch (err) {
      if (
        !(err instanceof AppError) ||
        err.code !== "ORDER_NOT_FOUND"
      ) {
        throw err;
      }
    }

    return this.autofillReceiptPdfOptionsLegacy(orderNumber, {
      settlementDate: requestedSettlementDate,
    });
  }

  /**
   * PDF autofill for NSE RFQ / settle trade numbers.
   * Sources: CRM order (if linked), settle_order, RFQ negotiation, bond master,
   * coupon reference tables, nse_settlement_no. No DeriData / daily-data calls.
   */
  private async autofillReceiptPdfOptionsFromSavedRfqData(
    rfqNumber: string,
    input: { settlementDate?: string | null },
  ): Promise<{
    accruedInterestDays: number;
    settlementNumber: string | null;
    lastInterestPaymentDateRaw: string | null;
    lastInterestPaymentDate: string | null;
    interestPaymentDates: string[] | null;
    settlementDateTime: string | null;
    nonAmortizedBond: boolean;
    amortizedPrincipalPaymentDates: string | null;
    settlementDate: string;
    dealDate: string | null;
    settlementType: number | null;
  }> {
    const requestedSettlementDate =
      typeof input.settlementDate === "string" && input.settlementDate.trim() !== ""
        ? input.settlementDate.trim()
        : null;

    const orderInfo = await getOrderInfoByRfqNumber(rfqNumber);
    const core = mapOrderInfoToReceiptPdfAutofill(orderInfo, {
      settlementDate: requestedSettlementDate,
    });

    if (!core.settlementDate) {
      throw new AppError("Could not resolve a settlement date for this RFQ.", {
        statusCode: HttpStatus.BAD_REQUEST,
        code: "BAD_REQUEST",
      });
    }

    const settlementDt = parseLooseDate(core.settlementDate);
    if (!settlementDt) {
      throw new AppError("Could not resolve a settlement date for this RFQ.", {
        statusCode: HttpStatus.BAD_REQUEST,
        code: "BAD_REQUEST",
      });
    }
    const settlementForCoupons = settlementDateFromYmd(core.settlementDate);
    const settlementYmd =
      toBusinessYmd(core.settlementDate) || core.settlementDate.slice(0, 10);

    const settleOrderKey =
      orderInfo.rfqNumber?.trim() || rfqNumber.trim() || "";
    const settleOrder = settleOrderKey
      ? await this.getRfqByOrderNumber(settleOrderKey)
      : null;

    const bondService = new BondService();
    const bond = await bondService.getBondDetails(orderInfo.bond.isin);
    if (!bond) {
      throw new AppError(`Bond not found for ISIN: ${orderInfo.bond.isin}`, {
        statusCode: HttpStatus.NOT_FOUND,
        code: "BOND_NOT_FOUND",
      });
    }

    const isAmortizingBond = /amort/i.test(String(bond.redemptionType ?? ""));

    let lastInterestPaymentDateRaw: string | null =
      core.lastInterestPaymentDateRaw;
    let lastInterestPaymentDate: string | null = core.lastInterestPaymentDate;
    let interestPaymentDates = core.interestPaymentDates;

    const investorCoupons = await loadInvestorCouponScheduleForPdf(
      bond.isin,
      settlementForCoupons,
    );
    if (investorCoupons.lastInterestPaymentDateRaw) {
      lastInterestPaymentDateRaw = investorCoupons.lastInterestPaymentDateRaw;
      lastInterestPaymentDate = investorCoupons.lastInterestPaymentDate;
    }
    if (investorCoupons.interestPaymentDates.length > 0) {
      interestPaymentDates = investorCoupons.interestPaymentDates;
    }

    const couponMeta = await getLastNextCouponDateBasedOnSettlementDate(
      bond.isin,
      settlementForCoupons,
    );

    if (!lastInterestPaymentDateRaw) {
      const recordYmd =
        couponMeta.recordDate || orderInfo.pricing.recordDate || "";
      const lastOnOrBefore =
        couponMeta.lastCouponDate || orderInfo.date.lastCouponDate || "";
      const nextYmd =
        couponMeta.nextCouponDate || orderInfo.date.nextCouponDate || "";
      const underShut =
        (Boolean(recordYmd) &&
          Boolean(settlementYmd) &&
          Boolean(nextYmd) &&
          settlementYmd >= recordYmd &&
          settlementYmd < nextYmd) ||
        couponMeta.isUnderShutPeriod ||
        (!couponMeta.recordDate &&
          orderInfo.pricing.is_under_surtpriode === true);
      const lastRaw = underShut ? nextYmd || lastOnOrBefore : lastOnOrBefore;
      if (lastRaw) {
        lastInterestPaymentDateRaw = String(lastRaw).slice(0, 10);
        lastInterestPaymentDate = formatLastInterestPaymentDateDisplay(
          settlementDateFromYmd(lastInterestPaymentDateRaw),
        );
      }
    }

    if (!lastInterestPaymentDateRaw && orderInfo.date.lastCouponDate) {
      lastInterestPaymentDateRaw = orderInfo.date.lastCouponDate;
      lastInterestPaymentDate = formatLastInterestPaymentDateDisplay(
        settlementDateFromYmd(lastInterestPaymentDateRaw),
      );
    }

    // Accrual days: saved pricing / orderInfo first, else local shut formula
    // from reference coupon + record dates (no DeriData).
    let accruedInterestDays = Number.isFinite(orderInfo.pricing.interestDays)
      ? Math.round(orderInfo.pricing.interestDays)
      : NaN;

    if (!Number.isFinite(accruedInterestDays) || accruedInterestDays === 0) {
      const recordYmd =
        couponMeta.recordDate || orderInfo.pricing.recordDate || "";
      const nextYmd =
        couponMeta.nextCouponDate || orderInfo.date.nextCouponDate || "";
      // Accrual last coupon is always on/before settlement (not shut-flipped PDF last IP).
      const lastYmd = couponMeta.lastCouponDate || "";
      if (recordYmd && nextYmd && settlementYmd) {
        try {
          const shut = resolveShutPeriod({
            RECORD_DATE: recordYmd,
            NEXT_COUPON_DATE: nextYmd,
            SETTLEMENT_DATE: settlementYmd,
            LAST_COUPON_DATE: lastYmd || undefined,
          });
          accruedInterestDays = shut.accrualDays;
        } catch {
          // leave accruedInterestDays as-is
        }
      }
    }

    if (!Number.isFinite(accruedInterestDays)) {
      accruedInterestDays = Math.max(0, Math.round(core.accruedInterestDays));
    }

    const settlementOverridden =
      requestedSettlementDate != null &&
      requestedSettlementDate !== orderInfo.date.settlementDate;

    let settlementNumber = core.settlementNumber;
    if (settlementOverridden || !settlementNumber) {
      settlementNumber = await resolveSettlementNumberForPdf({
        settlementDateYmd: core.settlementDate,
        settleOrderSettlementNo: settleOrder?.settlementNo,
        metadataSettlementNumber: core.settlementNumber,
      });
    }

    return {
      accruedInterestDays: Number.isFinite(accruedInterestDays)
        ? accruedInterestDays
        : 0,
      settlementNumber,
      lastInterestPaymentDateRaw,
      lastInterestPaymentDate,
      interestPaymentDates,
      settlementDateTime: settleOrder?.payoutTime?.trim() || null,
      nonAmortizedBond: !isAmortizingBond,
      // Amortizing principal schedule needs DeriData cf_rows — omit on RFQ path.
      amortizedPrincipalPaymentDates: null,
      settlementDate: core.settlementDate,
      dealDate: core.dealDate,
      settlementType: core.settlementType,
    };
  }

  private async autofillReceiptPdfOptionsFromOrderInfo(
    orderInfo: Awaited<ReturnType<typeof getOrderInfo>>,
    requestedSettlementDate: string | null,
  ): Promise<{
    accruedInterestDays: number;
    settlementNumber: string | null;
    lastInterestPaymentDateRaw: string | null;
    lastInterestPaymentDate: string | null;
    interestPaymentDates: string[] | null;
    settlementDateTime: string | null;
    nonAmortizedBond: boolean;
    amortizedPrincipalPaymentDates: string | null;
    settlementDate: string;
    dealDate: string | null;
    settlementType: number | null;
  }> {
    const core = mapOrderInfoToReceiptPdfAutofill(orderInfo, {
      settlementDate: requestedSettlementDate,
    });

    if (!core.settlementDate) {
      throw new AppError("Could not resolve a settlement date for this order.", {
        statusCode: HttpStatus.BAD_REQUEST,
        code: "BAD_REQUEST",
      });
    }

    const settlementDt = parseLooseDate(core.settlementDate);
    if (!settlementDt) {
      throw new AppError("Could not resolve a settlement date for this order.", {
        statusCode: HttpStatus.BAD_REQUEST,
        code: "BAD_REQUEST",
      });
    }
    const settlementForCoupons = settlementDateFromYmd(core.settlementDate);

    const settleOrderKey =
      orderInfo.rfqNumber?.trim() || orderInfo.orderId?.trim() || "";
    const settleOrder = settleOrderKey
      ? await this.getRfqByOrderNumber(settleOrderKey)
      : null;

    const bondService = new BondService();
    const bond = await bondService.getBondDetails(orderInfo.bond.isin);
    if (!bond) {
      throw new AppError(`Bond not found for ISIN: ${orderInfo.bond.isin}`, {
        statusCode: HttpStatus.NOT_FOUND,
        code: "BOND_NOT_FOUND",
      });
    }

    const isAmortizingBond = /amort/i.test(String(bond.redemptionType ?? ""));

    let accruedInterestDays = core.accruedInterestDays;
    // Seed from orderInfo mapper first — reference coupon tables are often sparse
    // (missing prior coupons), which makes investor/meta last-IP null.
    let lastInterestPaymentDateRaw: string | null =
      core.lastInterestPaymentDateRaw;
    let lastInterestPaymentDate: string | null = core.lastInterestPaymentDate;
    let interestPaymentDates = core.interestPaymentDates;

    const settlementOverridden =
      requestedSettlementDate != null &&
      requestedSettlementDate !== orderInfo.date.settlementDate;

    // Prefer investor schedule when it can resolve last IP (settlement + record).
    const investorCoupons = await loadInvestorCouponScheduleForPdf(
      bond.isin,
      settlementForCoupons,
    );
    if (investorCoupons.lastInterestPaymentDateRaw) {
      lastInterestPaymentDateRaw = investorCoupons.lastInterestPaymentDateRaw;
      lastInterestPaymentDate = investorCoupons.lastInterestPaymentDate;
    }
    if (investorCoupons.interestPaymentDates.length > 0) {
      interestPaymentDates = investorCoupons.interestPaymentDates;
    }

    // Fallback when reference coupon rows are sparse: derive shut from
    // settlement + record date, then pick last-payout vs upcoming coupon.
    if (!lastInterestPaymentDateRaw) {
      const couponMeta = await getLastNextCouponDateBasedOnSettlementDate(
        bond.isin,
        settlementForCoupons,
      );
      const recordYmd =
        couponMeta.recordDate ||
        orderInfo.pricing.recordDate ||
        "";
      const lastOnOrBefore =
        couponMeta.lastCouponDate || orderInfo.date.lastCouponDate || "";
      const nextYmd =
        couponMeta.nextCouponDate || orderInfo.date.nextCouponDate || "";
      const settlementYmd =
        toBusinessYmd(core.settlementDate) || core.settlementDate.slice(0, 10);
      const underShut =
        (Boolean(recordYmd) &&
          Boolean(settlementYmd) &&
          Boolean(nextYmd) &&
          settlementYmd >= recordYmd &&
          settlementYmd < nextYmd) ||
        couponMeta.isUnderShutPeriod ||
        (!couponMeta.recordDate &&
          orderInfo.pricing.is_under_surtpriode === true);
      const lastRaw = underShut ? nextYmd || lastOnOrBefore : lastOnOrBefore;
      if (lastRaw) {
        lastInterestPaymentDateRaw = String(lastRaw).slice(0, 10);
        lastInterestPaymentDate = formatLastInterestPaymentDateDisplay(
          settlementDateFromYmd(lastInterestPaymentDateRaw),
        );
      }
    }

    if (!lastInterestPaymentDateRaw && orderInfo.date.lastCouponDate) {
      lastInterestPaymentDateRaw = orderInfo.date.lastCouponDate;
      lastInterestPaymentDate = formatLastInterestPaymentDateDisplay(
        settlementDateFromYmd(lastInterestPaymentDateRaw),
      );
    }

    let calcCfRows:
      | Awaited<ReturnType<typeof getBondInfoCalcData>>["calc"]["cf_rows"]
      | undefined;

    const needsBondCalc = settlementOverridden || isAmortizingBond;
    if (needsBondCalc) {
      const settlementDateStr = [
        settlementDt.getFullYear(),
        String(settlementDt.getMonth() + 1).padStart(2, "0"),
        String(settlementDt.getDate()).padStart(2, "0"),
      ].join("-");
      const pricingYield =
        orderInfo.pricing.yieldToMaturity > 0
          ? String(orderInfo.pricing.yieldToMaturity)
          : bond.yield != null && Number.isFinite(Number(bond.yield))
            ? String(bond.yield)
            : bond.buyYield != null && Number.isFinite(Number(bond.buyYield))
              ? String(bond.buyYield)
              : undefined;
      const bondData = await getBondInfoCalcData(orderInfo.bond.isin, {
        settlementDate: settlementDateStr,
        quantity: orderInfo.pricing.quantity,
        yeild: pricingYield,
      });
      calcCfRows = bondData.calc.cf_rows;
      if (settlementOverridden) {
        accruedInterestDays = Number(bondData.calc.accrued_days);
      }
    }

    let settlementNumber = core.settlementNumber;
    if (settlementOverridden || !settlementNumber) {
      settlementNumber = await resolveSettlementNumberForPdf({
        settlementDateYmd: core.settlementDate,
        settleOrderSettlementNo: settleOrder?.settlementNo,
        metadataSettlementNumber: core.settlementNumber,
      });
    }

    const amortizedPrincipalPaymentDates =
      isAmortizingBond && calcCfRows
        ? buildAmortizedPrincipalPaymentDates(
            calcCfRows,
            orderInfo.pricing.quantity,
            Number(bond.faceValue),
          )
        : null;

    return {
      accruedInterestDays: Number.isFinite(accruedInterestDays)
        ? accruedInterestDays
        : 0,
      settlementNumber,
      lastInterestPaymentDateRaw,
      lastInterestPaymentDate,
      interestPaymentDates,
      settlementDateTime: settleOrder?.payoutTime?.trim() || null,
      nonAmortizedBond: !isAmortizingBond,
      amortizedPrincipalPaymentDates,
      settlementDate: core.settlementDate,
      dealDate: core.dealDate,
      settlementType: core.settlementType,
    };
  }

  private async autofillReceiptPdfOptionsLegacy(
    orderNumber: string,
    input: { settlementDate?: string | null },
  ): Promise<{
    accruedInterestDays: number;
    settlementNumber: string | null;
    lastInterestPaymentDateRaw: string | null;
    lastInterestPaymentDate: string | null;
    interestPaymentDates: string[] | null;
    settlementDateTime: string | null;
    nonAmortizedBond: boolean;
    amortizedPrincipalPaymentDates: string | null;
    settlementDate: string;
    dealDate: string | null;
    settlementType: number | null;
  }> {
    // The autofill values (accrued days, settlement no, coupon dates) are all
    // bond + settle-order properties — they don't depend on which customer
    // (or participant) is assigned. So accept either an Order or a raw
    // settle_order row and build a minimal "order-like" view from whichever
    // is available. This unblocks the Generate-PDF page autofill before any
    // counterparty has been assigned.
    const existingOrder = await this.getCustomerByOrderNumber(orderNumber);
    // Match the receipt-PDF flow: the settle_order is keyed by the NSE trade
    // number (reqOrderNumber / metadata.rfqNumber), NOT the CRM order number.
    // Using the raw order number here left `settlementNo` unresolved.
    const settleOrderKey = existingOrder
      ? this.resolveSettleOrderTradeKey(existingOrder)
      : orderNumber;
    const settleOrder = await this.getRfqByOrderNumber(settleOrderKey);

    type OrderLike = {
      isin: string;
      quantity: number;
      unitPrice: number;
      createdAt: Date;
      bondDetails?: unknown;
    };

    let order: OrderLike | null = null;
    if (existingOrder) {
      order = {
        isin: existingOrder.isin,
        quantity: existingOrder.quantity,
        unitPrice: Number(existingOrder.unitPrice),
        createdAt:
          existingOrder.createdAt instanceof Date
            ? existingOrder.createdAt
            : new Date(existingOrder.createdAt),
        bondDetails: existingOrder.bondDetails,
      };
    } else if (settleOrder) {
      order = {
        isin: settleOrder.symbol,
        quantity: Number(settleOrder.modQuantity ?? 0),
        unitPrice: Number(settleOrder.price),
        createdAt:
          settleOrder.createdAt instanceof Date
            ? settleOrder.createdAt
            : new Date(settleOrder.createdAt),
      };
    }

    if (!order) {
      throw new AppError(
        "No order or NSE settle order found for this settlement number.",
        {
          statusCode: HttpStatus.NOT_FOUND,
          code: "ORDER_NOT_FOUND",
        },
      );
    }

    const orderMeta =
      (existingOrder?.metadata as Record<string, unknown> | null) ?? {};
    const pickMetaStr = (v: unknown): string | null => {
      if (v == null) return null;
      const s = String(v).trim();
      return s !== "" ? s : null;
    };

    const {
      dealDateYmd,
      settlementDateYmd: settlementYmd,
      settlementType: settlementTypeNum,
    } = resolveDatesFromOrderPricingSnapshot(order.bondDetails, {
      requestedSettlementDate:
        typeof input.settlementDate === "string" ? input.settlementDate : null,
    });

    const settlementDt = parseLooseDate(settlementYmd);
    if (!settlementDt) {
      throw new AppError("Could not resolve a settlement date for this order.", {
        statusCode: HttpStatus.BAD_REQUEST,
        code: "BAD_REQUEST",
      });
    }
    const settlementForCoupons = settlementDateFromYmd(settlementYmd);

    // Prefer checkout DeriData pricing snapshot on the order — never bonds-table calc columns.
    const orderSnap = orderPricingSnapshot(order.bondDetails);
    const bondService = new BondService();
    const bond = await bondService.getBondDetails(order.isin);
    if (!bond) {
      throw new AppError(`Bond not found for ISIN: ${order.isin}`, {
        statusCode: HttpStatus.NOT_FOUND,
        code: "BOND_NOT_FOUND",
      });
    }

    // Amortising vs bullet is a pure bond-master property (DeriData
    // `redemption_type`). Bullet is the overwhelming default → non-amortized.
    const isAmortizingBond = /amort/i.test(String(bond.redemptionType ?? ""));

    let accruedInterestDays =
      orderSnap?.noOfAccrualDays != null && Number.isFinite(orderSnap.noOfAccrualDays)
        ? Math.round(orderSnap.noOfAccrualDays)
        : NaN;

    // Run the DeriData calc when we still need accrued days OR when the bond
    // amortises (we read the principal cashflow rows to build the schedule).
    let calcCfRows:
      | Awaited<ReturnType<typeof getBondInfoCalcData>>["calc"]["cf_rows"]
      | undefined;
    if (!Number.isFinite(accruedInterestDays) || isAmortizingBond) {
      const settlementDateStr = [
        settlementDt.getFullYear(),
        String(settlementDt.getMonth() + 1).padStart(2, "0"),
        String(settlementDt.getDate()).padStart(2, "0"),
      ].join("-");
      const pricingYield =
        orderSnap?.yield != null && Number.isFinite(orderSnap.yield)
          ? String(orderSnap.yield)
          : bond.yield != null && Number.isFinite(Number(bond.yield))
            ? String(bond.yield)
            : bond.buyYield != null && Number.isFinite(Number(bond.buyYield))
              ? String(bond.buyYield)
              : undefined;
      const bondData = await getBondInfoCalcData(order.isin, {
        settlementDate: settlementDateStr,
        quantity: order.quantity,
        yeild: pricingYield,
      });
      calcCfRows = bondData.calc.cf_rows;
      if (!Number.isFinite(accruedInterestDays)) {
        accruedInterestDays = Number(bondData.calc.accrued_days);
      }
    }

    const investorCoupons = await loadInvestorCouponScheduleForPdf(
      bond.isin,
      settlementForCoupons,
    );
    const pricingLastCoupon = lastCouponDatesFromOrderPricingSnapshot(order.bondDetails);

    // Settlement number is keyed by settlement date in `nse_settlement_no`.
    const settlementNumber = await resolveSettlementNumberForPdf({
      settlementDateYmd: settlementYmd,
      settleOrderSettlementNo: settleOrder?.settlementNo,
      metadataSettlementNumber:
        pickMetaStr(orderMeta.settlementNumber) ?? pickMetaStr(orderMeta.settlementNo),
    });

    // For amortising bonds, turn the principal cashflow rows into the
    // "DD-MMM-YYYY pct%" schedule the receipt renders in place of "100.0000%".
    const amortizedPrincipalPaymentDates =
      isAmortizingBond && calcCfRows
        ? buildAmortizedPrincipalPaymentDates(
          calcCfRows,
          order.quantity,
          Number(bond.faceValue),
        )
        : null;

    return {
      accruedInterestDays: Number.isFinite(accruedInterestDays)
        ? accruedInterestDays
        : 0,
      settlementNumber,
      lastInterestPaymentDateRaw:
        investorCoupons.lastInterestPaymentDateRaw ??
        pricingLastCoupon.lastInterestPaymentDateRaw,
      lastInterestPaymentDate:
        investorCoupons.lastInterestPaymentDate ??
        pricingLastCoupon.lastInterestPaymentDate,
      interestPaymentDates:
        investorCoupons.interestPaymentDates.length > 0
          ? investorCoupons.interestPaymentDates
          : null,
      settlementDateTime: settleOrder?.payoutTime?.trim() || null,
      nonAmortizedBond: !isAmortizingBond,
      amortizedPrincipalPaymentDates,
      settlementDate: settlementYmd,
      dealDate: dealDateYmd,
      settlementType: settlementTypeNum,
    };
  }

  async upsertReceiptPdfOptions(
    orderNumber: string,
    data: {
      accruedInterestDays?: number | null;
      settlementNumber?: string | null;
      settlementDateTime?: string | null;
      lastInterestPaymentDateRaw?: string | null;
      lastInterestPaymentDate?: string | null;
      interestPaymentDates?: string | null;
      nonAmortizedBond?: boolean;
      amortizedPrincipalPaymentDates?: string | null;
    },
  ) {
    const opt = <T>(v: T | undefined | null) =>
      v === undefined ? undefined : v;
    return db.dataBase.crmOrderReceiptPdfOptions.upsert({
      where: { orderNumber },
      create: {
        orderNumber,
        accruedInterestDays: opt(data.accruedInterestDays) ?? undefined,
        settlementNumber: opt(data.settlementNumber) ?? undefined,
        settlementDateTime: opt(data.settlementDateTime) ?? undefined,
        lastInterestPaymentDateRaw: opt(data.lastInterestPaymentDateRaw) ?? undefined,
        lastInterestPaymentDate: opt(data.lastInterestPaymentDate) ?? undefined,
        interestPaymentDates: opt(data.interestPaymentDates) ?? undefined,
        nonAmortizedBond: data.nonAmortizedBond ?? true,
        amortizedPrincipalPaymentDates:
          opt(data.amortizedPrincipalPaymentDates) ?? undefined,
      },
      update: {
        accruedInterestDays: opt(data.accruedInterestDays),
        settlementNumber: opt(data.settlementNumber),
        settlementDateTime: opt(data.settlementDateTime),
        lastInterestPaymentDateRaw: opt(data.lastInterestPaymentDateRaw),
        lastInterestPaymentDate: opt(data.lastInterestPaymentDate),
        interestPaymentDates: opt(data.interestPaymentDates),
        nonAmortizedBond: data.nonAmortizedBond,
        amortizedPrincipalPaymentDates: opt(data.amortizedPrincipalPaymentDates),
      },
    });
  }

  async getCustomerByOrderNumber(orderNumber: string) {
    const order = await db.dataBase.order.findFirst({
      where: {
        OR: [
          { reqOrderNumber: { equals: orderNumber } },
          { orderNumber: { equals: orderNumber } },
        ],
      },
      include: {
        customerProfile: {
          include: {
            bankAccounts: true,
            dematAccounts: true,
            panCard: true,
            aadhaarCard: true,
          }
        }
      }
    });

    if (!order) return null;

    // For participant-counterparty orders (customerProfileId null,
    // linkedRfqParticipantCode set) we hydrate the participant info so the
    // CRM page can render an "Assigned to NSE participant" card with name,
    // contact, bank and demat data instead of an empty customer block.
    if (!order.customerProfileId && order.linkedRfqParticipantCode) {
      const participantInfo =
        await db.dataBase.nseRfqParticipantInfoModel.findUnique({
          where: { code: order.linkedRfqParticipantCode },
          include: {
            bankAccounts: { orderBy: [{ isDefault: "desc" }, { id: "asc" }] },
            dematAccounts: { orderBy: [{ isDefault: "desc" }, { id: "asc" }] },
          },
        });
      return Object.assign(order, { rfqParticipantInfo: participantInfo });
    }

    return Object.assign(order, { rfqParticipantInfo: null });
  }


  async createOrderFromRfq(
    orderNumber: string,
    customerId: number,
    options?: { orderSide?: "BUY" | "SELL", skipExistsCheck?: boolean },
  ) {
    if (!options?.skipExistsCheck) {
      const existingOrder = await this.getCustomerByOrderNumber(orderNumber);
      if (existingOrder) {
        throw new Error(`Customer already exists for order number ${orderNumber}`);
      }
    }

    const customerProfile = await db.dataBase.customerProfileDataModel.findUnique({
      where: { id: customerId },
      select: { kycStatus: true },
    });
    if (!customerProfile) {
      throw new Error("Customer not found");
    }
    if (customerProfile.kycStatus !== "VERIFIED") {
      throw new Error("Only customers with verified KYC can be assigned to an order");
    }

    const rfq = await this.getRfqByOrderNumber(orderNumber);

    if (!rfq) {
      throw new Error(`Rfq not found for order number ${orderNumber}`);
    }



    const bondDetails = await db.dataBase.bonds.findFirst({
      where: {
        isin: rfq.symbol,
      },
    });

    if (!bondDetails) {
      throw new Error(`Bond details not found for symbol ${rfq.symbol}`);
    }

    const negotation = await db.dataBase.rFQNegotiation.findFirst({
      where: {
        tradeNumber: rfq.orderNumber,
      },
    });


    if (!negotation) {
      throw new Error(`Negotiation not found for order number ${rfq.orderNumber}`);
    }

    const assignDates = await resolveAssignOrderDates(rfq, negotation);
    const dealDate = assignDates.dealDate;

    const resolveAction = (): "BUY" | "SELL" | "BOTH" => {
      if (options?.orderSide === "BUY" || options?.orderSide === "SELL") {
        return options.orderSide;
      }
      if (negotation.buySell === "B") return "BUY";
      if (negotation.buySell === "S") return "SELL";
      return "BOTH";
    };
    const action = resolveAction();
    const idAction = action === "BOTH" ? "BUY" : action;

    const tempOrderNumber = `MD-ASSIST-TEMP-${crypto.randomUUID().replace(/-/g, "").slice(0, 32)}`;

    const order = await db.dataBase.order.create({
      data: {
        bondDetails: bondDetails,
        faceValue: bondDetails.faceValue,
        quantity: Number(rfq.modQuantity) || 0,
        unitPrice: rfq.price.toNumber(),
        isin: bondDetails.isin,
        bondName: bondDetails.bondName,
        orderNumber: tempOrderNumber,
        stampDuty: negotation.acceptedAccruedInterest || 0,
        subTotal: negotation.acceptedConsideration || 0,
        totalAmount: negotation.acceptedConsideration || 0,
        customerProfileId: customerId,
        paymentId: rfq.orderNumber,
        paymentOrderId: rfq.orderNumber,
        reqOrderNumber: rfq.orderNumber,
        metadata: buildAssignOrderDateMetadata(
          { rfqNumber: rfq.orderNumber },
          assignDates,
        ) as Prisma.InputJsonValue,
        paymentStatus: PaymentStatus.PENDING,
        paymentProvider: "CUSTOM",
        status: OrderStatus.SETTLED,
        customerBonds: {
          create: {
            customerProfileId: customerId,
            isin: bondDetails.isin,
            bondName: bondDetails.bondName,
            faceValue: bondDetails.faceValue,
            quantity: Number(rfq.modQuantity) || 0,
            purchasePrice: rfq.price.toNumber(),
            purchaseDate: assignDates.purchaseDate,
          },
        },
      },
    });

    const issuerName = bondDetails.bondName || bondDetails.instrumentName || "";

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

    const updated = await db.dataBase.order.update({
      where: { id: order.id },
      data: {
        orderNumber: finalOrderNumber,
        metadata: buildAssignOrderDateMetadata(
          {
            ...((order.metadata as Record<string, unknown>) ?? {}),
            dealId,
            rfqNumber: rfq.orderNumber,
            clientOrderSide: idAction,
          },
          assignDates,
        ) as Prisma.InputJsonValue,
      },
    });
    return updated;
  }

  /**
   * Build a `CustomerByIdPayload`-shaped shim from an NSE RFQ participant
   * info row. Used by both the Order-anchored participant flow and the
   * legacy `settle_order` fallback so PDF templates don't need to branch.
   * Only fields actually read by `OrderPdf` / `DealPdf` need to be present;
   * the rest are best-effort defaults.
   */
  private buildRfqParticipantShimUser(participant: {
    id: number;
    code: string;
    nameOverride: string | null;
    emailList: string[];
    mobileList: string[];
    address: string | null;
    address2: string | null;
    address3: string | null;
    stateCode: string | null;
    panNo: string | null;
    dobDoi?: string | null;
    bankAccounts: Array<{
      id: number;
      bankName: string;
      bankIFSC: string;
      bankAccountNo: string;
      isDefault: boolean;
    }>;
    dematAccounts: Array<{
      id: number;
      dpType: string;
      dpId: string | null;
      benId: string;
      isDefault: boolean;
    }>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }): any {
    const code = participant.code;
    const displayName = (participant.nameOverride ?? code).trim() || code;
    return {
      id: -participant.id,
      userName: code,
      firstName: displayName,
      middleName: null,
      lastName: "",
      legalEntityName: displayName,
      emailAddress: participant.emailList?.[0] ?? "",
      phoneNo: participant.mobileList?.[0] ?? "",
      whatsAppNo: null,
      gender: "OTHER",
      userType: "CORPORATE",
      kycStatus: "VERIFIED",
      kraStatus: "VERIFIED",
      aadhaarCard: null,
      permanentAddress: null,
      currentAddress: participant.address
        ? {
          address: participant.address,
          address2: participant.address2 ?? "",
          address3: participant.address3 ?? "",
          stateCode: participant.stateCode ?? null,
        }
        : null,
      personalInformation: participant.dobDoi?.trim()
        ? { dateOfBirth: participant.dobDoi.trim() }
        : null,
      riskProfile: { id: 0, data: [] },
      panCard: participant.panNo ? { panCardNo: participant.panNo } : null,
      bankAccounts: participant.bankAccounts.map((b, idx, arr) => ({
        id: -b.id,
        accountHolderName: displayName,
        bankAccountType: "SAVINGS",
        accountNumber: b.bankAccountNo,
        ifscCode: b.bankIFSC,
        bankName: b.bankName,
        branch: "",
        isPrimary:
          b.isDefault || (idx === 0 && !arr.some((x) => x.isDefault)),
        isVerified: true,
      })),
      dematAccounts: participant.dematAccounts.map((d, idx, arr) => ({
        id: -d.id,
        depositoryName: d.dpType,
        dpId: d.dpId ?? "",
        clientId: d.benId,
        accountType: "SOLO",
        depositoryParticipantName: d.dpType,
        accountHolderName: displayName,
        isPrimary:
          d.isDefault || (idx === 0 && !arr.some((x) => x.isDefault)),
        isVerified: true,
      })),
      avatar: null,
      isAFatcaCustomer: false,
      allowSEBITerms: true,
      isAPep: false,
      utility: {},
    };
  }

  /**
   * Resolves the user/bank/demat context for an order PDF.
   *
   * Three flows are supported:
   *
   * 1. **Customer flow** — the `orderNumber` matches a Meradhan `Order` row
   *    with `customerProfileId` set; we return the customer profile and the
   *    customer's primary bank/demat.
   *
   * 2. **RFQ-participant Order flow** — preferred. The CRM
   *    "Assign as NSE participant" action creates a Meradhan `Order` row
   *    with `customerProfileId = null` and `linkedRfqParticipantCode = X`.
   *    Quantity/consideration are stored on the Order itself; participant
   *    info populates the user shim.
   *
   * 3. **Legacy `settle_order` fallback** — no Meradhan order exists, but
   *    the NSE `settle_order` row carries `linkedRfqParticipantCode`
   *    (stamped by the `asign-order.ts` script before flow #2 existed).
   *    We synthesise an order-like payload from `settle_order`.
   *
   * Throws `AppError NOT_FOUND` when none of the flows resolve.
   */
  private async resolveOrderPdfActor(orderNumber: string): Promise<{
    kind: "customer" | "rfqParticipant";
    /// Shape compatible with what the PDF pipeline reads from a Meradhan
    /// `order` row (orderNumber/reqOrderNumber/metadata/quantity/totalAmount/
    /// stampDuty/createdAt/isin). For the participant flow this is built
    /// from the matching `settle_order`.
    orderForPdf: {
      orderNumber: string;
      reqOrderNumber: string | null;
      customerProfileId: number | null;
      isin: string;
      quantity: number;
      /** Order pricing snapshot — used for PDF yield (`pricing.yield`). */
      bondDetails?: unknown;
      totalAmount: number;
      stampDuty: number;
      metadata: unknown;
      createdAt: Date;
    };
    /// Loose `CustomerByIdPayload`-like shape consumed by `OrderPdf` /
    /// `DealPdf`. For the participant flow this is a shim built from the
    /// participant info row.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user: any;
    primaryBank: {
      bankName: string | null;
      ifscCode: string | null;
      accountNumber: string | null;
    } | null;
    primaryDemat: {
      dpId: string | null;
      clientId: string | null;
      depositoryParticipantName: string | null;
    } | null;
    rfqParticipantCode?: string;
  }> {
    // 1. Try the Meradhan-customer order path first.
    const customerOrder = await this.getCustomerByOrderNumber(orderNumber);
    if (customerOrder && customerOrder.customerProfileId != null) {
      const customerProfileId = customerOrder.customerProfileId;
      const customerRepo = new CustomerProfileRepo();
      const user = await customerRepo.getFullCustomerProfile(
        customerProfileId,
      );
      const primaryBank = await db.dataBase.customersBankAccountModel.findFirst({
        where: {
          customerProfileDataModelId: customerProfileId,
          isPrimary: true,
        },
      });
      const primaryDemat = await db.dataBase.customersDematAccountModel.findFirst({
        where: {
          customerProfileDataModelId: customerProfileId,
          isPrimary: true,
        },
      });
      return {
        kind: "customer",
        // Normalise `Decimal` columns to `number` so the helper's return
        // type is a uniform shape that the participant branch can also
        // satisfy. Downstream still wraps these with `Number(...)`.
        orderForPdf: {
          orderNumber: customerOrder.orderNumber,
          reqOrderNumber: customerOrder.reqOrderNumber,
          customerProfileId,
          isin: customerOrder.isin,
          quantity: customerOrder.quantity,
          bondDetails: customerOrder.bondDetails,
          totalAmount: Number(customerOrder.totalAmount),
          stampDuty: Number(customerOrder.stampDuty),
          metadata: customerOrder.metadata,
          createdAt: customerOrder.createdAt,
        },
        user,
        primaryBank: primaryBank
          ? {
            bankName: primaryBank.bankName,
            ifscCode: primaryBank.ifscCode,
            accountNumber: primaryBank.accountNumber,
          }
          : null,
        primaryDemat: primaryDemat
          ? {
            dpId: primaryDemat.dpId,
            clientId: primaryDemat.clientId,
            depositoryParticipantName: primaryDemat.depositoryParticipantName,
          }
          : null,
      };
    }

    // 2a. Participant-flow Order row already exists (preferred path —
    //     created by `assignRfqParticipantToSettleOrder`). The Order
    //     itself carries quantity / consideration / stamp duty stored at
    //     assignment time, so the PDF reads from the real Order row
    //     rather than re-deriving from `settle_order`.
    if (
      customerOrder &&
      customerOrder.customerProfileId == null &&
      customerOrder.linkedRfqParticipantCode
    ) {
      const participantInfo =
        customerOrder.rfqParticipantInfo ??
        (await db.dataBase.nseRfqParticipantInfoModel.findUnique({
          where: { code: customerOrder.linkedRfqParticipantCode },
          include: { bankAccounts: true, dematAccounts: true },
        }));
      if (!participantInfo) {
        throw new AppError(
          `RFQ participant info not found for code "${customerOrder.linkedRfqParticipantCode}".`,
          { statusCode: HttpStatus.NOT_FOUND, code: "ORDER_NOT_FOUND" },
        );
      }

      const defaultBank =
        participantInfo.bankAccounts?.find((b) => b.isDefault) ??
        participantInfo.bankAccounts?.[0] ??
        null;
      const defaultDemat =
        participantInfo.dematAccounts?.find((d) => d.isDefault) ??
        participantInfo.dematAccounts?.[0] ??
        null;

      const user = this.buildRfqParticipantShimUser(participantInfo);

      return {
        kind: "rfqParticipant",
        orderForPdf: {
          orderNumber: customerOrder.orderNumber,
          reqOrderNumber: customerOrder.reqOrderNumber,
          customerProfileId: null,
          isin: customerOrder.isin,
          quantity: customerOrder.quantity,
          bondDetails: customerOrder.bondDetails,
          totalAmount: Number(customerOrder.totalAmount),
          stampDuty: Number(customerOrder.stampDuty),
          metadata: customerOrder.metadata,
          createdAt: customerOrder.createdAt,
        },
        user,
        primaryBank: defaultBank
          ? {
            bankName: defaultBank.bankName,
            ifscCode: defaultBank.bankIFSC,
            accountNumber: defaultBank.bankAccountNo,
          }
          : null,
        primaryDemat: defaultDemat
          ? {
            dpId: defaultDemat.dpId,
            clientId: defaultDemat.benId,
            depositoryParticipantName: String(defaultDemat.dpType),
          }
          : null,
        rfqParticipantCode: participantInfo.code,
      };
    }

    // 2b. Legacy fallback — `settle_order` tagged with an RFQ participant
    //     by the `asign-order.ts` script before the Order-anchoring flow
    //     existed. Synthesise an order-like payload from `settle_order`
    //     so existing tagged orders keep rendering.
    const settleOrder = await db.dataBase.settleOrderModel.findFirst({
      where: { orderNumber },
    });
    if (!settleOrder || !settleOrder.linkedRfqParticipantCode) {
      throw new AppError(
        "No order found for this settlement. Assign a customer first.",
        { statusCode: HttpStatus.NOT_FOUND, code: "ORDER_NOT_FOUND" },
      );
    }

    const participant =
      await db.dataBase.nseRfqParticipantInfoModel.findUnique({
        where: { code: settleOrder.linkedRfqParticipantCode },
        include: { bankAccounts: true, dematAccounts: true },
      });
    if (!participant) {
      throw new AppError(
        `RFQ participant info not found for code "${settleOrder.linkedRfqParticipantCode}". Add an entry via /dashboard/rfqs/nse/rfq-participants first.`,
        { statusCode: HttpStatus.NOT_FOUND, code: "ORDER_NOT_FOUND" },
      );
    }

    // Prefer the explicit `isDefault` row; otherwise fall back to the first.
    const defaultBank =
      participant.bankAccounts.find((b) => b.isDefault) ??
      participant.bankAccounts[0] ??
      null;
    const defaultDemat =
      participant.dematAccounts.find((d) => d.isDefault) ??
      participant.dematAccounts[0] ??
      null;

    // Infer which side our participant is on so the PDF can show BUY/SELL
    // consistently with the customer flow. Best-effort: leave undefined if
    // the participant code is not recorded on either side of the trade.
    const code = participant.code;
    const isBuySide =
      String(settleOrder.buyParticipantLoginId ?? "").trim() === code;
    const isSellSide =
      String(settleOrder.sellParticipantLoginId ?? "").trim() === code;
    const clientOrderSide: "BUY" | "SELL" | undefined = isBuySide
      ? "BUY"
      : isSellSide
        ? "SELL"
        : undefined;

    const orderForPdf = {
      orderNumber: settleOrder.orderNumber,
      reqOrderNumber: null,
      customerProfileId: null,
      isin: settleOrder.symbol ?? "",
      quantity:
        settleOrder.modQuantity != null ? Number(settleOrder.modQuantity) : 0,
      totalAmount: Number(
        settleOrder.modConsideration ?? settleOrder.value ?? 0,
      ),
      stampDuty: Number(settleOrder.stampDutyAmount ?? 0),
      metadata: {
        rfqNumber: settleOrder.orderNumber,
        clientOrderSide,
        isRfqParticipant: true,
        participantCode: code,
      } as Record<string, unknown>,
      createdAt: settleOrder.createdAt ?? new Date(),
    };

    const userShim = this.buildRfqParticipantShimUser(participant);

    return {
      kind: "rfqParticipant",
      orderForPdf,
      user: userShim,
      primaryBank: defaultBank
        ? {
          bankName: defaultBank.bankName,
          ifscCode: defaultBank.bankIFSC,
          accountNumber: defaultBank.bankAccountNo,
        }
        : null,
      primaryDemat: defaultDemat
        ? {
          dpId: defaultDemat.dpId ?? null,
          clientId: defaultDemat.benId,
          depositoryParticipantName: defaultDemat.dpType,
        }
        : null,
      rfqParticipantCode: code,
    };
  }

  /**
   * Builds the CRM order receipt PDF (settlement / RFQ) as a buffer.
   *
   * Resolves the actor for `orderNumber` using {@link resolveOrderPdfActor}
   * so the PDF works for both Meradhan customers and external RFQ
   * participants (settle orders stamped by `asign-order.ts`).
   *
   * @throws AppError NOT_FOUND when order or bond is missing
   */
  async generateOrderReceiptPdfBuffer(
    orderNumber: string,
    pdfQuery: Record<string, string | undefined>,
  ): Promise<{ buffer: Buffer; filename: string }> {
    const actor = await this.resolveOrderPdfActor(orderNumber);
    const order = actor.orderForPdf;
    const user = actor.user;
    const getUserPrimaryBankAccount = actor.primaryBank;
    const primaryDematAccount = actor.primaryDemat;

    const bondService = new BondService();
    const bond = await bondService.getBondDetails(order.isin);
    if (!bond) {
      throw new AppError(`Bond not found for ISIN: ${order.isin}`, {
        statusCode: HttpStatus.NOT_FOUND,
        code: "BOND_NOT_FOUND",
      });
    }

    const settleOrder = await this.getRfqByOrderNumber(
      this.resolveSettleOrderTradeKey(order),
    );

    const negotation = await db.dataBase.rFQNegotiation.findFirst({
      where: {
        tradeNumber: settleOrder?.orderNumber,
      },
    });

    const metadata = (order.metadata as Record<string, unknown> | null) ?? {};
    const rfqDetails = await resolveRfqMasterSavedResponse({
      negotiationRfqNumber: negotation?.rfqNumber,
      metadataRfqNumber:
        typeof metadata.rfqNumber === "string" ? metadata.rfqNumber : null,
      settleTradeNumber: settleOrder?.orderNumber,
    });
    const { dealDate: dealDateFromSnapshot, settlementDateYmd: snapshotSettlementYmd } =
      resolveDatesFromOrderPricingSnapshot(order.bondDetails, {
        requestedDealDate: pdfQuery.dealDate ?? null,
        requestedSettlementDate: pdfQuery.settlementDate ?? null,
      });
    const orderDateForPdf = resolveOrderDateTimeFromRfqMaster(
      rfqDetails,
      dealDateFromSnapshot,
    );
    // Deal / settlement calendar labels: exact RFQ master strings when present
    // (e.g. "22-Jul-2026" / "23-Jul-2026"). Query overrides are for calc only.
    const dealDateDisplay =
      rfqDetails?.date?.trim() ||
      (typeof pdfQuery.dealDate === "string" && pdfQuery.dealDate.trim()) ||
      null;
    const settlementDateDisplay =
      rfqDetails?.settlementDate?.trim() ||
      (typeof pdfQuery.settlementDate === "string" &&
        pdfQuery.settlementDate.trim()) ||
      null;
    const resolvedSettlementDate =
      toBusinessYmd(
        typeof pdfQuery.settlementDate === "string"
          ? pdfQuery.settlementDate
          : null,
      ) ||
      toBusinessYmd(settlementDateDisplay) ||
      snapshotSettlementYmd;
    const [bankName, dpName] = await Promise.all([
      settleOrder?.ifscCode
        ? fetchBankNameFromIfsc(settleOrder.ifscCode)
        : Promise.resolve(null),
      settleOrder?.dpId ? Promise.resolve(getDpName(settleOrder.dpId)) : Promise.resolve(undefined),
    ]);

    const accessType: Record<string, string> = {
      "1": `One to Many (OTM) on RFQ Platform of the Exchange`,
      "2": `One to One (OTO) on RFQ Platform of the Exchange`,
      "3": `Inter Scheme Transfer (IST) on RFQ Platform of the Exchange`,
    };

    const accessKey = rfqDetails?.access != null ? String(rfqDetails.access) : undefined;
    const accessTypeText = accessKey ? accessType[accessKey] : undefined;

    const interestSchedule = getInterestPaymentSchedule({
      orderDate: orderDateForPdf,
      maturityDate: bond.maturityDate ?? null,
      interestPaymentFrequency: bond.interestPaymentFrequency,
      paymentDayOfMonth: 20,
      nextCouponDate:
        bond.nextCouponDate != null && String(bond.nextCouponDate).trim() !== ""
          ? new Date(bond.nextCouponDate)
          : undefined,
    });

    const accruedInterestDaysParam =
      pdfQuery.accruedInterestDays != null ? Number(pdfQuery.accruedInterestDays) : undefined;
    const settlementNumberParam =
      typeof pdfQuery.settlementNumber === "string" && pdfQuery.settlementNumber.trim() !== ""
        ? pdfQuery.settlementNumber.trim()
        : undefined;
    const settlementDateTimeParam =
      typeof pdfQuery.settlementDateTime === "string" && pdfQuery.settlementDateTime.trim() !== ""
        ? pdfQuery.settlementDateTime.trim()
        : undefined;
    const lastInterestPaymentDateParam =
      typeof pdfQuery.lastInterestPaymentDate === "string" &&
        pdfQuery.lastInterestPaymentDate.trim() !== ""
        ? pdfQuery.lastInterestPaymentDate.trim()
        : undefined;
    const interestPaymentDatesParam =
      typeof pdfQuery.interestPaymentDates === "string" && pdfQuery.interestPaymentDates.trim() !== ""
        ? pdfQuery.interestPaymentDates
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
        : undefined;
    const nonAmortizedBondParam = pdfQuery.nonAmortizedBond === "false" ? false : true;
    const amortizedPrincipalPaymentDatesParam =
      typeof pdfQuery.amortizedPrincipalPaymentDates === "string" &&
        pdfQuery.amortizedPrincipalPaymentDates.trim() !== ""
        ? pdfQuery.amortizedPrincipalPaymentDates.trim()
        : undefined;

    const pdfFinancials = buildPdfFinancialFields(
      order,
      settleOrder,
      accruedInterestDaysParam,
    );

    const resolvedSettlementNumber = await resolveSettlementNumberForPdf({
      settlementDateYmd: resolvedSettlementDate,
      requestedSettlementNumber: settlementNumberParam,
      settleOrderSettlementNo: settleOrder?.settlementNo,
      metadataSettlementNumber:
        (typeof metadata.settlementNumber === "string" && metadata.settlementNumber.trim()) ||
        (typeof metadata.settlementNo === "string" && metadata.settlementNo.trim()) ||
        null,
    });

    const buffer = await generateOrderPdfBuffer({
      user,
      orderId: order.orderNumber,
      bond,
      qun: pdfFinancials.quantity,
      isReleased: true,
      orderData: {
        createdAt: orderDateForPdf.toISOString(),
        subTotal: pdfFinancials.subTotal,
        stampDuty: pdfFinancials.stampDuty,
        totalAmount: pdfFinancials.totalConsideration,
        price: pdfFinancials.price,
        bondDetails: order.bondDetails as { pricing?: Record<string, unknown> } | null,
        metadata: {
          dealId: (metadata.dealId as string) ?? undefined,
          clientOrderSide: (metadata.clientOrderSide as "BUY" | "SELL") ?? undefined,
          ...(actor.kind === "rfqParticipant" ? { isRfqParticipant: true } : {}),
          rfqNumber: (metadata.rfqNumber as string) ?? negotation?.tradeNumber ?? undefined,
          orderType: accessTypeText ?? "One To One (OTO) on RFQ Platform of the Exchange",
          interestPaymentDates:
            interestPaymentDatesParam?.length
              ? interestPaymentDatesParam
              : interestSchedule.dates.length > 0
                ? interestSchedule.dates
                : undefined,
          interestPaymentFrequencyLabel: interestSchedule.frequencyLabel,
          settlementOrderNumber: negotation?.rfqNumber ?? settleOrder?.orderNumber ?? undefined,
          dealDate: dealDateDisplay ?? undefined,
          settlementDate: settlementDateDisplay ?? resolvedSettlementDate,
          payoutTime: settleOrder?.payoutTime?.trim() || settlementDateTimeParam || undefined,
          settlementType: rfqDetails?.settlementType ?? 0,
          valueDate: bond.maturityDate
            ? new Date(bond.maturityDate).toISOString()
            : undefined,
          accruedInterest: pdfFinancials.accruedInterest,
          accruedInterestDays: pdfFinancials.accruedInterestDays,
          settlementNumber: resolvedSettlementNumber ?? undefined,
          settlementDateTime: settlementDateTimeParam,
          lastInterestPaymentDate: lastInterestPaymentDateParam,
          nonAmortizedBond: nonAmortizedBondParam,
          amortizedPrincipalPaymentDates: amortizedPrincipalPaymentDatesParam,
          settlementBank: settleOrder
            ? {
              bankName: getUserPrimaryBankAccount?.bankName ?? bankName ?? undefined,
              ifscCode: getUserPrimaryBankAccount?.ifscCode ?? settleOrder.ifscCode ?? undefined,
              accountNo: getUserPrimaryBankAccount?.accountNumber ?? settleOrder.accountNo ?? undefined,
            }
            : undefined,
          settlementDemat: settleOrder
            ? {
              dpName: primaryDematAccount?.depositoryParticipantName ?? dpName ?? undefined,
              dpId: primaryDematAccount?.dpId ?? settleOrder.dpId ?? undefined,
              benId: primaryDematAccount?.clientId ?? settleOrder.benId ?? undefined,
            }
            : undefined,
          settleOrder: settleOrder
            ? {
              id: settleOrder.id,
              orderNumber: settleOrder.orderNumber,
              symbol: settleOrder.symbol,
              buySell: negotation?.buySell,
              buyParticipantLoginId: settleOrder.buyParticipantLoginId,
              sellParticipantLoginId: settleOrder.sellParticipantLoginId,
              buyerRefNo: settleOrder.buyerRefNo,
              sellerRefNo: settleOrder.sellerRefNo,
              buyBackofficeLoginId: settleOrder.buyBackofficeLoginId,
              sellBackofficeLoginId: settleOrder.sellBackofficeLoginId,
              buyBrokerLoginId: settleOrder.buyBrokerLoginId,
              sellBrokerLoginId: settleOrder.sellBrokerLoginId,
              source: settleOrder.source,
              modSettleDate: settleOrder.modSettleDate,
              modQuantity: settleOrder.modQuantity,
              modAccrInt: settleOrder.modAccrInt,
              modConsideration: settleOrder.modConsideration,
              settlementNo: settleOrder.settlementNo,
              stampDutyAmount: settleOrder.stampDutyAmount,
              stampDutyBearer: settleOrder.stampDutyBearer,
              buyerFundPayinObligation: settleOrder.buyerFundPayinObligation,
              sellerFundPayoutObligation: settleOrder.sellerFundPayoutObligation,
              fundPayinRefId: settleOrder.fundPayinRefId,
              settleStatus: settleOrder.settleStatus,
              secPayinQuantity: settleOrder.secPayinQuantity,
              secPayinRemarks: settleOrder.secPayinRemarks,
              secPayinTime: settleOrder.secPayinTime,
              fundsPayinAmount: settleOrder.fundsPayinAmount,
              fundsPayinRemarks: settleOrder.fundsPayinRemarks,
              fundsPayinTime: settleOrder.fundsPayinTime,
              payoutRemarks: settleOrder.payoutRemarks,
              payoutTime: settleOrder.payoutTime,
              ifscCode: getUserPrimaryBankAccount?.ifscCode ?? settleOrder.ifscCode ?? undefined,
              accountNo: getUserPrimaryBankAccount?.accountNumber ?? settleOrder.accountNo ?? undefined,
              utrNumber: settleOrder.utrNumber,
              dpId: primaryDematAccount?.dpId ?? settleOrder.dpId ?? undefined,
              benId: primaryDematAccount?.clientId ?? settleOrder.benId ?? undefined,
            }
            : undefined,
        },
      },
    });

    return {
      buffer,
      filename: `order-receipt-${order.orderNumber}.pdf`,
    };
  }

  /**
   * Builds the CRM deal sheet PDF (draft / pre-settlement) as a buffer.
   * @throws AppError NOT_FOUND when order or bond is missing
   */
  async generateDealSheetPdfBuffer(
    orderNumber: string,
    pdfQuery: Record<string, string | undefined>,
  ): Promise<{ buffer: Buffer; filename: string }> {
    const actor = await this.resolveOrderPdfActor(orderNumber);
    const order = actor.orderForPdf;
    const user = actor.user;

    const bondService = new BondService();
    const bond = await bondService.getBondDetails(order.isin);
    if (!bond) {
      throw new AppError(`Bond not found for ISIN: ${order.isin}`, {
        statusCode: HttpStatus.NOT_FOUND,
        code: "BOND_NOT_FOUND",
      });
    }

    const settleOrder = await this.getRfqByOrderNumber(
      this.resolveSettleOrderTradeKey(order),
    );

    // Deal sheets are allowed before CRM order status is SETTLED (draft /
    // pre-settlement). Settlement Date & Time uses payoutTime when present;
    // otherwise the PDF leaves that field blank — do not block generation.
    const getUserPrimaryBankAccount = actor.primaryBank;
    const primaryDematAccount = actor.primaryDemat;
    const negotation = await db.dataBase.rFQNegotiation.findFirst({
      where: {
        tradeNumber: settleOrder?.orderNumber,
      },
    });
    const metadata = (order.metadata as Record<string, unknown> | null) ?? {};
    const rfqDetails = await resolveRfqMasterSavedResponse({
      negotiationRfqNumber: negotation?.rfqNumber,
      metadataRfqNumber:
        typeof metadata.rfqNumber === "string" ? metadata.rfqNumber : null,
      settleTradeNumber: settleOrder?.orderNumber,
    });
    const { dealDate: dealDateFromSnapshot, settlementDateYmd: snapshotSettlementYmd } =
      resolveDatesFromOrderPricingSnapshot(order.bondDetails, {
        requestedDealDate: pdfQuery.dealDate ?? null,
        requestedSettlementDate: pdfQuery.settlementDate ?? null,
      });
    const orderDateForPdf = resolveOrderDateTimeFromRfqMaster(
      rfqDetails,
      dealDateFromSnapshot,
    );
    // Deal / settlement calendar labels: exact RFQ master strings when present.
    const dealDateDisplay =
      rfqDetails?.date?.trim() ||
      (typeof pdfQuery.dealDate === "string" && pdfQuery.dealDate.trim()) ||
      null;
    const settlementDateDisplay =
      rfqDetails?.settlementDate?.trim() ||
      (typeof pdfQuery.settlementDate === "string" &&
        pdfQuery.settlementDate.trim()) ||
      null;
    const resolvedSettlementDate =
      toBusinessYmd(
        typeof pdfQuery.settlementDate === "string"
          ? pdfQuery.settlementDate
          : null,
      ) ||
      toBusinessYmd(settlementDateDisplay) ||
      snapshotSettlementYmd;

    const [bankName, dpName] = await Promise.all([
      settleOrder?.ifscCode
        ? fetchBankNameFromIfsc(getUserPrimaryBankAccount?.ifscCode ?? settleOrder.ifscCode ?? undefined)
        : Promise.resolve(null),
      settleOrder?.dpId
        ? Promise.resolve(getDpName(primaryDematAccount?.dpId ?? settleOrder.dpId ?? undefined))
        : Promise.resolve(undefined),
    ]);

    const accessType: Record<string, string> = {
      "1": "One to Many (OTM) on RFQ Platform of the Exchange",
      "2": "One to One (OTO) on RFQ Platform of the Exchange",
      "3": "Inter Scheme Transfer (IST) on RFQ Platform of the Exchange",
    };
    const accessKey = rfqDetails?.access != null ? String(rfqDetails.access) : undefined;
    const accessTypeText = accessKey ? accessType[accessKey] : undefined;

    const interestSchedule = getInterestPaymentSchedule({
      orderDate: orderDateForPdf,
      maturityDate: bond.maturityDate ?? null,
      interestPaymentFrequency: bond.interestPaymentFrequency,
      paymentDayOfMonth: 20,
      nextCouponDate:
        bond.nextCouponDate != null && String(bond.nextCouponDate).trim() !== ""
          ? new Date(bond.nextCouponDate)
          : undefined,
    });

    const accruedInterestDaysParam =
      pdfQuery.accruedInterestDays != null ? Number(pdfQuery.accruedInterestDays) : undefined;
    const settlementNumberParam =
      typeof pdfQuery.settlementNumber === "string" && pdfQuery.settlementNumber.trim() !== ""
        ? pdfQuery.settlementNumber.trim()
        : undefined;
    const settlementDateTimeParam =
      typeof pdfQuery.settlementDateTime === "string" && pdfQuery.settlementDateTime.trim() !== ""
        ? pdfQuery.settlementDateTime.trim()
        : undefined;
    const lastInterestPaymentDateParam =
      typeof pdfQuery.lastInterestPaymentDate === "string" &&
        pdfQuery.lastInterestPaymentDate.trim() !== ""
        ? pdfQuery.lastInterestPaymentDate.trim()
        : undefined;
    const interestPaymentDatesParamDeal =
      typeof pdfQuery.interestPaymentDates === "string" && pdfQuery.interestPaymentDates.trim() !== ""
        ? pdfQuery.interestPaymentDates
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
        : undefined;
    const nonAmortizedBondParamDeal = pdfQuery.nonAmortizedBond === "false" ? false : true;
    const amortizedPrincipalPaymentDatesParamDeal =
      typeof pdfQuery.amortizedPrincipalPaymentDates === "string" &&
        pdfQuery.amortizedPrincipalPaymentDates.trim() !== ""
        ? pdfQuery.amortizedPrincipalPaymentDates.trim()
        : undefined;

    const pdfFinancials = buildPdfFinancialFields(
      order,
      settleOrder,
      accruedInterestDaysParam,
    );

    const resolvedSettlementNumberDeal = await resolveSettlementNumberForPdf({
      settlementDateYmd: resolvedSettlementDate,
      requestedSettlementNumber: settlementNumberParam,
      settleOrderSettlementNo: settleOrder?.settlementNo,
      metadataSettlementNumber:
        (typeof metadata.settlementNumber === "string" && metadata.settlementNumber.trim()) ||
        (typeof metadata.settlementNo === "string" && metadata.settlementNo.trim()) ||
        null,
    });

    const buffer = await generateDealPdfBuffer({
      user,
      orderId: order.orderNumber,
      bond,
      qun: pdfFinancials.quantity,
      isReleased: false,
      orderData: {
        createdAt: orderDateForPdf.toISOString(),
        subTotal: pdfFinancials.subTotal,
        stampDuty: pdfFinancials.stampDuty,
        totalAmount: pdfFinancials.totalConsideration,
        price: pdfFinancials.price,
        bondDetails: order.bondDetails as { pricing?: Record<string, unknown> } | null,
        metadata: {
          settlementType: rfqDetails?.settlementType ?? 0,
          dealId: (metadata.dealId as string) ?? undefined,
          clientOrderSide: (metadata.clientOrderSide as "BUY" | "SELL") ?? undefined,
          ...(actor.kind === "rfqParticipant" ? { isRfqParticipant: true } : {}),
          rfqNumber: (metadata.rfqNumber as string) ?? negotation?.tradeNumber ?? undefined,
          orderType: accessTypeText ?? "One To One (OTO) on RFQ Platform of the Exchange",
          interestPaymentDates:
            interestPaymentDatesParamDeal?.length
              ? interestPaymentDatesParamDeal
              : interestSchedule.dates.length > 0
                ? interestSchedule.dates
                : undefined,
          interestPaymentFrequencyLabel: interestSchedule.frequencyLabel,
          settlementOrderNumber: negotation?.rfqNumber ?? settleOrder?.orderNumber ?? undefined,
          dealDate: dealDateDisplay ?? undefined,
          settlementDate: settlementDateDisplay ?? resolvedSettlementDate,
          payoutTime: settleOrder?.payoutTime?.trim() || settlementDateTimeParam || undefined,
          valueDate: bond.maturityDate
            ? new Date(bond.maturityDate).toISOString()
            : undefined,
          accruedInterest: pdfFinancials.accruedInterest,
          accruedInterestDays: pdfFinancials.accruedInterestDays,
          settlementNumber: resolvedSettlementNumberDeal ?? undefined,
          settlementDateTime: settlementDateTimeParam,
          lastInterestPaymentDate: lastInterestPaymentDateParam,
          nonAmortizedBond: nonAmortizedBondParamDeal,
          amortizedPrincipalPaymentDates: amortizedPrincipalPaymentDatesParamDeal,
          settlementBank: settleOrder
            ? {
              bankName: getUserPrimaryBankAccount?.bankName ?? bankName ?? undefined,
              ifscCode: getUserPrimaryBankAccount?.ifscCode ?? settleOrder.ifscCode ?? undefined,
              accountNo: getUserPrimaryBankAccount?.accountNumber ?? settleOrder.accountNo ?? undefined,
            }
            : undefined,
          settlementDemat: settleOrder
            ? {
              dpName: primaryDematAccount?.depositoryParticipantName ?? dpName ?? undefined,
              dpId: primaryDematAccount?.dpId ?? settleOrder.dpId ?? undefined,
              benId: primaryDematAccount?.clientId ?? settleOrder.benId ?? undefined,
            }
            : undefined,
          settleOrder: settleOrder
            ? {
              id: settleOrder.id,
              orderNumber: settleOrder.orderNumber ?? negotation?.tradeNumber ?? undefined,
              symbol: settleOrder.symbol,
              buySell: negotation?.buySell,
              buyParticipantLoginId: settleOrder.buyParticipantLoginId,
              sellParticipantLoginId: settleOrder.sellParticipantLoginId,
              buyerRefNo: settleOrder.buyerRefNo,
              sellerRefNo: settleOrder.sellerRefNo,
              buyBackofficeLoginId: settleOrder.buyBackofficeLoginId,
              sellBackofficeLoginId: settleOrder.sellBackofficeLoginId,
              buyBrokerLoginId: settleOrder.buyBrokerLoginId,
              sellBrokerLoginId: settleOrder.sellBrokerLoginId,
              source: settleOrder.source,
              modSettleDate: settleOrder.modSettleDate,
              modQuantity: settleOrder.modQuantity,
              modAccrInt: settleOrder.modAccrInt,
              modConsideration: settleOrder.modConsideration,
              settlementNo: settleOrder.settlementNo,
              stampDutyAmount: settleOrder.stampDutyAmount,
              stampDutyBearer: settleOrder.stampDutyBearer,
              buyerFundPayinObligation: settleOrder.buyerFundPayinObligation,
              sellerFundPayoutObligation: settleOrder.sellerFundPayoutObligation,
              fundPayinRefId: settleOrder.fundPayinRefId,
              settleStatus: settleOrder.settleStatus,
              secPayinQuantity: settleOrder.secPayinQuantity,
              secPayinRemarks: settleOrder.secPayinRemarks,
              secPayinTime: settleOrder.secPayinTime,
              fundsPayinAmount: settleOrder.fundsPayinAmount,
              fundsPayinRemarks: settleOrder.fundsPayinRemarks,
              fundsPayinTime: settleOrder.fundsPayinTime,
              payoutRemarks: settleOrder.payoutRemarks,
              payoutTime: settleOrder.payoutTime,
              ifscCode: getUserPrimaryBankAccount?.ifscCode ?? settleOrder.ifscCode ?? undefined,
              accountNo: getUserPrimaryBankAccount?.accountNumber ?? settleOrder.accountNo ?? undefined,
              utrNumber: settleOrder.utrNumber,
              dpId: primaryDematAccount?.dpId ?? settleOrder.dpId ?? undefined,
              benId: primaryDematAccount?.clientId ?? settleOrder.benId ?? undefined,
            }
            : undefined,
        },
      },
    });

    return {
      buffer,
      filename: `deal-sheet-${order.orderNumber}.pdf`,
    };
  }

  /**
   * Same behavior as POST /api/crm/orders/send-pdf-email/:orderNumber (CRM + automation).
   * @throws AppError for validation / NOT_FOUND / encryption failures
   */
  async sendPdfEmailToClient(
    orderNumber: string,
    body: {
      pdfType: "order" | "deal" | "both";
      subject: string;
      messageBody: string;
      toEmail?: string;
      accruedInterestDays?: number | string;
      settlementNumber?: string;
      settlementDateTime?: string;
      settlementDate?: Date;
      dealDate?: Date,
      lastInterestPaymentDate?: string;
      interestPaymentDates?: string;
      nonAmortizedBond?: boolean;
      amortizedPrincipalPaymentDates?: string;
    },
  ): Promise<{ messageId?: string; messageIds?: string[] }> {
    const pdfType = body.pdfType;
    if (pdfType !== "order" && pdfType !== "deal" && pdfType !== "both") {
      throw new AppError("pdfType must be 'order', 'deal', or 'both'", {
        statusCode: HttpStatus.BAD_REQUEST,
        code: "BAD_REQUEST",
      });
    }

    console.log(body);


    const subject = String(body.subject ?? "").trim();
    const messageBody = String(body.messageBody ?? "").trim();
    const fromEmail = env.SMTP_SENDER;

    if (!subject) {
      throw new AppError("Subject is required", {
        statusCode: HttpStatus.BAD_REQUEST,
        code: "BAD_REQUEST",
      });
    }
    if (!messageBody) {
      throw new AppError("Message body is required", {
        statusCode: HttpStatus.BAD_REQUEST,
        code: "BAD_REQUEST",
      });
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const accruedInterestDaysParam =
      body.accruedInterestDays != null ? Number(body.accruedInterestDays) : undefined;

    const settlementNumberParam =
      typeof body.settlementNumber === "string" && body.settlementNumber.trim() !== ""
        ? body.settlementNumber.trim()
        : undefined;
    const settlementDateTimeParam =
      typeof body.settlementDateTime === "string" && body.settlementDateTime.trim() !== ""
        ? body.settlementDateTime?.toString().trim()
        : undefined;
    const lastInterestPaymentDateParam =
      typeof body.lastInterestPaymentDate === "string" &&
        body.lastInterestPaymentDate.trim() !== ""
        ? body.lastInterestPaymentDate.trim()
        : undefined;

    const pdfQuery: Record<string, string | undefined> = {
      accruedInterestDays: String(accruedInterestDaysParam),
    };
    if (settlementNumberParam) pdfQuery.settlementNumber = settlementNumberParam;
    if (settlementDateTimeParam) pdfQuery.settlementDateTime = settlementDateTimeParam;
    if (lastInterestPaymentDateParam) {
      pdfQuery.lastInterestPaymentDate = lastInterestPaymentDateParam;
    }
    if (typeof body.interestPaymentDates === "string" && body.interestPaymentDates.trim() !== "") {
      pdfQuery.interestPaymentDates = body.interestPaymentDates.trim();
    }
    pdfQuery.nonAmortizedBond = body.nonAmortizedBond === false ? "false" : "true";
    if (
      typeof body.amortizedPrincipalPaymentDates === "string" &&
      body.amortizedPrincipalPaymentDates.trim() !== ""
    ) {
      pdfQuery.amortizedPrincipalPaymentDates = body.amortizedPrincipalPaymentDates.trim();
    }
    if (body.settlementDate) {
      pdfQuery.settlementDate = body.settlementDate.toISOString();
    }
    if (body.dealDate) {
      pdfQuery.dealDate = body.dealDate.toISOString();
    }



    const order = await this.getCustomerByOrderNumber(orderNumber);
    if (!order) {
      throw new AppError("No order found for this settlement. Assign a customer first.", {
        statusCode: HttpStatus.NOT_FOUND,
        code: "ORDER_NOT_FOUND",
      });
    }

    const isParticipantOrder = order.customerProfileId == null;
    let user: Awaited<ReturnType<CustomerProfileRepo["getFullCustomerProfile"]>> | Record<string, unknown>;
    let defaultRecipientEmail: string | undefined;
    let isCorporateCustomer = false;

    if (isParticipantOrder) {
      const actor = await this.resolveOrderPdfActor(orderNumber);
      user = actor.user;
      const email = String(
        (actor.user as { emailAddress?: string | null })?.emailAddress ?? "",
      ).trim();
      defaultRecipientEmail = email || undefined;
    } else {
      const customerRepo = new CustomerProfileRepo();
      user = await customerRepo.getFullCustomerProfile(order.customerProfileId!);

      const userType = String(
        (user as { userType?: string }).userType ?? "INDIVIDUAL",
      )
        .trim()
        .toUpperCase();
      isCorporateCustomer = userType === "CORPORATE";
      if (
        userType !== "INDIVIDUAL" &&
        userType !== "INDIVIDUAL_NRI_NRO" &&
        !isCorporateCustomer
      ) {
        throw new AppError(
          "Email PDF flow is not supported for B2B/corporate customers. Download the PDF and send it manually instead.",
          { statusCode: HttpStatus.BAD_REQUEST, code: "B2B_ORDER_EMAIL_UNSUPPORTED" },
        );
      }
      defaultRecipientEmail = order.customerProfile?.emailAddress ?? undefined;
    }

    console.log(pdfQuery);

    const attachments: Array<{
      filename: string;
      content: Buffer;
      contentType: string;
    }> = [];

    const pdfTypesToGenerate =
      pdfType === "both" ? (["order", "deal"] as const) : ([pdfType] as const);

    const recipientEmail =
      String(body.toEmail ?? "").trim() || defaultRecipientEmail;
    if (!recipientEmail || !emailPattern.test(recipientEmail)) {
      throw new AppError("Recipient email is missing or invalid", {
        statusCode: HttpStatus.BAD_REQUEST,
        code: "BAD_REQUEST",
      });
    }

    const dobRaw = getCustomerDobRawForPdf(user);
    const pdfPassword = dateOfBirthToPdfPassword(dobRaw);
    if (!pdfPassword && !isParticipantOrder && !isCorporateCustomer) {
      throw new AppError(
        "Customer date of birth is required to password-protect the PDF. Ensure PAN/Aadhaar or personal info DOB is on file.",
        {
          statusCode: HttpStatus.BAD_REQUEST,
          code: "BAD_REQUEST",
        },
      );
    }
    for (const pdfTypeToGenerate of pdfTypesToGenerate) {
      const generated =
        pdfTypeToGenerate === "deal"
          ? await this.generateDealSheetPdfBuffer(orderNumber, pdfQuery)
          : await this.generateOrderReceiptPdfBuffer(orderNumber, pdfQuery);

      let attachmentBuffer: Buffer = generated.buffer;
      if (pdfPassword) {
        try {
          attachmentBuffer = encryptPdfBufferWithPassword(
            generated.buffer,
            pdfPassword,
          );
        } catch (encErr) {
          console.error("PDF encryption failed:", encErr);
          throw new AppError(
            encErr instanceof Error
              ? encErr.message
              : "Failed to encrypt PDF. Install qpdf (e.g. brew install qpdf) or set QPDF_BIN.",
            {
              statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
              code: "PDF_ENCRYPT_FAILED",
            },
          );
        }
      }

      attachments.push({
        filename: generated.filename,
        content: attachmentBuffer,
        contentType: "application/pdf",
      });
    }

    const htmlBody = buildOrderEmailHtmlBody(messageBody);
    const messageId = await sendBackOfficeEmail({
      to: recipientEmail,
      from: fromEmail,
      subject,
      html: htmlBody,
      text: messageBody,
      attachments,
    });

    // Persist send flags so CRM order details (Settlement Pipeline) can show
    // whether the order receipt / deal sheet email was delivered.
    const sentAt = new Date().toISOString();
    const existingMeta = (order.metadata as Record<string, unknown> | null) ?? {};
    const metaPatch: Record<string, unknown> = { ...existingMeta };
    if (pdfType === "order" || pdfType === "both") {
      metaPatch.orderReceiptEmailSentAt = sentAt;
      metaPatch.orderReceiptEmailMessageId = messageId;
      metaPatch.orderReceiptEmailTo = recipientEmail;
    }
    if (pdfType === "deal" || pdfType === "both") {
      metaPatch.dealSheetEmailSentAt = sentAt;
      metaPatch.dealSheetEmailMessageId = messageId;
      metaPatch.dealSheetEmailTo = recipientEmail;
    }
    await db.dataBase.order.update({
      where: { id: order.id },
      data: { metadata: metaPatch as Prisma.InputJsonValue },
    });

    return {
      messageId,
      messageIds: [messageId],
    };
  }

  /** Meradhan checkout drafts (`draft_orders`) for CRM inspection of stored pricing JSON. */
  async listDraftOrdersForCrm(): Promise<{
    data: Array<{
      id: number;
      isin: string;
      quantity: number;
      sellPrice: number;
      userId: number;
      customerName: string;
      status: OrderStatus;
      createdAt: string;
      updatedAt: string;
      pricingData: Record<string, unknown> | null;
    }>;
  }> {
    const rows = (await db.dataBase.draftOrders.findMany({
      orderBy: { createdAt: "desc" },
      take: 500,
    })) as Array<{
      id: number;
      isin: string;
      quantity: number;
      sellPrice: number;
      userId: number;
      pricingData: Prisma.JsonValue;
      status: OrderStatus;
      createdAt: Date;
      updatedAt: Date;
    }>;
    const userIds = [...new Set(rows.map((r) => r.userId))];
    const profiles =
      userIds.length === 0
        ? []
        : await db.dataBase.customerProfileDataModel.findMany({
          where: { id: { in: userIds } },
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            legalEntityName: true,
          },
        });
    const customerNameByUserId = new Map<number, string>();
    for (const p of profiles) {
      customerNameByUserId.set(p.id, formatDraftOrderCustomerName(p));
    }

    const isins = [...new Set(rows.map((r) => r.isin))];
    const bondRows =
      isins.length === 0
        ? []
        : await db.dataBase.bonds.findMany({
          where: { isin: { in: isins } },
          select: { isin: true, buyYield: true, yield: true },
        });
    const yieldByIsin = new Map<string, number>();
    for (const b of bondRows) {
      const raw = b.yield ?? b.buyYield;
      if (raw != null && Number.isFinite(Number(raw))) {
        yieldByIsin.set(b.isin, Number(raw));
      }
    }

    return {
      data: rows.map((r) => {
        let pricingData: Record<string, unknown> | null =
          r.pricingData == null ||
            typeof r.pricingData !== "object" ||
            Array.isArray(r.pricingData)
            ? null
            : { ...(r.pricingData as Record<string, unknown>) };

        const snapshotYield = pricingData?.yield;
        const hasYield =
          snapshotYield != null &&
          snapshotYield !== "" &&
          Number.isFinite(Number(snapshotYield));
        if (!hasYield) {
          const bondYield = yieldByIsin.get(r.isin);
          if (bondYield != null) {
            pricingData = { ...(pricingData ?? {}), yield: bondYield };
          }
        }

        return {
          id: r.id,
          isin: r.isin,
          quantity: Number(r.quantity),
          sellPrice: Number(r.sellPrice),
          userId: r.userId,
          customerName: customerNameByUserId.get(r.userId) ?? "—",
          status: r.status,
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
          pricingData,
        };
      }),
    };
  }

  /**
   * CRM: create a Meradhan `order` for the draft owner (PG mode skipped), delete the draft,
   * then run NSE **add ISIN** (`OrderSettlementService.addIsinToSettlement`) to open the RFQ
   * and persist `metadata.rfqNumber` on the order (same first step as automated settlement).
   */
  async createOrderFromDraftForCrm(draftId: number): Promise<{
    orderId: number;
    orderNumber: string;
    paymentOrderId?: string;
    amount: number;
    currency: string;
    key: string;
    /** NSE RFQ master number after add-ISIN (same step as post-payment settlement). */
    rfqNumber?: string;
  }> {
    if (!Number.isFinite(draftId) || draftId < 1) {
      throw new AppError("Invalid draft id", {
        statusCode: HttpStatus.BAD_REQUEST,
        code: "INVALID_DRAFT_ID",
      });
    }

    const draft = await db.dataBase.draftOrders.findUnique({
      where: { id: draftId },
    });
    if (!draft) {
      throw new AppError("Draft order not found", {
        statusCode: HttpStatus.NOT_FOUND,
        code: "DRAFT_ORDER_NOT_FOUND",
      });
    }

    const draftRow = draft as typeof draft & { status: OrderStatus };
    if (draftRow.status !== OrderStatus.PENDING) {
      throw new AppError(
        `This draft cannot be converted (status: ${String(draftRow.status)}).`,
        {
          statusCode: HttpStatus.BAD_REQUEST,
          code: "DRAFT_ORDER_NOT_PENDING",
        },
      );
    }

    const qty = Math.round(Number(draft.quantity));
    if (!Number.isFinite(qty) || qty < 1) {
      throw new AppError("Invalid draft quantity", {
        statusCode: HttpStatus.BAD_REQUEST,
        code: "INVALID_DRAFT_QUANTITY",
      });
    }

    const item: { isin: string; quantity: number; sellPrice?: number } = {
      isin: draft.isin,
      quantity: qty,
    };
    const sell = Number(draft.sellPrice);
    if (Number.isFinite(sell)) {
      item.sellPrice = sell;
    }

    const result = await this.customerOrderService.createOrder(
      draft.userId,
      item,
      undefined,
      true,
    );

    try {
      await db.dataBase.draftOrders.delete({ where: { id: draftId } });
    } catch (err) {
      console.error(
        "[createOrderFromDraftForCrm] Order created but failed to delete draft",
        draftId,
        err,
      );
    }

    const order = await this.customerOrderService.getOrderWithNSEData(
      result.orderId,
    );
    if (!order) {
      throw new AppError("Order not found after create", {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        code: "ORDER_NOT_FOUND_AFTER_CREATE",
      });
    }

    // const paymentId = (result.paymentOrderId && String(result.paymentOrderId)) || `order-${result.orderId}`;
    const orderService = new OrderService();

    await orderService.updateOrderStatus(order.id, "APPLIED");
    const settlementService = new OrderSettlementService();
    await settlementService.seedOrderStages(order.id, { isNetBanking: false });
    const settlementJobId = `order-settlement-${order.id}`;
    const existingJob = await orderSettlementQueue.getJob(settlementJobId);
    if (!existingJob) {
      await orderSettlementQueue.add(
        {
          type: "orderSettlement",
          id: order.id,
          isNetBanking: false,
        },
        { jobId: settlementJobId },
      );
    }
    return result;
  }

  /** CRM: mark a checkout draft as cancelled (no new order). */
  async cancelDraftOrderForCrm(draftId: number): Promise<{
    id: number;
    status: OrderStatus;
  }> {
    if (!Number.isFinite(draftId) || draftId < 1) {
      throw new AppError("Invalid draft id", {
        statusCode: HttpStatus.BAD_REQUEST,
        code: "INVALID_DRAFT_ID",
      });
    }

    const draft = await db.dataBase.draftOrders.findUnique({
      where: { id: draftId },
    });
    if (!draft) {
      throw new AppError("Draft order not found", {
        statusCode: HttpStatus.NOT_FOUND,
        code: "DRAFT_ORDER_NOT_FOUND",
      });
    }

    const draftRow = draft as typeof draft & { status: OrderStatus };
    if (draftRow.status === OrderStatus.CANCELLED) {
      return { id: draft.id, status: OrderStatus.CANCELLED };
    }
    if (
      draftRow.status !== OrderStatus.PENDING &&
      draftRow.status !== OrderStatus.IN_PROGRESS
    ) {
      throw new AppError(
        "Only pending or in-progress drafts can be cancelled.",
        {
          statusCode: HttpStatus.BAD_REQUEST,
          code: "DRAFT_NOT_CANCELLABLE",
        },
      );
    }

    const updated = await db.dataBase.draftOrders.update({
      where: { id: draftId },
      data: { status: OrderStatus.CANCELLED },
    });

    return {
      id: updated.id,
      status: (updated as { status: OrderStatus }).status,
    };
  }

  /**
   * CRM: enqueue resume-safe settlement.
   * Starts at the first non-success stage (usually the failed one). The worker
   * retries that stage, then continues forward only if it succeeds.
   */
  async resumeOrderSettlement(orderId: number): Promise<{
    orderId: number;
    orderNumber: string;
    queued: boolean;
    jobId: string;
    resumeFromStage: string | null;
    resumeFromSeq: number | null;
  }> {
    const order = await db.dataBase.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderNumber: true,
        paymentMetadata: true,
        paymentStatus: true,
      },
    });
    if (!order) {
      throw new AppError("Order not found", {
        statusCode: HttpStatus.NOT_FOUND,
        code: "ORDER_NOT_FOUND",
      });
    }

    const meta = (order.paymentMetadata ?? {}) as Record<string, unknown>;
    const nestedMethod = (
      meta as {
        payload?: { payment?: { entity?: { method?: string } } };
      }
    ).payload?.payment?.entity?.method;
    const method =
      typeof meta.method === "string"
        ? meta.method
        : typeof nestedMethod === "string"
          ? nestedMethod
          : null;
    const isNetBanking = method === "netbanking";

    const settlementService = new OrderSettlementService();
    await settlementService.seedOrderStages(order.id, { isNetBanking });

    const stages = await db.dataBase.orderStage.findMany({
      where: { orderId: order.id },
      orderBy: { seq: "asc" },
      select: { stage: true, seq: true, status: true },
    });
    const next = stages.find((s) => s.status !== 1) ?? null;
    const resumeFromStage = next?.stage ?? null;
    const resumeFromSeq = next?.seq ?? null;

    if (!next) {
      return {
        orderId: order.id,
        orderNumber: order.orderNumber,
        queued: false,
        jobId: `order-settlement-${order.id}`,
        resumeFromStage: null,
        resumeFromSeq: null,
      };
    }

    const settlementJobId = `order-settlement-${order.id}`;
    const existingJob = await orderSettlementQueue.getJob(settlementJobId);
    if (existingJob) {
      const state = await existingJob.getState();
      if (state === "active" || state === "waiting" || state === "delayed") {
        return {
          orderId: order.id,
          orderNumber: order.orderNumber,
          queued: false,
          jobId: settlementJobId,
          resumeFromStage,
          resumeFromSeq,
        };
      }
      await existingJob.remove().catch(() => undefined);
    }

    await orderSettlementQueue.add(
      {
        type: "orderSettlement",
        id: order.id,
        isNetBanking,
        forceResume: true,
      },
      { jobId: settlementJobId },
    );

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      queued: true,
      jobId: settlementJobId,
      resumeFromStage,
      resumeFromSeq,
    };
  }
}