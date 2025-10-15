import type { CustomerProfileDataModel, DataBaseSchema } from "@core/database/database"
import type { fullCustomerProfileSelect, ICustomerProfileManagerInterface } from "@lib/manager/customer/customermanager.interface"
import type { appSchema } from "@root/schema"
import type { Request, Response } from "express"
import type z from "zod"
import type { META_DATA_PAGINATION } from "../../../../types/metadata"


export interface ICustomerProfileRepo {
    findCustomer(payload: DataBaseSchema.CustomerProfileDataModelFindUniqueArgs): Promise<CustomerProfileDataModel>,
    findManyCustomer(payload: DataBaseSchema.CustomerProfileDataModelFindManyArgs): Promise<CustomerProfileDataModel[]>,
    createNewCustomer(payload: DataBaseSchema.CustomerProfileDataModelCreateArgs): Promise<CustomerProfileDataModel>,
    updateCustomer(payload: DataBaseSchema.CustomerProfileDataModelUpdateArgs): Promise<CustomerProfileDataModel>,
    deleteCustomer(payload: DataBaseSchema.CustomerProfileDataModelDeleteArgs): Promise<boolean>,
    countCustomers(payload: DataBaseSchema.CustomerProfileDataModelCountArgs): Promise<number>
    getFullCustomerProfile(customerId: number): Promise<DataBaseSchema.CustomerProfileDataModelGetPayload<{ select: typeof fullCustomerProfileSelect }>>,
}

export interface ICustomerProfileServiceInterface extends ICustomerProfileManagerInterface {
    getProfile(value: string | number): ReturnType<ICustomerProfileManagerInterface['getCustomerProfile']>
    getFullCustomerProfile(customerId: number): ReturnType<ICustomerProfileRepo['getFullCustomerProfile']>,

    filterCustomers(payload: z.infer<typeof appSchema.customer.findManyCustomerSchema>): Promise<{
        data: Awaited<ReturnType<ICustomerProfileRepo['findManyCustomer']>>,
        meta: META_DATA_PAGINATION
    }>

}

export interface ICustomerControllerInterface {
    createCustomer(req: Request, res: Response): Promise<void>
    updateCustomer(req: Request, res: Response): Promise<void>
    deleteCustomer(req: Request, res: Response): Promise<void>
    filterCustomer(req: Request, res: Response): Promise<void>
    getCustomer(req: Request, res: Response): Promise<void>
    getFullProfileCustomer(req: Request, res: Response): Promise<void>

}
