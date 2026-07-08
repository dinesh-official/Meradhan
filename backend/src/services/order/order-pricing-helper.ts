
/* =========================
   TYPES
========================= */

import { db } from "@core/database/database";

type BondSettlementResult = {
    dealDate: string;
    settlementDate: string;
    settlementOrder: "T+0" | "T+1";
    dealOrder: "T+0" | "T+1";
    allowTrade: boolean;
    dealDay: string;
    settlementDay: string;
    allowSettlement: ("T+0" | "T+1")[];
};

type BondSettlementOptions = {
    tradingStartMinutes?: number;
    tradingCutoffMinutes?: number;
    holidays?: string[];
};

type BondOrderPricingData = {
    isin: string;
    faceValue: number;
    quantity: number;
    cleanPrice: number;
    couponRate: number;
    lastCouponDate: string;
    recordDays: number;
    nextCouponDate: string;
};

/* =========================
   CONSTANTS
========================= */

// ✅ UPDATED MARKET WINDOW (UTC)
const DEFAULT_TRADING_START = 3 * 60 + 45;// 16:45 IST == 11:15 UTC
const DEFAULT_TRADING_CUTOFF = 11 * 60 + 15; // 11:15 UTC

export const DEFAULT_BOND_MARKET_HOLIDAYS: readonly string[] = [
    "2026-01-15", "2026-01-26", "2026-02-19", "2026-03-03", "2026-03-19",
    "2026-03-26", "2026-03-31", "2026-04-01", "2026-04-03", "2026-04-14",
    "2026-05-01", "2026-05-28", "2026-06-26", "2026-08-26", "2026-09-14",
    "2026-10-02", "2026-10-20", "2026-11-10", "2026-11-24", "2026-12-25",
];

const WEEKDAY_NAMES = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
] as const;

const MS_PER_DAY = 86_400_000;

/* =========================
   UTC HELPERS
========================= */

function pad2(n: number) {
    return String(n).padStart(2, "0");
}

