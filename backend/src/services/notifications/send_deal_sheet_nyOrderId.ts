import { db } from "@core/database/database";
import { CrmOrdersService } from "@resource/crm/orders/orders.service";
import { AppError } from "@utils/error/AppError";
import { CustomerProfileRepo } from "@resource/crm/customers/customer.repo";
import logger from "@utils/logger/logger";
import { getLastCouponDate } from "@services/order/order-pricing-helper";
import { formatDateIstDdMmmYyyy } from "@resource/customer/order/order.utils";

type DealSheetEmailParams = {
    orderId: number | string;
    toEmail?: string;
};

function normalizeOrderNumber(v: unknown): string | null {
    if (v == null) return null;
    const s = String(v).trim();
    return s ? s : null;
}

function formatDealDateText(raw: unknown): string {
    const d = raw instanceof Date ? raw : raw ? new Date(String(raw)) : null;
    if (!d || Number.isNaN(d.getTime())) return "—";
    return formatDateIstDdMmmYyyy(d);
}

/**
 * Sends "Deal Sheet" PDF email when you only have `orderId` (DB order.id).
 * Uses CRM pipeline `sendPdfEmailToClient` (generates + encrypts + emails PDF).
 *
 * Notes:
 * - This requires `accruedInterestDays`. We try to load it from saved receipt/pdf options first.
 * - If options are missing, we fallback to `7` days (non-blocking default), but ideally the
 *   options should be persisted once from the CRM PDF screen.
 */
