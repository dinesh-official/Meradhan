import { generateTempOrderPdf } from "@packages/kyc-providers";
import { BondService } from "@resource/bonds/bond.service";
import { CustomerProfileRepo } from "@resource/crm/customers/customer.repo";
import { appSchema } from "@root/schema";
import { computeBondOrderPricingData } from "@services/order/order-pricing-helper";
import { AppError, HttpStatus } from "@utils/error/AppError";
import { type Request, type Response } from "express";
import { OrderService } from "./order.service";
import { db } from "@core/database/database";

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

    await this.orderService.updateOrderStatusByOrderNo(
      orderId.toString(),
      status
    );
    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: { message: "Order status updated successfully" },
    });
  };

  getOrderPdf = async (req: Request, res: Response) => {
    const repo = new CustomerProfileRepo();
    const bondService = new BondService();

    const isin = req.query.isin as string;
    const orderId = req.query.orderId as string || "XXXXXXXX";
    const rawQun = req.query.qun ? Number(req.query.qun) : 1;
    const quantity =
      Number.isFinite(rawQun) && rawQun > 0 ? rawQun : 1;

    const bond = await bondService.getBondDetails(isin);
    if (!bond) {
      throw new AppError("Bond not found", {
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    const lastCouponDateStr = bond.lastCouponDate;
    const nextCouponDateStr = bond.nextCouponDate;

    if (!lastCouponDateStr || !nextCouponDateStr) {
      throw new AppError(
        "Bond is missing lastCouponDate or nextCouponDate required for order pricing",
        { statusCode: HttpStatus.BAD_REQUEST }
      );
    }

    const cleanPrice = bond.sellPrice;

    const recordDays =
      typeof bond.recordDays === "number" && !Number.isNaN(bond.recordDays)
        ? bond.recordDays
        : 7;

    const pricing = computeBondOrderPricingData({
      faceValue: bond.faceValue,
      quantity,
      cleanPrice: cleanPrice ?? 0,
      couponRate: Number(bond.couponRate),
      lastCouponDate: lastCouponDateStr.toISOString(),
      recordDays,
      nextCouponDate: nextCouponDateStr.toISOString(),
    });

    const orderData = {
      price: pricing.cleanPrice,
      subTotal: pricing.principalAmount,
      stampDuty: pricing.stampDuty,
      totalAmount: pricing.principalAmount + pricing.accruedInterest,
      metadata: {
        valueDate: pricing.dealDate,
        accruedInterest: pricing.accruedInterest,
        accruedInterestDays: pricing.noOfAccrualDays,
        settlementDate: pricing.settlementDate,
        orderType: "One to One (OTO) on RFQ Platform of the Exchange",
      },
    };

    const pdfFile = await generateTempOrderPdf({
      orderId,
      isReleased: req.query?.isReleased === "true",
      bond,
      qun: quantity,
      user: await repo.getFullCustomerProfile(req.customer!.id),
      orderData,
    });
    // send the file as response
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
