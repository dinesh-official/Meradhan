import { appSchema } from "@root/schema";
import { AppError, HttpStatus } from "@utils/error/AppError";
import { type Request, type Response } from "express";
import { OrderService } from "./order.service";
import { OrderPdfService } from "./order-pdf.service";
import { db } from "@core/database/database";
import { AppConfigService } from "@resource/app-config/app-config.service";
import { CrmOrdersService } from "@resource/crm/orders/orders.service";

export class OrderController {
  private orderService = new OrderService();
  private orderPdfService = new OrderPdfService();
  private appConfigService = new AppConfigService();
  private crmOrdersService = new CrmOrdersService();

  getPaymentGatewayMode = async (_req: Request, res: Response) => {
    const paymentGatewayMode =
      await this.appConfigService.getPaymentGatewayMode();
    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: { paymentGatewayMode },
    });
  };

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

    await this.orderService.updateOrderStatusByOrderNo(
      orderId.toString(),
      status
    );
    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: { message: "Order status updated successfully" },
    });
  };

  downloadOrderReceiptPdf = async (req: Request, res: Response) => {
    const customerId = req.customer?.id;
    if (!customerId) throw new AppError("Unauthorized");

    const p = req.params.orderNumber;
    const orderNumber = String(Array.isArray(p) ? p[0] : p ?? "").trim();
    if (!orderNumber) {
      throw new AppError("Order number is required", {
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const order = await db.dataBase.order.findFirst({
      where: { orderNumber, customerProfileId: customerId },
      select: { orderNumber: true },
    });
    if (!order) {
      throw new AppError("Order not found", { statusCode: HttpStatus.NOT_FOUND });
    }

    try {
      const pdfQuery = req.query as Record<string, string | undefined>;
      const { buffer, filename } =
        await this.crmOrdersService.generateOrderReceiptPdfBuffer(
          order.orderNumber,
          pdfQuery,
        );
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename.replace(/"/g, "")}"`,
      );
      return res.send(buffer);
    } catch (err) {
      console.error("Customer order receipt PDF failed:", err);
      if (err instanceof AppError) {
        return res.status(err.statusCode).json({
          status: false,
          message: err.message,
          code: err.code,
        });
      }
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: false,
        message:
          err instanceof Error ? err.message : "Failed to generate order receipt PDF",
      });
    }
  };

  downloadDealSheetPdf = async (req: Request, res: Response) => {
    const customerId = req.customer?.id;
    if (!customerId) throw new AppError("Unauthorized");

    const p = req.params.orderNumber;
    const orderNumber = String(Array.isArray(p) ? p[0] : p ?? "").trim();
    if (!orderNumber) {
      throw new AppError("Order number is required", {
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const order = await db.dataBase.order.findFirst({
      where: { orderNumber, customerProfileId: customerId },
      select: { orderNumber: true },
    });
    if (!order) {
      throw new AppError("Order not found", { statusCode: HttpStatus.NOT_FOUND });
    }

    try {
      const pdfQuery = req.query as Record<string, string | undefined>;
      const { buffer, filename } =
        await this.crmOrdersService.generateDealSheetPdfBuffer(
          order.orderNumber,
          pdfQuery,
        );
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename.replace(/"/g, "")}"`,
      );
      return res.send(buffer);
    } catch (err) {
      console.error("Customer deal sheet PDF failed:", err);
      if (err instanceof AppError) {
        return res.status(err.statusCode).json({
          status: false,
          message: err.message,
          code: err.code,
        });
      }
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: false,
        message:
          err instanceof Error ? err.message : "Failed to generate deal sheet PDF",
      });
    }
  };

  getOrderPdf = async (req: Request, res: Response) => {
    const customerId = req.customer!.id;
    const isin = req.query.isin as string;
    const orderId = req.query.orderId as string | undefined;
    const rawQun = req.query.qun ? Number(req.query.qun) : 1;

    const pdfFile = await this.orderPdfService.generateTempOrderPdfFile({
      userId: customerId,
      isin,
      qun: rawQun,
      orderId,
      isReleased: req.query?.isReleased === "true",
    });

    res.sendFile(pdfFile, (err) => {
      if (err) {
        console.error("Error sending file:", err);
        res.status(500).send("Error generating PDF");
      }
    });
  };

  addOrderLog = async (req: Request, res: Response) => {
    const customerId = req.customer?.id;
    if (!customerId) throw new AppError("Unauthorized");

    const { orderId, step, status, outputData, details } = req.body;

    if (!orderId || !step || !status) {
      throw new AppError("Order ID, step, and status are required");
    }

    // Get order by orderNumber to find the order ID
    const order = await db.dataBase.order.findUnique({
      where: { orderNumber: orderId },
      select: { id: true, customerProfileId: true },
    });

    // If order doesn't exist yet (e.g., user is still on place-order page),
    // silently return success - we'll track activities once order is created
    if (!order) {
      return res.sendResponse({
        statusCode: HttpStatus.OK,
        message: "Order log queued (order not yet created)",
        responseData: { success: true, queued: true },
      });
    }

    // Verify the order belongs to the customer
    if (order.customerProfileId !== customerId) {
      throw new AppError("Unauthorized");
    }

    await this.orderService.addOrderLog(
      order.id,
      step,
      status,
      outputData,
      details
    );

    return res.sendResponse({
      statusCode: HttpStatus.OK,
      message: "Order log added successfully",
      responseData: { success: true },
    });
  };
}
