import { $Enums, db } from "@core/database/database";
import type { Prisma } from "@databases/generated/prisma/postgres";
import logger from "@utils/logger/logger";
import { sendDealSheetPdfByOrderId } from "./send_deal_sheet_nyOrderId";

export type CbricsSettleOrderRow = {
  orderNumber?: string | number | null;
  settleStatus?: number | string | null;
  modSettleDate?: string | null;
  settlementNo?: string | null;
  buyerRefNo?: string | null;
  sellerRefNo?: string | null;
  symbol?: string | null;
};

export type ProcessCbricsSettlementResult = {
  processed: boolean;
  reason?: string;
  nseOrderNumber?: string;
  settleStatus?: number;
  orderId?: number;
  orderNumber?: string;
  orderStatusUpdated?: $Enums.OrderStatus;
  dealSheetSent?: boolean;
  dealSheetSkippedReason?: string;
  dealSheetMessageId?: string;
  dryRun?: boolean;
};

function normalizeSettleKey(value: unknown): string | null {
  if (value == null) return null;
  const s = String(value).trim();
  return s.length ? s : null;
}

function parseSettleStatus(value: unknown): number | null {
  if (value == null || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isInteger(n) ? n : null;
}

/** Extract the first settlement row from a CBRICS webhook payload. */
export function extractSettleOrderFromPayload(
  payload: unknown,
): CbricsSettleOrderRow | null {
  const list = (payload as { settleOrderList?: unknown })?.settleOrderList;
  if (!Array.isArray(list) || list.length === 0) return null;
  const row = list[0];
  if (!row || typeof row !== "object") return null;
  return row as CbricsSettleOrderRow;
}

/** NSE settleStatus → Prisma OrderStatus (4 = settled handled separately). */
export function mapSettleStatusToOrderStatus(
  settleStatus: number,
): $Enums.OrderStatus | null {
  switch (settleStatus) {
    case 0:
    case 1:
    case 2:
    case 3:
      return $Enums.OrderStatus.IN_PROGRESS;
    case 5:
    case 7:
    case 9:
      return $Enums.OrderStatus.REJECTED;
    case 6:
      return $Enums.OrderStatus.EXPIRED;
    case 8:
      return $Enums.OrderStatus.CANCELLED;
    default:
      return null;
  }
}

/**
 * Resolve our `order` row from NSE settlement `orderNumber` (trade / req key).
 * Never coerce to Number — NSE sends string trade ids that may exceed INT4.
 */
export async function resolveOrderForNseSettleKey(
  nseOrderNumber: string,
  settleRow?: CbricsSettleOrderRow | null,
) {
  const key = normalizeSettleKey(nseOrderNumber);
  if (!key) return null;

  const refCandidates = [
    key,
    normalizeSettleKey(settleRow?.buyerRefNo),
    normalizeSettleKey(settleRow?.sellerRefNo),
  ].filter((v): v is string => Boolean(v));

  for (const candidate of refCandidates) {
    const byReq = await db.dataBase.order.findFirst({
      where: { reqOrderNumber: candidate },
      select: {
        id: true,
        orderNumber: true,
        reqOrderNumber: true,
        status: true,
        metadata: true,
        customerProfileId: true,
      },
    });
    if (byReq) return byReq;

    const byPaymentId = await db.dataBase.order.findFirst({
      where: { paymentId: candidate },
      select: {
        id: true,
        orderNumber: true,
        reqOrderNumber: true,
        status: true,
        metadata: true,
        customerProfileId: true,
      },
    });
    if (byPaymentId) return byPaymentId;

    const byRfqMeta = await db.dataBase.order.findFirst({
      where: {
        metadata: {
          path: ["rfqNumber"],
          equals: candidate,
        },
      },
      select: {
        id: true,
        orderNumber: true,
        reqOrderNumber: true,
        status: true,
        metadata: true,
        customerProfileId: true,
      },
    });
    if (byRfqMeta) return byRfqMeta;
  }

  return null;
}

function dealSheetAlreadySent(metadata: Prisma.JsonValue | null): boolean {
  const meta = (metadata as Record<string, unknown> | null) ?? {};
  return (
    typeof meta.dealSheetEmailSentAt === "string" &&
    meta.dealSheetEmailSentAt.trim() !== ""
  );
}

/**
 * Core handler for CBRICS settlement webhook rows.
 * When settleStatus = 4 (settled): mark order SETTLED and email deal sheet once.
 */
export async function processCbricsSettlementWebhook(
  payload: unknown,
  options?: {
    dryRun?: boolean;
    forceDealSheet?: boolean;
    toEmail?: string;
  },
): Promise<ProcessCbricsSettlementResult> {
  const settleRow = extractSettleOrderFromPayload(payload);
  const nseOrderNumber = normalizeSettleKey(settleRow?.orderNumber);
  if (!settleRow || !nseOrderNumber) {
    return { processed: false, reason: "No settleOrderList row in payload" };
  }

  const settleStatus = parseSettleStatus(settleRow.settleStatus);
  if (settleStatus == null) {
    return {
      processed: false,
      reason: "Missing or invalid settleStatus",
      nseOrderNumber,
    };
  }

  const order = await resolveOrderForNseSettleKey(nseOrderNumber, settleRow);
  if (!order) {
    logger.logInfo("CBRICS settlement webhook: order not found", {
      nseOrderNumber,
      settleStatus,
    });
    return {
      processed: false,
      reason: "Order not found for NSE settle orderNumber",
      nseOrderNumber,
      settleStatus,
    };
  }

  const dryRun = options?.dryRun === true;
  const result: ProcessCbricsSettlementResult = {
    processed: true,
    nseOrderNumber,
    settleStatus,
    orderId: order.id,
    orderNumber: order.orderNumber,
    dryRun,
  };

  if (settleStatus === 4) {
    if (!dryRun) {
      await db.dataBase.order.update({
        where: { id: order.id },
        data: { status: $Enums.OrderStatus.SETTLED },
      });
    }
    result.orderStatusUpdated = $Enums.OrderStatus.SETTLED;

    const alreadySent = dealSheetAlreadySent(order.metadata);
    if (alreadySent && !options?.forceDealSheet) {
      result.dealSheetSent = false;
      result.dealSheetSkippedReason =
        "Deal sheet email already sent for this order";
      return result;
    }

    if (order.customerProfileId == null) {
      result.dealSheetSent = false;
      result.dealSheetSkippedReason =
        "Participant-counterparty order — no customer email on file";
      return result;
    }

    if (dryRun) {
      result.dealSheetSent = false;
      result.dealSheetSkippedReason = "Dry run — email not sent";
      return result;
    }

    const sendResult = await sendDealSheetPdfByOrderId({
      orderId: order.id,
      toEmail: options?.toEmail,
    });

    const sentAt = new Date().toISOString();
    const existingMeta = (order.metadata as Record<string, unknown> | null) ?? {};
    await db.dataBase.order.update({
      where: { id: order.id },
      data: {
        metadata: {
          ...existingMeta,
          dealSheetEmailSentAt: sentAt,
          dealSheetEmailMessageId: sendResult.messageId,
          dealSheetEmailNseOrderNumber: nseOrderNumber,
          ...(settleRow.settlementNo
            ? { settlementNumber: settleRow.settlementNo }
            : {}),
          ...(settleRow.modSettleDate
            ? { settlementDate: settleRow.modSettleDate }
            : {}),
        } as Prisma.InputJsonValue,
      },
    });

    result.dealSheetSent = true;
    result.dealSheetMessageId = sendResult.messageId;
    logger.logInfo("Deal sheet email sent from CBRICS settlement webhook", {
      orderId: order.id,
      orderNumber: order.orderNumber,
      nseOrderNumber,
      messageId: sendResult.messageId,
    });

    return result;
  }

  const nextStatus = mapSettleStatusToOrderStatus(settleStatus);
  if (nextStatus != null && !dryRun) {
    await db.dataBase.order.update({
      where: { id: order.id },
      data: { status: nextStatus },
    });
    result.orderStatusUpdated = nextStatus;
  }

  return result;
}
