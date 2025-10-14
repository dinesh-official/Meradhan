import { db, type CustomerProfileDataModel, type DataBaseSchema } from "@core/database/database"
import { AppError } from "@utils/error/AppError";

export interface ICustomerProfileRepo {
    findCustomer(payload: DataBaseSchema.CustomerProfileDataModelFindUniqueArgs): Promise<CustomerProfileDataModel>,
    findManyCustomer(payload: DataBaseSchema.CustomerProfileDataModelFindManyArgs): Promise<CustomerProfileDataModel[]>,
    createNewCustomer(payload: DataBaseSchema.CustomerProfileDataModelCreateArgs): Promise<CustomerProfileDataModel>,
    updateCustomer(payload: DataBaseSchema.CustomerProfileDataModelUpdateArgs): Promise<CustomerProfileDataModel>,
    deleteCustomer(payload: DataBaseSchema.CustomerProfileDataModelDeleteArgs): Promise<boolean>,
}

export class CustomerProfileRepo implements ICustomerProfileRepo {
    createNewCustomer(payload: DataBaseSchema.CustomerProfileDataModelCreateArgs): ReturnType<ICustomerProfileRepo['createNewCustomer']> {
        return db.dataBase.customerProfileDataModel.create(payload);
    }
    updateCustomer(payload: DataBaseSchema.CustomerProfileDataModelUpdateArgs): ReturnType<ICustomerProfileRepo['updateCustomer']> {
        return db.dataBase.customerProfileDataModel.update(payload);
    }
    async deleteCustomer(payload: DataBaseSchema.CustomerProfileDataModelDeleteArgs): Promise<boolean> {
        await db.dataBase.customerProfileDataModel.delete(payload);
        return true;
    }
    async findCustomer(payload: DataBaseSchema.CustomerProfileDataModelFindUniqueArgs): ReturnType<ICustomerProfileRepo['findCustomer']> {
        const data = await db.dataBase.customerProfileDataModel.findUnique(payload);
        if (!data) {
            throw new AppError("User does not exist.");
        }
        return data;
    }

    findManyCustomer(payload: DataBaseSchema.CustomerProfileDataModelFindManyArgs): ReturnType<ICustomerProfileRepo['findManyCustomer']> {
        return db.dataBase.customerProfileDataModel.findMany(payload);
    }

}