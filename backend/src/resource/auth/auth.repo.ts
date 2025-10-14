import { db, type CRMUserDataModel } from "@core/database/database";
import { AppError, HttpStatus } from "@utils/error/AppError";
export interface IAuthRepoInterface {
    getAuthUserByEmail(email: string): Promise<CRMUserDataModel>
}


export class AuthRepo implements IAuthRepoInterface {

    async getAuthUserByEmail(email: string): ReturnType<IAuthRepoInterface['getAuthUserByEmail']> {
        const data = await db.dataBase.cRMUserDataModel.findUnique({
            where: { email }
        });
        if (!data) throw new AppError("no user found on this email ", { statusCode: HttpStatus.UNAUTHORIZED })
        return data;
    }

}