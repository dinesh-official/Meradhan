import { db } from "@core/database/database";
import {
    fetchCalcBondInfo,
    parseApiDecimal,
    pickYmd,
} from "@resource/crm/bonds/bond_auto_update_autofill.calc";
import { accruedInterest, DEFAULT_BOND_MARKET_HOLIDAYS, firstWorkingDayAfter, getBondLastCouponDate, getBondNextCouponDate, getLastCouponDate, getLastCouponDateFromReferenceData, getLastNextCouponDateBasedOnSettlementDate, getNextCouponDate, resolveCouponDatesForSettlement, toISTISODate } from "@services/order/order-pricing-helper";
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

function frequencyToMonthStep(freq: string | null | undefined): number {
    const v = String(freq ?? "").trim().toLowerCase();
    if (v.includes("month")) return 1;
    if (v.includes("quarter")) return 3;
    if (v.includes("semi") || v.includes("half")) return 6;
    if (v.includes("year") || v.includes("annual")) return 12;
    return 1;
}

function inferNextCouponAfterSettlement(
    lastYmd: string,
    settlementYmd: string,
    frequency: string | null | undefined,
    maturityYmd?: string,
): string | undefined {
    const step = frequencyToMonthStep(frequency);
    let cursor = moment(lastYmd, "YYYY-MM-DD", true);
    if (!cursor.isValid()) return undefined;
    const settlement = moment(settlementYmd, "YYYY-MM-DD", true);
    const maturity = maturityYmd ? moment(maturityYmd, "YYYY-MM-DD", true) : null;
    for (let i = 0; i < 360; i++) {
        cursor = cursor.clone().add(step, "months");
        if (cursor.isAfter(settlement, "day")) {
            if (maturity?.isValid() && cursor.isAfter(maturity, "day")) return undefined;
            return cursor.format("YYYY-MM-DD");
        }
    }
    return undefined;
}

