import { db } from "@core/database/database";

export const RazorpayRouteAccountsRepo = {
  findMany() {
    return db.dataBase.razorpayRouteAccount.findMany({
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
  },
  findByRazorpayAccountId(razorpayAccountId: string) {
    return db.dataBase.razorpayRouteAccount.findUnique({
      where: { razorpayAccountId },
    });
  },
};

