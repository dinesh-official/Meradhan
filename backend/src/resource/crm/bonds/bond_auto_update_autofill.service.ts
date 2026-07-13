import { db } from "@core/database/database";
import { AppError, HttpStatus } from "@utils/error/AppError";
import {
  mapDeriDataToCalcApiResponse,
  mapDeriDataToCalcPayload,
  parseDeriDataMoney,
  parseDeriDataPricingAmounts,
  parseDeriDataRecordDateYmd,
} from "@services/deridata/deridata.calc.adapter";
import {
  calculatePriceToYield,
  calculateYieldToPrice,
} from "@services/deridata/deridata.calculator.client";
import { mapDeriDataIssueDetailToBondFields } from "@services/deridata/deridata.issue-detail.adapter";
import { fetchIssueDetailItem } from "@services/deridata/deridata.issue-detail.client";
import {
  resolveAccrualDaysFromDailyCashflow,
  resolveAccrualDaysFromDeriDataResponse,
  toAutofillShutFields,
} from "@services/order/accrual-days-from-daily-cashflow";
import type { DeriDataCalculatorResponse } from "@services/deridata/deridata.types";
import {
  buildAutofillCalcContext,
  collectAllCouponDatesYmd,
  mapNatureOfInstrument,
  paymentFrequencyToDbEnum,
  recomputeAccruedPricing,
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
    usedDeriDataIssueDetail?: boolean;
    pricingMode?: "ytm" | "cleanPrice";
    /** @deprecated Use usedDeriDataCalculator */
    usedCalcBondApi?: boolean;
  };
  suggested: {
    bondName?: string | null;
    instrumentName?: string | null;
    description?: string | null;
    sectorName?: string | null;
    creditRating?: string | null;
    creditRatingInfo?: string | null;
    ratingAgencyName?: string | null;
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
    totalIssueSize?: number | null;
    putCallOptionDetails?: string | null;
  };
  pricing: {
    finalPrice: number | null;
    finalYieldRaw: number;
    settlementAmount: number | null;
    totalAccruedInterest: number | null;
    accruedInterestPerUnit: number | null;
    principalAmount: number | null;
    totalConsideration: number | null;
    stampDuty: number | null;
    settlementDateYmd: string | null;
    accruedDays: number | null;
    calc: Record<string, unknown>;
  };
  margin: Record<string, unknown>;
};

export class BondAutoUpdateAutofillService {
  private buildStaticIssueDetailResponse(args: {
    isin: string;
    bond: Awaited<
      ReturnType<typeof db.dataBase.bondReferenceMetadata.findFirst>
    > | null;
    couponRowsCount: number;
    issueDetailMapped: NonNullable<
      ReturnType<typeof mapDeriDataIssueDetailToBondFields>
    >;
    usedDeriDataIssueDetail: boolean;
  }): BondDealAutofillResponse {
    const { isin, bond, couponRowsCount, issueDetailMapped, usedDeriDataIssueDetail } =
      args;
    const suggested = {
      bondName: issueDetailMapped.bondName,
      instrumentName: issueDetailMapped.instrumentName,
      description: issueDetailMapped.description,
      sectorName: issueDetailMapped.sectorName,
      creditRating: issueDetailMapped.creditRating ?? "UnRated",
      creditRatingInfo: issueDetailMapped.creditRatingInfo,
      ratingAgencyName: issueDetailMapped.ratingAgencyName,
      allCouponDates: [],
      allCouponDatesIst: [],
      natureOfInstrument: issueDetailMapped.natureOfInstrument,
      maturityDate: issueDetailMapped.maturityDate,
      dateOfAllotment: issueDetailMapped.dateOfAllotment,
      lastCouponDate: "",
      nextCouponDate: "",
      recordDate: null,
      recordDays: issueDetailMapped.recordDays,
      dueDate: null,
      dayConvention: null,
      interestPaymentFrequency:
        paymentFrequencyToDbEnum(issueDetailMapped.interestPaymentFrequency) ||
        "UNKNOWN",
      interestPaymentMode:
        paymentFrequencyToDbEnum(issueDetailMapped.interestPaymentMode) ||
        "UNKNOWN",
      faceValue:
        issueDetailMapped.faceValue != null &&
          Number.isFinite(issueDetailMapped.faceValue)
          ? issueDetailMapped.faceValue
          : 0,
      couponRate:
        issueDetailMapped.couponRate != null &&
          Number.isFinite(issueDetailMapped.couponRate)
          ? issueDetailMapped.couponRate
          : 0,
      buyYield: null,
      yield: 0,
      sellPrice: null,
      isUnderShutPeriod: false,
      bondType: null,
      seniority: issueDetailMapped.seniority,
      redemptionType: issueDetailMapped.redemptionType,
      taxStatus: issueDetailMapped.taxStatus,
      isListed: issueDetailMapped.isListed,
      couponType: issueDetailMapped.couponType,
      categories: issueDetailMapped.categories,
      totalIssueSize: issueDetailMapped.totalIssueSize,
      putCallOptionDetails:
        issueDetailMapped.putCallOptionDetails?.trim() || "Put:NA Call:NA",
    };

    return {
      isin,
      quantity: 1,
      sources: {
        usedReferenceMetadata: bond != null,
        usedCouponSchedule: couponRowsCount > 0,
        yieldSource: "override",
        usedProviderPrice: false,
        usedProviderQuantity: false,
        usedProviderSettlementDate: false,
        usedDeriDataCalculator: false,
        usedDeriDataIssueDetail,
        pricingMode: "ytm",
        usedCalcBondApi: false,
      },
      suggested,
      pricing: {
        finalPrice: null,
        finalYieldRaw: 0,
        settlementAmount: null,
        totalAccruedInterest: null,
        accruedInterestPerUnit: null,
        principalAmount: null,
        totalConsideration: null,
        stampDuty: null,
        settlementDateYmd: null,
        accruedDays: null,
        calc: {},
      },
      margin: {},
    };
  }

