import { db } from "@core/database/database";
import type { DataBaseSchema } from "@core/database/database";
import type { appSchema } from "@root/schema";
import type z from "zod";
import { BondQueryBuilder } from "./bond_query_builder";
import { isISIN } from "@utils/filters/convert";
import {
  computeBondOrderPricingData,
  getLastNextCouponDateBasedOnSettlementDate,
} from "@services/order/order-pricing-helper";
import { sendBackOfficeEmail } from "@communication/email_communication";
import {
  placeOrderEmailCustomer,
  placeOrderEmailCustomerSubject,
  sendPlaceOrderEmail,
} from "./place-order-email";
import { AppConfigService } from "@resource/app-config/app-config.service";
import { AppError } from "@utils/error/AppError";
import { sanitizeIssuerHtml } from "@utils/html-sanitizer";
import { env } from "@packages/config/src/env";
import { OrderPdfService } from "@resource/customer/order/order-pdf.service";
import { OrderService } from "@resource/customer/order/order.service";
import { CustomerProfileManager } from "@services/customer/customer_manager.service";

export type GetBondOrderPricingResult =
  | { ok: true; pricing: Awaited<ReturnType<typeof computeBondOrderPricingData>> }
  | { ok: false; reason: "not_found" }
  | { ok: false; reason: "missing_coupon_dates" };

// ─── IST date-only derivation ──────────────────────────────────────────────
// Every date field on a bond has an `*Ist` (`@db.Date`) counterpart that stores
// the IST calendar day of the instant. This mirrors the NSDL scraper's
// `toIstDateOnly` so manual CRM edits stay consistent with scraped data.
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

function toIstDateOnly(
  value: Date | string | null | undefined,
): Date | null {
  if (value == null) return null;
  const dt = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(dt.getTime())) return null;
  // Shift the instant into IST, then keep only the calendar day (UTC midnight).
  const ist = new Date(dt.getTime() + IST_OFFSET_MS);
  return new Date(
    Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate()),
  );
}

// ─── CRM inventory batch cache ─────────────────────────────────────────────
// CRM inventory uploads happen manually and are rare, so we cache the latest
// batch id in process for `INVENTORY_BATCH_CACHE_TTL_MS`. Without this every
// bond request fires an extra `findFirst` on `crm_inventory_stock_batch`,
// which is a real contributor to homepage timeouts when the Supabase pool
// is busy (every endpoint that enriches with inventory does two DB hops).
//
// `INVENTORY_ENRICH_TIMEOUT_MS` caps the total inventory enrichment time so a
// slow/locked DB never blocks the main bonds list response. Without this the
// 15s axios timeout from the frontend is the only safety net, which means
// every homepage render fails in lockstep.
const INVENTORY_BATCH_CACHE_TTL_MS = 60_000;
const INVENTORY_ENRICH_TIMEOUT_MS = 2_500;
const HOMEPAGE_BONDS_MAX_LIMIT = 50;

const HOMEPAGE_ELIGIBLE_CREDIT_RATINGS = [
  "AAA",
  "AA",
  "AA+",
  "AAA(CE)",
  "AA+(CE)",
  "AA(CE)",
  "A+(CE)",
  "AAA",
  "AA+",
  "AA",
  "AA-",
  "A+",
  "A",
  "A-",
  "BBB+",
  "BBB",
] as const;

let cachedLatestBatchId: { id: number | null; expiresAt: number } | null = null;

export function parseHomepageBondLimit(raw: unknown, fallback = 3): number {
  const n = raw != null ? parseInt(String(raw), 10) : fallback;
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.min(n, HOMEPAGE_BONDS_MAX_LIMIT);
}

async function getCachedLatestInventoryBatchId(): Promise<number | null> {
  const now = Date.now();
  if (cachedLatestBatchId && cachedLatestBatchId.expiresAt > now) {
    return cachedLatestBatchId.id;
  }
  const batch = await db.dataBase.crmInventoryStockBatch.findFirst({
    orderBy: { uploadedAt: "desc" },
    select: { id: true },
  });
  cachedLatestBatchId = {
    id: batch?.id ?? null,
    expiresAt: now + INVENTORY_BATCH_CACHE_TTL_MS,
  };
  return cachedLatestBatchId.id;
}

/** Exported so an admin "upload inventory" path can invalidate it immediately. */
export function invalidateLatestInventoryBatchCache(): void {
  cachedLatestBatchId = null;
}

export class BondService {
  /**
   * Latest CRM inventory batch: quantity per ISIN (uppercase key). Missing ISIN → 0.
   */
  private async getLatestCrmInventoryQuantityMap(isins: string[]): Promise<Map<string, number>> {
    const map = new Map<string, number>();
    const normalized = [
      ...new Set(
        isins
          .map((i) => String(i).trim().toUpperCase())
          .filter((i) => i.length > 0),
      ),
    ];
    for (const i of normalized) map.set(i, 0);
    if (normalized.length === 0) return map;

    try {
      const batchId = await getCachedLatestInventoryBatchId();
      if (batchId == null) return map;

      const lines = await db.dataBase.crmInventoryStockLine.findMany({
        where: {
          batchId,
          isin: { in: normalized },
        },
        select: { isin: true, quantity: true },
      });
      for (const line of lines) {
        const k = line.isin.trim().toUpperCase();
        map.set(k, Math.max(0, Number(line.quantity)));
      }
    } catch {
      // Migrations not applied / pool exhausted / DB transient error — leave
      // the map at zeros so the calling endpoint can still return.
    }
    return map;
  }

