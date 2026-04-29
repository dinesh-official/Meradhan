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
import { AppConfigService } from "@resource/app-config/app-config.service";

function formatProposalDate(value: string | number | Date | null | undefined) {
  if (value == null || value === "") return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const day = String(date.getDate()).padStart(2, "0");
  const month = months[date.getMonth()] ?? "—";
  const year = String(date.getFullYear()).slice(-2);
  return `${day}-${month}-${year}`;
}

function formatProposalCurrency(value: number | string | null | undefined) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numeric);
}

function formatProposalNumber(value: number | string | null | undefined, digits = 2) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "—";
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(numeric);
}

function formatProposalInteger(value: number | string | null | undefined) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "—";
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(numeric);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function proposalNumberToWords(amount: number): string {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function convertHundreds(num: number): string {
    if (num === 0) return "";
    let result = "";
    if (num >= 100) {
      result += `${ones[Math.floor(num / 100)]} Hundred `;
      num %= 100;
    }
    if (num >= 20) {
      result += `${tens[Math.floor(num / 10)]} `;
      num %= 10;
    } else if (num >= 10) {
      return `${result}${teens[num - 10]}`.trim();
    }
    if (num > 0) result += ones[num];
    return result.trim();
  }

  const absAmount = Math.abs(amount);
  if (absAmount === 0) return "Rs. Zero Only";

  let rupees = Math.floor(absAmount);
  const paise = Math.round((absAmount - rupees) * 100);
  const parts: string[] = [];

  if (rupees >= 10000000) {
    const crore = Math.floor(rupees / 10000000);
    const word = convertHundreds(crore);
    if (word) parts.push(`${word} Crore`);
    rupees %= 10000000;
  }
  if (rupees >= 100000) {
    const lakh = Math.floor(rupees / 100000);
    const word = convertHundreds(lakh);
    if (word) parts.push(`${word} Lakh`);
    rupees %= 100000;
  }
  if (rupees >= 1000) {
    const thousand = Math.floor(rupees / 1000);
    const word = convertHundreds(thousand);
    if (word) parts.push(`${word} Thousand`);
    rupees %= 1000;
  }
  if (rupees > 0) {
    const word = convertHundreds(rupees);
    if (word) parts.push(word);
  }

  const rupeesText = parts.join(" ").replace(/\s+/g, " ").trim();
  if (paise > 0) {
    return `Rs. ${rupeesText} And ${convertHundreds(paise)} Paise Only`;
  }
  return `Rs. ${rupeesText} Only`;
}

