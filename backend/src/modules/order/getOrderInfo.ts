import { db } from "@core/database/database";
import { AppError } from "@utils/error/AppError";

type JsonRecord = Record<string, unknown>;

export interface OrderData {
    orderDocId: string;
    orderId: string;
    dealId: string;
    orderStatus: string;
    bond: {
        name: string;
        description: string;
        faceValue: number;
        isin: string;
        couponRate: number;
        couponFrequency: string;
        allotmentDate: string;
        maturityDate: string;
        secured: string;
        putCall: string;
    };
    customer: {
        name: string;
        email: string;
        phone: string;
        userId: string;
        userName: string;
    };
    pricing: {
        cleanPrice: number;
        yieldToMaturity: number;
        accruedInterest: number;
        quantum: number;
        principal: number;
        is_under_surtpriode: boolean;
        totalConsiderationAmount: number;
        stampDuty: number;
        quantity: number;
        recordDate: string;
        interestDays: number;
        settlementAmount: number;
    };
    date: {
        lastCouponDate: string;
        nextCouponDate: string;
        dealDate: string;
        settlementDate: string;
        settlementNo: string;
        cashFlowDate: string[];
    };
    payment: {
        paymentProvider: string;
        paymentId: string;
        paymentStatus: string;
    };
    rfqNumber: string;
    /** True when settle_order exists, RFQ master status is T, or negotiation is C/A. */
    rfqCompleted: boolean;
    orderDate: string;
}

export interface OrderInfoFieldCoverage {
    field: string;
    present: number;
    missing: number;
    classification: "exists" | "does_not_exist" | "may_exist" | "may_not_exist";
}

export interface OrderInfoStructureAnalysis {
    totalOrders: number;
    fields: OrderInfoFieldCoverage[];
    exists: string[];
    doesNotExist: string[];
    mayExist: string[];
    mayNotExist: string[];
    samples: OrderData[];
}

/** Core fields for CRM order/deal PDF download dialog autofill. */
export type OrderReceiptPdfAutofillCore = {
    accruedInterestDays: number;
    settlementNumber: string | null;
    lastInterestPaymentDateRaw: string | null;
    lastInterestPaymentDate: string | null;
    interestPaymentDates: string[] | null;
    settlementDate: string;
    dealDate: string | null;
    settlementType: number | null;
};

const PDF_MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
] as const;

const PDF_WEEKDAYS = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
] as const;

function pad2(n: number): string {
    return String(n).padStart(2, "0");
}

/** Interest payment date display: `16-Feb` (matches receipt PDF autofill). */
function formatInterestPaymentDateDdMmmFromIso(iso: string): string {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
    if (!m) return "";
    const day = Number(m[3]);
    const monthIdx = Number(m[2]) - 1;
    if (!Number.isFinite(day) || monthIdx < 0 || monthIdx > 11) return "";
    return `${day}-${PDF_MONTHS[monthIdx]}`;
}

/** Last coupon display: `16-Feb-2026 (Monday)` (matches receipt PDF autofill). */
function formatLastInterestPaymentDateDisplayFromIso(iso: string): string {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
    if (!m) return "";
    const year = Number(m[1]);
    const monthIdx = Number(m[2]) - 1;
    const day = Number(m[3]);
    if (!Number.isFinite(year) || !Number.isFinite(day) || monthIdx < 0 || monthIdx > 11) {
        return "";
    }
    const dt = new Date(Date.UTC(year, monthIdx, day, 12, 0, 0));
    if (Number.isNaN(dt.getTime())) return "";
    return `${pad2(day)}-${PDF_MONTHS[monthIdx]}-${year} (${PDF_WEEKDAYS[dt.getUTCDay()]})`;
}

/**
 * Restructure `getOrderInfo` output into the receipt/deal PDF popup autofill shape.
 * Values mirror the order-details fields (deal/settlement dates, settlement no,
 * interest days, last/next coupon window, cash-flow interest payment dates).
 */
export function mapOrderInfoToReceiptPdfAutofill(
    info: OrderData,
    options?: { settlementDate?: string | null },
): OrderReceiptPdfAutofillCore {
    const requested = toIsoDate(options?.settlementDate);
    const settlementDate = requested || info.date.settlementDate || "";
    const dealDate = info.date.dealDate || null;

    let settlementType: number | null = null;
    if (dealDate && settlementDate) {
        settlementType = dealDate === settlementDate ? 0 : 1;
    }

    // Last coupon = settlement + record (last-payout variant), not schedule maturity.
    // Shut: RECORD_DATE ≤ SETTLEMENT < NEXT → upcoming coupon; else last on/before.
    const settlementRef =
        settlementDate || info.date.settlementDate || info.orderDate;
    const settlementUnchanged =
        !requested || requested === info.date.settlementDate;

    let lastRaw: string | null = null;
    if (settlementUnchanged && info.date.lastCouponDate) {
        lastRaw = info.date.lastCouponDate;
    } else {
        const couponDates = info.date.cashFlowDate
            .map((value) => toIsoDate(value))
            .filter((value) => value.length > 0);
        const window = resolveCouponWindow(couponDates, settlementRef);
        // When settlement changes, lastOnOrBefore must come from the window —
        // info.date.lastCouponDate may already be shut-flipped for the original date.
        lastRaw =
            resolveLastCouponDateFromSettlementAndRecord({
                settlementDate: settlementRef,
                recordDate: info.pricing.recordDate,
                lastOnOrBefore: window.lastOnOrBefore,
                nextCouponDate:
                    window.nextAfter || info.date.nextCouponDate,
                isUnderSurtpriode:
                    !info.pricing.recordDate
                        ? info.pricing.is_under_surtpriode
                        : false,
            }) || null;
    }

    const couponDates = info.date.cashFlowDate
        .map((value) => toIsoDate(value))
        .filter((value) => value.length > 0);

    const interestPaymentDates = couponDates
        .filter((value) => !settlementDate || value > settlementDate)
        .slice(0, 12)
        .map(formatInterestPaymentDateDdMmmFromIso)
        .filter((value) => value.length > 0);

    return {
        accruedInterestDays: Math.max(0, Math.round(toNumber(info.pricing.interestDays))),
        settlementNumber: info.date.settlementNo || null,
        lastInterestPaymentDateRaw: lastRaw,
        lastInterestPaymentDate: lastRaw
            ? formatLastInterestPaymentDateDisplayFromIso(lastRaw)
            : null,
        interestPaymentDates:
            interestPaymentDates.length > 0 ? interestPaymentDates : null,
        settlementDate,
        dealDate,
        settlementType,
    };
}

function asRecord(value: unknown): JsonRecord {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return {};
    }
    return value as JsonRecord;
}

function toNumber(value: unknown, fallback = 0): number {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() !== "") {
        const parsed = Number(value.replace(/,/g, ""));
        if (Number.isFinite(parsed)) return parsed;
    }
    // Prisma Decimal / similar numeric objects
    if (
        value != null &&
        typeof value === "object" &&
        "toNumber" in value &&
        typeof (value as { toNumber?: unknown }).toNumber === "function"
    ) {
        const parsed = (value as { toNumber: () => number }).toNumber();
        if (Number.isFinite(parsed)) return parsed;
    }
    if (value != null && typeof value === "object" && "toString" in value) {
        const parsed = Number(String(value).replace(/,/g, ""));
        if (Number.isFinite(parsed)) return parsed;
    }
    return fallback;
}

function toStringValue(value: unknown, fallback = ""): string {
    if (typeof value === "string") return value.trim();
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        return value.toISOString().split("T")[0] ?? fallback;
    }
    if (value == null) return fallback;
    return String(value).trim();
}

