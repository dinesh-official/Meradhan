import { EmailCommunication } from "@communication/email_communication";
import { config } from "@config/config";
import { db } from "@core/database/database";
import { NsdlBondProcessor } from "./nsdl_bond_processor";
import { NsdlBondService } from "./nsdl_bond_service";

export const revalidateBonds = async () => {
    console.log("Revalidating bonds...");

    // Rebuild and revalidate bonds list from NSDL
    const service = new NsdlBondService();
    const raw = await service.fetchBondData();

    // helper functions
    const toISODate = (v?: string) => {
        if (!v) return undefined;
        const d = new Date(v);
        if (!isNaN(d.getTime())) return d;
        return undefined;
    };

    const isRedemptionExpired = (date: string | Date) => {
        const d = date instanceof Date ? date : toISODate(date);
        if (!d) return false;
        return d.getTime() < Date.now();
    };

    const isYearOver9999 = (date: string | Date) => {
        const d = date instanceof Date ? date : toISODate(date);
        if (!d) return false;
        return d.getUTCFullYear() > 9999;
    };

    // Map raw rows -> parsed rows with error handling
    const parsedRows = raw.map((r, idx) => {
        try {
            const parsed = new NsdlBondProcessor(r).parse();
            return { ...parsed, _index: idx };
        } catch (error) {
            console.error(`Error processing bond at index ${idx} (ISIN: ${r.ISIN || 'unknown'}):`, error);
            // Return null for failed parsing, will be filtered out later
            return null;
        }
    }).filter((r): r is NonNullable<typeof r> => r !== null);

    const expired = parsedRows.filter((e) => e.maturityDate && isRedemptionExpired(e.maturityDate));
    const over9999 = parsedRows.filter((e) => e.maturityDate && isYearOver9999(e.maturityDate)).sort((a, b) => (a.creditRating || '').toString().localeCompare((b.creditRating || '').toString()));
    const valid = parsedRows.filter((e) => (!e.maturityDate || (!isRedemptionExpired(e.maturityDate) && !isYearOver9999(e.maturityDate))) && !!e.creditRating && e.creditRating.toLowerCase() != 'unrated');
    const unrated = parsedRows.filter((e) => (!e.maturityDate || (!isRedemptionExpired(e.maturityDate) && !isYearOver9999(e.maturityDate))) && (!e.creditRating || e.creditRating.toLowerCase() == 'unrated'));

    const zeroValidCoupon = valid.filter((e) => Number(e.couponRate) == 0);
    const nonZeroValidCoupon = valid.filter((e) => Number(e.couponRate) !== 0);

    let updated = 0;
    let created = 0;

    let index = 0;

    const order = [...nonZeroValidCoupon, ...zeroValidCoupon, ...unrated, ...over9999, ...expired];

    for (const e of order) {
        console.log(`Process isin ${e.isin}`);

        try {
            // Exclude _index from the data before upserting
            const { _index, ...bondData } = e;
            console.log(_index);

            // Use Prisma upsert for atomic create/update operation
            const result = await db.dataBase.bonds.upsert({
                where: { isin: bondData.isin },
                update: {
                    ...bondData,
                    sortedAt: index,
                },
                create: {
                    ...bondData,
                    sortedAt: index,
                }
            });

            // Check if this was an update or create by comparing timestamps
            // If createdAt and updatedAt are the same, it was a create operation
            if (result.createdAt.getTime() === result.updatedAt.getTime()) {
                created++;
            } else {
                updated++;
            }
        } catch (err) {
            console.error(`Failed to sync bond ${e.isin}:`, err);
        }
        index++;
    }

    const emailContent = `Bond Data Processing Summary\\n\\nTotal Bonds: ${parsedRows.length}\\nExpired Bonds: ${expired.length}\\n\\nNew Bonds Added: ${created}\\nBonds Updated: ${updated}\\n`;

    try {
        const emailer = new EmailCommunication();
        await emailer.sendEmail({
            to: config.smtp.user,
            subject: 'NSDL Bond Revalidation Summary',
            text: emailContent,
        });
        console.log('Update email sent successfully.');
    } catch (err) {
        console.warn('Failed to send summary email:', err);
        console.log('Summary:\n', emailContent);
    }

}