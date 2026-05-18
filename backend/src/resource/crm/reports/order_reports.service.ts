import { db } from "@core/database/database";
import { Prisma } from "@databases/generated/prisma/postgres";
import type { Prisma as PrismaTypes } from "@databases/generated/prisma/postgres";
import {
  OrderStatus,
  PaymentStatus,
} from "@databases/generated/prisma/postgres";
import moment from "moment-timezone";

const TZ = "Asia/Kolkata";
const TIME_BUCKET_ROW_CAP = 25_000;

export type OrderReportFilters = {
  from: string;
  to: string;
  paymentStatus?: PaymentStatus;
  status?: OrderStatus;
  isin?: string;
  customerId?: number;
  email?: string;
  userType?: string;
  kycStatus?: string;
};

function parseYyyyMmDd(s: string): moment.Moment | null {
  const m = moment.tz(String(s).trim(), "YYYY-MM-DD", true, TZ);
  return m.isValid() ? m : null;
}

/** Inclusive IST calendar range → UTC instants for DB `createdAt` comparisons. */
export function istDateRangeToUtcBounds(from: string, to: string): {
  startUtc: Date;
  endUtc: Date;
} {
  const fromM = parseYyyyMmDd(from);
  const toM = parseYyyyMmDd(to);
  if (!fromM || !toM) {
    throw new Error("Invalid from/to; use YYYY-MM-DD");
  }
  if (fromM.isAfter(toM)) {
    throw new Error("from must be on or before to");
  }
  const startUtc = fromM.clone().startOf("day").utc().toDate();
  const endUtc = toM.clone().endOf("day").utc().toDate();
  return { startUtc, endUtc };
}

export function buildOrderWhere(
  filters: OrderReportFilters,
): PrismaTypes.OrderWhereInput {
  const { startUtc, endUtc } = istDateRangeToUtcBounds(filters.from, filters.to);

  const where: PrismaTypes.OrderWhereInput = {
    createdAt: { gte: startUtc, lte: endUtc },
  };

  if (filters.paymentStatus) {
    where.paymentStatus = filters.paymentStatus;
  }
  if (filters.status) {
    where.status = filters.status;
  }
  if (filters.isin?.trim()) {
    const q = filters.isin.trim().toUpperCase();
    where.isin = { contains: q, mode: "insensitive" };
  }
  if (filters.customerId) {
    where.customerProfileId = filters.customerId;
  }

  const profileAnd: PrismaTypes.CustomerProfileDataModelWhereInput[] = [];
  if (filters.email?.trim()) {
    profileAnd.push({
      emailAddress: { contains: filters.email.trim(), mode: "insensitive" },
    });
  }
  if (filters.userType?.trim()) {
    profileAnd.push({ userType: filters.userType.trim() as never });
  }
  if (filters.kycStatus?.trim()) {
    profileAnd.push({ kycStatus: filters.kycStatus.trim() as never });
  }
  if (profileAnd.length > 0) {
    where.customerProfile = { AND: profileAnd };
  }

  return where;
}

function bucketKey(createdAt: Date, groupBy: "day" | "week" | "month"): string {
  const m = moment(createdAt).tz(TZ);
  if (groupBy === "month") return m.startOf("month").format("YYYY-MM-DD");
  if (groupBy === "week") return m.clone().startOf("isoWeek").format("YYYY-MM-DD");
  return m.startOf("day").format("YYYY-MM-DD");
}

