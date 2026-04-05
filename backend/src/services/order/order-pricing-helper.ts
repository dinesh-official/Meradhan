type BondSettlementResult = {
    /**
     * Deal (trade) date used for record-keeping after applying your
     * "shift deal date to the next working day if it can't be processed"
     * rule.
     */
    dealDate: string; // YYYY-MM-DD (UTC calendar date)
    /** First working day **after** `dealDate` (funds/securities exchange). */
    settlementDate: string; // YYYY-MM-DD (UTC calendar date)
    settlementOrder: "T+0" | "T+1";
    /**
     * Settlement cycle relative to the *original* order placement:
     * - `T+0` if executed during trading hours on a working day
     * - `T+1` otherwise — `dealDate` is the **next working day** from execution
     *   (after hours → next calendar working day; weekend/holiday → next open day)
     */
    dealOrder: "T+0" | "T+1";
    /**
     * `true` when `executionDateTime` is a working day (Mon–Fri, not a holiday) **and**
     * the time is within 9:00 AM–4:45 PM **UTC** (same window as `tradingStartMinutes` / `tradingCutoffMinutes`).
     */
    allowTrade: boolean;
    /** Weekday name of `dealDate` (e.g. `"Thursday"`) in UTC. */
    dealDay: string;
    /** Weekday name of `settlementDate` in UTC. */
    settlementDay: string;
    allowSettlement: ("T+0" | "T+1")[];

};

type BondSettlementOptions = {
    /** Inclusive trading window start (24h, minutes). Default: 09:00 UTC. */
    tradingStartMinutes?: number;
    /** Inclusive trading window cutoff (24h, minutes). Default: 16:45 UTC. */
    tradingCutoffMinutes?: number;
    /**
     * Extra market holidays as `YYYY-MM-DD` (**UTC** calendar dates), merged with
     * {@link DEFAULT_BOND_MARKET_HOLIDAYS}.
     */
    holidays?: string[];
};

/** 2026 bond market closed dates (stored as UTC calendar dates). */
const DEFAULT_BOND_MARKET_HOLIDAYS: readonly string[] = [
    "2026-01-15",
    "2026-01-26",
    "2026-02-19",
    "2026-03-03",
    "2026-03-19",
    "2026-03-26",
    "2026-03-31",
    "2026-04-01",
    "2026-04-03",
    "2026-04-14",
    "2026-05-01",
    "2026-05-28",
    "2026-06-26",
    "2026-08-26",
    "2026-09-14",
    "2026-10-02",
    "2026-10-20",
    "2026-11-10",
    "2026-11-24",
    "2026-12-25",
];

const DEFAULT_TRADING_START = 9 * 60; // 09:00 UTC
const DEFAULT_TRADING_CUTOFF = 16 * 60 + 45; // 16:45 UTC

function pad2(n: number) {
    return String(n).padStart(2, "0");
}

/** `YYYY-MM-DD` for the **UTC** calendar date of this instant. */
function toUTCISODate(date: Date): string {
    const y = date.getUTCFullYear();
    const m = pad2(date.getUTCMonth() + 1);
    const d = pad2(date.getUTCDate());
    return `${y}-${m}-${d}`;
}

/** Minutes since midnight in UTC (0–1439). */
function utcMinutesSinceMidnight(date: Date): number {
    return date.getUTCHours() * 60 + date.getUTCMinutes();
}

/** `Date` at 00:00 UTC for the given `YYYY-MM-DD` calendar date. */
function utcMidnightForISODate(isoDate: string): Date {
    return new Date(`${isoDate.slice(0, 10)}T00:00:00.000Z`);
}

/** Add signed calendar days to a UTC `YYYY-MM-DD`. */
function addUTCCalendarDays(isoDate: string, delta: number): string {
    const [y, m, d] = isoDate.split("-").map(Number) ?? [];
    const noonUtc = new Date(Date.UTC(y!, m! - 1, d! + delta, 12, 0, 0));
    return toUTCISODate(noonUtc);
}

/** 0 = Sunday … 6 = Saturday for this UTC calendar date. */
function utcDayOfWeek(isoDate: string): number {
    const [y, m, d] = isoDate.split("-").map(Number) ?? [];
    return new Date(Date.UTC(y!, m! - 1, d!, 12, 0, 0)).getUTCDay();
}

const WEEKDAY_NAMES = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
] as const;

function utcDayName(isoDate: string) {
    return WEEKDAY_NAMES[utcDayOfWeek(isoDate)];
}

function isWorkingDayUTC(isoDate: string, holidays: Set<string>) {
    const dow = utcDayOfWeek(isoDate);
    if (dow === 0 || dow === 6) return false;
    if (holidays.has(isoDate)) return false;
    return true;
}

function isWorkingDay(date: Date, holidays: Set<string>) {
    return isWorkingDayUTC(toUTCISODate(date), holidays);
}