function toIsoDate(value: unknown): string {
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        return value.toISOString().split("T")[0] ?? "";
    }

    if (typeof value !== "string") {
        const asString = toStringValue(value);
        return asString ? toIsoDate(asString) : "";
    }

    const raw = value.trim();
    if (!raw) return "";

    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

    const ddMmmYyyy = /^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/i.exec(raw);
    if (ddMmmYyyy) {
        const day = Number(ddMmmYyyy[1]);
        const monKey = (ddMmmYyyy[2] ?? "").slice(0, 3).toLowerCase();
        const year = Number(ddMmmYyyy[3]);
        const monthIndex: Record<string, number> = {
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
        const month = monthIndex[monKey];
        if (month !== undefined) {
            const dt = new Date(year, month, day, 12, 0, 0, 0);
            if (!Number.isNaN(dt.getTime())) {
                return dt.toISOString().split("T")[0] ?? "";
            }
        }
    }

    if (/^\d{2}-\d{2}-\d{4}$/.test(raw)) {
        const [dd, mm, yyyy] = raw.split("-");
        return `${yyyy}-${mm}-${dd}`;
    }

    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) return raw;
    return parsed.toISOString().split("T")[0] ?? "";
}

type RfqMasterRow = {
    number: string;
    date: string | null;
    settlementDate: string | null;
    status: string | null;
    price: unknown;
    yield: unknown;
    value: unknown;
    quantity: number | null;
};

type RfqNegotiationRow = {
    rfqNumber: string;
    tradeNumber: string | null;
    date: string | null;
    status: string | null;
    acceptedSettlementDate: string | null;
    acceptedPrice: unknown;
    acceptedYield: unknown;
    acceptedAccruedInterest: unknown;
    acceptedConsideration: unknown;
    acceptedQuantity: number | null;
    acceptedValue: unknown;
};

type SettleOrderRow = {
    orderNumber: string;
    settlementNo: string | null;
    modSettleDate: string | null;
    modAccrInt: unknown;
    modConsideration: unknown;
    stampDutyAmount: unknown;
    price: unknown;
    yield: unknown;
    value: unknown;
    modQuantity: unknown;
    buyParticipantLoginId: string | null;
    sellParticipantLoginId: string | null;
};

type CustomerProfileRow = {
    id: number;
    firstName: string;
    middleName: string;
    lastName: string;
    emailAddress: string;
    phoneNo: string | null;
    userName: string;
    legalEntityName: string | null;
};

type RfqParticipantInfoRow = {
    code: string;
    nameOverride: string | null;
    contactPerson: string | null;
    emailList: string[];
    mobileList: string[];
};

/**
 * Deal date and settlement date are independent:
 * - deal date  = trade / issue date (today / RFQ date)
 * - settlement = next settlement date (usually T+1)
 * Never copy one onto the other as a fallback.
 *
 * Priority (completed RFQ):
 * 1) RFQ master (`rfq_master_isin`) — exact NSE/RFQ saved values
 * 2) RFQ negotiation accepted fields
 * 3) settle_order / receipt PDF / order metadata
 * 4) order.bondDetails.pricing (checkout snapshot; can diverge from RFQ)
 * 5) order.createdAt for deal date only
 *
 * Before RFQ completion, pricing snapshot stays ahead of RFQ drafts.
 */
function resolveOrderDates(input: {
    pricingSnapshot: JsonRecord;
    metadata: JsonRecord;
    rfqMaster?: RfqMasterRow | null;
    negotiation?: RfqNegotiationRow | null;
    receiptSettlementDateTime?: string | null;
    settleOrder?: SettleOrderRow | null;
    orderCreatedAt: Date | string;
}): { dealDate: string; settlementDate: string } {
    const rfqCompleted = isRfqCompleted(input.rfqMaster, input.negotiation, input.settleOrder);

    const dealDate = toIsoDate(
        pickFirstNonEmpty(
            ...(rfqCompleted
                ? [
                      input.rfqMaster?.date,
                      input.negotiation?.date,
                      input.metadata.dealDate,
                      input.pricingSnapshot.dealDate,
                      input.orderCreatedAt,
                  ]
                : [
                      input.pricingSnapshot.dealDate,
                      input.rfqMaster?.date,
                      input.negotiation?.date,
                      input.metadata.dealDate,
                      input.orderCreatedAt,
                  ]),
        ),
    );

    const settlementDate = toIsoDate(
        pickFirstNonEmpty(
            ...(rfqCompleted
                ? [
                      input.rfqMaster?.settlementDate,
                      input.negotiation?.acceptedSettlementDate,
                      input.settleOrder?.modSettleDate,
                      input.receiptSettlementDateTime,
                      input.metadata.settlementDate,
                      input.pricingSnapshot.settlementDate,
                  ]
                : [
                      input.pricingSnapshot.settlementDate,
                      input.rfqMaster?.settlementDate,
                      input.negotiation?.acceptedSettlementDate,
                      input.settleOrder?.modSettleDate,
                      input.receiptSettlementDateTime,
                      input.metadata.settlementDate,
                  ]),
        ),
    );

    return { dealDate, settlementDate };
}

function isRfqCompleted(
    rfqMaster?: RfqMasterRow | null,
    negotiation?: RfqNegotiationRow | null,
    settleOrder?: SettleOrderRow | null,
): boolean {
    if (settleOrder) return true;
    const masterStatus = toStringValue(rfqMaster?.status).toUpperCase();
    if (masterStatus === "T") return true;
    const negoStatus = toStringValue(negotiation?.status).toUpperCase();
    if (negoStatus === "C" || negoStatus === "A") return true;
    return false;
}

function pickFirstNonEmpty(...values: unknown[]): string {
    for (const value of values) {
        const str = toStringValue(value);
        if (str) return str;
    }
    return "";
}

function pickFirstFiniteNumber(...values: unknown[]): number | undefined {
    for (const value of values) {
        const parsed = toNumber(value, Number.NaN);
        if (Number.isFinite(parsed)) return parsed;
    }
    return undefined;
}

/** Like pickFirstFiniteNumber, but skips 0 placeholders so RFQ/settle fallbacks can apply. */
function pickFirstPositiveNumber(...values: unknown[]): number | undefined {
    for (const value of values) {
        const parsed = toNumber(value, Number.NaN);
        if (Number.isFinite(parsed) && parsed > 0) return parsed;
    }
    return undefined;
}

function parseStringList(value: unknown): string[] {
    if (Array.isArray(value)) {
        return value
            .map((item) => toStringValue(item))
            .filter((item) => item.length > 0);
    }
    if (typeof value === "string" && value.trim()) {
        return value
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item.length > 0);
    }
    return [];
}

function hasMeaningfulValue(value: unknown): boolean {
    if (value == null) return false;
    if (typeof value === "string") return value.trim().length > 0;
    if (typeof value === "number") return Number.isFinite(value);
    if (typeof value === "boolean") return true;
    if (value instanceof Date) return !Number.isNaN(value.getTime());
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "object") return Object.keys(value as JsonRecord).length > 0;
    return false;
}

function settleOrderLinkKey(order: {
    metadata: unknown;
    reqOrderNumber: string | null;
}): string {
    const metadata = asRecord(order.metadata);
    const rfqNumber = toStringValue(metadata.rfqNumber);
    if (rfqNumber) return rfqNumber;
    return toStringValue(order.reqOrderNumber);
}

function extractCouponDates(...sources: unknown[]): string[] {
    for (const source of sources) {
        if (!Array.isArray(source)) continue;
        const dates = source
            .map((value) => toIsoDate(value))
            .filter((value) => value.length > 0);

        if (dates.length > 0) {
            return [...new Set(dates)].sort((a, b) => a.localeCompare(b));
        }
    }
    return [];
}

/**
 * Accrual window around settlement: last payout on/before, next coupon after.
 * Never falls back to the schedule's final coupon (maturity) as "last coupon".
 */
function resolveCouponWindow(
    couponDates: string[],
    referenceDate: string,
): { lastOnOrBefore: string; nextAfter: string } {
    if (!couponDates.length || !referenceDate) {
        return { lastOnOrBefore: "", nextAfter: "" };
    }

    let lastOnOrBefore = "";
    let nextAfter = "";

    for (const couponDate of couponDates) {
        if (couponDate <= referenceDate) {
            lastOnOrBefore = couponDate;
            continue;
        }
        nextAfter = couponDate;
        break;
    }

    return { lastOnOrBefore, nextAfter };
}

