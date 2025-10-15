import { db, type CRMUserDataModel, type DataBaseSchema } from "@core/database/database";
import { AppError } from "@utils/error/AppError";

export interface ICrmUserRepo {
    findUser(payload: DataBaseSchema.CRMUserDataModelFindUniqueArgs): Promise<CRMUserDataModel>
    findManyUser(payload: DataBaseSchema.CRMUserDataModelFindManyArgs): Promise<CRMUserDataModel[]>
    createNewUser(payload: DataBaseSchema.CRMUserDataModelCreateInput): Promise<CRMUserDataModel>
    updateUser(payload: DataBaseSchema.CRMUserDataModelUpdateArgs): Promise<CRMUserDataModel>
    deleteUser(payload: DataBaseSchema.CRMUserDataModelDeleteArgs): Promise<boolean>
    countUsers(payload: DataBaseSchema.CRMUserDataModelCountArgs): Promise<number>
}

export class CrmUserRepo implements ICrmUserRepo {

    async findManyUser(payload: DataBaseSchema.CRMUserDataModelFindManyArgs): ReturnType<ICrmUserRepo['findManyUser']> {
        const response = await db.dataBase.cRMUserDataModel.findMany(payload);
        return response;
    }
    async countUsers(payload: DataBaseSchema.CRMUserDataModelCountArgs): ReturnType<ICrmUserRepo['countUsers']> {
        const response = await db.dataBase.cRMUserDataModel.count(payload);
        return response;
    }

    async findUser(payload: DataBaseSchema.CRMUserDataModelFindUniqueArgs): ReturnType<ICrmUserRepo['findUser']> {
        const response = await db.dataBase.cRMUserDataModel.findUnique(payload);
        if (!response) {
            throw new AppError("The specified user does not exist.")
        }
        return response;
    }

    async createNewUser(payload: DataBaseSchema.CRMUserDataModelCreateInput): ReturnType<ICrmUserRepo['createNewUser']> {

        const isEmailExist = await db.dataBase.cRMUserDataModel.findUnique({ where: { email: payload.email } });
        if (isEmailExist) {
            throw new AppError("The provided email is already registered.")
        }

        const response = await db.dataBase.cRMUserDataModel.create({ data: payload });
        return response;
    }

    async updateUser(payload: DataBaseSchema.CRMUserDataModelUpdateArgs): ReturnType<ICrmUserRepo['updateUser']> {
        const response = await db.dataBase.cRMUserDataModel.update(payload);
        return response;
    }

    async deleteUser(payload: DataBaseSchema.CRMUserDataModelDeleteArgs): Promise<boolean> {
        await db.dataBase.cRMUserDataModel.delete(payload);
        return true;
    }
}