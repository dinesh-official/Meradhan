
/* =========================
   TYPES
========================= */

import { db } from "@core/database/database";
import { parseDeriDataMoney, parseDeriDataRecordDateYmd } from "@services/deridata/deridata.calc.adapter";
import {
    calculatePriceToYield,
    calculateYieldToPrice,
} from "@services/deridata/deridata.calculator.client";
import { AppError, HttpStatus } from "@utils/error/AppError";
import { truncateDecimals } from "@utils/truncateDecimals";
import { calculateStampDuty } from "./stamp-duty";
import { calculateBondPricing } from "./bond-pricing";
import { resolveBondStampDuty } from "./stamp-duty";
import { loadInvestorCouponScheduleForPdf } from "./investor-coupon-entitlement";

export { calculateStampDuty } from "./stamp-duty";

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
    /** YTM (%) — preferred input when liveCalculator is deridata (yield → price). */
    ytm?: number;
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

/** Calendar YYYY-MM-DD → UTC midnight (settlement / coupon anchor). */
export function settlementDateFromYmd(ymd: string): Date {
    return utcMidnightForISODate(ymd);
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

export function computeBondSettlement(
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
    recordDays: number,
    recordDateOverride?: Date,
) {
    const recordDate =
        recordDateOverride instanceof Date &&
            !Number.isNaN(recordDateOverride.getTime())
            ? utcMidnightForISODate(toUTCISODate(recordDateOverride))
            : utcMidnightForISODate(
                addUTCCalendarDays(toUTCISODate(nextCouponDate), -recordDays),
            );

    const isUnder =
        settlementDate >= recordDate && settlementDate < nextCouponDate;

    const days = Math.floor(
        (nextCouponDate.getTime() - settlementDate.getTime()) / MS_PER_DAY
    );

    return { isUnderShutPeriod: isUnder, recordDate, noOfAccrualDays: days };
}

export type CashflowShutFlagInput = {
    settlementDateYmd: string;
    nextCouponDateYmd: string;
    recordDays: number;
    /** Coupon-schedule record date when known (wins over recordDays offset). */
    recordDateYmd?: string | null;
    /** Suppress shut when the next coupon is the bond maturity (DeriData convention). */
    maturityDateYmd?: string | null;
};

/**
 * DeriData `cashflow_shut_flag`: settlement is in ex-interest / shut window for the
 * upcoming coupon, except when that coupon is the final maturity payment.
 */
export function resolveCashflowShutFlag(input: CashflowShutFlagInput): boolean {
    const settlement = settlementDateFromYmd(input.settlementDateYmd);
    const nextCoupon = settlementDateFromYmd(
        input.nextCouponDateYmd || input.settlementDateYmd,
    );
    const recordDateYmd = input.recordDateYmd?.trim();
    const shut = isUnderShutPeriod(
        settlement,
        nextCoupon,
        input.recordDays,
        recordDateYmd ? settlementDateFromYmd(recordDateYmd) : undefined,
    );

    const nextYmd = toUTCISODate(nextCoupon);
    const maturityYmd = input.maturityDateYmd?.trim();
    if (shut.isUnderShutPeriod && maturityYmd && nextYmd === maturityYmd) {
        return false;
    }
    return shut.isUnderShutPeriod;
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
    /** Coupon-schedule record date; wins over recordDays-derived record date. */
    recordDateOverride?: Date;
    /**
     * DeriData `cashflow_shut_flag`. When set, drives shut vs normal accrual branch
     * (e.g. maturity coupon suppresses shut even inside the record window).
     */
    cashflowShutFlag?: boolean;
}) => {
    const shut = isUnderShutPeriod(
        params.settlementDate,
        params.nextCouponDate,
        params.recordDays,
        params.recordDateOverride,
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
    const effectiveShut = params.cashflowShutFlag ?? shut.isUnderShutPeriod;
    const interestAccrualDays = effectiveShut
        ? daysToNextCoupon
        : displayAccrualDays;

    const raw = annual * (interestAccrualDays / 365);

    return {
        accruedInterest: effectiveShut ? -raw : raw,
        /**
         * Normal: days since last coupon (positive).
         * Shut period: days to next coupon as negative (ex-interest / calc convention).
         */
        noOfAccrualDays: effectiveShut
            ? -daysToNextCoupon
            : displayAccrualDays,
        isUnderShutPeriod: effectiveShut,
        recordDate: shut.recordDate,
    };
};

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
        liveCalculator?: "deridata";
        /**
         * DeriData mode. Default is yield → price (`yield_to_price: true`).
         * Pass `"priceToYield"` only when calculating from a known clean price.
         */
        deridataMode?: "yieldToPrice" | "priceToYield";
        maturityDate?: Date | string | null;
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

    const accrued = accruedInterest({
        faceValue,
        quantity: params.quantity,
        couponRate,
        lastCouponDate: utcMidnightForISODate(lastCouponYmd),
        nextCouponDate: utcMidnightForISODate(nextCouponYmd),
        settlementDate: settlementDt,
        recordDays: recordDaysResolved,
    });

    const noOfAccrualDaysResolved = accrued.noOfAccrualDays;
    const accruedInterestResolved = accrued.accruedInterest;
    const isUnderShutPeriodResolved = accrued.isUnderShutPeriod;

    const recordDateResolved =
        bondInfo?.recordDateIst instanceof Date &&
            !Number.isNaN(bondInfo.recordDateIst.getTime())
            ? bondInfo.recordDateIst
            : bondInfo?.recordDate instanceof Date &&
                !Number.isNaN(bondInfo.recordDate.getTime())
                ? bondInfo.recordDate
                : accrued.recordDate;

    if (options?.liveCalculator === "deridata") {
        const maturityYmd =
            bondIstDateToYmd(bondInfo?.maturityDateIst) ??
            bondIstDateToYmd(bondInfo?.maturityDate) ??
            paramDateToYmd(
                typeof options.maturityDate === "string"
                    ? options.maturityDate
                    : options.maturityDate instanceof Date
                        ? options.maturityDate.toISOString()
                        : undefined,
            );
        const cashflowShutFlag = resolveCashflowShutFlag({
            settlementDateYmd: settlement.settlementDate,
            nextCouponDateYmd: nextCouponYmd,
            recordDays: recordDaysResolved,
            recordDateYmd:
                bondIstDateToYmd(bondInfo?.recordDateIst) ??
                bondIstDateToYmd(bondInfo?.recordDate) ??
                (accrued.recordDate ? toUTCISODate(accrued.recordDate) : null),
            maturityDateYmd: maturityYmd,
        });

        // Default Daily Data path: yield → price (`yield_to_price: true`).
        const deridataMode = options.deridataMode ?? "yieldToPrice";
        const inputYtm =
            params.ytm != null && Number.isFinite(params.ytm)
                ? params.ytm
                : bondInfo?.yield != null && Number.isFinite(Number(bondInfo.yield))
                    ? Number(bondInfo.yield)
                    : null;

        let liveCalc;
        if (deridataMode === "priceToYield") {
            if (!Number.isFinite(params.cleanPrice) || params.cleanPrice <= 0) {
                throw new AppError(
                    "Clean price is required for DeriData price-to-yield pricing",
                    {
                        statusCode: HttpStatus.BAD_REQUEST,
                        code: "DERIDATA_CLEAN_PRICE_REQUIRED",
                    },
                );
            }
            liveCalc = await calculatePriceToYield({
                isin: params.isin,
                valueDate: settlement.settlementDate,
                faceValue,
                quantity: params.quantity,
                cleanPrice: params.cleanPrice,
                cashflowShutFlag,
            });
        } else {
            if (inputYtm == null) {
                throw new AppError(
                    "Yield (YTM) is required for DeriData yield-to-price pricing",
                    {
                        statusCode: HttpStatus.BAD_REQUEST,
                        code: "DERIDATA_YTM_REQUIRED",
                    },
                );
            }
            liveCalc = await calculateYieldToPrice({
                isin: params.isin,
                valueDate: settlement.settlementDate,
                faceValue,
                quantity: params.quantity,
                ytm: inputYtm,
                cashflowShutFlag,
            });
        }

        // DeriData supplies TC / principal / accrued; stamp duty is computed locally
        // and added to get settlement amount.
        const principalResolved = parseDeriDataMoney(liveCalc.summary.principal);
        const accruedInterestResolved = parseDeriDataMoney(
            liveCalc.summary.accrued_int_bottom,
        );
        const totalConsiderationResolved = parseDeriDataMoney(
            liveCalc.summary.total_consideration,
        );
        const cleanPriceResolved = parseDeriDataMoney(liveCalc.summary.clean_price);
        const yieldNum =
            parseDeriDataMoney(liveCalc.summary.xirr) ??
            (deridataMode === "yieldToPrice" ? inputYtm : null);

        if (
            principalResolved == null ||
            accruedInterestResolved == null ||
            totalConsiderationResolved == null ||
            cleanPriceResolved == null
        ) {
            throw new AppError(
                "DeriData calculator returned incomplete pricing fields",
                {
                    statusCode: HttpStatus.BAD_GATEWAY,
                    code: "DERIDATA_INCOMPLETE_RESPONSE",
                },
            );
        }

        const stampDuty = calculateStampDuty(totalConsiderationResolved);
        const settlementAmount = totalConsiderationResolved + stampDuty;
        const recordDateYmd = parseDeriDataRecordDateYmd(liveCalc.record_date);

        return {
            ...params,
            ...settlement,
            settlementDate: settlement.settlementDate,
            settlementDay: utcDayName(settlement.settlementDate) ?? settlement.settlementDay,
            cleanPrice: cleanPriceResolved,
            principalAmount: principalResolved,
            accruedInterest: accruedInterestResolved,
            stampDuty,
            settlementAmount,
            totalConsideration: totalConsiderationResolved,
            noOfAccrualDays: accrued.noOfAccrualDays,
            isUnderShutPeriod: Boolean(liveCalc.cashflow_shut_flag ?? cashflowShutFlag),
            recordDate: recordDateYmd ?? (accrued.recordDate ? toUTCISODate(accrued.recordDate) : ""),
            recordDays: recordDaysResolved,
            lastCouponDate: lastCouponYmd,
            nextCouponDate: nextCouponYmd,
            ...(yieldNum != null ? { yield: yieldNum } : {}),
        };
    }

    const principalResolved = principal;
    const totalConsiderationResolved = principalResolved + accruedInterestResolved;
    const stampDuty = calculateStampDuty(totalConsiderationResolved);
    const settlementAmount = totalConsiderationResolved + stampDuty;
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
        recordDate: recordDateResolved ? toUTCISODate(recordDateResolved) : "",
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

    const accrued = accruedInterest({
        faceValue,
        quantity,
        couponRate,
        lastCouponDate: utcMidnightForISODate(lastCouponDate),
        nextCouponDate: utcMidnightForISODate(nextCouponDate),
        settlementDate: settlementDt,
        recordDays,
    });
    const snapshot = calculateBondPricing({
        faceValue,
        cleanPrice,
        accruedInterest:
            quantity > 0 && faceValue > 0
                ? (accrued.accruedInterest / quantity) * 100 / faceValue
                : 0,
        quantity,
    });
    const yieldNum =
        bond.yield != null && Number.isFinite(bond.yield) ? bond.yield : 0;

    const result = {
        quantity,
        settlement,
        settlementDate,
        lastCouponDate,
        nextCouponDate,
        recordDate: accrued.recordDate ? toUTCISODate(accrued.recordDate) : null,
        recordDays,
        principalAmount: snapshot.principalAmount,
        totalAccruedInterest: snapshot.accruedInterest,
        stampDuty: snapshot.stampDuty,
        totalConsideration: snapshot.totalConsideration,
        settlementAmount: snapshot.settlementAmount,
        noOfAccrualDays: accrued.noOfAccrualDays,
        isUnderShutPeriod: accrued.isUnderShutPeriod,
        cleanPrice,
        sellPrice: cleanPrice,
        yield: yieldNum,
        faceValue,
        couponRate,
    };


    return result;
}