/** Shut when RECORD_DATE ≤ SETTLEMENT_DATE < NEXT_COUPON_DATE. */
function isUnderShutFromSettlementAndRecord(
    settlementDate: string,
    recordDate: string,
    nextCouponDate: string,
): boolean {
    if (!settlementDate || !recordDate || !nextCouponDate) return false;
    return settlementDate >= recordDate && settlementDate < nextCouponDate;
}

/**
 * Last coupon date for order/PDF display:
 * settlement + record → last-payout variant (shut flips to upcoming coupon).
 */
function resolveLastCouponDateFromSettlementAndRecord(input: {
    settlementDate: string;
    recordDate: string;
    lastOnOrBefore: string;
    nextCouponDate: string;
    isUnderSurtpriode?: boolean;
}): string {
    const underShut =
        isUnderShutFromSettlementAndRecord(
            input.settlementDate,
            input.recordDate,
            input.nextCouponDate,
        ) || input.isUnderSurtpriode === true;

    if (underShut) {
        return input.nextCouponDate || input.lastOnOrBefore || "";
    }
    return input.lastOnOrBefore || "";
}

type CouponReferenceRow = {
    dueDate: Date;
    recordDate: Date | null;
    recordDateIst: Date | null;
    recordDays: number | null;
};

function addIsoCalendarDays(isoDate: string, delta: number): string {
    const [y, m, d] = isoDate.split("-").map(Number);
    if (!y || !m || !d) return "";
    const dt = new Date(Date.UTC(y, m - 1, d + delta, 12));
    return toIsoDate(dt);
}

/**
 * Same settlement+record window as getLastNextCouponDateBasedOnSettlementDate,
 * but sync over preloaded reference coupon rows (batch-safe for getOrdersInfo).
 */
function resolveCouponMetaFromReferenceRows(
    rows: CouponReferenceRow[],
    settlementYmd: string,
): {
    lastOnOrBefore: string;
    nextAfter: string;
    recordDate: string;
    isUnderShutPeriod: boolean;
} {
    if (!settlementYmd || rows.length === 0) {
        return {
            lastOnOrBefore: "",
            nextAfter: "",
            recordDate: "",
            isUnderShutPeriod: false,
        };
    }

    const couponRows = rows
        .map((row) => {
            const dueYmd = toIsoDate(row.dueDate);
            if (!dueYmd) return null;
            const recordDays =
                typeof row.recordDays === "number" && Number.isFinite(row.recordDays)
                    ? Math.floor(row.recordDays)
                    : null;
            const explicitRecord = toIsoDate(row.recordDateIst ?? row.recordDate);
            const recordYmd =
                explicitRecord ||
                (recordDays != null && recordDays > 0
                    ? addIsoCalendarDays(dueYmd, -recordDays)
                    : "");
            return { dueYmd, recordYmd, recordDays };
        })
        .filter(
            (
                row,
            ): row is {
                dueYmd: string;
                recordYmd: string;
                recordDays: number | null;
            } => row !== null,
        )
        .sort((a, b) => a.dueYmd.localeCompare(b.dueYmd));

    let lastOnOrBefore = "";
    let nextRow: { dueYmd: string; recordYmd: string } | null = null;
    for (const row of couponRows) {
        if (row.dueYmd <= settlementYmd) {
            lastOnOrBefore = row.dueYmd;
            continue;
        }
        nextRow = row;
        break;
    }

    const nextAfter = nextRow?.dueYmd ?? "";
    const recordDate = nextRow?.recordYmd ?? "";
    const isUnderShutPeriod = isUnderShutFromSettlementAndRecord(
        settlementYmd,
        recordDate,
        nextAfter,
    );

    return { lastOnOrBefore, nextAfter, recordDate, isUnderShutPeriod };
}

/**
 * Settlement no is calendar-keyed: prefer `nse_settlement_no` for the settlement
 * date, then the NSE RFQ settle response, then saved receipt/metadata overrides.
 */
function resolveSettlementNo(input: {
    settlementDate: string;
    settlementNoByDate?: Map<string, string> | null;
    settleOrderSettlementNo?: string | null;
    receiptSettlementNumber?: string | null;
    metadataSettlementNumber?: unknown;
    metadataSettlementNo?: unknown;
}): string {
    const dateKey = toIsoDate(input.settlementDate);
    const fromCalendar =
        dateKey && input.settlementNoByDate
            ? toStringValue(input.settlementNoByDate.get(dateKey))
            : "";

    return pickFirstNonEmpty(
        fromCalendar,
        input.settleOrderSettlementNo,
        input.receiptSettlementNumber,
        input.metadataSettlementNumber,
        input.metadataSettlementNo,
    );
}

function mergeRecords(...records: unknown[]): JsonRecord {
    return records.reduce<JsonRecord>((acc, record) => {
        const next = asRecord(record);
        return { ...acc, ...next };
    }, {});
}

