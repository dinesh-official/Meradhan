import { db } from "@core/database/database";
import type { Prisma } from "@databases/generated/prisma/postgres";
import { OrderStatus } from "@databases/generated/prisma/postgres";

export class CrmOrdersService {
  async getAllOrders(
    page: number = 1,
    limit: number = 10,
    status?: string,
    bondType?: string,
    search?: string,
    date?: string
  ) {
    const skip = (page - 1) * limit;

    const whereClause: Prisma.OrderWhereInput = {};

    const countWhereClause: Prisma.OrderWhereInput = {};

    if (status) {
      const validOrderStatuses = ["PENDING", "SETTLED", "APPLIED", "REJECTED"];
      if (validOrderStatuses.includes(status)) {
        whereClause.status = status as OrderStatus;
        countWhereClause.status = status as OrderStatus;
      }
    }

    if (bondType) {
      const validBondTypes = ["PRIMARY", "SECONDARY"];
      if (validBondTypes.includes(bondType.toUpperCase())) {
        const isPrimary = bondType.toUpperCase() === "PRIMARY";
        whereClause.bondDetails = {
          path: ["isPrimary"],
          equals: isPrimary,
        };
        countWhereClause.bondDetails = {
          path: ["isPrimary"],
          equals: isPrimary,
        };
      }
    }

    if (search) {
      whereClause.OR = [
        {
          customerProfile: {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
              { emailAddress: { contains: search, mode: "insensitive" } },
            ],
          },
        },
        { bondName: { contains: search, mode: "insensitive" } },
        { orderNumber: { contains: search, mode: "insensitive" } },
        {
          bondDetails: {
            path: ["issuerCode"],
            string_contains: search,
          },
        },
      ];
      countWhereClause.OR = whereClause.OR;
    }

    if (date) {
      const selectedDate = new Date(date);
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      whereClause.createdAt = {
        gte: startOfDay,
        lte: endOfDay,
      };
      countWhereClause.createdAt = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const [orders, total] = await Promise.all([
      db.dataBase.order.findMany({
        where: whereClause,
        include: {
          customerProfile: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              emailAddress: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.dataBase.order.count({
        where: countWhereClause,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }
}
