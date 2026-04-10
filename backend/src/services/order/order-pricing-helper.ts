
/* =========================
   TYPES
========================= */

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
const DEFAULT_TRADING_CUTOFF = 11 * 60 + 45; // 11:45 IST

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
========================= */

export const computeBondOrderPricingData = (
    params: BondOrderPricingData
) => {
    console.log(params);

    const settlement = computeBondSettlement(new Date());

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

    console.log(total);


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


// console.log(computeBondOrderPricingData({

//     faceValue: 100000,
//     quantity: 1,
//     cleanPrice: 98.1368,
//     couponRate: 9.1,
//     lastCouponDate: "2026-01-08",
//     recordDays: 15,
//     nextCouponDate: "2026-04-08",
// }));
// console.log(new Date().toISOString());