function buildOrderData(
    order: {
        id: number;
        orderNumber: string;
        status: string;
        paymentProvider: string | null;
        paymentOrderId: string | null;
        paymentId: string | null;
        paymentStatus: string;
        subTotal: unknown;
        stampDuty: unknown;
        totalAmount: unknown;
        isin: string;
        bondName: string;
        faceValue: unknown;
        quantity: number;
        unitPrice: unknown;
        bondDetails: unknown;
        metadata: unknown;
        paymentMetadata?: unknown;
        reqOrderNumber: string | null;
        linkedRfqParticipantCode?: string | null;
        createdAt: Date;
        customerProfile: {
            id: number;
            firstName: string;
            middleName: string;
            lastName: string;
            emailAddress: string;
            phoneNo: string | null;
            userName?: string;
            legalEntityName?: string | null;
        } | null;
    },
    bondRow?: {
        bondName: string;
        instrumentName: string;
        description: string;
        faceValue: number;
        couponRate: number;
        yield?: number | null;
        lastTradeYield?: number | null;
        interestPaymentFrequency: string;
        dateOfAllotment: Date | null;
        dateOfAllotmentIst?: Date | null;
        maturityDate: Date | null;
        maturityDateIst: Date | null;
        allCouponDates: Date[];
        allCouponDatesIst: Date[];
        recordDate: Date | null;
        recordDateIst: Date | null;
        putCallOptionDetails: string | null;
        natureOfInstrument?: string | null;
    } | null,
    settleOrder?: SettleOrderRow | null,
    customerBond?: {
        bondName: string;
        faceValue: unknown;
        quantity: number;
        purchasePrice: unknown;
        purchaseDate: Date;
        metadata: unknown;
        customerProfileId?: number;
    } | null,
    receiptPdfOption?: {
        settlementNumber: string | null;
        settlementDateTime: string | null;
        lastInterestPaymentDate: string | null;
        interestPaymentDates: string | null;
        accruedInterestDays: number | null;
    } | null,
    orderLogs?: Array<{
        step: string;
        status: string;
        outputData: unknown;
        details: unknown;
    }>,
    rfqMaster?: RfqMasterRow | null,
    negotiation?: RfqNegotiationRow | null,
    resolvedCustomer?: CustomerProfileRow | null,
    rfqParticipantInfo?: RfqParticipantInfoRow | null,
    settlementNoByDate?: Map<string, string> | null,
    couponReferenceRows?: CouponReferenceRow[] | null,
): OrderData {
    const metadata = asRecord(order.metadata);
    const bondDetails = asRecord(order.bondDetails);
    const customerBondMetadata = asRecord(customerBond?.metadata);
    const enrichedBondDetails = mergeRecords(customerBondMetadata, bondDetails);
    // Prefer the order's own checkout snapshot — do not let customer-bond metadata
    // overwrite deal/settlement/pricing fields that live on the order.
    const pricingSnapshot = mergeRecords(customerBondMetadata.pricing, bondDetails.pricing);
    const customer = resolveCustomerFields({
        orderCustomer: order.customerProfile,
        resolvedCustomer,
        rfqParticipantInfo,
        metadata,
        linkedRfqParticipantCode: order.linkedRfqParticipantCode,
    });
    const logPayloads = (orderLogs ?? []).flatMap((log) => [log.outputData, log.details]);
    const logComposite = mergeRecords(...logPayloads);
    const rfqNumber = pickFirstNonEmpty(
        settleOrderLinkKey(order),
        negotiation?.rfqNumber,
        negotiation?.tradeNumber,
        rfqMaster?.number,
        logComposite.rfqNumber,
        logComposite.orderNumber,
    );

    // Prefer pricing / receipt cash-flow lists for display; contractual last/next
    // come from bond reference coupon rows (settlement + record), not bond.allCouponDates.
    const couponDates = extractCouponDates(
        pricingSnapshot.cashFlowDate,
        enrichedBondDetails.cashFlowDate,
        parseStringList(receiptPdfOption?.interestPaymentDates),
        bondRow?.allCouponDatesIst,
        bondRow?.allCouponDates,
    );

    const { dealDate: resolvedDealDate, settlementDate: resolvedSettlementDate } =
        resolveOrderDates({
            pricingSnapshot,
            metadata,
            rfqMaster,
            negotiation,
            receiptSettlementDateTime: receiptPdfOption?.settlementDateTime,
            settleOrder,
            orderCreatedAt: order.createdAt,
        });
    const normalizedSettlementDate = resolvedSettlementDate;
    const settlementRef =
        normalizedSettlementDate || toIsoDate(order.createdAt);

    const referenceMeta = resolveCouponMetaFromReferenceRows(
        couponReferenceRows ?? [],
        settlementRef,
    );
    const couponWindow = resolveCouponWindow(couponDates, settlementRef);
    const snapshotLastCoupon = toIsoDate(
        pickFirstNonEmpty(
            pricingSnapshot.lastCouponDate,
            enrichedBondDetails.lastCouponDate,
        ),
    );
    const snapshotNextCoupon = toIsoDate(
        pickFirstNonEmpty(
            pricingSnapshot.nextCouponDate,
            enrichedBondDetails.nextCouponDate,
        ),
    );
    // Snapshot only when still consistent with this settlement date.
    const snapshotLastOk =
        snapshotLastCoupon && snapshotLastCoupon <= settlementRef
            ? snapshotLastCoupon
            : "";
    const snapshotNextOk =
        snapshotNextCoupon && snapshotNextCoupon > settlementRef
            ? snapshotNextCoupon
            : "";

    const lastOnOrBefore =
        referenceMeta.lastOnOrBefore ||
        snapshotLastOk ||
        couponWindow.lastOnOrBefore;
    const nextCouponDate =
        referenceMeta.nextAfter || snapshotNextOk || couponWindow.nextAfter;

    const rfqCompleted = isRfqCompleted(rfqMaster, negotiation, settleOrder);

    // Pricing: order bondDetails.pricing first, then completed NSE RFQ / settle_order.
    const accruedInterest =
        pickFirstFiniteNumber(
            pricingSnapshot.accruedInterest,
            metadata.accruedInterest,
            logComposite.accruedInterest,
            rfqCompleted ? settleOrder?.modAccrInt : null,
            rfqCompleted ? negotiation?.acceptedAccruedInterest : null,
        ) ?? 0;

    const stampDuty =
        pickFirstFiniteNumber(
            pricingSnapshot.stampDuty,
            rfqCompleted ? settleOrder?.stampDutyAmount : null,
            order.stampDuty,
        ) ?? 0;

    const totalConsiderationAmount =
        pickFirstPositiveNumber(
            pricingSnapshot.totalConsideration,
            pricingSnapshot.totalConsiderationAmount,
            pricingSnapshot.consideration,
            metadata.totalConsiderationAmount,
            logComposite.consideration,
            rfqCompleted ? settleOrder?.modConsideration : null,
            rfqCompleted ? negotiation?.acceptedConsideration : null,
        ) ??
        ((pickFirstPositiveNumber(pricingSnapshot.principalAmount, order.subTotal) ?? 0) +
            accruedInterest);

    const principal =
        pickFirstPositiveNumber(
            pricingSnapshot.principalAmount,
            pricingSnapshot.principal,
            totalConsiderationAmount > accruedInterest
                ? totalConsiderationAmount - accruedInterest
                : null,
            rfqCompleted ? settleOrder?.value : null,
            order.subTotal,
        ) ?? 0;

    const settlementAmount =
        pickFirstPositiveNumber(
            pricingSnapshot.settlementAmount,
            totalConsiderationAmount + stampDuty,
            order.totalAmount,
        ) ?? totalConsiderationAmount + stampDuty;

    const cleanPrice =
        pickFirstPositiveNumber(
            pricingSnapshot.cleanPrice,
            rfqCompleted ? settleOrder?.price : null,
            rfqCompleted ? negotiation?.acceptedPrice : null,
            rfqCompleted ? rfqMaster?.price : null,
            customerBond?.purchasePrice,
            order.unitPrice,
        ) ?? 0;

    const yieldToMaturity =
        pickFirstPositiveNumber(
            pricingSnapshot.yield,
            pricingSnapshot.yieldToMaturity,
            rfqCompleted ? settleOrder?.yield : null,
            rfqCompleted ? negotiation?.acceptedYield : null,
            rfqCompleted ? rfqMaster?.yield : null,
            enrichedBondDetails.yield,
            enrichedBondDetails.lastTradeYield,
            bondRow?.yield,
            bondRow?.lastTradeYield,
        ) ?? 0;

    const quantity = toNumber(
        pickFirstPositiveNumber(
            pricingSnapshot.quantity,
            rfqCompleted ? settleOrder?.modQuantity : null,
            rfqCompleted ? negotiation?.acceptedQuantity : null,
            rfqCompleted ? rfqMaster?.quantity : null,
            customerBond?.quantity,
            order.quantity,
        ) ?? order.quantity,
    );

    const faceValue =
        pickFirstPositiveNumber(
            enrichedBondDetails.faceValue,
            customerBond?.faceValue,
            order.faceValue,
            bondRow?.faceValue,
        ) ?? 0;

    const quantum =
        pickFirstPositiveNumber(pricingSnapshot.quantum) ?? faceValue * quantity;

    const recordDate = toIsoDate(
        pickFirstNonEmpty(
            referenceMeta.recordDate,
            pricingSnapshot.recordDate,
            enrichedBondDetails.recordDate,
            bondRow?.recordDateIst,
            bondRow?.recordDate,
        ),
    );

    const underShutLive = isUnderShutFromSettlementAndRecord(
        settlementRef,
        recordDate,
        nextCouponDate,
    );
    const canEvalShutFromRecord = Boolean(
        settlementRef && recordDate && nextCouponDate,
    );

    const isUnderSurtpriode = referenceMeta.nextAfter
        ? referenceMeta.isUnderShutPeriod
        : canEvalShutFromRecord
          ? underShutLive
          : enrichedBondDetails.isUnderSurtpriode === true ||
            enrichedBondDetails.is_under_surtpriode === true ||
            pricingSnapshot.isUnderSurtpriode === true ||
            pricingSnapshot.is_under_surtpriode === true ||
            metadata.isUnderSurtpriode === true ||
            metadata.is_under_surtpriode === true;

    // Last coupon = last-payout variant from settlement + record (not schedule end).
    const lastCouponDate = resolveLastCouponDateFromSettlementAndRecord({
        settlementDate: settlementRef,
        recordDate: referenceMeta.recordDate || recordDate,
        lastOnOrBefore,
        nextCouponDate,
        isUnderSurtpriode,
    });

    return {
        orderDocId: String(order.id),
        orderId: order.orderNumber,
        dealId: pickFirstNonEmpty(metadata.dealId, logComposite.dealId),
        orderStatus: order.status,
        bond: {
            name: pickFirstNonEmpty(
                enrichedBondDetails.bondName,
                customerBond?.bondName,
                order.bondName,
                bondRow?.bondName,
                bondRow?.instrumentName,
            ),
            description: pickFirstNonEmpty(
                enrichedBondDetails.description,
                enrichedBondDetails.instrumentDescription,
                enrichedBondDetails.instrumentName,
                bondRow?.description,
            ),
            faceValue,
            isin: order.isin,
            couponRate: pickFirstFiniteNumber(
                enrichedBondDetails.couponRate,
                bondRow?.couponRate,
            ) ?? 0,
            couponFrequency: pickFirstNonEmpty(
                enrichedBondDetails.interestPaymentFrequency,
                bondRow?.interestPaymentFrequency,
            ),
            allotmentDate: toIsoDate(
                pickFirstNonEmpty(
                    enrichedBondDetails.dateOfAllotment,
                    bondRow?.dateOfAllotmentIst,
                    bondRow?.dateOfAllotment,
                ),
            ),
            maturityDate: toIsoDate(
                pickFirstNonEmpty(
                    enrichedBondDetails.maturityDate,
                    bondRow?.maturityDateIst,
                    bondRow?.maturityDate,
                ),
            ),
            secured: pickFirstNonEmpty(
                enrichedBondDetails.secured,
                enrichedBondDetails.natureOfInstrument,
                bondRow?.natureOfInstrument,
            ),
            putCall: pickFirstNonEmpty(
                enrichedBondDetails.putCall,
                enrichedBondDetails.putCallOptionDetails,
                bondRow?.putCallOptionDetails,
            ),
        },
        customer: {
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            userId: customer.userId,
            userName: customer.userName,
        },
        pricing: {
            cleanPrice,
            yieldToMaturity,
            accruedInterest,
            quantum,
            principal,
            is_under_surtpriode: isUnderSurtpriode,
            totalConsiderationAmount,
            stampDuty,
            quantity,
            recordDate,
            interestDays: toNumber(
                pickFirstFiniteNumber(
                    pricingSnapshot.interestDays,
                    pricingSnapshot.noOfAccrualDays,
                    receiptPdfOption?.accruedInterestDays,
                    metadata.accruedInterestDays,
                ) ?? 0,
            ),
            settlementAmount,
        },
        date: {
            lastCouponDate,
            nextCouponDate,
            dealDate: resolvedDealDate,
            settlementDate: normalizedSettlementDate,
            settlementNo: resolveSettlementNo({
                settlementDate: normalizedSettlementDate,
                settlementNoByDate,
                settleOrderSettlementNo: settleOrder?.settlementNo,
                receiptSettlementNumber: receiptPdfOption?.settlementNumber,
                metadataSettlementNumber: metadata.settlementNumber,
                metadataSettlementNo: metadata.settlementNo,
            }),
            cashFlowDate: couponDates,
        },
        payment: {
            paymentProvider: toStringValue(order.paymentProvider),
            paymentId: pickFirstNonEmpty(
                order.paymentId,
                order.paymentOrderId,
                asRecord(order.paymentMetadata).paymentId,
            ),
            paymentStatus: toStringValue(order.paymentStatus),
        },
        rfqNumber,
        rfqCompleted,
        orderDate: toIsoDate(order.createdAt),
    };
}

