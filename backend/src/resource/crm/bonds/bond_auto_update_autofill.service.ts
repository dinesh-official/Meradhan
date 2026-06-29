import { db } from "@core/database/database";
import { AppError, HttpStatus } from "@utils/error/AppError";
import {
  buildCalcPayloadAndContext,
  collectAllCouponDatesYmd,
  mapNatureOfInstrument,
  parseCalcMoneyString,
  paymentFrequencyToDbEnum,
  postToCalcApi,
  resolveAutoUpdateCalcInputs,
  toYyyyMmDd,
  type AutoUpdateAutofillInput,
} from "./bond_auto_update_autofill.calc";

export type BondDealAutofillResponse = {
  isin: string;
  quantity: number;
  sources: {
    usedReferenceMetadata: boolean;
    usedCouponSchedule: boolean;
    yieldSource: "override" | "consolidated" | "bonds";
    usedProviderPrice?: boolean;
    usedProviderQuantity?: boolean;
    usedProviderSettlementDate?: boolean;
    usedCalcBondApi?: boolean;
  };
  suggested: {
    bondName?: string | null;
    creditRating?: string | null;
    allCouponDates?: string[];
    allCouponDatesIst?: string[];
    natureOfInstrument?: "SECURED" | "UNSECURED" | "UNKNOWN" | null;
    maturityDate: string | null;
    dateOfAllotment: string | null;
    lastCouponDate: string;
    nextCouponDate: string;
    recordDate: string | null;
    recordDays: number | null;
    accruedInterestDays: number | null;
    dueDate: string | null;
    dayConvention: string | null;
    interestPaymentFrequency: string;
    interestPaymentMode: string;
    faceValue: number;
    couponRate: number;
    buyYield: number | null;
    yield: number;
    sellPrice: number | null;
    settlementAmount: number | null;
    accruedInterest: number | null;
    principalAmount: number | null;
    totalConsideration: number | null;
    isUnderShutPeriod?: boolean;
    bondType?: string | null;
    seniority?: string | null;
    redemptionType?: string | null;
    taxStatus?: string | null;
    isListed?: string | null;
    couponType?: string | null;
    categories?: string[];
  };
  pricing: {
    finalPrice: number | null;
    finalYieldRaw: number;
    settlementAmount: number | null;
    totalAccruedInterest: number | null;
    principalAmount: number | null;
    totalConsideration: number | null;
    calc: Record<string, unknown>;
  };
  margin: Record<string, unknown>;
};

