
import { db } from "@core/database/database";
import { sendBackOfficeEmail } from "@communication/email_communication";
import logger from "@utils/logger/logger";

/**
 * After-hours "order acknowledgement" email.
 *
 * Sent at payment-capture time for orders placed outside market hours (24/7
 * trading). It acknowledges the order and tells the customer the trade will be
 * placed on the exchange on the next working day, at the price/yield locked in
 * at checkout. The official Order Receipt and Deal Sheet follow later, from the
 * existing settlement flow.
 *
 * This must never break the payment webhook: it logs and returns on any error
 * instead of throwing.
 */
export async function sendOrderReceivedEmail(params: {
  orderId: number;
  scheduledExecutionAt: Date;
}): Promise<void> {
  const { orderId, scheduledExecutionAt } = params;

  try {
    const order = await db.dataBase.order.findUnique({
      where: { id: orderId },
      select: {
        orderNumber: true,
        isin: true,
        bondName: true,
        quantity: true,
        totalAmount: true,
        bondDetails: true,
        createdAt: true,
        customerProfile: {
          select: {
            emailAddress: true,
            firstName: true,
            middleName: true,
            lastName: true,
          },
        },
      },
    });

    if (!order) {
      logger.logError("Order-received email skipped: order not found", {
        orderId,
      });
      return;
    }

    const recipientEmail = order.customerProfile?.emailAddress;
    if (!recipientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
      logger.logError("Order-received email skipped: missing/invalid email", {
        orderId,
      });
      return;
    }

    const customerName =
      [
        order.customerProfile?.firstName,
        order.customerProfile?.middleName,
        order.customerProfile?.lastName,
      ]
        .filter(Boolean)
        .join(" ")
        .trim() || "Customer";

    // Pricing snapshot captured at checkout (locked price/yield + dates).
    const bondDetails = order.bondDetails as {
      yield?: number | string | null;
      pricing?: {
        yield?: number | string | null;
        settlementDate?: string | null;
      } | null;
    } | null;
    const pricing = bondDetails?.pricing ?? null;

    const yieldValue = pricing?.yield ?? bondDetails?.yield;
    const yieldStr =
      yieldValue != null && yieldValue !== "" ? `${yieldValue}%` : "—";

    const tradingDate = formatIstDate(scheduledExecutionAt); // next working day
    const settlementDate = pricing?.settlementDate
      ? formatIstDate(new Date(`${pricing.settlementDate}T00:00:00.000Z`))
      : "—";
    const orderPlacementDate = formatIstDate(order.createdAt);
    const amount = formatInr(order.totalAmount);

    // Subject: "Order Request Received – <ISIN> <Trading Date>" e.g.
    // "Order Request Received – INE658F08524 23-Jun-2026" (trading date = the
    // day the RFQ will be fired to NSE, i.e. scheduledExecutionAt).
    const tradingDateShort = formatShortIstDate(scheduledExecutionAt);
    const subject = `Order Request Received – ${order.isin} ${tradingDateShort}`;

    const text = [
      `Dear ${customerName},`,
      ``,
      `Thank you for placing your bond order via MeraDhan, an OBPP by BondNest Capital India Securities Private Limited.`,
      ``,
      `We acknowledge receipt of your order request for the following transaction:`,
      ``,
      `Order Details`,
      `Order ID: ${order.orderNumber}`,
      `ISIN: ${order.isin}`,
      `Bond Name: ${order.bondName}`,
      `Yield: ${yieldStr}`,
      `Order Placement Date: ${orderPlacementDate}`,
      `Order Amount: ₹${amount}`,
      `Quantity: ${order.quantity}`,
      ``,
      `Since this order has been placed outside regular market hours, your order will be placed on the exchange platform on the trading date mentioned below.`,
      ``,
      `Trade and Settlement Details`,
      `Trading Date: ${tradingDate}`,
      `Settlement Date: ${settlementDate}`,
      `Settlement Cycle: T+1`,
      `Exchange Platform: NSE`,
      ``,
      `The official Order Receipt will be shared with you on the trading date, once the order is successfully placed on the exchange platform. The Order Receipt will contain the final transaction details, including price, yield, settlement amount, and settlement date.`,
      ``,
      `This acknowledgement is subject to successful payment, order creation, and exchange processing on the scheduled trading date.`,
      ``,
      `For any queries, please contact us at backoffice@meradhan.co.`,
      ``,
      `Best Regards,`,
      `MeraDhan Team`,
      ``,
      `Disclaimer: Fixed returns do not constitute guaranteed or assured returns. Investments in corporate debt securities, municipal debt securities/securitised debt instruments are subject to credit risks, market risks and default risks including delay and/or default in payment. Read all the offer related documents carefully.`,
      ``,
      `BondNest Capital India Securities Private Limited operates the MeraDhan platform as an Online Bond Platform Provider (OBPP).`,
      ``,
      `SEBI Registration No.: INZ000330234`,
      `NSE Member ID: 90480`,
      `BSE Member ID: 6963`,
    ].join("\n");

    const html = `
      <p>Dear ${customerName},</p>
      <p>Thank you for placing your bond order via MeraDhan, an OBPP by BondNest Capital India Securities Private Limited.</p>
      <p>We acknowledge receipt of your order request for the following transaction:</p>
      <p><strong>Order Details</strong><br/>
        Order ID: ${order.orderNumber}<br/>
        ISIN: ${order.isin}<br/>
        Bond Name: ${order.bondName}<br/>
        Yield: ${yieldStr}<br/>
        Order Placement Date: ${orderPlacementDate}<br/>
        Order Amount: ₹${amount}<br/>
        Quantity: ${order.quantity}</p>
      <p>Since this order has been placed outside regular market hours, your order will be placed on the exchange platform on the trading date mentioned below.</p>
      <p><strong>Trade and Settlement Details</strong><br/>
        Trading Date: ${tradingDate}<br/>
        Settlement Date: ${settlementDate}<br/>
        Settlement Cycle: T+1<br/>
        Exchange Platform: NSE</p>
      <p>The official Order Receipt will be shared with you on the trading date, once the order is successfully placed on the exchange platform. The Order Receipt will contain the final transaction details, including price, yield, settlement amount, and settlement date.</p>
      <p>This acknowledgement is subject to successful payment, order creation, and exchange processing on the scheduled trading date.</p>
      <p>For any queries, please contact us at backoffice@meradhan.co.</p>
      <p>Best Regards,<br/>MeraDhan Team</p>
      <p style="font-size:12px;color:#666;line-height:1.5;margin-top:24px;">
        Disclaimer: Fixed returns do not constitute guaranteed or assured returns. Investments in corporate debt securities, municipal debt securities/securitised debt instruments are subject to credit risks, market risks and default risks including delay and/or default in payment. Read all the offer related documents carefully.<br/><br/>
        BondNest Capital India Securities Private Limited operates the MeraDhan platform as an Online Bond Platform Provider (OBPP).<br/><br/>
        SEBI Registration No.: INZ000330234<br/>
        NSE Member ID: 90480<br/>
        BSE Member ID: 6963
      </p>
    `;

    const messageId = await sendBackOfficeEmail({
      to: recipientEmail,
      subject,
      text,
      html,
    });

    logger.logInfo("Order-received email sent", {
      orderId,
      orderNumber: order.orderNumber,
      messageId,
    });
  } catch (error) {
    logger.logError("Failed to send order-received email", {
      orderId,
      error,
    });
  }
}

/** Format an instant as a friendly IST date, e.g. "Monday, 22 June 2026". */
function formatIstDate(at: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(at);
}

/** Format an instant as a short IST date, e.g. "23-Jun-2026" (for the subject). */
function formatShortIstDate(at: Date): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).formatToParts(at);
  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "";
  return `${get("day")}-${get("month")}-${get("year")}`;
}

/** Format an amount (Prisma Decimal / number) as an Indian-grouped string. */
function formatInr(amount: unknown): string {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "0.00";
  return n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