function flattenOrderData(
    value: unknown,
    prefix = "",
    acc: Array<{ field: string; value: unknown }> = [],
): Array<{ field: string; value: unknown }> {
    if (value == null || typeof value !== "object" || value instanceof Date) {
        if (prefix) acc.push({ field: prefix, value });
        return acc;
    }

    if (Array.isArray(value)) {
        if (prefix) acc.push({ field: prefix, value });
        return acc;
    }

    for (const [key, nestedValue] of Object.entries(value)) {
        const nextPrefix = prefix ? `${prefix}.${key}` : key;
        flattenOrderData(nestedValue, nextPrefix, acc);
    }

    return acc;
}

async function loadOrderDataDependencies(
    orders: Array<{
        id: number;
        isin: string;
        orderNumber: string;
        metadata: unknown;
        bondDetails?: unknown;
        reqOrderNumber: string | null;
        customerProfileId?: number | null;
        linkedRfqParticipantCode?: string | null;
    }>,
) {
    const isins = [...new Set(orders.map((order) => order.isin).filter(Boolean))];
    const tradeKeys = [
        ...new Set(
            orders
                .map((order) => settleOrderLinkKey(order))
                .filter((value) => value.length > 0),
        ),
    ];

    const [bonds, settleOrders, customerBonds, orderLogs, receiptPdfOptions, negotiations, couponReferenceRows] =
        await Promise.all([
            db.dataBase.bonds.findMany({
                where: { isin: { in: isins } },
                select: {
                    isin: true,
                    bondName: true,
                    instrumentName: true,
                    description: true,
                    faceValue: true,
                    couponRate: true,
                    yield: true,
                    lastTradeYield: true,
                    interestPaymentFrequency: true,
                    dateOfAllotment: true,
                    dateOfAllotmentIst: true,
                    maturityDate: true,
                    maturityDateIst: true,
                    allCouponDates: true,
                    allCouponDatesIst: true,
                    recordDate: true,
                    recordDateIst: true,
                    putCallOptionDetails: true,
                    natureOfInstrument: true,
                },
            }),
            tradeKeys.length
                ? db.dataBase.settleOrderModel.findMany({
                    where: { orderNumber: { in: tradeKeys } },
                    select: {
                        orderNumber: true,
                        settlementNo: true,
                        modSettleDate: true,
                        modAccrInt: true,
                        modConsideration: true,
                        stampDutyAmount: true,
                        price: true,
                        yield: true,
                        value: true,
                        modQuantity: true,
                        buyParticipantLoginId: true,
                        sellParticipantLoginId: true,
                    },
                    orderBy: { id: "desc" },
                })
                : Promise.resolve([]),
            db.dataBase.customerBonds.findMany({
                where: { orderId: { in: orders.map((order) => order.id).filter(Boolean) } },
                select: {
                    orderId: true,
                    customerProfileId: true,
                    bondName: true,
                    faceValue: true,
                    quantity: true,
                    purchasePrice: true,
                    purchaseDate: true,
                    metadata: true,
                },
            }),
            db.dataBase.orderLogs.findMany({
                where: { orderId: { in: orders.map((order) => order.id).filter(Boolean) } },
                select: {
                    orderId: true,
                    step: true,
                    status: true,
                    outputData: true,
                    details: true,
                },
                orderBy: [{ orderId: "desc" }, { id: "desc" }],
            }),
            db.dataBase.crmOrderReceiptPdfOptions.findMany({
                where: {
                    orderNumber: {
                        in: [
                            ...new Set(
                                orders
                                    .flatMap((order) => [
                                        order.reqOrderNumber,
                                        order.orderNumber,
                                        settleOrderLinkKey(order),
                                    ])
                                    .filter(
                                        (value): value is string =>
                                            typeof value === "string" && value.trim().length > 0,
                                    ),
                            ),
                        ],
                    },
                },
                select: {
                    orderNumber: true,
                    settlementNumber: true,
                    settlementDateTime: true,
                    lastInterestPaymentDate: true,
                    interestPaymentDates: true,
                    accruedInterestDays: true,
                },
            }),
            tradeKeys.length
                ? db.dataBase.rFQNegotiation.findMany({
                    where: {
                        OR: [
                            { tradeNumber: { in: tradeKeys } },
                            { rfqNumber: { in: tradeKeys } },
                        ],
                    },
                    select: {
                        rfqNumber: true,
                        tradeNumber: true,
                        date: true,
                        status: true,
                        acceptedSettlementDate: true,
                        acceptedPrice: true,
                        acceptedYield: true,
                        acceptedAccruedInterest: true,
                        acceptedConsideration: true,
                        acceptedQuantity: true,
                        acceptedValue: true,
                    },
                    orderBy: { updatedAt: "desc" },
                })
                : Promise.resolve([]),
            isins.length
                ? db.dataBase.bondReferenceCouponPaymentDate.findMany({
                    where: { isin: { in: isins } },
                    select: {
                        isin: true,
                        dueDate: true,
                        recordDate: true,
                        recordDateIst: true,
                        recordDays: true,
                    },
                    orderBy: { dueDate: "asc" },
                })
                : Promise.resolve([]),
        ]);

    const rfqMasterKeys = [
        ...new Set(
            [
                ...tradeKeys,
                ...negotiations.map((row) => row.rfqNumber),
                ...negotiations
                    .map((row) => row.tradeNumber)
                    .filter((value): value is string => typeof value === "string" && value.length > 0),
            ].filter((value) => value.length > 0),
        ),
    ];

    const rfqMasters = rfqMasterKeys.length
        ? await db.dataBase.rFQMasterISIN.findMany({
            where: { number: { in: rfqMasterKeys } },
            select: {
                number: true,
                date: true,
                settlementDate: true,
                status: true,
                price: true,
                yield: true,
                value: true,
                quantity: true,
            },
        })
        : [];

    const bondByIsin = new Map(bonds.map((bond) => [bond.isin, bond]));
    const couponsByIsin = new Map<string, CouponReferenceRow[]>();
    for (const row of couponReferenceRows) {
        if (!(row.dueDate instanceof Date) || Number.isNaN(row.dueDate.getTime())) {
            continue;
        }
        const list = couponsByIsin.get(row.isin) ?? [];
        list.push({
            dueDate: row.dueDate,
            recordDate: row.recordDate,
            recordDateIst: row.recordDateIst,
            recordDays: row.recordDays,
        });
        couponsByIsin.set(row.isin, list);
    }
    const settleByOrderNumber = new Map<string, SettleOrderRow>();
    for (const settleOrder of settleOrders) {
        if (!settleByOrderNumber.has(settleOrder.orderNumber)) {
            settleByOrderNumber.set(settleOrder.orderNumber, settleOrder);
        }
    }

    const negotiationByTradeKey = new Map<string, RfqNegotiationRow>();
    for (const negotiation of negotiations) {
        const keys = [negotiation.tradeNumber, negotiation.rfqNumber].filter(
            (value): value is string => typeof value === "string" && value.trim().length > 0,
        );
        for (const key of keys) {
            if (!negotiationByTradeKey.has(key)) {
                negotiationByTradeKey.set(key, negotiation);
            }
        }
    }

    const rfqMasterByNumber = new Map<string, RfqMasterRow>();
    for (const master of rfqMasters) {
        rfqMasterByNumber.set(master.number, master);
    }

    const customerBondByOrderId = new Map(customerBonds.map((bond) => [bond.orderId, bond]));
    const logsByOrderId = new Map<number, typeof orderLogs>();
    for (const log of orderLogs) {
        const existing = logsByOrderId.get(log.orderId) ?? [];
        existing.push(log);
        logsByOrderId.set(log.orderId, existing);
    }
    const receiptPdfOptionByOrderNumber = new Map(
        receiptPdfOptions.map((option) => [option.orderNumber, option]),
    );

    const customerUserNames = [
        ...new Set(
            orders.flatMap((order) => {
                const tradeKey = settleOrderLinkKey(order);
                return customerLookupKeys({
                    metadata: order.metadata,
                    linkedRfqParticipantCode: order.linkedRfqParticipantCode,
                    settleOrder: tradeKey ? settleByOrderNumber.get(tradeKey) ?? null : null,
                });
            }),
        ),
    ];
    const customerProfileIds = [
        ...new Set(
            [
                ...orders
                    .map((order) => order.customerProfileId)
                    .filter((id): id is number => typeof id === "number" && id > 0),
                ...customerBonds
                    .map((bond) => bond.customerProfileId)
                    .filter((id): id is number => typeof id === "number" && id > 0),
            ],
        ),
    ];

    const participantCodes = [
        ...new Set(
            orders
                .flatMap((order) => {
                    const tradeKey = settleOrderLinkKey(order);
                    const settle = tradeKey ? settleByOrderNumber.get(tradeKey) : null;
                    const metadata = asRecord(order.metadata);
                    return [
                        order.linkedRfqParticipantCode,
                        settle?.buyParticipantLoginId,
                        settle?.sellParticipantLoginId,
                        metadata.participantName,
                        metadata.participantCode,
                    ];
                })
                .map((value) => toStringValue(value))
                .filter((value) => value.length > 0),
        ),
    ];

    const [customerProfiles, rfqParticipantInfos, nseSettlementNos] = await Promise.all([
        customerProfileIds.length || customerUserNames.length
            ? db.dataBase.customerProfileDataModel.findMany({
                where: {
                    isDeleted: false,
                    OR: [
                        ...(customerProfileIds.length
                            ? [{ id: { in: customerProfileIds } }]
                            : []),
                        ...(customerUserNames.length
                            ? [{ userName: { in: customerUserNames } }]
                            : []),
                    ],
                },
                select: {
                    id: true,
                    firstName: true,
                    middleName: true,
                    lastName: true,
                    emailAddress: true,
                    phoneNo: true,
                    userName: true,
                    legalEntityName: true,
                },
            })
            : Promise.resolve([]),
        participantCodes.length
            ? db.dataBase.nseRfqParticipantInfoModel.findMany({
                where: {
                    OR: [
                        { code: { in: participantCodes } },
                        { nameOverride: { in: participantCodes } },
                    ],
                },
                select: {
                    code: true,
                    nameOverride: true,
                    contactPerson: true,
                    emailList: true,
                    mobileList: true,
                },
            })
            : Promise.resolve([]),
        // Small calendar table — load fully so derived settlement dates still resolve.
        db.dataBase.nseSettlementNo.findMany({
            select: { date: true, settlementNo: true },
        }),
    ]);

    const customerById = new Map<number, CustomerProfileRow>();
    const customerByUserName = new Map<string, CustomerProfileRow>();
    for (const profile of customerProfiles) {
        customerById.set(profile.id, profile);
        customerByUserName.set(profile.userName, profile);
    }

    const rfqParticipantByCode = new Map<string, RfqParticipantInfoRow>();
    const rfqParticipantByName = new Map<string, RfqParticipantInfoRow>();
    for (const participant of rfqParticipantInfos) {
        rfqParticipantByCode.set(participant.code, participant);
        const nameKey = toStringValue(participant.nameOverride);
        if (nameKey && !rfqParticipantByName.has(nameKey)) {
            rfqParticipantByName.set(nameKey, participant);
        }
    }

    const settlementNoByDate = new Map<string, string>();
    for (const row of nseSettlementNos) {
        // `nse_settlement_no.date` is stored as yyyy-mm-dd string.
        const dateKey = toIsoDate(row.date) || toStringValue(row.date);
        const settlementNo = toStringValue(row.settlementNo);
        if (dateKey && settlementNo && !settlementNoByDate.has(dateKey)) {
            settlementNoByDate.set(dateKey, settlementNo);
        }
    }

    return {
        bondByIsin,
        couponsByIsin,
        settleByOrderNumber,
        negotiationByTradeKey,
        rfqMasterByNumber,
        customerBondByOrderId,
        logsByOrderId,
        receiptPdfOptionByOrderNumber,
        customerById,
        customerByUserName,
        rfqParticipantByCode,
        rfqParticipantByName,
        settlementNoByDate,
    };
}

