import { db } from "@core/database/database";
import {
  isNA,
  formatDateStr,
  parseSettleDate,
  getMaturityBucketLabel,
  getCouponBucket,
  validateAlignment,
  getAdjustedStartDate,
  calcInterest,
  monthStepForMode,
  addMonths,
} from "./portfolio.utils";

export class PortfolioService {
  private async getSettledOrdersWithAmount(customerId: number) {
    const orders = await db.dataBase.order.findMany({
      where: {
        customerProfileId: customerId,
        paymentStatus: "COMPLETED",
        status: "SETTLED",
      },
      select: { isin: true, metadata: true },
    });

    if (!orders.length) return [];

    const rfqNumbers = orders
      .map((o) => (o.metadata as any)?.rfqNumber as string | undefined)
      .filter((v): v is string => !!v);

    if (!rfqNumbers.length) return [];

    const settled = await db.dataBase.settleOrderModel.findMany({
      where: { orderNumber: { in: rfqNumbers } },
      select: { orderNumber: true, modConsideration: true, stampDutyAmount: true },
    });

    if (!settled.length) return [];

    const amountByRfq = new Map<string, number>();
    for (const s of settled) {
      const amount = Number(s.modConsideration ?? 0) + Number(s.stampDutyAmount ?? 0);
      if (amount <= 0) continue;
      amountByRfq.set(s.orderNumber, (amountByRfq.get(s.orderNumber) ?? 0) + amount);
    }

    return orders
      .map((o) => {
        const rfq = (o.metadata as any)?.rfqNumber as string | undefined;
        return {
          isin: o.isin,
          rfqNumber: rfq,
          investedAmount: rfq ? (amountByRfq.get(rfq) ?? 0) : 0,
        };
      })
      .filter((o): o is { isin: string; rfqNumber: string; investedAmount: number } =>
        !!(o.isin && o.rfqNumber && o.investedAmount > 0)
      );
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

    const orders = await db.dataBase.order.findMany({
      where: { customerProfileId: customerId, paymentStatus: "COMPLETED", status: "SETTLED" },
      select: { metadata: true },
    });
    if (!orders.length) return empty;

    const rfqNumbers = orders
      .map((o) => (o.metadata as any)?.rfqNumber as string | undefined)
      .filter((v): v is string => !!v);
    if (!rfqNumbers.length) return empty;

    const settled = await db.dataBase.settleOrderModel.findMany({
      where: { orderNumber: { in: rfqNumbers } },
      select: { modConsideration: true, stampDutyAmount: true },
    });
    if (!settled.length) return empty;

    const total = settled.reduce(
      (sum, s) => sum + Number(s.modConsideration ?? 0) + Number(s.stampDutyAmount ?? 0),
      0
    );

    const rounded = Number(total.toFixed(2));
    const formatted = rounded.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return {
      totalInvested: formatted,
      formattedTotalInvested: formatted,
      currency: "₹",
      totalInvestments: settled.length,
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

    const orders = await db.dataBase.order.findMany({
      where: { customerProfileId: customerId, paymentStatus: "COMPLETED", status: "SETTLED" },
      select: { isin: true, metadata: true },
    });
    if (!orders.length) return empty;

    const rfqNumbers = orders
      .map((o) => (o.metadata as any)?.rfqNumber as string | undefined)
      .filter((v): v is string => !!v);
    if (!rfqNumbers.length) return empty;

    const settled = await db.dataBase.settleOrderModel.findMany({
      where: { orderNumber: { in: rfqNumbers } },
      select: { orderNumber: true, price: true, value: true, modQuantity: true },
    });
    if (!settled.length) return empty;

    const amountByRfq = new Map<string, number>();
    for (const s of settled) {
      const mv = (Number(s.price ?? 0) / 100) * Number(s.value ?? 0) * Number(s.modQuantity ?? 0);
      if (mv <= 0) continue;
      amountByRfq.set(s.orderNumber, (amountByRfq.get(s.orderNumber) ?? 0) + mv);
    }

    const ordersWithAmount = orders
      .map((o) => {
        const rfq = (o.metadata as any)?.rfqNumber as string | undefined;
        return { isin: o.isin, investedAmount: rfq ? (amountByRfq.get(rfq) ?? 0) : 0 };
      })
      .filter((o) => o.investedAmount > 0);
    if (!ordersWithAmount.length) return empty;

    const bonds = await db.dataBase.bonds.findMany({
      where: { isin: { in: this.uniqueIsins(ordersWithAmount) } },
      select: { isin: true, maturityDate: true },
    });

    const maturityByIsin = new Map(bonds.map((b) => [b.isin, b.maturityDate]));

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let weightedTTM = 0;
    let totalInvested = 0;
    let count = 0;

    for (const order of ordersWithAmount) {
      const matRaw = maturityByIsin.get(order.isin);
      if (!matRaw) continue;

      const maturity = new Date(matRaw);
      maturity.setHours(0, 0, 0, 0);
      if (maturity <= today) continue;

      const ttmYears = (maturity.getTime() - today.getTime()) / (365 * 24 * 60 * 60 * 1000);
      if (ttmYears <= 0) continue;

      weightedTTM += order.investedAmount * ttmYears;
      totalInvested += order.investedAmount;
      count += 1;
    }

    if (totalInvested === 0) return empty;

    const avgYears = weightedTTM / totalInvested;
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

    const orders = await db.dataBase.order.findMany({
      where: { customerProfileId: customerId, paymentStatus: "COMPLETED", status: "SETTLED" },
      select: { isin: true, metadata: true },
    });
    if (!orders.length) return empty;

    const rfqNumbers = orders
      .map((o) => (o.metadata as any)?.rfqNumber as string | undefined)
      .filter((v): v is string => !!v);
    if (!rfqNumbers.length) return empty;

    const settled = await db.dataBase.settleOrderModel.findMany({
      where: { orderNumber: { in: rfqNumbers } },
      select: { orderNumber: true, price: true, value: true, modQuantity: true, yield: true },
    });
    if (!settled.length) return empty;

    const dataByRfq = new Map<string, { marketValue: number; ytm: number }>();
    for (const s of settled) {
      const mv = (Number(s.price ?? 0) / 100) * Number(s.value ?? 0) * Number(s.modQuantity ?? 0);
      const ytm = Number(s.yield ?? 0);
      if (mv <= 0) continue;

      const existing = dataByRfq.get(s.orderNumber);
      if (existing) {
        const combinedMV = existing.marketValue + mv;
        const combinedYTM = combinedMV > 0
          ? (existing.marketValue * existing.ytm + mv * ytm) / combinedMV
          : existing.ytm;
        dataByRfq.set(s.orderNumber, { marketValue: combinedMV, ytm: combinedYTM });
      } else {
        dataByRfq.set(s.orderNumber, { marketValue: mv, ytm });
      }
    }

    let weightedYield = 0;
    let totalMarketValue = 0;
    let count = 0;

    for (const order of orders) {
      const rfq = (order.metadata as any)?.rfqNumber as string | undefined;
      const data = rfq ? dataByRfq.get(rfq) : null;
      if (!data) continue;

      weightedYield += data.marketValue * data.ytm;
      totalMarketValue += data.marketValue;
      count += 1;
    }

    if (totalMarketValue === 0) return empty;

    const avgYield = weightedYield / totalMarketValue;
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

    const orders = await db.dataBase.order.findMany({
      where: { customerProfileId: customerId, paymentStatus: "COMPLETED", status: "SETTLED" },
      select: { id: true, isin: true, bondName: true, quantity: true, faceValue: true, metadata: true, createdAt: true },
    });
    if (!orders.length) return empty;

    const rfqNumbers = orders
      .map((o) => (o.metadata as any)?.rfqNumber as string | undefined)
      .filter((v): v is string => !!v);
    if (!rfqNumbers.length) return empty;

    const settled = await db.dataBase.settleOrderModel.findMany({
      where: { orderNumber: { in: rfqNumbers } },
      select: { orderNumber: true, modConsideration: true, stampDutyAmount: true },
    });
    if (!settled.length) return empty;

    const amountByRfq = new Map<string, number>();
    for (const s of settled) {
      const amount = Number(s.modConsideration ?? 0) + Number(s.stampDutyAmount ?? 0);
      if (amount <= 0) continue;
      amountByRfq.set(s.orderNumber, (amountByRfq.get(s.orderNumber) ?? 0) + amount);
    }

    const ordersWithAmount = orders
      .map((o) => {
        const rfq = (o.metadata as any)?.rfqNumber as string | undefined;
        return { ...o, rfqNumber: rfq, investedAmount: rfq ? (amountByRfq.get(rfq) ?? 0) : 0 };
      })
      .filter((o) => o.isin && o.rfqNumber && o.investedAmount > 0);
    if (!ordersWithAmount.length) return empty;

    const bonds = await db.dataBase.bonds.findMany({
      where: { isin: { in: this.uniqueIsins(ordersWithAmount) } },
      select: {
        isin: true, bondName: true, description: true, faceValue: true,
        creditRating: true, couponRate: true, interestPaymentFrequency: true,
        interestPaymentMode: true, maturityDate: true, sectorName: true,
        taxStatus: true, yield: true, lastTradeYield: true, lastTradePrice: true,
        modeOfIssuance: true, couponType: true, dateOfAllotment: true,
        redemptionDate: true, ratingAgencyName: true,
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
      };
    });

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getPortfolioFilterOptions(customerId: number) {
    const empty = { bondTypes: [] as string[], bondRatings: [] as string[], couponRanges: [] as string[], paymentFrequencies: [] as string[] };

    const ordersWithAmount = await this.getSettledOrdersWithAmount(customerId);
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

    return {
      bondTypes: Array.from(bondTypes),
      bondRatings: Array.from(bondRatings),
      couponRanges: Array.from(couponRanges),
      paymentFrequencies: Array.from(paymentFrequencies),
    };
  }

  async getTotalNumberOfBonds(customerId: number) {
    const ordersWithAmount = await this.getSettledOrdersWithAmount(customerId);
    if (!ordersWithAmount.length) return 0;

    const validRfqs = new Set(ordersWithAmount.map((o) => o.rfqNumber));

    const orders = await db.dataBase.order.findMany({
      where: { customerProfileId: customerId, paymentStatus: "COMPLETED", status: "SETTLED" },
      select: { quantity: true, metadata: true },
    });

    return orders.reduce((total, o) => {
      const rfq = (o.metadata as any)?.rfqNumber as string | undefined;
      return rfq && validRfqs.has(rfq) ? total + Number(o.quantity ?? 0) : total;
    }, 0);
  }

  async getCashflowTimeline(customerId: number,  startDate?: Date,
  endDate?: Date,  bondTypes?: string[]) {
    const orders = await db.dataBase.order.findMany({
      where: { customerProfileId: customerId, paymentStatus: "COMPLETED", status: "SETTLED" },
      select: { isin: true, quantity: true, metadata: true },
    });
    if (!orders.length) return { years: [] };

    const rfqNumbers = orders
      .map((o) => (o.metadata as any)?.rfqNumber as string | undefined)
      .filter((v): v is string => !!v);
    if (!rfqNumbers.length) return { years: [] };

    const settled = await db.dataBase.settleOrderModel.findMany({
      where: { orderNumber: { in: rfqNumbers } },
      select: { orderNumber: true, modSettleDate: true, modConsideration: true, stampDutyAmount: true },
    });
    if (!settled.length) return { years: [] };

    const settleDataByRfq = new Map<string, { settledDate: Date | null; invested: number }>();
    for (const s of settled) {
      const amount = Number(s.modConsideration ?? 0) + Number(s.stampDutyAmount ?? 0);
      const date = s.modSettleDate ? parseSettleDate(s.modSettleDate) : null;
      settleDataByRfq.set(s.orderNumber, { settledDate: date, invested: amount });
    }

    const validOrders = orders
      .map((o) => {
        const rfq = (o.metadata as any)?.rfqNumber as string | undefined;
        const data = rfq ? settleDataByRfq.get(rfq) : null;
        return { isin: o.isin, quantity: o.quantity, settledDate: data?.settledDate ?? null, invested: data?.invested ?? 0 };
      })
      .filter((o) => o.invested > 0 && o.settledDate);
    if (!validOrders.length) return { years: [] };

    const bonds = await db.dataBase.bonds.findMany({
      where: { isin: { in: Array.from(new Set(validOrders.map((o) => o.isin))) } },
      select: { isin: true, bondName: true, faceValue: true, couponRate: true, interestPaymentMode: true, dateOfAllotment: true, maturityDate: true,sectorName: true, },
    });

    const bondByIsin = new Map(bonds.map((b) => [b.isin, b]));
  
const filteredByType = bondTypes?.length
  ? validOrders.filter((o) => {
      const bond = bondByIsin.get(o.isin);
      return bondTypes.includes((bond?.sectorName ?? "").trim());
    })
  : validOrders;

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
      if (!bond?.maturityDate || !bond?.dateOfAllotment || !bond?.interestPaymentMode) continue;

      const allotment = new Date(bond.dateOfAllotment);
      const maturity = new Date(bond.maturityDate);
      const settleDate = order.settledDate!;

      const { valid, isEOM } = validateAlignment(allotment, maturity, bond.interestPaymentMode);
      if (!valid) {
        console.log(`Skipping bond ${bond.isin} — misaligned dates for mode ${bond.interestPaymentMode}`);
        continue;
      }

      const step = monthStepForMode(bond.interestPaymentMode);
      const adjustedStart = getAdjustedStartDate(settleDate, allotment, maturity, step, isEOM);
      const annualInterest = bond.faceValue * order.quantity * (bond.couponRate / 100);
      const maturityDateStr = formatDateStr(maturity);

      let cursor = new Date(allotment);
      let lastPayoutDate = new Date(adjustedStart);

      while (cursor <= maturity) {
        const next = addMonths(cursor, step, isEOM);
        cursor = next > maturity ? new Date(maturity) : next;

        if (cursor > adjustedStart) {
          const amount = parseFloat(calcInterest(annualInterest, lastPayoutDate, cursor).toFixed(2));
          if (amount > 0) {
            events.push({ type: "INTEREST", bondName: bond.bondName, maturityDateStr, amount, date: new Date(cursor) });
          }
          lastPayoutDate = new Date(cursor);
        }

        if (cursor.getTime() === maturity.getTime()) break;
      }

      if (settleDate <= maturity) {
        events.push({
          type: "MATURITY",
          bondName: bond.bondName,
          maturityDateStr,
          amount: bond.faceValue * order.quantity,
          date: new Date(maturity),
        });
      }
    }
const filteredEvents = events.filter((ev) => {
  if (startDate && ev.date < startDate) return false;
  if (endDate   && ev.date > endDate)   return false;
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
    const [invested, maturity, yieldResult, totalBonds] = await Promise.all([
      this.getTotalInvestedAmount(customerId),
      this.getAverageMaturity(customerId),
      this.getAveragePortfolioYield(customerId),
      this.getTotalNumberOfBonds(customerId),
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
    };
  }


  async getCashflowToMaturity(customerId: number) {
    const empty = { "1yr": [], "2yrs": [], "5yrs": [] };
    const orders = await db.dataBase.order.findMany({
      where: { customerProfileId: customerId, paymentStatus: "COMPLETED", status: "SETTLED" },
      select: { isin: true, quantity: true, metadata: true },
    });
    if (!orders.length) return empty;

    const rfqNumbers = orders
      .map((o) => (o.metadata as any)?.rfqNumber as string | undefined)
      .filter((v): v is string => !!v);
    if (!rfqNumbers.length) return empty;

    const settled = await db.dataBase.settleOrderModel.findMany({
      where: { orderNumber: { in: rfqNumbers } },
      select: { orderNumber: true, modSettleDate: true, modConsideration: true, stampDutyAmount: true },
    });
    if (!settled.length) return empty;

    const settleDataByRfq = new Map<string, { settledDate: Date | null; invested: number }>();
    for (const s of settled) {
      const amount = Number(s.modConsideration ?? 0) + Number(s.stampDutyAmount ?? 0);
      const date = s.modSettleDate ? parseSettleDate(s.modSettleDate) : null;
      settleDataByRfq.set(s.orderNumber, { settledDate: date, invested: amount });
    }

    const validOrders = orders
      .map((o) => {
        const rfq = (o.metadata as any)?.rfqNumber as string | undefined;
        const data = rfq ? settleDataByRfq.get(rfq) : null;
        return {
          isin: o.isin,
          quantity: o.quantity,
          settledDate: data?.settledDate ?? null,
          invested: data?.invested ?? 0,
        };
      })
      .filter((o) => o.invested > 0 && o.settledDate);
    if (!validOrders.length) return empty;

    const bonds = await db.dataBase.bonds.findMany({
      where: { isin: { in: Array.from(new Set(validOrders.map((o) => o.isin))) } },
      select: {
        isin: true,
        bondName: true,
        faceValue: true,
        couponRate: true,
        interestPaymentMode: true,
        dateOfAllotment: true,
        maturityDate: true,
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
      if (!bond?.maturityDate || !bond?.dateOfAllotment || !bond?.interestPaymentMode) continue;

      const allotment = new Date(bond.dateOfAllotment);
      const maturity = new Date(bond.maturityDate);
      const settleDate = order.settledDate!;

      if (maturity <= today) continue;

      const { valid, isEOM } = validateAlignment(allotment, maturity, bond.interestPaymentMode);
      if (!valid) {
        console.log(`Skipping bond ${bond.isin} — misaligned dates for mode ${bond.interestPaymentMode}`);
        continue;
      }

      const step = monthStepForMode(bond.interestPaymentMode);
      const adjustedStart = getAdjustedStartDate(settleDate, allotment, maturity, step, isEOM);
      const annualInterest = bond.faceValue * order.quantity * (bond.couponRate / 100);

      let cursor = new Date(allotment);
      let lastPayoutDate = new Date(adjustedStart);

      while (cursor <= maturity) {
        const next = addMonths(cursor, step, isEOM);
        cursor = next > maturity ? new Date(maturity) : next;

        if (cursor > adjustedStart) {
          const amount = parseFloat(calcInterest(annualInterest, lastPayoutDate, cursor).toFixed(2));
          if (amount > 0) {
            events.push({
              type: "INTEREST",
              month: toMonthKey(cursor),
              amount,
              date: new Date(cursor),
            });
          }
          lastPayoutDate = new Date(cursor);
        }

        if (cursor.getTime() === maturity.getTime()) break;
      }

      if (settleDate <= maturity) {
        events.push({
          type: "MATURITY",
          month: toMonthKey(maturity),
          amount: bond.faceValue * order.quantity,
          date: new Date(maturity),
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
    const todayKey = toMonthKey(today);
    const currentMonthKey = toMonthKey(today);

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