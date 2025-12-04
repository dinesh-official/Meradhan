import { db, type DataBaseSchema } from "@core/database/database";
import { AppError } from "@utils/error/AppError";

export class CrmUserRepo {
  async findManyUser(payload: DataBaseSchema.CRMUserDataModelFindManyArgs) {
    const response = await db.dataBase.cRMUserDataModel.findMany(payload);
    return response;
  }
  async countUsers(payload: DataBaseSchema.CRMUserDataModelCountArgs) {
    const response = await db.dataBase.cRMUserDataModel.count(payload);
    return response;
  }

  async findUser(payload: DataBaseSchema.CRMUserDataModelFindUniqueArgs) {
    const response = await db.dataBase.cRMUserDataModel.findUnique(payload);
    if (!response) {
      throw new AppError("The specified user does not exist.");
    }
    return response;
  }

  async createNewUser(payload: DataBaseSchema.CRMUserDataModelCreateInput) {
    const isEmailExist = await db.dataBase.cRMUserDataModel.findUnique({
      where: { email: payload.email },
    });
    if (isEmailExist) {
      throw new AppError("The provided email is already registered.");
    }

    const response = await db.dataBase.cRMUserDataModel.create({
      data: payload,
    });
    return response;
  }

  async updateUser(payload: DataBaseSchema.CRMUserDataModelUpdateArgs) {
    const response = await db.dataBase.cRMUserDataModel.update(payload);
    return response;
  }

  async deleteUser(payload: DataBaseSchema.CRMUserDataModelDeleteArgs) {
    const data = await db.dataBase.cRMUserDataModel.delete(payload);
    return data;
  }
}
