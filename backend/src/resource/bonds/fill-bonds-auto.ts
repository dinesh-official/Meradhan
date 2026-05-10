import { db } from "@core/database/database";
import { accruedInterest, getLastNextCouponDateBasedOnSettlementDate } from "@services/order/order-pricing-helper";
import axios from "axios";
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

export const getBondInfoCalcData = async (isin: string, { yeild }: { yeild?: string } = {}) => {

    const bond = await db.dataBase.bondReferenceMetadata.findFirst({ where: { isin: isin } });
    const bondData = await db.dataBase.bonds.findFirst({ where: { isin: isin } });

    const couponDate = await getLastNextCouponDateBasedOnSettlementDate(isin, new Date())

    const pricing = accruedInterest({
        couponRate: bond?.couponRate || 0,
        faceValue: bond?.faceValue || 0,
        lastCouponDate: new Date(couponDate.lastCouponDate!),
        nextCouponDate: new Date(couponDate!.nextCouponDate!),
        quantity: 1,
        recordDays: couponDate.recordDays || 0,
        settlementDate: new Date(),
    })

    const payload = {
        "Face_Value": bond?.faceValue?.toString(),
        "Coupon_Rate_Pct": bond?.couponRate?.toString(),
        "Payment_Frequency": bond?.interestPaymentFrequency,
        "Quantity": "1",
        "Settlement_Date": toYyyyMmDd(new Date()),
        "Dated_Date": toYyyyMmDd(bond?.issueDateIst),
        "Last_IP_Date": (couponDate?.lastCouponDate),
        "Next_IP_Date": (couponDate?.nextCouponDate),
        "Maturity_Date": toYyyyMmDd(bond?.maturityDateIst),
        "Period_Status": pricing.isUnderShutPeriod ? "Shut Period" : "Normal",
        "Input_Type": "Calculate from Yield",
        "Pricing_Input": yeild || bondData?.yield || bondData?.buyYield,
        "Is_End_Of_Month_Bond": "No",
        "Price_Rounding_Decimals": "4",
        "Stamp_Duty": "0"
    }

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
    >("https://calc.meradhan.co/api/calculate", payload);

    return {
        suggested: {
            maturityDate: toYyyyMmDd(bond?.maturityDate),
            dateOfAllotment: toYyyyMmDd(bond?.issueDateIst),
            lastCouponDate: String(payload.Last_IP_Date ?? ""),
            nextCouponDate: String(payload.Next_IP_Date ?? ""),
            recordDate: toYyyyMmDd(pricing.recordDate),
            recordDays: pricing.noOfAccrualDays,
            dueDate: null,
            dayConvention: bond?.dayConvention ?? null,
            interestPaymentFrequency: paymentFrequencyToDbEnum(payload.Payment_Frequency),
            interestPaymentMode: paymentFrequencyToDbEnum(payload.Payment_Frequency),
            faceValue: Number(bond?.faceValue ?? 0),
            couponRate: Number(bond?.couponRate ?? 0),
            buyYield: bondData?.buyYield ?? bondData?.yield ?? (Number(response.data.final_yield) || null),
            yield: Number(response.data.final_yield_raw ?? 0),
            sellPrice: Number(response.data.final_price) || null,
        },
        calc: response.data,
    }
}