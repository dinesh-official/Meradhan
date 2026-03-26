import { db } from "@core/database/database";

export class LocaldataRfqService {
  async getLocaldataRfqIsin({
    from,
    search,
    status,
    to,
    page = 1,
    pageSize = 20,
  }: {
    from?: string;
    to?: string;
    search?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      AND: [
        from
          ? {
              createdAt: {
                gte: new Date(from),
              },
            }
          : {},
        to
          ? {
              createdAt: {
                lte: new Date(to),
              },
            }
          : {},
        search
          ? {
              OR: [
                {
                  isin: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  number: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {},
        status
          ? {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              status: status as any,
            }
          : {},
      ],
    };

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const [data, total] = await Promise.all([
      db.dataBase.rFQMasterISIN.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      db.dataBase.rFQMasterISIN.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        pageSize,
        pages: Math.ceil(total / pageSize),
      },
    };
  }
}