function buildProposalEmailTemplate(payload: {
  customerName: string;
  side: "BUY" | "SELL";
  bondName: string;
  isin: string;
  dealDate: string;
  settlementDate: string;
  quantum: number;
  quantity: number;
  rate: number;
  ytmAnn: number | null;
  lastIpDate: string | null;
  noOfDays: number | null;
  principalAmount: number | null;
  accruedInterest: number | null;
  totalConsideration: number | null;
  stampDuty: number | null;
  settlementAmount: number | null;
}) {
  const sideText = payload.side.toLowerCase();
  const settlementAmount = Number(payload.settlementAmount ?? 0);
  const amountInWords = proposalNumberToWords(settlementAmount);

  const rows = [
    ["Name of Security", payload.bondName || "—"],
    ["ISIN", payload.isin || "—"],
    ["Deal Date", formatProposalDate(payload.dealDate)],
    ["Settlement Date", formatProposalDate(payload.settlementDate)],
    ["Quantum", formatProposalInteger(payload.quantum)],
    ["Quantity", formatProposalInteger(payload.quantity)],
    ["Rate", formatProposalNumber(payload.rate, 4)],
    ["YTM Ann", payload.ytmAnn != null ? formatProposalNumber(payload.ytmAnn, 2) : "—"],
    ["Last IP Date", formatProposalDate(payload.lastIpDate)],
    ["No of Days", payload.noOfDays != null ? String(payload.noOfDays) : "—"],
    ["Principal Amount", formatProposalCurrency(payload.principalAmount)],
    ["Accrued Interest", formatProposalCurrency(payload.accruedInterest)],
    ["Total Consideration", formatProposalCurrency(payload.totalConsideration)],
    ["Stamp Duty", formatProposalCurrency(payload.stampDuty)],
    ["Settlement Amount", formatProposalCurrency(payload.settlementAmount)],
    ["Amount in Words", amountInWords],
  ];

  const subject = `RFQ Order Confirmation Required – ${payload.isin} Deal Date ${formatProposalDate(payload.dealDate)}`;
  const html = `
    <p>Dear ${escapeHtml(payload.customerName)},</p>
    <p>Thank you for placing your ${escapeHtml(sideText)} order through BondNest Capital India Securities Private Limited. Based on your authorization, we propose to initiate a non-negotiable order (One-to-One Mode) on the RFQ Platform of the Stock Exchanges.</p>
    <p>The proposed order details are provided below for your reference and confirmation. Kindly confirm the same to enable us to proceed with placing the order. You are also requested to arrange the pay-in obligation (funds) within the stipulated timeline today.</p>
    <table style="border-collapse:collapse;width:100%;margin:16px 0;">
      <tbody>
        ${rows
      .map(
        ([label, value]) => `
              <tr>
                <td style="border:1px solid #e5e7eb;padding:8px;font-weight:600;vertical-align:top;">${escapeHtml(String(label))}</td>
                <td style="border:1px solid #e5e7eb;padding:8px;vertical-align:top;">${escapeHtml(String(value))}</td>
              </tr>`
      )
      .join("")}
      </tbody>
    </table>
    <p>Please note that the Order Receipt will be generated post placement of the order on the RFQ Platform and merely indicates the intention of the parties to enter into a transaction. It should not be construed as a Deal Confirmation. The Deal Sheet will be issued upon successful settlement of the transaction.</p>
    <p>Please ensure that the payment is made only from the bank account that you have registered and verified on the MeraDhan platform. Payments made from any other bank account may result in trade settlement failure.</p>
    <p>Kindly ensure that the funds are transferred via RTGS to the NSCCL Account maintained with HDFC Bank or RBI, as applicable.</p>
    <p>Note: Kindly ensure that the Demat Account verified on our platform is active for the receipt of Bonds/Securities. The same account details will be captured in the Order Receipt upon placement of the order.</p>
    <p>Best regards,<br/><br/>MeraDhan Team</p>
  `;

  const text = [
    `Dear ${payload.customerName},`,
    "",
    `Thank you for placing your ${sideText} order through BondNest Capital India Securities Private Limited. Based on your authorization, we propose to initiate a non-negotiable order (One-to-One Mode) on the RFQ Platform of the Stock Exchanges.`,
    "",
    "The proposed order details are provided below for your reference and confirmation. Kindly confirm the same to enable us to proceed with placing the order. You are also requested to arrange the pay-in obligation (funds) within the stipulated timeline today.",
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    "Please note that the Order Receipt will be generated post placement of the order on the RFQ Platform and merely indicates the intention of the parties to enter into a transaction. It should not be construed as a Deal Confirmation. The Deal Sheet will be issued upon successful settlement of the transaction.",
    "",
    "Please ensure that the payment is made only from the bank account that you have registered and verified on the MeraDhan platform. Payments made from any other bank account may result in trade settlement failure.",
    "",
    "Kindly ensure that the funds are transferred via RTGS to the NSCCL Account maintained with HDFC Bank or RBI, as applicable.",
    "",
    "Note: Kindly ensure that the Demat Account verified on our platform is active for the receipt of Bonds/Securities. The same account details will be captured in the Order Receipt upon placement of the order.",
    "",
    "Best regards,",
    "",
    "MeraDhan Team",
  ].join("\n");

  return { subject, html, text };
}

export class CrmOrdersController {
  private ordersService = new CrmOrdersService();
  private appConfigService = new AppConfigService();

