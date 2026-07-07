import { db } from "@core/database/database";
import type { Prisma } from "@databases/generated/prisma/postgres";
import { OrderStatus } from "@databases/generated/prisma/postgres";
import { AppError, HttpStatus } from "@utils/error/AppError";
import { NseCBRICS } from "@modules/RFQ/nse/nse_CBRICS";
import { processCbricsSettlementWebhook } from "@services/notifications/cbrics_settlement_webhook.service";

/**
 * NSE `settle_order.settleStatus` → human label (as documented by CBRICS).
 */
const SETTLE_STATUS_LABELS: Record<number, string> = {
  0: "Settlement Pending",
  1: "Securities Payin Done",
  2: "Funds Payin Done",
  3: "Payin Completed",
  4: "Payout Done Successfully",
  5: "Payin reversed",
  6: "Settle order expired",
  7: "Order not settleable",
  8: "Settlement of order cancelled",
  9: "Document not received for unregistered participant",
};

/**
 * On-demand verification of a single order's NSE settlement.
 *
 * The settlement counterpart of `OrderPaymentVerifyService`: an operator
 * clicks "Verify Settlement", we query the live NSE settlement API
 * (`/settle/order/all`) for this order's trade number and map the returned
 * `settleStatus` onto the order's `status`. Preview by default; commit with
 * `apply: true`.
 */
export class OrderSettlementVerifyService {
  private nseCbrics = new NseCBRICS();

  /** DD-MM-YYYY in IST, as required by the CBRICS settlement filter. */
  private formatIst(d: Date): string {
    return d
      .toLocaleDateString("en-GB", { timeZone: "Asia/Kolkata" })
      .replaceAll("/", "-");
  }

  /**
   * NSE trade number for this order. Customer-facing `orderNumber` is MD-*;
   * the NSE settle key is the `reqOrderNumber` / `metadata.rfqNumber`.
   */
  private resolveTradeKey(order: {
    orderNumber: string;
    reqOrderNumber: string | null;
    metadata: Prisma.JsonValue | null;
  }): string {
    const meta = (order.metadata as Record<string, unknown> | null) ?? {};
    const rfq = typeof meta.rfqNumber === "string" ? meta.rfqNumber.trim() : "";
    const req = order.reqOrderNumber != null && String(order.reqOrderNumber).trim() !== ""
      ? String(order.reqOrderNumber).trim()
      : "";

    return req || rfq || order.orderNumber;
  }

  /**
   * NSE `settleStatus` → Prisma `OrderStatus`.
   * 0 Pending · 1–3 In progress · 4 Settled · 5/7/9 Rejected · 6 Expired · 8 Cancelled
   */
  private mapSettleStatus(settleStatus: number | null | undefined): OrderStatus | null {
    if (settleStatus == null || !Number.isInteger(settleStatus)) return null;
    switch (settleStatus) {
      case 0:
        return OrderStatus.PENDING;
      case 1:
      case 2:
      case 3:
        return OrderStatus.IN_PROGRESS;
      case 4:
        return OrderStatus.SETTLED;
      case 5:
      case 7:
      case 9:
        return OrderStatus.REJECTED;
      case 6:
        return OrderStatus.EXPIRED;
      case 8:
        return OrderStatus.CANCELLED;
      default:
        return null;
    }
  }

  /**
   * @param apply  false (default) → preview only; true → commit the mapped
   *   status to `order.status`.
   */
  async verifyAndUpdate(orderId: number, opts?: { apply?: boolean }) {
    const apply = opts?.apply === true;

    const order = await db.dataBase.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderNumber: true,
        reqOrderNumber: true,
        metadata: true,
        status: true,
        createdAt: true,
      },
    });

    if (!order) {
      throw new AppError("Order not found", { statusCode: HttpStatus.NOT_FOUND });
    }


    if (!order.reqOrderNumber) {
      throw new AppError("Request order number not found", { statusCode: HttpStatus.BAD_REQUEST });
    }

    const tradeKey = this.resolveTradeKey(order);
    if (!tradeKey) {
      throw new AppError("No NSE trade/settlement reference on this order", {
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    // Settlement usually happens ~T+1 from the deal date. NSE caps the
    // settlement filter at a 30-day window, so anchor it around the order's
    // creation date (1 day before → 28 days after = 30-day inclusive span)
    // instead of spanning createdAt..now (which overflows for old orders).
    const from = new Date(order.createdAt);
    from.setDate(from.getDate() - 1);
    const to = new Date(from);
    to.setDate(to.getDate() + 29);

    const settleOrders = await this.nseCbrics.getSettlementOrders({
      orderNumber: tradeKey,
      filtFromModSettleDate: this.formatIst(from),
      filtToModSettleDate: this.formatIst(to),
    });

    const record =
      settleOrders.find((r) => String(r.orderNumber) === String(tradeKey)) ??
      settleOrders[0] ??
      null;

    const settleStatus = record?.settleStatus ?? null;
    const mapped = this.mapSettleStatus(settleStatus);
    const willChange = mapped != null && mapped !== order.status;

    let applied = false;
    let dealSheetResult: Awaited<
      ReturnType<typeof processCbricsSettlementWebhook>
    > | null = null;

    if (apply && mapped != null && willChange) {
      await db.dataBase.order.update({
        where: { id: order.id },
        data: { status: mapped },
      });
      applied = true;
    }

    // When NSE reports payout done (4), ensure deal sheet is emailed once
    // (covers missed/failed CBRICS webhooks).
    if (apply && settleStatus === 4) {
      dealSheetResult = await processCbricsSettlementWebhook(
        {
          settleOrderList: [
            {
              orderNumber: tradeKey,
              settleStatus: 4,
              settlementNo: record?.settlementNo ?? undefined,
              modSettleDate: record?.modSettleDate ?? undefined,
            },
          ],
        },
        { forceDealSheet: false },
      );
    }

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      nseTradeNumber: tradeKey,
      settleStatus,
      settleStatusLabel:
        settleStatus != null ? SETTLE_STATUS_LABELS[settleStatus] ?? null : null,
      currentOrderStatus: order.status,
      proposedOrderStatus: mapped ?? order.status,
      hasDefinitiveStatus: mapped != null,
      willChange,
      applied,
      dealSheetSent: dealSheetResult?.dealSheetSent ?? false,
      dealSheetSkippedReason: dealSheetResult?.dealSheetSkippedReason,
    };
  }
}
