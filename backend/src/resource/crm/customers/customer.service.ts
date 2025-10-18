import type { DataBaseSchema } from "@core/database/database";
import { CustomerProfileManager } from "@lib/manager/customer/customer.manager";
import { type ICustomerProfileManagerInterface } from "@lib/manager/customer/customermanager.interface";
import type { appSchema } from "@root/schema";
import type z from "zod";
import type { ICustomerProfileRepo, ICustomerProfileServiceInterface } from "./customers.interfcae";



export class CustomerProfileService extends CustomerProfileManager implements ICustomerProfileServiceInterface {

    constructor(private customerRepo: ICustomerProfileRepo) {
        super();
    }

    getProfile(value: string | number): ReturnType<ICustomerProfileManagerInterface["getCustomerProfile"]> {
        if (typeof value === "number" || /^\d+$/.test(value.toString())) {
            // Numeric → likely an ID
            return this.getCustomerProfile(Number(value));
        }

        if (value.includes("@")) {
            // Contains @ → email
            return this.getCustomerProfileByEmail(value);
        }

        // Default fallback → username
        return this.getCustomerProfileByUsername(value);
    }



    async filterCustomers(payload: z.infer<typeof appSchema.customer.findManyCustomerSchema>): ReturnType<ICustomerProfileServiceInterface['filterCustomers']> {
        const page = Number(payload.page) || 1;
        const pageSize = 10; // You can make this configurable if needed
        const skip = (page - 1) * pageSize;
        const filters: DataBaseSchema.CustomerProfileDataModelWhereInput = {};

        if (payload.accountStatus) {
            filters.utility = {
                accountStatus: {
                    equals: payload.accountStatus
                }
            }
        }

        if (payload.kycStatus) {
            filters.kycStatus = {
                equals: payload.kycStatus
            }
        }

        if (payload.search) {
            filters.OR = [
                { firstName: { contains: payload.search, mode: "insensitive" } },
                { middleName: { contains: payload.search, mode: "insensitive" } },
                { lastName: { contains: payload.search, mode: "insensitive" } },
                { emailAddress: { contains: payload.search, mode: "insensitive" } },
                { userName: { contains: payload.search, mode: "insensitive" } },
                { phoneNo: { contains: payload.search, mode: "insensitive" } },
            ];
        }


        const total = await this.customerRepo.countCustomers({ where: filters });

        // Fetch paginated users
        const data = await this.customerRepo.findManyCustomer({
            where: filters,
            skip,
            take: pageSize,
            select: {
                userName: true,
                id: true,
                firstName: true,
                middleName: true,
                lastName: true,
                emailAddress: true,
                phoneNo: true,
                VerifiedBy: true,
                verifyDate: true,

                panCard: {
                    select: {
                        panCardNo: true,

                    }
                },
                kycStatus: true,
                utility: {
                    select: {
                        accountStatus: true,
                        lastLogin: true,
                    }
                },
                createdAt: true,
                updatedAt: true,
                createdBy: true,
            }
        });

        return {
            data,
            meta: {
                total,
                page,
                pageSize,
                totalPages: Math.ceil(total / pageSize),
            },
        };

    }

    getFullCustomerProfile(customerId: number): ReturnType<ICustomerProfileServiceInterface["getFullCustomerProfile"]> {
        return this.customerRepo.getFullCustomerProfile(customerId);
    }
}