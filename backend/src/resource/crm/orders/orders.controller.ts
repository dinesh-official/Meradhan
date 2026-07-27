import { type Request, type Response } from "express";
import { CrmOrdersService } from "./orders.service";
import { OrderPaymentVerifyService } from "./order_payment_verify.service";
import { OrderSettlementVerifyService } from "./order_settlement_verify.service";
import {
  appSchema,
  getEmailSalutationFromGender,
  resolveGenderForEmailSalutation,
} from "@root/schema";
import { AppError, HttpStatus } from "@utils/error/AppError";
import { OrderStatus } from "@databases/generated/prisma/postgres";
import { createCrmActivityLog } from "@resource/crm/auditlogs/auditlog.repo";
import { sendBackOfficeEmail } from "@communication/email_communication";
import { AppConfigService } from "@resource/app-config/app-config.service";
import { db } from "@core/database/database";
import {
  processCbricsSettlementWebhook,
  resolveOrderForNseSettleKey,
} from "@services/notifications/cbrics_settlement_webhook.service";

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

/** Deal / settlement lines in email: DD-MMM-YYYY (full year). */
function formatProposalDateDdMmmYyyy(value: string | number | Date | null | undefined) {
  if (value == null || value === "") return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const day = String(date.getDate()).padStart(2, "0");
  const month = months[date.getMonth()] ?? "—";
  const year = String(date.getFullYear());
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
  gender?: string | null;
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
  maturityDate?: string | null;
  faceValue?: number | null;
  cleanPrice?: number | null;
  /** Annual coupon % (e.g. from bond master). */
  couponRate?: number | null;
}) {
  const orderSideWord = payload.side === "SELL" ? "sell" : "buy";
  const settlementAmount = Number(payload.settlementAmount ?? 0);
  const amountInWords = proposalNumberToWords(settlementAmount);

  const cleanPxSource = payload.cleanPrice ?? payload.rate;
  const cleanPriceDisplay =
    cleanPxSource != null && Number.isFinite(Number(cleanPxSource))
      ? `INR ${formatProposalNumber(Number(cleanPxSource), 4)}`
      : "—";

  const couponPct =
    payload.couponRate != null && Number.isFinite(Number(payload.couponRate))
      ? Number(payload.couponRate)
      : null;
  const couponDisplay =
    couponPct != null ? `${formatProposalNumber(couponPct, 2)}%` : "—";

  const accruedDisplay =
    payload.accruedInterest != null && Number.isFinite(Number(payload.accruedInterest))
      ? `${formatProposalCurrency(payload.accruedInterest)}${payload.noOfDays != null && Number.isFinite(Number(payload.noOfDays))
        ? ` (No. of Days: ${payload.noOfDays})`
        : ""
      }`
      : "—";

  const faceValueDisplay =
    payload.faceValue != null && Number.isFinite(Number(payload.faceValue))
      ? formatProposalCurrency(payload.faceValue)
      : "—";

  const confirmationQuote =
    "I confirm the above order details and authorize BondNest Capital India Securities Private Limited (MeraDhan) to proceed with the order placement on the RFQ Platform.";

  const rows: [string, string][] = [
    ["Security Name", payload.bondName || "—"],
    ["ISIN", payload.isin || "—"],
    ["Deal Date", formatProposalDateDdMmmYyyy(payload.dealDate)],
    ["Settlement Date", formatProposalDateDdMmmYyyy(payload.settlementDate)],
    ["Maturity", formatProposalDateDdMmmYyyy(payload.maturityDate ?? null)],
    ["Coupon Rate", couponDisplay],
    ["Face Value", faceValueDisplay],
    ["Quantity", formatProposalInteger(payload.quantity)],
    ["Quantum", formatProposalCurrency(payload.quantum)],
    ["Clean Price", cleanPriceDisplay],
    ["YTM Ann", payload.ytmAnn != null ? `${formatProposalNumber(payload.ytmAnn, 2)}%` : "—"],
    ["Last IP Date", formatProposalDateDdMmmYyyy(payload.lastIpDate)],
    ["Principal Amount", formatProposalCurrency(payload.principalAmount)],
    ["Accrued / Ex Interest", accruedDisplay],
    ["Total Consideration", formatProposalCurrency(payload.totalConsideration)],
    ["Stamp Duty", formatProposalCurrency(payload.stampDuty)],
    ["Settlement Amount", formatProposalCurrency(payload.settlementAmount)],
    ["Amount in Words", amountInWords],
  ];

  const subject = `RFQ Order Confirmation Required – ${payload.isin} Deal Date ${formatProposalDateDdMmmYyyy(payload.dealDate)}`;
  const salutation = getEmailSalutationFromGender(payload.gender);

  const html = `
    <p>Dear ${salutation} ${escapeHtml(payload.customerName)},</p>
    <p>Thank you for placing your ${escapeHtml(orderSideWord)} order on BondNest Capital India Securities Private Limited (MeraDhan). Your order request has been recorded successfully and is currently pending confirmation.</p>
    <p>To proceed with the order placement, kindly reply to this email with the following confirmation text:</p>
    <p style="margin:12px 0;padding:12px 16px;border-left:4px solid #2563eb;background:#f8fafc;font-style:italic;">&ldquo;${escapeHtml(confirmationQuote)}&rdquo;</p>
    <p>The transaction details are provided below for your review:</p>
    <table style="border-collapse:collapse;width:100%;max-width:720px;margin:16px 0;">
      <tbody>
        ${rows
      .map(
        ([label, value]) => `
              <tr>
                <td style="border:1px solid #e5e7eb;padding:8px;font-weight:600;vertical-align:top;width:40%;">${escapeHtml(String(label))}</td>
                <td style="border:1px solid #e5e7eb;padding:8px;vertical-align:top;">${escapeHtml(String(value))}</td>
              </tr>`,
      )
      .join("")}
      </tbody>
    </table>
    <p><strong>Please note:</strong></p>
    <ul style="margin:8px 0 16px 18px;padding:0;">
      <li style="margin-bottom:8px;">This transaction is expected to be settled on a T+1 basis.</li>
      <li style="margin-bottom:8px;">The order will be processed only upon receipt of your confirmation through the registered email address.</li>
      <li style="margin-bottom:8px;">The Order Receipt will be generated after successful placement of the order on the RFQ Platform of the Stock Exchange(s).</li>
      <li style="margin-bottom:8px;">The Order Receipt merely indicates the intention of the parties to enter into a transaction. It should not be construed as a Deal Confirmation.</li>
      <li style="margin-bottom:8px;">The Deal Sheet will be issued only upon successful settlement of the transaction.</li>
      <li style="margin-bottom:8px;">Please ensure that the payment is made only from the bank account that you have registered and verified on the MeraDhan platform. Payments made from any other bank account may result in trade settlement failure.</li>
      <li style="margin-bottom:8px;">Kindly ensure that the funds are transferred via NEFT/RTGS to the NSCCL Account maintained with HDFC Bank or RBI, as applicable.</li>
    </ul>
    <p>For any assistance, please contact us at <a href="mailto:backoffice@meradhan.co">backoffice@meradhan.co</a>.</p>
    <p><strong>Note:</strong> Kindly ensure that the Demat Account verified on our platform is active for the receipt of Bonds/Securities. The same account details will be captured in the Order Receipt upon placement of the order.</p>
    <p>Best regards,<br/>MeraDhan Team</p>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
    <p style="font-size:11px;color:#64748b;line-height:1.5;"><strong>Disclaimer:</strong> Fixed returns do not constitute guaranteed or assured returns. Investments in corporate debt securities, municipal debt securities/securitised debt instruments are subject to credit risks, market risks and default risks including delay and/or default in payment. Read all the offer related documents carefully.</p>
    <p style="font-size:11px;color:#64748b;line-height:1.5;">BondNest Capital India Securities Private Limited operates the MeraDhan platform as an Online Bond Platform Provider (OBPP).</p>
    <p style="font-size:11px;color:#64748b;line-height:1.5;">SEBI Registration No.: INZ000330234<br/>NSE Member ID: 90480<br/>BSE Member ID: 6963</p>
  `;

  const text = [
    `Dear ${salutation} ${payload.customerName},`,
    "",
    `Thank you for placing your ${orderSideWord} order on BondNest Capital India Securities Private Limited (MeraDhan). Your order request has been recorded successfully and is currently pending confirmation.`,
    "",
    "To proceed with the order placement, kindly reply to this email with the following confirmation text:",
    "",
    `"${confirmationQuote}"`,
    "",
    "The transaction details are provided below for your review:",
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    "Please note:",
    "- This transaction is expected to be settled on a T+1 basis.",
    "- The order will be processed only upon receipt of your confirmation through the registered email address.",
    "- The Order Receipt will be generated after successful placement of the order on the RFQ Platform of the Stock Exchange(s).",
    "- The Order Receipt merely indicates the intention of the parties to enter into a transaction. It should not be construed as a Deal Confirmation.",
    "- The Deal Sheet will be issued only upon successful settlement of the transaction.",
    "- Please ensure that the payment is made only from the bank account that you have registered and verified on the MeraDhan platform. Payments made from any other bank account may result in trade settlement failure.",
    "- Kindly ensure that the funds are transferred via NEFT/RTGS to the NSCCL Account maintained with HDFC Bank or RBI, as applicable.",
    "",
    "For any assistance, please contact us at backoffice@meradhan.co.",
    "",
    "Note: Kindly ensure that the Demat Account verified on our platform is active for the receipt of Bonds/Securities. The same account details will be captured in the Order Receipt upon placement of the order.",
    "",
    "Best regards,",
    "MeraDhan Team",
    "",
    "Disclaimer: Fixed returns do not constitute guaranteed or assured returns. Investments in corporate debt securities, municipal debt securities/securitised debt instruments are subject to credit risks, market risks and default risks including delay and/or default in payment. Read all the offer related documents carefully.",
    "",
    "BondNest Capital India Securities Private Limited operates the MeraDhan platform as an Online Bond Platform Provider (OBPP).",
    "",
    "SEBI Registration No.: INZ000330234",
    "NSE Member ID: 90480",
    "BSE Member ID: 6963",
  ].join("\n");

  return { subject, html, text };
}

