import { db } from "@core/database/database";
import {
    mapDeriDataToExternalCalcResponse,
    parseDeriDataMoney,
} from "@services/deridata/deridata.calc.adapter";
import {
    calculatePriceToYield,
    calculateYieldToPrice,
} from "@services/deridata/deridata.calculator.client";
import { getLastCouponDate, getLastNextCouponDateBasedOnSettlementDate, toISTISODate } from "@services/order/order-pricing-helper";
import moment from "moment";

type BondMaturityRange = "0-1" | "1-3" | "3-5" | "5-7" | "7-10" | "10-15" | "15+";

/** Start of “today” in Asia/Kolkata (same idea as `getBondMaturityRange`). */
function getTodayIstStart(): Date {
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/** Normalize a stored `Date` to IST calendar midnight for comparison. */
function toIstCalendarDate(d: Date): Date {
    const local = new Date(d.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    return new Date(local.getFullYear(), local.getMonth(), local.getDate());
}

/** Parse “Interest Payment Dates” cell: comma/semicolon/newline-separated tokens. */
function parseInterestPaymentDatesString(raw: string | null | undefined): Date[] {
    if (!raw?.trim()) return [];
    const formats = [
        "DD-MMM-YYYY",
        "DD-MMM-YY",
        "YYYY-MM-DD",
        "DD-MM-YYYY",
        "DD/MM/YYYY",
        "YYYY-MM-DDTHH:mm:ss.SSSZ",
    ];
    const out: Date[] = [];
    for (const part of raw.split(/[,;\n\r|]+/)) {
        const s = part.trim();
        if (!s) continue;
        const m = moment(s, formats, true);
        if (m.isValid()) out.push(m.toDate());
    }
    return out;
}

/**
 * From all coupon schedule instants: last = latest payment strictly before today (IST);
 * next = earliest payment on or after today (IST). De-dupes by IST calendar day.
 */
function pickLastAndNextCouponFromDates(dates: Date[]): {
    lastCouponDate: Date | null;
    nextCouponDate: Date | null;
} {
    if (dates.length === 0) {
        return { lastCouponDate: null, nextCouponDate: null };
    }
    const todayStart = getTodayIstStart();
    const byDay = new Map<number, Date>();
    for (const d of dates) {
        const cal = toIstCalendarDate(d);
        const k = cal.getTime();
        if (!byDay.has(k)) byDay.set(k, cal);
    }
    const sorted = [...byDay.values()].sort((a, b) => a.getTime() - b.getTime());
    let lastCouponDate: Date | null = null;
    let nextCouponDate: Date | null = null;
    for (const d of sorted) {
        const t = d.getTime();
        if (t < todayStart.getTime()) lastCouponDate = d;
        else {
            nextCouponDate = d;
            break;
        }
    }



    return { lastCouponDate, nextCouponDate };
}

/** Load `bond_reference_coupon_payment_dates` and derive last/next from `dueDate` + `interestPaymentDates`. */
async function getLastNextFromCouponPaymentSchedule(isin: string): Promise<{
    lastCouponDate: string | null;
    nextCouponDate: string | null;
} | null> {
    const rows = await db.dataBase.bondReferenceCouponPaymentDate.findMany({
        where: { isin },
        orderBy: { id: "asc" },
    });
    if (rows.length === 0) return null;
    const dates: Date[] = [];
    for (const r of rows) {
        if (r.dueDate) dates.push(r.dueDate);
        dates.push(...parseInterestPaymentDatesString(r.interestPaymentDates));
    }
    if (dates.length === 0) return null;
    const { lastCouponDate, nextCouponDate } = pickLastAndNextCouponFromDates(dates);

    const lastCDate = new Date((lastCouponDate?.getTime() ?? 0) + 5.5 * 60 * 60 * 1000);
    const nextCDate = new Date((nextCouponDate?.getTime() ?? 0) + 5.5 * 60 * 60 * 1000);
    return {
        lastCouponDate: lastCDate.toISOString().split("T")[0] ?? "",
        nextCouponDate: nextCDate.toISOString().split("T")[0] ?? "",
    };
}

const getBondMaturityRange = (maturityDate: Date): BondMaturityRange => {
    // today based on india time
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const diffTime = Math.abs(maturityDate.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 365) {
        return "0-1";
    }
    if (diffDays <= 1095) {
        return "1-3";
    }
    if (diffDays <= 1825) {
        return "3-5";
    }
    if (diffDays <= 2555) {
        return "5-7";
    }
    if (diffDays <= 3285) {
        return "7-10";
    }
    if (diffDays <= 4015) {
        return "10-15";
    }
    return "15+";
};



const getBondCurrentYield = async (isin: string) => {
    /// last pricing date
    const bond = await db.dataBase.bondPricedListConsolidated.findFirst({
        where: {
            isin: isin,
            timestamp: {
                lte: new Date(),
            }
        },
        orderBy: [{ timestamp: "desc" }],
    });

    if (bond) {
        return {
            yield: bond.yield,
            type: "consolidated",
        };
    }
    const myBond = await db.dataBase.bonds.findUnique({
        where: {
            isin,
        },
    });
    if (!myBond) {
        throw new Error(`Bond not found with isin: ${isin}`);
    }
    return {
        yield: myBond.buyYield,
        type: "bonds",
    };
};

const getMarginForBond = async ({ currentYield, maturityRange, rating, sectorName }: {
    sectorName: string;
    rating?: string;
    maturityRange: BondMaturityRange;
    currentYield: number;
}) => {

    console.log(currentYield, maturityRange, rating, sectorName);

    if (rating && rating !== "") {
        const margin = await db.dataBase.bondMargin.findFirst({
            where: {
                sectorName: sectorName,
                rating: rating,
            },
        });
        console.log(margin);
        if (margin) {
            switch (maturityRange) {
                case "0-1":
                    return margin.underOneYear;
                case "1-3":
                    return margin.oneToThreeYears;
                case "3-5":
                    return margin.threeToFiveYears;
                case "5-7":
                    return margin.fiveToSevenYears;
                case "7-10":
                    return margin.sevenToTenYears;
                case "10-15":
                    return margin.tenToFifteenYears;
                case "15+":
                    return margin.moreThanFifteenYears;
            }
        }
    }
    const defaultMargin = await db.dataBase.bondMargin.findFirst({
        where: {
            sectorName: sectorName ?? "",
        },
    });
    console.log(defaultMargin);
    if (!defaultMargin) {
        return null;
    }

    switch (maturityRange) {
        case "0-1":
            return defaultMargin.underOneYear;
        case "1-3":
            return defaultMargin.oneToThreeYears;
        case "3-5":
            return defaultMargin.threeToFiveYears;
        case "5-7":
            return defaultMargin.fiveToSevenYears;
        case "7-10":
            return defaultMargin.sevenToTenYears;
        case "10-15":
            return defaultMargin.tenToFifteenYears;
        case "15+":
            return defaultMargin.moreThanFifteenYears;
    }
}


const getBondMargin = async (isin: string) => {
    const bond = await db.dataBase.bonds.findUnique({
        where: {
            isin,
        },
    });

    if (!bond) {
        throw new Error(`Bond not found with isin: ${isin}`);
    }

    if (!bond.maturityDate) {
        throw new Error(`Maturity date not found for bond: ${isin}`);
    }

    const maturityRange = getBondMaturityRange(bond.maturityDate);
    const currentYield = await getBondCurrentYield(isin);
    const margin = await getMarginForBond({
        sectorName: bond.sectorName ?? "",
        rating: bond.creditRating ?? "",
        maturityRange,
        currentYield: currentYield.yield ?? 0,
    });

    const finalMargin = (currentYield.yield ?? bond.buyYield ?? 0) - (margin ?? 0);

    return {
        maturityRange,
        rating: bond.creditRating ?? "",
        sectorName: bond.sectorName ?? "",
        type: currentYield.type,
        isin,
        currentYield: currentYield.yield ?? 0,
        margin: margin ?? 0,
        yield: finalMargin,
        faceValue: bond.faceValue ?? 0,
        couponRate: bond.couponRate ?? 0,
    };
}


const getPaymentFrequency = (fec: string) => {

    if (fec === "MONTHLY") {
        return "Monthly";
    }
    if (fec === "QUARTERLY") {
        return "Quarterly";
    }
    if (fec === "HALF_YEARLY") {
        return "Semi-Annual";
    }
    if (fec === "YEARLY") {
        return "Annual";
    }
    if (fec === "ON_MATURITY") {
        return "On Maturity";
    }
    return "Monthly";
}

export const getDatefromReferenceData = async (isin: string) => {
    const scheduleDates = await getLastNextFromCouponPaymentSchedule(isin);

    const ref = await db.dataBase.bondReferenceMetadata.findUnique({
        where: {
            isin,
        },
    });

    if (!ref) {
        const b = await db.dataBase.bonds.findUnique({
            where: {
                isin,
            },
        });
        if (!b) {
            throw new Error(`Bond not found with isin: ${isin}`);
        }
        return {
            fromReferenceData: false,
            lastCouponDate: scheduleDates?.lastCouponDate ?? b.lastCouponDate?.toISOString().split("T")[0] ?? "",
            nextCouponDate: scheduleDates?.nextCouponDate ?? b.nextCouponDate?.toISOString().split("T")[0] ?? "",
            maturityDate: b.maturityDate,
            issueDate: b.dateOfAllotment,
            recordDays: b.recordDays,
            couponDatesFromPaymentSchedule: Boolean(scheduleDates),
            interestPaymentFrequency: getPaymentFrequency(b.interestPaymentFrequency),
        };
    }

    return {
        fromReferenceData: true,
        lastCouponDate: scheduleDates?.lastCouponDate ?? ref.lastCouponDate?.toISOString().split("T")[0] ?? "",
        nextCouponDate: scheduleDates?.nextCouponDate ?? ref.nextCouponDate?.toISOString().split("T")[0] ?? "",
        maturityDate: ref.maturityDate,
        issueDate: ref.issueDate,
        recordDays: ref.dayConvention,
        couponDatesFromPaymentSchedule: Boolean(scheduleDates),
        interestPaymentFrequency: ref.interestPaymentFrequency,

    };
}

export type ExternalCalcResponse = {
    accrued_days: number;
    /** Human-readable label paired with `accrued_days` (e.g. "Accrued Days"). */
    accrued_days_label?: string;
    cf_count: number;
    cf_rows: Array<{
        date: string;
        days: number;
        interest: string;
        num: number;
        /** "-" for coupon-only rows; formatted decimal (e.g. "10,000.00") on the final maturity row. */
        principal: string;
        total: string;
        total_raw: number;
    }>;
    final_price: string;
    final_yield: string;
    final_yield_raw: number;
    /** "Normal" | "Shut Period" — echoes the input. */
    period_status: string;
    principal_amount: string;
    quantity: string;
    running_total: string;
    settle_dt: string;
    settlement_amount: string;
    stamp_duty: string;
    total_ai: string;
    total_consideration: string;
    /** Non-fatal advisories from the calc engine (date adjustments, schedule warnings, etc.). */
    warnings?: string[];
};

function formatYmdAsiaKolkata(d: Date): string {
    return d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

function toYmdFromDate(d: Date | null | undefined): string {
    if (!d || Number.isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0] ?? "";
}

function firstYmdFromDates(...dates: (Date | null | undefined)[]): string | null {
    for (const x of dates) {
        const y = toYmdFromDate(x ?? undefined);
        if (y) return y;
    }
    return null;
}

function isValidYmd(s: string | undefined | null): boolean {
    return Boolean(s?.trim() && /^\d{4}-\d{2}-\d{2}$/.test(s.trim()));
}

/** Calc service (Python) errors if date fields parse to None — never send "". */
function addDaysToYmd(ymd: string, days: number): string {
    const [y, m, d] = ymd.split("-").map(Number);
    const dt = new Date(Date.UTC(y!, m! - 1, d! + days));
    return dt.toISOString().split("T")[0]!;
}

function addYearsToYmd(ymd: string, years: number): string {
    const [y, m, d] = ymd.split("-").map(Number);
    const dt = new Date(Date.UTC(y! + years, m! - 1, d!));
    return dt.toISOString().split("T")[0]!;
}

/** Whole calendar days from `aYmd` to `bYmd` (can be negative if b < a). */
function calendarDaysFromYmdToYmd(aYmd: string, bYmd: string): number {
    const a = new Date(`${aYmd.trim()}T12:00:00.000Z`).getTime();
    const b = new Date(`${bYmd.trim()}T12:00:00.000Z`).getTime();
    return Math.round((b - a) / 86_400_000);
}

function resolveCalcLastIp(
    scheduleYmd: string | undefined,
    bondLast: Date | null | undefined,
    settlementYmd: string,
): string {
    if (isValidYmd(scheduleYmd)) return scheduleYmd!.trim();
    const fromBond = toYmdFromDate(bondLast ?? undefined);
    if (fromBond) return fromBond;
    return addDaysToYmd(settlementYmd, -7);
}

function resolveCalcNextIp(
    scheduleYmd: string | undefined,
    bondNext: Date | null | undefined,
    settlementYmd: string,
    lastIpYmd: string,
): string {
    if (isValidYmd(scheduleYmd)) return scheduleYmd!.trim();
    const fromBond = toYmdFromDate(bondNext ?? undefined);
    if (fromBond) return fromBond;
    return addDaysToYmd(lastIpYmd, 30);
}

function resolveCalcMaturity(
    scheduleMaturity: Date | null | undefined,
    bondMaturity: Date | null | undefined,
    settlementYmd: string,
): string {
    const fromSchedule = scheduleMaturity
        ? toYmdFromDate(new Date(scheduleMaturity))
        : "";
    if (fromSchedule) return fromSchedule;
    const fromBond = toYmdFromDate(bondMaturity ?? undefined);
    if (fromBond) return fromBond;
    return addYearsToYmd(settlementYmd, 15);
}

export function parseCalcFormattedDecimal(s: string | null | undefined): number | null {
    if (s == null || !String(s).trim()) return null;
    const n = Number(String(s).replace(/,/g, "").trim());
    return Number.isFinite(n) ? n : null;
}

/**
 * Maps DB / reference strings to calc.meradhan.co `Payment_Frequency`.
 * The service expects Excel-style labels (e.g. **Annual**, not "Yearly") — otherwise it returns 400.
 */
function toCalcPaymentFrequency(raw: string | null | undefined): string {
    if (!raw?.trim()) return "Monthly";
    const u = raw.trim().toUpperCase().replace(/[\s-]+/g, "_");
    if (u === "MONTHLY") return "Monthly";
    if (u === "QUARTERLY") return "Quarterly";
    if (u === "HALF_YEARLY" || u === "SEMI_ANNUAL") return "Semi-Annual";
    if (u === "YEARLY") return "Annual";
    if (u === "ON_MATURITY") return "On Maturity";
    const lower = raw.trim().toLowerCase();
    if (lower.includes("quarter")) return "Quarterly";
    if (lower.includes("semi") || lower.includes("half")) return "Semi-Annual";
    if (lower.includes("month")) return "Monthly";
    if (lower.includes("year") || lower.includes("annual")) return "Annual";
    if (lower.includes("maturity")) return "On Maturity";
    return "Monthly";
}

/**
 * Maps a stored / user-supplied day convention to the calc service's expected label.
 * The calc form accepts `"Actual/Actual"` and `"Actual/365"` — defaults to `"Actual/Actual"`.
 */
function toCalcDayConvention(raw: string | null | undefined): "Actual/Actual" | "Actual/365" {
    if (!raw?.trim()) return "Actual/Actual";
    const u = raw.trim().toUpperCase().replace(/\s+/g, "");
    if (u.includes("ACT/365") || u.includes("ACTUAL/365") || u === "A/365") return "Actual/365";
    return "Actual/Actual";
}

/**
 * Calc service `Bond_Type`. Defaults to `"Bullet"` (overwhelmingly the case for INR NCDs).
 * Pass `"Amortizing"` along with `amort_schedule` only when the bond actually amortises.
 */
function toCalcBondType(raw: string | null | undefined): "Bullet" | "Amortizing" {
    const v = String(raw ?? "").trim().toLowerCase();
    if (v === "amortizing" || v === "amortising" || v === "amortized" || v.includes("amort")) {
        return "Amortizing";
    }
    return "Bullet";
}

const addIstTimezoneToDate = (date: string) => {
    const d = new Date(date)
    d.setHours(d.getHours() + 5)
    d.setMinutes(d.getMinutes() + 30)
    return d.toISOString().split("T")[0]!;
}

const removeIstTimezoneFromDate = (date: string) => {
    const d = new Date(date)
    d.setHours(d.getHours() - 5)
    d.setMinutes(d.getMinutes() - 30)
    return d.toISOString().split("T")[0]!;
}

function buildBondCalcServicePayload(args: {
    bondMargin: {
        yield: number;
        faceValue: number;
        couponRate: number;
    };
    dateData: Awaited<ReturnType<typeof getDatefromReferenceData>>;
    bond: {
        interestPaymentFrequency: string;
        faceValue: number | null;
        couponRate: number | null;
        lastCouponDate?: Date | null;
        nextCouponDate?: Date | null;
        maturityDate?: Date | null;
        dateOfAllotment?: Date | null;
        /** Bond row's day convention (e.g. "Actual/Actual"). Falls back to "Actual/Actual". */
        dayConvention?: string | null;
    };
    quantity: number;
    settlementDate: string;
    pricingYield: number;
    /** Reference sheet last/next coupon when bond row is empty */
    refLastCouponDate?: Date | null;
    refNextCouponDate?: Date | null;
    /**
     * Caller overrides for fields the calc service exposes via its UI form.
     * All optional — when omitted, sensible defaults matching the calc form are used:
     *  - periodStatus       → "Normal"
     *  - inputType          → "Calculate from Yield"
     *  - isEndOfMonthBond   → "No"
     *  - priceRoundingDecimals → "4"
     *  - stampDuty          → "0"
     *  - dayConvention      → bond.dayConvention ?? "Actual/Actual"
     *  - bondType           → "Bullet"
     *  - amortSchedule      → ""   (only used when bondType = "Amortizing")
     *  - isin               → ""
     */
    overrides?: {
        periodStatus?: "Normal" | "Shut Period";
        inputType?: "Calculate from Yield" | "Calculate from Clean Price";
        isEndOfMonthBond?: "Yes" | "No";
        priceRoundingDecimals?: "2" | "4" | string;
        stampDuty?: number | string;
        dayConvention?: "Actual/Actual" | "Actual/365" | string;
        bondType?: "Bullet" | "Amortizing" | string;
        amortSchedule?: string;
        isin?: string;
    };
}) {
    const freq = toCalcPaymentFrequency(
        args.bond.interestPaymentFrequency || args.dateData.interestPaymentFrequency || "",
    );
    const settlement = args.settlementDate;
    const issue = args.dateData.issueDate;
    const dated =
        issue && !Number.isNaN(new Date(issue).getTime())
            ? toYmdFromDate(new Date(issue))
            : toYmdFromDate(args.bond.dateOfAllotment ?? undefined) || settlement;

    const lastCouponFallback =
        args.bond.lastCouponDate ?? args.refLastCouponDate ?? null;
    const nextCouponFallback =
        args.bond.nextCouponDate ?? args.refNextCouponDate ?? null;

    const lastIp = resolveCalcLastIp(
        args.dateData.lastCouponDate,
        lastCouponFallback,
        settlement,
    );
    let nextIp = resolveCalcNextIp(
        args.dateData.nextCouponDate,
        nextCouponFallback,
        settlement,
        lastIp,
    );
    if (nextIp <= lastIp) {
        nextIp = addDaysToYmd(lastIp, 1);
    }
    let maturity = resolveCalcMaturity(
        args.dateData.maturityDate ?? null,
        args.bond.maturityDate ?? null,
        settlement,
    );
    if (maturity <= settlement) {
        maturity = addYearsToYmd(settlement, 15);
    }
    if (maturity <= nextIp) {
        maturity = addYearsToYmd(nextIp, 10);
    }

    const fv = Math.max(
        1,
        Number(args.bondMargin.faceValue) ||
        Number(args.bond.faceValue) ||
        10000,
    );
    const coupon = Number(
        args.bondMargin.couponRate ?? args.bond.couponRate ?? 0,
    );
    const yieldStr = Number.isFinite(args.pricingYield) ? String(args.pricingYield) : "0";

    const ov = args.overrides ?? {};
    const dayConvention = toCalcDayConvention(
        ov.dayConvention ?? args.bond.dayConvention ?? "",
    );
    const bondType = toCalcBondType(ov.bondType);
    const amortSchedule =
        bondType === "Amortizing" ? String(ov.amortSchedule ?? "") : "";

    return {
        ISIN: ov.isin ?? "",
        Face_Value: fv,
        Coupon_Rate_Pct: String(coupon),
        Payment_Frequency: freq,
        Quantity: String(Math.max(1, args.quantity)),
        Settlement_Date: settlement,
        Dated_Date: removeIstTimezoneFromDate(dated),
        Last_IP_Date: lastIp,
        Next_IP_Date: nextIp,
        Maturity_Date: removeIstTimezoneFromDate(maturity),
        Period_Status: ov.periodStatus ?? "Normal",
        Input_Type: ov.inputType ?? "Calculate from Yield",
        Pricing_Input: yieldStr,
        Is_End_Of_Month_Bond: ov.isEndOfMonthBond ?? "No",
        Price_Rounding_Decimals: String(ov.priceRoundingDecimals ?? "4"),
        Stamp_Duty: String(ov.stampDuty ?? "0"),
        Day_Convention: dayConvention,
        Bond_Type: bondType,
        amort_schedule: amortSchedule,
    };
}

export const calculateBondMargin = async ({
    isin,
    quantity,
}: {
    isin: string;
    quantity: number;
}) => {
    const bond = await db.dataBase.bonds.findUnique({
        where: { isin },
    });
    if (!bond) {
        throw new Error(`Bond not found with isin: ${isin}`);
    }
    const bondMargin = await getBondMargin(isin);
    const dateData = await getDatefromReferenceData(isin);
    const settlementYmd = formatYmdAsiaKolkata(new Date());

    const payload = buildBondCalcServicePayload({
        bondMargin,
        dateData,
        bond: {
            interestPaymentFrequency: bond.interestPaymentFrequency,
            faceValue: bond.faceValue,
            couponRate: bond.couponRate,
            lastCouponDate: bond.lastCouponDate,
            nextCouponDate: bond.nextCouponDate,
            maturityDate: bond.maturityDate,
            dateOfAllotment: bond.dateOfAllotment,
            dayConvention: bond.dayConvention,
        },
        quantity,
        settlementDate: settlementYmd,
        pricingYield: bondMargin.yield,
        overrides: { isin },
    });
    console.log({ payload });
    const calc = await calculateBondFromService(payload);
    return {
        margin: bondMargin,
        dateData,
        calc,
    };
};

export type BondDealAutofillResult = {
    isin: string;
    quantity: number;
    sources: {
        usedReferenceMetadata: boolean;
        usedCouponSchedule: boolean;
        yieldSource: "override" | "consolidated" | "bonds";
    };
    suggested: {
        maturityDate: string | null;
        dateOfAllotment: string | null;
        /** `YYYY-MM-DD` — aligned with calc service / schedule / bond fallbacks */
        lastCouponDate: string;
        nextCouponDate: string;
        /**
         * Bond / coupon-payment row if present; otherwise if `recordDays` and `nextCouponDate` are known,
         * computed as next coupon date minus `recordDays` (calendar days).
         */
        recordDate: string | null;
        /**
         * Bond row, then reference row; else inferred from `recordDate` → `nextCouponDate` gap when days missing.
         */
        recordDays: number | null;
        /** Coupon payment due date from reference sheet (`dueDate`), YYYY-MM-DD */
        dueDate: string | null;
        dayConvention: string | null;
        interestPaymentFrequency: string;
        interestPaymentMode: string;
        faceValue: number;
        couponRate: number;
        buyYield: number | null;
        yield: number;
        sellPrice: number | null;
    };
    pricing: {
        finalPrice: number | null;
        finalYieldRaw: number;
        settlementAmount: number | null;
        totalAccruedInterest: number | null;
        principalAmount: number | null;
        totalConsideration: number | null;
        calc: ExternalCalcResponse;
    };
    margin: Awaited<ReturnType<typeof getBondMargin>>;
};

export async function getBondDealAutofill(opts: {
    isin: string;
    quantity?: number;
    settlementDate?: string;
    pricingYield?: number;
}): Promise<BondDealAutofillResult> {
    const isin = opts.isin;
    const quantity = Math.max(1, opts.quantity ?? 1);

    const bond = await db.dataBase.bonds.findUnique({
        where: { isin },
    });
    if (!bond) {
        throw new Error(`Bond not found with isin: ${isin}`);
    }

    const ref = await db.dataBase.bondReferenceMetadata.findUnique({
        where: { isin },
    });

    const bondMargin = await getBondMargin(isin);
    const dateData = await getDatefromReferenceData(isin);

    const settlementYmd =
        opts.settlementDate?.trim() &&
            /^\d{4}-\d{2}-\d{2}$/.test(opts.settlementDate.trim())
            ? opts.settlementDate.trim()
            : formatYmdAsiaKolkata(new Date());

    const dates = await getLastNextCouponDateBasedOnSettlementDate(opts.isin, new Date())
    console.log(dates);

    const pricingYield =
        opts.pricingYield != null && Number.isFinite(opts.pricingYield)
            ? opts.pricingYield
            : bondMargin.yield;

    const payload = buildBondCalcServicePayload({
        bondMargin,
        dateData,
        bond: {
            interestPaymentFrequency: bond.interestPaymentFrequency,
            faceValue: bond.faceValue,
            couponRate: bond.couponRate,
            lastCouponDate: (new Date(toISTISODate(new Date(dates.lastCouponDate || "")))),
            nextCouponDate: new Date(toISTISODate(new Date(dates.nextCouponDate || ""))),
            maturityDate: bond.maturityDate,
            dateOfAllotment: bond.dateOfAllotment,
            dayConvention: bond.dayConvention ?? ref?.dayConvention ?? null,
        },
        quantity,
        settlementDate: settlementYmd,
        pricingYield,
        refLastCouponDate: ref?.lastCouponDate,
        refNextCouponDate: ref?.nextCouponDate,
        overrides: { isin },
    });


    const calc = await calculateBondFromService(payload);
    console.log(calc);
    const sellPrice = parseCalcFormattedDecimal(calc.final_price);

    const yieldSource: BondDealAutofillResult["sources"]["yieldSource"] =
        opts.pricingYield != null && Number.isFinite(opts.pricingYield)
            ? "override"
            : bondMargin.type === "consolidated"
                ? "consolidated"
                : "bonds";

    const maturityDate = firstYmdFromDates(
        bond.maturityDate ?? undefined,
        dateData.maturityDate ?? undefined,
        ref?.maturityDate ?? undefined,
    );
    const dateOfAllotment = firstYmdFromDates(
        bond.dateOfAllotment ?? undefined,
        dateData.issueDate ?? undefined,
        ref?.issueDate ?? undefined,
    );

    /** Same resolution as calc payload (schedule → bond → reference → synthetic). */
    const lastCouponYmd = resolveCalcLastIp(
        dateData.lastCouponDate,
        bond.lastCouponDate ?? ref?.lastCouponDate ?? null,
        settlementYmd,
    );
    let nextCouponYmd = resolveCalcNextIp(
        dateData.nextCouponDate,
        bond.nextCouponDate ?? ref?.nextCouponDate ?? null,
        settlementYmd,
        lastCouponYmd,
    );
    if (nextCouponYmd <= lastCouponYmd) {
        nextCouponYmd = addDaysToYmd(lastCouponYmd, 1);
    }

    const faceValue = Number(
        bond.faceValue ?? ref?.faceValue ?? bondMargin.faceValue ?? 0,
    );
    const couponRate = Number(
        bond.couponRate ?? ref?.couponRate ?? bondMargin.couponRate ?? 0,
    );

    const couponPayRow = await db.dataBase.bondReferenceCouponPaymentDate.findFirst({
        where: { isin },
        orderBy: { id: "asc" },
    });

    const recordDaysFromRef =
        couponPayRow?.recordDays != null && Number.isFinite(couponPayRow.recordDays)
            ? Math.round(couponPayRow.recordDays)
            : null;

    /**
     * Record days: prefer bond, then reference coupon-payment row (e.g. 7, 15, 20).
     */
    let recordDaysResolved: number | null =
        bond.recordDays ?? recordDaysFromRef ?? null;

    /** Explicit record date from bond or coupon-payment row only. */
    const explicitRecordDateYmd = firstYmdFromDates(
        bond.recordDate ?? undefined,
        couponPayRow?.recordDate ?? undefined,
    );

    const dueDateYmd = firstYmdFromDates(couponPayRow?.dueDate ?? undefined);

    /**
     * Final record date for suggestions: explicit DB/reference first; else if we only have record days,
     * derive as next coupon minus record days.
     */
    let recordDateYmd: string | null = explicitRecordDateYmd;
    if (
        !recordDateYmd &&
        recordDaysResolved != null &&
        recordDaysResolved > 0 &&
        nextCouponYmd
    ) {
        recordDateYmd = addDaysToYmd(nextCouponYmd, -recordDaysResolved);
    }

    /**
     * If record days are still missing but we have a record date (explicit or derived above) and next coupon,
     * infer record days as calendar days from record date to next coupon (capped 1–120).
     */
    if (
        recordDaysResolved == null &&
        recordDateYmd &&
        nextCouponYmd &&
        recordDateYmd < nextCouponYmd
    ) {
        const diff = calendarDaysFromYmdToYmd(recordDateYmd, nextCouponYmd);
        if (diff > 0 && diff <= 120) {
            recordDaysResolved = diff;
        }
    }

    return {
        isin,
        quantity,
        sources: {
            usedReferenceMetadata: dateData.fromReferenceData,
            usedCouponSchedule: dateData.couponDatesFromPaymentSchedule,
            yieldSource,
        },
        suggested: {
            maturityDate,
            dateOfAllotment,
            lastCouponDate: lastCouponYmd,
            nextCouponDate: nextCouponYmd,
            recordDate: recordDateYmd,
            recordDays: recordDaysResolved,
            dueDate: dueDateYmd,
            dayConvention: bond.dayConvention ?? ref?.dayConvention ?? null,
            interestPaymentFrequency: bond.interestPaymentFrequency,
            interestPaymentMode: bond.interestPaymentMode,
            faceValue,
            couponRate,
            buyYield: bond.buyYield ?? bondMargin.currentYield ?? null,
            yield: pricingYield,
            sellPrice,
        },
        pricing: {
            finalPrice: sellPrice,
            finalYieldRaw: calc.final_yield_raw,
            settlementAmount: parseCalcFormattedDecimal(calc.settlement_amount),
            totalAccruedInterest: parseCalcFormattedDecimal(calc.total_ai),
            principalAmount: parseCalcFormattedDecimal(calc.principal_amount),
            totalConsideration: parseCalcFormattedDecimal(calc.total_consideration),
            calc,
        },
        margin: bondMargin,
    };
}

/**
 * Proxy to DeriData Merchant API calculator and return legacy calc JSON shape.
 *
 * `Day_Convention`, `Bond_Type`, and `amort_schedule` are required by the service —
 * historical callers omitted them, so the calc engine fell back to legacy defaults
 * which produced wrong AI / clean price for Actual/365 bonds and silently treated
 * every bond as Bullet. They are now emitted by `buildBondCalcServicePayload`.
 */
export type BondCalcServicePayload = {
    /** Optional — calc service accepts and echoes this for traceability. */
    ISIN?: string
    Face_Value: number
    Coupon_Rate_Pct: string
    Payment_Frequency: string
    Quantity: string
    Settlement_Date: string
    Dated_Date: string
    Last_IP_Date: string
    Next_IP_Date: string
    Maturity_Date: string
    /** "Normal" | "Shut Period" */
    Period_Status: string
    /** "Calculate from Yield" | "Calculate from Clean Price" */
    Input_Type: string
    Pricing_Input: string
    /** "Yes" | "No" */
    Is_End_Of_Month_Bond: string
    /** "2" | "4" */
    Price_Rounding_Decimals: string
    Stamp_Duty: string
    /** "Actual/Actual" | "Actual/365" */
    Day_Convention: string
    /** "Bullet" | "Amortizing" */
    Bond_Type: string
    /** Required by the calc service. Empty string for Bullet bonds. */
    amort_schedule: string
};

function parseCalcServiceErrorBody(text: string): string {
    const trimmed = text.trim();
    if (!trimmed) {
        return "We couldn't calculate cashflow for this bond right now. Please try again later.";
    }

    try {
        const parsed = JSON.parse(trimmed) as {
            error?: string;
            message?: string;
            detail?: string;
        };
        const nested =
            (typeof parsed.error === "string" && parsed.error.trim()) ||
            (typeof parsed.message === "string" && parsed.message.trim()) ||
            (typeof parsed.detail === "string" && parsed.detail.trim());
        if (nested) return nested;
    } catch {
        // Plain-text body — fall through.
    }

    if (/^Calc service failed/i.test(trimmed)) {
        const afterPrefix = trimmed.replace(
            /^Calc service failed\s*\([^)]*\)\s*:?\s*/i,
            "",
        ).trim();
        if (afterPrefix && afterPrefix !== trimmed) {
            return parseCalcServiceErrorBody(afterPrefix);
        }
    }

    if (/^\d{3}\s/.test(trimmed) || trimmed.startsWith("{")) {
        return "We couldn't calculate cashflow for this bond right now. Please try again later.";
    }

    return trimmed;
}

export async function calculateBondFromService(
    payload: BondCalcServicePayload,
): Promise<ExternalCalcResponse> {
    const isin = payload.ISIN?.trim() ?? "";
    if (!isin) {
        throw new Error("ISIN is required for bond calculation");
    }

    const quantity = Math.max(1, Number(payload.Quantity) || 1);
    const faceValue = Math.max(1, Number(payload.Face_Value) || 10000);
    const settlementDate = payload.Settlement_Date;
    const cashflowShutFlag = /shut/i.test(payload.Period_Status ?? "");

    const adapterCtx = {
        quantity,
        settlementDateYmd: settlementDate,
        periodStatus: payload.Period_Status,
    };

    if (payload.Input_Type === "Calculate from Clean Price") {
        const cleanPrice = Number(payload.Pricing_Input);
        if (!Number.isFinite(cleanPrice) || cleanPrice <= 0) {
            throw new Error(
                "Clean price is required for price-to-yield calculation",
            );
        }

        const response = await calculatePriceToYield({
            isin,
            valueDate: settlementDate,
            faceValue,
            quantity,
            cleanPrice,
            cashflowShutFlag,
        });

        return mapDeriDataToExternalCalcResponse(response, {
            ...adapterCtx,
            cleanPrice,
            ytm: parseDeriDataMoney(response.summary.xirr) ?? null,
        });
    }

    const ytm = Number(payload.Pricing_Input);
    if (!Number.isFinite(ytm)) {
        throw new Error("Yield is required for yield-to-price calculation");
    }

    const response = await calculateYieldToPrice({
        isin,
        valueDate: settlementDate,
        faceValue,
        quantity,
        ytm,
        cashflowShutFlag,
    });

    return mapDeriDataToExternalCalcResponse(response, {
        ...adapterCtx,
        ytm,
    });
}



