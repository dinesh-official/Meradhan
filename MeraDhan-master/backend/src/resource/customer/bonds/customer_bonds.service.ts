import { db } from "@core/database/database";

export class CustomerBondsService {
  async getCustomerBonds(customerId: number) {
    const bonds = await db.dataBase.customerBonds.findMany({
      where: { customerProfileId: customerId },
      orderBy: { purchaseDate: "desc" },
    });

    return bonds.map((bond) => ({
      id: bond.id,
      isin: bond.isin,
      bondName: bond.bondName,
      quantity: bond.quantity,
      purchasePrice: bond.purchasePrice,
      purchaseDate: bond.purchaseDate,
      bondData: bond.metadata,
    }));
  }
}

