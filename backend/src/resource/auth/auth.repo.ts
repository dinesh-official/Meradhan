
import { db, type DataBase, type DataBaseSchema } from "@core/database/database";
import { AppError, HttpStatus } from "@utils/error/AppError";
import type { IAuthRepoInterface } from "./auth.interface";



export class AuthRepo implements IAuthRepoInterface {
    private db: DataBase;
    constructor() {
        this.db = db.dataBase;
    }

    async login(email: string): ReturnType<IAuthRepoInterface['login']> {
        const user = await this.db.userDataModel.findFirst({
            where: {
                email: email
            }
        });

        if (!user) {
            throw new AppError(`invalid credentials`, {
                statusCode: HttpStatus.UNAUTHORIZED,
                code: "INVALID_CREDENTIALS"
            });
        }

        return user;
    }


    async signUp(data: DataBaseSchema.UserDataModelCreateInput): ReturnType<IAuthRepoInterface['signUp']> {

        const user = await this.db.userDataModel.create({
            data: data
        });
        return user;
    }

    async getUser(id: number | string): ReturnType<IAuthRepoInterface['getUser']> {
        const user = await this.db.userDataModel.findUnique({
            where: {
                id: Number(id)
            },
        });
        if (!user) {
            throw new AppError(`User not found`, { statusCode: HttpStatus.UNAUTHORIZED, code: "USER_NOT_FOUND" });
        }
        return user;
    }

}