function inferLastCouponBeforeSettlement(
    nextYmd: string,
    settlementYmd: string,
    frequency: string | null | undefined,
): string | undefined {
    const step = frequencyToMonthStep(frequency);
    let next = moment(nextYmd, "YYYY-MM-DD", true);
    if (!next.isValid()) return undefined;
    const settlement = moment(settlementYmd, "YYYY-MM-DD", true);
    let last = next.clone().subtract(step, "months");
    while (last.isValid() && !last.isAfter(settlement, "day")) {
        next = last;
        last = next.clone().subtract(step, "months");
    }
    return next.format("YYYY-MM-DD");
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

export type BondCalcInputOverrides = {
    quantity?: number;
    settlementDate?: string;
    pricingYield?: number;
    providerPrice?: number | null;
    providerQuantity?: number | null;
    providerInterestDate?: string | null;
};

export type BondCalcInputSources = {
    usedProviderPrice: boolean;
    usedProviderQuantity: boolean;
    usedProviderSettlementDate: boolean;
};

export type GetBondInfoCalcDataOptions = BondCalcInputOverrides & {
    yeild?: string;
    stampDuty?: number;
    /** Legacy order-pricing path: force clean price from bond sell price. */
    useCleanPrice?: boolean;
    /** When true, ignore bond/request provider dates and use T+1 IST working settlement. */
    automatedSettlement?: boolean;
};

type BondRowForCalc = {
    providerPrice?: number | null;
    providerQuantity?: number | null;
    providerInterestDate?: Date | null;
    providerInterestDateIst?: Date | null;
    sellPrice?: number | null;
    buyYield?: number | null;
    yield?: number | null;
};

function ymdToUtcNoon(ymd: string): Date {
    const [y, m, d] = ymd.split("-").map(Number);
    return new Date(Date.UTC(y!, (m ?? 1) - 1, d ?? 1, 12, 0, 0));
}

function defaultT1IstSettlementYmd(): string {
    const holidays = new Set(DEFAULT_BOND_MARKET_HOLIDAYS);
    return toYyyyMmDd(firstWorkingDayAfter(new Date(), holidays))!;
}

export function resolveBondCalcInputs(
    bondRow: BondRowForCalc | null | undefined,
    overrides?: GetBondInfoCalcDataOptions,
): BondCalcInputSources & {
    quantity: number;
    settlementDateYmd: string;
    useCleanPrice: boolean;
    cleanPrice: number | undefined;
    pricingYield: number | undefined;
} {
    // Explicit order/customer quantity wins over CRM provider lot size.
    const explicitQty =
        overrides?.quantity != null && Number(overrides.quantity) > 0
            ? Number(overrides.quantity)
            : null;
    const providerQty =
        overrides?.providerQuantity != null && Number(overrides.providerQuantity) > 0
            ? Number(overrides.providerQuantity)
            : null;
    const bondQty =
        bondRow?.providerQuantity != null && Number(bondRow.providerQuantity) > 0
            ? Number(bondRow.providerQuantity)
            : null;
    const quantityRaw = explicitQty ?? providerQty ?? bondQty ?? 1;
    const quantity =
        Number.isFinite(Number(quantityRaw)) && Number(quantityRaw) > 0
            ? Number(quantityRaw)
            : 1;

    const usedProviderQuantity =
        explicitQty == null && (providerQty != null || bondQty != null);

    const provDateFromOverride = overrides?.automatedSettlement
        ? undefined
        : overrides?.providerInterestDate?.trim();
    const provDateFromBond = overrides?.automatedSettlement
        ? undefined
        : bondRow?.providerInterestDateIst instanceof Date &&
            !Number.isNaN(bondRow.providerInterestDateIst.getTime())
            ? toYyyyMmDd(bondRow.providerInterestDateIst)
            : bondRow?.providerInterestDate instanceof Date &&
                !Number.isNaN(bondRow.providerInterestDate.getTime())
                ? toYyyyMmDd(bondRow.providerInterestDate)
                : undefined;

    const provDate = provDateFromOverride || provDateFromBond;
    let settlementDateYmd: string;
    let usedProviderSettlementDate = false;

    if (
        !overrides?.automatedSettlement &&
        provDate &&
        /^\d{4}-\d{2}-\d{2}$/.test(provDate)
    ) {
        settlementDateYmd = provDate;
        usedProviderSettlementDate = true;
    } else if (
        overrides?.settlementDate?.trim() &&
        /^\d{4}-\d{2}-\d{2}$/.test(overrides.settlementDate.trim())
    ) {
        settlementDateYmd = overrides.settlementDate.trim();
    } else {
        settlementDateYmd = defaultT1IstSettlementYmd();
    }

    const pricingYieldOverride =
        overrides?.pricingYield != null && Number.isFinite(overrides.pricingYield)
            ? overrides.pricingYield
            : overrides?.yeild != null && String(overrides.yeild).trim() !== ""
                ? Number(overrides.yeild)
                : undefined;

    const overridePrice = overrides?.providerPrice;
    const bondProvPrice = bondRow?.providerPrice;
    const hasProviderPrice =
        pricingYieldOverride == null &&
        ((overridePrice != null &&
            Number.isFinite(Number(overridePrice)) &&
            Number(overridePrice) > 0) ||
            (bondProvPrice != null &&
                Number.isFinite(Number(bondProvPrice)) &&
                Number(bondProvPrice) > 0));

    const usedProviderPrice = Boolean(hasProviderPrice);

    const cleanPrice = hasProviderPrice
        ? Number(overridePrice ?? bondProvPrice)
        : undefined;

    const pricingYield =
        pricingYieldOverride != null && Number.isFinite(pricingYieldOverride)
            ? pricingYieldOverride
            : bondRow?.buyYield != null && Number.isFinite(bondRow.buyYield)
                ? bondRow.buyYield
                : bondRow?.yield != null && Number.isFinite(bondRow.yield)
                    ? bondRow.yield
                    : undefined;

    return {
        quantity,
        settlementDateYmd,
        useCleanPrice: hasProviderPrice,
        cleanPrice,
        pricingYield: hasProviderPrice ? undefined : pricingYield,
        usedProviderPrice,
        usedProviderQuantity,
        usedProviderSettlementDate,
    };
}

export const getBondInfoCalcData = async (
    isin: string,
    options: GetBondInfoCalcDataOptions = {},
) => {
    const bond = await db.dataBase.bondReferenceMetadata.findFirst({ where: { isin: isin } });
    const bondData = await db.dataBase.bonds.findFirst({ where: { isin: isin } });
    const resolved = resolveBondCalcInputs(bondData, options);
    const useCleanPrice = options.useCleanPrice === true || resolved.useCleanPrice;
    const cleanPriceInput = options.useCleanPrice === true
        ? bondData?.sellPrice ?? 0
        : resolved.cleanPrice ?? bondData?.sellPrice ?? 0;
    const pricingYieldStr = useCleanPrice
        ? undefined
        : resolved.pricingYield != null
            ? String(resolved.pricingYield)
            : options.yeild;
    const quantity = resolved.quantity;
    const stampDuty = options.stampDuty;
    const couponRows = await db.dataBase.bondReferenceCouponPaymentDate.findMany({
        where: { isin },
        orderBy: { id: "asc" },
    });
    const couponPayRow = couponRows[0] ?? null;
    const dueDateYmd =
        couponPayRow?.dueDateIst instanceof Date && !Number.isNaN(couponPayRow.dueDateIst.getTime())
            ? toYyyyMmDd(couponPayRow.dueDateIst)
            : null;

    const calcBond = await fetchCalcBondInfo(isin, resolved.settlementDateYmd);
    const settlementDateYmd =
        options.settlementDate?.trim() &&
        /^\d{4}-\d{2}-\d{2}$/.test(options.settlementDate.trim())
            ? resolved.settlementDateYmd
            : pickYmd(calcBond?.Settlement_Date, resolved.settlementDateYmd) ??
              resolved.settlementDateYmd;
    const settlementDateObj = ymdToUtcNoon(settlementDateYmd);

    const couponDate = await getLastNextCouponDateBasedOnSettlementDate(isin, settlementDateObj);
    const couponResolved = await resolveCouponDatesForSettlement(
        isin,
        settlementDateObj,
        bond ?? {
            lastCouponDateIst:
                bondData?.lastCouponDateIst ?? bondData?.lastCouponDate ?? undefined,
            nextCouponDateIst:
                bondData?.nextCouponDateIst ?? bondData?.nextCouponDate ?? undefined,
            recordDays: bondData?.recordDays ?? undefined,
        },
    );
    const bondTableLast = await getBondLastCouponDate(isin);
    const bondTableNext = await getBondNextCouponDate(isin);

    const paymentFrequencyForInfer =
        calcBond?.Payment_Frequency?.trim() ||
        bond?.interestPaymentFrequency ||
        bondData?.interestPaymentFrequency ||
        "Monthly";

    const maturityDateForInfer =
        pickYmd(
            calcBond?.Maturity_Date,
            bond?.maturityDateIst instanceof Date &&
                !Number.isNaN(bond.maturityDateIst.getTime())
                ? toISTISODate(bond.maturityDateIst)
                : toYyyyMmDd(bondData?.maturityDate ?? bond?.maturityDateIst),
        ) ?? "";

    let lastCouponDate =
        pickYmd(
            calcBond?.Last_IP_Date,
            couponResolved.lastCouponDate,
            bondTableLast,
            toYyyyMmDd(bondData?.lastCouponDate),
        ) ?? "";
    let nextCouponDate =
        pickYmd(
            calcBond?.Next_IP_Date,
            couponResolved.nextCouponDate,
            bondTableNext,
            toYyyyMmDd(bondData?.nextCouponDate),
        ) ?? "";

    if (!nextCouponDate && lastCouponDate) {
        nextCouponDate =
            inferNextCouponAfterSettlement(
                lastCouponDate,
                settlementDateYmd,
                paymentFrequencyForInfer,
                maturityDateForInfer || undefined,
            ) ?? "";
    }
    if (!lastCouponDate && nextCouponDate) {
        lastCouponDate =
            inferLastCouponBeforeSettlement(
                nextCouponDate,
                settlementDateYmd,
                paymentFrequencyForInfer,
            ) ?? "";
    }

    if (!lastCouponDate || !nextCouponDate) {
        throw new Error(
            `Missing coupon schedule for ISIN ${isin}. Add bond reference coupon dates or last/next coupon on the bond.`,
        );
    }

    const faceValue =
        parseApiDecimal(calcBond?.Face_Value) ??
        Number(bond?.faceValue ?? bondData?.faceValue ?? 10000);
    const couponRate =
        parseApiDecimal(calcBond?.Coupon_Rate_Pct) ??
        Number(bond?.couponRate ?? bondData?.couponRate ?? 0);

    const pricing = accruedInterest({
        couponRate,
        faceValue,
        lastCouponDate: new Date(lastCouponDate || settlementDateYmd),
        nextCouponDate: new Date(nextCouponDate || settlementDateYmd),
        quantity: quantity || 1,
        recordDays: couponResolved.recordDays ?? couponDate.recordDays ?? 0,
        settlementDate: settlementDateObj,
    });

    const bondType =
        (calcBond?.amort_schedule?.length ?? 0) > 0
            ? "Amortizing"
            : toCalcBondType(bondData?.bondType ?? bond?.bondType);
    const datedDate =
        pickYmd(
            calcBond?.Dated_Date,
            bond?.issueDateIst instanceof Date && !Number.isNaN(bond.issueDateIst.getTime())
                ? toISTISODate(bond.issueDateIst)
                : toYyyyMmDd(bondData?.dateOfAllotment ?? bond?.issueDateIst),
        ) ?? "";
    const maturityDate = maturityDateForInfer;

    const paymentFrequency =
        calcBond?.Payment_Frequency?.trim() ||
        toCalcPaymentFrequency(
            bond?.interestPaymentFrequency ?? bondData?.interestPaymentFrequency,
        );

    const settlementDateOverridden = Boolean(
        options.settlementDate?.trim() &&
        /^\d{4}-\d{2}-\d{2}$/.test(options.settlementDate.trim()),
    );
    const periodStatus =
        calcBond?.Period_Status?.trim() && !settlementDateOverridden
            ? calcBond.Period_Status.trim()
            : pricing.isUnderShutPeriod
              ? "Shut Period"
              : "Normal";

    const calcYieldFallback =
        calcBond?.yield != null
            ? parseApiDecimal(String(calcBond.yield)) ?? undefined
            : undefined;
    const resolvedPricingInput = useCleanPrice
        ? String(cleanPriceInput)
        : pricingYieldStr != null
          ? String(pricingYieldStr)
          : calcYieldFallback != null
            ? String(calcYieldFallback)
            : "0";

    const payload = {
        ISIN: isin,
        Face_Value: formatCalcFaceValue(faceValue),
        Coupon_Rate_Pct: formatCalcCouponRate(couponRate),
        Payment_Frequency: paymentFrequency,
        Quantity: String(quantity),
        Settlement_Date: settlementDateYmd,
        Dated_Date: datedDate,
        Last_IP_Date: lastCouponDate,
        Next_IP_Date: nextCouponDate,
        Maturity_Date: maturityDate,
        Period_Status: periodStatus,
        Input_Type: useCleanPrice ? "Calculate from Clean Price" : "Calculate from Yield",
        Pricing_Input: resolvedPricingInput,
        Is_End_Of_Month_Bond: "No",
        Price_Rounding_Decimals: "4",
        Stamp_Duty: stampDuty != null ? String(stampDuty) : "0",
        Day_Convention: toCalcDayConvention(bond?.dayConvention ?? bondData?.dayConvention),
        Bond_Type: bondType,
        amort_schedule:
            bondType === "Amortizing"
                ? JSON.stringify(calcBond?.amort_schedule ?? [])
                : "",
    };

    let response: {
        data: {
            accrued_days: number;
            cf_count: number;
            cf_rows: Array<{
                date: string;
                days: number;
                interest: string;
                num: number;
                principal: string;
                total: string;
                total_raw: number;
            }>;
            final_price: string;
            final_yield: string;
            final_yield_raw: number;
            period_status: string;
            principal_amount: string;
            quantity: string;
            running_total: string;
            settle_dt: string;
            settlement_amount: string;
            stamp_duty: string;
            total_ai: string;
            total_consideration: string;
        };
    };
    try {
        response = await axios.post(
            "https://calc.meradhan.co/api/calculate",
            payload,
        );
    } catch (err) {
        if (axios.isAxiosError(err)) {
            const apiError =
                err.response?.data &&
                typeof err.response.data === "object" &&
                "error" in err.response.data
                    ? String((err.response.data as { error: unknown }).error)
                    : err.message;
            throw new Error(`Bond calc failed: ${apiError}`);
        }
        throw err;
    }
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

    const calcAccruedDaysFromApi = Number(response.data.accrued_days);
    const accruedDaysResolved =
        pricing.isUnderShutPeriod && Number.isFinite(calcAccruedDaysFromApi)
            ? calcAccruedDaysFromApi
            : pricing.noOfAccrualDays;

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
        calc: {
            ...response.data,
            accrued_days: accruedDaysResolved,
        },
        inputSources: {
            usedProviderPrice: resolved.usedProviderPrice,
            usedProviderQuantity: resolved.usedProviderQuantity,
            usedProviderSettlementDate: resolved.usedProviderSettlementDate,
        },
    };
};