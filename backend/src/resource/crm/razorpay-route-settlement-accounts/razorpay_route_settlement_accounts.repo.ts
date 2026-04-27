import { db } from "@core/database/database";

export const RazorpayRouteSettlementAccountsRepo = {
  findManyByRazorpayAccountId(razorpayAccountId: string) {
    return db.dataBase.razorpayRouteSettlementAccount.findMany({
      where: { razorpayAccountId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
  },

  findDefaultByRazorpayAccountId(razorpayAccountId: string) {
    return db.dataBase.razorpayRouteSettlementAccount.findFirst({
      where: { razorpayAccountId, isDefault: true },
    });
  },
};

