import { db } from "@core/database/database";
import { AppError, HttpStatus } from "@utils/error/AppError";
import {
  mapDeriDataToCalcApiResponse,
  mapDeriDataToCalcPayload,
  parseDeriDataRecordDateYmd,
} from "@services/deridata/deridata.calc.adapter";
import {
  calculatePriceToYield,
  calculateYieldToPrice,
} from "@services/deridata/deridata.calculator.client";
import {
  buildAutofillCalcContext,
  collectAllCouponDatesYmd,
  mapNatureOfInstrument,
  parseCalcMoneyString,
  paymentFrequencyToDbEnum,
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
    usedDeriDataCalculator?: boolean;
    pricingMode?: "ytm" | "cleanPrice";
    /** @deprecated Use usedDeriDataCalculator */
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
    dueDate: string | null;
    dayConvention: string | null;
    interestPaymentFrequency: string;
    interestPaymentMode: string;
    faceValue: number;
    couponRate: number;
    buyYield: number | null;
    yield: number;
    sellPrice: number | null;
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
    const ctx = await buildAutofillCalcContext(
      isin,
      bond,
      bondData,
      couponRows,
      resolved,
    );

    if (
      ctx.pricingMode === "ytm" &&
      (ctx.pricingYield == null || !Number.isFinite(ctx.pricingYield))
    ) {
      throw new AppError(
        `Pricing yield is required for ISIN ${isin}. Set buy yield or yield on the bond, or pass pricingYield.`,
        { statusCode: HttpStatus.BAD_REQUEST, code: "MISSING_PRICING_YIELD" },
      );
    }
    if (
      ctx.pricingMode === "cleanPrice" &&
      (ctx.cleanPrice == null || !Number.isFinite(ctx.cleanPrice))
    ) {
      throw new AppError(
        `Clean price is required for ISIN ${isin}. Enter a clean price or switch back to YTM mode.`,
        { statusCode: HttpStatus.BAD_REQUEST, code: "MISSING_CLEAN_PRICE" },
      );
    }

    const deriDataResponse =
      ctx.pricingMode === "cleanPrice"
        ? await calculatePriceToYield({
            isin,
            valueDate: ctx.settlementDateYmd,
            faceValue: ctx.faceValue,
            quantity: ctx.quantity,
            cleanPrice: ctx.cleanPrice!,
            cashflowShutFlag: ctx.cashflowShutFlag,
          })
        : await calculateYieldToPrice({
            isin,
            valueDate: ctx.settlementDateYmd,
            faceValue: ctx.faceValue,
            quantity: ctx.quantity,
            ytm: ctx.pricingYield,
            cashflowShutFlag: ctx.cashflowShutFlag,
          });

    const resolvedYieldRaw =
      ctx.pricingMode === "cleanPrice"
        ? Number(deriDataResponse.summary.xirr || 0)
        : ctx.pricingYield;

    const calcResponse = mapDeriDataToCalcApiResponse(deriDataResponse, {
      quantity: ctx.quantity,
      settlementDateYmd: ctx.settlementDateYmd,
      accruedDays: ctx.pricing.noOfAccrualDays,
      periodStatus: ctx.periodStatus,
      ytm: resolvedYieldRaw,
    });

    const allCouponDates = collectAllCouponDatesYmd(
      couponRows,
      calcResponse.cf_rows,
      bondData?.allCouponDates,
    );

    const bondName =
      (
        bondData?.bondName?.trim() ||
        bond?.issuerName?.trim() ||
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
      finalPrice != null && Number.isFinite(finalPrice) ? finalPrice : null;

    const recordDateFromDeriData = parseDeriDataRecordDateYmd(
      deriDataResponse.record_date,
    );

    const suggested = {
      bondName,
      creditRating,
      allCouponDates,
      allCouponDatesIst: allCouponDates,
      natureOfInstrument,
      maturityDate: ctx.maturityDate || toYyyyMmDd(bond?.maturityDate) || null,
      dateOfAllotment: ctx.datedDate || toYyyyMmDd(bond?.issueDateIst) || null,
      lastCouponDate: ctx.lastCouponDate,
      nextCouponDate: ctx.nextCouponDate,
      recordDate:
        recordDateFromDeriData ?? toYyyyMmDd(ctx.pricing.recordDate) ?? null,
      recordDays: ctx.couponDate.recordDays,
      dueDate: ctx.dueDateYmd ?? null,
      dayConvention: bond?.dayConvention ?? bondData?.dayConvention ?? null,
      interestPaymentFrequency:
        paymentFrequencyToDbEnum(ctx.interestPaymentFrequency) ||
        bond?.interestPaymentFrequency ||
        "UNKNOWN",
      interestPaymentMode: paymentFrequencyToDbEnum(
        ctx.interestPaymentFrequency,
      ),
      faceValue: ctx.faceValue,
      couponRate: ctx.couponRate,
      buyYield: (() => {
        const raw =
          ctx.pricingMode === "cleanPrice"
            ? (Number(deriDataResponse.summary.xirr) || null)
            : bondData?.buyYield ??
              bondData?.yield ??
              (Number(calcResponse.final_yield) || null);
        return raw != null && Number.isFinite(raw) ? Number(raw) : null;
      })(),
      yield:
        ctx.pricingMode === "cleanPrice"
          ? Number(deriDataResponse.summary.xirr || 0)
          : finalYieldRaw,
      sellPrice: sellPriceResolved,
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
          resolved.pricingMode === "cleanPrice" || resolved.pricingYieldOverride != null
            ? "override"
            : "bonds",
        usedProviderPrice: false,
        usedProviderQuantity: false,
        usedProviderSettlementDate: false,
        usedDeriDataCalculator: true,
        pricingMode: ctx.pricingMode,
        usedCalcBondApi: false,
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
        calc: mapDeriDataToCalcPayload(deriDataResponse, {
          quantity: ctx.quantity,
          settlementDateYmd: ctx.settlementDateYmd,
          accruedDays: ctx.pricing.noOfAccrualDays,
          periodStatus: ctx.periodStatus,
          ytm: resolvedYieldRaw,
        }),
      },
      margin: {},
    };
  }
}
