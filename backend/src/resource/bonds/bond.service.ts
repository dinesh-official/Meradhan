import { db } from "@core/database/database";
import type { appSchema } from "@root/schema";
import type z from "zod";
import { BondQueryBuilder } from "./bond_query_builder";

export class BondService {
    async getBondDetails(isin: string) {
        const data = await db.dataBase.bonds.findUnique({
            where: { isin },
        });
        return data;
    }

    async filterBonds(
        filters: z.infer<typeof appSchema.bonds.bondsFilterSchema>,
        options?: {
            page?: number | string;
            limit?: number | string;
            sortBy?: keyof ReturnType<typeof BondQueryBuilder.getSortingOptions>;
        },
    ) {
        const whereQuery = BondQueryBuilder.generateFilterQuery(filters);
        console.log(whereQuery);
        
        const sortingOptions = BondQueryBuilder.getSortingOptions();
        // Convert page and limit to numbers for calculations
        const pageNum = typeof options?.page === 'string' ? parseInt(options.page, 10) || 1 : options?.page || 1;
        const limitNum = typeof options?.limit === 'string' ? parseInt(options.limit, 10) || 9 : options?.limit || 9;
        const paginationOptions = BondQueryBuilder.getPaginationOptions(pageNum, limitNum);

        const orderBy = options?.sortBy
            ? sortingOptions[options.sortBy]
            : sortingOptions.default;

        const [data, total] = await Promise.all([
            db.dataBase.bonds.findMany({
                where: {
                    ...whereQuery,
                },
                orderBy,
                ...paginationOptions
            }),
            db.dataBase.bonds.count({
                where: whereQuery
            })
        ]);

        return {
            data,
            meta: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum)
            }
        };
    }
}