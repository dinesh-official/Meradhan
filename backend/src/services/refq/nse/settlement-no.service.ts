import { db } from "@core/database/database";

function toSettlementNoDateKey(date: string): string {
    const trimmed = String(date ?? "").trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
    const parsed = new Date(trimmed);
    if (Number.isNaN(parsed.getTime())) {
        throw new Error("Invalid date");
    }
    // Prefer local YMD for non-ISO inputs (DD-MMM-YYYY etc.); ISO timestamps use UTC day.
    if (/^\d{4}-\d{2}-\d{2}T/.test(trimmed)) {
        return parsed.toISOString().slice(0, 10);
    }
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, "0");
    const d = String(parsed.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

export class SettlementNoService {
    async getSettlementNo(date: string) {
        const dateValue = toSettlementNoDateKey(date);
        return db.dataBase.nseSettlementNo.findFirst({
            where: {
                date: dateValue,
            },
        });
    }

    /** Persists `date` as yyyy-mm-dd. Upserts by unique `settlementNo`. */
    async createOrUpdateSettlementNo(date: string, settlementNo: string) {
        const dateValue = toSettlementNoDateKey(date);
        if (!settlementNo) {
            throw new Error("Settlement No is required");
        }
        return await db.dataBase.nseSettlementNo.upsert({
            where: { settlementNo },
            update: { date: dateValue },
            create: {
                date: dateValue,
                settlementNo,
            },
        });
    }
}