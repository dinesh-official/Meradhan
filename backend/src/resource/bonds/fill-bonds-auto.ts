import { db } from "@core/database/database";
import { accruedInterest, DEFAULT_BOND_MARKET_HOLIDAYS, firstWorkingDayAfter, getLastCouponDateFromReferenceData, getLastNextCouponDateBasedOnSettlementDate, getNextCouponDate, toISTISODate } from "@services/order/order-pricing-helper";
import axios from "axios";
import moment from "moment";
// Matches `enum INTEREST_MODE` in `bonds.prisma`
export type InterestMode =
    | "MONTHLY"
    | "QUARTERLY"
    | "HALF_YEARLY"
    | "YEARLY"
    | "ON_MATURITY"
    | "UNKNOWN";

export function paymentFrequencyToDbEnum(input: string | null | undefined): InterestMode {
    const v = String(input ?? "").trim().toLowerCase();

    if (v === "monthly") return "MONTHLY";
    if (v === "quarterly") return "QUARTERLY";

    // handle UI variants: "Semi-Annual", "Semi Annual", "Semiannual", etc.
    if (v === "semi-annual" || v === "semi annual" || v === "semiannual") return "HALF_YEARLY";

    if (v === "annual" || v === "yearly") return "YEARLY";

    // optional extras if you ever add them in UI
    if (v === "on maturity" || v === "on-maturity" || v === "maturity") return "ON_MATURITY";

    return "UNKNOWN";
}
function toYyyyMmDd(input: string | number | Date | null | undefined): string | undefined {
    if (input == null) return undefined;
    const d = input instanceof Date ? input : new Date(input);
    if (Number.isNaN(d.getTime())) return undefined;
    return d.toISOString().slice(0, 10);
}

/** Calc `final_price` strings may include commas; `Number("1,234.56")` is NaN. */
function parseCalcMoneyString(s: string | null | undefined): number | null {
    if (s == null || !String(s).trim()) return null;
    const n = Number(String(s).replace(/,/g, "").trim());
    return Number.isFinite(n) ? n : null;
}

