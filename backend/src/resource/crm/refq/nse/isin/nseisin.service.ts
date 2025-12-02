import { db, type DataBaseSchema } from "@core/database/database";
import type { NseRfq } from "@modules/RFQ/nse/nse_RFQ";

import type { appSchema } from "@root/schema";
import { NseRfqManager } from "@services/refq/nse/nseisin_manager.service";
import type z from "zod";

export class NSEIsinService {
  private nseRfq: NseRfq;

  constructor() {
    this.nseRfq = new NseRfqManager();
  }

  async searchIsin(
    payload: z.infer<typeof appSchema.crm.rfq.nse.isin.isinFilterSchema>
  ) {
    const filters: DataBaseSchema.NseIsinSecurityReceiptWhereInput = {};

    // 🧩 Dynamic filtering only if values exist
    if (payload.symbol) {
      filters.symbol = { contains: payload.symbol, mode: "insensitive" };
    }

    if (payload.description) {
      filters.description = {
        contains: payload.description,
        mode: "insensitive",
      };
    }

    if (payload.issuer) {
      filters.issuer = { contains: payload.issuer, mode: "insensitive" };
    }

    if (payload.filtIssueCategory) {
      filters.issueCategory = payload.filtIssueCategory;
    }

    if (payload.filtMaturity) {
      filters.maturityDate = this.getMaturityRange(payload.filtMaturity);
    }

    if (payload.filtCoupon) {
      filters.couponRate = this.getCouponRange(payload.filtCoupon);
    }

    // 📄 Pagination setup
    const page =
      payload.page && Number(payload.page) > 0 ? Number(payload.page) : 1;
    const limit =
      payload.limit && Number(payload.limit) > 0 ? Number(payload.limit) : 10;
    const skip = (page - 1) * Number(limit);

    // 🧮 Count total matching records
    const total = await db.dataBase.nseIsinSecurityReceipt.count({
      where: filters,
    });

    // 📦 Fetch paginated data
    const data = await db.dataBase.nseIsinSecurityReceipt.findMany({
      where: filters,
      skip,
      take: limit,
      orderBy: {
        listed: "desc",
      },
    });

    // 🔁 Return structured response
    return {
      data,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // 🔹 Maturity as Date Range
  private getMaturityRange(filt: string) {
    const now = new Date();
    const addYears = (years: number) => {
      const d = new Date(now);
      d.setFullYear(d.getFullYear() + years);
      return d;
    };

    const rangeMap: Record<string, { gte?: Date; lte?: Date }> = {
      "0^1": { gte: now, lte: addYears(1) },
      "1^3": { gte: addYears(1), lte: addYears(3) },
      "3^5": { gte: addYears(3), lte: addYears(5) },
      "5^7": { gte: addYears(5), lte: addYears(7) },
      "7^10": { gte: addYears(7), lte: addYears(10) },
      "10^": { gte: addYears(10) },
    };

    return rangeMap[filt];
  }

  // 🔹 Coupon range (numeric)
  private getCouponRange(filt: string) {
    const rangeMap: Record<string, { gte?: number; lte?: number }> = {
      "0^3": { gte: 0, lte: 3 },
      "3^5": { gte: 3, lte: 5 },
      "5^6": { gte: 5, lte: 6 },
      "6^7": { gte: 6, lte: 7 },
      "7^8": { gte: 7, lte: 8 },
      "8^9": { gte: 8, lte: 9 },
      "9^10": { gte: 9, lte: 10 },
      "10^": { gte: 10 },
    };
    return rangeMap[filt];
  }
}
