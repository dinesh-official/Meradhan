import { generateTempOrderPdf } from "@packages/kyc-providers";
import { BondService } from "@resource/bonds/bond.service";
import { CustomerProfileRepo } from "@resource/crm/customers/customer.repo";
import { appSchema } from "@root/schema";
import { AppError, HttpStatus } from "@utils/error/AppError";
import { type Request, type Response } from "express";
import { OrderService } from "./order.service";

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
    const orderId = req.query.orderId as string | undefined;

    const parsedItem = appSchema.order.OrderPreviewItemSchema.parse(item);

    const customerId = req.customer?.id;
    if (!customerId) throw new AppError("Unauthorized");

    const result = await this.orderService.createOrder(
      customerId,
      parsedItem,
      orderId
    );

    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: result,
    });
  };

  cancelOrder = async (req: Request, res: Response) => {
    const orderId = req.params.orderId || req.body.orderId;
    if (!orderId) throw new AppError("Order ID is required");

    const result = await this.orderService.cancelOrder(orderId);
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

  setOrderStatus = async (req: Request, res: Response) => {
    const orderId = req.params.orderId;
    const status = req.body.status;
    if (!orderId) throw new AppError("Order ID is required");
    if (!status) throw new AppError("Status is required");

    await this.orderService.updateOrderStatusByOrderNo(orderId, status);
    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: { message: "Order status updated successfully" },
    });
  };

  getOrderPdf = async (req: Request, res: Response) => {
    const repo = new CustomerProfileRepo();
    const bond = new BondService();

    const pdfFile = await generateTempOrderPdf({
      orderId: req.query.orderId as string,
      isReleased: req.query?.isReleased === "true",
      bond: await bond.getBondDetails(req.query.isin as string),
      qun: 1,
      user: await repo.getFullCustomerProfile(req.customer!.id),
    });
    // send the file as response
    res.sendFile(pdfFile, (err) => {
      if (err) {
        console.error("Error sending file:", err);
        res.status(500).send("Error generating PDF");
      }
    });
  };
}
