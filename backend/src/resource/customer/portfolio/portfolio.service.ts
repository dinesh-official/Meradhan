import { db } from "@core/database/database";
import { OrderStatus } from "@databases/generated/prisma/postgres";
import {
  isNA,
  formatDateStr,
  parseSettleDate,
  getMaturityBucketLabel,
  getCouponBucket,
  enumerateBondPortfolioCashflows,
} from "./portfolio.utils";
import { computePortfolioInterestEarned } from "./portfolio_interest_earned.service";

/** Portfolio summary, details, and charts use only fully settled orders (no date cutoff). */
const PORTFOLIO_ORDER_STATUS = OrderStatus.SETTLED;

function toPositiveYieldPercent(v: unknown): number | undefined {
  if (typeof v === "number" && Number.isFinite(v) && v > 0) return v;
  if (typeof v === "string" && v.trim()) {
    const n = Number(v.replace(/,/g, ""));
    if (Number.isFinite(n) && n > 0) return n;
  }
  return undefined;
}

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const MS_PER_DAY = 86_400_000;
/** Same convention as `getInvestmentByMaturityBucket` (actuarial year length). */
const DAYS_PER_YEAR = 365.25;

/** IST calendar "today" as a UTC midnight anchor (matches bond IST date columns). */
function istTodayUtcCalendarDate(now = new Date()): Date {
  const ist = new Date(now.getTime() + IST_OFFSET_MS);
  return new Date(Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate()));
}