export async function computeStoredBondOrderPricing(opts: {
    isin: string;
    quantity: number;
    settlementType?: "T+0" | "T+1";
}) {
    const bond = await db.dataBase.bonds.findUnique({ where: { isin: opts.isin } });
    if (!bond) {
        throw new Error(`Bond not found: ${opts.isin}`);
    }

    const quantity =
        Number.isFinite(opts.quantity) && opts.quantity > 0 ? opts.quantity : 1;
    const cleanPrice =
        bond.sellPrice != null && Number.isFinite(bond.sellPrice) && bond.sellPrice > 0
            ? bond.sellPrice
            : null;
    // `bonds.accruedInterest` stores DeriData `accrued_int_bottom` (₹ amount for pricingQuantity).
    const savedAccruedAmount =
        bond.accruedInterest != null && Number.isFinite(bond.accruedInterest)
            ? bond.accruedInterest
            : null;
    if (cleanPrice == null) {
        throw new Error("Bond is missing saved sell price required for local pricing");
    }
    if (savedAccruedAmount == null) {
        throw new Error("Bond is missing saved accrued interest required for local pricing");
    }

    const faceValue = Number(bond.faceValue);
    const pricingQuantity =
        bond.pricingQuantity != null &&
            Number.isFinite(bond.pricingQuantity) &&
            bond.pricingQuantity > 0
            ? bond.pricingQuantity
            : 1;

    // Scale CRM-saved ₹ accrued (for pricingQuantity) to the order quantity.
    // Do not call DeriData here — amounts come from autofill-saved bond fields.
    const accruedInterestAmount =
        (savedAccruedAmount / pricingQuantity) * quantity;
    const principalAmount = (cleanPrice * faceValue * quantity) / 100;
    const totalConsideration = principalAmount + accruedInterestAmount;
    const stampDuty = resolveBondStampDuty({
        totalConsideration,
        quantity,
        savedStampDuty: bond.stampDuty,
        savedPricingQuantity: bond.pricingQuantity,
    });
    const settlementAmount = totalConsideration + stampDuty;
    const accruedPctOfPar =
        faceValue > 0
            ? (savedAccruedAmount * 100) / (faceValue * pricingQuantity)
            : 0;

    const settlement = computeBondSettlement(new Date());
    if (opts.settlementType === "T+0") {
        settlement.settlementDate = settlement.dealDate;
        settlement.settlementDay = settlement.dealDay;
        settlement.settlementOrder = "T+0";
    }
    const settlementDt = utcMidnightForISODate(settlement.settlementDate);
    const couponDates = await resolveCouponDatesForSettlement(opts.isin, settlementDt, bond);
    const lastCouponDate = couponDates.lastCouponDate;
    const nextCouponDate = couponDates.nextCouponDate;
    const recordDays = couponDates.recordDays;

    if (!lastCouponDate || !nextCouponDate) {
        throw new Error(
            "Bond is missing lastCouponDate or nextCouponDate required for pricing",
        );
    }

    const recordDate =
        bond.recordDateIst instanceof Date && !Number.isNaN(bond.recordDateIst.getTime())
            ? toUTCISODate(bond.recordDateIst)
            : bond.recordDate instanceof Date && !Number.isNaN(bond.recordDate.getTime())
                ? toUTCISODate(bond.recordDate)
                : "";

    const accruedMeta = accruedInterest({
        faceValue,
        quantity,
        couponRate: Number(bond.couponRate),
        lastCouponDate: utcMidnightForISODate(lastCouponDate),
        nextCouponDate: utcMidnightForISODate(nextCouponDate),
        settlementDate: settlementDt,
        recordDays,
    });

    return {
        isin: bond.isin,
        faceValue,
        quantity,
        cleanPrice,
        couponRate: Number(bond.couponRate),
        dealDate: settlement.dealDate,
        dealOrder: settlement.dealOrder,
        allowTrade: settlement.allowTrade,
        allowSettlement: settlement.allowSettlement,
        dealDay: settlement.dealDay,
        settlementDate: settlement.settlementDate,
        lastCouponDate,
        settlementOrder: settlement.settlementOrder,
        settlementDay: settlement.settlementDay,
        principalAmount: truncateDecimals(principalAmount),
        principalAmountRaw: principalAmount,
        accruedInterest: truncateDecimals(accruedInterestAmount),
        stampDuty,
        noOfAccrualDays: accruedMeta.noOfAccrualDays,
        isUnderShutPeriod: accruedMeta.isUnderShutPeriod,
        recordDate: recordDate || (accruedMeta.recordDate ? toUTCISODate(accruedMeta.recordDate) : ""),
        settlementAmount: truncateDecimals(settlementAmount),
        totalConsideration: truncateDecimals(totalConsideration),
        yield:
            bond.yield != null && Number.isFinite(Number(bond.yield))
                ? Number(bond.yield)
                : undefined,
        recordDays,
        nextCouponDate,
        accruedInterestPerUnit: accruedPctOfPar,
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
 * Returns buyer-entitled coupon due dates (as `d-Mon`) from settlement for the
 * next 12 months (or until maturity if earlier).
 *
 * Delegates to `loadInvestorCouponScheduleForPdf` (settlement ≤ record date ⇒ buyer gets coupon).
 */
export const getPayoutDates = async (isin: string, settlement: Date) => {
    const schedule = await loadInvestorCouponScheduleForPdf(isin, settlement);
    return schedule.interestPaymentDates;
};

/**
 * Last contractual coupon with due ≤ settlement, formatted for PDF:
 * `DD-MMM-YYYY (Weekday)`.
 *
 * Delegates to `loadInvestorCouponScheduleForPdf`.
 */
export const getLastCouponDate = async (isin: string, settlement: Date): Promise<string | null> => {
    const schedule = await loadInvestorCouponScheduleForPdf(isin, settlement);
    return schedule.lastInterestPaymentDate;
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
        recordDate: couponMeta.recordDate,
        isUnderShutPeriod: couponMeta.isUnderShutPeriod,
    };
}

/**
 * Returns the last coupon due date (YYYY-MM-DD) on/before the settlement date.
 * Uses IST calendar date for the settlement anchor to avoid timezone shifting.
 */
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

    // Include coupon due on settlement day (lte) — that payment is the last IP.
    const rows = await db.dataBase.bondReferenceCouponPaymentDate.findMany({
        where: { isin, dueDate: { lte: settlementDt } },
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
