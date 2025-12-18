import { db } from "@core/database/database";

export class TrashService {

    async getAllTrashCustomers() {
        const trashedCustomers = await db.dataBase.customerProfileDataModel.findMany({
            where: {
                isDeleted: true
            }
        });
        return trashedCustomers;
    }

    async restoreCustomer(customerId: number) {
        const existing = await db.dataBase.customerProfileDataModel.findUnique({
            where: { id: customerId, isDeleted: true },
        });

        if (!existing) {
            throw new Error(`Customer with ID ${customerId} not found in trash`);
        }

        await db.dataBase.customerProfileDataModel.update({
            where: { id: customerId },
            data: {
                isDeleted: false,
            },
        });

        return true; // we can change this
    }

    async deleteCustomerPermanently(customerId: number) {
        const existing = await db.dataBase.customerProfileDataModel.findUnique({
            where: { id: customerId, isDeleted: true },
        });

        if (!existing) {
            throw new Error(`Customer with ID ${customerId} not found in trash`);
        }

        await db.dataBase.customerProfileDataModel.delete({
            where: { id: customerId },
        });

        return true; // we can change this
    }

}
