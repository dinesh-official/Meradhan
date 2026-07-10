import {
    calculateCompoundReturn,
    calculateDate,
    calculateFraction,
    calculateRate,
    calculateValueNPER,
    calculateYearFraction,
    validateInputs
} from "./formula";

export const couponFrequency = {
    Annual: 1,
    "Semi-Annual": 2,
    Quarterly: 4,
    Monthly: 12,
} as const;

export const dayCount = {
    "Actual/Actual": 1,
    "30/360 (US)": 0,
    "Actual/360": 2,
    "Actual/365": 3,
    "Actual/365 (Fixed)": 3,
    "30E/360 (EU)": 4,
} as const;

export type YtmInput = {
    faceValue: number;
    cleanPrice: number;
    annualCouponRate: number;
    couponFrequency: keyof typeof couponFrequency;
    dayCount: keyof typeof dayCount;
    issueDate: Date;
    settlementDate: Date;
    maturityDate: Date;
    lastCouponDate: Date;
};

export type YtmResult = {
    result: number | "ERROR";
    check: "OK" | "CHECK INPUTS";
    drived: {
        Periodic_R_RATE: number;
        paymentsPerYear: number;
        YEARFRAC_Basis: number;
        monthsPerPeriod: number;
        nextCouponDate: Date;
        yearsToMaturity: number;
        NPER: number;
        PMT: number;
        annualCouponAmount: number;
        accruedFraction: number;
        accruedInterest: number;
        dirtyPrice: number;
    };
};

export function calculateYtm(params: YtmInput): YtmResult {
    const {
        faceValue,
        cleanPrice,
        annualCouponRate,
        couponFrequency: couponFreq,
        dayCount: dayCountKey,
        issueDate,
        settlementDate,
        maturityDate,
        lastCouponDate,
    } = params;

    const paymentsPerYear = couponFrequency[couponFreq];
    const YEARFRAC_Basis = dayCount[dayCountKey];

    const monthsPerPeriod = 12 / paymentsPerYear;
    const nextCouponDate = calculateDate(
        lastCouponDate,
        monthsPerPeriod,
        settlementDate
    );

    const yearsToMaturity = calculateYearFraction(
        settlementDate,
        maturityDate,
        YEARFRAC_Basis
    );

    const NPER = calculateValueNPER(
        nextCouponDate,
        maturityDate,
        YEARFRAC_Basis,
        paymentsPerYear
    );
    const PMT = (faceValue * annualCouponRate) / paymentsPerYear;
    const annualCouponAmount = faceValue * annualCouponRate;
    const accruedFraction = calculateFraction(
        lastCouponDate,
        settlementDate,
        nextCouponDate,
        YEARFRAC_Basis
    );

    const accruedInterest = PMT * accruedFraction;
    const dirtyPrice = cleanPrice + accruedInterest;

    const check = validateInputs({
        C10: settlementDate,
        C11: maturityDate,
        C12: lastCouponDate,
        C15: paymentsPerYear,
        C16: monthsPerPeriod,
        C17: YEARFRAC_Basis,
        C18: nextCouponDate,
        C4: faceValue,
        C5: cleanPrice,
        C6: annualCouponRate,
        C9: issueDate,
    });

    const Periodic_R_RATE = calculateRate({
        C26: check,
        C25: Number(dirtyPrice),
        C21: Number(PMT),
        C20: Number(NPER),
        C4: faceValue,
    });

    const data = calculateCompoundReturn({
        C15: paymentsPerYear,
        C26: check,
        I9: Periodic_R_RATE,
    });

    return {
        result: typeof data === "number" ? data * 100 : "ERROR",
        check,
        drived: {
            Periodic_R_RATE: Periodic_R_RATE * 100,
            paymentsPerYear,
            YEARFRAC_Basis,
            monthsPerPeriod,
            nextCouponDate,
            yearsToMaturity,
            NPER,
            PMT,
            annualCouponAmount,
            accruedFraction,
            accruedInterest,
            dirtyPrice,
        },
    };
}

/** One row of the cashflow table: Date, Coupon, Principal, Total Cashflow */
export type CashFlowRow = {
    date: Date;
    coupon: number;
    principal: number;
    totalCashflow: number;
};

function daysInMonthUtc(year: number, month: number): number {
    return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

function isEndOfMonthUtc(d: Date): boolean {
    return d.getUTCDate() === daysInMonthUtc(d.getUTCFullYear(), d.getUTCMonth());
}

/** Add months anchored to original day (UTC). */
function addMonthsAnchored(
    baseDate: Date,
    months: number,
    anchorDay: number,
    useEomRule = false
): Date {
    const totalMonths = baseDate.getUTCFullYear() * 12 + baseDate.getUTCMonth() + months;
    const year = Math.floor(totalMonths / 12);
    const month = totalMonths % 12;
    const dim = daysInMonthUtc(year, month);
    const day = useEomRule ? dim : Math.min(anchorDay, dim);
    return new Date(Date.UTC(year, month, day));
}

function getNextCouponInfo(
    lastCouponDate: Date,
    settlementDate: Date,
    monthsPerPeriod: number,
    anchorDay: number,
    useEomRule: boolean
): { periods: number; nextCouponDate: Date } {
    let periods = 1;
    let nextCouponDate = addMonthsAnchored(
        lastCouponDate,
        periods * monthsPerPeriod,
        anchorDay,
        useEomRule
    );
    while (nextCouponDate <= settlementDate) {
        periods += 1;
        nextCouponDate = addMonthsAnchored(
            lastCouponDate,
            periods * monthsPerPeriod,
            anchorDay,
            useEomRule
        );
        if (periods > 2000) {
            break;
        }
    }
    return { periods, nextCouponDate };
}

/**
 * Generates cashflow matching the table: settlement outflow (dirty price), then coupon dates (PMT), then maturity (PMT + principal).
 */
export function generateCashFlow(
    result: YtmResult,
    params: YtmInput
): CashFlowRow[] {
    const { PMT, dirtyPrice, monthsPerPeriod } = result.drived;
    const { faceValue, settlementDate, maturityDate, lastCouponDate } = params;
    const rows: CashFlowRow[] = [];
    const useEomRule = isEndOfMonthUtc(lastCouponDate);
    const anchorDay = lastCouponDate.getUTCDate();
    const { periods } = getNextCouponInfo(
        lastCouponDate,
        settlementDate,
        monthsPerPeriod,
        anchorDay,
        useEomRule
    );

    // Row 1: Settlement – Total Cashflow = -dirty price
    rows.push({
        date: new Date(settlementDate),
        coupon: 0,
        principal: 0,
        totalCashflow: -dirtyPrice,
    });

    // Coupon dates from next coupon up to (but not including) maturity
    for (let i = 0; ; i++) {
        const date = addMonthsAnchored(
            lastCouponDate,
            (periods + i) * monthsPerPeriod,
            anchorDay,
            useEomRule
        );
        if (date >= maturityDate) {
            break;
        }
        rows.push({
            date,
            coupon: PMT,
            principal: 0,
            totalCashflow: PMT,
        });
    }

    rows.push({
        date: maturityDate,
        coupon: PMT,
        principal: faceValue,
        totalCashflow: PMT + faceValue,
    });

    return rows;
};



export function approximateYtm(params: YtmInput, result: YtmResult): number {

    const { faceValue, cleanPrice } = params;

    const { yearsToMaturity, annualCouponAmount } = result.drived;
    if (result.check !== "OK") {
        return 0;
    }



    const ans = ((annualCouponAmount + (faceValue - cleanPrice) / yearsToMaturity) / ((faceValue + cleanPrice) / 2))
    return ans * 100;
}