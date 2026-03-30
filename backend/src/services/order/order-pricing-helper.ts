type BondSettlementResult = {
    /**
     * Deal (trade) date used for record-keeping after applying your
     * "shift deal date to the next working day if it can't be processed"
     * rule.
     */
    dealDate: string; // YYYY-MM-DD (IST calendar date)
    /** First working day **after** `dealDate` (funds/securities exchange). */
    settlementDate: string; // YYYY-MM-DD (IST calendar date)
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
     * the time is within 9:00 AM–4:45 PM **IST** (same window as `tradingStartMinutes` / `tradingCutoffMinutes`).
     */
    allowTrade: boolean;
    /** Weekday name of `dealDate` (e.g. `"Thursday"`) in IST. */
    dealDay: string;
    /** Weekday name of `settlementDate` in IST. */
    settlementDay: string;
    allowSettlement: ("T+0" | "T+1")[];

};

type BondSettlementOptions = {
    /** Inclusive trading window start (24h, minutes). Default: 09:00 IST. */
    tradingStartMinutes?: number;
    /** Inclusive trading window cutoff (24h, minutes). Default: 16:45 IST. */
    tradingCutoffMinutes?: number;
    /**
     * Extra market holidays as `YYYY-MM-DD` (**IST** calendar dates), merged with
     * {@link DEFAULT_BOND_MARKET_HOLIDAYS}.
     */
    holidays?: string[];
};

/** Indian Standard Time — all trading hours and market dates use this zone. */
const BOND_MARKET_TIMEZONE = "Asia/Kolkata" as const;

/** 2026 bond market closed dates (same set as DD-MMM-YYYY list, stored as IST calendar dates). */
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

const DEFAULT_TRADING_START = 9 * 60; // 09:00 IST
const DEFAULT_TRADING_CUTOFF = 16 * 60 + 45; // 16:45 IST

const istDateFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: BOND_MARKET_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
});

const istTimePartsFormatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: BOND_MARKET_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
});

function pad2(n: number) {
    return String(n).padStart(2, "0");
}

/** `YYYY-MM-DD` for the **IST** calendar date of this instant. */
function toISTISODate(date: Date): string {
    return istDateFormatter.format(date);
}

/** Minutes since midnight in IST (0–1439). */
function istMinutesSinceMidnight(date: Date): number {
    const parts = istTimePartsFormatter.formatToParts(date);
    const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
    const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
    return hour * 60 + minute;
}

/** `Date` at 00:00 IST for the given IST calendar date. */
function istMidnightForISODate(isoDate: string): Date {
    return new Date(`${isoDate}T00:00:00+05:30`);
}

/** Add signed calendar days to an IST `YYYY-MM-DD` (no DST in India). */
function addISTCalendarDays(isoDate: string, delta: number): string {
    const [y, m, d] = isoDate.split("-").map(Number) ?? [];
    const noonIST = new Date(Date.UTC(y!, m! - 1, d! + delta, 6, 30, 0));
    return toISTISODate(noonIST);
}

