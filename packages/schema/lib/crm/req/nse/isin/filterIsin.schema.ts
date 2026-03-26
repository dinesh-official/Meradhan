import { z } from "zod";

export const isinFilterSchema = z.object({
    symbol: z.string().optional(),
    description: z.string().optional(),
    issuer: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),



    filtIssueCategory: z
        .enum(["CB", "CP", "CD", "SD", "GS"])
        .optional(),

    filtMaturity: z
        .enum(["0^1", "1^3", "3^5", "5^7", "7^10", "10^"])
        .optional(),

    filtCoupon: z
        .enum(["3^5", "10^", "0^3", "5^6", "6^7", "7^8", "8^9", "9^10"])
        .optional(),
});

export type Filter = z.infer<typeof isinFilterSchema>;

