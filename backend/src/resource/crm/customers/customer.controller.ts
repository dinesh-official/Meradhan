import { appSchema } from "@root/schema";
import { HttpStatus } from "@utils/error/AppError";
import type { Request, Response } from "express";
import { CustomerProfileRepo } from "./customer.repo";
import type { ICustomerControllerInterface, ICustomerProfileServiceInterface } from "./customers.interfcae";
import { CustomerProfileService } from "./customer.service";


export class CustomerProfileController implements ICustomerControllerInterface {
    private profileService: ICustomerProfileServiceInterface
    constructor() {
        const repo = new CustomerProfileRepo()
        this.profileService = new CustomerProfileService(repo)
    }

    async createCustomer(req: Request, res: Response): Promise<void> {
        const id = req.session?.id;
        const payload = appSchema.customer.createNewCustomerSchema.parse(req.body);
        const response = await this.profileService.createCustomerProfile(payload, id)
        res.sendResponse({
            statusCode: HttpStatus.OK,
            responseData: response
        })
    }

    async deleteCustomer(req: Request, res: Response): Promise<void> {
        const customerId = req.params.customerId;
        const response = await this.profileService.removeCustomerProfile(Number(customerId))
        res.sendResponse({
            statusCode: HttpStatus.OK,
            responseData: response
        })
    }

    async updateCustomer(req: Request, res: Response): Promise<void> {
        const customerId = req.params.customerId;
        const payload = appSchema.customer.updateCustomerProfileSchema.parse(req.body);
        const response = await this.profileService.updateCustomerProfile(Number(customerId), payload)
        res.sendResponse({
            statusCode: HttpStatus.OK,
            responseData: response
        })
    }


    async filterCustomer(req: Request, res: Response): Promise<void> {
        const payload = appSchema.customer.findManyCustomerSchema.parse(req.query);
        const response = await this.profileService.filterCustomers(payload);
        res.sendResponse({
            statusCode: HttpStatus.OK,
            responseData: response
        })
    }

    async getCustomer(req: Request, res: Response): Promise<void> {
        const customerId = req.params.customerId;
        const response = await this.profileService.getCustomerProfile(Number(customerId))
        res.sendResponse({
            statusCode: HttpStatus.OK,
            responseData: response
        })
    }

    async getFullProfileCustomer(req: Request, res: Response): Promise<void> {
        const customerId = req.params.customerId;
        
        const response = await this.profileService.getFullCustomerProfile(Number(customerId))
        res.sendResponse({
            statusCode: HttpStatus.OK,
            responseData: response
        })
    }

}