export class CrmOrdersController {
  private ordersService = new CrmOrdersService();
  private appConfigService = new AppConfigService();
  private paymentVerifyService = new OrderPaymentVerifyService();
  private settlementVerifyService = new OrderSettlementVerifyService();

  /**
   * Manually verify an order's Razorpay payment and sync `paymentStatus`
   * from the live Razorpay status. Separate from the reconciliation cron;
   * status update only (no settlement queueing).
   */
  verifyOrderPayment = async (req: Request, res: Response) => {
    const orderId = Number(req.params.id);
    if (!orderId || isNaN(orderId)) {
      return res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Invalid order ID",
      });
    }
    try {
      const apply = req.body?.apply === true || req.body?.apply === "true";
      const result = await this.paymentVerifyService.verifyAndUpdate(orderId, {
        apply,
      });
      const message = result.applied
        ? "Payment status updated in database"
        : result.willChange
          ? "Razorpay status verified — accept to update the database"
          : result.hasDefinitiveStatus
            ? "Database already matches Razorpay status"
            : "Payment is still pending on Razorpay";

      await createCrmActivityLog(req, {
        userId: Number(req.session?.id),
        action: result.applied
          ? "ORDER_PAYMENT_VERIFY_UPDATE"
          : "ORDER_PAYMENT_VERIFY",
        details: {
          Reason: message,
          Mode: apply ? "APPLY" : "PREVIEW",
          OrderId: result.orderId,
          OrderNumber: result.orderNumber,
          RazorpayPaymentId: result.razorpayPaymentId,
          RazorpayStatus: result.razorpayStatus,
          CurrentPaymentStatus: result.currentPaymentStatus,
          ProposedPaymentStatus: result.proposedPaymentStatus,
          ProposedOrderStatus: result.proposedOrderStatus,
          Updated: result.applied,
        },
        entityType: "rfq",
        entityId: String(orderId),
      });

      return res.sendResponse({
        statusCode: HttpStatus.OK,
        message,
        responseData: result,
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
        message: err instanceof Error ? err.message : "Failed to verify payment",
      });
    }
  };

  /**
   * Manually verify an order's NSE settlement (live `/settle/order/all`) and
   * sync `status` from the returned `settleStatus`. Preview by default;
   * pass `apply: true` in the body to commit.
   */
  verifyOrderSettlement = async (req: Request, res: Response) => {
    const orderId = Number(req.params.id);
    if (!orderId || isNaN(orderId)) {
      return res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Invalid order ID",
      });
    }
    try {
      const apply = req.body?.apply === true || req.body?.apply === "true";
      const result = await this.settlementVerifyService.verifyAndUpdate(orderId, {
        apply,
      });
      const message = result.applied
        ? "Order status updated from NSE settlement"
        : result.willChange
          ? "NSE settlement verified — accept to update the order status"
          : result.hasDefinitiveStatus
            ? "Order status already matches NSE settlement"
            : "No NSE settlement status available yet";

      await createCrmActivityLog(req, {
        userId: Number(req.session?.id),
        action: result.applied
          ? "ORDER_SETTLEMENT_VERIFY_UPDATE"
          : "ORDER_SETTLEMENT_VERIFY",
        details: {
          Reason: message,
          Mode: apply ? "APPLY" : "PREVIEW",
          OrderId: result.orderId,
          OrderNumber: result.orderNumber,
          NseTradeNumber: result.nseTradeNumber,
          SettleStatus: result.settleStatus,
          SettleStatusLabel: result.settleStatusLabel,
          CurrentOrderStatus: result.currentOrderStatus,
          ProposedOrderStatus: result.proposedOrderStatus,
          Updated: result.applied,
        },
        entityType: "rfq",
        entityId: String(orderId),
      });

      return res.sendResponse({
        statusCode: HttpStatus.OK,
        message,
        responseData: result,
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
          err instanceof Error ? err.message : "Failed to verify settlement",
      });
    }
  };

  /**
   * Enqueue resume-safe settlement from the first incomplete/failed stage.
   */
  resumeOrderSettlement = async (req: Request, res: Response) => {
    const orderId = Number(req.params.id);
    if (!orderId || isNaN(orderId)) {
      return res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Invalid order ID",
      });
    }
    try {
      const result = await this.ordersService.resumeOrderSettlement(orderId);
      await createCrmActivityLog(req, {
        userId: Number(req.session?.id),
        action: "ORDER_SETTLEMENT_RESUME",
        details: {
          Reason: result.queued
            ? "Settlement resume job queued"
            : result.resumeFromStage
              ? "Settlement job already active"
              : "Settlement pipeline already complete",
          OrderId: result.orderId,
          OrderNumber: result.orderNumber,
          JobId: result.jobId,
          Queued: result.queued,
          ResumeFromStage: result.resumeFromStage,
          ResumeFromSeq: result.resumeFromSeq,
        },
        entityType: "order",
        entityId: String(orderId),
      });

      const stageLabel = result.resumeFromStage
        ? String(result.resumeFromStage).replace(/_/g, " ")
        : null;
      const message = !result.resumeFromStage
        ? "Settlement pipeline already complete — nothing to resume"
        : result.queued
          ? `Resuming settlement from step: ${stageLabel}`
          : `Settlement already in progress (will continue from: ${stageLabel})`;

      return res.sendResponse({
        statusCode: HttpStatus.OK,
        message,
        responseData: result,
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
          err instanceof Error ? err.message : "Failed to resume settlement",
      });
    }
  };

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

  getDraftOrders = async (_req: Request, res: Response) => {
    const result = await this.ordersService.listDraftOrdersForCrm();
    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: result,
    });
  };

  proceedDraftOrder = async (req: Request, res: Response) => {
    const draftId = Number(req.params.draftId);
    if (!draftId || Number.isNaN(draftId)) {
      return res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Valid draft id is required",
      });
    }
    try {
      const result = await this.ordersService.createOrderFromDraftForCrm(draftId);
      return res.sendResponse({
        statusCode: HttpStatus.OK,
        responseData: result,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to create order from draft";
      const statusCode =
        error instanceof AppError ? error.statusCode : HttpStatus.INTERNAL_SERVER_ERROR;
      return res.sendResponse({
        statusCode,
        message,
      });
    }
  };

  cancelDraftOrder = async (req: Request, res: Response) => {
    const draftId = Number(req.params.draftId);
    if (!draftId || Number.isNaN(draftId)) {
      return res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Valid draft id is required",
      });
    }
    try {
      const result = await this.ordersService.cancelDraftOrderForCrm(draftId);
      return res.sendResponse({
        statusCode: HttpStatus.OK,
        responseData: result,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to cancel draft order";
      const statusCode =
        error instanceof AppError ? error.statusCode : HttpStatus.INTERNAL_SERVER_ERROR;
      return res.sendResponse({
        statusCode,
        message,
      });
    }
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

      const validStatuses = Object.values(OrderStatus);
      if (!validStatuses.includes(status as OrderStatus)) {
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

  /**
   * Stamp a settle_order with `linkedRfqParticipantCode` for an external
   * NSE participant counterparty. Used by the generate-PDF page when the
   * operator picks "Assign as NSE participant" instead of selecting a
   * Meradhan customer.
   */
  assignRfqParticipantToSettleOrder = async (req: Request, res: Response) => {
    const orderNumber =
      typeof req.body?.orderNumber === "string"
        ? req.body.orderNumber.trim()
        : "";
    const code =
      typeof req.body?.code === "string" ? req.body.code.trim() : "";

    if (!orderNumber || !code) {
      return res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "orderNumber and code are required.",
      });
    }

    try {
      const result = await this.ordersService.assignRfqParticipantToSettleOrder({
        orderNumber,
        code,
      });
      return res.sendResponse({
        statusCode: HttpStatus.OK,
        responseData: result,
      });
    } catch (err) {
      if (err instanceof AppError) {
        return res.sendResponse({
          statusCode: err.statusCode,
          message: err.message,
        });
      }
      const message =
        err instanceof Error ? err.message : "Failed to assign participant";
      return res.sendResponse({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message,
      });
    }
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

  /**
   * Propose `bondDetails.pricing` from NSE rows already saved in DB (no write).
   * Used when PDF download fails with PRICING_SNAPSHOT_MISSING.
   */
  proposeOrderPricingSnapshot = async (req: Request, res: Response) => {
    const orderNumber = req.params.orderNumber;
    if (!orderNumber || typeof orderNumber !== "string") {
      return res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Order number is required",
      });
    }
    try {
      const data = await this.ordersService.proposeOrderPricingSnapshotFromNse(
        orderNumber,
      );
      return res.sendResponse({
        statusCode: HttpStatus.OK,
        responseData: data,
      });
    } catch (err) {
      if (err instanceof AppError) {
        return res.sendResponse({
          statusCode: err.statusCode,
          message: err.message,
          ...(err.code ? { code: err.code } : {}),
        });
      }
      return res.sendResponse({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message:
          err instanceof Error
            ? err.message
            : "Failed to propose order pricing from NSE data",
      });
    }
  };

  /**
   * Accept proposed NSE pricing and persist onto `orders.bondDetails.pricing`.
   */
  acceptOrderPricingSnapshot = async (req: Request, res: Response) => {
    const orderNumber = req.params.orderNumber;
    if (!orderNumber || typeof orderNumber !== "string") {
      return res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Order number is required",
      });
    }
    try {
      const data = await this.ordersService.acceptOrderPricingSnapshotFromNse(
        orderNumber,
      );
      return res.sendResponse({
        statusCode: HttpStatus.OK,
        responseData: data,
        message: "Order pricing snapshot updated from NSE saved data.",
      });
    } catch (err) {
      if (err instanceof AppError) {
        return res.sendResponse({
          statusCode: err.statusCode,
          message: err.message,
          ...(err.code ? { code: err.code } : {}),
        });
      }
      return res.sendResponse({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message:
          err instanceof Error
            ? err.message
            : "Failed to accept order pricing snapshot",
      });
    }
  };

  /** Computes “Receipt PDF options” fields from settlement date for one-click auto-fill. */
  autofillReceiptPdfOptions = async (req: Request, res: Response) => {
    const orderNumber = req.params.orderNumber;
    console.log("orderNumber", orderNumber);
    if (!orderNumber || typeof orderNumber !== "string") {
      return res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Order number is required",
      });
    }
    // settlementDate is optional — when provided, it overrides bondDetails.pricing.settlementDate.
    const settlementDate = (req.body as { settlementDate?: unknown })?.settlementDate;
    const settlementDateStr = typeof settlementDate === "string" ? settlementDate.trim() : "";
    try {
      const data = await this.ordersService.autofillReceiptPdfOptions(orderNumber, {
        settlementDate: settlementDateStr || null,
      });
      console.log("data", data);
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
      if (err instanceof AppError) {
        return res.sendResponse({
          statusCode: err.statusCode,
          message: err.message,
          ...(err.code ? { code: err.code } : {}),
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
      if (err instanceof AppError) {
        return res.sendResponse({
          statusCode: err.statusCode,
          message: err.message,
          ...(err.code ? { code: err.code } : {}),
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
      pdfType?: "order" | "deal" | "both";
      subject?: string;
      messageBody?: string;
      toEmail?: string;
      accruedInterestDays?: number | string;
      settlementDate?: string;
      dealDate?: string;
      settlementNumber?: string;
      settlementDateTime?: string;
      lastInterestPaymentDate?: string;
      interestPaymentDates?: string;
      nonAmortizedBond?: boolean;
      amortizedPrincipalPaymentDates?: string;
      /** One-shot NSE pricing for PDF yield/amounts — not persisted. */
      pricingSnapshot?: Record<string, unknown> | string;
      useNseSavedPricing?: boolean;
    };

    const pdfType = body.pdfType;
    if (pdfType !== "order" && pdfType !== "deal" && pdfType !== "both") {
      return res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "pdfType must be 'order', 'deal', or 'both'",
      });
    }

    const subject = String(body.subject ?? "").trim();
    const messageBody = String(body.messageBody ?? "").trim();

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

    try {
      const result = await this.ordersService.sendPdfEmailToClient(orderNumber, {
        pdfType,
        subject,
        messageBody,
        toEmail: body.toEmail,
        accruedInterestDays: body.accruedInterestDays,
        settlementDate:
          typeof body.settlementDate === "string" && body.settlementDate.trim() !== ""
            ? new Date(body.settlementDate)
            : undefined,
        dealDate:
          typeof body.dealDate === "string" && body.dealDate.trim() !== ""
            ? new Date(body.dealDate)
            : undefined,
        settlementNumber: body.settlementNumber,
        settlementDateTime: body.settlementDateTime,
        lastInterestPaymentDate: body.lastInterestPaymentDate,
        interestPaymentDates: body.interestPaymentDates,
        nonAmortizedBond: body.nonAmortizedBond,
        amortizedPrincipalPaymentDates: body.amortizedPrincipalPaymentDates,
        pricingSnapshot: body.pricingSnapshot,
        useNseSavedPricing: body.useNseSavedPricing === true,
      });

      return res.sendResponse({
        statusCode: HttpStatus.OK,
        message: "Email sent successfully",
        responseData: result,
      });
    } catch (err) {
      console.error("Send PDF email failed:", err);
      if (err instanceof AppError) {
        return res.sendResponse({
          statusCode: err.statusCode,
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
      maturityDate?: string | null;
      faceValue?: number | string | null;
      cleanPrice?: number | string | null;
      couponRate?: number | string | null;
      gender?: string | null;
      customerProfileId?: number | string | null;
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

    let gender = resolveGenderForEmailSalutation({ gender: body.gender });
    if (!gender) {
      const customerProfileId =
        body.customerProfileId != null && String(body.customerProfileId).trim() !== ""
          ? Number(body.customerProfileId)
          : null;
      const customerRow = await db.dataBase.customerProfileDataModel.findFirst({
        where:
          customerProfileId != null && Number.isFinite(customerProfileId)
            ? { id: customerProfileId, isDeleted: false }
            : {
              emailAddress: { equals: recipientEmail, mode: "insensitive" },
              isDeleted: false,
            },
        select: {
          gender: true,
          panCard: { select: { gender: true } },
          aadhaarCard: { select: { gender: true } },
        },
      });
      gender = resolveGenderForEmailSalutation(customerRow);
    }

    const template = buildProposalEmailTemplate({
      customerName,
      gender,
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
      maturityDate:
        typeof body.maturityDate === "string" && body.maturityDate.trim() !== ""
          ? body.maturityDate
          : null,
      faceValue:
        body.faceValue == null || body.faceValue === "" ? null : Number(body.faceValue),
      cleanPrice:
        body.cleanPrice == null || body.cleanPrice === "" ? null : Number(body.cleanPrice),
      couponRate:
        body.couponRate == null || body.couponRate === "" ? null : Number(body.couponRate),
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

  /**
   * Test / replay CBRICS settlement webhook deal-sheet automation for an order.
   * POST /api/crm/orders/test-deal-sheet-webhook
   * Body: { orderId?, reqOrderNumber?, dryRun?, send?, force?, toEmail? }
   */
  testDealSheetWebhook = async (req: Request, res: Response) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const orderIdRaw = body.orderId;
    const orderId =
      orderIdRaw != null && String(orderIdRaw).trim() !== ""
        ? Number(orderIdRaw)
        : undefined;
    const reqOrderNumber =
      typeof body.reqOrderNumber === "string" ? body.reqOrderNumber.trim() : "";
    const dryRun = body.send !== true && body.dryRun !== false;
    const force = body.force === true;
    const toEmail =
      typeof body.toEmail === "string" && body.toEmail.trim()
        ? body.toEmail.trim()
        : undefined;

    if ((!orderId || Number.isNaN(orderId)) && !reqOrderNumber) {
      return res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Provide orderId or reqOrderNumber",
      });
    }

    let order =
      orderId != null && !Number.isNaN(orderId)
        ? await db.dataBase.order.findUnique({
          where: { id: orderId },
          select: {
            id: true,
            orderNumber: true,
            reqOrderNumber: true,
            status: true,
            metadata: true,
            customerProfileId: true,
          },
        })
        : null;

    const nseKey =
      reqOrderNumber ||
      order?.reqOrderNumber?.trim() ||
      null;

    if (!order && nseKey) {
      order = await resolveOrderForNseSettleKey(nseKey);
    }

    if (!order) {
      return res.sendResponse({
        statusCode: HttpStatus.NOT_FOUND,
        message: "Order not found",
      });
    }

    if (!nseKey) {
      return res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Order has no reqOrderNumber — pass reqOrderNumber in body",
      });
    }

    const payload = {
      settleOrderList: [
        {
          orderNumber: nseKey,
          settleStatus: 4,
          modSettleDate: new Date()
            .toLocaleDateString("en-GB")
            .replaceAll("/", "-"),
          settlementNo:
            typeof body.settlementNo === "string" ? body.settlementNo : "CRM-TEST",
        },
      ],
    };

    try {
      const result = await processCbricsSettlementWebhook(payload, {
        dryRun,
        forceDealSheet: force,
        toEmail,
      });

      await createCrmActivityLog(req, {
        userId: Number(req.session?.id),
        action: "TEST_DEAL_SHEET_WEBHOOK",
        entityType: "Order",
        entityId: String(order.id),
        details: {
          dryRun,
          force,
          nseKey,
          result,
        },
      });

      return res.sendResponse({
        statusCode: HttpStatus.OK,
        message: result.dealSheetSent
          ? "Deal sheet email sent"
          : result.dealSheetSkippedReason ?? "Webhook simulation completed",
        responseData: {
          order: {
            id: order.id,
            orderNumber: order.orderNumber,
            reqOrderNumber: order.reqOrderNumber,
          },
          payload,
          result,
        },
      });
    } catch (err) {
      return res.sendResponse({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: err instanceof Error ? err.message : "Deal sheet test failed",
      });
    }
  };
}