  getPaymentGatewaySettings = async (_req: Request, res: Response) => {
    const paymentGatewayMode =
      await this.appConfigService.getPaymentGatewayMode();
    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: { paymentGatewayMode },
    });
  };

  updatePaymentGatewaySettings = async (req: Request, res: Response) => {
    const body = appSchema.crm.orders.UpdatePaymentGatewayModeSchema.parse(
      req.body,
    );
    const paymentGatewayMode = await this.appConfigService.setPaymentGatewayMode(
      body.paymentGatewayMode,
    );
    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: { paymentGatewayMode },
    });
  };

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

  getPaymentProcessLogs = async (req: Request, res: Response) => {
    const search =
      typeof req.query.search === "string" ? req.query.search : undefined;
    const result = await this.ordersService.getSettlementAutomationLogGroups(search);
    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: {
        groups: result,
      },
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

  /** Computes “Receipt PDF options” fields from settlement date for one-click auto-fill. */
  autofillReceiptPdfOptions = async (req: Request, res: Response) => {
    const orderNumber = req.params.orderNumber;
    if (!orderNumber || typeof orderNumber !== "string") {
      return res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Order number is required",
      });
    }
    const settlementDate = (req.body as { settlementDate?: unknown })?.settlementDate;
    const settlementDateStr = typeof settlementDate === "string" ? settlementDate.trim() : "";
    if (!settlementDateStr) {
      return res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "settlementDate is required (YYYY-MM-DD)",
      });
    }
    try {
      const data = await this.ordersService.autofillReceiptPdfOptions(orderNumber, {
        settlementDate: settlementDateStr,
      });
      return res.sendResponse({
        statusCode: HttpStatus.OK,
        responseData: data,
      });
    } catch (err) {
      if (err instanceof AppError) {
        return res.sendResponse({
          statusCode: err.statusCode,
          message: err.message,
        });
      }
      return res.sendResponse({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message:
          err instanceof Error ? err.message : "Failed to auto-fill receipt PDF options",
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

  sendProposalEmailToClient = async (req: Request, res: Response) => {
    const body = req.body as {
      toEmail?: string;
      customerName?: string;
      side?: "BUY" | "SELL";
      bondName?: string;
      isin?: string;
      dealDate?: string;
      settlementDate?: string;
      quantum?: number | string;
      quantity?: number | string;
      rate?: number | string;
      ytmAnn?: number | string | null;
      lastIpDate?: string | null;
      noOfDays?: number | string | null;
      principalAmount?: number | string | null;
      accruedInterest?: number | string | null;
      totalConsideration?: number | string | null;
      stampDuty?: number | string | null;
      settlementAmount?: number | string | null;
    };

    const recipientEmail = String(body.toEmail ?? "").trim();
    const customerName = String(body.customerName ?? "").trim();
    const side = body.side === "SELL" ? "SELL" : "BUY";
    const bondName = String(body.bondName ?? "").trim();
    const isin = String(body.isin ?? "").trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!recipientEmail || !emailPattern.test(recipientEmail)) {
      return res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Recipient email is missing or invalid",
      });
    }
    if (!customerName || !bondName || !isin) {
      return res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Customer name, bond name, and ISIN are required",
      });
    }

    const template = buildProposalEmailTemplate({
      customerName,
      side,
      bondName,
      isin,
      dealDate: String(body.dealDate ?? ""),
      settlementDate: String(body.settlementDate ?? ""),
      quantum: Number(body.quantum ?? 0),
      quantity: Number(body.quantity ?? 0),
      rate: Number(body.rate ?? 0),
      ytmAnn:
        body.ytmAnn == null || body.ytmAnn === "" ? null : Number(body.ytmAnn),
      lastIpDate:
        typeof body.lastIpDate === "string" && body.lastIpDate.trim() !== ""
          ? body.lastIpDate
          : null,
      noOfDays:
        body.noOfDays == null || body.noOfDays === "" ? null : Number(body.noOfDays),
      principalAmount:
        body.principalAmount == null || body.principalAmount === ""
          ? null
          : Number(body.principalAmount),
      accruedInterest:
        body.accruedInterest == null || body.accruedInterest === ""
          ? null
          : Number(body.accruedInterest),
      totalConsideration:
        body.totalConsideration == null || body.totalConsideration === ""
          ? null
          : Number(body.totalConsideration),
      stampDuty:
        body.stampDuty == null || body.stampDuty === "" ? null : Number(body.stampDuty),
      settlementAmount:
        body.settlementAmount == null || body.settlementAmount === ""
          ? null
          : Number(body.settlementAmount),
    });

    try {
      const messageId = await sendBackOfficeEmail({
        to: recipientEmail,
        from: "backoffice@meradhan.co",
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      return res.sendResponse({
        statusCode: HttpStatus.OK,
        message: "Proposal email sent successfully",
        responseData: { messageId },
      });
    } catch (err) {
      return res.sendResponse({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: err instanceof Error ? err.message : "Failed to send proposal email",
      });
    }
  };
}
