
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
const DEFAULT_TRADING_START = 3 * 60 + 30; // 03:30 UTC
// 16:45 IST == 11:15 UTC
const DEFAULT_TRADING_CUTOFF = 11 * 60 + 15; // 11:15 UTC

const DEFAULT_BOND_MARKET_HOLIDAYS: readonly string[] = [
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

function firstWorkingDayAfter(from: Date, holidays: Set<string>) {
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

const calculateStampDuty = (principal: number) => {
    const raw = principal * 0.000001;
    return raw < 0.5 ? 0 : raw < 1.5 ? 1 : raw;
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

/* =========================
   ACCRUED INTEREST
========================= */

const accruedInterest = (params: {
    faceValue: number;
    quantity: number;
    couponRate: number;
    lastCouponDate: Date;
    nextCouponDate: Date;
    settlementDate: Date;
    recordDays: number;
}) => {

    const quantum = params.faceValue * params.quantity;
    const annual = quantum * (params.couponRate / 100);

    const daysAccrued = daysBetween(
        toUTCISODate(params.lastCouponDate),
        toUTCISODate(params.settlementDate)
    );

    const shut = isUnderShutPeriod(
        params.settlementDate,
        params.nextCouponDate,
        params.recordDays
    );

    const days = shut.isUnderShutPeriod
        ? shut.noOfAccrualDays
        : daysAccrued;

    const raw = annual * (days / 365);

    return {
        accruedInterest: shut.isUnderShutPeriod ? -raw : raw,
        noOfAccrualDays: shut.isUnderShutPeriod ? -days : days,
        isUnderShutPeriod: shut.isUnderShutPeriod,
        recordDate: shut.recordDate,
    };
};

/* =========================
   MAIN

   UTC 30-dec2026 18:30:00
   IST 30-dec2026
========================= */

export const computeBondOrderPricingData = (
    params: BondOrderPricingData,
    options?: {
        executionDateTime?: Date;
        settlementType?: "T+0" | "T+1";
    },
) => {
    const settlement = computeBondSettlement(options?.executionDateTime ?? new Date());
    if (options?.settlementType === "T+0") {
        settlement.settlementDate = settlement.dealDate;
        settlement.settlementDay = settlement.dealDay;
        settlement.settlementOrder = "T+0";
    }

    const principal = principalAmount(
        params.faceValue,
        params.quantity,
        params.cleanPrice
    );

    const accrued = accruedInterest({
        faceValue: params.faceValue,
        quantity: params.quantity,
        couponRate: params.couponRate,
        lastCouponDate: utcMidnightForISODate(params.lastCouponDate),
        nextCouponDate: utcMidnightForISODate(params.nextCouponDate),
        settlementDate: utcMidnightForISODate(settlement.settlementDate),
        recordDays: params.recordDays,
    });

    const stampDuty = calculateStampDuty(principal);

    const total = principal + accrued.accruedInterest + stampDuty;

    return {
        ...params,
        ...settlement,
        principalAmount: principal,
        accruedInterest: accrued.accruedInterest,
        stampDuty,
        settlementAmount: total,
        noOfAccrualDays: accrued.noOfAccrualDays,
        isUnderShutPeriod: accrued.isUnderShutPeriod,
        recordDate: accrued.recordDate,
    };
};


/**
 * Returns coupon due dates (as `YYYY-MM-DD`) from settlement → maturity (or next 1 year).
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
    const settlementDt = new Date(`${istYmd}T12:00:00+05:30`);

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
    const endLimit = maturityDate ? maturityDate : oneYearLater;

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

    const out = skipNext ? dueDates.slice(1) : dueDates;
    const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;
    return out.map((d) => {
        const ymd = d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }); // YYYY-MM-DD
        const [, mm, dd] = ymd.split("-");
        const monthName = MONTHS[(Number(mm) || 1) - 1] ?? "Jan";
        return `${Number(dd)}-${monthName}`;
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
        if (row.dueDate.getTime() < settlementDt.getTime()) {
            lastCouponDate = row.dueDate;
            continue;
        }
        nextCouponRow = row;
        break;
    }

    if (!lastCouponDate && nextCouponRow) {
        const nextIdx = couponRows.findIndex((row) => row.dueDate.getTime() === nextCouponRow?.dueDate.getTime());
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
 * Returns the last coupon due date (YYYY-MM-DD) on/before the settlement date.
 * Uses IST calendar date for the settlement anchor to avoid timezone shifting.
 */
export const getLastCouponDate = async (isin: string, settlement: Date): Promise<string | null> => {
    const settlementDtRaw = new Date(settlement);
    if (Number.isNaN(settlementDtRaw.getTime())) return null;

    // Anchor settlement at 12:00 IST on the same IST calendar day.
    const istYmd = settlementDtRaw.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }); // YYYY-MM-DD
    const settlementDt = new Date(`${istYmd}T12:00:00+05:30`);

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

    // Return as DD-MMM-YYYY (DayName) in IST (stable calendar date).
    const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
        weekday: "long",
    }).formatToParts(last);
    const get = (type: Intl.DateTimeFormatPartTypes) =>
        parts.find((p) => p.type === type)?.value ?? "";
    const dd = get("day").padStart(2, "0");
    const mmm = get("month") || "Jan";
    const yyyy = get("year");
    const weekday = get("weekday").toString();
    console.log(weekday);

    return `${dd}-${mmm}-${yyyy}${` (${weekday})`}`;
};




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
