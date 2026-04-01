import { type Request, type Response } from "express";
import { CrmOrdersService } from "./orders.service";
import { appSchema } from "@root/schema";
import { AppError, HttpStatus } from "@utils/error/AppError";
import { OrderStatus } from "@databases/generated/prisma/postgres";
import { createCrmActivityLog } from "@resource/crm/auditlogs/auditlog.repo";
import { CustomerProfileRepo } from "@resource/crm/customers/customer.repo";
import { sendBackOfficeEmail } from "@communication/email_communication";
import { env } from "@packages/config/src/env";
import {
  dateOfBirthToPdfPassword,
  getCustomerDobRawForPdf,
} from "@utils/dobPdfPassword";
import { encryptPdfBufferWithPassword } from "@utils/encryptPdfBuffer";

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
    const orderSideRaw = req.body.orderSide;
    const orderSide =
      orderSideRaw === "BUY" || orderSideRaw === "SELL" ? orderSideRaw : undefined;
    if (!orderNumber || customerId == null || isNaN(customerId)) {
      return res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Order number and customer ID are required",
      });
    }
    try {
      const order = await this.ordersService.createOrderFromRfq(
        orderNumber as string,
        customerId,
        { orderSide },
      );
      return res.sendResponse({
        statusCode: HttpStatus.OK,
        responseData: order,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to create order";
      const clientError =
        message.includes("not found") ||
        message.includes("already exists") ||
        message.includes("Only customers with verified KYC");
      return res.sendResponse({
        statusCode: clientError
          ? HttpStatus.BAD_REQUEST
          : HttpStatus.INTERNAL_SERVER_ERROR,
        message,
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

  /** Saved CRM “Receipt PDF options” for auto-fill on next visit. */
  getReceiptPdfOptions = async (req: Request, res: Response) => {
    const orderNumber = req.params.orderNumber;
    if (!orderNumber || typeof orderNumber !== "string") {
      return res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Order number is required",
      });
    }
    const row = await this.ordersService.getReceiptPdfOptions(orderNumber);
    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: row,
    });
  };

  upsertReceiptPdfOptions = async (req: Request, res: Response) => {
    const orderNumber = req.params.orderNumber;
    if (!orderNumber || typeof orderNumber !== "string") {
      return res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Order number is required",
      });
    }
    const b = req.body as Record<string, unknown>;
    const str = (v: unknown) =>
      typeof v === "string" ? v.trim() : v != null ? String(v).trim() : "";
    const accruedRaw = b.accruedInterestDays;
    let accruedInterestDays: number | null | undefined;
    if (accruedRaw === null || accruedRaw === undefined || accruedRaw === "") {
      accruedInterestDays = undefined;
    } else {
      const n = Number(accruedRaw);
      if (!Number.isFinite(n) || n < 0) {
        return res.sendResponse({
          statusCode: HttpStatus.BAD_REQUEST,
          message: "accruedInterestDays must be a non-negative number when provided",
        });
      }
      accruedInterestDays = Math.floor(n);
    }
    try {
      const row = await this.ordersService.upsertReceiptPdfOptions(orderNumber, {
        accruedInterestDays,
        settlementNumber: str(b.settlementNumber) || null,
        settlementDateTime: str(b.settlementDateTime) || null,
        lastInterestPaymentDateRaw: str(b.lastInterestPaymentDateRaw) || null,
        lastInterestPaymentDate: str(b.lastInterestPaymentDate) || null,
        interestPaymentDates: str(b.interestPaymentDates) || null,
        nonAmortizedBond:
          typeof b.nonAmortizedBond === "boolean" ? b.nonAmortizedBond : undefined,
        amortizedPrincipalPaymentDates:
          str(b.amortizedPrincipalPaymentDates) || null,
      });
      return res.sendResponse({
        statusCode: HttpStatus.OK,
        responseData: row,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to save PDF options";
      return res.sendResponse({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message,
      });
    }
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
      const pdfQuery = req.query as Record<string, string | undefined>;
      const { buffer, filename } =
        await this.ordersService.generateOrderReceiptPdfBuffer(orderNumber, pdfQuery);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (err) {
      console.error("Order receipt PDF failed:", err);
      if (err instanceof AppError && err.statusCode === HttpStatus.NOT_FOUND) {
        return res.sendResponse({
          statusCode: HttpStatus.NOT_FOUND,
          message: err.message,
        });
      }
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
      const pdfQuery = req.query as Record<string, string | undefined>;
      const { buffer, filename } =
        await this.ordersService.generateDealSheetPdfBuffer(orderNumber, pdfQuery);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (err) {
      console.error("Deal sheet PDF failed:", err);
      if (err instanceof AppError && err.statusCode === HttpStatus.NOT_FOUND) {
        return res.sendResponse({
          statusCode: HttpStatus.NOT_FOUND,
          message: err.message,
        });
      }
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
    const fromEmail = env.SMTP_SENDER;

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

    const accruedInterestDaysParam =
      body.accruedInterestDays != null ? Number(body.accruedInterestDays) : undefined;
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
      typeof body.settlementNumber === "string" && body.settlementNumber.trim() !== ""
        ? body.settlementNumber.trim()
        : undefined;
    const settlementDateTimeParam =
      typeof body.settlementDateTime === "string" && body.settlementDateTime.trim() !== ""
        ? body.settlementDateTime.trim()
        : undefined;
    const lastInterestPaymentDateParam =
      typeof body.lastInterestPaymentDate === "string" &&
      body.lastInterestPaymentDate.trim() !== ""
        ? body.lastInterestPaymentDate.trim()
        : undefined;

    const pdfQuery: Record<string, string | undefined> = {
      accruedInterestDays: String(accruedInterestDaysParam),
    };
    if (settlementNumberParam) pdfQuery.settlementNumber = settlementNumberParam;
    if (settlementDateTimeParam) pdfQuery.settlementDateTime = settlementDateTimeParam;
    if (lastInterestPaymentDateParam) {
      pdfQuery.lastInterestPaymentDate = lastInterestPaymentDateParam;
    }
    if (typeof body.interestPaymentDates === "string" && body.interestPaymentDates.trim() !== "") {
      pdfQuery.interestPaymentDates = body.interestPaymentDates.trim();
    }
    pdfQuery.nonAmortizedBond = body.nonAmortizedBond === false ? "false" : "true";
    if (
      typeof body.amortizedPrincipalPaymentDates === "string" &&
      body.amortizedPrincipalPaymentDates.trim() !== ""
    ) {
      pdfQuery.amortizedPrincipalPaymentDates = body.amortizedPrincipalPaymentDates.trim();
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
      const user = await customerRepo.getFullCustomerProfile(order.customerProfileId);

      let buffer: Buffer;
      let filename: string;
      try {
        const generated =
          pdfType === "deal"
            ? await this.ordersService.generateDealSheetPdfBuffer(orderNumber, pdfQuery)
            : await this.ordersService.generateOrderReceiptPdfBuffer(orderNumber, pdfQuery);
        buffer = generated.buffer;
        filename = generated.filename;
      } catch (pdfErr) {
        if (pdfErr instanceof AppError && pdfErr.statusCode === HttpStatus.NOT_FOUND) {
          return res.sendResponse({
            statusCode: HttpStatus.NOT_FOUND,
            message: pdfErr.message,
          });
        }
        throw pdfErr;
      }

      const recipientEmail =
        String(body.toEmail ?? "").trim() || order.customerProfile?.emailAddress;
      if (!recipientEmail || !emailPattern.test(recipientEmail)) {
        return res.sendResponse({
          statusCode: HttpStatus.BAD_REQUEST,
          message: "Recipient email is missing or invalid",
        });
      }

      const dobRaw = getCustomerDobRawForPdf(user);
      const pdfPassword = dateOfBirthToPdfPassword(dobRaw);
      if (!pdfPassword) {
        return res.sendResponse({
          statusCode: HttpStatus.BAD_REQUEST,
          message:
            "Customer date of birth is required to password-protect the PDF. Ensure PAN/Aadhaar or personal info DOB is on file.",
        });
      }
      try {
        buffer = encryptPdfBufferWithPassword(buffer, pdfPassword);
      } catch (encErr) {
        console.error("PDF encryption failed:", encErr);
        return res.sendResponse({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message:
            encErr instanceof Error
              ? encErr.message
              : "Failed to encrypt PDF. Install qpdf (e.g. brew install qpdf) or set QPDF_BIN.",
        });
      }

      
      const htmlBody = messageBody
        .split("\n")
        .map((line) => line.trim())
        .join("<br/>");
      const messageId = await sendBackOfficeEmail({
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
      if (err instanceof AppError && err.statusCode === HttpStatus.NOT_FOUND) {
        return res.sendResponse({
          statusCode: HttpStatus.NOT_FOUND,
          message: err.message,
        });
      }
      return res.sendResponse({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: err instanceof Error ? err.message : "Failed to send email",
      });
    }
  };
}
