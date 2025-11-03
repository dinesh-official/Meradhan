import { db } from "@core/database/database";
import { HttpStatus } from "@utils/error/AppError";
import type { Request, Response } from "express";


// KYC store controller class to get and set kyc data in kyc_flow table to track kyc progress for customer to resume later
export class KycStoreController {
    async getKycData(req: Request, res: Response) {
        const id = req.customer!.id

        const response = await db.dataBase.kYC_FLOW.findUnique({
            where: {
                userID: id
            }
        });

        res.sendResponse({
            statusCode: HttpStatus.OK,
            responseData: response
        })
    }

    async setKycData(req: Request, res: Response) {
        const id = req.customer!.id;
        const step = req.params.step!;
        const data = req.body;
        const complete = req.query.complete === 'true';

        const user = await db.dataBase.kYC_FLOW.findUnique({ where: { userID: id } });

        if (!user) {
            await db.dataBase.kYC_FLOW.create({
                data: {
                    userID: id,

                }
            })
        }

        await db.dataBase.kYC_FLOW.update({
            where: {
                userID: id
            },
            data: {
                data: data,
                userID: id,
                step: Number(step),
                complete
            },

        });

        res.sendResponse({
            statusCode: HttpStatus.OK,
            responseData: {
                success: true
            }
        })
    }
}