export async function sendDealSheetPdfByOrderId(params: DealSheetEmailParams) {
    const orderIdRaw = typeof params.orderId === "string" ? params.orderId.trim() : params.orderId;
    const orderIdAsNumber = typeof orderIdRaw === "number" ? orderIdRaw : Number(orderIdRaw);
    const orderIdAsString = String(orderIdRaw);

    // Prisma `order.id` is INT4 in this DB; only query by id when value safely fits.
    const canQueryByInt4Id =
        Number.isInteger(orderIdAsNumber) &&
        orderIdAsNumber > 0 &&
        orderIdAsNumber <= 2_147_483_647;

    if (!orderIdAsString || (!canQueryByInt4Id && !orderIdAsString.trim())) {
        throw new AppError("Invalid orderId", {
            statusCode: 400,
            code: "BAD_REQUEST",
        });
    }

    // In some flows `orderId` is stored in settle-order as trade/order number; try both.
    const order = await db.dataBase.order.findFirst({
        where: {
            OR: [
                ...(canQueryByInt4Id ? [{ id: orderIdAsNumber }] : []),
                { reqOrderNumber: orderIdAsString },
            ],
        },
        select: {
            id: true,
            reqOrderNumber: true,
            orderNumber: true,
            isin: true,
            bondName: true,
            metadata: true,
            customerProfileId: true,
            createdAt: true,
            bondDetails: true,
            customerProfile: { select: { emailAddress: true } },
        },
    });

    if (!order) {
        throw new AppError(`Order not found for orderId ${orderIdAsString}`, {
            statusCode: 404,
            code: "ORDER_NOT_FOUND",
        });
    }

    const orderNumber =
        normalizeOrderNumber(order.reqOrderNumber) ?? normalizeOrderNumber(order.orderNumber);
    if (!orderNumber) {
        throw new AppError(`orderNumber missing for orderId ${orderIdAsString}`, {
            statusCode: 400,
            code: "BAD_REQUEST",
        });
    }

    const crmOrdersService = new CrmOrdersService();

    // Customer name + salutation (same approach as `trySendOrderReceiptPdfEmail`)
    const user = await new CustomerProfileRepo().getFullCustomerProfile(order.customerProfileId);
    const customerName =
        [user.firstName, user.middleName, user.lastName].filter(Boolean).join(" ").trim() ||
        "CUSTOMER";
    const gender = String((user as unknown as { gender?: string | null }).gender ?? "")
        .trim()
        .toUpperCase();
    const salutation = gender === "FEMALE" ? "Ms." : gender === "MALE" ? "Mr." : "Mr. / Ms.";

    const metadata = (order as unknown as { metadata?: Record<string, unknown> | null }).metadata ?? null;
    const clientOrderSide =
        metadata && typeof metadata === "object"
            ? (metadata.clientOrderSide as "BUY" | "SELL" | undefined)
            : undefined;
    const side = clientOrderSide === "BUY" || clientOrderSide === "SELL" ? clientOrderSide : undefined;
    const transactionLabel = side === "SELL" ? "SELL" : "BUY";

    const bondDetailsAny = order.bondDetails as any;
    const pricing = bondDetailsAny?.pricing ?? {};
    const dealDateText = formatDealDateText(pricing.dealDate ?? order.createdAt);

    const securityName = String(order.bondName ?? "").trim() || "—";
    const subject = `Deal Sheet for ISIN ${order.isin} - Security Name ${securityName} - Deal Date ${dealDateText}`;

    const messageBody = `Dear ${salutation} ${customerName || "CUSTOMER"},

Thank you for investing with MeraDhan. We truly value your trust and remain committed to providing you with a seamless bond investment experience.

We are pleased to inform you that your deal has been successfully settled. The Clearing Corporation has initiated the release of securities to your Demat account for this ${transactionLabel} transaction. We kindly request you to review your Demat account and confirm receipt of the securities.

Please find the Deal Sheet enclosed for your records. Should you have any queries or notice any discrepancy, feel free to contact us at backoffice@meradhan.co.

We look forward to serving you again.

Warm regards,

MeraDhan Team`;

    // Settlement/interest info (same pattern as `trySendOrderReceiptPdfEmail`)
    const settleRow = await crmOrdersService.getRfqByOrderNumber(orderNumber);
    const settlementDateInput =
        typeof (settleRow as any)?.modSettleDate === "string" && String((settleRow as any).modSettleDate).trim() !== ""
            ? String((settleRow as any).modSettleDate).trim()
            : new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

    let accruedInterestDays =
        pricing?.noOfAccrualDays != null ? Number(pricing.noOfAccrualDays) : NaN;
    let settlementNumber: string | undefined;
    let lastInterestPaymentDate: string | undefined;
    let interestPaymentDates: string | undefined;

    try {
        const autofill = await crmOrdersService.autofillReceiptPdfOptions(orderNumber, {
            settlementDate: settlementDateInput,
        });
        // if (autofill?.accruedInterestDays != null) {
        //     const n = Number(autofill.accruedInterestDays);
        //     if (Number.isFinite(n)) accruedInterestDays = n;
        // }
        if (autofill?.settlementNumber) settlementNumber = autofill.settlementNumber;
        const setData = await getLastCouponDate(order.isin, new Date());
        if (setData) lastInterestPaymentDate = setData;
        if (autofill?.interestPaymentDates?.length) {
            interestPaymentDates = autofill.interestPaymentDates.join(", ");
        }
    } catch (autoErr) {
        logger.logError(`Deal sheet PDF autofill failed for ${orderNumber}`, autoErr);
    }

    const savedOptions = await crmOrdersService.getReceiptPdfOptions(orderNumber);
    const safeAccruedInterestDays = Number.isFinite(accruedInterestDays)
        ? accruedInterestDays
        : savedOptions?.accruedInterestDays != null && Number.isFinite(Number(savedOptions.accruedInterestDays))
            ? Number(savedOptions.accruedInterestDays)
            : 7;

    const recipientEmail =
        String(params.toEmail ?? "").trim() ||
        String(order.customerProfile?.emailAddress ?? "").trim() ||
        undefined;

    const result = await crmOrdersService.sendPdfEmailToClient(orderNumber, {
        pdfType: "deal",
        subject,
        messageBody,
        ...(recipientEmail ? { toEmail: recipientEmail } : {}),
        accruedInterestDays: safeAccruedInterestDays,
        settlementNumber: settlementNumber ?? savedOptions?.settlementNumber ?? undefined,
        settlementDateTime:
            savedOptions?.settlementDateTime ??
            (pricing?.settlementDate ? new Date(pricing.settlementDate).toISOString() : undefined),
        lastInterestPaymentDate:
            lastInterestPaymentDate ?? savedOptions?.lastInterestPaymentDate ?? undefined,
        interestPaymentDates: interestPaymentDates ?? savedOptions?.interestPaymentDates ?? undefined,
        nonAmortizedBond: savedOptions?.nonAmortizedBond ?? true,
        amortizedPrincipalPaymentDates: savedOptions?.amortizedPrincipalPaymentDates ?? undefined,
    });

    return { orderNumber, messageId: result.messageId };
}

