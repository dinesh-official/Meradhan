import { type Request, type Response } from "express";
import { CrmOrdersService } from "./orders.service";
import { appSchema } from "@root/schema";
import { HttpStatus } from "@utils/error/AppError";
import { OrderStatus } from "@databases/generated/prisma/postgres";
import { createCrmActivityLog } from "@resource/crm/auditlogs/auditlog.repo";

export class CrmOrdersController {
  private ordersService = new CrmOrdersService();

  getAllOrders = async (req: Request, res: Response) => {
    const query = appSchema.crm.orders.CrmOrdersQuerySchema.parse(req.query);
    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Number(query.limit) : 10;
    const status = query.status;
    const bondType = query.bondType;
    const search = query.search;
    const date = query.date;

    const result = await this.ordersService.getAllOrders(
      page,
      limit,
      status,
      bondType,
      search,
      date
    );

    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: result,
    });
  };

  getOrderById = async (req: Request, res: Response) => {
    try {
      const orderId = Number(req.params.id);
      if (!orderId || isNaN(orderId)) {
        return res.sendResponse({
          statusCode: HttpStatus.BAD_REQUEST,
          message: "Invalid order ID",
        });
      }

      const order = await this.ordersService.getOrderById(orderId);

      return res.sendResponse({
        statusCode: HttpStatus.OK,
        responseData: order,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Order not found";
      return res.sendResponse({
        statusCode: HttpStatus.NOT_FOUND,
        message,
      });
    }
  };

  updateOrderStatus = async (req: Request, res: Response) => {
    try {
      const orderId = Number(req.params.id);
      if (!orderId || isNaN(orderId)) {
        return res.sendResponse({
          statusCode: HttpStatus.BAD_REQUEST,
          message: "Invalid order ID",
        });
      }

      const { status } = req.body;
      if (!status) {
        return res.sendResponse({
          statusCode: HttpStatus.BAD_REQUEST,
          message: "Status is required",
        });
      }

      const validStatuses = ["PENDING", "SETTLED", "APPLIED", "REJECTED"];
      if (!validStatuses.includes(status)) {
        return res.sendResponse({
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        });
      }

      const updatedOrder = await this.ordersService.updateOrderStatus(
        orderId,
        status as OrderStatus
      );

      await createCrmActivityLog(req, {
        userId: Number(req.session?.id),
        action: "ORDER_STATUS_UPDATE",
        details: {
          Reason: "Order status updated",
          OrderId: orderId,
          OrderNumber: updatedOrder.orderNumber,
          Status: status,
        },
        entityType: "rfq",
        entityId: String(orderId),
      });

      return res.sendResponse({
        statusCode: HttpStatus.OK,
        message: "Order status updated successfully",
        responseData: updatedOrder,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update order status";
      return res.sendResponse({
        statusCode: errorMessage.includes("not found")
          ? HttpStatus.NOT_FOUND
          : HttpStatus.INTERNAL_SERVER_ERROR,
        message: errorMessage,
      });
    }
  };
}