function toUtcCalendarDate(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function calendarMaturityFromBond(bond: {
  maturityDateIst: Date | null;
  maturityDate: Date | null;
}): Date | null {
  const src = bond.maturityDateIst ?? bond.maturityDate;
  if (!src) return null;
  const t = src instanceof Date ? src.getTime() : new Date(src).getTime();
  if (!Number.isFinite(t)) return null;
  return toUtcCalendarDate(src instanceof Date ? src : new Date(src));
}

export class PortfolioService {
  private rfqFromMetadata(metadata: unknown): string | undefined {
    const v = (metadata as { rfqNumber?: unknown } | null)?.rfqNumber;
    return typeof v === "string" && v.trim().length > 0 ? v.trim() : undefined;
  }

  /** Same as customer order history: `settle_order.orderNumber` ← metadata.rfqNumber or reqOrderNumber. */
  private settleOrderLinkKey(o: {
    metadata: unknown;
    reqOrderNumber: string | null;
  }): string | undefined {
    const fromMeta = this.rfqFromMetadata(o.metadata);
    if (fromMeta) return fromMeta;
    if (typeof o.reqOrderNumber === "string" && o.reqOrderNumber.trim().length > 0) {
      return o.reqOrderNumber.trim();
    }
    return undefined;
  }

  /**
   * Yields stored on `Order.bondDetails` (snapshot of the bond row at checkout).
   * Prefer buy/trade notion over stale listing `yield` when present.
   */
  private snapshotYieldFromBondDetails(bondDetails: unknown): number | undefined {
    if (!bondDetails || typeof bondDetails !== "object") return undefined;
    const b = bondDetails as Record<string, unknown>;
    return (
      toPositiveYieldPercent(b.buyYield) ??
      toPositiveYieldPercent(b.yield) ??
      toPositiveYieldPercent(b.lastTradeYield)
    );
  }

  private async loadSettlementRollups(rfqNumbers: string[]) {
    const considerationByRfq = new Map<string, number>();
    const marketValueByRfq = new Map<string, number>();
    const yieldWeightedByRfq = new Map<string, { weightedYield: number; marketValue: number }>();
    const lastSettleDateByRfqEmpty = new Map<string, Date>();

    if (!rfqNumbers.length) {
      return {
        considerationByRfq,
        marketValueByRfq,
        yieldWeightedByRfq,
        lastSettleDateByRfq: lastSettleDateByRfqEmpty,
      };
    }

    const settled = await db.dataBase.settleOrderModel.findMany({
      where: { orderNumber: { in: rfqNumbers } },
      select: {
        orderNumber: true,
        modConsideration: true,
        stampDutyAmount: true,
        price: true,
        value: true,
        modQuantity: true,
        yield: true,
        modSettleDate: true,
      },
    });

    const lastSettleDateByRfq = lastSettleDateByRfqEmpty;

    for (const s of settled) {
      const consideration =
        Number(s.modConsideration ?? 0) + Number(s.stampDutyAmount ?? 0);
      if (consideration > 0) {
        considerationByRfq.set(
          s.orderNumber,
          (considerationByRfq.get(s.orderNumber) ?? 0) + consideration,
        );
      }

      if (s.modSettleDate) {
        const d = parseSettleDate(s.modSettleDate);
        if (d) {
          const prev = lastSettleDateByRfq.get(s.orderNumber);
          if (!prev || d.getTime() > prev.getTime()) {
            lastSettleDateByRfq.set(s.orderNumber, d);
          }
        }
      }

      const mv =
        (Number(s.price ?? 0) / 100) *
        Number(s.value ?? 0) *
        Number(s.modQuantity ?? 0);
      const ytm = Number(s.yield ?? 0);
      if (!(mv > 0)) continue;

      marketValueByRfq.set(
        s.orderNumber,
        (marketValueByRfq.get(s.orderNumber) ?? 0) + mv,
      );

      const prev = yieldWeightedByRfq.get(s.orderNumber);
      if (prev) {
        const nextMv = prev.marketValue + mv;
        const nextYtm =
          nextMv > 0
            ? (prev.weightedYield * prev.marketValue + mv * ytm) / nextMv
            : prev.weightedYield;
        yieldWeightedByRfq.set(s.orderNumber, {
          weightedYield: nextYtm,
          marketValue: nextMv,
        });
      } else {
        yieldWeightedByRfq.set(s.orderNumber, { weightedYield: ytm, marketValue: mv });
      }
    }

    return { considerationByRfq, marketValueByRfq, yieldWeightedByRfq, lastSettleDateByRfq };
  }

  /**
   * One row per **settled bond order** (payment completed + `OrderStatus.SETTLED`),
   * with positive invested amount. Single source for summary cards, portfolio details,
   * allocation charts, and cashflow so all figures match.
   *
   * Invested amount: NSE settle (consideration + stamp) when RFQ-linked; otherwise
   * `order.totalAmount` when `CustomerBonds` exists for that order.
   * No date window: every qualifying settled order is included.
   */
  private async paidOrderPortfolioRows(customerId: number) {
    const orders = await db.dataBase.order.findMany({
      where: {
        customerProfileId: customerId,
        status: PORTFOLIO_ORDER_STATUS,
      },
      select: {
        id: true,
        isin: true,
        quantity: true,
        totalAmount: true,
        metadata: true,
        reqOrderNumber: true,
        bondDetails: true,
        createdAt: true,
      },
    });

    if (!orders.length) return [];

    const bondPurchases = await db.dataBase.customerBonds.findMany({
      where: { customerProfileId: customerId },
      select: { orderId: true, purchaseDate: true },
    });
    const bondOrderIds = new Set(bondPurchases.map((b) => b.orderId));
    const bondPurchaseByOrderId = new Map(bondPurchases.map((b) => [b.orderId, b.purchaseDate]));

    const rfqNumbers = [
      ...new Set(
        orders
          .map((o) => this.settleOrderLinkKey(o))
          .filter((v): v is string => !!v),
      ),
    ];

    const { considerationByRfq, marketValueByRfq, yieldWeightedByRfq, lastSettleDateByRfq } =
      await this.loadSettlementRollups(rfqNumbers);

    const rows: Array<{
      orderId: number;
      isin: string;
      quantity: number;
      rfq: string | null;
      investedAmount: number;
      maturityWeight: number;
      settleYtm?: number | undefined;
      settleMv?: number | undefined;
      /** YTM/yield captured on the order at purchase (from bond snapshot). */
      snapshotYield?: number | undefined;
      cashflowAnchorDate: Date | null;
    }> = [];

    for (const o of orders) {
      const rfq = this.settleOrderLinkKey(o) ?? null;
      const snapshotYield = this.snapshotYieldFromBondDetails(o.bondDetails);
      let invested = rfq ? (considerationByRfq.get(rfq) ?? 0) : 0;
      if (invested <= 0 && bondOrderIds.has(o.id)) {
        invested = Number(o.totalAmount ?? 0);
      }
      if (invested <= 0 || !o.isin) continue;

      const mv = rfq ? (marketValueByRfq.get(rfq) ?? 0) : 0;
      const maturityWeight = mv > 0 ? mv : invested;
      const yw = rfq ? yieldWeightedByRfq.get(rfq) : undefined;

      const settleDate = rfq ? lastSettleDateByRfq.get(rfq) : undefined;
      const purchase = bondPurchaseByOrderId.get(o.id);
      const cashflowAnchorDate =
        settleDate ?? purchase ?? o.createdAt ?? null;

      rows.push({
        orderId: o.id,
        isin: o.isin,
        quantity: Number(o.quantity ?? 0),
        rfq,
        investedAmount: invested,
        maturityWeight,
        settleYtm: yw?.weightedYield,
        settleMv: mv > 0 ? mv : undefined,
        snapshotYield,
        cashflowAnchorDate,
      });
    }

    return rows;
  }

  /** Interest accrued / coupon amounts recognised to IST calendar today (see `portfolio_interest_earned.service`). */
  private async getInterestEarnedToDate(customerId: number): Promise<number> {
    const holdings = await this.paidOrderPortfolioRows(customerId);
    const valid = holdings.filter(
      (h) => h.investedAmount > 0 && h.cashflowAnchorDate != null,
    );
    if (!valid.length) return 0;

    const bonds = await db.dataBase.bonds.findMany({
      where: { isin: { in: this.uniqueIsins(valid) } },
      select: {
        isin: true,
        faceValue: true,
        couponRate: true,
        interestPaymentMode: true,
        interestPaymentFrequency: true,
        dateOfAllotment: true,
        maturityDate: true,
        maturityDateIst: true,
        allCouponDates: true,
      },
    });
    const bondByIsin = new Map(bonds.map((b) => [b.isin, b]));

    const rows = valid.map((h) => ({
      isin: h.isin,
      quantity: h.quantity,
      settleDate:
        h.cashflowAnchorDate instanceof Date
          ? h.cashflowAnchorDate
          : new Date(h.cashflowAnchorDate!),
    }));

    return computePortfolioInterestEarned(rows, bondByIsin, istTodayUtcCalendarDate());
  }

  private async getSettledOrdersWithAmount(customerId: number) {
    const rows = await this.paidOrderPortfolioRows(customerId);
    return rows.map((r) => ({
      isin: r.isin,
      rfqNumber: r.rfq ?? "",
      investedAmount: r.investedAmount,
    }));
  }

  private uniqueIsins(orders: { isin: string }[]): string[] {
    return Array.from(new Set(orders.map((o) => o.isin)));
  }

  async getTotalInvestedAmount(customerId: number) {
    const empty = {
      totalInvested: 0,
      formattedTotalInvested: "0.00",
      currency: "₹",
      totalInvestments: 0,
    };

    const rows = await this.paidOrderPortfolioRows(customerId);
    if (!rows.length) return empty;

    const total = rows.reduce((sum, r) => sum + r.investedAmount, 0);
    const rounded = Number(total.toFixed(2));
    const formatted = rounded.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return {
      totalInvested: rounded,
      formattedTotalInvested: formatted,
      currency: "₹",
      totalInvestments: rows.length,
    };
  }

  async getAverageMaturity(customerId: number) {
    const empty = {
      averageMaturityYears: 0,
      averageMaturityMonths: 0,
      averageMaturityRemaining: { years: 0, months: 0 },
      formatted: "0 Years & 0 Months",
      totalHoldingsConsidered: 0,
    };

    const rows = await this.paidOrderPortfolioRows(customerId);
    if (!rows.length) return empty;

    const bonds = await db.dataBase.bonds.findMany({
      where: { isin: { in: this.uniqueIsins(rows) } },
      select: { isin: true, maturityDate: true, maturityDateIst: true },
    });

    const maturityCalByIsin = new Map<string, Date>();
    for (const b of bonds) {
      const cal = calendarMaturityFromBond(b);
      if (cal) maturityCalByIsin.set(b.isin, cal);
    }

    const today = istTodayUtcCalendarDate();

    let weightedTTM = 0;
    let totalWeight = 0;
    let count = 0;

    for (const order of rows) {
      const maturityCal = maturityCalByIsin.get(order.isin);
      if (!maturityCal) continue;

      if (maturityCal.getTime() <= today.getTime()) continue;

      const ttmYears =
        (maturityCal.getTime() - today.getTime()) / (DAYS_PER_YEAR * MS_PER_DAY);
      if (ttmYears <= 0) continue;

      const w = order.investedAmount;
      if (!(w > 0)) continue;

      weightedTTM += w * ttmYears;
      totalWeight += w;
      count += 1;
    }

    if (totalWeight === 0) return empty;

    const avgYears = weightedTTM / totalWeight;
    const years = Math.floor(avgYears);
    let months = Math.round((avgYears - years) * 12);
    const finalYears = months === 12 ? years + 1 : years;
    const finalMonths = months === 12 ? 0 : months;

    return {
      averageMaturityYears: finalYears,
      averageMaturityMonths: finalYears * 12 + finalMonths,
      averageMaturityRemaining: { years: finalYears, months: finalMonths },
      formatted: `${finalYears === 1 ? "1 Year" : `${finalYears} Years`} & ${finalMonths === 1 ? "1 Month" : `${finalMonths} Months`}`,
      totalHoldingsConsidered: count,
    };
  }

  async getAveragePortfolioYield(customerId: number) {
    const empty = { averageYield: 0, formatted: "0.0000%", totalHoldingsConsidered: 0 };

    const rows = await this.paidOrderPortfolioRows(customerId);
    if (!rows.length) return empty;

    const bonds = await db.dataBase.bonds.findMany({
      where: { isin: { in: this.uniqueIsins(rows) } },
      select: { isin: true, yield: true, buyYield: true, lastTradeYield: true },
    });
    const bondFallbackYieldByIsin = new Map<string, number>();
    for (const b of bonds) {
      const y =
        toPositiveYieldPercent(b.buyYield) ??
        toPositiveYieldPercent(b.lastTradeYield) ??
        toPositiveYieldPercent(b.yield);
      if (y !== undefined) bondFallbackYieldByIsin.set(b.isin, y);
    }

    let weightedYield = 0;
    let totalWeight = 0;
    let count = 0;

    for (const order of rows) {
      const settle =
        typeof order.settleYtm === "number" && Number.isFinite(order.settleYtm) && order.settleYtm > 0
          ? order.settleYtm
          : undefined;
      const snap =
        typeof order.snapshotYield === "number" &&
          Number.isFinite(order.snapshotYield) &&
          order.snapshotYield > 0
          ? order.snapshotYield
          : undefined;
      const live = bondFallbackYieldByIsin.get(order.isin);

      const ytm = settle ?? snap ?? live;
      if (ytm === undefined || !Number.isFinite(ytm) || ytm <= 0) continue;

      // Weight by invested capital so the headline matches "Invested Amount" semantics
      // (MV-weighting skews the average vs what customers expect from their fills).
      const w = order.investedAmount;
      if (!(w > 0)) continue;

      weightedYield += w * ytm;
      totalWeight += w;
      count += 1;
    }

    if (totalWeight === 0) return empty;

    const avgYield = weightedYield / totalWeight;
    const truncated = Math.trunc(avgYield * 10000) / 10000;

    return {
      averageYield: truncated,
      formatted: `${truncated.toFixed(4)}%`,
      totalHoldingsConsidered: count,
    };
  }

  async getInvestmentByBondRating(customerId: number) {
    const ordersWithAmount = await this.getSettledOrdersWithAmount(customerId);
    if (!ordersWithAmount.length) return [];

    const bonds = await db.dataBase.bonds.findMany({
      where: { isin: { in: this.uniqueIsins(ordersWithAmount) } },
      select: { isin: true, creditRating: true },
    });

    const ratingByIsin = new Map(bonds.map((b) => [b.isin, b.creditRating ?? "UNRATED"]));

    const ratingMap = new Map<string, { rating: string; bondCount: number; totalInvestment: number }>();

    for (const order of ordersWithAmount) {
      const rating = ratingByIsin.get(order.isin) ?? "UNRATED";
      const entry = ratingMap.get(rating) ?? { rating, bondCount: 0, totalInvestment: 0 };
      entry.bondCount += 1;
      entry.totalInvestment += order.investedAmount;
      ratingMap.set(rating, entry);
    }

    return Array.from(ratingMap.values()).map((e) => ({
      rating: e.rating,
      bondCount: e.bondCount,
      totalInvestment: Number(e.totalInvestment.toFixed(2)),
    }));
  }

  async getInvestmentAllocation(customerId: number) {
    const ordersWithAmount = await this.getSettledOrdersWithAmount(customerId);
    if (!ordersWithAmount.length) return [];

    // Aggregate by ISIN
    const byIsin = new Map<string, number>();
    for (const order of ordersWithAmount) {
      byIsin.set(order.isin, (byIsin.get(order.isin) ?? 0) + order.investedAmount);
    }

    const bonds = await db.dataBase.bonds.findMany({
      where: { isin: { in: Array.from(byIsin.keys()) } },
      select: { isin: true, bondName: true },
    });

    const nameByIsin = new Map(bonds.map((b) => [b.isin, b.bondName]));
    const totalRaw = Array.from(byIsin.values()).reduce((s, v) => s + v, 0);
    const total = Number(totalRaw.toFixed(2));

    return Array.from(byIsin.entries()).map(([isin, investedRaw]) => {
      const invested = Number(investedRaw.toFixed(2));
      const percentage = total > 0 ? Number(((invested / total) * 100).toFixed(2)) : 0;
      return {
        isin,
        bondName: nameByIsin.get(isin) ?? null,
        investedAmount: invested,
        allocationPercentage: percentage,
      };
    });
  }

  async getInvestmentByMaturityBucket(customerId: number) {
    const ordersWithAmount = await this.getSettledOrdersWithAmount(customerId);
    if (!ordersWithAmount.length) return [];

    const bonds = await db.dataBase.bonds.findMany({
      where: { isin: { in: this.uniqueIsins(ordersWithAmount) } },
      select: { isin: true, maturityDate: true },
    });

    const maturityByIsin = new Map(bonds.map((b) => [b.isin, b.maturityDate]));
    const now = new Date();
    const bucketMap = new Map<string, number>();

    for (const order of ordersWithAmount) {
      const matRaw = maturityByIsin.get(order.isin);
      if (!matRaw) continue;

      const yearsRemaining =
        (new Date(matRaw).getTime() - now.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      const label = getMaturityBucketLabel(yearsRemaining);
      if (!label) continue;

      bucketMap.set(label, (bucketMap.get(label) ?? 0) + order.investedAmount);
    }

    if (!bucketMap.size) return [];

    const totalRaw = Array.from(bucketMap.values()).reduce((s, v) => s + v, 0);
    const total = Number(totalRaw.toFixed(2));

    return Array.from(bucketMap.entries()).map(([bucket, amountRaw]) => {
      const invested = Number(amountRaw.toFixed(2));
      const percentage = total > 0 ? Number(((invested / total) * 100).toFixed(2)) : 0;
      return { bucket, investedAmount: invested, percentage };
    });
  }

  async getInvestmentByIssuerType(customerId: number) {
    const empty = { totalInvestment: 0, issuerAllocation: [] };

    const ordersWithAmount = await this.getSettledOrdersWithAmount(customerId);
    if (!ordersWithAmount.length) return empty;

    const bonds = await db.dataBase.bonds.findMany({
      where: { isin: { in: this.uniqueIsins(ordersWithAmount) } },
      select: { isin: true, sectorName: true },
    });

    const sectorByIsin = new Map(bonds.map((b) => [b.isin, (b.sectorName ?? "").trim()]));

    const issuerMap = new Map<string, { bondCount: number; investedAmount: number }>();
    let totalInvestmentRaw = 0;

    for (const order of ordersWithAmount) {
      totalInvestmentRaw += order.investedAmount;

      const sector = sectorByIsin.get(order.isin) ?? "";
      if (!sector || isNA(sector)) continue;

      const entry = issuerMap.get(sector) ?? { bondCount: 0, investedAmount: 0 };
      entry.bondCount += 1;
      entry.investedAmount += order.investedAmount;
      issuerMap.set(sector, entry);
    }

    if (totalInvestmentRaw === 0 || !issuerMap.size) return empty;

    return {
      totalInvestment: Number(totalInvestmentRaw.toFixed(2)),
      issuerAllocation: Array.from(issuerMap.entries()).map(([issuerType, e]) => ({
        issuerType,
        bondCount: e.bondCount,
        investedAmount: Number(e.investedAmount.toFixed(2)),
      })),
    };
  }

  async getPortfolioDetails(
    customerId: number,
    page: number = 1,
    limit: number = 10,
    bondTypes?: string[],
    bondRatings?: string[],
    couponRanges?: string[],
    paymentFrequencies?: string[]
  ) {
    const skip = (page - 1) * limit;
    const empty = { data: [], meta: { total: 0, page, limit, totalPages: 0 } };

    const holdings = await this.paidOrderPortfolioRows(customerId);
    if (!holdings.length) return empty;

    const investByOrderId = new Map(holdings.map((h) => [h.orderId, h.investedAmount]));

    const orders = await db.dataBase.order.findMany({
      where: {
        id: { in: holdings.map((h) => h.orderId) },
        status: PORTFOLIO_ORDER_STATUS,
      },
      select: {
        id: true,
        isin: true,
        bondName: true,
        quantity: true,
        faceValue: true,
        metadata: true,
        createdAt: true,
      },
    });

    const ordersWithAmount = orders
      .map((o) => {
        const investedAmount = investByOrderId.get(o.id) ?? 0;
        return { ...o, investedAmount };
      })
      .filter((o) => o.isin && o.investedAmount > 0);

    if (!ordersWithAmount.length) return empty;

    const bonds = await db.dataBase.bonds.findMany({
      where: { isin: { in: this.uniqueIsins(ordersWithAmount) } },
      select: {
        isin: true, bondName: true, description: true, faceValue: true,
        creditRating: true, couponRate: true, interestPaymentFrequency: true,
        interestPaymentMode: true, maturityDate: true, sectorName: true,
        taxStatus: true, yield: true, lastTradeYield: true, lastTradePrice: true,
        modeOfIssuance: true, couponType: true, dateOfAllotment: true,
        redemptionDate: true, ratingAgencyName: true, natureOfInstrument: true,
        nextCouponDate: true,
      },
    });

    const bondByIsin = new Map(bonds.map((b) => [b.isin, b]));

    const filtered = ordersWithAmount.filter((order) => {
      const bond = bondByIsin.get(order.isin);
      if (!bond) return false;

      if (bondTypes?.length) {
        const sector = (bond.sectorName ?? "").trim();
        if (!sector || !bondTypes.includes(sector)) return false;
      }
      if (bondRatings?.length) {
        const rating = (bond.creditRating ?? "").trim();
        if (!rating || !bondRatings.includes(rating)) return false;
      }
      if (couponRanges?.length) {
        const bucket = getCouponBucket(bond.couponRate ?? 0);
        if (!bucket || !couponRanges.includes(bucket)) return false;
      }
      if (paymentFrequencies?.length) {
        const mode = bond.interestPaymentMode;
        if (!mode || !paymentFrequencies.includes(mode)) return false;
      }

      return true;
    });

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = filtered.length;
    const paginated = filtered.slice(skip, skip + limit);

    const data = paginated.map((order) => {
      const bond = bondByIsin.get(order.isin);
      return {
        id: order.id,
        securityName: order.bondName,
        isin: order.isin,
        bondType: bond?.sectorName ?? null,
        coupon: bond?.couponRate ?? 0,
        investmentAmount: Number(order.investedAmount.toFixed(2)),
        quantity: order.quantity,
        interestFrequency: bond?.interestPaymentFrequency ?? null,
        interestPaymentMode: bond?.interestPaymentMode ?? null,
        maturityDate: bond?.maturityDate ?? null,
        faceValue: Number(bond?.faceValue ?? order.faceValue ?? 0),
        createdAt: order.createdAt,
        description: bond?.description ?? null,
        instrumentName: bond?.description ?? null,
        creditRating: bond?.creditRating ?? null,
        sectorName: bond?.sectorName ?? null,
        taxStatus: bond?.taxStatus ?? null,
        yield: bond?.yield ?? null,
        lastTradeYield: bond?.lastTradeYield ?? null,
        lastTradePrice: bond?.lastTradePrice ?? null,
        modeOfIssuance: bond?.modeOfIssuance ?? null,
        couponType: bond?.couponType ?? null,
        dateOfAllotment: bond?.dateOfAllotment ?? null,
        redemptionDate: bond?.redemptionDate ?? null,
        ratingAgencyName: bond?.ratingAgencyName ?? null,
        natureOfInstrument: bond?.natureOfInstrument ?? null,
        nextCouponDate: bond?.nextCouponDate ?? null,
      };
    });

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getPortfolioFilterOptions(customerId: number) {
    const empty = {
      bondTypes: [] as string[],
      bondRatings: [] as string[],
      couponRanges: [] as string[],
      paymentFrequencies: [] as string[],
      isins: [] as { isin: string; bondName: string }[],
    };

    const rows = await this.paidOrderPortfolioRows(customerId);
    const ordersWithAmount = rows.map((r) => ({
      isin: r.isin,
      rfqNumber: r.rfq ?? "",
      investedAmount: r.investedAmount,
    }));
    if (!ordersWithAmount.length) return empty;

    const bonds = await db.dataBase.bonds.findMany({
      where: { isin: { in: this.uniqueIsins(ordersWithAmount) } },
      select: { sectorName: true, creditRating: true, couponRate: true, interestPaymentMode: true },
    });

    const bondTypes = new Set<string>();
    const bondRatings = new Set<string>();
    const couponRanges = new Set<string>();
    const paymentFrequencies = new Set<string>();

    for (const bond of bonds) {
      const sector = (bond.sectorName ?? "").trim();
      if (sector) bondTypes.add(sector);

      const rating = (bond.creditRating ?? "").trim();
      if (rating) bondRatings.add(rating);

      const bucket = getCouponBucket(bond.couponRate ?? 0);
      if (bucket) couponRanges.add(bucket);

      if (bond.interestPaymentMode) paymentFrequencies.add(bond.interestPaymentMode);
    }

    const uniqueIsins = [
      ...new Set(
        ordersWithAmount.map((o) => o.isin).filter((x): x is string => typeof x === "string" && x.length > 0),
      ),
    ];
    const bondsForIsinLabels = await db.dataBase.bonds.findMany({
      where: { isin: { in: uniqueIsins } },
      select: { isin: true, bondName: true },
    });
    const bondNameByIsin = new Map(
      bondsForIsinLabels.map((b) => [b.isin, ((b.bondName ?? "").trim() || b.isin) as string]),
    );
    const isins = uniqueIsins
      .map((isin) => ({ isin, bondName: bondNameByIsin.get(isin) ?? isin }))
      .sort((a, b) => a.bondName.localeCompare(b.bondName, undefined, { sensitivity: "base" }));

    return {
      bondTypes: Array.from(bondTypes),
      bondRatings: Array.from(bondRatings),
      couponRanges: Array.from(couponRanges),
      paymentFrequencies: Array.from(paymentFrequencies),
      isins,
    };
  }

  async getTotalNumberOfBonds(customerId: number) {
    const holdings = await this.paidOrderPortfolioRows(customerId);
    if (!holdings.length) return 0;

    return holdings.reduce((total, h) => total + Number(h.quantity ?? 0), 0);
  }

  async getCashflowTimeline(
    customerId: number,
    startDate?: Date,
    endDate?: Date,
    bondTypes?: string[],
    isins?: string[],
  ) {
    const holdings = await this.paidOrderPortfolioRows(customerId);
    if (!holdings.length) return { years: [] };

    const validOrders = holdings
      .filter(
        (h): h is (typeof h & { cashflowAnchorDate: NonNullable<(typeof h)["cashflowAnchorDate"]> }) =>
          h.investedAmount > 0 && h.cashflowAnchorDate != null,
      )
      .map((h) => ({
        isin: h.isin,
        quantity: h.quantity,
        settledDate:
          h.cashflowAnchorDate instanceof Date ? h.cashflowAnchorDate : new Date(h.cashflowAnchorDate),
        invested: h.investedAmount,
      }));
    if (!validOrders.length) return { years: [] };

    const isinFilter =
      isins?.length ? new Set(isins.map((i) => i.trim()).filter(Boolean)) : null;
    const ordersInScope = isinFilter
      ? validOrders.filter((o) => isinFilter!.has(o.isin))
      : validOrders;
    if (!ordersInScope.length) return { years: [] };

    const bonds = await db.dataBase.bonds.findMany({
      where: { isin: { in: Array.from(new Set(ordersInScope.map((o) => o.isin))) } },
      select: {
        isin: true,
        bondName: true,
        faceValue: true,
        couponRate: true,
        interestPaymentMode: true,
        interestPaymentFrequency: true,
        dateOfAllotment: true,
        maturityDate: true,
        sectorName: true,
        allCouponDates: true,
      },
    });

    const bondByIsin = new Map(bonds.map((b) => [b.isin, b]));

    const filteredByType = bondTypes?.length
      ? ordersInScope.filter((o) => {
        const bond = bondByIsin.get(o.isin);
        return bondTypes.includes((bond?.sectorName ?? "").trim());
      })
      : ordersInScope;

    type TimelineEvent = {
      type: "INTEREST" | "MATURITY";
      bondName: string;
      maturityDateStr: string;
      amount: number;
      date: Date;
    };

    const events: TimelineEvent[] = [];

    for (const order of filteredByType) {
      const bond = bondByIsin.get(order.isin);
      if (!bond?.maturityDate || !bond?.dateOfAllotment) continue;

      const allotment = new Date(bond.dateOfAllotment);
      const maturity = new Date(bond.maturityDate);
      const settleDate = order.settledDate!;

      const schedule = enumerateBondPortfolioCashflows({
        allotment,
        maturity,
        settleDate,
        faceValuePerUnit: bond.faceValue,
        quantity: order.quantity,
        couponRatePercent: bond.couponRate,
        interestPaymentMode: bond.interestPaymentMode as unknown as string,
        interestPaymentFrequency: bond.interestPaymentFrequency,
        allCouponDates: bond.allCouponDates ?? undefined,
      });

      const maturityDateStr = formatDateStr(maturity);
      const bondName = bond.bondName;
      for (const ev of schedule) {
        events.push({
          type: ev.type,
          bondName,
          maturityDateStr,
          amount: ev.amount,
          date: ev.date,
        });
      }
    }
    const filteredEvents = events.filter((ev) => {
      if (startDate && ev.date < startDate) return false;
      if (endDate && ev.date > endDate) return false;
      return true;
    });
    // Group by year → date
    filteredEvents.sort((a, b) => a.date.getTime() - b.date.getTime());

    const yearsMap = new Map<number, { year: number; totalPayout: number; datesMap: Map<string, any> }>();
    let sideToggle: "left" | "right" = "left";

    for (const ev of filteredEvents) {
      const year = ev.date.getUTCFullYear();
      const dStr = formatDateStr(ev.date);

      if (!yearsMap.has(year)) {
        yearsMap.set(year, { year, totalPayout: 0, datesMap: new Map() });
      }

      const yearObj = yearsMap.get(year)!;
      yearObj.totalPayout += ev.amount;

      if (!yearObj.datesMap.has(dStr)) {
        yearObj.datesMap.set(dStr, { date: dStr, totalPayout: 0, side: sideToggle, events: [] });
        sideToggle = sideToggle === "left" ? "right" : "left";
      }

      const dateObj = yearObj.datesMap.get(dStr);
      dateObj.totalPayout += ev.amount;
      dateObj.events.push({
        type: ev.type,
        bondName: ev.bondName,
        maturityDate: ev.maturityDateStr,
        amount: ev.amount,
      });
    }

    const years = Array.from(yearsMap.values())
      .map(({ datesMap, ...rest }) => ({ ...rest, dates: Array.from(datesMap.values()) }))
      .sort((a, b) => a.year - b.year);

    return { years };
  }

  async getPortfolioSummary(customerId: number) {
    const [invested, maturity, yieldResult, totalBonds, interestEarnedToDate] = await Promise.all([
      this.getTotalInvestedAmount(customerId),
      this.getAverageMaturity(customerId),
      this.getAveragePortfolioYield(customerId),
      this.getTotalNumberOfBonds(customerId),
      this.getInterestEarnedToDate(customerId),
    ]);

    return {
      investedAmount: invested.totalInvested,
      currency: invested.currency,
      averageMaturity: {
        years: maturity.averageMaturityRemaining.years,
        months: maturity.averageMaturityRemaining.months,
        formatted: maturity.formatted,
      },
      numberOfBonds: totalBonds,
      averageYield: {
        value: yieldResult.averageYield,
        formatted: `${yieldResult.formatted} per annum`,
      },
      interestEarnedToDate,
    };
  }


  async getCashflowToMaturity(customerId: number) {
    const empty = { "1yr": [], "2yrs": [], "5yrs": [] };
    const holdings = await this.paidOrderPortfolioRows(customerId);
    if (!holdings.length) return empty;

    const validOrders = holdings
      .filter(
        (h): h is (typeof h & { cashflowAnchorDate: NonNullable<(typeof h)["cashflowAnchorDate"]> }) =>
          h.investedAmount > 0 && h.cashflowAnchorDate != null,
      )
      .map((h) => ({
        isin: h.isin,
        quantity: h.quantity,
        settledDate:
          h.cashflowAnchorDate instanceof Date ? h.cashflowAnchorDate : new Date(h.cashflowAnchorDate),
        invested: h.investedAmount,
      }));
    if (!validOrders.length) return empty;

    const bonds = await db.dataBase.bonds.findMany({
      where: { isin: { in: Array.from(new Set(validOrders.map((o) => o.isin))) } },
      select: {
        isin: true,
        bondName: true,
        faceValue: true,
        couponRate: true,
        interestPaymentMode: true,
        interestPaymentFrequency: true,
        dateOfAllotment: true,
        maturityDate: true,
        allCouponDates: true,
      },
    });

    const bondByIsin = new Map(bonds.map((b) => [b.isin, b]));
    type CashflowEvent = {
      type: "INTEREST" | "MATURITY";
      month: string;
      amount: number;
      date: Date;
    };

    const toMonthKey = (d: Date): string => {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${monthNames[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
    };

    const events: CashflowEvent[] = [];
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    for (const order of validOrders) {
      const bond = bondByIsin.get(order.isin);
      if (!bond?.maturityDate || !bond?.dateOfAllotment) continue;

      const allotment = new Date(bond.dateOfAllotment);
      const maturity = new Date(bond.maturityDate);
      const settleDate = order.settledDate!;

      if (maturity.getTime() <= today.getTime()) continue;

      const schedule = enumerateBondPortfolioCashflows({
        allotment,
        maturity,
        settleDate,
        faceValuePerUnit: bond.faceValue,
        quantity: order.quantity,
        couponRatePercent: bond.couponRate,
        interestPaymentMode: bond.interestPaymentMode as unknown as string,
        interestPaymentFrequency: bond.interestPaymentFrequency,
        allCouponDates: bond.allCouponDates ?? undefined,
      });

      for (const ev of schedule) {
        events.push({
          type: ev.type,
          month: toMonthKey(ev.date),
          amount: ev.amount,
          date: new Date(ev.date),
        });
      }
    }

    if (!events.length) return empty;
    const monthData = new Map<string, { date: Date; Principal: number; Interest: number }>();

    for (const ev of events) {
      const entry = monthData.get(ev.month) ?? { date: ev.date, Principal: 0, Interest: 0 };

      if (ev.type === "MATURITY") {
        entry.Principal += ev.amount;
      } else {
        entry.Interest += ev.amount;
      }

      monthData.set(ev.month, entry);
    }

    const sortedMonths = Array.from(monthData.entries())
      .sort(([, a], [, b]) => a.date.getTime() - b.date.getTime())
      .map(([month, { Principal, Interest }]) => ({
        month,
        Principal: Number(Principal.toFixed(2)),
        Interest: Number(Interest.toFixed(2)),
      }));

    if (!sortedMonths.length) return empty;

    const startIdx = sortedMonths.findIndex((m) => {
      const entry = monthData.get(m.month)!;
      const entryYear = entry.date.getUTCFullYear();
      const entryMonth = entry.date.getUTCMonth();
      return (
        entryYear > today.getUTCFullYear() ||
        (entryYear === today.getUTCFullYear() && entryMonth >= today.getUTCMonth())
      );
    });

    const futureMonths = startIdx === -1 ? [] : sortedMonths.slice(startIdx);

    const oneYear = new Date(today);
    oneYear.setUTCFullYear(oneYear.getUTCFullYear() + 1);

    const twoYear = new Date(today);
    twoYear.setUTCFullYear(twoYear.getUTCFullYear() + 2);

    const fiveYear = new Date(today);
    fiveYear.setUTCFullYear(fiveYear.getUTCFullYear() + 5);

    const filterByDate = (limit: Date) =>
      futureMonths.filter((m) => {
        const entry = monthData.get(m.month)!;
        return entry.date <= limit;
      });

    return {
      "1yr": filterByDate(oneYear),
      "2yrs": filterByDate(twoYear),
      "5yrs": filterByDate(fiveYear),
    };
  }
}