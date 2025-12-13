import { db } from "@core/database/database";

export class WatchListService {
  async getUserBondsWatchList(userId: number) {
    const data = await db.dataBase.bondsWatchList.findFirst({
      where: {
        userId,
      },
    });
    if (!data) {
      return [];
    }
    const fetchBonds = await db.dataBase.bonds.findMany({
      where: {
        isin: {
          in: data.items,
        },
      },
    });
    return fetchBonds;
  }

  async toggleBondsWatchList(userId: number, isin: string) {
    const data = await db.dataBase.bondsWatchList.findFirst({
      where: {
        userId,
      },
    });

    if (!data) {
      await db.dataBase.bondsWatchList.create({
        data: {
          userId: userId,
          items: [isin],
        },
      });
      return true;
    }

    if (data?.items.includes(isin)) {
      await db.dataBase.bondsWatchList.update({
        where: {
          id: data.id,
        },
        data: {
          items: {
            set: [...data.items.filter((e) => e != isin)],
          },
        },
      });
      return true;
    } else {
      await db.dataBase.bondsWatchList.update({
        where: {
          id: data.id,
        },
        data: {
          items: {
            push: isin,
          },
        },
      });
      return true;
    }
  }

  async getUserIssueNotesWatchList(userId: number) {
    const data = await db.dataBase.issueNotesWatchList.findFirst({
      where: {
        userId,
      },
    });
    if (!data) {
      return [];
    }
    console.log(data.items);

    return data.items;
  }

  async toggleIssueNotesWatchList(userId: number, issuerId: string) {
    const data = await db.dataBase.issueNotesWatchList.findFirst({
      where: {
        userId,
      },
    });
    console.log(data);

    if (!data) {
      await db.dataBase.issueNotesWatchList.create({
        data: {
          userId: userId,
          items: [issuerId],
        },
      });
      return true;
    }
    console.log(data?.items.includes(issuerId));

    if (data?.items.includes(issuerId)) {
      await db.dataBase.issueNotesWatchList.update({
        where: {
          id: data.id,
        },
        data: {
          items: [...data.items.filter((e) => e != issuerId)],
        },
      });
      return true;
    } else {
      await db.dataBase.issueNotesWatchList.update({
        where: {
          id: data.id,
        },
        data: {
          items: {
            push: issuerId,
          },
        },
      });
      return true;
    }
  }
}