export class BondAutoUpdateAutofillService {
  async buildAutofill(
    isin: string,
    input: AutoUpdateAutofillInput = {},
  ): Promise<BondDealAutofillResponse> {
    const bond = await db.dataBase.bondReferenceMetadata.findFirst({
      where: { isin },
    });
    const bondData = await db.dataBase.bonds.findFirst({ where: { isin } });

    if (!bond && !bondData) {
      throw new AppError(`Bond not found for ISIN ${isin}`, {
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    const couponRows = await db.dataBase.bondReferenceCouponPaymentDate.findMany(
      {
        where: { isin },
        orderBy: { id: "asc" },
      },
    );

    const resolved = resolveAutoUpdateCalcInputs(bondData, input);
    const ctx = await buildCalcPayloadAndContext(
      isin,
      bond,
      bondData,
      couponRows,
      resolved,
    );

    const calcResponse = await postToCalcApi(ctx.payload);

    const allCouponDates = collectAllCouponDatesYmd(
      couponRows,
      calcResponse.cf_rows,
      bondData?.allCouponDates,
    );

    const bondName =
      (
        bondData?.bondName?.trim() ||
        bond?.issuerName?.trim() ||
        ctx.calcBond?.issuer_name?.trim() ||
        ""
      ).trim() || null;
    const creditRating = bondData?.creditRating?.trim() || "UnRated";
    const natureOfInstrument =
      mapNatureOfInstrument(
        bondData?.natureOfInstrument ?? bond?.natureOfInstrument,
      ) ?? null;

    const finalPrice = parseCalcMoneyString(calcResponse.final_price);
    const finalYieldRaw = Number(calcResponse.final_yield_raw ?? 0);

    const isUnderShutPeriodFromCalc = /shut/i.test(
      String(ctx.periodStatus ?? calcResponse.period_status ?? ""),
    );

    const sellPriceResolved =
      finalPrice != null && Number.isFinite(finalPrice)
        ? Number(finalPrice.toFixed(4))
        : null;

    const accruedDaysRaw = calcResponse.accrued_days;
    const accruedInterestDays =
      accruedDaysRaw != null && Number.isFinite(Number(accruedDaysRaw))
        ? Math.round(Number(accruedDaysRaw))
        : null;

    const settlementAmountResolved = parseCalcMoneyString(
      calcResponse.settlement_amount,
    );
    const accruedInterestResolved = parseCalcMoneyString(calcResponse.total_ai);
    const principalAmountResolved = parseCalcMoneyString(
      calcResponse.principal_amount,
    );
    const totalConsiderationResolved = parseCalcMoneyString(
      calcResponse.total_consideration,
    );

    const suggested = {
      bondName,
      creditRating,
      allCouponDates,
      allCouponDatesIst: allCouponDates,
      natureOfInstrument,
      maturityDate:
        toYyyyMmDd(ctx.calcBond?.Maturity_Date) ??
        toYyyyMmDd(bond?.maturityDate) ??
        null,
      dateOfAllotment:
        toYyyyMmDd(ctx.calcBond?.Dated_Date) ??
        toYyyyMmDd(bond?.issueDateIst) ??
        null,
      lastCouponDate: String(ctx.payload.Last_IP_Date ?? ""),
      nextCouponDate: String(ctx.payload.Next_IP_Date ?? ""),
      recordDate: toYyyyMmDd(ctx.pricing.recordDate) ?? null,
      recordDays: ctx.couponDate.recordDays,
      accruedInterestDays,
      dueDate: ctx.dueDateYmd ?? null,
      dayConvention: bond?.dayConvention ?? bondData?.dayConvention ?? null,
      interestPaymentFrequency:
        paymentFrequencyToDbEnum(ctx.payload.Payment_Frequency) ||
        bond?.interestPaymentFrequency ||
        "UNKNOWN",
      interestPaymentMode: paymentFrequencyToDbEnum(
        ctx.payload.Payment_Frequency,
      ),
      faceValue: Number(ctx.payload.Face_Value ?? bond?.faceValue ?? bondData?.faceValue ?? 0),
      couponRate: Number(
        Number(ctx.payload.Coupon_Rate_Pct ?? bond?.couponRate ?? bondData?.couponRate ?? 0).toFixed(2),
      ),
      buyYield: (() => {
        const raw =
          bondData?.buyYield ??
          bondData?.yield ??
          (Number(calcResponse.final_yield) || null);
        return raw != null && Number.isFinite(raw)
          ? Number(Number(raw).toFixed(2))
          : null;
      })(),
      yield: Number(finalYieldRaw.toFixed(2)),
      sellPrice: sellPriceResolved,
      settlementAmount: settlementAmountResolved,
      accruedInterest: accruedInterestResolved,
      principalAmount: principalAmountResolved,
      totalConsideration: totalConsiderationResolved,
      isUnderShutPeriod: isUnderShutPeriodFromCalc,
      bondType: bondData?.bondType ?? null,
      seniority: bondData?.seniority ?? null,
      redemptionType: bondData?.redemptionType ?? null,
      taxStatus: bondData?.taxStatus ?? null,
      isListed: bondData?.isListed ?? null,
      couponType: bondData?.couponType ?? null,
      categories: bondData?.categories ?? [],
    };

    const usedReferenceMetadata = bond != null;
    const usedCouponSchedule = couponRows.length > 0;

    return {
      isin,
      quantity: resolved.quantity,
      sources: {
        usedReferenceMetadata,
        usedCouponSchedule,
        yieldSource:
          resolved.pricingYieldOverride != null ? "override" : "bonds",
        usedProviderPrice: false,
        usedProviderQuantity: false,
        usedProviderSettlementDate: false,
        usedCalcBondApi: ctx.calcBond != null,
      },
      suggested,
      pricing: {
        finalPrice,
        finalYieldRaw: Number.isFinite(finalYieldRaw) ? finalYieldRaw : 0,
        settlementAmount: parseCalcMoneyString(calcResponse.settlement_amount),
        totalAccruedInterest: parseCalcMoneyString(calcResponse.total_ai),
        principalAmount: parseCalcMoneyString(calcResponse.principal_amount),
        totalConsideration: parseCalcMoneyString(
          calcResponse.total_consideration,
        ),
        calc: {
          ...calcResponse,
          ...(ctx.calcBond?.Period_Status_Note
            ? { period_status_note: ctx.calcBond.Period_Status_Note }
            : {}),
        },
      },
      margin: {},
    };
  }
}
