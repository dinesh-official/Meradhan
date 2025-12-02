import { type Request, type Response } from "express";
import { CrmOrdersService } from "./orders.service";
import { appSchema } from "@root/schema";
import { HttpStatus } from "@utils/error/AppError";

export class CrmOrdersController {
  private ordersService = new CrmOrdersService();

  getAllOrders = async (req: Request, res: Response) => {
    const query = appSchema.crm.orders.CrmOrdersQuerySchema.parse(req.query);
    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Number(query.limit) : 10;
    const status = query.status;
    const bondType = query.bondType;
    const search = query.search;
    const startDate = query.startDate;
    const endDate = query.endDate;

    const result = await this.ordersService.getAllOrders(
      page,
      limit,
      status,
      bondType,
      search,
      startDate,
      endDate
    );

    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: result,
    });
  };
}