/** 0 = Sunday … 6 = Saturday for this IST calendar date. */
function istDayOfWeek(isoDate: string): number {
    const d = new Date(`${isoDate}T12:00:00+05:30`);
    return d.getUTCDay();
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

function istDayName(isoDate: string) {
    return WEEKDAY_NAMES[istDayOfWeek(isoDate)];
}

function isWorkingDayIST(isoDate: string, holidays: Set<string>) {
    const dow = istDayOfWeek(isoDate);
    if (dow === 0 || dow === 6) return false;
    if (holidays.has(isoDate)) return false;
    return true;
}

function isWorkingDay(date: Date, holidays: Set<string>) {
    return isWorkingDayIST(toISTISODate(date), holidays);
}

/** First working day on or after the IST calendar date of `from`. */
function firstWorkingDayOnOrAfter(from: Date, holidays: Set<string>) {
    let iso = toISTISODate(from);
    let d = istMidnightForISODate(iso);
    while (!isWorkingDayIST(iso, holidays)) {
        iso = addISTCalendarDays(iso, 1);
        d = istMidnightForISODate(iso);
    }
    return d;
}

/** First working day strictly after the IST calendar date of `from`. */
function firstWorkingDayAfterCalendarDay(from: Date, holidays: Set<string>) {
    const nextIso = addISTCalendarDays(toISTISODate(from), 1);
    return firstWorkingDayOnOrAfter(istMidnightForISODate(nextIso), holidays);
}

function isWithinTradingHoursIST(date: Date, startMin: number, cutoffMin: number) {
    const minutes = istMinutesSinceMidnight(date);
    return minutes >= startMin && minutes <= cutoffMin;
}

/** Whether trading is allowed at `executionDateTime` (IST working day + 9:00–16:45 IST by default). */
function isBondMarketOpenForTrade(
    executionDateTime: Date,
    options: BondSettlementOptions = {}
): boolean {
    const tradingStartMinutes = options.tradingStartMinutes ?? DEFAULT_TRADING_START;
    const tradingCutoffMinutes = options.tradingCutoffMinutes ?? DEFAULT_TRADING_CUTOFF;
    const holidays = new Set([...DEFAULT_BOND_MARKET_HOLIDAYS, ...(options.holidays ?? [])]);
    return (
        isWorkingDay(executionDateTime, holidays) &&
        isWithinTradingHoursIST(executionDateTime, tradingStartMinutes, tradingCutoffMinutes)
    );
}

/**
 * Computes bond deal/settlement dates using:
 * - Trading hours: 09:00–16:45 **IST** (Mon–Fri only)
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
    const executionInHours = isWithinTradingHoursIST(
        executionDateTime,
        tradingStartMinutes,
        tradingCutoffMinutes
    );

    const originalOrderCycle: BondSettlementResult["dealOrder"] =
        executionIsWorkingDay && executionInHours ? "T+0" : "T+1";
    const allowTrade = executionIsWorkingDay && executionInHours;

    const dealDateObj =
        executionIsWorkingDay && executionInHours
            ? istMidnightForISODate(toISTISODate(executionDateTime))
            : executionIsWorkingDay && !executionInHours
                ? firstWorkingDayAfterCalendarDay(executionDateTime, holidays)
                : firstWorkingDayOnOrAfter(executionDateTime, holidays);

    const dealDate = toISTISODate(dealDateObj);
    const settlementDateObj = firstWorkingDayAfterCalendarDay(dealDateObj, holidays);
    const settlementDate = toISTISODate(settlementDateObj);
    const dealDay = istDayName(dealDate);
    const settlementDay = istDayName(settlementDate);

    return {
        dealDate,
        settlementDate,
        dealOrder: originalOrderCycle,
        allowTrade,
        dealDay: dealDay ?? "",
        settlementOrder: "T+1",
        settlementDay: settlementDay ?? "",
        allowSettlement: originalOrderCycle ==="T+0" ? ["T+0","T+1"] : ["T+1"],
    };
}

// eslint-disable-next-line no-console
console.log(computeBondSettlement(new Date("2026-04-06T16:40:00")));

/** Truncates toward zero to 2 decimal places (e.g. 0.09999999 → 0.09, not 0.10). */

const MS_PER_DAY = 86_400_000;

/** Calendar days from `startYmd` to `endYmd` (`YYYY-MM-DD`). */
const daysBetween = (startYmd: string, endYmd: string): number => {
    const utc = (ymd: string) =>
        Date.UTC(
            Number(ymd.slice(0, 4)),
            Number(ymd.slice(5, 7)) - 1,
            Number(ymd.slice(8, 10)),
        );
    return Math.round((utc(endYmd) - utc(startYmd)) / MS_PER_DAY);
};


const calculateStampDuty = (faceValue: number, quantity: number) => {
    const rawStampDuty = faceValue * quantity * 0.000001;
    const stampDuty =
        rawStampDuty < 0.5 ? 0 : rawStampDuty < 1.5 ? 1 : rawStampDuty;
    const totalAmount = faceValue * quantity + stampDuty;
    return {
        stampDuty: stampDuty,
        totalAmount: totalAmount,
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

    // Calculate record date
    const recordDate = new Date(nextCouponDate);
    recordDate.setDate(recordDate.getDate() - recordDays);

    // Condition: recordDate <= settlementDate < nextCouponDate
    const isUnderShutPeriod =
        settlementDate >= recordDate && settlementDate < nextCouponDate;

    // Calculate accrual days
    const msPerDay = 1000 * 60 * 60 * 24;
    const noOfAccrualDays = Math.floor(
        (nextCouponDate.getTime() - settlementDate.getTime()) / msPerDay
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
    const daysAccrued = daysBetween(lastCouponDate.toISOString(), settlementDate.toISOString());
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
    const stampDuty = calculateStampDuty(params.faceValue, params.quantity);
    const accruedIntr = accruedInterest({ faceValue: params.faceValue, quantity: params.quantity, couponRate: params.couponRate, lastCouponDate: new Date(params.lastCouponDate), nextCouponDate: new Date(params.nextCouponDate), settlementDate: new Date(settlementDate.settlementDate), recordDays: params.recordDays });
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
        noOfAccrualDays: accruedIntr.noOfAccrualDays,
        isUnderShutPeriod: accruedIntr.isUnderShutPeriod,
        recordDate: accruedIntr.recordDate,
        settlementAmount: payAmount,

    });
}
