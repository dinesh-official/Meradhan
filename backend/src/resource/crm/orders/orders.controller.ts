import { type Request, type Response } from "express";
import { CrmOrdersService } from "./orders.service";
import { appSchema } from "@root/schema";
import { HttpStatus } from "@utils/error/AppError";
import { OrderStatus } from "@databases/generated/prisma/postgres";
import { createCrmActivityLog } from "@resource/crm/auditlogs/auditlog.repo";
import { CustomerProfileRepo } from "@resource/crm/customers/customer.repo";
import { BondService } from "@resource/bonds/bond.service";
import {
  generateDealPdfBuffer,
  generateOrderPdfBuffer,
  getInterestPaymentSchedule,
} from "kyc-providers";
import { fetchBankNameFromIfsc } from "@utils/razorpayIfsc";
import { getDpName } from "dp-id-lookup";
import { db } from "@core/database/database";
import { EmailCommunication } from "@communication/email_communication";

/** Parse modSettleDate (e.g. DDMMYYYY or ISO) to ISO string for PDF Order Date & Time */
function parseSettlementDateToISO(modSettleDate: string): string | null {
  const s = String(modSettleDate).trim();
  if (!s) return null;
  const digitsOnly = s.replace(/\D/g, "");
  if (digitsOnly.length === 8) {
    const dd = digitsOnly.slice(0, 2);
    const mm = digitsOnly.slice(2, 4);
    const yyyy = digitsOnly.slice(4, 8);
    const d = new Date(`${yyyy}-${mm}-${dd}T12:00:00.000Z`);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

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

  getRfqByOrderNumber = async (req: Request, res: Response) => {
    const orderNumber = req.params.orderNumber;
    if (!orderNumber) {
      return res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Order number is required",
      });
    }
    const rfq = await this.ordersService.getRfqByOrderNumber(orderNumber as string);
    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: rfq,
    });
  };

  createOrderFromRfq = async (req: Request, res: Response) => {
    const orderNumber = req.body.orderNumber;
    const customerId = req.body.customerId != null ? Number(req.body.customerId) : undefined;
    if (!orderNumber || customerId == null || isNaN(customerId)) {
      return res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Order number and customer ID are required",
      });
    }
    try {
      const order = await this.ordersService.createOrderFromRfq(orderNumber as string, customerId);
      return res.sendResponse({
        statusCode: HttpStatus.OK,
        responseData: order,
      });
    } catch (error: unknown) {
      return res.sendResponse({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error instanceof Error ? error.message : "Failed to create order",
      });
    }
  };

  getCustomerFullOrder = async (req: Request, res: Response) => {
    const orderNumber = req.params.orderNumber;
    if (!orderNumber) {
      return res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Order number is required",
      });
    }
    const order = await this.ordersService.getCustomerByOrderNumber(orderNumber as string);
    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: order ?? null,
    });
  };

  getOrderReceiptPdf = async (req: Request, res: Response) => {
    const orderNumber = req.params.orderNumber as string;
    if (!orderNumber) {
      return res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Order number is required",
      });
    }
    try {
      const order = await this.ordersService.getCustomerByOrderNumber(orderNumber);
      if (!order) {
        return res.sendResponse({
          statusCode: HttpStatus.NOT_FOUND,
          message: "No order found for this settlement. Assign a customer first.",
        });
      }
      const customerRepo = new CustomerProfileRepo();
      const bondService = new BondService();
      const user = await customerRepo.getFullCustomerProfile(order.customerProfileId);
      const bond = await bondService.getBondDetails(order.isin);
      if (!bond) {
        return res.sendResponse({
          statusCode: HttpStatus.NOT_FOUND,
          message: `Bond not found for ISIN: ${order.isin}`,
        });
      }
      const settleOrder = await this.ordersService.getRfqByOrderNumber(orderNumber);
      const negotation = await db.dataBase.rFQNegotiation.findFirst({
        where: {
          tradeNumber: settleOrder?.orderNumber,
        },
      });
      const rfqDetails = await db.dataBase.rFQMasterISIN.findFirst({
        where: {
          number: negotation?.rfqNumber
        },
      });
      const metadata = (order.metadata as Record<string, unknown> | null) ?? {};
      const orderDateForPdf: Date = new Date(`${rfqDetails?.date} ${rfqDetails?.quoteTime ?? "12:00:00"}`.trim());
      const [bankName, dpName] = await Promise.all([
        settleOrder?.ifscCode
          ? fetchBankNameFromIfsc(settleOrder.ifscCode)
          : Promise.resolve(null),
        settleOrder?.dpId ? Promise.resolve(getDpName(settleOrder.dpId)) : Promise.resolve(undefined),
      ]);


      const accessType: Record<string, string> = {
        "1": `One to Many (OTM) on RFQ Platform of the Exchange`,
        "2": `One to One (OTO) on RFQ Platform of the Exchange`,
        "3": `Inter Scheme Transfer (IST) on RFQ Platform of the Exchange`,
      };
      const accessKey = rfqDetails?.access != null ? String(rfqDetails.access) : undefined;
      const accessTypeText = accessKey ? accessType[accessKey] : undefined;

      const orderDateForSchedule = orderDateForPdf ? new Date(orderDateForPdf) : new Date();
      const interestSchedule = getInterestPaymentSchedule({
        orderDate: orderDateForSchedule,
        maturityDate: bond.maturityDate ?? null,
        interestPaymentFrequency: bond.interestPaymentFrequency,
        paymentDayOfMonth: 20,
        nextCouponDate:
          bond.nextCouponDate != null && String(bond.nextCouponDate).trim() !== ""
            ? new Date(bond.nextCouponDate)
            : undefined,
      });

      const pdfQuery = req.query as Record<string, string | undefined>;
      const accruedInterestDaysParam = pdfQuery.accruedInterestDays != null ? Number(pdfQuery.accruedInterestDays) : undefined;
      const settlementNumberParam = typeof pdfQuery.settlementNumber === "string" && pdfQuery.settlementNumber.trim() !== ""
        ? pdfQuery.settlementNumber.trim()
        : undefined;
      const settlementDateTimeParam = typeof pdfQuery.settlementDateTime === "string" && pdfQuery.settlementDateTime.trim() !== ""
        ? pdfQuery.settlementDateTime.trim()
        : undefined;
      const lastInterestPaymentDateParam = typeof pdfQuery.lastInterestPaymentDate === "string" && pdfQuery.lastInterestPaymentDate.trim() !== ""
        ? pdfQuery.lastInterestPaymentDate.trim()
        : undefined;
      const interestPaymentDatesParam =
        typeof pdfQuery.interestPaymentDates === "string" && pdfQuery.interestPaymentDates.trim() !== ""
          ? pdfQuery.interestPaymentDates
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
          : undefined;
      const nonAmortizedBondParam = pdfQuery.nonAmortizedBond === "false" ? false : true;
      const amortizedPrincipalPaymentDatesParam =
        typeof pdfQuery.amortizedPrincipalPaymentDates === "string" && pdfQuery.amortizedPrincipalPaymentDates.trim() !== ""
          ? pdfQuery.amortizedPrincipalPaymentDates.trim()
          : undefined;

      const buffer = await generateOrderPdfBuffer({
        user,

        orderId: order.orderNumber,
        bond,
        qun:
          settleOrder?.modQuantity != null
            ? Number(settleOrder.modQuantity)
            : order.quantity,
        isReleased: true,
        orderData: {
          createdAt: orderDateForPdf.toISOString(),
          subTotal:
            settleOrder?.value != null
              ? Number(settleOrder.value)
              : Number(order.totalAmount),
          stampDuty:
            settleOrder?.stampDutyAmount != null
              ? Number(settleOrder.stampDutyAmount)
              : Number(order.stampDuty),
          totalAmount:
            settleOrder?.modConsideration != null
              ? Number(settleOrder.modConsideration)
              : Number(order.totalAmount),
          price: Number(settleOrder?.price ?? 0),
          metadata: {
            dealId: (metadata.dealId as string) ?? undefined,
            rfqNumber: (metadata.rfqNumber as string) ?? undefined,
            orderType: accessTypeText ?? "One To One (OTO) on RFQ Platform of the Exchange",
            interestPaymentDates:
              interestPaymentDatesParam?.length
                ? interestPaymentDatesParam
                : interestSchedule.dates.length > 0
                  ? interestSchedule.dates
                  : undefined,
            interestPaymentFrequencyLabel: interestSchedule.frequencyLabel,
            settlementOrderNumber: negotation?.rfqNumber ?? settleOrder?.orderNumber ?? undefined,
            settlementDate: orderDateForPdf,
            valueDate: bond.maturityDate
              ? new Date(bond.maturityDate).toISOString()
              : undefined,
            accruedInterest: settleOrder?.modAccrInt != null ? Number(settleOrder.modAccrInt) : undefined,
            accruedInterestDays: accruedInterestDaysParam,
            settlementNumber: settlementNumberParam ?? (settleOrder as { settlementNo?: string } | undefined)?.settlementNo,
            settlementDateTime: settlementDateTimeParam,
            lastInterestPaymentDate: lastInterestPaymentDateParam,
            nonAmortizedBond: nonAmortizedBondParam,
            amortizedPrincipalPaymentDates: amortizedPrincipalPaymentDatesParam,
            settlementBank: settleOrder
              ? {
                bankName: bankName ?? undefined,
                ifscCode: settleOrder.ifscCode ?? undefined,
                accountNo: settleOrder.accountNo ?? undefined,
              }
              : undefined,
            settlementDemat: settleOrder
              ? {
                dpName: dpName ?? undefined,
                dpId: settleOrder.dpId ?? undefined,
                benId: settleOrder.benId ?? undefined,
              }
              : undefined,
            settleOrder: settleOrder
              ? {
                id: settleOrder.id,
                orderNumber: settleOrder.orderNumber,
                symbol: settleOrder.symbol,
                buySell: negotation?.buySell,
                buyParticipantLoginId: settleOrder.buyParticipantLoginId,
                sellParticipantLoginId: settleOrder.sellParticipantLoginId,
                buyerRefNo: settleOrder.buyerRefNo,
                sellerRefNo: settleOrder.sellerRefNo,
                buyBackofficeLoginId: settleOrder.buyBackofficeLoginId,
                sellBackofficeLoginId: settleOrder.sellBackofficeLoginId,
                buyBrokerLoginId: settleOrder.buyBrokerLoginId,
                sellBrokerLoginId: settleOrder.sellBrokerLoginId,
                source: settleOrder.source,
                modSettleDate: settleOrder.modSettleDate,
                modQuantity: settleOrder.modQuantity,
                modAccrInt: settleOrder.modAccrInt,
                modConsideration: settleOrder.modConsideration,
                settlementNo: settleOrder.settlementNo,
                stampDutyAmount: settleOrder.stampDutyAmount,
                stampDutyBearer: settleOrder.stampDutyBearer,
                buyerFundPayinObligation: settleOrder.buyerFundPayinObligation,
                sellerFundPayoutObligation: settleOrder.sellerFundPayoutObligation,
                fundPayinRefId: settleOrder.fundPayinRefId,
                settleStatus: settleOrder.settleStatus,
                secPayinQuantity: settleOrder.secPayinQuantity,
                secPayinRemarks: settleOrder.secPayinRemarks,
                secPayinTime: settleOrder.secPayinTime,
                fundsPayinAmount: settleOrder.fundsPayinAmount,
                fundsPayinRemarks: settleOrder.fundsPayinRemarks,
                fundsPayinTime: settleOrder.fundsPayinTime,
                payoutRemarks: settleOrder.payoutRemarks,
                payoutTime: settleOrder.payoutTime,
                ifscCode: settleOrder.ifscCode,
                accountNo: settleOrder.accountNo,
                utrNumber: settleOrder.utrNumber,
                dpId: settleOrder.dpId,
                benId: settleOrder.benId,
              }
              : undefined,
          },
        },
      });
      const filename = `order-receipt-${order.orderNumber}.pdf`;
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (err) {
      console.error("Order receipt PDF failed:", err);
      return res.sendResponse({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: err instanceof Error ? err.message : "Failed to generate order receipt PDF",
      });
    }
  };

  getDealSheetPdf = async (req: Request, res: Response) => {
    const orderNumber = req.params.orderNumber as string;
    if (!orderNumber) {
      return res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Order number is required",
      });
    }
    try {
      const order = await this.ordersService.getCustomerByOrderNumber(orderNumber);
      if (!order) {
        return res.sendResponse({
          statusCode: HttpStatus.NOT_FOUND,
          message: "No order found for this settlement. Assign a customer first.",
        });
      }
      const customerRepo = new CustomerProfileRepo();
      const bondService = new BondService();
      const user = await customerRepo.getFullCustomerProfile(order.customerProfileId);
      const bond = await bondService.getBondDetails(order.isin);
      if (!bond) {
        return res.sendResponse({
          statusCode: HttpStatus.NOT_FOUND,
          message: `Bond not found for ISIN: ${order.isin}`,
        });
      }
      const settleOrder = await this.ordersService.getRfqByOrderNumber(orderNumber);
      const negotation = await db.dataBase.rFQNegotiation.findFirst({
        where: {
          tradeNumber: settleOrder?.orderNumber,
        },
      });
      const rfqDetails = await db.dataBase.rFQMasterISIN.findFirst({
        where: {
          number: negotation?.rfqNumber,
        },
      });
      const metadata = (order.metadata as Record<string, unknown> | null) ?? {};
      const orderDateForPdf: Date = new Date(`${rfqDetails?.date} ${rfqDetails?.quoteTime ?? "12:00:00"}`.trim());

      const [bankName, dpName] = await Promise.all([
        settleOrder?.ifscCode
          ? fetchBankNameFromIfsc(settleOrder.ifscCode)
          : Promise.resolve(null),
        settleOrder?.dpId
          ? Promise.resolve(getDpName(settleOrder.dpId))
          : Promise.resolve(undefined),
      ]);

      const accessType: Record<string, string> = {
        "1": "One to Many (OTM) on RFQ Platform of the Exchange",
        "2": "One to One (OTO) on RFQ Platform of the Exchange",
        "3": "Inter Scheme Transfer (IST) on RFQ Platform of the Exchange",
      };
      const accessKey =
        rfqDetails?.access != null ? String(rfqDetails.access) : undefined;
      const accessTypeText = accessKey ? accessType[accessKey] : undefined;


      console.log(orderDateForPdf);


      // 06-Nov-2025 12:00:00

      const interestSchedule = getInterestPaymentSchedule({
        orderDate: new Date(`${rfqDetails?.date} ${rfqDetails?.quoteTime ?? "12:00:00"}`.trim()),
        maturityDate: bond.maturityDate ?? null,
        interestPaymentFrequency: bond.interestPaymentFrequency,
        paymentDayOfMonth: 20,
        nextCouponDate:
          bond.nextCouponDate != null &&
            String(bond.nextCouponDate).trim() !== ""
            ? new Date(bond.nextCouponDate)
            : undefined,
      });

      const pdfQuery = req.query as Record<string, string | undefined>;
      const accruedInterestDaysParam =
        pdfQuery.accruedInterestDays != null
          ? Number(pdfQuery.accruedInterestDays)
          : undefined;
      const settlementNumberParam =
        typeof pdfQuery.settlementNumber === "string" &&
          pdfQuery.settlementNumber.trim() !== ""
          ? pdfQuery.settlementNumber.trim()
          : undefined;
      const settlementDateTimeParam =
        typeof pdfQuery.settlementDateTime === "string" &&
          pdfQuery.settlementDateTime.trim() !== ""
          ? pdfQuery.settlementDateTime.trim()
          : undefined;
      const lastInterestPaymentDateParam =
        typeof pdfQuery.lastInterestPaymentDate === "string" &&
          pdfQuery.lastInterestPaymentDate.trim() !== ""
          ? pdfQuery.lastInterestPaymentDate.trim()
          : undefined;
      const interestPaymentDatesParamDeal =
        typeof pdfQuery.interestPaymentDates === "string" &&
          pdfQuery.interestPaymentDates.trim() !== ""
          ? pdfQuery.interestPaymentDates
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined;
      const nonAmortizedBondParamDeal = pdfQuery.nonAmortizedBond === "false" ? false : true;
      const amortizedPrincipalPaymentDatesParamDeal =
        typeof pdfQuery.amortizedPrincipalPaymentDates === "string" && pdfQuery.amortizedPrincipalPaymentDates.trim() !== ""
          ? pdfQuery.amortizedPrincipalPaymentDates.trim()
          : undefined;

      const buffer = await generateDealPdfBuffer({
        user,
        orderId: order.orderNumber,
        bond,
        qun:
          settleOrder?.modQuantity != null
            ? Number(settleOrder.modQuantity)
            : order.quantity,
        isReleased: false,
        orderData: {
          createdAt: orderDateForPdf.toISOString(),
          subTotal:
            settleOrder?.value != null
              ? Number(settleOrder.value)
              : Number(order.totalAmount),
          stampDuty:
            settleOrder?.stampDutyAmount != null
              ? Number(settleOrder.stampDutyAmount)
              : Number(order.stampDuty),
          totalAmount:
            settleOrder?.modConsideration != null
              ? Number(settleOrder.modConsideration)
              : Number(order.totalAmount),
          price: Number(settleOrder?.price ?? 0),
          metadata: {
            dealId: (metadata.dealId as string) ?? undefined,
            rfqNumber: (metadata.rfqNumber as string) ?? undefined,
            orderType:
              accessTypeText ??
              "One To One (OTO) on RFQ Platform of the Exchange",
            interestPaymentDates:
              interestPaymentDatesParamDeal?.length
                ? interestPaymentDatesParamDeal
                : interestSchedule.dates.length > 0
                  ? interestSchedule.dates
                  : undefined,
            interestPaymentFrequencyLabel: interestSchedule.frequencyLabel,
            settlementOrderNumber:
              negotation?.rfqNumber ?? settleOrder?.orderNumber ?? undefined,
            settlementDate: orderDateForPdf,
            valueDate: bond.maturityDate
              ? new Date(bond.maturityDate).toISOString()
              : undefined,
            accruedInterest:
              settleOrder?.modAccrInt != null
                ? Number(settleOrder.modAccrInt)
                : undefined,
            accruedInterestDays: accruedInterestDaysParam,
            settlementNumber:
              settlementNumberParam ??
              (settleOrder as { settlementNo?: string } | undefined)
                ?.settlementNo,
            settlementDateTime: settlementDateTimeParam,
            lastInterestPaymentDate: lastInterestPaymentDateParam,
            nonAmortizedBond: nonAmortizedBondParamDeal,
            amortizedPrincipalPaymentDates: amortizedPrincipalPaymentDatesParamDeal,
            settlementBank: settleOrder
              ? {
                bankName: bankName ?? undefined,
                ifscCode: settleOrder.ifscCode ?? undefined,
                accountNo: settleOrder.accountNo ?? undefined,
              }
              : undefined,
            settlementDemat: settleOrder
              ? {
                dpName: dpName ?? undefined,
                dpId: settleOrder.dpId ?? undefined,
                benId: settleOrder.benId ?? undefined,
              }
              : undefined,
            settleOrder: settleOrder
              ? {
                id: settleOrder.id,
                orderNumber: settleOrder.orderNumber,
                symbol: settleOrder.symbol,
                buySell: negotation?.buySell,
                buyParticipantLoginId: settleOrder.buyParticipantLoginId,
                sellParticipantLoginId: settleOrder.sellParticipantLoginId,
                buyerRefNo: settleOrder.buyerRefNo,
                sellerRefNo: settleOrder.sellerRefNo,
                buyBackofficeLoginId: settleOrder.buyBackofficeLoginId,
                sellBackofficeLoginId: settleOrder.sellBackofficeLoginId,
                buyBrokerLoginId: settleOrder.buyBrokerLoginId,
                sellBrokerLoginId: settleOrder.sellBrokerLoginId,
                source: settleOrder.source,
                modSettleDate: settleOrder.modSettleDate,
                modQuantity: settleOrder.modQuantity,
                modAccrInt: settleOrder.modAccrInt,
                modConsideration: settleOrder.modConsideration,
                settlementNo: settleOrder.settlementNo,
                stampDutyAmount: settleOrder.stampDutyAmount,
                stampDutyBearer: settleOrder.stampDutyBearer,
                buyerFundPayinObligation: settleOrder.buyerFundPayinObligation,
                sellerFundPayoutObligation: settleOrder.sellerFundPayoutObligation,
                fundPayinRefId: settleOrder.fundPayinRefId,
                settleStatus: settleOrder.settleStatus,
                secPayinQuantity: settleOrder.secPayinQuantity,
                secPayinRemarks: settleOrder.secPayinRemarks,
                secPayinTime: settleOrder.secPayinTime,
                fundsPayinAmount: settleOrder.fundsPayinAmount,
                fundsPayinRemarks: settleOrder.fundsPayinRemarks,
                fundsPayinTime: settleOrder.fundsPayinTime,
                payoutRemarks: settleOrder.payoutRemarks,
                payoutTime: settleOrder.payoutTime,
                ifscCode: settleOrder.ifscCode,
                accountNo: settleOrder.accountNo,
                utrNumber: settleOrder.utrNumber,
                dpId: settleOrder.dpId,
                benId: settleOrder.benId,
              }
              : undefined,
          },
        },
      });
      const filename = `deal-sheet-${order.orderNumber}.pdf`;
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );
      res.send(buffer);
    } catch (err) {
      console.error("Deal sheet PDF failed:", err);
      return res.sendResponse({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: err instanceof Error ? err.message : "Failed to generate deal sheet PDF",
      });
    }
  };

  sendPdfEmailToClient = async (req: Request, res: Response) => {
    const orderNumber = req.params.orderNumber as string;
    if (!orderNumber) {
      return res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Order number is required",
      });
    }

    const body = req.body as {
      pdfType?: "order" | "deal";
      subject?: string;
      messageBody?: string;
      toEmail?: string;
      accruedInterestDays?: number | string;
      settlementNumber?: string;
      settlementDateTime?: string;
      lastInterestPaymentDate?: string;
      interestPaymentDates?: string;
      nonAmortizedBond?: boolean;
      amortizedPrincipalPaymentDates?: string;
    };

    const pdfType = body.pdfType;
    if (pdfType !== "order" && pdfType !== "deal") {
      return res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "pdfType must be either 'order' or 'deal'",
      });
    }

    const subject = String(body.subject ?? "").trim();
    const messageBody = String(body.messageBody ?? "").trim();
    const fromEmail = "noreply@meradhan.co";

    if (!subject) {
      return res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Subject is required",
      });
    }
    if (!messageBody) {
      return res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Message body is required",
      });
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    try {
      const order = await this.ordersService.getCustomerByOrderNumber(orderNumber);
      if (!order) {
        return res.sendResponse({
          statusCode: HttpStatus.NOT_FOUND,
          message: "No order found for this settlement. Assign a customer first.",
        });
      }
      const customerRepo = new CustomerProfileRepo();
      const bondService = new BondService();
      const user = await customerRepo.getFullCustomerProfile(order.customerProfileId);
      const bond = await bondService.getBondDetails(order.isin);
      if (!bond) {
        return res.sendResponse({
          statusCode: HttpStatus.NOT_FOUND,
          message: `Bond not found for ISIN: ${order.isin}`,
        });
      }
      const settleOrder = await this.ordersService.getRfqByOrderNumber(orderNumber);
      const negotation = await db.dataBase.rFQNegotiation.findFirst({
        where: {
          tradeNumber: settleOrder?.orderNumber,
        },
      });
      const rfqDetails = await db.dataBase.rFQMasterISIN.findFirst({
        where: {
          number: negotation?.rfqNumber,
        },
      });
      const metadata = (order.metadata as Record<string, unknown> | null) ?? {};
      let orderDateForPdf: string | undefined =
        negotation?.createdAt instanceof Date
          ? order.createdAt.toISOString()
          : String(order.createdAt);
      if (settleOrder?.modSettleDate) {
        const parsed = parseSettlementDateToISO(settleOrder.modSettleDate);
        if (parsed) orderDateForPdf = parsed;
      }
      const [bankName, dpName] = await Promise.all([
        settleOrder?.ifscCode
          ? fetchBankNameFromIfsc(settleOrder.ifscCode)
          : Promise.resolve(null),
        settleOrder?.dpId
          ? Promise.resolve(getDpName(settleOrder.dpId))
          : Promise.resolve(undefined),
      ]);

      const accessType: Record<string, string> = {
        "1": "One to Many (OTM) on RFQ Platform of the Exchange",
        "2": "One to One (OTO) on RFQ Platform of the Exchange",
        "3": "Inter Scheme Transfer (IST) on RFQ Platform of the Exchange",
      };
      const accessKey =
        rfqDetails?.access != null ? String(rfqDetails.access) : undefined;
      const accessTypeText = accessKey ? accessType[accessKey] : undefined;

      const orderDateForSchedule = orderDateForPdf
        ? new Date(orderDateForPdf)
        : new Date();
      const interestSchedule = getInterestPaymentSchedule({
        orderDate: orderDateForSchedule,
        maturityDate: bond.maturityDate ?? null,
        interestPaymentFrequency: bond.interestPaymentFrequency,
        paymentDayOfMonth: 20,
        nextCouponDate:
          bond.nextCouponDate != null &&
            String(bond.nextCouponDate).trim() !== ""
            ? new Date(bond.nextCouponDate)
            : undefined,
      });

      const accruedInterestDaysParam =
        body.accruedInterestDays != null
          ? Number(body.accruedInterestDays)
          : undefined;
      if (
        accruedInterestDaysParam == null ||
        !Number.isFinite(accruedInterestDaysParam) ||
        accruedInterestDaysParam < 0
      ) {
        return res.sendResponse({
          statusCode: HttpStatus.BAD_REQUEST,
          message: "accruedInterestDays must be a valid non-negative number",
        });
      }
      const settlementNumberParam =
        typeof body.settlementNumber === "string" &&
          body.settlementNumber.trim() !== ""
          ? body.settlementNumber.trim()
          : undefined;
      const settlementDateTimeParam =
        typeof body.settlementDateTime === "string" &&
          body.settlementDateTime.trim() !== ""
          ? body.settlementDateTime.trim()
          : undefined;
      const lastInterestPaymentDateParam =
        typeof body.lastInterestPaymentDate === "string" &&
          body.lastInterestPaymentDate.trim() !== ""
          ? body.lastInterestPaymentDate.trim()
          : undefined;
      const interestPaymentDatesParamEmail =
        typeof body.interestPaymentDates === "string" &&
          body.interestPaymentDates.trim() !== ""
          ? body.interestPaymentDates
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined;
      const nonAmortizedBondParamEmail = body.nonAmortizedBond === false ? false : true;
      const amortizedPrincipalPaymentDatesParamEmail =
        typeof body.amortizedPrincipalPaymentDates === "string" && body.amortizedPrincipalPaymentDates.trim() !== ""
          ? body.amortizedPrincipalPaymentDates.trim()
          : undefined;

      const pdfPayload = {
        user,
        orderId: order.orderNumber,
        bond,
        qun:
          settleOrder?.modQuantity != null
            ? Number(settleOrder.modQuantity)
            : order.quantity,
        isReleased: false,
        orderData: {
          createdAt: orderDateForPdf,
          subTotal:
            settleOrder?.value != null
              ? Number(settleOrder.value)
              : Number(order.totalAmount),
          stampDuty:
            settleOrder?.stampDutyAmount != null
              ? Number(settleOrder.stampDutyAmount)
              : Number(order.stampDuty),
          totalAmount:
            settleOrder?.modConsideration != null
              ? Number(settleOrder.modConsideration)
              : Number(order.totalAmount),
          price: Number(settleOrder?.price ?? 0),
          metadata: {
            dealId: (metadata.dealId as string) ?? undefined,
            rfqNumber: (metadata.rfqNumber as string) ?? undefined,
            orderType:
              accessTypeText ??
              "One To One (OTO) on RFQ Platform of the Exchange",
            interestPaymentDates:
              interestPaymentDatesParamEmail?.length
                ? interestPaymentDatesParamEmail
                : interestSchedule.dates.length > 0
                  ? interestSchedule.dates
                  : undefined,
            interestPaymentFrequencyLabel: interestSchedule.frequencyLabel,
            settlementOrderNumber:
              negotation?.rfqNumber ?? settleOrder?.orderNumber ?? undefined,
            settlementDate: orderDateForPdf,
            valueDate: bond.maturityDate
              ? new Date(bond.maturityDate).toISOString()
              : undefined,
            accruedInterest:
              settleOrder?.modAccrInt != null
                ? Number(settleOrder.modAccrInt)
                : undefined,
            accruedInterestDays: accruedInterestDaysParam,
            settlementNumber:
              settlementNumberParam ??
              (settleOrder as { settlementNo?: string } | undefined)
                ?.settlementNo,
            settlementDateTime: settlementDateTimeParam,
            lastInterestPaymentDate: lastInterestPaymentDateParam,
            nonAmortizedBond: nonAmortizedBondParamEmail,
            amortizedPrincipalPaymentDates: amortizedPrincipalPaymentDatesParamEmail,
            settlementBank: settleOrder
              ? {
                bankName: bankName ?? undefined,
                ifscCode: settleOrder.ifscCode ?? undefined,
                accountNo: settleOrder.accountNo ?? undefined,
              }
              : undefined,
            settlementDemat: settleOrder
              ? {
                dpName: dpName ?? undefined,
                dpId: settleOrder.dpId ?? undefined,
                benId: settleOrder.benId ?? undefined,
              }
              : undefined,
            settleOrder: settleOrder
              ? {
                id: settleOrder.id,
                orderNumber: settleOrder.orderNumber,
                symbol: settleOrder.symbol,
                buySell: negotation?.buySell,
                buyParticipantLoginId: settleOrder.buyParticipantLoginId,
                sellParticipantLoginId: settleOrder.sellParticipantLoginId,
                buyerRefNo: settleOrder.buyerRefNo,
                sellerRefNo: settleOrder.sellerRefNo,
                buyBackofficeLoginId: settleOrder.buyBackofficeLoginId,
                sellBackofficeLoginId: settleOrder.sellBackofficeLoginId,
                buyBrokerLoginId: settleOrder.buyBrokerLoginId,
                sellBrokerLoginId: settleOrder.sellBrokerLoginId,
                source: settleOrder.source,
                modSettleDate: settleOrder.modSettleDate,
                modQuantity: settleOrder.modQuantity,
                modAccrInt: settleOrder.modAccrInt,
                modConsideration: settleOrder.modConsideration,
                settlementNo: settleOrder.settlementNo,
                stampDutyAmount: settleOrder.stampDutyAmount,
                stampDutyBearer: settleOrder.stampDutyBearer,
                buyerFundPayinObligation: settleOrder.buyerFundPayinObligation,
                sellerFundPayoutObligation: settleOrder.sellerFundPayoutObligation,
                fundPayinRefId: settleOrder.fundPayinRefId,
                settleStatus: settleOrder.settleStatus,
                secPayinQuantity: settleOrder.secPayinQuantity,
                secPayinRemarks: settleOrder.secPayinRemarks,
                secPayinTime: settleOrder.secPayinTime,
                fundsPayinAmount: settleOrder.fundsPayinAmount,
                fundsPayinRemarks: settleOrder.fundsPayinRemarks,
                fundsPayinTime: settleOrder.fundsPayinTime,
                payoutRemarks: settleOrder.payoutRemarks,
                payoutTime: settleOrder.payoutTime,
                ifscCode: settleOrder.ifscCode,
                accountNo: settleOrder.accountNo,
                utrNumber: settleOrder.utrNumber,
                dpId: settleOrder.dpId,
                benId: settleOrder.benId,
              }
              : undefined,
          },
        },
      };

      const buffer =
        pdfType === "deal"
          ? await generateDealPdfBuffer(pdfPayload)
          : await generateOrderPdfBuffer(pdfPayload);
      const filename =
        pdfType === "deal"
          ? `deal-sheet-${order.orderNumber}.pdf`
          : `order-receipt-${order.orderNumber}.pdf`;

      const recipientEmail =
        String(body.toEmail ?? "").trim() || order.customerProfile?.emailAddress;
      if (!recipientEmail || !emailPattern.test(recipientEmail)) {
        return res.sendResponse({
          statusCode: HttpStatus.BAD_REQUEST,
          message: "Recipient email is missing or invalid",
        });
      }

      const emailer = new EmailCommunication();
      const htmlBody = messageBody
        .split("\n")
        .map((line) => line.trim())
        .join("<br/>");
      const messageId = await emailer.sendEmail({
        to: recipientEmail,
        from: fromEmail,
        subject,
        html: htmlBody,
        attachments: [
          {
            filename,
            content: buffer,
            contentType: "application/pdf",
          },
        ],
      });

      return res.sendResponse({
        statusCode: HttpStatus.OK,
        message: "Email sent successfully",
        responseData: { messageId },
      });
    } catch (err) {
      console.error("Send PDF email failed:", err);
      return res.sendResponse({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: err instanceof Error ? err.message : "Failed to send email",
      });
    }
  };
}
