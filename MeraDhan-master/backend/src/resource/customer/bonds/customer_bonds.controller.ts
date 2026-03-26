import { type Request, type Response } from "express";
import { CustomerBondsService } from "./customer_bonds.service";
import { AppError, HttpStatus } from "@utils/error/AppError";

export class CustomerBondsController {
  private customerBondsService = new CustomerBondsService();

  getCustomerBonds = async (req: Request, res: Response) => {
    const customerId = req.customer?.id;
    if (!customerId) throw new AppError("Unauthorized");

    const result = await this.customerBondsService.getCustomerBonds(customerId);
    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: result,
    });
  };
}