/** First working day on or after the UTC calendar date of `from`. */
function firstWorkingDayOnOrAfter(from: Date, holidays: Set<string>) {
    let iso = toUTCISODate(from);
    let d = utcMidnightForISODate(iso);
    while (!isWorkingDayUTC(iso, holidays)) {
        iso = addUTCCalendarDays(iso, 1);
        d = utcMidnightForISODate(iso);
    }
    return d;
}

/** First working day strictly after the UTC calendar date of `from`. */
function firstWorkingDayAfterCalendarDay(from: Date, holidays: Set<string>) {
    const nextIso = addUTCCalendarDays(toUTCISODate(from), 1);
    return firstWorkingDayOnOrAfter(utcMidnightForISODate(nextIso), holidays);
}

function isWithinTradingHoursUTC(date: Date, startMin: number, cutoffMin: number) {
    const minutes = utcMinutesSinceMidnight(date);
    return minutes >= startMin && minutes <= cutoffMin;
}

/** Whether trading is allowed at `executionDateTime` (UTC working day + 9:00–16:45 UTC by default). */
function isBondMarketOpenForTrade(
    executionDateTime: Date,
    options: BondSettlementOptions = {}
): boolean {
    const tradingStartMinutes = options.tradingStartMinutes ?? DEFAULT_TRADING_START;
    const tradingCutoffMinutes = options.tradingCutoffMinutes ?? DEFAULT_TRADING_CUTOFF;
    const holidays = new Set([...DEFAULT_BOND_MARKET_HOLIDAYS, ...(options.holidays ?? [])]);
    return (
        isWorkingDay(executionDateTime, holidays) &&
        isWithinTradingHoursUTC(executionDateTime, tradingStartMinutes, tradingCutoffMinutes)
    );
}

/**
 * Computes bond deal/settlement dates using:
 * - Trading hours: 09:00–16:45 **UTC** (Mon–Fri only)
 * - If not processable the same day (after cutoff, weekend, holiday),
 *   shift `dealDate` to the next working day.
 * - `settlementDate` is always the next working day **after** `dealDate`.
 */
function computeBondSettlement(
    executionDateTime: Date,
    options: BondSettlementOptions = {}
): BondSettlementResult {

    const tradingStartMinutes = options.tradingStartMinutes ?? DEFAULT_TRADING_START;
    const tradingCutoffMinutes = options.tradingCutoffMinutes ?? DEFAULT_TRADING_CUTOFF;

    const holidays = new Set([...DEFAULT_BOND_MARKET_HOLIDAYS, ...(options.holidays ?? [])]);

    const executionIsWorkingDay = isWorkingDay(executionDateTime, holidays);
    const executionInHours = isWithinTradingHoursUTC(
        executionDateTime,
        tradingStartMinutes,
        tradingCutoffMinutes
    );

    const originalOrderCycle: BondSettlementResult["dealOrder"] =
        executionIsWorkingDay && executionInHours ? "T+0" : "T+1";
    const allowTrade = executionIsWorkingDay && executionInHours;

    const dealDateObj =
        executionIsWorkingDay && executionInHours
            ? utcMidnightForISODate(toUTCISODate(executionDateTime))
            : executionIsWorkingDay && !executionInHours
                ? firstWorkingDayAfterCalendarDay(executionDateTime, holidays)
                : firstWorkingDayOnOrAfter(executionDateTime, holidays);

    const dealDate = toUTCISODate(dealDateObj);
    const settlementDateObj = firstWorkingDayAfterCalendarDay(dealDateObj, holidays);
    const settlementDate = toUTCISODate(settlementDateObj);
    const dealDay = utcDayName(dealDate);
    const settlementDay = utcDayName(settlementDate);

    return {
        dealDate,
        settlementDate,
        dealOrder: originalOrderCycle,
        allowTrade,
        dealDay: dealDay ?? "",
        settlementOrder: "T+1",
        settlementDay: settlementDay ?? "",
        allowSettlement: originalOrderCycle === "T+0" ? ["T+0", "T+1"] : ["T+1"],
    };
}

const MS_PER_DAY = 86_400_000;

/** Calendar days from `startYmd` to `endYmd` (ISO date prefix), using UTC midnights. */
const daysBetween = (startYmd: string, endYmd: string): number => {
    const start = utcMidnightForISODate(startYmd.slice(0, 10));
    const end = utcMidnightForISODate(endYmd.slice(0, 10));
    return Math.round((end.getTime() - start.getTime()) / MS_PER_DAY);
};


const calculateStampDuty = (principal: number) => {
    const rawStampDuty = principal * 0.000001;
    const stampDuty =
        rawStampDuty < 0.5 ? 0 : rawStampDuty < 1.5 ? 1 : rawStampDuty;
    return {
        stampDuty: stampDuty,
    };
}