function formatCustomerDisplayName(customer: {
    firstName?: string | null;
    middleName?: string | null;
    lastName?: string | null;
    legalEntityName?: string | null;
}): string {
    const personal = [customer.firstName, customer.middleName, customer.lastName]
        .filter((value) => typeof value === "string" && value.trim().length > 0)
        .join(" ")
        .trim();
    return personal || toStringValue(customer.legalEntityName);
}

function resolveCustomerFields(input: {
    orderCustomer?: {
        id: number;
        firstName: string;
        middleName: string;
        lastName: string;
        emailAddress: string;
        phoneNo: string | null;
        userName?: string;
        legalEntityName?: string | null;
    } | null;
    resolvedCustomer?: CustomerProfileRow | null;
    rfqParticipantInfo?: RfqParticipantInfoRow | null;
    metadata: JsonRecord;
    linkedRfqParticipantCode?: string | null;
}): {
    name: string;
    email: string;
    phone: string;
    userId: string;
    userName: string;
} {
    const profile = input.orderCustomer ?? input.resolvedCustomer;
    if (profile) {
        const name = formatCustomerDisplayName(profile);
        return {
            name,
            email: toStringValue(profile.emailAddress),
            phone: toStringValue(profile.phoneNo),
            userId: String(profile.id),
            userName: pickFirstNonEmpty(profile.userName, name),
        };
    }

    const participant = input.rfqParticipantInfo;
    if (participant) {
        const name = pickFirstNonEmpty(
            participant.nameOverride,
            participant.contactPerson,
            participant.code,
            input.metadata.participantName,
        );
        return {
            name,
            email: toStringValue(participant.emailList?.[0]),
            phone: toStringValue(participant.mobileList?.[0]),
            userId: "",
            userName: pickFirstNonEmpty(participant.code, name),
        };
    }

    const fallbackName = pickFirstNonEmpty(
        input.metadata.participantName,
        input.metadata.Client_Name,
        asRecord(input.metadata.notes).Client_Name,
        input.linkedRfqParticipantCode,
    );
    return {
        name: fallbackName,
        email: pickFirstNonEmpty(input.metadata.email),
        phone: pickFirstNonEmpty(input.metadata.contact, input.metadata.phone),
        userId: "",
        userName: pickFirstNonEmpty(input.linkedRfqParticipantCode, fallbackName),
    };
}

