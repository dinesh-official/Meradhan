import { db } from "@core/database/database";
import { EmailCommunication } from "@communication/email_communication";
import logger from "@utils/logger/logger";

/**
 * After-hours "we've received your order" email.
 *
 * Sent at payment-capture time for orders placed outside market hours (24/7
 * trading). It reassures the customer that payment is received and the trade
 * will be submitted to NSE on the next working day, at the price/yield locked
 * in at checkout. The Order Receipt and Deal Sheet emails still follow later,
 * from the existing settlement flow.
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

    const executionDate = formatIstDate(scheduledExecutionAt);

    const subject = `We've received your order — Order ID ${order.orderNumber}`;

    const text = [
      `Hi ${customerName},`,
      ``,
      `Thank you for your purchase. We've received your payment and reserved ${order.quantity} unit(s) of ${order.bondName} (ISIN: ${order.isin}) at the price and yield locked in at the time of your order.`,
      ``,
      `Because your order was placed outside market trading hours, it will be submitted to the exchange (NSE) on the next working day, ${executionDate}, once the trading window opens at 9:15 AM. The price and yield you saw at checkout are locked and will not change.`,
      ``,
      `Once the trade is submitted you'll receive your Order Receipt, followed by the official Deal Sheet after the trade settles. No action is needed from you.`,
      ``,
      `Warm regards,`,
      `Team MeraDhan`,
    ].join("\n");

    const html = `
      <p>Hi ${customerName},</p>
      <p>Thank you for your purchase. We've received your payment and reserved
        <strong>${order.quantity} unit(s) of ${order.bondName}</strong>
        (ISIN: ${order.isin}) at the price and yield locked in at the time of your order.</p>
      <p>Because your order was placed outside market trading hours, it will be submitted
        to the exchange (NSE) on the next working day, <strong>${executionDate}</strong>,
        once the trading window opens at 9:15 AM.
        <strong>The price and yield you saw at checkout are locked and will not change.</strong></p>
      <p>Once the trade is submitted you'll receive your Order Receipt, followed by the
        official Deal Sheet after the trade settles. No action is needed from you.</p>
      <p>Warm regards,<br/>Team MeraDhan</p>
    `;

    const messageId = await new EmailCommunication().sendEmail({
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