export class OrderReportsService {
  async getSummary(
    filters: OrderReportFilters,
    groupBy: "day" | "week" | "month",
  ) {
    const where = buildOrderWhere(filters);

    const [agg, distinctCustomers, byPayment, byOrderStatus, thinOrders] =
      await Promise.all([
        db.dataBase.order.aggregate({
          where,
          _count: { _all: true },
          _sum: {
            totalAmount: true,
            subTotal: true,
            stampDuty: true,
            quantity: true,
          },
        }),
        db.dataBase.order.groupBy({
          by: ["customerProfileId"],
          where,
          _count: { _all: true },
        }),
        db.dataBase.order.groupBy({
          by: ["paymentStatus"],
          where,
          _count: { _all: true },
        }),
        db.dataBase.order.groupBy({
          by: ["status"],
          where,
          _count: { _all: true },
        }),
        db.dataBase.order.findMany({
          where,
          select: { createdAt: true, totalAmount: true },
          take: TIME_BUCKET_ROW_CAP + 1,
          orderBy: { createdAt: "asc" },
        }),
      ]);

    const truncated = thinOrders.length > TIME_BUCKET_ROW_CAP;
    const slice = truncated
      ? thinOrders.slice(0, TIME_BUCKET_ROW_CAP)
      : thinOrders;

    const bucketMap = new Map<string, { orderCount: number; gmv: number }>();
    for (const row of slice) {
      const key = bucketKey(row.createdAt, groupBy);
      const cur = bucketMap.get(key) ?? { orderCount: 0, gmv: 0 };
      bucketMap.set(key, {
        orderCount: cur.orderCount + 1,
        gmv: cur.gmv + Number(row.totalAmount),
      });
    }

    const timeBuckets = [...bucketMap.entries()]
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([bucket, v]) => ({
        bucket: `${bucket}T00:00:00.000Z`,
        orderCount: v.orderCount,
        gmv: String(v.gmv),
      }));

