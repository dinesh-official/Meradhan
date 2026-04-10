import { db } from "@core/database/database";

type MarginInput = {
  sectorName: string;
  rating: string;
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

export class BondMarginService {
  async list(params: { search?: string; page: number; limit: number }) {
    const page = Math.max(1, params.page);
    const limit = Math.min(200, Math.max(1, params.limit));
    const skip = (page - 1) * limit;
    const search = params.search?.trim();

    const where =
      search && search.length > 0
        ? {
            OR: [
              { sectorName: { contains: search, mode: "insensitive" as const } },
              { rating: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {};

    const [total, items] = await Promise.all([
      db.dataBase.bondMargin.count({ where }),
      db.dataBase.bondMargin.findMany({
        where,
        orderBy: [{ sectorName: "asc" }, { rating: "asc" }],
        skip,
        take: limit,
      }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));
    return { data: items, meta: { page, limit, total, totalPages } };
  }

  normalizeInput(body: Record<string, unknown>): MarginInput {
    return {
      sectorName: asString(body.sectorName, "sectorName"),
      rating: asString(body.rating, "rating"),
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

  async create(body: Record<string, unknown>) {
    const data = this.normalizeInput(body);
    const created = await db.dataBase.bondMargin.create({ data });
    return created;
  }

  async update(id: string, body: Record<string, unknown>) {
    const data = this.normalizeInput(body);
    const updated = await db.dataBase.bondMargin.update({
      where: { id },
      data,
    });
    return updated;
  }

  async remove(id: string) {
    await db.dataBase.bondMargin.delete({ where: { id } });
    return true;
  }
}