  /** Whole-bond units available from the latest CRM inventory upload (floored). */
  async getLatestCrmInventoryWholeUnitsForIsin(isin: string): Promise<number> {
    const map = await this.getLatestCrmInventoryQuantityMap([isin]);
    const q = map.get(isin.trim().toUpperCase()) ?? 0;
    return Math.max(0, Math.floor(Number(q)));
  }

  async enrichBondsWithCrmInventory<T extends { isin: string }>(
    rows: T[],
  ): Promise<Array<T & { crmAvailableQuantity: number }>> {
    if (rows.length === 0) return [];

    // Best-effort enrichment: if the inventory lookup hasn't returned within
    // `INVENTORY_ENRICH_TIMEOUT_MS` (typically because the Supabase pool is
    // busy), fall back to crmAvailableQuantity: 0. The underlying query keeps
    // running in the background and will populate the next call's cache, so
    // we trade one stale render for an always-responsive homepage.
    let qtyMap: Map<string, number>;
    try {
      qtyMap = await Promise.race([
        this.getLatestCrmInventoryQuantityMap(rows.map((r) => r.isin)),
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error("inventory_enrichment_timeout")),
            INVENTORY_ENRICH_TIMEOUT_MS,
          ).unref(),
        ),
      ]);
    } catch {
      qtyMap = new Map();
    }

    return rows.map((r) => ({
      ...r,
      crmAvailableQuantity: qtyMap.get(r.isin.trim().toUpperCase()) ?? 0,
    }));
  }

  async getBondDetails(isin: string) {
    const data = await db.dataBase.bonds.findUnique({
      where: { isin },
    });
    return data;
  }

  async getBondOrderPricing(
    isin: string,
    quantityInput?: number,
    settlementType?: "T+0" | "T+1",
    sellPrice?: number,
  ): Promise<GetBondOrderPricingResult> {
    const bond = await this.getBondDetails(isin);
    if (!bond) {
      throw new Error("No Bond Found")
    }

    const cleanPrice =
      sellPrice ?? bond.sellPrice ?? bond.providerPrice ?? bond.issuePrice ?? 0;

    let lastCouponDateStr = bond.lastCouponDateIst?.toISOString() ?? null;
    let nextCouponDateStr = bond.nextCouponDateIst?.toISOString() ?? null;
    let recordDays =
      typeof bond.recordDays === "number" && !Number.isNaN(bond.recordDays)
        ? bond.recordDays
        : 7;

    if (!lastCouponDateStr || !nextCouponDateStr) {
      const couponDates = await getLastNextCouponDateBasedOnSettlementDate(
        isin,
        new Date(),
      );
      lastCouponDateStr = couponDates.lastCouponDate;
      nextCouponDateStr = couponDates.nextCouponDate;
      if (couponDates.recordDays != null && Number.isFinite(couponDates.recordDays)) {
        recordDays = couponDates.recordDays;
      }
    }

    if (!lastCouponDateStr || !nextCouponDateStr) {
      return { ok: false, reason: "missing_coupon_dates" };
    }

    const rawQuantity = quantityInput ?? 1;
    const quantity =
      Number.isFinite(rawQuantity) && rawQuantity > 0 ? rawQuantity : 1;

    const pricingData = await computeBondOrderPricingData(
      {
        isin: bond.isin,
        faceValue: bond.faceValue,
        quantity,
        cleanPrice: cleanPrice ?? 0,
        couponRate: Number(bond.couponRate),
        lastCouponDate: lastCouponDateStr,
        recordDays,
        nextCouponDate: nextCouponDateStr,
      },
      { settlementType },
    );

    const yieldRaw = bond.yield
    const yieldNum =
      yieldRaw != null && Number.isFinite(Number(yieldRaw))
        ? Number(yieldRaw)
        : null;

    return {
      ok: true,
      pricing: {
        ...pricingData,
        ...(yieldNum != null ? { yield: yieldNum } : {}),
      },
    };
  }

  async filterBonds(
    filters: z.infer<typeof appSchema.bonds.bondsFilterSchema>,
    options?: {
      page?: number | string;
      limit?: number | string;
      sortBy?: keyof ReturnType<typeof BondQueryBuilder.getSortingOptions>;
      category?: string;
      all?: string;
      /** User-facing "Sort by" token, e.g. "yield_desc" | "rating_asc" | "tenure_desc". */
      sort?: string | string[];
    },
  ) {
    const whereQuery = BondQueryBuilder.generateFilterQuery(filters);

    // User-facing sort (Yield / Rating / Tenure). When present it overrides the
    // default/category ordering, but only for the *intra-tier* order — the
    // Buy-Now-first grouping below is preserved.
    const userSort = BondQueryBuilder.parseUserSort(options?.sort);

    const sortingOptions = BondQueryBuilder.getSortingOptions();
    // Convert page and limit to numbers for calculations
    const pageNum =
      typeof options?.page === "string"
        ? parseInt(options.page, 10) || 1
        : options?.page || 1;

    const limitNum =
      typeof options?.limit === "string"
        ? parseInt(options.limit, 10) || 9
        : options?.limit || 9;

    const paginationOptions = BondQueryBuilder.getPaginationOptions(
      pageNum,
      limitNum,
    );

    let orderBy = options?.sortBy
      ? sortingOptions[options.sortBy]
      : sortingOptions.default;

    const extendedQuery = whereQuery;

    if
      (options?.all != "YES") {
      extendedQuery.isListed = { equals: "YES" };
      extendedQuery.redemptionDate = { gte: new Date() };
      extendedQuery.creditRating = { notIn: ["D", "C"] };
      console.log(isISIN(filters?.search || ""), filters?.search);

      if (isISIN(filters?.search || "")) {
        console.log("ISIN Search");
      } else {
        extendedQuery.allowForPurchase = { equals: true };
      }
    }

    if (options?.category && options.category != "all") {
      // no need to filter by redemptionDate for perpetual bonds
      if (options.category == "perpetual") {
        delete extendedQuery.redemptionDate;
        orderBy = sortingOptions.byRating;
      }

      if (options.category == "latest-release") {
        orderBy = sortingOptions.dateOfAllotment;
      }

      extendedQuery.categories = { has: options?.category || "" };
    }

    console.log(orderBy);


    const latestBatch = await db.dataBase.crmInventoryStockBatch.findFirst({
      orderBy: { uploadedAt: "desc" },
      select: { id: true },
    });
    let validIsins: string[] = [];
    if (latestBatch) {
      const activeStockLines = await db.dataBase.crmInventoryStockLine.findMany({
        where: {
          batchId: latestBatch.id,
          quantity: { gt: 0 },
        },
        select: { isin: true },
      });
      validIsins = activeStockLines.map((line) => line.isin.trim().toUpperCase());
    }

    const isClientDirectory = options?.all !== "YES";
    let data: any[] = [];
    let total = 0;

    if (isClientDirectory && validIsins.length > 0) {
      const eligibleCondition = {
        allowForPurchase: { equals: true },
        sellPrice: { gt: 0 },
        faceValue: { gt: 0 },
        nextCouponDate: { not: null },
        recordDays: { not: null },
        recordDate: { not: null },
        lastCouponDate: { not: null },
        natureOfInstrument: { not: null },
        dateOfAllotment: { not: null },
        yield: { not: null },
        AND: [
          {
            OR: [
              { isPerpetual: { equals: true } },
              { maturityDate: { not: null } },
            ],
          },
        ],
      };

      // Merge AND arrays explicitly — spreading two objects that both have an AND key
      // would silently overwrite the search condition from whereQuery with eligibleCondition's AND.
      const searchAnd = Array.isArray(whereQuery.AND) ? whereQuery.AND : [];
      const eligibleAnd = Array.isArray(eligibleCondition.AND) ? eligibleCondition.AND : [];

      const whereBuyNow = {
        ...whereQuery,
        ...eligibleCondition,
        isin: { in: validIsins },
        ...(searchAnd.length > 0 || eligibleAnd.length > 0
          ? { AND: [...searchAnd, ...eligibleAnd] }
          : {}),
      };
      const whereOther = {
        ...whereQuery,
        NOT: {
          ...eligibleCondition,
          isin: { in: validIsins },
        },
      };

      if (userSort) {
        // Sort within each tier (Buy Now first, then others), then page across
        // the merged order. Keeps the grouping intact while honouring the sort.
        const sorted = await this.paginateBondsByUserSort(
          [whereBuyNow, whereOther],
          userSort,
          paginationOptions.skip,
          paginationOptions.take,
        );
        data = sorted.data;
        total = sorted.total;
      } else {
        const [countBuyNow, countOther] = await Promise.all([
          db.dataBase.bonds.count({ where: whereBuyNow }),
          db.dataBase.bonds.count({ where: whereOther }),
        ]);
        total = countBuyNow + countOther;

        const skip = paginationOptions.skip;
        const take = paginationOptions.take;

        if (skip < countBuyNow) {
          // Offset starts within buy now bonds
          const buyNowBonds = await db.dataBase.bonds.findMany({
            where: whereBuyNow,
            orderBy,
            skip,
            take,
          });
          data.push(...buyNowBonds);

          if (data.length < take) {
            // Fill the remaining spots with other bonds (starting from index 0)
            const remaining = take - data.length;
            const otherBonds = await db.dataBase.bonds.findMany({
              where: whereOther,
              orderBy,
              skip: 0,
              take: remaining,
            });
            data.push(...otherBonds);
          }
        } else {
          // Offset is entirely within other bonds
          const otherOffset = skip - countBuyNow;
          const otherBonds = await db.dataBase.bonds.findMany({
            where: whereOther,
            orderBy,
            skip: otherOffset,
            take,
          });
          data.push(...otherBonds);
        }
      }
    } else if (userSort) {
      // Single-tier (all-bonds / no-inventory) listing with a user sort.
      const sorted = await this.paginateBondsByUserSort(
        [whereQuery],
        userSort,
        paginationOptions.skip,
        paginationOptions.take,
      );
      data = sorted.data;
      total = sorted.total;
    } else {
      const [rawBonds, countAll] = await Promise.all([
        db.dataBase.bonds.findMany({
          where: whereQuery,
          orderBy:
            options?.all == "YES"
              ? [
                {
                  allowForPurchase: "desc",
                },
                {
                  sortedAt: "asc",
                },
              ]
              : orderBy,
          ...paginationOptions,
        }),
        db.dataBase.bonds.count({
          where: whereQuery,
        }),
      ]);
      data = rawBonds;
      total = countAll;
    }

    const enriched = await this.enrichBondsWithCrmInventory(data);

    return {
      data: enriched,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  /**
   * Pages a result set by a user-chosen sort (Yield / Rating / Tenure) that
   * can't be expressed as a Prisma `orderBy`.
   *
   * `whereTiers` is ordered by priority — each tier is sorted independently and
   * the tiers are concatenated in order, so e.g. Buy-Now bonds stay above the
   * rest while still being sorted internally. Only lightweight sort-key columns
   * are fetched for the whole set; full rows are loaded for just the page.
   */
  private async paginateBondsByUserSort(
    whereTiers: DataBaseSchema.BondsWhereInput[],
    userSort: NonNullable<ReturnType<typeof BondQueryBuilder.parseUserSort>>,
    skip: number,
    take: number,
  ): Promise<{ data: any[]; total: number }> {
    const comparator = BondQueryBuilder.getUserSortComparator(userSort);
    const select = BondQueryBuilder.getUserSortSelect();

    const tierKeyLists = await Promise.all(
      whereTiers.map((where) =>
        db.dataBase.bonds.findMany({ where, select }),
      ),
    );

    // Sort each tier independently, then concat preserving tier priority.
    const orderedKeys = tierKeyLists.flatMap((keys) => keys.slice().sort(comparator));
    const total = orderedKeys.length;

    const pageIds = orderedKeys.slice(skip, skip + take).map((k) => k.id);
    if (pageIds.length === 0) return { data: [], total };

    const rows = await db.dataBase.bonds.findMany({
      where: { id: { in: pageIds } },
    });
    const byId = new Map(rows.map((r) => [r.id, r]));
    const data = pageIds
      .map((id) => byId.get(id))
      .filter((r): r is NonNullable<typeof r> => Boolean(r));

    return { data, total };
  }

  async autocompleteBondSearch(query: string) {
    const data = await db.dataBase.bonds.findMany({
      where: {
        OR: [
          {
            bondName: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            isin: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
      take: 10,
    });

    return this.enrichBondsWithCrmInventory(data);
  }

  async getLatestBonds(limit: number = 3) {
    const safeLimit = parseHomepageBondLimit(limit);
    const data = await db.dataBase.bonds.findMany({
      where: {
        isListed: { equals: "YES" },
        allowForPurchase: { equals: true },
        dateOfAllotment: { lte: new Date() },
        creditRating: {
          in: [
            "AAA",
            "AA",
            "AA+",
            "AAA(CE)",
            "AA+(CE)",
            "AA(CE)",
            "A+(CE)",
            "AAA",
            "AA+",
            "AA",
            "A+",
            "A",
            "A-",
            "BBB+",
            "BBB",
          ],
        },
      },
      orderBy: [
        { allowForPurchase: "desc" },
        { dateOfAllotment: "desc" },
        { creditRating: "asc" },
      ],
      take: safeLimit,
    });

    return this.enrichBondsWithCrmInventory(data);
  }

  async getHighYieldBonds(limit: number = 3) {
    const safeLimit = parseHomepageBondLimit(limit);
    const data = await db.dataBase.bonds.findMany({
      where: {
        isListed: { equals: "YES" },
        allowForPurchase: { equals: true },
        dateOfAllotment: { lte: new Date() },
        yield: { gte: 11 },
        creditRating: {
          in: [
            "AAA",
            "AA",
            "AA+",
            "AAA(CE)",
            "AA+(CE)",
            "AA(CE)",
            "A+(CE)",
            "AAA",
            "AA+",
            "AA",
            "A+",
            "A",
            "A-",
            "BBB+",
            "BBB",
          ],
        },
      },
      orderBy: [
        { allowForPurchase: "desc" },
        { yield: "desc" },
        { dateOfAllotment: "desc" },
      ],
      take: safeLimit,
    });

    return this.enrichBondsWithCrmInventory(data);
  }

  async getZeroCouponBonds(limit: number = 3) {
    const safeLimit = parseHomepageBondLimit(limit);
    const data = await db.dataBase.bonds.findMany({
      where: {
        isListed: { equals: "YES" },
        allowForPurchase: { equals: true },
        dateOfAllotment: { lte: new Date() },
        categories: { has: "zero-coupon" },
        creditRating: {
          in: [
            "AAA",
            "AA",
            "AA+",
            "AAA(CE)",
            "AA+(CE)",
            "AA(CE)",
            "A+(CE)",
            "AAA",
            "AA+",
            "AA",
            "A+",
            "A",
            "A-",
            "BBB+",
            "BBB",
          ],
        },
      },
      orderBy: [
        { allowForPurchase: "desc" },
        { dateOfAllotment: "desc" },
        { creditRating: "asc" },
      ],
      take: safeLimit,
    });

    return this.enrichBondsWithCrmInventory(data);
  }

  /**
   * Single round-trip for the meradhan homepage: three bond lists + one shared
   * inventory enrichment pass.
   */
  async getHomepageBonds(limit: number = 40) {
    const safeLimit = parseHomepageBondLimit(limit);
    const baseWhere = {
      isListed: { equals: "YES" as const },
      allowForPurchase: { equals: true },
      dateOfAllotment: { lte: new Date() },
      creditRating: { in: [...HOMEPAGE_ELIGIBLE_CREDIT_RATINGS] },
    };

    const [latestRaw, highYieldRaw, zeroCouponRaw] = await Promise.all([
      db.dataBase.bonds.findMany({
        where: baseWhere,
        orderBy: [
          { allowForPurchase: "desc" },
          { dateOfAllotment: "desc" },
          { creditRating: "asc" },
        ],
        take: safeLimit,
      }),
      db.dataBase.bonds.findMany({
        where: { ...baseWhere, yield: { gte: 11 } },
        orderBy: [
          { allowForPurchase: "desc" },
          { yield: "desc" },
          { dateOfAllotment: "desc" },
        ],
        take: safeLimit,
      }),
      db.dataBase.bonds.findMany({
        where: {
          ...baseWhere,
          categories: { has: "zero-coupon" },
        },
        orderBy: [
          { allowForPurchase: "desc" },
          { dateOfAllotment: "desc" },
          { creditRating: "asc" },
        ],
        take: safeLimit,
      }),
    ]);

    const allEnriched = await this.enrichBondsWithCrmInventory([
      ...latestRaw,
      ...highYieldRaw,
      ...zeroCouponRaw,
    ]);

    let offset = 0;
    const latest = allEnriched.slice(offset, (offset += latestRaw.length));
    const highYield = allEnriched.slice(offset, (offset += highYieldRaw.length));
    const zeroCoupon = allEnriched.slice(offset);

    return { latest, highYield, zeroCoupon };
  }

  async getLatestBondsTop3(limit: number = 3) {
    const data = await db.dataBase.bonds.findMany({
      where: {
        isListed: { equals: "YES" },
        dateOfAllotment: { lte: new Date() },
        creditRating: {
          in: [
            "AAA",
            "AA",
            "AA+",
            "AAA(CE)",
            "AA+(CE)",
            "AA(CE)",
            "A+(CE)",
            "AAA",
            "AA+",
            "AA",
            "A+",
            "A",
            "A-",
            "BBB+",
            "BBB",
          ],
        },
      },
      orderBy: {
        dateOfAllotment: "desc",
      },
      take: limit,
    });

    return this.enrichBondsWithCrmInventory(data);
  }

  async getUpcomingBonds(limit: number = 6) {
    const data = await db.dataBase.bonds.findMany({
      where: {
        isListed: { equals: "YES" },
        dateOfAllotment: { gt: new Date() },
        creditRating: {
          in: [
            "AAA",
            "AA",
            "AA+",
            "AAA(CE)",
            "AA+(CE)",
            "AA(CE)",
            "A+(CE)",
            "AAA",
            "AA+",
            "AA",
            "A+",
            "A",
            "A-",
            "BBB+",
            "BBB",
          ],
        },
      },
      orderBy: [
        {
          dateOfAllotment: "desc",
        },
        {
          creditRating: "asc",
        },
      ],
      take: limit,
    });

    return this.enrichBondsWithCrmInventory(data);
  }

  async createBond(
    bondData: z.infer<typeof appSchema.bonds.bondCreateUpdateSchema>,
  ) {
    const data = await db.dataBase.bonds.create({
      data: {
        isin: bondData.isin,
        bondName: bondData.bondName,
        instrumentName: bondData.instrumentName,
        description: bondData.description,
        issuerDescription: sanitizeIssuerHtml(bondData.issuerDescription),
        issuePrice: bondData.issuePrice,
        faceValue: bondData.faceValue,
        stampDutyPercentage: bondData.stampDutyPercentage ?? 0,
        allowForPurchase: bondData.allowForPurchase ?? false,
        couponRate: bondData.couponRate,
        interestPaymentFrequency: bondData.interestPaymentFrequency,
        putCallOptionDetails: bondData.putCallOptionDetails || null,
        certificateNumbers: bondData.certificateNumbers || null,
        totalIssueSize: bondData.totalIssueSize || 0,
        registrarDetails: bondData.registrarDetails || null,
        physicalSecurityAddress: bondData.physicalSecurityAddress || null,
        defaultedInRedemption: bondData.defaultedInRedemption || null,
        debentureTrustee: bondData.debentureTrustee || null,
        creditRatingInfo: bondData.creditRatingInfo || null,
        remarks: bondData.remarks || null,
        taxStatus: bondData.taxStatus,
        creditRating: bondData.creditRating || "UnRated",
        interestPaymentMode: bondData.interestPaymentMode,
        isListed: bondData.isListed,
        ratingAgencyName: bondData.ratingAgencyName || null,
        ratingDate: bondData.ratingDate || null,
        ratingDateIst: toIstDateOnly(bondData.ratingDate),
        categories: bondData.categories || [],
        sectorName: bondData.sectorName || null,
        dateOfAllotment: bondData.dateOfAllotment || null,
        dateOfAllotmentIst: toIstDateOnly(bondData.dateOfAllotment),
        redemptionDate: bondData.redemptionDate || null,
        redemptionDateIst: toIstDateOnly(bondData.redemptionDate),
        maturityDate: bondData.maturityDate || null,
        maturityDateIst: toIstDateOnly(bondData.maturityDate),
        maturityDateOnly: toIstDateOnly(bondData.maturityDate),
        sortedAt: bondData.sortedAt || 0,
        isConvertedDeal: bondData.isConvertedDeal || null,
        yield: bondData.yield || null,
        lastTradePrice: bondData.lastTradePrice || null,
        lastTradeYield: bondData.lastTradeYield || null,
        nextCouponDate: bondData.nextCouponDate || null,
        nextCouponDateIst: toIstDateOnly(bondData.nextCouponDate),
        modeOfIssuance: bondData.modeOfIssuance || null,
        couponType: bondData.couponType || null,
        buyYield: bondData.buyYield || null,
        providerName: bondData.providerName || null,
        providerInterestDate: bondData.providerInterestDate || null,
        providerInterestDateIst: toIstDateOnly(bondData.providerInterestDate),
        providerQuantity: bondData.providerQuantity || null,
        isOngoingDeal: bondData.isOngoingDeal ?? false,
        providerPrice: bondData.providerPrice || null,
        ignoreAutoUpdate: bondData.ignoreAutoUpdate ?? false,
        allCouponDates: bondData.allCouponDates ?? [],
        allCouponDatesIst: (bondData.allCouponDates ?? [])
          .map((d) => toIstDateOnly(d))
          .filter((d): d is Date => d != null),
        dayConvention: bondData.dayConvention || null,
        recordDate: bondData.recordDate || null,
        recordDateIst: toIstDateOnly(bondData.recordDate),
        recordDays: bondData.recordDays ?? null,
        accruedInterestDays: bondData.accruedInterestDays ?? null,
        accruedInterest: bondData.accruedInterest ?? null,
        settlementAmount: bondData.settlementAmount ?? null,
        principalAmount: bondData.principalAmount ?? null,
        totalConsideration: bondData.totalConsideration ?? null,
        imDocumentLink: bondData.imDocumentLink || null,
        exchangeListedOn: bondData.exchangeListedOn ?? null,
        lastCouponDate: bondData.lastCouponDate || null,
        lastCouponDateIst: toIstDateOnly(bondData.lastCouponDate),
        isPerpetual: bondData.isPerpetual ?? null,
        bondType: bondData.bondType ?? null,
        seniority: bondData.seniority ?? null,
        natureOfInstrument: bondData.natureOfInstrument ?? null,
        buyPrice: bondData.buyPrice ?? null,
        sellPrice: bondData.sellPrice ?? null,
        redemptionType: bondData.redemptionType || null,
        startDate: bondData.startDate || null,
        startDateIst: toIstDateOnly(bondData.startDate),
        endDate: bondData.endDate || null,
        endDateIst: toIstDateOnly(bondData.endDate),
      },
    });

    return data;
  }

  async updateBond(
    isin: string,
    bondData: z.infer<typeof appSchema.bonds.bondCreateUpdateSchema>,
    options?: {
      /**
       * When true, stamps `autofillSavedAt` with the current time.
       * Only the CRM Auto-Update "Accept & Save" path should pass this.
       */
      autofillSave?: boolean;
    },
  ) {
    // Check if bond exists
    const existingBond = await db.dataBase.bonds.findUnique({
      where: { isin },
    });

    if (!existingBond) {
      throw new Error(`Bond with ISIN ${isin} not found`);
    }

    const data = await db.dataBase.bonds.update({
      where: { isin },
      data: {
        ...(options?.autofillSave ? { autofillSavedAt: new Date() } : {}),
        bondName: bondData.bondName,
        instrumentName: bondData.instrumentName,
        description: bondData.description,
        issuerDescription: sanitizeIssuerHtml(bondData.issuerDescription),
        issuePrice: bondData.issuePrice,
        faceValue: bondData.faceValue,
        stampDutyPercentage: bondData.stampDutyPercentage ?? 0,
        allowForPurchase: bondData.allowForPurchase ?? false,
        couponRate: bondData.couponRate,
        interestPaymentFrequency: bondData.interestPaymentFrequency,
        putCallOptionDetails: bondData.putCallOptionDetails || null,
        certificateNumbers: bondData.certificateNumbers || null,
        totalIssueSize: bondData.totalIssueSize || 0,
        registrarDetails: bondData.registrarDetails || null,
        physicalSecurityAddress: bondData.physicalSecurityAddress || null,
        defaultedInRedemption: bondData.defaultedInRedemption || null,
        debentureTrustee: bondData.debentureTrustee || null,
        creditRatingInfo: bondData.creditRatingInfo || null,
        remarks: bondData.remarks || null,
        taxStatus: bondData.taxStatus,
        creditRating: bondData.creditRating || "UnRated",
        interestPaymentMode: bondData.interestPaymentMode,
        isListed: bondData.isListed,
        ratingAgencyName: bondData.ratingAgencyName || null,
        ratingDate: bondData.ratingDate || null,
        ratingDateIst: toIstDateOnly(bondData.ratingDate),
        categories: bondData.categories || [],
        sectorName: bondData.sectorName || null,
        dateOfAllotment: bondData.dateOfAllotment || null,
        dateOfAllotmentIst: toIstDateOnly(bondData.dateOfAllotment),
        redemptionDate: bondData.redemptionDate || null,
        redemptionDateIst: toIstDateOnly(bondData.redemptionDate),
        maturityDate: bondData.maturityDate || null,
        maturityDateIst: toIstDateOnly(bondData.maturityDate),
        maturityDateOnly: toIstDateOnly(bondData.maturityDate),
        sortedAt: bondData.sortedAt || 0,
        isConvertedDeal: bondData.isConvertedDeal || null,
        yield: bondData.yield || null,
        lastTradePrice: bondData.lastTradePrice || null,
        lastTradeYield: bondData.lastTradeYield || null,
        nextCouponDate: bondData.nextCouponDate || null,
        nextCouponDateIst: toIstDateOnly(bondData.nextCouponDate),
        modeOfIssuance: bondData.modeOfIssuance || null,
        couponType: bondData.couponType || null,
        buyYield: bondData.buyYield || null,
        providerName: bondData.providerName || null,
        providerInterestDate: bondData.providerInterestDate || null,
        providerInterestDateIst: toIstDateOnly(bondData.providerInterestDate),
        providerQuantity: bondData.providerQuantity || null,
        isOngoingDeal: bondData.isOngoingDeal ?? false,
        providerPrice: bondData.providerPrice || null,
        ignoreAutoUpdate: bondData.ignoreAutoUpdate ?? false,
        allCouponDates: bondData.allCouponDates ?? [],
        allCouponDatesIst: (bondData.allCouponDates ?? [])
          .map((d) => toIstDateOnly(d))
          .filter((d): d is Date => d != null),
        dayConvention: bondData.dayConvention || null,
        recordDate: bondData.recordDate || null,
        recordDateIst: toIstDateOnly(bondData.recordDate),
        recordDays: bondData.recordDays ?? null,
        accruedInterestDays: bondData.accruedInterestDays ?? null,
        accruedInterest: bondData.accruedInterest ?? null,
        settlementAmount: bondData.settlementAmount ?? null,
        principalAmount: bondData.principalAmount ?? null,
        totalConsideration: bondData.totalConsideration ?? null,
        imDocumentLink: bondData.imDocumentLink || null,
        exchangeListedOn: bondData.exchangeListedOn ?? null,
        lastCouponDate: bondData.lastCouponDate || null,
        lastCouponDateIst: toIstDateOnly(bondData.lastCouponDate),
        isPerpetual: bondData.isPerpetual ?? null,
        bondType: bondData.bondType ?? null,
        seniority: bondData.seniority ?? null,
        natureOfInstrument: bondData.natureOfInstrument ?? null,
        buyPrice: bondData.buyPrice ?? null,
        sellPrice: bondData.sellPrice ?? null,
        redemptionType: bondData.redemptionType || null,
        startDate: bondData.startDate || null,
        startDateIst: toIstDateOnly(bondData.startDate),
        endDate: bondData.endDate || null,
        endDateIst: toIstDateOnly(bondData.endDate),
      },
    });

    return data;
  }

  // [Ticket: Maturity and Credit Rating dropdown filters should display only bonds we hold]
  // Returns only the filter-option buckets that actually have active bonds in the DB.
  async getAvailableFilterOptions(category?: string) {
    const now = new Date();
    const currentYear = now.getFullYear();

    // Base filter: same visibility rules as the client directory
    const baseWhere: Record<string, unknown> = {
      isListed: { equals: "YES" },
      redemptionDate: { gte: now },
      creditRating: { notIn: ["D", "C"] },
      allowForPurchase: { equals: true },
    };

    // Apply category filter if provided (same logic as filterBonds)
    if (category && category !== "all") {
      if (category === "perpetual") {
        delete baseWhere.redemptionDate;
      }
      baseWhere.categories = { has: category };
    }

    // --- Maturity: check which year-buckets have at least one bond ---
    const maturityBuckets = [
      {
        value: "0-2" as const,
        gte: now,
        lte: new Date(currentYear + 2, 11, 31),
      },
      {
        value: "2-5" as const,
        gte: new Date(currentYear + 2, 0, 1),
        lte: new Date(currentYear + 5, 11, 31),
      },
      {
        value: "5-10" as const,
        gte: new Date(currentYear + 5, 0, 1),
        lte: new Date(currentYear + 10, 11, 31),
      },
      {
        value: "10-20" as const,
        gte: new Date(currentYear + 10, 0, 1),
        lte: new Date(currentYear + 20, 11, 31),
      },
      {
        value: "20+" as const,
        gte: new Date(currentYear + 20, 0, 1),
        lte: undefined,
      },
    ] as const;

    const couponBuckets = [
      { value: "4-7" as const, gte: 4, lte: 7 },
      { value: "8-10" as const, gte: 8, lte: 10 },
      { value: "10+" as const, gte: 10, lte: undefined },
    ] as const;

    // Run all 5 independent query groups in parallel to minimise DB round-trips
    const [
      maturityChecks,
      distinctRatings,
      distinctTaxation,
      couponChecks,
      distinctInterest,
    ] = await Promise.all([
      // --- Maturity: check which year-buckets have at least one bond ---
      // For perpetual bonds category skip maturity (they have no maturity date)
      category === "perpetual"
        ? Promise.resolve([] as { value: "0-2" | "2-5" | "5-10" | "10-20" | "20+"; hasData: boolean }[])
        : Promise.all(
          maturityBuckets.map(async (bucket) => {
            const count = await db.dataBase.bonds.count({
              where: {
                ...baseWhere,
                maturityDate: {
                  gte: bucket.gte,
                  ...(bucket.lte ? { lte: bucket.lte } : {}),
                },
              } as Record<string, unknown>,
            });
            return { value: bucket.value, hasData: count > 0 };
          }),
        ),
      // --- Credit Rating: distinct ratings present in active bonds ---
      db.dataBase.bonds.findMany({
        where: baseWhere as Record<string, unknown>,
        select: { creditRating: true },
        distinct: ["creditRating"],
      }),
      // --- Taxation: distinct taxStatus values ---
      db.dataBase.bonds.findMany({
        where: baseWhere as Record<string, unknown>,
        select: { taxStatus: true },
        distinct: ["taxStatus"],
      }),
      // --- Coupon: check which coupon-rate buckets have at least one bond ---
      Promise.all(
        couponBuckets.map(async (bucket) => {
          const count = await db.dataBase.bonds.count({
            where: {
              ...baseWhere,
              couponRate: {
                gte: bucket.gte,
                ...(bucket.lte != null ? { lte: bucket.lte } : {}),
              },
            } as Record<string, unknown>,
          });
          return { value: bucket.value, hasData: count > 0 };
        }),
      ),
      // --- Interest payment mode: distinct values ---
      db.dataBase.bonds.findMany({
        where: baseWhere as Record<string, unknown>,
        select: { interestPaymentMode: true },
        distinct: ["interestPaymentMode"],
      }),
    ]);

    const availableMaturity = maturityChecks
      .filter((b) => b.hasData)
      .map((b) => b.value);

    const availableRatings = distinctRatings
      .map((b) => b.creditRating)
      .filter((r): r is string => typeof r === "string" && r.trim() !== "");

    const availableTaxation = distinctTaxation
      .map((b) => b.taxStatus as string | null)
      .filter((t): t is string => typeof t === "string" && t.trim() !== "");

    const availableCoupon = couponChecks
      .filter((b) => b.hasData)
      .map((b) => b.value);

    const availableInterest = distinctInterest
      .map((b) => b.interestPaymentMode as string | null)
      .filter((i): i is string => typeof i === "string" && i.trim() !== "" && i !== "UNKNOWN");

    return {
      maturity: availableMaturity,
      rating: availableRatings,
      taxation: availableTaxation,
      coupon: availableCoupon,
      interest: availableInterest,
    };
  }

  async getOngoingDeals() {
    const data = await db.dataBase.bonds.findMany({
      where: { isOngoingDeal: true },
    });
    return this.enrichBondsWithCrmInventory(data);
  }

  async placeOrder(orderData: z.infer<typeof appSchema.bonds.orderPlaceSchema>) {
    const appConfig = new AppConfigService();
    const order = new OrderService();
    const bondService = new BondService();

    const pgMode = await appConfig.getPaymentGatewayMode();
    if (pgMode === "PAYMENT") {
      throw new AppError(
        "Orders must be completed through the Razorpay payment gateway. Please use Proceed to Pay on the order receipt.",
        { code: "ORDER_FLOW_REQUIRES_PAYMENT" },
      );
    }

    const customerProfileManager = new CustomerProfileManager();
    await customerProfileManager.assertCustomerCanPlaceOrder(
      orderData.customerProfileId,
    );

    const customer = await db.dataBase.customerProfileDataModel.findUnique({
      where: { id: orderData.customerProfileId },
    });
    if (!customer) {
      throw new Error(`Customer with ID ${orderData.customerProfileId} not found`);
    }
    const bond = await bondService.getBondOrderPricing(
      orderData.isin,
      orderData.quantity,
      orderData.settlementType,
    );

    if (bond.ok) {
      await order.createDraftOrder(customer.id, {
        isin: orderData.isin,
        quantity: orderData.quantity,
        sellPrice: bond.pricing.cleanPrice,
      })
    }
    const data = await db.dataBase.leadsModel.create({
      data: {
        bondType: "CORPORATE",
        fullName: customer.firstName + " " + customer.lastName,
        phoneNo: customer.phoneNo ?? "",
        leadSource: "WEBSITE",
        status: "NEW",
        createdBy: customer.id,
        emailAddress: customer.emailAddress ?? "",
        exInvestmentAmount: orderData.settlementAmount,
        note: "Order placed for " + orderData.bondName + " with ISIN " + orderData.isin + " and quantity " + orderData.quantity + " at " + orderData.dealDate,
      },
    });


    // format the request date to DD-MMM-YYYY HH:MM AM/PM
    const requestDate = new Date(orderData.requestDate).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    })


    const orderPdfService = new OrderPdfService();
    let orderPdfAttachments:
      | { filename: string; path: string }[]
      | undefined;
    try {
      const pdfFilePath = await orderPdfService.generateTempOrderPdfFile({
        userId: customer.id,
        isin: orderData.isin,
        qun: orderData.quantity,
        isReleased: false,
        requestDate: orderData.requestDate,
      });
      orderPdfAttachments = [
        {
          filename: `MERADHAN-ORDER-${orderData.isin}-${orderData.quantity}.pdf`,
          path: pdfFilePath,
        },
      ];
    } catch (e) {
      console.error("placeOrder: failed to generate order PDF for email", e);
    }

    orderData.requestDate = requestDate;

    await Promise.all([
      sendBackOfficeEmail({
        to: customer.emailAddress ?? "",
        subject: placeOrderEmailCustomerSubject(orderData),
        text: await placeOrderEmailCustomer(orderData),
        // attachments: orderPdfAttachments,
      }),
      sendBackOfficeEmail({
        to: "dl.sales@meradhan.co",
        subject: env.CBRICS_ENV === "UAT" ? `UAT Testing | Order Request | ${orderData.isin} | Qty: ${orderData.quantity} | Rs. ${orderData.faceValue * orderData.quantity} [Please DELETE this email its a test email]` : `Order Request | ${orderData.isin} | Qty: ${orderData.quantity} | Rs. ${orderData.faceValue * orderData.quantity} | Request Date: ${requestDate}`,
        text: await sendPlaceOrderEmail(orderData),
        attachments: orderPdfAttachments,
      }),
    ]);
    return { success: true, message: "Order placed successfully" };
  }
}
