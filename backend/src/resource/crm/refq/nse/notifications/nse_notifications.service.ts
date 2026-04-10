import { db } from "@core/database/database";

function paginationMeta(total: number, page: number, limit: number) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

export class NseNotificationsService {
  async listWebhookNotifications(params: { page: number; limit: number }) {
    const limit = Math.min(100, Math.max(1, params.limit));
    const page = Math.max(1, params.page);
    const skip = (page - 1) * limit;

    const [rows, total] = await Promise.all([
      db.dataBase.nseWebhookNotification.findMany({
        orderBy: { id: "desc" },
        skip,
        take: limit,
      }),
      db.dataBase.nseWebhookNotification.count(),
    ]);

    return {
      data: rows,
      meta: paginationMeta(total, page, limit),
    };
  }

  async listCbricsTableNotifications(params: { page: number; limit: number }) {
    const limit = Math.min(100, Math.max(1, params.limit));
    const page = Math.max(1, params.page);
    const skip = (page - 1) * limit;

    const [rows, total] = await Promise.all([
      db.dataBase.nseCbricsNotification.findMany({
        orderBy: { id: "desc" },
        skip,
        take: limit,
      }),
      db.dataBase.nseCbricsNotification.count(),
    ]);

    return {
      data: rows,
      meta: paginationMeta(total, page, limit),
    };
  }
}
