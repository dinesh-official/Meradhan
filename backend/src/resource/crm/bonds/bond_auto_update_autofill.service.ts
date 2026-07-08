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
import { mapDeriDataIssueDetailToBondFields } from "@services/deridata/deridata.issue-detail.adapter";
import { fetchIssueDetailItem } from "@services/deridata/deridata.issue-detail.client";
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
    principalAmount: number | null;
    totalConsideration: number | null;
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
      dayConvention: bond?.dayConvention ?? null,
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
          : 10000,
      couponRate:
        issueDetailMapped.couponRate != null &&
        Number.isFinite(issueDetailMapped.couponRate)
          ? issueDetailMapped.couponRate
          : 0,
      buyYield: null,
      yield: 0,
      sellPrice: null,
      isUnderShutPeriod: false,
      bondType: bond?.bondType ?? null,
      seniority: issueDetailMapped.seniority,
      redemptionType: issueDetailMapped.redemptionType,
      taxStatus: issueDetailMapped.taxStatus,
      isListed: issueDetailMapped.isListed,
      couponType: issueDetailMapped.couponType,
      categories: issueDetailMapped.categories,
      totalIssueSize: issueDetailMapped.totalIssueSize,
      putCallOptionDetails: issueDetailMapped.putCallOptionDetails,
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
        principalAmount: null,
        totalConsideration: null,
        calc: {},
      },
      margin: {},
    };
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
      issueDetailMapped?.recordDays != null &&
      Number.isFinite(issueDetailMapped.recordDays)
    ) {
      ctx.couponDate = {
        ...ctx.couponDate,
        recordDays: issueDetailMapped.recordDays,
      };
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

    const dd = issueDetailMapped;
    const bondName =
      (
        dd?.bondName?.trim() ||
        bondData?.bondName?.trim() ||
        bond?.issuerName?.trim() ||
        ""
      ).trim() || null;
    const creditRating =
      dd?.creditRating?.trim() ||
      bondData?.creditRating?.trim() ||
      "UnRated";
    const natureOfInstrument =
      dd?.natureOfInstrument ??
      mapNatureOfInstrument(
        bondData?.natureOfInstrument ?? bond?.natureOfInstrument,
      ) ??
      null;

    const interestFromDd = dd?.interestPaymentFrequency
      ? paymentFrequencyToDbEnum(dd.interestPaymentFrequency)
      : null;
    const interestFromCtx = paymentFrequencyToDbEnum(
      ctx.interestPaymentFrequency,
    );

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

    const categoriesFromDd = dd?.categories?.length ? dd.categories : null;

    const suggested = {
      bondName,
      instrumentName: dd?.instrumentName ?? null,
      description: dd?.description ?? null,
      sectorName: dd?.sectorName ?? null,
      creditRating,
      creditRatingInfo: dd?.creditRatingInfo ?? null,
      ratingAgencyName: dd?.ratingAgencyName ?? null,
      allCouponDates,
      allCouponDatesIst: allCouponDates,
      natureOfInstrument,
      maturityDate:
        dd?.maturityDate ||
        ctx.maturityDate ||
        toYyyyMmDd(bond?.maturityDate) ||
        null,
      dateOfAllotment:
        dd?.dateOfAllotment ||
        ctx.datedDate ||
        toYyyyMmDd(bond?.issueDateIst) ||
        null,
      lastCouponDate: ctx.lastCouponDate,
      nextCouponDate: ctx.nextCouponDate,
      recordDate:
        recordDateFromDeriData ?? toYyyyMmDd(ctx.pricing.recordDate) ?? null,
      recordDays:
        dd?.recordDays != null && Number.isFinite(dd.recordDays)
          ? dd.recordDays
          : ctx.couponDate.recordDays,
      dueDate: ctx.dueDateYmd ?? null,
      dayConvention: bond?.dayConvention ?? bondData?.dayConvention ?? null,
      interestPaymentFrequency:
        interestFromDd ||
        interestFromCtx ||
        bond?.interestPaymentFrequency ||
        "UNKNOWN",
      interestPaymentMode: interestFromDd || interestFromCtx || "UNKNOWN",
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
      seniority: dd?.seniority ?? bondData?.seniority ?? null,
      redemptionType: dd?.redemptionType ?? bondData?.redemptionType ?? null,
      taxStatus: dd?.taxStatus ?? bondData?.taxStatus ?? null,
      isListed: dd?.isListed ?? bondData?.isListed ?? null,
      couponType: dd?.couponType ?? bondData?.couponType ?? null,
      categories: categoriesFromDd ?? bondData?.categories ?? [],
      totalIssueSize: dd?.totalIssueSize ?? null,
      putCallOptionDetails: dd?.putCallOptionDetails ?? null,
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
