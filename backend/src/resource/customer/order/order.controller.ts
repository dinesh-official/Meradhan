import { type Request, type Response } from "express";
import { OrderService } from "./order.service";
import { appSchema } from "@root/schema";
import { AppError, HttpStatus } from "@utils/error/AppError";

export class OrderController {
  private orderService = new OrderService();

  previewOrder = async (req: Request, res: Response) => {
    const item = req.body;
    const parsedItem = appSchema.order.OrderPreviewItemSchema.parse(item);
    const result = await this.orderService.previewOrder(parsedItem);
    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: result,
    });
  };

  createOrder = async (req: Request, res: Response) => {
    const item = req.body;
    const parsedItem = appSchema.order.OrderPreviewItemSchema.parse(item);

    const customerId = req.customer?.id;
    if (!customerId) throw new AppError("Unauthorized");

    const result = await this.orderService.createOrder(customerId, parsedItem);
    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: result,
    });
  };

  getOrderHistory = async (req: Request, res: Response) => {
    const customerId = req.customer?.id;
    if (!customerId) throw new AppError("Unauthorized");

    const query = appSchema.order.OrderQuerySchema.parse(req.query);
    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Number(query.limit) : 10;
    const status = query.status;
    const bondType = query.bondType;

    const result = await this.orderService.getOrderHistory(
      customerId,
      page,
      limit,
      status,
      bondType
    );
    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: result,
    });
  };
}
