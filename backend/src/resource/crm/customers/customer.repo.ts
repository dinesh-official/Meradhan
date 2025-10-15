import { db, type DataBaseSchema } from "@core/database/database";
import { fullCustomerProfileSelect } from "@lib/manager/customer/customermanager.interface";
import { AppError } from "@utils/error/AppError";
import { type ICustomerProfileRepo } from "./customers.interfcae";



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

    countCustomers(payload: DataBaseSchema.CustomerProfileDataModelCountArgs): ReturnType<ICustomerProfileRepo['countCustomers']> {
        return db.dataBase.customerProfileDataModel.count(payload);
    }

    async getFullCustomerProfile(customerId: number): ReturnType<ICustomerProfileRepo['getFullCustomerProfile']> {
        const user = await db.dataBase.customerProfileDataModel.findUnique({
            where: {
                id: customerId
            },
            select: fullCustomerProfileSelect
        });
        if (!user) {
            throw new AppError("User Not Found", { code: "USER_NOT_FOUND", statusCode: 404 })
        }
        return user;
    }
}