function toUTCISODate(date: Date): string {

    return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`;
}

export function toISTISODate(date: Date): string {
    // Convert instant → IST calendar date, then format as YYYY-MM-DD.
    // We shift by +05:30 and then read UTC parts to avoid local timezone effects.
    const ist = new Date(date.getTime() + 330 * 60 * 1000);
    return `${ist.getUTCFullYear()}-${pad2(ist.getUTCMonth() + 1)}-${pad2(ist.getUTCDate())}`;
}

function utcMinutesSinceMidnight(date: Date): number {
    return date.getUTCHours() * 60 + date.getUTCMinutes();
}

function utcMidnightForISODate(isoDate: string): Date {
    return new Date(`${isoDate.split("T")[0]}T00:00:00.000Z`);
}

function addUTCCalendarDays(isoDate: string, delta: number): string {
    const [y, m, d] = isoDate.split("-").map(Number);
    const dt = new Date(Date.UTC(y!, m! - 1, d! + delta, 12));
    return toUTCISODate(dt);
}

function utcDayOfWeek(isoDate: string): number {
    const [y, m, d] = isoDate.split("-").map(Number);
    return new Date(Date.UTC(y!, m! - 1, d!, 12)).getUTCDay();
}

function utcDayName(isoDate: string): string | undefined {
    return WEEKDAY_NAMES[utcDayOfWeek(isoDate)];
}

/* =========================
   WORKING DAY
========================= */

function isWorkingDayUTC(isoDate: string, holidays: Set<string>) {
    const dow = utcDayOfWeek(isoDate);
    return dow !== 0 && dow !== 6 && !holidays.has(isoDate);
}

function isWorkingDay(date: Date, holidays: Set<string>) {
    return isWorkingDayUTC(toUTCISODate(date), holidays);
}

/* =========================
   WORKING DAY NAVIGATION
========================= */

function firstWorkingDayOnOrAfter(from: Date, holidays: Set<string>) {
    let iso = toUTCISODate(from);

    while (!isWorkingDayUTC(iso, holidays)) {
        iso = addUTCCalendarDays(iso, 1);
    }

    return utcMidnightForISODate(iso);
}

export function firstWorkingDayAfter(from: Date, holidays: Set<string>) {
    const next = addUTCCalendarDays(toUTCISODate(from), 1);
    return firstWorkingDayOnOrAfter(utcMidnightForISODate(next), holidays);
}

/* =========================
   TRADING WINDOW
========================= */

function isWithinTradingHoursUTC(date: Date, start: number, end: number) {
    const minutes = utcMinutesSinceMidnight(date);
    return minutes >= start && minutes <= end;
}

/* =========================
   CORE SETTLEMENT
========================= */

function computeBondSettlement(
    executionDateTime: Date,
    options: BondSettlementOptions = {}
): BondSettlementResult {

    const start = options.tradingStartMinutes ?? DEFAULT_TRADING_START; // 03:30
    const end = options.tradingCutoffMinutes ?? DEFAULT_TRADING_CUTOFF; // 12:00

    const holidays = new Set([
        ...DEFAULT_BOND_MARKET_HOLIDAYS,
        ...(options.holidays ?? []),
    ]);

    const iso = toUTCISODate(executionDateTime);
    const minutes = utcMinutesSinceMidnight(executionDateTime);

    const isWorking = isWorkingDay(executionDateTime, holidays);

    let dealDateObj: Date;
    let dealOrder: "T+0" | "T+1";
    let allowTrade: boolean;

    /* =========================
       CASE HANDLING
    ========================= */

    if (!isWorking) {
        // ❌ weekend / holiday
        dealDateObj = firstWorkingDayOnOrAfter(executionDateTime, holidays);
        dealOrder = "T+1";
        allowTrade = false;
    }

    else if (minutes < start) {
        // 🟢 BEFORE MARKET OPEN → treat as T+0
        dealDateObj = utcMidnightForISODate(iso);
        dealOrder = "T+0";
        allowTrade = false;
    }

    else if (minutes >= start && minutes <= end) {
        // 🟢 DURING MARKET → normal T+0
        dealDateObj = utcMidnightForISODate(iso);
        dealOrder = "T+0";
        allowTrade = true;
    }

    else {
        // 🔴 AFTER MARKET CLOSE → move to next working day
        dealDateObj = firstWorkingDayAfter(executionDateTime, holidays);
        dealOrder = "T+1";
        allowTrade = false;
    }

    const settlementDateObj = firstWorkingDayAfter(dealDateObj, holidays);

    return {
        dealDate: toUTCISODate(dealDateObj),
        settlementDate: toUTCISODate(settlementDateObj),
        dealOrder,
        allowTrade,
        dealDay: utcDayName(toUTCISODate(dealDateObj)) ?? "",
        settlementDay: utcDayName(toUTCISODate(settlementDateObj)) ?? "",
        settlementOrder: "T+1",
        allowSettlement: dealOrder === "T+0" ? ["T+0", "T+1"] : ["T+1"],
    };
}

/* =========================
   CALCULATIONS
========================= */

export const calculateStampDuty = (principal: number) => {
    const raw = principal * 0.000001;
    const amount = (raw < 0.5 ? 0 : raw < 1.5 ? 1 : raw);
    return Number(amount.toFixed());
};

const principalAmount = (faceValue: number, quantity: number, cleanPrice: number) => {
    return faceValue * quantity * (cleanPrice / 100);
};

const daysBetween = (start: string, end: string): number => {
    const s = utcMidnightForISODate(start);
    const e = utcMidnightForISODate(end);
    return Math.round((e.getTime() - s.getTime()) / MS_PER_DAY);
};

/* =========================
   SHUT PERIOD
========================= */

function isUnderShutPeriod(
    settlementDate: Date,
    nextCouponDate: Date,
    recordDays: number
) {
    const recordDate = utcMidnightForISODate(
        addUTCCalendarDays(toUTCISODate(nextCouponDate), -recordDays)
    );

    const isUnder =
        settlementDate >= recordDate && settlementDate < nextCouponDate;

    const days = Math.floor(
        (nextCouponDate.getTime() - settlementDate.getTime()) / MS_PER_DAY
    );

    return { isUnderShutPeriod: isUnder, recordDate, noOfAccrualDays: days };
}

/**
 * Whether settlement falls in shut period for a specific coupon due date.
 * Same rule as `getPayoutDates` (skip next coupon) and
 * `getLastNextCouponDateBasedOnSettlementDate` (`isUnderShutPeriod` for the next coupon).
 */
export function isSettlementUnderShutPeriodForCouponDue(
    settlement: Date,
    dueDate: Date,
    recordDate: Date | null,
    recordDays: number | null | undefined,
): boolean {
    const settlementDtRaw = new Date(settlement);
    if (Number.isNaN(settlementDtRaw.getTime())) return false;

    const istYmd = settlementDtRaw.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
    const settlementDt = new Date(`${istYmd}`);

    let recordDateResolved =
        recordDate instanceof Date && !Number.isNaN(recordDate.getTime()) ? recordDate : null;

    if (!recordDateResolved) {
        const daysRaw = recordDays;
        const days =
            typeof daysRaw === "number" && Number.isFinite(daysRaw)
                ? Math.floor(daysRaw)
                : null;
        if (days != null && days > 0) {
            recordDateResolved = utcMidnightForISODate(
                addUTCCalendarDays(toUTCISODate(dueDate), -days),
            );
        }
    }

    if (!recordDateResolved) return false;

    return (
        settlementDt.getTime() >= recordDateResolved.getTime() &&
        settlementDt.getTime() < dueDate.getTime()
    );
}

/* =========================
   ACCRUED INTEREST
========================= */

export const accruedInterest = (params: {
    faceValue: number;
    quantity: number;
    couponRate: number;
    lastCouponDate: Date;
    nextCouponDate: Date;
    settlementDate: Date;
    recordDays: number;
}) => {
    const shut = isUnderShutPeriod(
        params.settlementDate,
        params.nextCouponDate,
        params.recordDays
    );
    // console.log((params.nextCouponDate).toISOString().split("T")[0], params.settlementDate.toISOString().split("T")[0]);

    if ((params.nextCouponDate).toISOString().split("T")[0] == params.settlementDate.toISOString().split("T")[0]) {
        return {
            accruedInterest: 0,
            noOfAccrualDays: 0,
            isUnderShutPeriod: true,
            recordDate: shut.recordDate,
        };
    }

    const quantum = params.faceValue * params.quantity;
    const annual = quantum * (params.couponRate / 100);

    const daysAccruedSinceLast = daysBetween(
        toUTCISODate(params.lastCouponDate),
        toUTCISODate(params.settlementDate),
    );
    const displayAccrualDays = Math.max(0, daysAccruedSinceLast);

    const daysToNextCoupon = shut.noOfAccrualDays;
    const interestAccrualDays = shut.isUnderShutPeriod
        ? daysToNextCoupon
        : displayAccrualDays;

    const raw = annual * (interestAccrualDays / 365);

    return {
        accruedInterest: shut.isUnderShutPeriod ? -raw : raw,
        /**
         * Normal: days since last coupon (positive).
         * Shut period: days to next coupon as negative (ex-interest / calc convention).
         */
        noOfAccrualDays: shut.isUnderShutPeriod
            ? -daysToNextCoupon
            : displayAccrualDays,
        isUnderShutPeriod: shut.isUnderShutPeriod,
        recordDate: shut.recordDate,
    };
};

/** Accrued interest amount from stored day count (calc / CRM autofill convention). */
function accruedInterestFromStoredDays(params: {
    faceValue: number;
    quantity: number;
    couponRate: number;
    accrualDays: number;
}): number {
    if (!Number.isFinite(params.accrualDays) || params.accrualDays === 0) return 0;
    const quantum = params.faceValue * params.quantity;
    const annual = quantum * (params.couponRate / 100);
    const raw = annual * (Math.abs(params.accrualDays) / 365);
    return params.accrualDays < 0 ? -raw : raw;
}

/* =========================
   MAIN

   UTC 30-dec2026 18:30:00
   IST 30-dec2026
========================= */

export const computeBondOrderPricingData = async (
    params: BondOrderPricingData,
    options?: {
        executionDateTime?: Date;
        settlementType?: "T+0" | "T+1";
        useCleanPrice?: boolean;
    },
) => {
    const settlement = computeBondSettlement(options?.executionDateTime ?? new Date());
    if (options?.settlementType === "T+0") {
        settlement.settlementDate = settlement.dealDate;
        settlement.settlementDay = settlement.dealDay;
        settlement.settlementOrder = "T+0";
    }

    const settlementDt = utcMidnightForISODate(settlement.settlementDate);
    const bondInfo = await db.dataBase.bonds.findUnique({
        where: { isin: params.isin },
    });

    const bondIstDateToYmd = (d: Date | null | undefined): string | undefined => {
        if (!(d instanceof Date) || Number.isNaN(d.getTime())) return undefined;
        return toUTCISODate(d);
    };
    const paramDateToYmd = (s: string | undefined): string | undefined => {
        if (!s?.trim()) return undefined;
        const d = new Date(s);
        if (Number.isNaN(d.getTime())) return undefined;
        return toUTCISODate(d);
    };

    const lastCouponYmd =
        bondIstDateToYmd(bondInfo?.lastCouponDateIst) ??
        bondIstDateToYmd(bondInfo?.lastCouponDate) ??
        paramDateToYmd(params.lastCouponDate) ??
        params.lastCouponDate;
    const nextCouponYmd =
        bondIstDateToYmd(bondInfo?.nextCouponDateIst) ??
        bondIstDateToYmd(bondInfo?.nextCouponDate) ??
        paramDateToYmd(params.nextCouponDate) ??
        params.nextCouponDate;
    const recordDaysResolved =
        typeof bondInfo?.recordDays === "number" && Number.isFinite(bondInfo.recordDays)
            ? bondInfo.recordDays
            : params.recordDays;

    const faceValue =
        typeof bondInfo?.faceValue === "number" && Number.isFinite(bondInfo.faceValue)
            ? bondInfo.faceValue
            : params.faceValue;
    const couponRate =
        typeof bondInfo?.couponRate === "number" && Number.isFinite(bondInfo.couponRate)
            ? Number(bondInfo.couponRate)
            : params.couponRate;

    const principal = principalAmount(
        faceValue,
        params.quantity,
        params.cleanPrice,
    );

    const storedPrincipalPerUnit =
        typeof bondInfo?.principalAmount === "number" &&
            Number.isFinite(bondInfo.principalAmount)
            ? bondInfo.principalAmount
            : null;
    const storedConsiderationPerUnit =
        typeof bondInfo?.totalConsideration === "number" &&
            Number.isFinite(bondInfo.totalConsideration)
            ? bondInfo.totalConsideration
            : null;

    const accrued = accruedInterest({
        faceValue,
        quantity: params.quantity,
        couponRate,
        lastCouponDate: utcMidnightForISODate(lastCouponYmd),
        nextCouponDate: utcMidnightForISODate(nextCouponYmd),
        settlementDate: settlementDt,
        recordDays: recordDaysResolved,
    });

    const noOfAccrualDaysResolved =
        bondInfo?.accruedInterestDays != null &&
            Number.isFinite(bondInfo.accruedInterestDays)
            ? bondInfo.accruedInterestDays
            : accrued.noOfAccrualDays;

    const storedAccruedPerUnit =
        typeof bondInfo?.accruedInterest === "number" &&
            Number.isFinite(bondInfo.accruedInterest)
            ? bondInfo.accruedInterest
            : null;

    const accruedInterestResolved =
        storedAccruedPerUnit != null
            ? storedAccruedPerUnit * params.quantity
            : bondInfo?.accruedInterestDays != null &&
                Number.isFinite(bondInfo.accruedInterestDays)
                ? accruedInterestFromStoredDays({
                    faceValue,
                    quantity: params.quantity,
                    couponRate,
                    accrualDays: bondInfo.accruedInterestDays,
                })
                : accrued.accruedInterest;

    const isUnderShutPeriodResolved =
        bondInfo?.accruedInterestDays != null &&
            Number.isFinite(bondInfo.accruedInterestDays)
            ? bondInfo.accruedInterestDays < 0
            : accrued.isUnderShutPeriod;

    const recordDateResolved =
        bondInfo?.recordDateIst instanceof Date &&
            !Number.isNaN(bondInfo.recordDateIst.getTime())
            ? bondInfo.recordDateIst
            : bondInfo?.recordDate instanceof Date &&
                !Number.isNaN(bondInfo.recordDate.getTime())
                ? bondInfo.recordDate
                : accrued.recordDate;

    const stampDuty = calculateStampDuty(
        storedPrincipalPerUnit != null
            ? storedPrincipalPerUnit * params.quantity
            : principal,
    );
    const principalResolved =
        storedPrincipalPerUnit != null
            ? storedPrincipalPerUnit * params.quantity
            : principal;
    const totalConsiderationResolved =
        storedConsiderationPerUnit != null
            ? storedConsiderationPerUnit * params.quantity
            : principalResolved + accruedInterestResolved;
    const settlementAmount =
        typeof bondInfo?.settlementAmount === "number" &&
            Number.isFinite(bondInfo.settlementAmount) &&
            params.quantity === 1 &&
            storedAccruedPerUnit != null
            ? bondInfo.settlementAmount
            : totalConsiderationResolved + stampDuty;
    const yieldRaw = bondInfo?.yield;
    const yieldNum =
        yieldRaw != null && Number.isFinite(Number(yieldRaw))
            ? Number(yieldRaw)
            : undefined;

    return {
        ...params,
        ...settlement,
        settlementDate: settlement.settlementDate,
        settlementDay: utcDayName(settlement.settlementDate) ?? settlement.settlementDay,
        cleanPrice: params.cleanPrice,
        principalAmount: principalResolved,
        accruedInterest: accruedInterestResolved,
        stampDuty,
        settlementAmount,
        totalConsideration: totalConsiderationResolved,
        noOfAccrualDays: noOfAccrualDaysResolved,
        isUnderShutPeriod: isUnderShutPeriodResolved,
        recordDate: recordDateResolved,
        recordDays: recordDaysResolved,
        lastCouponDate: lastCouponYmd,
        nextCouponDate: nextCouponYmd,
        ...(yieldNum != null ? { yield: yieldNum } : {}),
    };
};

function fmtLocalCalcMoney(n: number): string {
    return n.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

/**
 * In-house manual provider pricing (no external calc API).
 * Principal + accrued interest + stamp duty using bond schedule and T+1 IST settlement.
 */
export async function computeLocalProviderBondPricing(opts: {
    isin: string;
    quantity: number;
    cleanPricePct: number;
}) {
    const bond = await db.dataBase.bonds.findUnique({ where: { isin: opts.isin } });
    if (!bond) {
        throw new Error(`Bond not found: ${opts.isin}`);
    }

    const quantity =
        Number.isFinite(opts.quantity) && opts.quantity > 0 ? opts.quantity : 1;
    const cleanPrice =
        Number.isFinite(opts.cleanPricePct) && opts.cleanPricePct > 0
            ? opts.cleanPricePct
            : 0;
    if (cleanPrice <= 0) {
        throw new Error("Provider clean price is required for local manual calc");
    }

    const faceValue = Number(bond.faceValue);
    const couponRate = Number(bond.couponRate);
    const settlement = computeBondSettlement(new Date());
    const settlementDate = settlement.settlementDate;
    const settlementDt = utcMidnightForISODate(settlementDate);
    const couponDates = await resolveCouponDatesForSettlement(
        opts.isin,
        settlementDt,
        bond,
    );
    const lastCouponDate = couponDates.lastCouponDate;
    const nextCouponDate = couponDates.nextCouponDate;
    const recordDays = couponDates.recordDays;

    if (!lastCouponDate || !nextCouponDate) {
        throw new Error(
            "Bond is missing lastCouponDate or nextCouponDate required for local pricing",
        );
    }

    const principal = principalAmount(faceValue, quantity, cleanPrice);
    const accrued = accruedInterest({
        faceValue,
        quantity,
        couponRate,
        lastCouponDate: utcMidnightForISODate(lastCouponDate),
        nextCouponDate: utcMidnightForISODate(nextCouponDate),
        settlementDate: settlementDt,
        recordDays,
    });
    const stampDuty = calculateStampDuty(principal);
    const totalConsideration = principal + accrued.accruedInterest;
    const settlementAmount = totalConsideration + stampDuty;
    const yieldNum =
        bond.yield != null && Number.isFinite(bond.yield) ? bond.yield : 0;

    return {
        quantity,
        settlement,
        settlementDate,
        lastCouponDate,
        nextCouponDate,
        recordDate: accrued.recordDate ? toUTCISODate(accrued.recordDate) : null,
        recordDays,
        principalAmount: principal,
        totalAccruedInterest: accrued.accruedInterest,
        stampDuty,
        totalConsideration,
        settlementAmount,
        noOfAccrualDays: accrued.noOfAccrualDays,
        isUnderShutPeriod: accrued.isUnderShutPeriod,
        cleanPrice,
        sellPrice: cleanPrice,
        yield: yieldNum,
        faceValue,
        couponRate,
    };
}

export async function buildLocalManualProviderAutofillResponse(
    isin: string,
    opts: {
        quantity: number;
        providerPrice: number;
        providerQuantity?: number;
    },
) {
    const local = await computeLocalProviderBondPricing({
        isin,
        quantity: opts.quantity,
        cleanPricePct: opts.providerPrice,
    });

    const calcSnapshot = {
        accrued_days: local.noOfAccrualDays,
        final_price: fmtLocalCalcMoney(local.cleanPrice),
        final_yield: `${local.yield.toFixed(4)}%`,
        final_yield_raw: local.yield,
        total_ai: fmtLocalCalcMoney(local.totalAccruedInterest),
        settlement_amount: fmtLocalCalcMoney(local.settlementAmount),
        principal_amount: fmtLocalCalcMoney(local.principalAmount),
        total_consideration: fmtLocalCalcMoney(local.totalConsideration),
        stamp_duty: fmtLocalCalcMoney(local.stampDuty),
        settle_dt: local.settlementDate,
        period_status: local.isUnderShutPeriod ? "Shut Period" : "Normal",
    };

    return {
        isin,
        quantity: local.quantity,
        sources: {
            usedReferenceMetadata: true,
            usedCouponSchedule: true,
            yieldSource: "bonds" as const,
            usedProviderPrice: true,
            usedProviderQuantity: Boolean(
                opts.providerQuantity != null && opts.providerQuantity > 0,
            ),
            usedProviderSettlementDate: false,
        },
        suggested: {
            lastCouponDate: local.lastCouponDate,
            nextCouponDate: local.nextCouponDate,
            recordDate: local.recordDate,
            recordDays: local.recordDays,
            faceValue: local.faceValue,
            couponRate: local.couponRate,
            buyYield: local.yield,
            yield: local.yield,
            sellPrice: local.sellPrice,
            isUnderShutPeriod: local.isUnderShutPeriod,
        },
        pricing: {
            finalPrice: local.cleanPrice,
            finalYieldRaw: local.yield,
            settlementAmount: local.settlementAmount,
            totalAccruedInterest: local.totalAccruedInterest,
            principalAmount: local.principalAmount,
            totalConsideration: local.totalConsideration,
            calc: calcSnapshot,
        },
        margin: {},
    };
}


/**
 * Drop maturity calendar day when that month already has another coupon due date.
 * e.g. monthly 20-Dec + maturity 31-Dec → keep 20-Dec only.
 */
export function dropMaturityDayIfMonthHasCoupon(
    dates: Date[],
    maturity: Date | null,
): Date[] {
    if (!maturity || dates.length === 0) return dates;

    const matY = maturity.getUTCFullYear();
    const matM = maturity.getUTCMonth();
    const matD = maturity.getUTCDate();

    const monthHasOtherCoupon = dates.some((d) => {
        return (
            d.getUTCFullYear() === matY &&
            d.getUTCMonth() === matM &&
            d.getUTCDate() !== matD
        );
    });
    if (!monthHasOtherCoupon) return dates;

    return dates.filter(
        (d) =>
            !(
                d.getUTCFullYear() === matY &&
                d.getUTCMonth() === matM &&
                d.getUTCDate() === matD
            ),
    );
}

/**
 * Returns coupon due dates (as `DD-Mon`) from settlement for the next 12 months
 * (or until maturity if earlier).
 *
 * Shut-period rule:
 * - If settlement is within shut period for the *next* coupon (recordDate ≤ settlement < dueDate),
 *   skip that next coupon from the returned list.
 * - Else include it.
 */
export const getPayoutDates = async (isin: string, settlement: Date) => {
    const settlementDtRaw = new Date(settlement);
    if (Number.isNaN(settlementDtRaw.getTime())) return [];

    // Normalize to an IST calendar moment to avoid UTC date shifting.
    // We anchor at 12:00 IST for stable day/month/year comparisons.
    const istYmd = settlementDtRaw.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }); // YYYY-MM-DD
    const settlementDt = new Date(`${istYmd}`);

    const [meta, rows] = await Promise.all([
        db.dataBase.bondReferenceMetadata.findUnique({ where: { isin } }),
        db.dataBase.bondReferenceCouponPaymentDate.findMany({
            where: { isin },
            orderBy: { dueDate: "asc" },
        }),
    ]);

    const maturityDate =
        meta?.maturityDateIst instanceof Date && !Number.isNaN(meta.maturityDateIst.getTime())
            ? meta.maturityDateIst
            : null;

    const oneYearLater = new Date(
        Date.UTC(
            settlementDt.getUTCFullYear() + 1,
            settlementDt.getUTCMonth(),
            settlementDt.getUTCDate(),
            12,
        ),
    );
    const endLimit = maturityDate
        ? new Date(Math.min(maturityDate.getTime(), oneYearLater.getTime()))
        : oneYearLater;

    const dueDates = rows
        .map((r) => (r.dueDateIst instanceof Date ? r.dueDateIst : null))
        .filter((d): d is Date => d instanceof Date && !Number.isNaN(d.getTime()))
        .filter((d) => d.getTime() >= settlementDt.getTime() && d.getTime() <= endLimit.getTime());

    if (dueDates.length === 0) return [];

    // Next coupon row (first dueDate >= settlement).
    const nextRow = rows.find(
        (r) =>
            r.dueDateIst instanceof Date &&
            !Number.isNaN(r.dueDateIst.getTime()) &&
            r.dueDateIst.getTime() >= settlementDt.getTime(),
    );

    let skipNext = false;
    if (nextRow?.dueDateIst instanceof Date) {
        const due = nextRow.dueDateIst;
        const recordDaysRaw = nextRow.recordDays;
        const recordDays =
            typeof recordDaysRaw === "number" && Number.isFinite(recordDaysRaw)
                ? Math.floor(recordDaysRaw)
                : null;

        const recordDate =
            nextRow.recordDateIst instanceof Date && !Number.isNaN(nextRow.recordDateIst.getTime())
                ? nextRow.recordDateIst
                : recordDays != null
                    ? utcMidnightForISODate(
                        addUTCCalendarDays(toUTCISODate(due), -recordDays),
                    )
                    : null;

        if (recordDate) {
            const shut = isUnderShutPeriod(settlementDt, due, recordDays ?? 0);
            // More strict: use actual recordDate from data if available.
            skipNext = settlementDt.getTime() >= recordDate.getTime() && settlementDt.getTime() < due.getTime();
            // If recordDays missing, rely on computed shut (will be false when recordDays=0).
            if (recordDays == null) skipNext = shut.isUnderShutPeriod;
        }
    }

    const out = dropMaturityDayIfMonthHasCoupon(
        skipNext ? dueDates.slice(1) : dueDates,
        maturityDate,
    );
    const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;
    return out.map((d) => {
        // ✅ FIX: Use UTC date parts directly to match the date stored in DB.
        // Do NOT convert to IST here — that adds +5:30 and can roll the date forward by 1 day
        // if the underlying timestamp is at/after 18:30 UTC.
        const dd = d.getUTCDate();
        const monthName = MONTHS[d.getUTCMonth()] ?? "Jan";
        return `${dd}-${monthName}`;
    });
};


export const getLastNextCouponDateBasedOnSettlementDate = async (isin: string, settlement: Date) => {
    const settlementDt = new Date(settlement);
    if (Number.isNaN(settlementDt.getTime())) {
        return {
            lastCouponDate: null,
            nextCouponDate: null,
            recordDate: null,
            isUnderShutPeriod: false,
            recordDays: null,
        };
    }

    const rows = await db.dataBase.bondReferenceCouponPaymentDate.findMany({
        where: { isin },
        orderBy: { dueDate: "asc" },
    });




    const couponRows = rows
        .map((row) => {
            const dueDate =
                row.dueDate instanceof Date && !Number.isNaN(row.dueDate.getTime())
                    ? row.dueDate
                    : null;
            if (!dueDate) return null;

            const recordDays =
                typeof row.recordDays === "number" && Number.isFinite(row.recordDays)
                    ? Math.floor(row.recordDays)
                    : null;

            const recordDate =
                row.recordDate instanceof Date && !Number.isNaN(row.recordDate.getTime())
                    ? row.recordDate
                    : recordDays != null
                        ? utcMidnightForISODate(
                            addUTCCalendarDays(toUTCISODate(dueDate), -recordDays),
                        )
                        : null;

            return {
                dueDate,
                recordDate,
                recordDays,
            };
        })
        .filter(
            (
                row,
            ): row is {
                dueDate: Date;
                recordDate: Date | null;
                recordDays: number | null;
            } => row !== null,
        )
        .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

    if (couponRows.length === 0) {
        return {
            lastCouponDate: null,
            nextCouponDate: null,
            recordDate: null,
            isUnderShutPeriod: false,
            recordDays: null,
        };
    }

    let lastCouponDate: Date | null = null;
    let nextCouponRow:
        | {
            dueDate: Date;
            recordDate: Date | null;
            recordDays: number | null;
        }
        | null = null;

    for (const row of couponRows) {
        if (row.dueDate.getTime() <= settlementDt.getTime()) {
            lastCouponDate = row.dueDate;
            continue;
        }
        nextCouponRow = row;
        break;
    }

    if (!lastCouponDate && nextCouponRow) {
        const nextIdx = couponRows.findIndex(
            (row) => row.dueDate.getTime() === nextCouponRow?.dueDate.getTime(),
        );
        if (nextIdx > 0) {
            lastCouponDate = couponRows[nextIdx - 1]?.dueDate ?? null;
        }
    }

    const nextCouponDate = nextCouponRow?.dueDate ?? null;
    const recordDate = nextCouponRow?.recordDate ?? null;
    const recordDays = nextCouponRow?.recordDays ?? null;

    let underShutPeriod = false;
    if (nextCouponDate && recordDate) {
        underShutPeriod =
            settlementDt.getTime() >= recordDate.getTime() &&
            settlementDt.getTime() < nextCouponDate.getTime();
    } else if (nextCouponDate && recordDays != null) {
        underShutPeriod = isUnderShutPeriod(settlementDt, nextCouponDate, recordDays).isUnderShutPeriod;
    }


    return {
        lastCouponDate: lastCouponDate ? toUTCISODate(lastCouponDate) : null,
        nextCouponDate: nextCouponDate ? toUTCISODate(nextCouponDate) : null,
        recordDate: recordDate ? toUTCISODate(recordDate) : null,
        isUnderShutPeriod: underShutPeriod,
        recordDays,
    };
};

/**
 * Resolve last/next coupon dates for pricing at a settlement anchor.
 * Coupon schedule wins over bond-row snapshots (often stale vs settlement).
 */
export async function resolveCouponDatesForSettlement(
    isin: string,
    settlement: Date,
    bondRow?: {
        lastCouponDateIst?: Date | null;
        nextCouponDateIst?: Date | null;
        recordDays?: number | null;
    } | null,
) {
    const settlementDt = Number.isNaN(settlement.getTime())
        ? utcMidnightForISODate(toISTISODate(new Date()))
        : settlement;

    const couponMeta = await getLastNextCouponDateBasedOnSettlementDate(
        isin,
        settlementDt,
    );
    const scheduleLast = await getLastCouponDateFromReferenceData(
        isin,
        settlementDt,
    );
    const scheduleNext = await getNextCouponDate(isin, settlementDt);

    const bondLast =
        bondRow?.lastCouponDateIst instanceof Date &&
            !Number.isNaN(bondRow.lastCouponDateIst.getTime())
            ? toUTCISODate(bondRow.lastCouponDateIst)
            : null;
    const bondNext =
        bondRow?.nextCouponDateIst instanceof Date &&
            !Number.isNaN(bondRow.nextCouponDateIst.getTime())
            ? toUTCISODate(bondRow.nextCouponDateIst)
            : null;

    const lastCouponDate = scheduleLast ?? bondLast ?? couponMeta.lastCouponDate;
    const nextCouponDate = scheduleNext ?? bondNext ?? couponMeta.nextCouponDate;
    const recordDays =
        couponMeta.recordDays != null && Number.isFinite(couponMeta.recordDays)
            ? couponMeta.recordDays
            : typeof bondRow?.recordDays === "number" &&
                Number.isFinite(bondRow.recordDays)
                ? bondRow.recordDays
                : 7;

    return {
        lastCouponDate,
        nextCouponDate,
        recordDays,
        isUnderShutPeriod: couponMeta.isUnderShutPeriod,
    };
}

/**
 * Returns the last coupon due date (YYYY-MM-DD) on/before the settlement date.
 * Uses IST calendar date for the settlement anchor to avoid timezone shifting.
 */
export const getLastCouponDate = async (isin: string, settlement: Date): Promise<string | null> => {
    const settlementDtRaw = new Date(settlement);
    if (Number.isNaN(settlementDtRaw.getTime())) return null;

    // Anchor settlement at 12:00 IST on the same IST calendar day.
    const istYmd = settlementDtRaw.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }); // YYYY-MM-DD
    const settlementDt = new Date(`${istYmd}`);

    const rows = await db.dataBase.bondReferenceCouponPaymentDate.findMany({
        where: { isin },
        orderBy: { dueDate: "asc" },
    });

    const dueDates = rows
        .map((r) => (r.dueDateIst instanceof Date ? r.dueDateIst : null))
        .filter((d): d is Date => d instanceof Date && !Number.isNaN(d.getTime()))
        .sort((a, b) => a.getTime() - b.getTime());

    let last: Date | null = null;
    for (const d of dueDates) {
        if (d.getTime() <= settlementDt.getTime()) last = d;
        else break;
    }
    if (!last) return null;

    // ✅ FIX: Use UTC date parts (not IST timezone) so the displayed date matches DB.
    // IST conversion adds +5:30 and can shift the day if the timestamp has a time component
    // past 18:30 UTC.
    const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;
    const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

    const dd = pad2(last.getUTCDate());
    const mmm = MONTHS[last.getUTCMonth()] ?? "Jan";
    const yyyy = String(last.getUTCFullYear());
    const weekday = DAYS[last.getUTCDay()] ?? "";
    console.log(weekday);

    return `${dd}-${mmm}-${yyyy}${` (${weekday})`}`;
};


export const getNextCouponDate = async (isin: string, settlement: Date) => {
    const settlementDt = new Date(settlement);
    if (Number.isNaN(settlementDt.getTime())) return null;

    const rows = await db.dataBase.bondReferenceCouponPaymentDate.findMany({
        where: { isin, dueDate: { gt: settlementDt } },
        orderBy: { dueDate: "asc" },
    });

    const nextCouponDate = rows[0]?.dueDate ?? null;
    return nextCouponDate ? toUTCISODate(nextCouponDate) : null;
};

export const getBondNextCouponDate = async (isin: string) => {
    const rows = await db.dataBase.bonds.findFirst({
        where: { isin },
    });
    const nextCouponDate = rows?.nextCouponDateIst ?? null;
    return nextCouponDate ? toUTCISODate(nextCouponDate) : null;
};


export const getBondLastCouponDate = async (isin: string) => {
    const rows = await db.dataBase.bonds.findFirst({
        where: { isin },
    });

    const lastCouponDate = rows?.lastCouponDate ?? null;
    return lastCouponDate ? toUTCISODate(lastCouponDate) : null;
};

export const getLastCouponDateFromReferenceData = async (isin: string, settlement: Date) => {
    const settlementDt = new Date(settlement);
    if (Number.isNaN(settlementDt.getTime())) return null;

    const rows = await db.dataBase.bondReferenceCouponPaymentDate.findMany({
        where: { isin, dueDate: { lt: settlementDt } },
        orderBy: { dueDate: "desc" },
    });

    const lastCouponDate = rows[0]?.dueDate ?? null;
    return lastCouponDate ? toUTCISODate(lastCouponDate) : null;
};

// console.log(getNextCouponDate("INE0NES07279", new Date("2026-04-11")));


// console.log(computeBondOrderPricingData({
//     faceValue: 100000,
//     quantity: 1,
//     cleanPrice: 98.1368,
//     couponRate: 9.1,
//     lastCouponDate: "2026-01-08",
//     recordDays: 15,
//     nextCouponDate: "2026-04-08",
// }));
// const dates = (await getPayoutDates("INE0NES07279", new Date("2026-04-11")));
// console.log(new Set(dates));

// console.log(new Date().toISOString());