function customerLookupKeys(input: {
    metadata: unknown;
    linkedRfqParticipantCode?: string | null;
    settleOrder?: SettleOrderRow | null;
}): string[] {
    const metadata = asRecord(input.metadata);
    const side = toStringValue(metadata.clientOrderSide).toUpperCase();
    const buy = toStringValue(input.settleOrder?.buyParticipantLoginId);
    const sell = toStringValue(input.settleOrder?.sellParticipantLoginId);
    const preferred =
        side === "BUY" ? [buy, sell] : side === "SELL" ? [sell, buy] : [buy, sell];

    return [
        ...new Set(
            [
                ...preferred,
                toStringValue(input.linkedRfqParticipantCode),
                toStringValue(metadata.customerUserName),
                toStringValue(metadata.clientCode),
                toStringValue(metadata.participantCode),
            ].filter((value) => value.length > 0),
        ),
    ];
}

function resolveRfqContext(
    order: {
        id: number;
        metadata: unknown;
        reqOrderNumber: string | null;
        customerProfileId?: number | null;
        linkedRfqParticipantCode?: string | null;
    },
    deps: Awaited<ReturnType<typeof loadOrderDataDependencies>>,
): {
    tradeKey: string;
    settleOrder: SettleOrderRow | null;
    negotiation: RfqNegotiationRow | null;
    rfqMaster: RfqMasterRow | null;
    resolvedCustomer: CustomerProfileRow | null;
    rfqParticipantInfo: RfqParticipantInfoRow | null;
} {
    const tradeKey = settleOrderLinkKey(order);
    const settleOrder = (tradeKey ? deps.settleByOrderNumber.get(tradeKey) : null) ?? null;
    const negotiation =
        (tradeKey ? deps.negotiationByTradeKey.get(tradeKey) : null) ?? null;
    const rfqMaster =
        (negotiation?.rfqNumber
            ? deps.rfqMasterByNumber.get(negotiation.rfqNumber)
            : null) ??
        (tradeKey ? deps.rfqMasterByNumber.get(tradeKey) : null) ??
        (negotiation?.tradeNumber
            ? deps.rfqMasterByNumber.get(negotiation.tradeNumber)
            : null) ??
        null;

    const customerBond = deps.customerBondByOrderId.get(order.id) ?? null;
    let resolvedCustomer: CustomerProfileRow | null = null;
    if (order.customerProfileId != null) {
        resolvedCustomer =
            deps.customerById.get(order.customerProfileId) ?? null;
    }
    if (
        resolvedCustomer == null &&
        customerBond?.customerProfileId != null
    ) {
        resolvedCustomer =
            deps.customerById.get(customerBond.customerProfileId) ?? null;
    }

    if (!resolvedCustomer) {
        for (const key of customerLookupKeys({
            metadata: order.metadata,
            linkedRfqParticipantCode: order.linkedRfqParticipantCode,
            settleOrder,
        })) {
            const match = deps.customerByUserName.get(key);
            if (match) {
                resolvedCustomer = match;
                break;
            }
        }
    }

    const metadata = asRecord(order.metadata);
    const participantLookupKeys = [
        toStringValue(order.linkedRfqParticipantCode),
        toStringValue(settleOrder?.buyParticipantLoginId),
        toStringValue(settleOrder?.sellParticipantLoginId),
        toStringValue(metadata.participantCode),
        toStringValue(metadata.participantName),
    ].filter((value) => value.length > 0);

    let rfqParticipantInfo: RfqParticipantInfoRow | null = null;
    for (const key of participantLookupKeys) {
        rfqParticipantInfo =
            deps.rfqParticipantByCode.get(key) ??
            deps.rfqParticipantByName.get(key) ??
            null;
        if (rfqParticipantInfo) break;
    }

    return {
        tradeKey,
        settleOrder,
        negotiation,
        rfqMaster,
        resolvedCustomer,
        rfqParticipantInfo,
    };
}

const ORDER_CUSTOMER_PROFILE_SELECT = {
    id: true,
    userName: true,
    firstName: true,
    middleName: true,
    lastName: true,
    emailAddress: true,
    phoneNo: true,
    legalEntityName: true,
} as const;

/** Postgres INT4 PK range — NSE RFQ trade numbers are larger and must not be used as order.id. */
const POSTGRES_INT4_MAX = 2_147_483_647;

function parseSafeOrderPrimaryKey(rawId: number | string): number | null {
    const asString = String(rawId).trim();
    if (!/^\d+$/.test(asString)) return null;
    // INT4 is at most 10 digits; longer values are RFQ / trade numbers.
    if (asString.length > 10) return null;
    const n = Number(asString);
    if (!Number.isInteger(n) || n < 1 || n > POSTGRES_INT4_MAX) return null;
    if (String(n) !== asString) return null;
    return n;
}

async function buildOrderDataFromLoadedOrder(order: {
    id: number;
    orderNumber: string;
    status: string;
    paymentProvider: string | null;
    paymentOrderId: string | null;
    paymentId: string | null;
    paymentStatus: string;
    subTotal: unknown;
    stampDuty: unknown;
    totalAmount: unknown;
    isin: string;
    bondName: string;
    faceValue: unknown;
    quantity: number;
    unitPrice: unknown;
    bondDetails: unknown;
    metadata: unknown;
    paymentMetadata?: unknown;
    reqOrderNumber: string | null;
    linkedRfqParticipantCode?: string | null;
    createdAt: Date;
    customerProfileId?: number | null;
    customerProfile: {
        id: number;
        firstName: string;
        middleName: string;
        lastName: string;
        emailAddress: string;
        phoneNo: string | null;
        userName?: string;
        legalEntityName?: string | null;
    } | null;
}): Promise<OrderData> {
    const deps = await loadOrderDataDependencies([order]);
    const {
        tradeKey,
        settleOrder,
        negotiation,
        rfqMaster,
        resolvedCustomer,
        rfqParticipantInfo,
    } = resolveRfqContext(order, deps);
    return buildOrderData(
        order,
        deps.bondByIsin.get(order.isin) ?? null,
        settleOrder,
        deps.customerBondByOrderId.get(order.id) ?? null,
        deps.receiptPdfOptionByOrderNumber.get(
            tradeKey || order.reqOrderNumber || order.orderNumber,
        ) ?? null,
        deps.logsByOrderId.get(order.id) ?? [],
        rfqMaster,
        negotiation,
        resolvedCustomer,
        rfqParticipantInfo,
        deps.settlementNoByDate,
        deps.couponsByIsin.get(order.isin) ?? null,
    );
}

async function findOrderLinkedToRfqNumber(rfqNumber: string) {
    return db.dataBase.order.findFirst({
        where: {
            OR: [
                { reqOrderNumber: { equals: rfqNumber } },
                { orderNumber: { equals: rfqNumber } },
                {
                    metadata: {
                        path: ["rfqNumber"],
                        equals: rfqNumber,
                    },
                },
            ],
        },
        include: {
            customerProfile: {
                select: ORDER_CUSTOMER_PROFILE_SELECT,
            },
        },
        orderBy: { id: "desc" },
    });
}

