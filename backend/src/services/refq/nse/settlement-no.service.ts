import { db } from "@core/database/database";

export class SettlementNoService {
    async getSettlementNo(date: string) {
        const dateValue = new Date(date).toISOString().split("T")[0];
        return db.dataBase.nseSettlementNo.findFirst({
            where: {
                date: dateValue,
            },
        });
    }

    /** Persists `date` as yyyy-mm-dd. Upserts by unique `settlementNo`. */
    async createOrUpdateSettlementNo(date: string, settlementNo: string) {
        const parsed = new Date(date);
        if (Number.isNaN(parsed.getTime())) {
            throw new Error("Invalid date");
        }
        const dateValue = parsed.toISOString().split("T")[0];
        if (!settlementNo) {
            throw new Error("Settlement No is required");
        }
        return await db.dataBase.nseSettlementNo.upsert({
            where: { settlementNo },
            update: { date: dateValue },
            create: {
                date: dateValue!,
                settlementNo,
            },
        });
    }
}