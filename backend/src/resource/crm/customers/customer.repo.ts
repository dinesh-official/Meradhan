import { db, type DataBaseSchema } from "@core/database/database";
import { fullCustomerProfileSelect } from "@services/customer/customer_manager_selector";

import { AppError } from "@utils/error/AppError";



export class CustomerProfileRepo {
    createNewCustomer(payload: DataBaseSchema.CustomerProfileDataModelCreateArgs) {
        return db.dataBase.customerProfileDataModel.create(payload);
    }
    updateCustomer(payload: DataBaseSchema.CustomerProfileDataModelUpdateArgs) {
        return db.dataBase.customerProfileDataModel.update(payload);
    }
    async deleteCustomer(payload: DataBaseSchema.CustomerProfileDataModelDeleteArgs): Promise<boolean> {
        await db.dataBase.customerProfileDataModel.delete(payload);
        return true;
    }
    async findCustomer(payload: DataBaseSchema.CustomerProfileDataModelFindUniqueArgs) {
        const data = await db.dataBase.customerProfileDataModel.findUnique(payload);
        if (!data) {
            throw new AppError("User does not exist.");
        }
        return data;
    }

    findManyCustomer(payload: DataBaseSchema.CustomerProfileDataModelFindManyArgs) {
        return db.dataBase.customerProfileDataModel.findMany(payload);
    }

    countCustomers(payload: DataBaseSchema.CustomerProfileDataModelCountArgs) {
        return db.dataBase.customerProfileDataModel.count(payload);
    }

    async getFullCustomerProfile(customerId: number) {
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