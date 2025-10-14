import type { Request, Response } from "express"
import type { ICrmUserService } from "./crmusers.service"
import { appSchema } from "@root/schema"
import { HttpStatus } from "@utils/error/AppError"

export interface ICrmUserController {
    findUser(req: Request, res: Response): Promise<void>
    findManyUser(req: Request, res: Response): Promise<void>
    createNewUser(req: Request, res: Response): Promise<void>
    updateUser(req: Request, res: Response): Promise<void>
    deleteUser(req: Request, res: Response): Promise<void>
}

export class CrmUserController implements ICrmUserController {
    constructor(private crmUserService: ICrmUserService) { }

    async createNewUser(req: Request, res: Response): Promise<void> {
        const createBy = req.session!.id;
        const data = appSchema.crm.user.createCRMUserSchema.parse(req.body)
        const response = await this.crmUserService.createNewUser(data, createBy)
        res.sendResponse({
            statusCode: HttpStatus.OK,
            message: "new user created successfully",
            responseData: response
        })
    }


    async updateUser(req: Request, res: Response): Promise<void> {
        const id = req.params!.id;
        const data = appSchema.crm.user.updateUserSchema.parse(req.body)
        const response = await this.crmUserService.updateUser(Number(id), data)
        res.sendResponse({
            statusCode: HttpStatus.OK,
            message: "new user update successfully",
            responseData: response
        })
    }

    async findUser(req: Request, res: Response): Promise<void> {
        const id = req.params!.id;
        const response = await this.crmUserService.findUser(Number(id))
        res.sendResponse({
            statusCode: HttpStatus.OK,
            responseData: response
        })
    }

    async deleteUser(req: Request, res: Response): Promise<void> {
        const id = req.params!.id;
        const response = await this.crmUserService.deleteUser(Number(id))
        res.sendResponse({
            statusCode: HttpStatus.OK,
            message: "Account Delete successfully",
            responseData: response
        })
    }

    async findManyUser(req: Request, res: Response): Promise<void> {
        const filters = appSchema.crm.user.findManyUserSchema.parse(req.query)
        const response = await this.crmUserService.findManyUser(filters)
        res.sendResponse({
            statusCode: HttpStatus.OK,
            responseData: response
        })
    }

}