export async function getOrderInfo(orderId: number | string): Promise<OrderData> {
    const rawId = typeof orderId === "string" ? orderId.trim() : orderId;
    const numericOrderId = parseSafeOrderPrimaryKey(rawId);

    const order = numericOrderId != null
        ? await db.dataBase.order.findUnique({
            where: { id: numericOrderId },
            include: {
                customerProfile: {
                    select: ORDER_CUSTOMER_PROFILE_SELECT,
                },
            },
        })
        : await db.dataBase.order.findFirst({
            where: { orderNumber: String(rawId) },
            include: {
                customerProfile: {
                    select: ORDER_CUSTOMER_PROFILE_SELECT,
                },
            },
        });

    if (!order) {
        throw new AppError("Order not found", {
            statusCode: 404,
            code: "ORDER_NOT_FOUND",
        });
    }

    return buildOrderDataFromLoadedOrder(order);
}

/**
 * Resolve order display / PDF autofill data from an NSE RFQ / settle trade number
 * (e.g. generate-PDF page `/settle-orders/generate/260722990000092`).
 *
 * 1) CRM `order` linked via reqOrderNumber / orderNumber / metadata.rfqNumber
 * 2) Else settle_order (+ RFQ negotiation / bond) when no CRM order exists yet
 */
export async function getOrderInfoByRfqNumber(
    rfqNumber: string,
): Promise<OrderData> {
    const key = rfqNumber.trim();
    if (!key) {
        throw new AppError("RFQ number is required", {
            statusCode: 400,
            code: "BAD_REQUEST",
        });
    }

    const linkedOrder = await findOrderLinkedToRfqNumber(key);
    if (linkedOrder) {
        return buildOrderDataFromLoadedOrder(linkedOrder);
    }

    // Safe CRM primary key (order details pages may still pass numeric id).
    const orderPk = parseSafeOrderPrimaryKey(key);
    if (orderPk != null) {
        try {
            return await getOrderInfo(orderPk);
        } catch (err) {
            if (!(err instanceof AppError) || err.code !== "ORDER_NOT_FOUND") {
                throw err;
            }
        }
    }

    const settleOrder = await db.dataBase.settleOrderModel.findFirst({
        where: { orderNumber: { equals: key } },
        orderBy: { id: "desc" },
    });
    const isin = toStringValue(settleOrder?.symbol);
    if (!settleOrder || !isin) {
        throw new AppError("Order / RFQ not found", {
            statusCode: 404,
            code: "ORDER_NOT_FOUND",
        });
    }

    const quantity = toNumber(settleOrder.modQuantity);
    const unitPrice = toNumber(settleOrder.price);
    const consideration = toNumber(
        settleOrder.modConsideration ?? settleOrder.value,
    );
    const stampDuty = toNumber(settleOrder.stampDutyAmount);

    const syntheticOrder = {
        id: 0,
        orderNumber: key,
        status: "SETTLED",
        paymentProvider: null as string | null,
        paymentOrderId: null as string | null,
        paymentId: null as string | null,
        paymentStatus: "PENDING",
        subTotal: consideration,
        stampDuty,
        totalAmount: consideration,
        isin,
        bondName: isin,
        faceValue: 0,
        quantity,
        unitPrice,
        bondDetails: {} as unknown,
        metadata: { rfqNumber: key } as unknown,
        paymentMetadata: {} as unknown,
        reqOrderNumber: key,
        linkedRfqParticipantCode: null as string | null,
        createdAt:
            settleOrder.createdAt instanceof Date &&
            !Number.isNaN(settleOrder.createdAt.getTime())
                ? settleOrder.createdAt
                : new Date(),
        customerProfileId: null as number | null,
        customerProfile: null,
    };

    return buildOrderDataFromLoadedOrder(syntheticOrder);
}

export async function getOrdersInfo(
    orderIds: Array<number | string>,
): Promise<Record<number, OrderData>> {
    const numericOrderIds = [
        ...new Set(
            orderIds
                .map((orderId) => parseSafeOrderPrimaryKey(orderId))
                .filter((orderId): orderId is number => orderId != null),
        ),
    ];

    if (numericOrderIds.length === 0) {
        return {};
    }

    const orders = await db.dataBase.order.findMany({
        where: { id: { in: numericOrderIds } },
        include: {
            customerProfile: {
                select: {
                    id: true,
                    userName: true,
                    firstName: true,
                    middleName: true,
                    lastName: true,
                    emailAddress: true,
                    phoneNo: true,
                    legalEntityName: true,
                },
            },
        },
    });

    const deps = await loadOrderDataDependencies(orders);

    return orders.reduce<Record<number, OrderData>>((acc, order) => {
        const {
            tradeKey,
            settleOrder,
            negotiation,
            rfqMaster,
            resolvedCustomer,
            rfqParticipantInfo,
        } = resolveRfqContext(order, deps);
        acc[order.id] = buildOrderData(
            order,
            deps.bondByIsin.get(order.isin) ?? null,
            settleOrder,
            deps.customerBondByOrderId.get(order.id) ?? null,
            deps.receiptPdfOptionByOrderNumber.get(
                tradeKey || order.reqOrderNumber || order.orderNumber,
            ) ?? null,
            deps.logsByOrderId.get(order.id) ?? [],
            rfqMaster,
            negotiation,
            resolvedCustomer,
            rfqParticipantInfo,
            deps.settlementNoByDate,
            deps.couponsByIsin.get(order.isin) ?? null,
        );
        return acc;
    }, {});
}

export async function analyzeOrderInfoStructure(
    options?: { sampleSize?: number },
): Promise<OrderInfoStructureAnalysis> {
    const orders = await db.dataBase.order.findMany({
        orderBy: { id: "desc" },
        take: options?.sampleSize,
        include: {
            customerProfile: {
                select: {
                    id: true,
                    userName: true,
                    firstName: true,
                    middleName: true,
                    lastName: true,
                    emailAddress: true,
                    phoneNo: true,
                    legalEntityName: true,
                },
            },
        },
    });

    if (orders.length === 0) {
        return {
            totalOrders: 0,
            fields: [],
            exists: [],
            doesNotExist: [],
            mayExist: [],
            mayNotExist: [],
            samples: [],
        };
    }

    const deps = await loadOrderDataDependencies(orders);
    const samples = orders.map((order) => {
        const {
            tradeKey,
            settleOrder,
            negotiation,
            rfqMaster,
            resolvedCustomer,
            rfqParticipantInfo,
        } = resolveRfqContext(order, deps);
        return buildOrderData(
            order,
            deps.bondByIsin.get(order.isin) ?? null,
            settleOrder,
            deps.customerBondByOrderId.get(order.id) ?? null,
            deps.receiptPdfOptionByOrderNumber.get(
                tradeKey || order.reqOrderNumber || order.orderNumber,
            ) ?? null,
            deps.logsByOrderId.get(order.id) ?? [],
            rfqMaster,
            negotiation,
            resolvedCustomer,
            rfqParticipantInfo,
            deps.settlementNoByDate,
            deps.couponsByIsin.get(order.isin) ?? null,
        );
    });

    const fieldStats = new Map<string, { present: number; missing: number }>();
    for (const sample of samples) {
        for (const { field, value } of flattenOrderData(sample)) {
            const current = fieldStats.get(field) ?? { present: 0, missing: 0 };
            if (hasMeaningfulValue(value)) {
                current.present += 1;
            } else {
                current.missing += 1;
            }
            fieldStats.set(field, current);
        }
    }

    const fields: OrderInfoFieldCoverage[] = [...fieldStats.entries()]
        .map(([field, stats]) => {
            let classification: OrderInfoFieldCoverage["classification"];
            if (stats.present === samples.length) {
                classification = "exists";
            } else if (stats.present === 0) {
                classification = "does_not_exist";
            } else {
                classification = "may_exist";
            }

            return {
                field,
                present: stats.present,
                missing: stats.missing,
                classification,
            };
        })
        .sort((a, b) => a.field.localeCompare(b.field));

    return {
        totalOrders: samples.length,
        fields,
        exists: fields.filter((field) => field.classification === "exists").map((field) => field.field),
        doesNotExist: fields
            .filter((field) => field.classification === "does_not_exist")
            .map((field) => field.field),
        mayExist: fields
            .filter((field) => field.present > 0 && field.missing > 0)
            .map((field) => field.field),
        mayNotExist: fields
            .filter((field) => field.present > 0 && field.missing > 0)
            .map((field) => field.field),
        samples: samples.slice(0, 5),
    };
}

export default getOrderInfo;