function parseInterestPaymentDatesString(raw: string | null | undefined): Date[] {
    if (!raw?.trim()) return [];
    const formats = [
        "DD-MMM-YYYY",
        "DD-MMM-YY",
        "YYYY-MM-DD",
        "DD-MM-YYYY",
        "DD/MM/YYYY",
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

function mapNatureOfInstrument(
    raw: string | null | undefined,
): "SECURED" | "UNSECURED" | "UNKNOWN" | null {
    const s = String(raw ?? "").trim().toUpperCase();
    if (!s) return null;
    if (s.includes("UNSECURED")) return "UNSECURED";
    if (s.includes("SECURED")) return "SECURED";
    if (s === "SECURED" || s === "UNSECURED") return s;
    return "UNKNOWN";
}

/** Calc service expects Excel-style labels (e.g. Monthly, not MONTHLY). */
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

function toCalcDayConvention(raw: string | null | undefined): "Actual/Actual" | "Actual/365" {
    if (!raw?.trim()) return "Actual/Actual";
    const u = raw.trim().toUpperCase().replace(/\s+/g, "");
    if (u.includes("ACT/365") || u.includes("ACTUAL/365") || u === "A/365") return "Actual/365";
    return "Actual/Actual";
}

function toCalcBondType(raw: string | null | undefined): "Bullet" | "Amortizing" {
    const v = String(raw ?? "").trim().toLowerCase();
    if (v === "amortizing" || v === "amortising" || v === "amortized" || v.includes("amort")) {
        return "Amortizing";
    }
    return "Bullet";
}

function formatCalcFaceValue(faceValue: number): string {
    return Number.isFinite(faceValue) ? faceValue.toFixed(2) : "10000.00";
}

function formatCalcCouponRate(couponRate: number): string {
    return Number.isFinite(couponRate) ? couponRate.toFixed(4) : "0.0000";
}

function collectAllCouponDatesYmd(
    couponRows: Array<{
        dueDate?: Date | null;
        dueDateIst?: Date | null;
        interestPaymentDates?: string | null;
    }>,
    cfRows: Array<{ date: string }> | undefined,
    existingBondDates: Date[] | undefined,
): string[] {
    const set = new Set<string>();
    const add = (d: Date | string | null | undefined) => {
        const ymd = toYyyyMmDd(d);
        if (ymd) set.add(ymd);
    };
    for (const row of couponRows) {
        add(row.dueDateIst);
        add(row.dueDate);
        for (const d of parseInterestPaymentDatesString(row.interestPaymentDates)) {
            add(d);
        }
    }
    for (const row of cfRows ?? []) {
        if (row.date?.trim()) add(row.date.trim());
    }
    for (const d of existingBondDates ?? []) {
        add(d);
    }
    return [...set].sort();
}

export const getBondInfoCalcData = async (isin: string, { yeild, settlementDate, quantity, stampDuty }: { yeild?: string, settlementDate?: string, quantity?: number, stampDuty?: number } = {}) => {
    const bond = await db.dataBase.bondReferenceMetadata.findFirst({ where: { isin: isin } });
    const bondData = await db.dataBase.bonds.findFirst({ where: { isin: isin } });
    const couponRows = await db.dataBase.bondReferenceCouponPaymentDate.findMany({
        where: { isin },
        orderBy: { id: "asc" },
    });
    const couponPayRow = couponRows[0] ?? null;
    const dueDateYmd =
        couponPayRow?.dueDateIst instanceof Date && !Number.isNaN(couponPayRow.dueDateIst.getTime())
            ? toYyyyMmDd(couponPayRow.dueDateIst)
            : null;

    const settlementDateObj = settlementDate
        ? new Date(settlementDate)
        : firstWorkingDayAfter(new Date(), new Set(DEFAULT_BOND_MARKET_HOLIDAYS));

    const couponDate = await getLastNextCouponDateBasedOnSettlementDate(isin, settlementDateObj);
    const lastCouponDate = await getLastCouponDateFromReferenceData(isin, settlementDateObj);
    const nextCouponDate = await getNextCouponDate(isin, settlementDateObj);

    const pricing = accruedInterest({
        couponRate: bond?.couponRate || 0,
        faceValue: bond?.faceValue || 0,
        lastCouponDate: new Date(lastCouponDate!),
        nextCouponDate: new Date(nextCouponDate!),
        quantity: quantity || 1,
        recordDays: couponDate.recordDays || 0,
        settlementDate: settlementDateObj,
    });

    console.log(pricing);

    const faceValue = Number(bond?.faceValue ?? bondData?.faceValue ?? 10000);
    const couponRate = Number(bond?.couponRate ?? bondData?.couponRate ?? 0);
    const bondType = toCalcBondType(bondData?.bondType ?? bond?.bondType);
    const pricingYield = yeild ?? bondData?.yield ?? bondData?.buyYield;
    const datedDate =
        bond?.issueDateIst instanceof Date && !Number.isNaN(bond.issueDateIst.getTime())
            ? toISTISODate(bond.issueDateIst)
            : toYyyyMmDd(bondData?.dateOfAllotment ?? bond?.issueDateIst);
    const maturityDate =
        bond?.maturityDateIst instanceof Date && !Number.isNaN(bond.maturityDateIst.getTime())
            ? toISTISODate(bond.maturityDateIst)
            : toYyyyMmDd(bondData?.maturityDate ?? bond?.maturityDateIst);

    const payload = {
        ISIN: isin,
        Face_Value: formatCalcFaceValue(faceValue),
        Coupon_Rate_Pct: formatCalcCouponRate(couponRate),
        Payment_Frequency: toCalcPaymentFrequency(
            bond?.interestPaymentFrequency ?? bondData?.interestPaymentFrequency,
        ),
        Quantity: String(quantity ?? 1),
        Settlement_Date: toYyyyMmDd(settlementDateObj),
        Dated_Date: datedDate,
        Last_IP_Date: lastCouponDate ?? "",
        Next_IP_Date: nextCouponDate ?? "",
        Maturity_Date: maturityDate,
        Period_Status: pricing.isUnderShutPeriod ? "Shut Period" : "Normal",
        Input_Type: "Calculate from Yield",
        Pricing_Input: pricingYield != null ? String(pricingYield) : "0",
        Is_End_Of_Month_Bond: "No",
        Price_Rounding_Decimals: "4",
        Stamp_Duty: stampDuty != null ? String(stampDuty) : "0",
        Day_Convention: toCalcDayConvention(bond?.dayConvention ?? bondData?.dayConvention),
        Bond_Type: bondType,
        amort_schedule: bondType === "Amortizing" ? "" : "",
    };

    const response = await axios.post<{
        accrued_days: number
        cf_count: number
        cf_rows: Array<{
            date: string
            days: number
            interest: string
            num: number
            principal: string
            total: string
            total_raw: number
        }>
        final_price: string
        final_yield: string
        final_yield_raw: number
        period_status: string
        principal_amount: string
        quantity: string
        running_total: string
        settle_dt: string
        settlement_amount: string
        stamp_duty: string
        total_ai: string
        total_consideration: string
    }

    >("https://stagecalc.meradhan.co/api/calculate", payload);
    const allCouponDates = collectAllCouponDatesYmd(
        couponRows,
        response.data.cf_rows,
        bondData?.allCouponDates,
    );

    const bondName =
        (bondData?.bondName?.trim() || bond?.issuerName?.trim() || "").trim() || null;
    const creditRating = bondData?.creditRating?.trim() || "UnRated";
    const natureOfInstrument =
        mapNatureOfInstrument(bondData?.natureOfInstrument ?? bond?.natureOfInstrument) ??
        null;

    return {
        payload,
        suggested: {
            bondName,
            creditRating,
            allCouponDates,
            allCouponDatesIst: allCouponDates,
            natureOfInstrument,
            maturityDate: toYyyyMmDd(bond?.maturityDate),
            dateOfAllotment: toYyyyMmDd(bond?.issueDateIst),
            lastCouponDate: String(payload.Last_IP_Date ?? ""),
            nextCouponDate: String(payload.Next_IP_Date ?? ""),
            recordDate: toYyyyMmDd(pricing.recordDate),
            recordDays: couponDate.recordDays,
            dueDate: dueDateYmd ?? null,
            dayConvention: bond?.dayConvention ?? null,
            interestPaymentFrequency: paymentFrequencyToDbEnum(payload.Payment_Frequency) || bond?.interestPaymentFrequency,
            interestPaymentMode: paymentFrequencyToDbEnum(payload.Payment_Frequency),
            faceValue: Number(bond?.faceValue ?? 0),
            couponRate: Number(Number(bond?.couponRate ?? 0).toFixed(2)),
            buyYield: (() => {
                const raw = bondData?.buyYield ?? bondData?.yield ?? (Number(response.data.final_yield) || null);
                return raw != null && Number.isFinite(raw) ? Number(Number(raw).toFixed(2)) : null;
            })(),
            yield: Number(Number(response.data.final_yield_raw ?? 0).toFixed(2)),
            sellPrice: (() => {
                const sp = parseCalcMoneyString(response.data.final_price);
                return sp != null && Number.isFinite(sp) ? Number(sp.toFixed(4)) : null;
            })(),
            isUnderShutPeriod: pricing.isUnderShutPeriod,
            bondType: bondData?.bondType ?? null,
            seniority: bondData?.seniority ?? null,
            redemptionType: bondData?.redemptionType ?? null,
            taxStatus: bondData?.taxStatus ?? null,
            isListed: bondData?.isListed ?? null,
            couponType: bondData?.couponType ?? null,
            categories: bondData?.categories ?? [],
        },
        calc: response.data,
    }
}