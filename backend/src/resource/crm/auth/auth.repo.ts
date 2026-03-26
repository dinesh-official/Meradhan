import { db } from "@core/database/database";
import { AppError, HttpStatus } from "@utils/error/AppError";



export class AuthRepo {

    async getAuthUserByEmail(email: string) {
        const data = await db.dataBase.cRMUserDataModel.findUnique({
            where: { email }
        });
        if (!data) throw new AppError("User does not exist.", { statusCode: HttpStatus.UNAUTHORIZED })
        return data;
    }

    async getAuthSession(id: number) {
        const data = await db.dataBase.cRMUserDataModel.findUnique({
            where: { id }
        });
        if (!data) throw new AppError("User does not exist.", { statusCode: HttpStatus.UNAUTHORIZED });
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