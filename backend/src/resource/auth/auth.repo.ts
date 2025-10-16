import { db, type CRMUserDataModel } from "@core/database/database";
import { AppError, HttpStatus } from "@utils/error/AppError";
export interface IAuthRepoInterface {
    getAuthUserByEmail(email: string): Promise<CRMUserDataModel>
    getAuthSession(id: number): Promise<CRMUserDataModel>,
    setLastLoginNow(id: number): Promise<boolean>,

}


export class AuthRepo implements IAuthRepoInterface {

    async getAuthUserByEmail(email: string): ReturnType<IAuthRepoInterface['getAuthUserByEmail']> {
        const data = await db.dataBase.cRMUserDataModel.findUnique({
            where: { email }
        });
        if (!data) throw new AppError("Operation cannot proceed due to missing data.", { statusCode: HttpStatus.UNAUTHORIZED })
        return data;
    }

    async getAuthSession(id: number): ReturnType<IAuthRepoInterface['getAuthUserByEmail']> {
        const data = await db.dataBase.cRMUserDataModel.findUnique({
            where: { id }
        });
        if (!data) throw new AppError("Operation cannot proceed due to missing data.", { statusCode: HttpStatus.UNAUTHORIZED });
        return data;
    }

    async setLastLoginNow(id: number): Promise<boolean> {
        await db.dataBase.cRMUserDataModel.update({
            where: { id },
            data: {
                lastLogin: new Date()
            }
        });
        return true;
    }
}