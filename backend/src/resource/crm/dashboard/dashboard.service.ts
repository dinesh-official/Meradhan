import { db } from "@core/database/database";
import { appSchema } from "@root/schema";
import dayjs from "dayjs";

type PercentSummary = {
  total: number;
  currentWindow: number;
  previousWindow: number;
  trendPct: number;
};

type RateSummary = PercentSummary & {
  ratePct: number;
  totalUsers: number;
};

export type DashboardOverviewCounts = {
  totalCustomers: number;
  kycCompleted: number;
  kycPending: number;
  totalRfq: number;
  totalLeads: number;
  bondsAllowForPurchase: number;
};

export type DashboardSummary = {
  overview: DashboardOverviewCounts;
  activeLeads: PercentSummary;
  completedProjects: PercentSummary;
  userDropRate: RateSummary;
  userGainRate: RateSummary;
};

export class DashboardService {
  private percentChange(current: number, previous: number): number {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return ((current - previous) / previous) * 100;
  }

  private getRange(rangeDays: number) {
    const now = dayjs();
    const currentWindowStart = now.subtract(rangeDays, "day").toDate();
    const previousWindowStart = now.subtract(rangeDays * 2, "day").toDate();
    return { currentWindowStart, previousWindowStart, now: now.toDate() };
  }

  async getSummary(rangeDays = 30): Promise<DashboardSummary> {
    const { currentWindowStart, previousWindowStart } =
      this.getRange(rangeDays);

    // Overview counts for dashboard cards
    const [
      totalCustomers,
      kycCompleted,
      kycPending,
      totalRfq,
      totalLeads,
      bondsAllowForPurchase,
    ] = await Promise.all([
      db.dataBase.customerProfileDataModel.count(),
      db.dataBase.customerProfileDataModel.count({
        where: { kycStatus: "VERIFIED" },
      }),
      db.dataBase.customerProfileDataModel.count({
        where: { kycStatus: "PENDING" },
      }),
      db.dataBase.rFQMasterISIN.count(),
      db.dataBase.leadsModel.count(),
      db.dataBase.bonds.count({
        where: { allowForPurchase: true },
      }),
    ]);

    const overview: DashboardOverviewCounts = {
      totalCustomers,
      kycCompleted,
      kycPending,
      totalRfq,
      totalLeads,
      bondsAllowForPurchase,
    };

    // Active leads (NEW, CONTACTED, QUALIFIED)
    type LeadStatus = (typeof appSchema.crm.leads.status)[number];
    const activeStatuses: LeadStatus[] = ["NEW", "CONTACTED", "QUALIFIED"];
    const [activeTotal, activeCurrent, activePrevious] = await Promise.all([
      db.dataBase.leadsModel.count({
        where: { status: { in: activeStatuses } },
      }),
      db.dataBase.leadsModel.count({
        where: {
          status: { in: activeStatuses },
          createdAt: { gte: currentWindowStart },
        },
      }),
      db.dataBase.leadsModel.count({
        where: {
          status: { in: activeStatuses },
          createdAt: { gte: previousWindowStart, lt: currentWindowStart },
        },
      }),
    ]);

    // Completed projects → settled orders
    const [projectsTotal, projectsCurrent, projectsPrevious] =
      await Promise.all([
        db.dataBase.order.count({ where: { status: "SETTLED" } }),
        db.dataBase.order.count({
          where: { status: "SETTLED", updatedAt: { gte: currentWindowStart } },
        }),
        db.dataBase.order.count({
          where: {
            status: "SETTLED",
            updatedAt: { gte: previousWindowStart, lt: currentWindowStart },
          },
        }),
      ]);

    // User metrics
    const [totalUsers, gainCurrent, gainPrevious, dropCurrent, dropPrevious] =
      await Promise.all([
        db.dataBase.customerProfileDataModel.count(),
        db.dataBase.customerProfileDataModel.count({
          where: { createdAt: { gte: currentWindowStart } },
        }),
        db.dataBase.customerProfileDataModel.count({
          where: {
            createdAt: { gte: previousWindowStart, lt: currentWindowStart },
          },
        }),
        db.dataBase.customersAuthDataModel.count({
          where: {
            accountStatus: "SUSPENDED",
            updatedAt: { gte: currentWindowStart },
          },
        }),
        db.dataBase.customersAuthDataModel.count({
          where: {
            accountStatus: "SUSPENDED",
            updatedAt: { gte: previousWindowStart, lt: currentWindowStart },
          },
        }),
      ]);

    const gainRatePct = totalUsers === 0 ? 0 : (gainCurrent / totalUsers) * 100;
    const dropRatePct = totalUsers === 0 ? 0 : (dropCurrent / totalUsers) * 100;

    return {
      overview,
      activeLeads: {
        total: activeTotal,
        currentWindow: activeCurrent,
        previousWindow: activePrevious,
        trendPct: this.percentChange(activeCurrent, activePrevious),
      },
      completedProjects: {
        total: projectsTotal,
        currentWindow: projectsCurrent,
        previousWindow: projectsPrevious,
        trendPct: this.percentChange(projectsCurrent, projectsPrevious),
      },
      userGainRate: {
        total: gainCurrent,
        currentWindow: gainCurrent,
        previousWindow: gainPrevious,
        trendPct: this.percentChange(gainCurrent, gainPrevious),
        ratePct: gainRatePct,
        totalUsers,
      },
      userDropRate: {
        total: dropCurrent,
        currentWindow: dropCurrent,
        previousWindow: dropPrevious,
        trendPct: this.percentChange(dropCurrent, dropPrevious),
        ratePct: dropRatePct,
        totalUsers,
      },
    };
  }

  async getSalesPerformance(rangeDays = 30) {
    const { currentWindowStart, previousWindowStart, now } =
      this.getRange(rangeDays);

    const orders = await db.dataBase.order.findMany({
      where: {
        createdAt: { gte: previousWindowStart, lte: now },
      },
      select: {
        createdAt: true,
        totalAmount: true,
      },
    });

    const toKey = (date: Date) => dayjs(date).format("YYYY-MM-DD"); // day resolution

    const currentMap = new Map<string, number>();
    const previousMap = new Map<string, number>();

    for (const order of orders) {
      const key = toKey(order.createdAt);
      const amount = Number(order.totalAmount || 0);
      if (order.createdAt >= currentWindowStart) {
        currentMap.set(key, (currentMap.get(key) || 0) + amount);
      } else {
        previousMap.set(key, (previousMap.get(key) || 0) + amount);
      }
    }

    const daysRange = Array.from({ length: rangeDays }, (_, idx) =>
      dayjs(now)
        .subtract(rangeDays - 1 - idx, "day")
        .format("YYYY-MM-DD")
    );

    const data = daysRange.map((dateKey) => ({
      date: dateKey,
      current: currentMap.get(dateKey) || 0,
      prev: previousMap.get(dateKey) || 0,
    }));

    return { rangeDays, data };
  }
}