const principalAmount = (faceValue: number, quantity: number, cleanPrice: number) => {
    const quantumPrice = faceValue * quantity;
    const quantumPriceInCrores = (quantumPrice * (cleanPrice / 100)).toString();
    return Number(quantumPriceInCrores);
}




function isUnderShutPeriod(
    settlementDate: Date,
    nextCouponDate: Date,
    recordDays: number
): { isUnderShutPeriod: boolean; recordDate: Date; noOfAccrualDays: number } {
    const settlementYmd = toUTCISODate(settlementDate);
    const nextYmd = toUTCISODate(nextCouponDate);
    const recordYmd = addUTCCalendarDays(nextYmd, -recordDays);

    const settlementMid = utcMidnightForISODate(settlementYmd);
    const nextMid = utcMidnightForISODate(nextYmd);
    const recordDate = utcMidnightForISODate(recordYmd);

    const isUnderShutPeriod =
        settlementMid.getTime() >= recordDate.getTime() &&
        settlementMid.getTime() < nextMid.getTime();

    const noOfAccrualDays = Math.floor(
        (nextMid.getTime() - settlementMid.getTime()) / MS_PER_DAY
    );

    return {
        isUnderShutPeriod,
        recordDate,
        noOfAccrualDays,
    };
}



/**
 * Accrued coupon for the period from `lastCouponDate` to `settlementDate` (ACT/365).
 * `couponRate` is annual % of face (e.g. 7.5 for 7.5% p.a.).
 */
const accruedInterest = (
    { faceValue, quantity, couponRate, lastCouponDate, nextCouponDate, settlementDate, recordDays }: {
        faceValue: number,
        quantity: number,
        couponRate: number,
        lastCouponDate: Date,
        nextCouponDate: Date,
        settlementDate: Date,
        recordDays: number
    }
) => {
    const quantumPrice = faceValue * quantity;
    const annualCoupon = quantumPrice * (couponRate / 100);
    const daysAccrued = daysBetween(
        toUTCISODate(lastCouponDate),
        toUTCISODate(settlementDate),
    );
    const checkUnderShutPeriod = isUnderShutPeriod(settlementDate, nextCouponDate, recordDays);
    const noOfAccrualDays = checkUnderShutPeriod.isUnderShutPeriod ? checkUnderShutPeriod.noOfAccrualDays : daysAccrued;
    const raw = annualCoupon * (noOfAccrualDays / 365);
    // if isUnderShutPeriod is true, then accruedInterest should be negative
    const accruedInterest = checkUnderShutPeriod.isUnderShutPeriod ? -(raw) : (raw);

    return {
        accruedInterest: accruedInterest,
        noOfAccrualDays,
        isUnderShutPeriod: checkUnderShutPeriod.isUnderShutPeriod,
        recordDate: checkUnderShutPeriod.recordDate,
    }
};


type BondOrderPricingData = {
    faceValue: number;
    quantity: number;
    cleanPrice: number;
    couponRate: number;
    lastCouponDate: string;
    recordDays: number;
    nextCouponDate: string;
}


export const computeBondOrderPricingData = (params: BondOrderPricingData) => {
    const settlementDate = computeBondSettlement(new Date());

    const principal = principalAmount(params.faceValue, params.quantity, params.cleanPrice);
    const settlementMidnight = utcMidnightForISODate(settlementDate.settlementDate);
    const accruedIntr = accruedInterest({
        faceValue: params.faceValue,
        quantity: params.quantity,
        couponRate: params.couponRate,
        lastCouponDate: utcMidnightForISODate(params.lastCouponDate.slice(0, 10)),
        nextCouponDate: utcMidnightForISODate(params.nextCouponDate.slice(0, 10)),
        settlementDate: settlementMidnight,
        recordDays: params.recordDays,
    });
    const stampDuty = calculateStampDuty(principal);
    const payAmount = (principal + accruedIntr.accruedInterest + stampDuty.stampDuty);


    return ({
        couponRate: params.couponRate,
        faceValue: params.faceValue,
        quantity: params.quantity,
        cleanPrice: params.cleanPrice,
        dealDate: settlementDate.dealDate,
        dealOrder: settlementDate.dealOrder,
        allowTrade: settlementDate.allowTrade,
        dealDay: settlementDate.dealDay,
        settlementDate: settlementDate.settlementDate,
        lastCouponDate: params.lastCouponDate,
        settlementOrder: settlementDate.settlementOrder,
        settlementDay: settlementDate.settlementDay,
        principalAmount: principal,
        accruedInterest: accruedIntr.accruedInterest,
        stampDuty: stampDuty.stampDuty,
        noOfAccrualDays: accruedIntr.isUnderShutPeriod ? -accruedIntr.noOfAccrualDays : accruedIntr.noOfAccrualDays,
        isUnderShutPeriod: accruedIntr.isUnderShutPeriod,
        recordDate: accruedIntr.recordDate,
        settlementAmount: payAmount,
    });
}
