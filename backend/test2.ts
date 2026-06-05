import { db } from "@core/database/database";
import { getLastCouponDateFromReferenceData } from "@services/order/order-pricing-helper";

const allSellBonds = await db.dataBase.bonds.findMany({
    where: {
        allowForPurchase: true,
    }
});

const toDateOnly = (d: Date | null | undefined) =>
    d ? d.toISOString().split("T")[0] : "—";

const now = new Date();
const lines = await Promise.all(
    allSellBonds.map(async (e) => {
        const lastCouponDate = await getLastCouponDateFromReferenceData(e.isin, now);
        return (
            {
                isin: e.isin,
                interestPaymentMode: e.interestPaymentMode,
                lastCouponDateFromReferenceData: lastCouponDate,
                nowLastCouponDate: toDateOnly(e.lastCouponDate),
                nextCouponDate: toDateOnly(e.nextCouponDate),
            }
        );
    }),
);

console.table(lines);