    return {
      kpis: {
        orderCount: agg._count._all,
        distinctCustomers: distinctCustomers.length,
        sumTotalAmount: agg._sum.totalAmount?.toString() ?? "0",
        sumSubTotal: agg._sum.subTotal?.toString() ?? "0",
        sumStampDuty: agg._sum.stampDuty?.toString() ?? "0",
        sumQuantity: agg._sum.quantity ?? 0,
      },
      byPaymentStatus: byPayment.map((r) => ({
        paymentStatus: r.paymentStatus,
        count: r._count._all,
      })),
      byOrderStatus: byOrderStatus.map((r) => ({
        status: r.status,
        count: r._count._all,
      })),
      timeBuckets,
      timeBucketsTruncated: truncated,
    };
  }

  async getRegister(
    filters: OrderReportFilters,
    page: number,
    limit: number,
  ) {
    const where = buildOrderWhere(filters);
    const skip = (page - 1) * limit;

    const [rows, total] = await Promise.all([
      db.dataBase.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          orderNumber: true,
          createdAt: true,
          updatedAt: true,
          paymentStatus: true,
          status: true,
          paymentProvider: true,
          paymentOrderId: true,
          paymentId: true,
          subTotal: true,
          stampDuty: true,
          totalAmount: true,
          isin: true,
          bondName: true,
          quantity: true,
          unitPrice: true,
          bondDetails: true,
          customerProfileId: true,
          customerProfile: {
            select: {
              id: true,
              firstName: true,
              middleName: true,
              lastName: true,
              emailAddress: true,
              userType: true,
              kycStatus: true,
            },
          },
        },
      }),
      db.dataBase.order.count({ where }),
    ]);

    return {
      data: rows.map((o) => ({
        ...o,
        subTotal: o.subTotal.toString(),
        stampDuty: o.stampDuty.toString(),
        totalAmount: o.totalAmount.toString(),
        unitPrice: o.unitPrice.toString(),
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async getByIsin(filters: OrderReportFilters) {
    const where = buildOrderWhere(filters);
    const rows = await db.dataBase.order.groupBy({
      by: ["isin", "bondName"],
      where,
      _count: { _all: true },
      _sum: {
        quantity: true,
        totalAmount: true,
        subTotal: true,
      },
      orderBy: { _sum: { totalAmount: "desc" } },
    });

    const withDistinct = await Promise.all(
      rows.map(async (r) => {
        const d = await db.dataBase.order.groupBy({
          by: ["customerProfileId"],
          where: { ...where, isin: r.isin },
          _count: true,
        });
        return {
          isin: r.isin,
          bondName: r.bondName,
          orderCount: r._count._all,
          unitsSold: r._sum.quantity ?? 0,
          revenue: r._sum.totalAmount?.toString() ?? "0",
          subTotal: r._sum.subTotal?.toString() ?? "0",
          distinctCustomers: d.length,
        };
      }),
    );

    return { data: withDistinct };
  }

  private spreadBps(buy: number, sell: number): number | null {
    if (!Number.isFinite(buy) || !Number.isFinite(sell) || buy <= 0) return null;
    return Math.round(((sell - buy) / buy) * 10_000);
  }

  private spreadRevenuePerOrder(
    buy: number,
    sell: number,
    faceValue: number,
    quantity: number,
  ): number {
    if (!Number.isFinite(buy) || !Number.isFinite(sell) || quantity <= 0) return 0;
    return ((sell - buy) / 100) * faceValue * quantity;
  }

  private fyBoundsIst(): { from: string; to: string; label: string } {
    const now = moment().tz(TZ);
    const fyStartYear = now.month() >= 3 ? now.year() : now.year() - 1;
    const from = moment.tz(`${fyStartYear}-04-01`, "YYYY-MM-DD", TZ);
    return {
      from: from.format("YYYY-MM-DD"),
      to: now.format("YYYY-MM-DD"),
      label: `Apr ${fyStartYear} – today`,
    };
  }

  private mtdBoundsIst(): { from: string; to: string; label: string } {
    const now = moment().tz(TZ);
    return {
      from: now.clone().startOf("month").format("YYYY-MM-DD"),
      to: now.format("YYYY-MM-DD"),
      label: now.format("MMM YYYY"),
    };
  }

  private async aggregateSpreadRevenue(
    filters: OrderReportFilters,
  ): Promise<{
    rows: {
      isin: string;
      bondName: string;
      buyPrice: number | null;
      sellPrice: number | null;
      spreadBps: number | null;
      revenue: number;
      orderCount: number;
    }[];
    totalRevenue: number;
    avgSpreadBps: number | null;
  }> {
    const where = buildOrderWhere(filters);
    where.paymentStatus = PaymentStatus.COMPLETED;

    const orders = await db.dataBase.order.findMany({
      where,
      select: {
        isin: true,
        bondName: true,
        quantity: true,
        unitPrice: true,
        faceValue: true,
      },
    });

    if (orders.length === 0) {
      return { rows: [], totalRevenue: 0, avgSpreadBps: null };
    }

    const isins = [...new Set(orders.map((o) => o.isin))];
    const bonds = await db.dataBase.bonds.findMany({
      where: { isin: { in: isins } },
      select: { isin: true, buyPrice: true, sellPrice: true },
    });
    const bondByIsin = new Map(bonds.map((b) => [b.isin, b]));

    type Agg = {
      isin: string;
      bondName: string;
      buyPrice: number | null;
      sellPrice: number | null;
      spreadBps: number | null;
      revenue: number;
      orderCount: number;
    };

    const byIsin = new Map<string, Agg>();

    for (const o of orders) {
      const bond = bondByIsin.get(o.isin);
      const unitSell = Number(o.unitPrice);
      const buy =
        bond?.buyPrice != null && Number.isFinite(bond.buyPrice)
          ? bond.buyPrice
          : unitSell * 0.985;
      const sell =
        bond?.sellPrice != null && Number.isFinite(bond.sellPrice)
          ? bond.sellPrice
          : unitSell;
      const rev = this.spreadRevenuePerOrder(
        buy,
        unitSell,
        Number(o.faceValue),
        o.quantity,
      );

      const existing = byIsin.get(o.isin);
      if (existing) {
        existing.orderCount += 1;
        existing.revenue += rev;
      } else {
        byIsin.set(o.isin, {
          isin: o.isin,
          bondName: o.bondName,
          buyPrice: bond?.buyPrice ?? buy,
          sellPrice: bond?.sellPrice ?? sell,
          spreadBps: this.spreadBps(buy, sell),
          revenue: rev,
          orderCount: 1,
        });
      }
    }

    const rows = [...byIsin.values()].sort((a, b) => b.revenue - a.revenue);
    const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0);

    let spreadWeighted = 0;
    let spreadWeight = 0;
    for (const r of rows) {
      if (r.spreadBps == null || r.revenue <= 0) continue;
      spreadWeighted += r.spreadBps * r.revenue;
      spreadWeight += r.revenue;
    }
    const avgSpreadBps =
      spreadWeight > 0 ? Math.round(spreadWeighted / spreadWeight) : null;

    return { rows, totalRevenue, avgSpreadBps };
  }

  async getRevenue(filters: OrderReportFilters) {
    const period = await this.aggregateSpreadRevenue(filters);
    const fy = this.fyBoundsIst();
    const mtd = this.mtdBoundsIst();

    const fyAgg = await this.aggregateSpreadRevenue({
      ...filters,
      from: fy.from,
      to: fy.to,
    });
    const mtdAgg = await this.aggregateSpreadRevenue({
      ...filters,
      from: mtd.from,
      to: mtd.to,
    });

    return {
      kpis: {
        totalRevenue: period.totalRevenue.toFixed(2),
        avgSpreadBps: period.avgSpreadBps,
        fyRevenue: fyAgg.totalRevenue.toFixed(2),
        mtdRevenue: mtdAgg.totalRevenue.toFixed(2),
        fyLabel: fy.label,
        mtdLabel: mtd.label,
      },
      rows: period.rows.map((r) => ({
        isin: r.isin,
        bondName: r.bondName,
        buyPrice: r.buyPrice,
        sellPrice: r.sellPrice,
        spreadBps: r.spreadBps,
        revenue: r.revenue.toFixed(2),
        orderCount: r.orderCount,
      })),
    };
  }

  async getFunnel(filters: OrderReportFilters) {
    const where = buildOrderWhere(filters);
    const matrix = await db.dataBase.order.groupBy({
      by: ["paymentStatus", "status"],
      where,
      _count: { _all: true },
    });
    return {
      cells: matrix.map((m) => ({
        paymentStatus: m.paymentStatus,
        status: m.status,
        count: m._count._all,
      })),
    };
  }

  async getByCustomer(filters: OrderReportFilters, page: number, limit: number) {
    const where = buildOrderWhere(filters);
    const grouped = await db.dataBase.order.groupBy({
      by: ["customerProfileId"],
      where,
      _count: { _all: true },
      _sum: { totalAmount: true, quantity: true },
      _min: { createdAt: true },
      _max: { createdAt: true },
      orderBy: { _sum: { totalAmount: "desc" } },
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalGroups = await db.dataBase.order.groupBy({
      by: ["customerProfileId"],
      where,
      _count: { _all: true },
    });

    const ids = grouped.map((g) => g.customerProfileId);
    const { startUtc, endUtc } = istDateRangeToUtcBounds(filters.from, filters.to);

    const [profiles, favRows] = await Promise.all([
      ids.length
        ? db.dataBase.customerProfileDataModel.findMany({
            where: { id: { in: ids } },
            select: {
              id: true,
              firstName: true,
              middleName: true,
              lastName: true,
              emailAddress: true,
              userType: true,
              kycStatus: true,
            },
          })
        : Promise.resolve([]),
      ids.length
        ? db.dataBase.$queryRaw<
            {
              customerProfileId: number;
              isin: string;
              cnt: bigint;
            }[]
          >(Prisma.sql`
          WITH per_pair AS (
            SELECT "customerProfileId", isin, COUNT(*)::bigint AS cnt
            FROM orders
            WHERE "createdAt" >= ${startUtc}
              AND "createdAt" <= ${endUtc}
              ${filters.paymentStatus ? Prisma.sql`AND "paymentStatus" = ${filters.paymentStatus}::"PaymentStatus"` : Prisma.empty}
              ${filters.status ? Prisma.sql`AND "status" = ${filters.status}::"OrderStatus"` : Prisma.empty}
              ${filters.isin?.trim() ? Prisma.sql`AND UPPER("isin") LIKE ${"%" + filters.isin.trim().toUpperCase() + "%"}` : Prisma.empty}
              ${filters.customerId ? Prisma.sql`AND "customerProfileId" = ${filters.customerId}` : Prisma.empty}
              ${
                filters.email?.trim()
                  ? Prisma.sql`AND "customerProfileId" IN (
                SELECT id FROM customers_profile_data
                WHERE LOWER("emailAddress") LIKE ${"%" + filters.email.trim().toLowerCase() + "%"}
              )`
                  : Prisma.empty
              }
              ${
                filters.userType?.trim()
                  ? Prisma.sql`AND "customerProfileId" IN (
                SELECT id FROM customers_profile_data WHERE "userType"::text = ${filters.userType.trim()}
              )`
                  : Prisma.empty
              }
              ${
                filters.kycStatus?.trim()
                  ? Prisma.sql`AND "customerProfileId" IN (
                SELECT id FROM customers_profile_data WHERE "kycStatus"::text = ${filters.kycStatus.trim()}
              )`
                  : Prisma.empty
              }
              AND "customerProfileId" IN (${Prisma.join(ids.map((id) => Prisma.sql`${id}`))})
            GROUP BY "customerProfileId", isin
          ),
          ranked AS (
            SELECT *,
              ROW_NUMBER() OVER (PARTITION BY "customerProfileId" ORDER BY cnt DESC, isin ASC) AS rn
            FROM per_pair
          )
          SELECT "customerProfileId", isin, cnt FROM ranked WHERE rn = 1
        `)
        : Promise.resolve([]),
    ]);

    const profileById = new Map(profiles.map((p) => [p.id, p]));
    const favById = new Map(
      favRows.map((f) => [f.customerProfileId, { isin: f.isin, count: Number(f.cnt) }]),
    );

    const data = grouped.map((g) => {
      const p = profileById.get(g.customerProfileId);
      const fav = favById.get(g.customerProfileId);
      return {
        customerProfileId: g.customerProfileId,
        customer: p
          ? {
              id: p.id,
              firstName: p.firstName,
              middleName: p.middleName,
              lastName: p.lastName,
              emailAddress: p.emailAddress,
              userType: p.userType,
              kycStatus: p.kycStatus,
            }
          : null,
        orderCount: g._count._all,
        lifetimeValue: g._sum.totalAmount?.toString() ?? "0",
        units: g._sum.quantity ?? 0,
        firstOrderAt: g._min.createdAt?.toISOString() ?? null,
        lastOrderAt: g._max.createdAt?.toISOString() ?? null,
        favouriteIsin: fav?.isin ?? null,
        favouriteIsinOrderCount: fav?.count ?? 0,
      };
    });

    return {
      data,
      meta: {
        total: totalGroups.length,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(totalGroups.length / limit)),
      },
    };
  }

  async getHoldings(filters: OrderReportFilters) {
    const { startUtc, endUtc } = istDateRangeToUtcBounds(filters.from, filters.to);
    const whereBond: PrismaTypes.CustomerBondsWhereInput = {
      purchaseDate: { gte: startUtc, lte: endUtc },
    };
    if (filters.customerId) {
      whereBond.customerProfileId = filters.customerId;
    }
    if (filters.isin?.trim()) {
      whereBond.isin = {
        contains: filters.isin.trim().toUpperCase(),
        mode: "insensitive",
      };
    }

    const rows = await db.dataBase.customerBonds.groupBy({
      by: ["isin", "bondName"],
      where: whereBond,
      _count: { _all: true },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
    });

    return {
      data: rows.map((r) => ({
        isin: r.isin,
        bondName: r.bondName,
        positionCount: r._count._all,
        units: r._sum.quantity ?? 0,
      })),
    };
  }

  async getLogFailures(filters: { from: string; to: string }, page: number, limit: number) {
    const { startUtc, endUtc } = istDateRangeToUtcBounds(filters.from, filters.to);
    const skip = (page - 1) * limit;

    const [rows, total] = await Promise.all([
      db.dataBase.orderLogs.findMany({
        where: {
          status: "FAILED",
          createdAt: { gte: startUtc, lte: endUtc },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          orderId: true,
          step: true,
          status: true,
          createdAt: true,
        },
      }),
      db.dataBase.orderLogs.count({
        where: {
          status: "FAILED",
          createdAt: { gte: startUtc, lte: endUtc },
        },
      }),
    ]);

    return {
      data: rows,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async getSettlementAutomation(
    filters: { from: string; to: string; paymentId?: string; batchId?: string },
  ) {
    const { startUtc, endUtc } = istDateRangeToUtcBounds(filters.from, filters.to);
    const where: PrismaTypes.OrderSettlementAutomationLogWhereInput = {
      createdAt: { gte: startUtc, lte: endUtc },
    };
    if (filters.paymentId?.trim()) {
      where.paymentId = filters.paymentId.trim();
    }
    if (filters.batchId?.trim()) {
      where.batchId = filters.batchId.trim();
    }

    const byStep = await db.dataBase.orderSettlementAutomationLog.groupBy({
      by: ["step", "status"],
      where,
      _count: { _all: true },
    });

    const recent = await db.dataBase.orderSettlementAutomationLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        orderId: true,
        paymentId: true,
        batchId: true,
        step: true,
        status: true,
        message: true,
        startedAt: true,
        completedAt: true,
        createdAt: true,
      },
    });

    return {
      byStep: byStep.map((s) => ({
        step: s.step,
        status: s.status,
        count: s._count._all,
      })),
      recent,
    };
  }

  async getLifecycle(filters: OrderReportFilters, page: number, limit: number) {
    const where = buildOrderWhere(filters);
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      db.dataBase.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          orderNumber: true,
          createdAt: true,
          updatedAt: true,
          paymentStatus: true,
          status: true,
        },
      }),
      db.dataBase.order.count({ where }),
    ]);

    const orderIds = orders.map((o) => o.id);
    const logs =
      orderIds.length > 0
        ? await db.dataBase.orderLogs.findMany({
            where: {
              orderId: { in: orderIds },
              status: "SUCCESS",
            },
            select: { orderId: true, createdAt: true },
            orderBy: { createdAt: "asc" },
          })
        : [];

    const firstLogByOrder = new Map<number, Date>();
    for (const l of logs) {
      if (!firstLogByOrder.has(l.orderId)) {
        firstLogByOrder.set(l.orderId, l.createdAt);
      }
    }

    const data = orders.map((o) => {
      const firstAt = firstLogByOrder.get(o.id);
      return {
        orderId: o.id,
        orderNumber: o.orderNumber,
        createdAt: o.createdAt.toISOString(),
        updatedAt: o.updatedAt.toISOString(),
        paymentStatus: o.paymentStatus,
        status: o.status,
        firstSuccessLogAt: firstAt?.toISOString() ?? null,
        approxMsToFirstLog:
          firstAt != null ? firstAt.getTime() - o.createdAt.getTime() : null,
      };
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async getRegisterCsvRows(filters: OrderReportFilters, maxRows: number) {
    const where = buildOrderWhere(filters);
    const rows = await db.dataBase.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: maxRows,
      select: {
        orderNumber: true,
        createdAt: true,
        paymentStatus: true,
        status: true,
        isin: true,
        bondName: true,
        quantity: true,
        totalAmount: true,
        customerProfileId: true,
        customerProfile: {
          select: { emailAddress: true },
        },
      },
    });
    return rows.map((r) => ({
      orderNumber: r.orderNumber,
      createdAt: r.createdAt.toISOString(),
      paymentStatus: r.paymentStatus,
      status: r.status,
      customerId: r.customerProfileId,
      customerEmail: r.customerProfile?.emailAddress ?? "",
      isin: r.isin,
      bondName: r.bondName,
      quantity: r.quantity,
      totalAmount: r.totalAmount.toString(),
    }));
  }
}