  /** Create-bond / ISIN fetch: DeriData issue-detail only — no DB or calculator merge. */
  async buildDeriDataOnlyAutofill(isin: string): Promise<BondDealAutofillResponse> {
    const { item } = await fetchIssueDetailItem(isin);
    const issueDetailMapped = mapDeriDataIssueDetailToBondFields(item);
    return this.buildStaticIssueDetailResponse({
      isin,
      bond: null,
      couponRowsCount: 0,
      issueDetailMapped,
      usedDeriDataIssueDetail: true,
    });
  }

  async buildAutofill(
    isin: string,
    input: AutoUpdateAutofillInput = {},
  ): Promise<BondDealAutofillResponse> {
    const bond = await db.dataBase.bondReferenceMetadata.findFirst({
      where: { isin },
    });
    const bondData = await db.dataBase.bonds.findFirst({ where: { isin } });

    const couponRows = await db.dataBase.bondReferenceCouponPaymentDate.findMany(
      {
        where: { isin },
        orderBy: { id: "asc" },
      },
    );

    const resolved = resolveAutoUpdateCalcInputs(bondData, input);

    let issueDetailMapped: ReturnType<
      typeof mapDeriDataIssueDetailToBondFields
    > | null = null;
    let usedDeriDataIssueDetail = false;
    try {
      const { item } = await fetchIssueDetailItem(isin);
      issueDetailMapped = mapDeriDataIssueDetailToBondFields(item);
      usedDeriDataIssueDetail = true;
    } catch (err) {
      // Issue-detail is preferred for master fields but should not block pricing
      // when Daily Data is unavailable for this ISIN.
      console.warn(
        `[bond_auto_update_autofill] DeriData issue-detail unavailable for ${isin}:`,
        err instanceof Error ? err.message : err,
      );
    }

    if (!bond && !bondData && !issueDetailMapped) {
      throw new AppError(`Bond not found for ISIN ${isin}`, {
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    if (!bondData && issueDetailMapped) {
      return this.buildStaticIssueDetailResponse({
        isin,
        bond,
        couponRowsCount: couponRows.length,
        issueDetailMapped,
        usedDeriDataIssueDetail,
      });
    }

    let ctx: Awaited<ReturnType<typeof buildAutofillCalcContext>>;
    try {
      ctx = await buildAutofillCalcContext(
        isin,
        bond,
        bondData,
        couponRows,
        resolved,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (
        issueDetailMapped &&
        /Missing coupon schedule for ISIN/i.test(message)
      ) {
        return this.buildStaticIssueDetailResponse({
          isin,
          bond,
          couponRowsCount: couponRows.length,
          issueDetailMapped,
          usedDeriDataIssueDetail,
        });
      }
      throw err;
    }

    // Prefer Daily Data face / coupon when present so calculator sizing matches issue terms.
    if (
      issueDetailMapped?.faceValue != null &&
      Number.isFinite(issueDetailMapped.faceValue)
    ) {
      ctx.faceValue = issueDetailMapped.faceValue;
    }
    if (
      issueDetailMapped?.couponRate != null &&
      Number.isFinite(issueDetailMapped.couponRate)
    ) {
      ctx.couponRate = issueDetailMapped.couponRate;
    }
    if (issueDetailMapped?.maturityDate) {
      ctx.maturityDate = issueDetailMapped.maturityDate;
    }
    if (issueDetailMapped?.dateOfAllotment) {
      ctx.datedDate = issueDetailMapped.dateOfAllotment;
    }
    if (issueDetailMapped?.interestPaymentFrequency) {
      ctx.interestPaymentFrequency =
        issueDetailMapped.interestPaymentFrequency;
    }

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

    // Phase 1 — probe DeriData for record_date + cashflows (Redis-cached), then resolve shut/accrual.
    // Phase 2 — always call DeriData live with cashflow_shut_flag = computed shut for real-time prices.
    const probeYield =
      ctx.pricingYield != null &&
      Number.isFinite(ctx.pricingYield) &&
      ctx.pricingYield > 0
        ? ctx.pricingYield
        : 10.5;
    const probeShut = true;

    let shutFields: ReturnType<typeof toAutofillShutFields> | null = null;

    try {
      const shutAccrual = await resolveAccrualDaysFromDailyCashflow({
        isin,
        settlementDate: ctx.settlementDateYmd,
        yield: probeYield,
        faceValue: ctx.faceValue,
        quantity: ctx.quantity,
        underShut: probeShut,
      });
      shutFields = toAutofillShutFields(shutAccrual);
      ctx.cashflowShutFlag = shutFields.cashflowShutFlag;
      ctx.periodStatus = shutFields.periodStatus;
      ctx.pricing = {
        ...ctx.pricing,
        noOfAccrualDays: shutFields.accruedDays,
        isUnderShutPeriod: shutFields.isUnderShutPeriod,
      };
      if (shutFields.lastCouponDate) {
        ctx.lastCouponDate = shutFields.lastCouponDate;
      }
      if (shutFields.nextCouponDate) {
        ctx.nextCouponDate = shutFields.nextCouponDate;
      }
    } catch (err) {
      console.warn(
        `[bond_auto_update_autofill] Phase1 shut/accrual failed for ${isin}; falling back to local schedule:`,
        err instanceof Error ? err.message : err,
      );
      const recomputed = recomputeAccruedPricing({
        settlementDateYmd: ctx.settlementDateYmd,
        faceValue: ctx.faceValue,
        couponRate: ctx.couponRate,
        quantity: ctx.quantity,
        lastCouponDate: ctx.lastCouponDate,
        nextCouponDate: ctx.nextCouponDate,
        recordDays: ctx.couponDate.recordDays ?? 0,
        recordDateYmd: ctx.couponDate.recordDate || undefined,
        maturityDateYmd: ctx.maturityDate || undefined,
      });
      ctx.pricing = recomputed.pricing;
      ctx.periodStatus = recomputed.periodStatus;
      ctx.cashflowShutFlag = recomputed.cashflowShutFlag;
    }

    // Phase 2 — always live pricing. Phase-1 cashflow probe may be Redis-cached.
    let deriDataResponse: DeriDataCalculatorResponse;
    if (ctx.pricingMode === "cleanPrice") {
      deriDataResponse = await calculatePriceToYield({
        isin,
        valueDate: ctx.settlementDateYmd,
        faceValue: ctx.faceValue,
        quantity: ctx.quantity,
        cleanPrice: ctx.cleanPrice!,
        cashflowShutFlag: ctx.cashflowShutFlag,
      });
    } else {
      deriDataResponse = await calculateYieldToPrice({
        isin,
        valueDate: ctx.settlementDateYmd,
        faceValue: ctx.faceValue,
        quantity: ctx.quantity,
        ytm: ctx.pricingYield,
        cashflowShutFlag: ctx.cashflowShutFlag,
      });
    }

    // Re-resolve shut/accrual from the live Phase-2 response so dates stay aligned.
    try {
      const shutAccrual = await resolveAccrualDaysFromDeriDataResponse({
        isin,
        settlementDate: ctx.settlementDateYmd,
        response: deriDataResponse,
        lastCouponFallback: ctx.lastCouponDate,
        underShut: ctx.cashflowShutFlag,
        yield: probeYield,
      });
      shutFields = toAutofillShutFields(shutAccrual);
      ctx.cashflowShutFlag = shutFields.cashflowShutFlag;
      ctx.periodStatus = shutFields.periodStatus;
      ctx.pricing = {
        ...ctx.pricing,
        noOfAccrualDays: shutFields.accruedDays,
        isUnderShutPeriod: shutFields.isUnderShutPeriod,
      };
      if (shutFields.lastCouponDate) {
        ctx.lastCouponDate = shutFields.lastCouponDate;
      }
      if (shutFields.nextCouponDate) {
        ctx.nextCouponDate = shutFields.nextCouponDate;
      }
    } catch (err) {
      console.warn(
        `[bond_auto_update_autofill] Phase2 shut/accrual re-resolve failed for ${isin}:`,
        err instanceof Error ? err.message : err,
      );
    }

    const resolvedYieldRaw =
      ctx.pricingMode === "cleanPrice"
        ? Number(deriDataResponse.summary.xirr || 0)
        : ctx.pricingYield;

    const sellPriceResolved = (() => {
      const fromDeri = parseDeriDataMoney(deriDataResponse.summary.clean_price);
      return fromDeri != null && Number.isFinite(fromDeri) ? fromDeri : null;
    })();

    // Prefer DeriData amounts as-is (Phase 2 pricing with correct shut flag).
    const pricingAmounts = parseDeriDataPricingAmounts(deriDataResponse);

    const calcContext = {
      quantity: ctx.quantity,
      settlementDateYmd: ctx.settlementDateYmd,
      accruedDays: ctx.pricing.noOfAccrualDays,
      periodStatus: ctx.periodStatus,
      ytm: resolvedYieldRaw,
      stampDuty: pricingAmounts.stampDuty,
      settlementAmount: pricingAmounts.settlementAmount,
      totalConsideration: pricingAmounts.totalConsideration,
      principalAmount: pricingAmounts.principalAmount,
      totalAccruedInterest: pricingAmounts.totalAccruedInterest,
    };

    const calcResponse = mapDeriDataToCalcApiResponse(
      deriDataResponse,
      calcContext,
    );

    const allCouponDates = collectAllCouponDatesYmd(
      couponRows,
      undefined,
      bondData?.allCouponDates,
    );

    const finalPrice = sellPriceResolved;
    const finalYieldRaw = Number(calcResponse.final_yield_raw ?? 0);

    const isUnderShutPeriodFromCalc = ctx.cashflowShutFlag;

    const dd = issueDetailMapped;
    const hasDd = usedDeriDataIssueDetail && dd != null;

    const suggested = {
      bondName: hasDd ? (dd.bondName?.trim() || null) : (
        bondData?.bondName?.trim() ||
        bond?.issuerName?.trim() ||
        null
      ),
      instrumentName: hasDd ? dd.instrumentName : null,
      description: hasDd ? dd.description : null,
      sectorName: hasDd ? dd.sectorName : bondData?.sectorName ?? null,
      creditRating: hasDd
        ? (dd.creditRating?.trim() || "UnRated")
        : (bondData?.creditRating?.trim() || "UnRated"),
      creditRatingInfo: hasDd ? dd.creditRatingInfo : bondData?.creditRatingInfo ?? null,
      ratingAgencyName: hasDd ? dd.ratingAgencyName : bondData?.ratingAgencyName ?? null,
      allCouponDates,
      allCouponDatesIst: allCouponDates,
      natureOfInstrument: hasDd
        ? dd.natureOfInstrument
        : mapNatureOfInstrument(
          bondData?.natureOfInstrument ?? bond?.natureOfInstrument,
        ) ?? null,
      maturityDate: hasDd
        ? dd.maturityDate
        : ctx.maturityDate || toYyyyMmDd(bond?.maturityDate) || null,
      dateOfAllotment: hasDd
        ? dd.dateOfAllotment
        : ctx.datedDate || toYyyyMmDd(bond?.issueDateIst) || null,
      lastCouponDate: shutFields?.lastCouponDate || ctx.lastCouponDate,
      nextCouponDate: shutFields?.nextCouponDate || ctx.nextCouponDate,
      recordDate:
        shutFields?.recordDate ??
        parseDeriDataRecordDateYmd(deriDataResponse.record_date) ??
        toYyyyMmDd(ctx.pricing.recordDate) ??
        null,
      recordDays: shutFields?.recordDays ?? ctx.couponDate.recordDays ?? null,
      dueDate: ctx.dueDateYmd ?? null,
      dayConvention: hasDd ? null : (bond?.dayConvention ?? bondData?.dayConvention ?? null),
      interestPaymentFrequency: hasDd
        ? (paymentFrequencyToDbEnum(dd.interestPaymentFrequency) || "UNKNOWN")
        : (
          paymentFrequencyToDbEnum(ctx.interestPaymentFrequency) ||
          bond?.interestPaymentFrequency ||
          "UNKNOWN"
        ),
      interestPaymentMode: hasDd
        ? (paymentFrequencyToDbEnum(dd.interestPaymentMode) || "UNKNOWN")
        : (paymentFrequencyToDbEnum(ctx.interestPaymentFrequency) || "UNKNOWN"),
      faceValue:
        hasDd && dd.faceValue != null && Number.isFinite(dd.faceValue)
          ? dd.faceValue
          : ctx.faceValue,
      couponRate:
        hasDd && dd.couponRate != null && Number.isFinite(dd.couponRate)
          ? dd.couponRate
          : ctx.couponRate,
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
      bondType: hasDd ? null : (bondData?.bondType ?? null),
      seniority: hasDd ? dd.seniority : (bondData?.seniority ?? null),
      redemptionType: hasDd ? dd.redemptionType : (bondData?.redemptionType ?? null),
      taxStatus: hasDd ? dd.taxStatus : (bondData?.taxStatus ?? null),
      isListed: hasDd ? dd.isListed : (bondData?.isListed ?? null),
      couponType: hasDd ? dd.couponType : (bondData?.couponType ?? null),
      categories: hasDd
        ? (dd.categories?.length ? dd.categories : [])
        : (bondData?.categories ?? []),
      totalIssueSize: hasDd ? dd.totalIssueSize : null,
      putCallOptionDetails: hasDd
        ? (dd.putCallOptionDetails?.trim() || "Put:NA Call:NA")
        : "Put:NA Call:NA",
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
        usedDeriDataIssueDetail,
        pricingMode: ctx.pricingMode,
        usedCalcBondApi: false,
      },
      suggested,
      pricing: {
        finalPrice: sellPriceResolved ?? pricingAmounts.cleanPrice,
        finalYieldRaw: Number.isFinite(finalYieldRaw) ? finalYieldRaw : 0,
        settlementAmount: pricingAmounts.settlementAmount,
        totalAccruedInterest: pricingAmounts.totalAccruedInterest,
        accruedInterestPerUnit: pricingAmounts.accruedInterestPerUnit,
        principalAmount: pricingAmounts.principalAmount,
        totalConsideration: pricingAmounts.totalConsideration,
        stampDuty: pricingAmounts.stampDuty,
        settlementDateYmd: ctx.settlementDateYmd,
        accruedDays: ctx.pricing.noOfAccrualDays ?? null,
        calc: {
          ...mapDeriDataToCalcPayload(deriDataResponse, calcContext),
          // Computed shut/accrual from record_date + cashflows (source of truth).
          // Overwrite DeriData's echoed input flag so nested + top-level stay consistent.
          cashflow_shut_flag: ctx.cashflowShutFlag,
          period_status: ctx.periodStatus,
          accrued_days: ctx.pricing.noOfAccrualDays ?? 0,
          deridata: {
            ...deriDataResponse,
            cashflow_shut_flag: ctx.cashflowShutFlag,
          },
        },
      },
      margin: {},
    };
  }
}
