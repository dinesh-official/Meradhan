import type { BondMargin, Prisma } from "@databases/generated/prisma/postgres";
import { db } from "@core/database/database";
import {
  BOND_MARGIN_STANDARD_RATINGS,
  BOND_MARGIN_WITHOUT_RATING,
  isAllowedBondMarginRating,
} from "./bond_margin.constants";

/** Without-rating row first so it’s visible at the top of each sector’s collapsible table. */
const RATING_SORT_ORDER = new Map<string, number>(
  [BOND_MARGIN_WITHOUT_RATING, ...BOND_MARGIN_STANDARD_RATINGS].map((r, i) => [
    r,
    i,
  ]),
);

function sortMarginsByRating(rows: BondMargin[]): BondMargin[] {
  return [...rows].sort((a, b) => {
    const ia = RATING_SORT_ORDER.get(a.rating) ?? 999;
    const ib = RATING_SORT_ORDER.get(b.rating) ?? 999;
    if (ia !== ib) return ia - ib;
    return a.rating.localeCompare(b.rating);
  });
}

type SlabInput = {
  underOneYear: number;
  oneToThreeYears: number;
  threeToFiveYears: number;
  fiveToSevenYears: number;
  sevenToTenYears: number;
  tenToFifteenYears: number;
  moreThanFifteenYears: number;
};

function asNumber(value: unknown, field: string): number {
  const n = typeof value === "number" ? value : Number(String(value ?? "").trim());
  if (!Number.isFinite(n)) throw new Error(`Invalid number for ${field}`);
  return n;
}

function asString(value: unknown, field: string): string {
  const s = String(value ?? "").trim();
  if (!s) throw new Error(`Missing ${field}`);
  return s;
}

function normalizeSlabs(body: Record<string, unknown>): SlabInput {
  return {
    underOneYear: asNumber(body.underOneYear, "underOneYear"),
    oneToThreeYears: asNumber(body.oneToThreeYears, "oneToThreeYears"),
    threeToFiveYears: asNumber(body.threeToFiveYears, "threeToFiveYears"),
    fiveToSevenYears: asNumber(body.fiveToSevenYears, "fiveToSevenYears"),
    sevenToTenYears: asNumber(body.sevenToTenYears, "sevenToTenYears"),
    tenToFifteenYears: asNumber(body.tenToFifteenYears, "tenToFifteenYears"),
    moreThanFifteenYears: asNumber(
      body.moreThanFifteenYears,
      "moreThanFifteenYears",
    ),
  };
}

function parseRating(body: Record<string, unknown>): string | undefined {
  const r = body.rating;
  if (r == null || r === "") return undefined;
  const s = String(r).trim();
  return s || undefined;
}

export class BondMarginService {
  /**
   * Paginate by **sector** (groups). Each group contains all rating rows for that sector.
   */
  async listGrouped(params: { search?: string; page: number; limit: number }) {
    const safePage = Math.max(1, params.page);
    const limitSectors = Math.min(50, Math.max(1, params.limit));
    const skip = (safePage - 1) * limitSectors;
    const search = params.search?.trim();

    const where: Prisma.BondMarginWhereInput | undefined =
      search && search.length > 0
        ? {
            OR: [
              { sectorName: { contains: search, mode: "insensitive" } },
              { rating: { contains: search, mode: "insensitive" } },
            ],
          }
        : undefined;

    const sectorGroups = await db.dataBase.bondMargin.groupBy({
      by: ["sectorName"],
      where,
      orderBy: { sectorName: "asc" },
    });

    const totalSectors = sectorGroups.length;
    const pageSectorNames = sectorGroups
      .slice(skip, skip + limitSectors)
      .map((g) => g.sectorName);

    if (pageSectorNames.length === 0) {
      const totalPages = Math.max(1, Math.ceil(totalSectors / limitSectors) || 1);
      return {
        groups: [] as { sectorName: string; rows: BondMargin[] }[],
        meta: {
          page: safePage,
          limit: limitSectors,
          total: totalSectors,
          totalPages,
          hasNextPage: safePage < totalPages,
          hasPrevPage: safePage > 1,
        },
      };
    }

    const rows = await db.dataBase.bondMargin.findMany({
      where: {
        AND: [
          { sectorName: { in: pageSectorNames } },
          ...(where ? [where] : []),
        ],
      },
      orderBy: [{ sectorName: "asc" }, { rating: "asc" }],
    });

    const bySector = new Map<string, BondMargin[]>();
    for (const r of rows) {
      const list = bySector.get(r.sectorName) ?? [];
      list.push(r);
      bySector.set(r.sectorName, list);
    }

    const groups = pageSectorNames.map((name) => ({
      sectorName: name,
      rows: sortMarginsByRating(bySector.get(name) ?? []),
    }));

    const totalPages = Math.max(1, Math.ceil(totalSectors / limitSectors));
    return {
      groups,
      meta: {
        page: safePage,
        limit: limitSectors,
        total: totalSectors,
        totalPages,
        hasNextPage: safePage < totalPages,
        hasPrevPage: safePage > 1,
      },
    };
  }

  async create(body: Record<string, unknown>) {
    const sectorName = asString(body.sectorName, "sectorName");
    const slabs = normalizeSlabs(body);
    const ratingOpt = parseRating(body);

    const ratingsToCreate: string[] = !ratingOpt
      ? [...BOND_MARGIN_STANDARD_RATINGS, BOND_MARGIN_WITHOUT_RATING]
      : [ratingOpt];

    for (const r of ratingsToCreate) {
      if (!isAllowedBondMarginRating(r)) {
        throw new Error(
          `Invalid rating "${r}". Use a standard rating, or leave empty to create all.`,
        );
      }
    }

    const dataRows = ratingsToCreate.map((rating) => ({
      sectorName,
      rating,
      ...slabs,
    }));

    const result = await db.dataBase.bondMargin.createMany({
      data: dataRows,
      skipDuplicates: true,
    });

    const rows = sortMarginsByRating(
      await db.dataBase.bondMargin.findMany({
        where: {
          sectorName,
          rating: { in: ratingsToCreate },
        },
      }),
    );

    return {
      createdCount: result.count,
      rows,
    };
  }

  async update(id: string, body: Record<string, unknown>) {
    const sectorName = asString(body.sectorName, "sectorName");
    const ratingRaw = parseRating(body);
    if (!ratingRaw || !isAllowedBondMarginRating(ratingRaw)) {
      throw new Error("Invalid or missing rating for update.");
    }
    const slabs = normalizeSlabs(body);

    const updated = await db.dataBase.bondMargin.update({
      where: { id },
      data: {
        sectorName,
        rating: ratingRaw,
        ...slabs,
      },
    });
    return updated;
  }

  async remove(id: string) {
    await db.dataBase.bondMargin.delete({ where: { id } });
    return true;
  }
}
